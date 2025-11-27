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

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../public/uploads/tracks');
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
    }
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
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB max file size
    }
});

/**
 * Get audio duration using ffprobe (if available) or estimate
 */
async function getAudioDuration(filePath) {
    try {
        // Try using ffprobe if available
        const { stdout } = await execAsync(
            `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`
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

        const { title, artist, genre, copyright } = req.body;

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

        // Create track metadata
        const track = {
            id: Date.now(),
            title: trackTitle,
            artist: trackArtist,
            genre: genre || 'Electronic',
            filename: req.file.filename,
            url: `/uploads/tracks/${req.file.filename}`,
            duration: duration,
            fileSize: req.file.size,
            uploadedAt: new Date().toISOString()
        };

        // Save track metadata to JSON file
        const metadataPath = path.join(__dirname, '../public/uploads/tracks-metadata.json');
        let tracks = [];
        
        if (fs.existsSync(metadataPath)) {
            const data = fs.readFileSync(metadataPath, 'utf8');
            tracks = JSON.parse(data);
        }
        
        tracks.push(track);
        fs.writeFileSync(metadataPath, JSON.stringify(tracks, null, 2));

        console.log(`✅ Track uploaded: ${track.title} by ${track.artist} (${duration}s)`);

        res.json({
            success: true,
            message: 'Track uploaded successfully',
            track: track
        });

    } catch (error) {
        console.error('Upload error:', error);
        
        // Clean up file if it was uploaded
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        
        res.status(500).json({
            error: error.message || 'Failed to upload track'
        });
    }
});

/**
 * GET /api/tracks/list
 * Get list of all uploaded tracks
 */
router.get('/list', (req, res) => {
    try {
        const metadataPath = path.join(__dirname, '../public/uploads/tracks-metadata.json');
        
        if (!fs.existsSync(metadataPath)) {
            return res.json({ tracks: [] });
        }
        
        const data = fs.readFileSync(metadataPath, 'utf8');
        const tracks = JSON.parse(data);
        
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
        let tracks = JSON.parse(data);
        
        const trackIndex = tracks.findIndex(t => t.id === trackId);
        
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
