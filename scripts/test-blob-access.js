#!/usr/bin/env node
/**
 * Test Azure Blob Track Accessibility
 * Checks if blob tracks are publicly accessible without credentials
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const METADATA_FILE = path.join(__dirname, '..', 'app', 'public', 'uploads', 'tracks-metadata.json');

function testBlobUrl(url) {
  return new Promise((resolve) => {
    https.get(url, { timeout: 5000 }, (res) => {
      resolve({
        url,
        accessible: res.statusCode === 200,
        status: res.statusCode,
        contentType: res.headers['content-type'],
        size: res.headers['content-length']
      });
    }).on('error', (err) => {
      resolve({
        url,
        accessible: false,
        error: err.message
      });
    }).on('timeout', () => {
      resolve({
        url,
        accessible: false,
        error: 'Timeout'
      });
    });
  });
}

async function main() {
  console.log('🔍 Testing Azure Blob Track Accessibility\n');
  console.log('═'.repeat(70));
  
  // Load metadata
  if (!fs.existsSync(METADATA_FILE)) {
    console.error('❌ Metadata file not found');
    process.exit(1);
  }
  
  const tracks = JSON.parse(fs.readFileSync(METADATA_FILE, 'utf8'));
  
  // Find blob tracks
  const blobTracks = tracks.filter(t => t.url && t.url.includes('blob.core.windows.net'));
  const localTracks = tracks.filter(t => t.url && t.url.startsWith('/uploads'));
  
  console.log(`📊 Track Summary:`);
  console.log(`   Total tracks: ${tracks.length}`);
  console.log(`   Blob tracks: ${blobTracks.length}`);
  console.log(`   Local tracks: ${localTracks.length}\n`);
  
  if (blobTracks.length === 0) {
    console.log('✅ No blob tracks found - all tracks are local');
    return;
  }
  
  console.log('Testing blob track accessibility...\n');
  console.log('─'.repeat(70));
  
  let accessibleCount = 0;
  let blockedCount = 0;
  
  for (let i = 0; i < blobTracks.length; i++) {
    const track = blobTracks[i];
    console.log(`${i + 1}. ${track.title || track.filename}`);
    console.log(`   URL: ${track.url}`);
    
    const result = await testBlobUrl(track.url);
    
    if (result.accessible) {
      console.log(`   ✅ Accessible (${result.status}) - ${result.contentType}`);
      if (result.size) {
        const sizeMB = (parseInt(result.size) / 1024 / 1024).toFixed(2);
        console.log(`   📦 Size: ${sizeMB} MB`);
      }
      accessibleCount++;
    } else {
      console.log(`   ❌ Not accessible (${result.status || 'Error'})`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
      blockedCount++;
    }
    console.log('─'.repeat(70));
  }
  
  console.log(`\n📊 Accessibility Report:`);
  console.log(`   ✅ Accessible: ${accessibleCount} tracks`);
  console.log(`   ❌ Blocked: ${blockedCount} tracks`);
  console.log(`   Total tested: ${blobTracks.length}\n`);
  
  if (accessibleCount > 0) {
    console.log('💡 Good news! Your blob tracks are publicly accessible.');
    console.log('   You can migrate them to local storage without Azure credentials.');
    console.log('   Run: node scripts/download-blob-tracks.js\n');
  } else if (blockedCount > 0) {
    console.log('⚠️  Your blob tracks require authentication.');
    console.log('   You need to add AZURE_STORAGE_CONNECTION_STRING to .env');
    console.log('   See: AZURE_BLOB_SETUP.md for instructions\n');
  }
}

main().catch(console.error);
