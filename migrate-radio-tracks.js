/**
 * Azure Radio Tracks Migration Script
 * Migrates audio tracks from 'tracks' container to 'radio' container
 * with proper genre folder structure
 */

const { BlobServiceClient } = require('@azure/storage-blob');

// Use environment variable for connection string
const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING || "YOUR_CONNECTION_STRING_HERE";

// Track categorization (manually categorized by genre)
const trackCategories = {
  techno: [
    { old: '1764267734237-HAOS_-_Rave_Rage.mp3', new: 'rave-rage.mp3' },
    { old: '1764269056158-Ratte-Remastered.mp3', new: 'ratte-remastered.mp3' },
    { old: '1764279580212-HAOS_-_Chromacid_Pulse___Original_Mix_.mp3', new: 'chromacid-pulse.mp3' },
    { old: '1764279580588-HAOS_-_Damage__Original_Mix_.mp3', new: 'damage.mp3' },
    { old: '1764279580690-HAOS_-_Dark_Volcano__Official_Music_Video_.mp3', new: 'dark-volcano.mp3' },
    { old: '1764279580741-HAOS_-_Ratte__Original_Mix_.mp3', new: 'ratte.mp3' },
    { old: '1764279580800-Reckless.mp3', new: 'reckless.mp3' },
    { old: '1764279580854-You_Are_Not_Prepared_1.mp3', new: 'you-are-not-prepared.mp3' },
    { old: '1766090777302-Classic_Rave.mp3', new: 'classic-rave.mp3' },
    { old: '1766090756049-The_Run.mp3', new: 'the-run.mp3' },
    // Skip duplicate 1764268074133-HAOS_-_Rave_Rage.mp3
    // Skip duplicate 1764279718101-HAOS_-_Dark_Volcano__Official_Music_Video_.mp3
    // Skip large file 1764279931843-HAOS_-_Affliction.mp3 (265 MB - too large)
  ],
  house: [
    { old: '1766090701234-Holy_Gucci__Clair_Remix_.mp3', new: 'holy-gucci-clair-remix.mp3' },
  ],
  dnb: [
    { old: '1764279580741-HAOS_20-_20Liquid_20_28Original_20Mix_29_20_ZBfkS_tf7oc_.mp3', new: 'liquid.mp3' },
  ],
};

async function migrateRadioTracks() {
  try {
    console.log('🎵 Azure Radio Tracks Migration');
    console.log('=' .repeat(60));
    
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const sourceContainer = blobServiceClient.getContainerClient('tracks');
    const destContainer = blobServiceClient.getContainerClient('radio');
    
    // Ensure destination container exists
    await destContainer.createIfNotExists({ access: 'blob' });
    console.log('✅ Radio container ready\n');
    
    let totalCopied = 0;
    let totalSkipped = 0;
    let totalErrors = 0;
    
    for (const [genre, tracks] of Object.entries(trackCategories)) {
      console.log(`\n📁 Processing ${genre.toUpperCase()} channel...`);
      console.log('-'.repeat(60));
      
      for (const track of tracks) {
        try {
          // Check if source exists
          const sourceBlob = sourceContainer.getBlobClient(track.old);
          const sourceExists = await sourceBlob.exists();
          
          if (!sourceExists) {
            console.log(`   ⚠️  Source not found: ${track.old}`);
            totalSkipped++;
            continue;
          }
          
          // Create destination path
          const destName = `${genre}/${track.new}`;
          const destBlob = destContainer.getBlobClient(destName);
          
          // Check if already exists
          const destExists = await destBlob.exists();
          if (destExists) {
            console.log(`   ⏭️  Already exists: ${destName}`);
            totalSkipped++;
            continue;
          }
          
          // Copy blob (async operation)
          const copyPoller = await destBlob.beginCopyFromURL(sourceBlob.url);
          await copyPoller.pollUntilDone();
          
          console.log(`   ✅ Copied: ${destName}`);
          totalCopied++;
          
        } catch (error) {
          console.error(`   ❌ Failed: ${track.old} - ${error.message}`);
          totalErrors++;
        }
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 Migration Summary:');
    console.log(`   ✅ Copied: ${totalCopied} tracks`);
    console.log(`   ⏭️  Skipped: ${totalSkipped} tracks`);
    console.log(`   ❌ Errors: ${totalErrors} tracks`);
    console.log('='.repeat(60));
    
    if (totalCopied > 0) {
      console.log('\n🎉 Migration complete! Test with:');
      console.log('   curl http://localhost:3000/api/radio/channels | jq');
    }
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Run migration
migrateRadioTracks();
