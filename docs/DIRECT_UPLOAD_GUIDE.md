# Direct Upload to Azure Blob Storage

## Problem
Vercel Serverless Functions mają limit **4.5MB** dla request body na planie Hobby. Audio pliki MP3 są zazwyczaj większe (5-200MB+), co powoduje błąd:
```
❌ Upload failed: The string did not match the expected pattern.
```

## Rozwiązanie
Upload bezpośrednio z przeglądarki do Azure Blob Storage z użyciem **SAS tokens**.

## Flow

```
┌─────────┐    1. Request SAS    ┌──────────┐
│ Browser │ ───────────────────> │  Backend │
└─────────┘                       └──────────┘
                                        │
                                        │ 2. Generate SAS token
                                        ▼
                                  ┌──────────────┐
                                  │ Azure Blob   │
                                  │ Storage      │
                                  └──────────────┘
                                        ▲
     ┌─────────┐    3. PUT file        │
     │ Browser │ ──────────────────────┘
     └─────────┘
          │
          │ 4. Save metadata
          ▼
     ┌──────────┐
     │  Backend │
     └──────────┘
```

## API Endpoints

### 1. Get Upload URL
**POST** `/api/tracks/upload-url`

Request:
```json
{
  "filename": "my-track.mp3",
  "contentType": "audio/mpeg"
}
```

Response:
```json
{
  "uploadUrl": "https://storage.blob.core.windows.net/tracks/1234-my-track.mp3?sp=cw&...",
  "publicUrl": "https://storage.blob.core.windows.net/tracks/1234-my-track.mp3",
  "blobName": "1234-my-track.mp3",
  "expiresAt": "2025-12-11T23:00:00.000Z",
  "instructions": {
    "method": "PUT",
    "headers": {
      "x-ms-blob-type": "BlockBlob",
      "Content-Type": "audio/mpeg"
    }
  }
}
```

### 2. Save Track Metadata
**POST** `/api/tracks/metadata`

Request:
```json
{
  "title": "My Track",
  "artist": "Artist Name",
  "filename": "my-track.mp3",
  "blobName": "1234-my-track.mp3",
  "publicUrl": "https://storage.blob.core.windows.net/tracks/1234-my-track.mp3",
  "fileSize": 5242880,
  "duration": 180,
  "genre": "Electronic",
  "copyright": "on"
}
```

Response:
```json
{
  "success": true,
  "track": {
    "id": 42,
    "title": "My Track",
    "artist": "Artist Name",
    "url": "https://storage.blob.core.windows.net/tracks/1234-my-track.mp3",
    "duration": 180
  }
}
```

## Frontend Implementation

```javascript
async function uploadTrackDirect(file, metadata) {
  try {
    // Step 1: Get upload URL from backend
    const urlResponse = await fetch('/api/tracks/upload-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type || 'audio/mpeg'
      })
    });
    
    const { uploadUrl, publicUrl, blobName, instructions } = await urlResponse.json();
    
    // Step 2: Upload directly to Azure Blob Storage
    const uploadResponse = await fetch(uploadUrl, {
      method: instructions.method,
      headers: instructions.headers,
      body: file
    });
    
    if (!uploadResponse.ok) {
      throw new Error('Failed to upload to Azure');
    }
    
    // Step 3: Save metadata to database
    const metadataResponse = await fetch('/api/tracks/metadata', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: metadata.title || file.name.replace(/\.[^/.]+$/, ''),
        artist: metadata.artist || 'Unknown Artist',
        filename: file.name,
        blobName,
        publicUrl,
        fileSize: file.size,
        duration: metadata.duration,
        genre: metadata.genre || 'Electronic',
        copyright: 'on'
      })
    });
    
    return await metadataResponse.json();
    
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
}
```

## Benefits

✅ **No file size limits** - Upload files of any size
✅ **Faster uploads** - Direct to Azure CDN, no proxy through Vercel
✅ **Works on Vercel Hobby** - Bypasses 4.5MB request body limit
✅ **Scalable** - Azure Blob handles the load, not your serverless functions
✅ **Secure** - SAS tokens expire after 1 hour

## Environment Variables Required

```env
AZURE_BLOB_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=...
AZURE_BLOB_CONTAINER_NAME=tracks
```

## Testing

```bash
# Local
curl -X POST http://localhost:3000/api/tracks/upload-url \
  -H "Content-Type: application/json" \
  -d '{"filename":"test.mp3","contentType":"audio/mpeg"}'

# Production
curl -X POST https://haos.fm/api/tracks/upload-url \
  -H "Content-Type: application/json" \
  -d '{"filename":"test.mp3","contentType":"audio/mpeg"}'
```

## Next Steps

1. Update frontend upload form to use direct upload API
2. Add progress tracking for large files
3. Add client-side audio duration detection
4. Add waveform generation (optional)
