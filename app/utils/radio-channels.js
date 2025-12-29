/**
 * Radio Channels API - Azure Blob Storage Integration
 * Fetches and manages radio channel audio files from Azure Blob Storage
 */

const { BlobServiceClient } = require('@azure/storage-blob');

class RadioChannelsService {
  constructor() {
    this.connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    this.containerName = 'radio'; // Separate container for radio channels
    this.enabled = !!this.connectionString;

    if (this.enabled) {
      this.blobServiceClient = BlobServiceClient.fromConnectionString(this.connectionString);
      this.containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      this.initializeContainer();
    }
  }

  async initializeContainer() {
    try {
      // Create radio container if it doesn't exist (public access)
      await this.containerClient.createIfNotExists({
        access: 'blob', // Public read access for streaming
      });
      console.log(`✅ Radio channels container '${this.containerName}' ready`);
    } catch (error) {
      console.error('❌ Failed to initialize radio container:', error.message);
    }
  }

  /**
   * Radio Channel Structure in Blob Storage:
   * 
   * radio/
   * ├── techno/
   * │   ├── track1.mp3
   * │   ├── track2.mp3
   * │   └── track3.mp3
   * ├── house/
   * │   ├── track1.mp3
   * │   └── track2.mp3
   * ├── trance/
   * ├── trap/
   * ├── ambient/
   * └── dnb/
   */

  /**
   * Get all available radio channels
   * @returns {Promise<Array>} - List of channels with track counts
   */
  async getChannels() {
    if (!this.enabled) {
      return this.getMockChannels();
    }

    try {
      const channels = [
        { id: 'techno', name: 'TECHNO', icon: '⚡', color: '#D4AF37' },
        { id: 'house', name: 'HOUSE', icon: '🏠', color: '#FF6B35' },
        { id: 'trance', name: 'TRANCE', icon: '🌀', color: '#C0C0C0' },
        { id: 'trap', name: 'TRAP', icon: '💥', color: '#D4AF37' },
        { id: 'ambient', name: 'AMBIENT', icon: '🌊', color: '#C0C0C0' },
        { id: 'dnb', name: 'DRUM & BASS', icon: '🔊', color: '#FF6B35' },
      ];

      // Get track counts for each channel
      const channelsWithTracks = await Promise.all(
        channels.map(async (channel) => {
          const tracks = await this.getChannelTracks(channel.id);
          return {
            ...channel,
            trackCount: tracks.length,
            tracks: tracks,
          };
        })
      );

      return channelsWithTracks.filter(c => c.trackCount > 0);
    } catch (error) {
      console.error('Error fetching channels:', error);
      return this.getMockChannels();
    }
  }

  /**
   * Get all tracks for a specific channel
   * @param {string} channelId - Channel identifier (e.g., 'techno')
   * @returns {Promise<Array>} - List of track URLs
   */
  async getChannelTracks(channelId) {
    if (!this.enabled) {
      return [];
    }

    try {
      const tracks = [];
      const prefix = `${channelId}/`;

      // List all blobs in the channel directory
      for await (const blob of this.containerClient.listBlobsFlat({ prefix })) {
        if (blob.name.endsWith('.mp3') || blob.name.endsWith('.wav') || blob.name.endsWith('.m4a')) {
          const blobClient = this.containerClient.getBlobClient(blob.name);
          tracks.push({
            name: blob.name.split('/').pop().replace(/\.(mp3|wav|m4a)$/, ''),
            url: blobClient.url,
            size: blob.properties.contentLength,
            lastModified: blob.properties.lastModified,
          });
        }
      }

      return tracks;
    } catch (error) {
      console.error(`Error fetching tracks for ${channelId}:`, error);
      return [];
    }
  }

  /**
   * Upload a track to a radio channel
   * @param {string} channelId - Channel identifier
   * @param {Buffer} fileBuffer - Audio file buffer
   * @param {string} fileName - File name
   * @returns {Promise<string>} - Public URL of uploaded track
   */
  async uploadTrack(channelId, fileBuffer, fileName) {
    if (!this.enabled) {
      throw new Error('Azure Blob Storage not configured');
    }

    try {
      const blobName = `${channelId}/${Date.now()}-${fileName}`;
      const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);

      // Upload with audio content type
      await blockBlobClient.upload(fileBuffer, fileBuffer.length, {
        blobHTTPHeaders: {
          blobContentType: this.getContentType(fileName),
        },
      });

      console.log(`✅ Uploaded ${fileName} to ${channelId} channel`);
      return blockBlobClient.url;
    } catch (error) {
      console.error('Error uploading track:', error);
      throw error;
    }
  }

  /**
   * Delete a track from a channel
   * @param {string} channelId - Channel identifier
   * @param {string} trackName - Track file name
   */
  async deleteTrack(channelId, trackName) {
    if (!this.enabled) {
      throw new Error('Azure Blob Storage not configured');
    }

    try {
      const blobName = `${channelId}/${trackName}`;
      const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
      await blockBlobClient.delete();
      console.log(`✅ Deleted ${trackName} from ${channelId} channel`);
    } catch (error) {
      console.error('Error deleting track:', error);
      throw error;
    }
  }

  /**
   * Get content type based on file extension
   */
  getContentType(fileName) {
    const ext = fileName.split('.').pop().toLowerCase();
    const types = {
      mp3: 'audio/mpeg',
      wav: 'audio/wav',
      m4a: 'audio/mp4',
      ogg: 'audio/ogg',
    };
    return types[ext] || 'application/octet-stream';
  }

  /**
   * Mock channels for development/testing
   */
  getMockChannels() {
    return [
      {
        id: 'techno',
        name: 'TECHNO',
        icon: '⚡',
        color: '#D4AF37',
        trackCount: 0,
        tracks: [],
      },
      {
        id: 'house',
        name: 'HOUSE',
        icon: '🏠',
        color: '#FF6B35',
        trackCount: 0,
        tracks: [],
      },
      {
        id: 'trance',
        name: 'TRANCE',
        icon: '🌀',
        color: '#C0C0C0',
        trackCount: 0,
        tracks: [],
      },
      {
        id: 'trap',
        name: 'TRAP',
        icon: '💥',
        color: '#D4AF37',
        trackCount: 0,
        tracks: [],
      },
      {
        id: 'ambient',
        name: 'AMBIENT',
        icon: '🌊',
        color: '#C0C0C0',
        trackCount: 0,
        tracks: [],
      },
      {
        id: 'dnb',
        name: 'DRUM & BASS',
        icon: '🔊',
        color: '#FF6B35',
        trackCount: 0,
        tracks: [],
      },
    ];
  }
}

// Singleton instance
const radioChannelsService = new RadioChannelsService();

module.exports = radioChannelsService;
