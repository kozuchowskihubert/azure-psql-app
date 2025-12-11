/**
 * Track Upload Routes
 *
 * Handles uploading user-owned tracks to HAOS.fm
 * Features:
 * - File upload with multer
 * - Audio file validation
 * - Track metadata storage
 * - Integration with playlist system
 */

const express = require('express');

const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const { exec } = require('child_process');

const execAsync = promisify(exec);
const blobStorage = require('../utils/blob-storage');

// Metadata blob name
const METADATA_BLOB_NAME = 'tracks-metadata.json';

/**
 * Get tracks metadata from blob storage
 */
async function getTracksMetadata() {
  try {
    if (!blobStorage.enabled) {
      // Fallback to local storage for development
      const localPath = path.join(__dirname, '../public/uploads/tracks-metadata.json');
      if (fs.existsSync(localPath)) {
        return JSON.parse(fs.readFileSync(localPath, 'utf8'));
      }
      return [];
    }

    // Download metadata from blob storage
    const metadata = await blobStorage.downloadFile(METADATA_BLOB_NAME);
    return metadata ? JSON.parse(metadata) : [];
  } catch (error) {
    console.warn('Could not load metadata:', error.message);
    return [];
  }
}

/**
 * Save tracks metadata to blob storage
 */
async function saveTrackMetadata(newTrack) {
  try {
    // Get existing tracks
    const tracks = await getTracksMetadata();
    
    // Add new track
    tracks.push(newTrack);
    
    if (!blobStorage.enabled) {
      // Fallback to local storage for development
      const localPath = path.join(__dirname, '../public/uploads/tracks-metadata.json');
      const dir = path.dirname(localPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(localPath, JSON.stringify(tracks, null, 2));
      return;
    }
    
    // Upload to blob storage
    await blobStorage.uploadJSON(METADATA_BLOB_NAME, tracks);
  } catch (error) {
    console.error('Failed to save metadata:', error);
    throw error;
  }
}

// Use /tmp for serverless environments (Vercel, AWS Lambda)
// Fall back to local directory for development
const uploadsDir = process.env.VERCEL 
  ? '/tmp/uploads' 
  : path.join(__dirname, '../public/uploads/tracks');

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Created uploads directory:', uploadsDir);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-originalname
    const timestamp = Date.now();
    const sanitized = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${timestamp}-${sanitized}`);
  },
});

// File filter - only accept audio files
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm'];
  const allowedExts = ['.mp3', '.wav', '.ogg', '.webm'];

  const ext = path.extname(file.originalname).toLowerCase();
  const mimeOk = allowedMimes.includes(file.mimetype);
  const extOk = allowedExts.includes(ext);

  if (mimeOk && extOk) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed: ${allowedExts.join(', ')}`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 300 * 1024 * 1024, // 300MB max file size (increased for large DJ sets)
  },
});

/**
 * Get audio duration using ffprobe (if available) or estimate
 */
async function getAudioDuration(filePath) {
  try {
    // Try using ffprobe if available
    const { stdout } = await execAsync(
      `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`,
    );
    const duration = parseFloat(stdout.trim());
    return Math.round(duration);
  } catch (error) {
    // Fallback: estimate based on file size (rough estimate for MP3)
    const stats = fs.statSync(filePath);
    const fileSizeMB = stats.size / (1024 * 1024);
    // Rough estimate: 1MB ≈ 60 seconds at 128kbps
    return Math.round(fileSizeMB * 60);
  }
}

/**
 * POST /api/tracks/upload
 * Upload a new track with metadata
 */
router.post('/upload', upload.single('audioFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file uploaded' });
    }

    const {
      title, artist, genre, copyright,
    } = req.body;

    // Validate copyright - accept any truthy value from checkbox
    if (!copyright) {
      // Delete uploaded file if validation fails
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'Copyright confirmation is required. You must confirm that you own the copyright to upload tracks.' });
    }

    // Use defaults if title/artist not provided (for bulk uploads)
    const trackTitle = title && title.trim()
      ? title.trim()
      : path.basename(req.file.originalname, path.extname(req.file.originalname));

    const trackArtist = artist && artist.trim()
      ? artist.trim()
      : 'Unknown Artist';

    // Get audio duration
    const duration = await getAudioDuration(req.file.path);

    // Upload to Azure Blob Storage (or keep local if not configured)
    const blobUrl = await blobStorage.uploadFile(req.file.path, req.file.filename);

    // Create track metadata
    const track = {
      id: Date.now(),
      title: trackTitle,
      artist: trackArtist,
      genre: genre || 'Electronic',
      filename: req.file.filename,
      url: blobUrl, // Use blob URL (absolute) or local path (relative)
      duration,
      fileSize: req.file.size,
      uploadedAt: new Date().toISOString(),
    };

    // Save track metadata to blob storage as JSON
    // This works in serverless environments unlike local filesystem
    await saveTrackMetadata(track);

    console.log(`✅ Track uploaded: ${track.title} by ${track.artist} (${duration}s)`);

    res.json({
      success: true,
      message: 'Track uploaded successfully',
      track,
    });
  } catch (error) {
    console.error('Upload error:', error);

    // Clean up file if it was uploaded
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      error: error.message || 'Failed to upload track',
    });
  }
});

/**
 * GET /api/tracks/list
 * Get list of all uploaded tracks from blob storage
 */
router.get('/list', async (req, res) => {
  try {
    const tracks = await getTracksMetadata();
    res.json({ tracks });
  } catch (error) {
    console.error('Error reading tracks:', error);
    res.status(500).json({ error: 'Failed to read tracks' });
  }
});

/**
 * DELETE /api/tracks/:id
 * Delete an uploaded track
 */
router.delete('/:id', (req, res) => {
  try {
    const trackId = parseInt(req.params.id);
    const metadataPath = path.join(__dirname, '../public/uploads/tracks-metadata.json');

    if (!fs.existsSync(metadataPath)) {
      return res.status(404).json({ error: 'No tracks found' });
    }

    const data = fs.readFileSync(metadataPath, 'utf8');
    const tracks = JSON.parse(data);

    const trackIndex = tracks.findIndex((t) => t.id === trackId);

    if (trackIndex === -1) {
      return res.status(404).json({ error: 'Track not found' });
    }

    const track = tracks[trackIndex];

    // Delete audio file
    const filePath = path.join(__dirname, '../public', track.url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Remove from metadata
    tracks.splice(trackIndex, 1);
    fs.writeFileSync(metadataPath, JSON.stringify(tracks, null, 2));

    console.log(`🗑️ Track deleted: ${track.title}`);

    res.json({ success: true, message: 'Track deleted' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete track' });
  }
});

module.exports = router;
