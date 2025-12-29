/**
 * Radio API Routes - Azure Blob Storage Integration
 * Express routes for radio channel management
 */

const express = require('express');
const router = express.Router();
const radioChannelsService = require('../utils/radio-channels');
const multer = require('multer');

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Accept audio files only
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'), false);
    }
  },
});

/**
 * GET /api/radio/channels
 * Get all available radio channels with track lists
 */
router.get('/channels', async (req, res) => {
  try {
    const channels = await radioChannelsService.getChannels();
    res.json({
      success: true,
      channels,
      totalChannels: channels.length,
      totalTracks: channels.reduce((sum, ch) => sum + ch.trackCount, 0),
    });
  } catch (error) {
    console.error('Error fetching channels:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch radio channels',
      message: error.message,
    });
  }
});

/**
 * GET /api/radio/channels/:channelId
 * Get tracks for a specific channel
 */
router.get('/channels/:channelId', async (req, res) => {
  try {
    const { channelId } = req.params;
    const tracks = await radioChannelsService.getChannelTracks(channelId);
    
    res.json({
      success: true,
      channelId,
      tracks,
      trackCount: tracks.length,
    });
  } catch (error) {
    console.error('Error fetching channel tracks:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch channel tracks',
      message: error.message,
    });
  }
});

/**
 * POST /api/radio/channels/:channelId/upload
 * Upload a track to a channel (admin only)
 */
router.post('/channels/:channelId/upload', upload.single('audio'), async (req, res) => {
  try {
    const { channelId } = req.params;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No audio file provided',
      });
    }

    // TODO: Add authentication/authorization check here
    // Only admins should be able to upload tracks

    const url = await radioChannelsService.uploadTrack(
      channelId,
      req.file.buffer,
      req.file.originalname
    );

    res.json({
      success: true,
      message: 'Track uploaded successfully',
      url,
      channelId,
      fileName: req.file.originalname,
    });
  } catch (error) {
    console.error('Error uploading track:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload track',
      message: error.message,
    });
  }
});

/**
 * DELETE /api/radio/channels/:channelId/tracks/:trackName
 * Delete a track from a channel (admin only)
 */
router.delete('/channels/:channelId/tracks/:trackName', async (req, res) => {
  try {
    const { channelId, trackName } = req.params;

    // TODO: Add authentication/authorization check here
    // Only admins should be able to delete tracks

    await radioChannelsService.deleteTrack(channelId, trackName);

    res.json({
      success: true,
      message: 'Track deleted successfully',
      channelId,
      trackName,
    });
  } catch (error) {
    console.error('Error deleting track:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete track',
      message: error.message,
    });
  }
});

/**
 * GET /api/radio/stats
 * Get radio system statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const channels = await radioChannelsService.getChannels();
    
    const stats = {
      totalChannels: channels.length,
      totalTracks: channels.reduce((sum, ch) => sum + ch.trackCount, 0),
      channels: channels.map(ch => ({
        id: ch.id,
        name: ch.name,
        trackCount: ch.trackCount,
      })),
    };

    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch radio stats',
      message: error.message,
    });
  }
});

module.exports = router;
