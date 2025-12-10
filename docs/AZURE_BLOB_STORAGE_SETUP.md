# Azure Blob Storage Setup for Track Uploads

## Overview

Uploaded audio tracks are stored in Azure Blob Storage for persistent, scalable storage across deployments.

## Setup Instructions

### 1. Create Azure Storage Account

```bash
# Login to Azure
az login

# Create resource group (if needed)
az group create --name haos-fm-rg --location eastus

# Create storage account
az storage account create \
  --name haosfmstorage \
  --resource-group haos-fm-rg \
  --location eastus \
  --sku Standard_LRS \
  --kind StorageV2

# Get connection string
az storage account show-connection-string \
  --name haosfmstorage \
  --resource-group haos-fm-rg \
  --query connectionString \
  --output tsv
```

### 2. Configure Environment Variables

Add to your `.env` file or Azure App Service Configuration:

```env
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=haosfmstorage;AccountKey=...;EndpointSuffix=core.windows.net
AZURE_STORAGE_CONTAINER_NAME=tracks
```

### 3. Set App Service Configuration

For Azure App Service, add the environment variables:

```bash
az webapp config appsettings set \
  --name your-app-name \
  --resource-group haos-fm-rg \
  --settings \
  AZURE_STORAGE_CONNECTION_STRING="..." \
  AZURE_STORAGE_CONTAINER_NAME="tracks"
```

## How It Works

### Upload Process

1. User uploads audio file via `/api/tracks/upload`
2. File is temporarily saved to local disk via multer
3. File is uploaded to Azure Blob Storage
4. Public blob URL is stored in track metadata
5. Local file is deleted after successful upload

### Playback

- Radio player receives absolute blob URLs (e.g., `https://haosfmstorage.blob.core.windows.net/tracks/1234567890-track.mp3`)
- Files are publicly accessible for playback
- No CORS issues since blobs are public

### Fallback

If `AZURE_STORAGE_CONNECTION_STRING` is not set:
- Files remain in local `app/public/uploads/tracks/` directory
- Suitable for development/testing
- **Not recommended for production** (files lost on redeploy)

## Storage Costs

- **Storage**: ~$0.02/GB/month (Standard LRS)
- **Bandwidth**: First 100GB free per month
- **Transactions**: Minimal cost for uploads/downloads

For 100 tracks (~1GB): **~$0.02/month**

## Security

- Container has **public blob access** (read-only)
- Users can play tracks but cannot list all blobs
- Upload requires authentication through the API

## Monitoring

View uploaded files:

```bash
az storage blob list \
  --account-name haosfmstorage \
  --container-name tracks \
  --output table
```

## Cleanup

Delete old tracks:

```bash
# Delete specific blob
az storage blob delete \
  --account-name haosfmstorage \
  --container-name tracks \
  --name "1234567890-track.mp3"

# Delete all blobs (careful!)
az storage blob delete-batch \
  --account-name haosfmstorage \
  --source tracks
```

## Troubleshooting

### Tracks not playing on production

1. Check if `AZURE_STORAGE_CONNECTION_STRING` is set:
   ```bash
   az webapp config appsettings list --name your-app-name --resource-group haos-fm-rg
   ```

2. Verify container exists and is public:
   ```bash
   az storage container show \
     --name tracks \
     --account-name haosfmstorage
   ```

3. Test blob URL directly in browser:
   ```
   https://haosfmstorage.blob.core.windows.net/tracks/your-file.mp3
   ```

### Upload failures

- Check storage account key is valid
- Verify network connectivity to Azure
- Check container name matches configuration
- Ensure storage account has sufficient quota

## Migration from Local Storage

To migrate existing tracks:

```bash
# Upload all local tracks to blob storage
cd app/public/uploads/tracks
for file in *.mp3; do
  az storage blob upload \
    --account-name haosfmstorage \
    --container-name tracks \
    --name "$file" \
    --file "$file" \
    --content-type "audio/mpeg"
done
```

Then update `tracks-metadata.json` URLs to point to blob storage.
