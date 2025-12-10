#!/usr/bin/env node

/**
 * Migration script to upload existing local tracks to Azure Blob Storage
 * and update tracks-metadata.json with blob URLs
 */

const fs = require('fs');
const path = require('path');
const { BlobServiceClient } = require('@azure/storage-blob');

// Configuration
const TRACKS_DIR = path.join(__dirname, 'public/uploads/tracks');
const METADATA_FILE = path.join(__dirname, 'public/uploads/tracks-metadata.json');
const CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const CONTAINER_NAME = process.env.AZURE_STORAGE_CONTAINER_NAME || 'tracks';

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function uploadFileToBlob(blobServiceClient, containerName, filePath, blobName) {
  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  log(`  Uploading ${blobName}...`, 'cyan');

  const uploadOptions = {
    blobHTTPHeaders: {
      blobContentType: 'audio/mpeg',
    },
  };

  await blockBlobClient.uploadFile(filePath, uploadOptions);

  return blockBlobClient.url;
}

async function migrateTracksToBlob() {
  log('\n🚀 Starting Track Migration to Azure Blob Storage\n', 'blue');

  // Validate environment
  if (!CONNECTION_STRING) {
    log('❌ Error: AZURE_STORAGE_CONNECTION_STRING not set', 'red');
    log('Please set it in your environment or .env file', 'yellow');
    process.exit(1);
  }

  // Check if metadata file exists
  if (!fs.existsSync(METADATA_FILE)) {
    log(`❌ Error: Metadata file not found at ${METADATA_FILE}`, 'red');
    process.exit(1);
  }

  // Read metadata
  log('📖 Reading tracks metadata...', 'cyan');
  const tracks = JSON.parse(fs.readFileSync(METADATA_FILE, 'utf8'));

  if (!tracks || tracks.length === 0) {
    log('⚠️  No tracks found in metadata', 'yellow');
    process.exit(0);
  }

  log(`Found ${tracks.length} tracks to migrate\n`, 'green');

  // Initialize blob service
  const blobServiceClient = BlobServiceClient.fromConnectionString(CONNECTION_STRING);
  const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);

  // Ensure container exists
  log('🔍 Checking blob container...', 'cyan');
  const containerExists = await containerClient.exists();
  if (!containerExists) {
    log(`❌ Error: Container '${CONTAINER_NAME}' does not exist`, 'red');
    process.exit(1);
  }
  log(`✅ Container '${CONTAINER_NAME}' found\n`, 'green');

  // Migrate each track
  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (let i = 0; i < tracks.length; i++) {
    const track = tracks[i];
    const trackNum = i + 1;

    log(`\n[${trackNum}/${tracks.length}] Processing: ${track.title} by ${track.artist}`, 'blue');

    // Check if already migrated (URL starts with http)
    if (track.url.startsWith('http')) {
      log('  ⏭️  Already migrated (URL is absolute)', 'yellow');
      skipCount++;
      continue;
    }

    // Build local file path
    const localFilePath = path.join(__dirname, 'public', track.url);

    if (!fs.existsSync(localFilePath)) {
      log(`  ❌ File not found: ${localFilePath}`, 'red');
      errorCount++;
      continue;
    }

    // Get file size for progress info
    const stats = fs.statSync(localFilePath);
    const fileSizeMB = (stats.size / 1024 / 1024).toFixed(2);
    log(`  📦 Size: ${fileSizeMB} MB`, 'cyan');

    try {
      // Upload to blob storage
      const blobUrl = await uploadFileToBlob(
        blobServiceClient,
        CONTAINER_NAME,
        localFilePath,
        track.filename,
      );

      // Update metadata with blob URL
      track.url = blobUrl;

      log('  ✅ Uploaded successfully', 'green');
      log(`  🔗 Blob URL: ${blobUrl}`, 'cyan');

      successCount++;
    } catch (error) {
      log(`  ❌ Upload failed: ${error.message}`, 'red');
      errorCount++;
    }
  }

  // Save updated metadata
  if (successCount > 0) {
    log('\n💾 Saving updated metadata...', 'cyan');
    fs.writeFileSync(
      METADATA_FILE,
      JSON.stringify(tracks, null, 2),
      'utf8',
    );
    log('✅ Metadata updated successfully\n', 'green');
  }

  // Summary
  log(`\n${'='.repeat(60)}`, 'blue');
  log('📊 Migration Summary', 'blue');
  log('='.repeat(60), 'blue');
  log(`✅ Successfully migrated: ${successCount}`, successCount > 0 ? 'green' : 'reset');
  log(`⏭️  Skipped (already migrated): ${skipCount}`, skipCount > 0 ? 'yellow' : 'reset');
  log(`❌ Failed: ${errorCount}`, errorCount > 0 ? 'red' : 'reset');
  log(`📁 Total tracks in metadata: ${tracks.length}`, 'cyan');
  log(`${'='.repeat(60)}\n`, 'blue');

  if (successCount > 0) {
    log('🎉 Migration completed! Next steps:', 'green');
    log('1. Commit the updated tracks-metadata.json:', 'cyan');
    log('   git add app/public/uploads/tracks-metadata.json', 'yellow');
    log('   git commit -m "Update track URLs to use blob storage"', 'yellow');
    log('   git push', 'yellow');
    log('\n2. Trigger deployment:', 'cyan');
    log('   gh workflow run deploy-music-app.yml --ref feat/tracks -f environment=dev\n', 'yellow');
  }

  if (errorCount > 0) {
    log('⚠️  Some tracks failed to migrate. Please check the errors above.', 'yellow');
    process.exit(1);
  }
}

// Run migration
migrateTracksToBlob().catch((error) => {
  log(`\n❌ Migration failed: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
