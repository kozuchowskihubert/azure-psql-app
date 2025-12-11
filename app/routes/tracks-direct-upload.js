/**
 * Azure Blob Storage Direct Upload Routes
 * 
 * Provides SAS tokens for direct client-side uploads to Azure Blob Storage
 * This bypasses Vercel's 4.5MB body size limit
 */

const express = require('express');
const router = express.Router();
const { BlobServiceClient, generateBlobSASQueryParameters, BlobSASPermissions, StorageSharedKeyCredential } = require('@azure/storage-blob');
const crypto = require('crypto');

// Get Azure credentials from environment
const connectionString = process.env.AZURE_BLOB_CONNECTION_STRING;
const containerName = process.env.AZURE_BLOB_CONTAINER_NAME || 'tracks';

/**
 * POST /api/tracks/upload-url
 * Generate a SAS token for direct upload to Azure Blob Storage
 */
router.post('/upload-url', async (req, res) => {
  try {
    if (!connectionString) {
      return res.status(503).json({ 
        error: 'Azure Blob Storage not configured',
        hint: 'Please configure AZURE_BLOB_CONNECTION_STRING'
      });
    }

    const { filename, contentType } = req.body;

    if (!filename) {
      return res.status(400).json({ error: 'Filename is required' });
    }

    // Generate unique blob name with timestamp
    const timestamp = Date.now();
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const blobName = `${timestamp}-${sanitizedFilename}`;

    // Parse connection string to get account name and key
    const accountNameMatch = connectionString.match(/AccountName=([^;]+)/);
    const accountKeyMatch = connectionString.match(/AccountKey=([^;]+)/);
    
    if (!accountNameMatch || !accountKeyMatch) {
      return res.status(500).json({ error: 'Invalid Azure connection string' });
    }

    const accountName = accountNameMatch[1];
    const accountKey = accountKeyMatch[1];

    // Create credentials
    const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);
    const blobServiceClient = new BlobServiceClient(
      `https://${accountName}.blob.core.windows.net`,
      sharedKeyCredential
    );

    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobClient = containerClient.getBlobClient(blobName);

    // Generate SAS token valid for 1 hour
    const startsOn = new Date();
    const expiresOn = new Date(startsOn.valueOf() + 3600 * 1000); // 1 hour

    const sasToken = generateBlobSASQueryParameters(
      {
        containerName,
        blobName,
        permissions: BlobSASPermissions.parse('cw'), // create, write
        startsOn,
        expiresOn,
      },
      sharedKeyCredential
    ).toString();

    const uploadUrl = `${blobClient.url}?${sasToken}`;
    const publicUrl = blobClient.url;

    res.json({
      uploadUrl,
      publicUrl,
      blobName,
      expiresAt: expiresOn.toISOString(),
      instructions: {
        method: 'PUT',
        headers: {
          'x-ms-blob-type': 'BlockBlob',
          'Content-Type': contentType || 'audio/mpeg'
        }
      }
    });

  } catch (error) {
    console.error('❌ Failed to generate upload URL:', error);
    res.status(500).json({ 
      error: 'Failed to generate upload URL',
      details: error.message 
    });
  }
});

/**
 * POST /api/tracks/metadata
 * Save track metadata after successful upload to Azure Blob
 */
router.post('/metadata', async (req, res) => {
  try {
    const pool = require('../config/database');
    
    const {
      title,
      artist,
      filename,
      blobName,
      publicUrl,
      fileSize,
      duration,
      genre,
      copyright
    } = req.body;

    // Validate required fields
    if (!title || !blobName || !publicUrl) {
      return res.status(400).json({ 
        error: 'Missing required fields: title, blobName, publicUrl' 
      });
    }

    // Validate copyright
    if (!copyright) {
      return res.status(400).json({ 
        error: 'Copyright confirmation is required' 
      });
    }

    // Insert track metadata into database
    const result = await pool.query(`
      INSERT INTO tracks (
        title, artist, file_path, file_size, azure_blob_url, 
        storage_type, duration, genre, is_public
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [
      title,
      artist || 'HAOS',
      blobName,
      fileSize || null,
      publicUrl,
      'azure_blob',
      duration || null,
      genre || 'Electronic',
      true
    ]);

    const track = result.rows[0];

    console.log(`✅ Track metadata saved: ${title} (ID: ${track.id})`);

    res.json({
      success: true,
      track: {
        id: track.id,
        title: track.title,
        artist: track.artist,
        url: track.azure_blob_url,
        duration: track.duration
      }
    });

  } catch (error) {
    console.error('❌ Failed to save track metadata:', error);
    res.status(500).json({ 
      error: 'Failed to save track metadata',
      details: error.message 
    });
  }
});

module.exports = router;
