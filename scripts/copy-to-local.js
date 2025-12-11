#!/usr/bin/env node
/**
 * Copy local music files to HAOS uploads directory
 * Makes tracks available immediately without Azure Blob Storage
 * 
 * Usage:
 *   node scripts/copy-to-local.js <source-directory>
 *   node scripts/copy-to-local.js ~/Music/Techno
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Configuration
const UPLOADS_DIR = path.join(__dirname, '..', 'app', 'public', 'uploads', 'tracks');
const METADATA_FILE = path.join(__dirname, '..', 'app', 'public', 'uploads', 'tracks-metadata.json');
const AUDIO_EXTENSIONS = ['.mp3', '.wav', '.ogg', '.flac', '.m4a', '.aac'];

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

function loadMetadata() {
  if (fs.existsSync(METADATA_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(METADATA_FILE, 'utf8'));
    } catch (e) {
      console.warn('⚠️  Could not read metadata, starting fresh');
      return [];
    }
  }
  return [];
}

function saveMetadata(tracks) {
  fs.writeFileSync(METADATA_FILE, JSON.stringify(tracks, null, 2));
  console.log(`✅ Updated metadata with ${tracks.length} tracks`);
}

function copyMusicFiles(sourceDir) {
  const resolvedDir = path.resolve(sourceDir);
  
  console.log('🎵 HAOS Music Copy to Local Storage');
  console.log('═'.repeat(60));
  console.log(`📁 Source: ${resolvedDir}`);
  console.log(`📂 Target: ${UPLOADS_DIR}\n`);
  
  // Check source directory
  if (!fs.existsSync(resolvedDir)) {
    console.error(`❌ Source directory not found: ${resolvedDir}`);
    process.exit(1);
  }
  
  // Ensure uploads directory exists
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    console.log(`📁 Created uploads directory: ${UPLOADS_DIR}\n`);
  }
  
  // Load existing metadata
  const tracks = loadMetadata();
  console.log(`📋 Loaded ${tracks.length} existing tracks from metadata\n`);
  
  // Find audio files
  const files = fs.readdirSync(resolvedDir);
  const audioFiles = files.filter(file => {
    const ext = path.extname(file).toLowerCase();
    return AUDIO_EXTENSIONS.includes(ext);
  });
  
  if (audioFiles.length === 0) {
    console.log('❌ No audio files found in directory');
    console.log(`   Supported formats: ${AUDIO_EXTENSIONS.join(', ')}`);
    process.exit(1);
  }
  
  console.log(`✅ Found ${audioFiles.length} audio file(s) to copy\n`);
  console.log('─'.repeat(60));
  
  let copiedCount = 0;
  
  audioFiles.forEach((file, index) => {
    const sourcePath = path.join(resolvedDir, file);
    const stats = fs.statSync(sourcePath);
    const ext = path.extname(file);
    
    // Generate unique filename
    const timestamp = Date.now() + index;
    const hash = crypto.createHash('md5').update(file).digest('hex').substring(0, 8);
    const newFilename = `${timestamp}-${hash}${ext}`;
    const targetPath = path.join(UPLOADS_DIR, newFilename);
    
    console.log(`${index + 1}. ${file}`);
    console.log(`   Size: ${formatBytes(stats.size)}`);
    console.log(`   Copying to: ${newFilename}`);
    
    try {
      // Copy file
      fs.copyFileSync(sourcePath, targetPath);
      console.log(`   ✅ Copied successfully`);
      
      // Add to metadata
      const trackTitle = path.parse(file).name
        .replace(/^\d+-/, '') // Remove leading numbers like "01-"
        .replace(/-/g, ' ')   // Replace hyphens with spaces
        .trim();
      
      const track = {
        id: `${timestamp}-${hash}`,
        filename: newFilename,
        original_name: file,
        title: trackTitle,
        artist: trackTitle.includes('HAOS') ? 'HAOS' : 'Unknown Artist',
        url: `/uploads/tracks/${newFilename}`,
        size: stats.size,
        uploadedAt: new Date().toISOString(),
        userId: 'local-copy',
        plays: 0
      };
      
      tracks.push(track);
      copiedCount++;
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    
    console.log('─'.repeat(60));
  });
  
  console.log(`\n📊 Copy Summary:`);
  console.log(`   Total files: ${audioFiles.length}`);
  console.log(`   Copied: ${copiedCount}`);
  console.log(`   Failed: ${audioFiles.length - copiedCount}\n`);
  
  if (copiedCount > 0) {
    saveMetadata(tracks);
    console.log('\n✨ Done! Your tracks are now available in HAOS');
    console.log('🎧 Start the server and visit: http://localhost:3000');
    console.log('📻 Tracks will appear in the radio player (bottom right)');
  }
}

// Main
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('Usage: node scripts/copy-to-local.js <source-directory>');
  console.log('');
  console.log('Example:');
  console.log('  node scripts/copy-to-local.js ~/Music/Techno');
  console.log('  node scripts/copy-to-local.js ./local-tracks');
  console.log('');
  console.log('Supported formats: mp3, wav, ogg, flac, m4a, aac');
  process.exit(1);
}

copyMusicFiles(args[0]);
