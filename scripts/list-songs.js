#!/usr/bin/env node
/**
 * List Songs Ready for Upload
 * 
 * Shows what audio files would be uploaded from a directory
 * Use this to verify before actually uploading to Azure
 */

const fs = require('fs');
const path = require('path');

// Supported audio formats
const AUDIO_EXTENSIONS = ['.mp3', '.wav', '.ogg', '.flac', '.m4a', '.aac'];

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

function listAudioFiles(dir) {
  const resolvedDir = path.resolve(dir);
  
  console.log('🎵 HAOS Music Scanner');
  console.log('═'.repeat(60));
  console.log(`📁 Directory: ${resolvedDir}\n`);
  
  if (!fs.existsSync(resolvedDir)) {
    console.error(`❌ Directory not found: ${resolvedDir}`);
    process.exit(1);
  }
  
  const files = fs.readdirSync(resolvedDir);
  const audioFiles = [];
  let totalSize = 0;
  
  files.forEach(file => {
    const ext = path.extname(file).toLowerCase();
    if (AUDIO_EXTENSIONS.includes(ext)) {
      const filePath = path.join(resolvedDir, file);
      const stats = fs.statSync(filePath);
      audioFiles.push({
        name: file,
        size: stats.size,
        ext: ext
      });
      totalSize += stats.size;
    }
  });
  
  if (audioFiles.length === 0) {
    console.log('❌ No audio files found');
    console.log(`   Supported formats: ${AUDIO_EXTENSIONS.join(', ')}`);
    process.exit(0);
  }
  
  console.log(`✅ Found ${audioFiles.length} audio file(s):\n`);
  console.log('─'.repeat(60));
  
  audioFiles.forEach((file, index) => {
    console.log(`${index + 1}. ${file.name}`);
    console.log(`   Size: ${formatBytes(file.size)}`);
    console.log(`   Format: ${file.ext.toUpperCase()}`);
    console.log('─'.repeat(60));
  });
  
  console.log(`\n📊 Summary:`);
  console.log(`   Total files: ${audioFiles.length}`);
  console.log(`   Total size: ${formatBytes(totalSize)}`);
  console.log(`   Directory: ${resolvedDir}\n`);
  
  console.log('💡 To upload these files to Azure Blob Storage:');
  console.log('   1. Set AZURE_STORAGE_CONNECTION_STRING in .env file');
  console.log(`   2. Run: node scripts/upload-songs-to-blob.js "${dir}"`);
  console.log('');
}

// Main
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('Usage: node scripts/list-songs.js <directory>');
  console.log('Example: node scripts/list-songs.js ~/Music/Techno');
  process.exit(1);
}

listAudioFiles(args[0]);
