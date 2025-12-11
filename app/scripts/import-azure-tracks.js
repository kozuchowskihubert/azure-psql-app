const { Pool } = require('pg');
const { BlobServiceClient } = require('@azure/storage-blob');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const pool = new Pool({
  host: 'localhost',
  user: 'haos',
  database: 'haos_dev',
  port: 5432
});

async function importTracks() {
  const connectionString = process.env.AZURE_BLOB_CONNECTION_STRING;
  const containerName = process.env.AZURE_BLOB_CONTAINER_NAME;
  
  if (!connectionString) {
    console.log('❌ Azure Blob connection string not found');
    return;
  }
  
  console.log('🔗 Connecting to Azure Blob Storage...');
  const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
  const containerClient = blobServiceClient.getContainerClient(containerName);
  
  console.log('📂 Listing blobs from container:', containerName);
  let count = 0;
  
  for await (const blob of containerClient.listBlobsFlat()) {
    // Extract title from filename
    const title = blob.name
      .replace(/^\d+-/, '') // Remove timestamp prefix
      .replace(/\.mp3$/, '') // Remove extension
      .replace(/_/g, ' ') // Replace underscores with spaces
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim();
    
    const azureUrl = `https://haosfmstorage.blob.core.windows.net/tracks/${blob.name}`;
    
    try {
      await pool.query(`
        INSERT INTO tracks (title, artist, file_path, file_size, azure_blob_url, storage_type)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT DO NOTHING
      `, [title, 'HAOS', blob.name, blob.properties.contentLength, azureUrl, 'azure_blob']);
      
      count++;
      console.log(`✓ Imported: ${title} (${(blob.properties.contentLength / 1024 / 1024).toFixed(2)} MB)`);
    } catch (err) {
      console.error(`✗ Error importing ${title}:`, err.message);
    }
  }
  
  console.log(`\n✅ Imported ${count} tracks from Azure Blob Storage`);
  
  // Show summary
  const result = await pool.query('SELECT COUNT(*) as total FROM tracks');
  console.log(`📊 Total tracks in database: ${result.rows[0].total}`);
  
  await pool.end();
}

importTracks().catch(err => {
  console.error('❌ Import failed:', err);
  process.exit(1);
});
