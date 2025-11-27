/**
 * Azure Blob Storage Utility
 * Handles file uploads to Azure Blob Storage for persistent media storage
 */

const { BlobServiceClient } = require('@azure/storage-blob');
const fs = require('fs');
const path = require('path');

class BlobStorageService {
    constructor() {
        this.connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
        this.containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || 'tracks';
        this.enabled = !!this.connectionString;
        
        if (this.enabled) {
            this.blobServiceClient = BlobServiceClient.fromConnectionString(this.connectionString);
            this.containerClient = this.blobServiceClient.getContainerClient(this.containerName);
            this.initializeContainer();
        } else {
            console.log('⚠️  Azure Blob Storage not configured - using local file storage');
        }
    }

    async initializeContainer() {
        try {
            // Create container if it doesn't exist (public access for audio files)
            await this.containerClient.createIfNotExists({
                access: 'blob' // Public read access for blobs
            });
            console.log(`✅ Azure Blob Storage container '${this.containerName}' ready`);
        } catch (error) {
            console.error('❌ Failed to initialize blob container:', error.message);
        }
    }

    /**
     * Upload a file to Azure Blob Storage
     * @param {string} localFilePath - Path to the local file
     * @param {string} blobName - Name for the blob (e.g., '1234567890-track.mp3')
     * @returns {Promise<string>} - Public URL of the uploaded blob
     */
    async uploadFile(localFilePath, blobName) {
        if (!this.enabled) {
            // Return local file path if blob storage not configured
            return `/uploads/tracks/${blobName}`;
        }

        try {
            const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
            
            // Upload file
            await blockBlobClient.uploadFile(localFilePath, {
                blobHTTPHeaders: {
                    blobContentType: this.getContentType(blobName)
                }
            });

            // Return public URL
            const url = blockBlobClient.url;
            console.log(`✅ Uploaded to blob storage: ${blobName}`);
            
            // Delete local file after successful upload
            try {
                fs.unlinkSync(localFilePath);
                console.log(`🗑️  Deleted local file: ${localFilePath}`);
            } catch (err) {
                console.warn('⚠️  Could not delete local file:', err.message);
            }

            return url;
        } catch (error) {
            console.error('❌ Blob upload failed:', error.message);
            // Fallback to local storage
            return `/uploads/tracks/${blobName}`;
        }
    }

    /**
     * Delete a file from Azure Blob Storage
     * @param {string} blobName - Name of the blob to delete
     * @returns {Promise<boolean>} - Success status
     */
    async deleteFile(blobName) {
        if (!this.enabled) {
            // Delete local file
            const localPath = path.join(__dirname, '..', 'public', 'uploads', 'tracks', blobName);
            try {
                fs.unlinkSync(localPath);
                return true;
            } catch (err) {
                return false;
            }
        }

        try {
            const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
            await blockBlobClient.delete();
            console.log(`🗑️  Deleted from blob storage: ${blobName}`);
            return true;
        } catch (error) {
            console.error('❌ Blob deletion failed:', error.message);
            return false;
        }
    }

    /**
     * List all blobs in the container
     * @returns {Promise<Array>} - Array of blob names
     */
    async listFiles() {
        if (!this.enabled) {
            return [];
        }

        try {
            const blobs = [];
            for await (const blob of this.containerClient.listBlobsFlat()) {
                blobs.push(blob.name);
            }
            return blobs;
        } catch (error) {
            console.error('❌ Failed to list blobs:', error.message);
            return [];
        }
    }

    /**
     * Get content type based on file extension
     * @param {string} filename - File name
     * @returns {string} - MIME type
     */
    getContentType(filename) {
        const ext = path.extname(filename).toLowerCase();
        const types = {
            '.mp3': 'audio/mpeg',
            '.wav': 'audio/wav',
            '.ogg': 'audio/ogg',
            '.m4a': 'audio/mp4',
            '.flac': 'audio/flac'
        };
        return types[ext] || 'application/octet-stream';
    }

    /**
     * Get blob URL
     * @param {string} blobName - Name of the blob
     * @returns {string} - Public URL
     */
    getBlobUrl(blobName) {
        if (!this.enabled) {
            return `/uploads/tracks/${blobName}`;
        }
        const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
        return blockBlobClient.url;
    }
}

// Export singleton instance
module.exports = new BlobStorageService();
