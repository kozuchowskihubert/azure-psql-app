#!/usr/bin/env node
/**
 * Upload Songs to Azure Blob Storage
 * 
 * This script uploads audio files from a local directory to Azure Blob Storage
 * and updates the tracks metadata JSON file.
 * 
 * Usage:
 *   node scripts/upload-songs-to-blob.js <songs-directory>
 *   node scripts/upload-songs-to-blob.js ./music
 * 
 * Environment variables required:
 *   AZURE_STORAGE_CONNECTION_STRING - Azure Storage connection string
 *   AZURE_STORAGE_CONTAINER_NAME - Container name (default: 'tracks')
 */

// Try to load .env file if dotenv is available
try {
  require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
} catch (e) {
  // dotenv not installed, will use environment variables directly
  console.log('ℹ️  Using environment variables (dotenv not available)');
}

const { BlobServiceClient } = require('@azure/storage-blob');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Configuration
const CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const CONTAINER_NAME = process.env.AZURE_STORAGE_CONTAINER_NAME || 'tracks';
const METADATA_BLOB_NAME = 'tracks-metadata.json';

// Supported audio formats
const AUDIO_EXTENSIONS = ['.mp3', '.wav', '.ogg', '.flac', '.m4a', '.aac'];

class SongUploader {
  constructor() {
    if (!CONNECTION_STRING) {
      console.error('❌ AZURE_STORAGE_CONNECTION_STRING not set in environment');
      console.error('Please add it to your .env file or export it:');
      console.error('export AZURE_STORAGE_CONNECTION_STRING="your-connection-string"');
      process.exit(1);
    }

    this.blobServiceClient = BlobServiceClient.fromConnectionString(CONNECTION_STRING);
    this.containerClient = this.blobServiceClient.getContainerClient(CONTAINER_NAME);
    this.tracks = [];
  }

  async initialize() {
    try {
      // Create container if it doesn't exist
      await this.containerClient.createIfNotExists({
        access: 'blob', // Public read access for audio files
      });
      console.log(`✅ Container '${CONTAINER_NAME}' ready\n`);

      // Load existing tracks metadata
      await this.loadMetadata();
    } catch (error) {
      console.error('❌ Failed to initialize:', error.message);
      process.exit(1);
    }
  }

  async loadMetadata() {
    try {
      const blobClient = this.containerClient.getBlockBlobClient(METADATA_BLOB_NAME);
      const exists = await blobClient.exists();
      
      if (exists) {
        const downloadResponse = await blobClient.download(0);
        const data = await this.streamToString(downloadResponse.readableStreamBody);
        this.tracks = JSON.parse(data);
        console.log(`📋 Loaded ${this.tracks.length} existing tracks from metadata\n`);
      } else {
        console.log('📋 No existing metadata found, starting fresh\n');
        this.tracks = [];
      }
    } catch (error) {
      console.warn('⚠️  Could not load metadata:', error.message);
      this.tracks = [];
    }
  }

  async saveMetadata() {
    try {
      const blobClient = this.containerClient.getBlockBlobClient(METADATA_BLOB_NAME);
      const content = JSON.stringify(this.tracks, null, 2);
      
      await blobClient.upload(content, content.length, {
        blobHTTPHeaders: { blobContentType: 'application/json' },
      });
      
      console.log(`\n✅ Updated metadata with ${this.tracks.length} tracks`);
    } catch (error) {
      console.error('❌ Failed to save metadata:', error.message);
    }
  }

  async uploadFile(filePath) {
    const fileName = path.basename(filePath);
    const ext = path.extname(fileName).toLowerCase();
    
    // Generate unique blob name
    const timestamp = Date.now();
    const hash = crypto.createHash('md5').update(fileName).digest('hex').substring(0, 8);
    const blobName = `${timestamp}-${hash}${ext}`;
    
    try {
      const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
      
      // Read file
      const fileStream = fs.createReadStream(filePath);
      const fileSize = fs.statSync(filePath).size;
      
      // Upload with progress
      console.log(`⬆️  Uploading: ${fileName}`);
      console.log(`   Size: ${(fileSize / (1024 * 1024)).toFixed(2)} MB`);
      
      await blockBlobClient.uploadStream(fileStream, fileSize, 5, {
        blobHTTPHeaders: {
          blobContentType: this.getContentType(ext),
        },
      });
      
      const url = blockBlobClient.url;
      console.log(`✅ Uploaded: ${blobName}`);
      console.log(`   URL: ${url}\n`);
      
      return {
        blobName,
        url,
        originalName: fileName,
        size: fileSize,
      };
    } catch (error) {
      console.error(`❌ Failed to upload ${fileName}:`, error.message);
      return null;
    }
  }

  async uploadDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) {
      console.error(`❌ Directory not found: ${dirPath}`);
      process.exit(1);
    }

    const files = fs.readdirSync(dirPath);
    const audioFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return AUDIO_EXTENSIONS.includes(ext);
    });

    if (audioFiles.length === 0) {
      console.log('❌ No audio files found in directory');
      console.log(`   Supported formats: ${AUDIO_EXTENSIONS.join(', ')}`);
      process.exit(1);
    }

    console.log(`📁 Found ${audioFiles.length} audio file(s) to upload\n`);
    console.log('─'.repeat(60));

    let uploadedCount = 0;
    
    for (const file of audioFiles) {
      const filePath = path.join(dirPath, file);
      const result = await this.uploadFile(filePath);
      
      if (result) {
        // Add to tracks metadata
        const track = {
          id: result.blobName.split('.')[0],
          filename: result.blobName,
          original_name: result.originalName,
          title: path.parse(result.originalName).name,
          url: result.url,
          size: result.size,
          uploadedAt: new Date().toISOString(),
          userId: 'script-upload',
          plays: 0,
        };
        
        this.tracks.push(track);
        uploadedCount++;
      }
      
      console.log('─'.repeat(60));
    }

    console.log(`\n📊 Upload Summary:`);
    console.log(`   Total files: ${audioFiles.length}`);
    console.log(`   Uploaded: ${uploadedCount}`);
    console.log(`   Failed: ${audioFiles.length - uploadedCount}`);

    if (uploadedCount > 0) {
      await this.saveMetadata();
    }
  }

  getContentType(ext) {
    const types = {
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav',
      '.ogg': 'audio/ogg',
      '.flac': 'audio/flac',
      '.m4a': 'audio/mp4',
      '.aac': 'audio/aac',
    };
    return types[ext] || 'application/octet-stream';
  }

  async streamToString(readableStream) {
    return new Promise((resolve, reject) => {
      const chunks = [];
      readableStream.on('data', (data) => {
        chunks.push(data.toString());
      });
      readableStream.on('end', () => {
        resolve(chunks.join(''));
      });
      readableStream.on('error', reject);
    });
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node scripts/upload-songs-to-blob.js <songs-directory>');
    console.log('');
    console.log('Example:');
    console.log('  node scripts/upload-songs-to-blob.js ./music');
    console.log('  node scripts/upload-songs-to-blob.js ~/Downloads/songs');
    console.log('');
    console.log('Supported formats: mp3, wav, ogg, flac, m4a, aac');
    process.exit(1);
  }

  const songsDir = path.resolve(args[0]);
  
  console.log('🎵 HAOS Music Upload to Azure Blob Storage');
  console.log('═'.repeat(60));
  console.log(`📁 Source: ${songsDir}`);
  console.log(`☁️  Container: ${CONTAINER_NAME}`);
  console.log('═'.repeat(60));
  console.log('');

  const uploader = new SongUploader();
  await uploader.initialize();
  await uploader.uploadDirectory(songsDir);
  
  console.log('\n✨ Done!\n');
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
