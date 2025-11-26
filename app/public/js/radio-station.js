/**
 * HAOS.fm Enhanced Radio System
 * Multi-channel streaming, live chat, DJ mode, and audio visualization
 */

export class RadioStation {
    constructor(audioContext) {
        this.audioContext = audioContext;
        this.currentChannel = 'techno';
        this.isPlaying = false;
        this.volume = 0.8;
        
        // Channels configuration
        this.channels = {
            techno: {
                name: '⚡ TECHNO',
                description: 'Industrial, Acid, Hard Techno',
                color: '#39FF14',
                bpm: [125, 145],
                playlist: [],
                currentTrack: 0
            },
            house: {
                name: '🏠 HOUSE',
                description: 'Deep House, Tech House, Progressive',
                color: '#FFD700',
                bpm: [120, 128],
                playlist: [],
                currentTrack: 0
            },
            trance: {
                name: '🌊 TRANCE',
                description: 'Progressive, Uplifting, Psytrance',
                color: '#00D9FF',
                bpm: [130, 140],
                playlist: [],
                currentTrack: 0
            },
            trap: {
                name: '🔥 TRAP',
                description: 'Trap, Hip-Hop, Bass Music',
                color: '#FF6B35',
                bpm: [130, 160],
                playlist: [],
                currentTrack: 0
            },
            ambient: {
                name: '🌌 AMBIENT',
                description: 'Chillout, Downtempo, Atmospheric',
                color: '#9370DB',
                bpm: [60, 90],
                playlist: [],
                currentTrack: 0
            },
            dnb: {
                name: '⚡ DnB',
                description: 'Drum & Bass, Jungle, Liquid',
                color: '#FF1493',
                bpm: [160, 180],
                playlist: [],
                currentTrack: 0
            }
        };
        
        // Audio nodes
        this.gainNode = null;
        this.analyserNode = null;
        this.sourceNode = null;
        this.audioElement = null;
        
        // Playlist management
        this.history = [];
        this.queue = [];
        
        // Chat system
        this.chatMessages = [];
        this.maxChatMessages = 100;
        
        // Statistics
        this.listeners = 0;
        this.stats = {
            totalPlays: 0,
            totalListeners: 0,
            uptime: 0
        };
        
        this.initializeAudio();
    }
    
    /**
     * Initialize audio nodes
     */
    initializeAudio() {
        this.gainNode = this.audioContext.createGain();
        this.analyserNode = this.audioContext.createAnalyser();
        
        this.analyserNode.fftSize = 2048;
        this.gainNode.gain.value = this.volume;
        
        // Connect nodes
        this.gainNode.connect(this.analyserNode);
        this.analyserNode.connect(this.audioContext.destination);
    }
    
    /**
     * Switch to a different channel
     */
    switchChannel(channelId) {
        if (!this.channels[channelId]) {
            return { success: false, message: 'Channel not found' };
        }
        
        const wasPlaying = this.isPlaying;
        
        if (wasPlaying) {
            this.stop();
        }
        
        this.currentChannel = channelId;
        
        if (wasPlaying) {
            this.play();
        }
        
        this.broadcastEvent('channelChanged', {
            channel: channelId,
            info: this.channels[channelId]
        });
        
        return {
            success: true,
            channel: this.channels[channelId]
        };
    }
    
    /**
     * Play current channel
     */
    play() {
        const channel = this.channels[this.currentChannel];
        
        if (channel.playlist.length === 0) {
            return { success: false, message: 'No tracks in playlist' };
        }
        
        const track = channel.playlist[channel.currentTrack];
        
        // Create audio element if doesn't exist
        if (!this.audioElement) {
            this.audioElement = new Audio();
            this.audioElement.crossOrigin = 'anonymous';
            
            // Create MediaElementSource
            this.sourceNode = this.audioContext.createMediaElementSource(this.audioElement);
            this.sourceNode.connect(this.gainNode);
            
            // Add event listeners
            this.audioElement.addEventListener('ended', () => this.playNext());
            this.audioElement.addEventListener('error', (e) => this.handleError(e));
            this.audioElement.addEventListener('timeupdate', () => this.updateProgress());
        }
        
        this.audioElement.src = track.url;
        this.audioElement.play()
            .then(() => {
                this.isPlaying = true;
                this.stats.totalPlays++;
                this.broadcastEvent('trackStarted', { track, channel: this.currentChannel });
            })
            .catch(error => {
                console.error('Playback error:', error);
                this.handleError(error);
            });
        
        return { success: true, track };
    }
    
    /**
     * Pause playback
     */
    pause() {
        if (this.audioElement) {
            this.audioElement.pause();
            this.isPlaying = false;
            this.broadcastEvent('trackPaused', {});
        }
    }
    
    /**
     * Stop playback
     */
    stop() {
        if (this.audioElement) {
            this.audioElement.pause();
            this.audioElement.currentTime = 0;
            this.isPlaying = false;
            this.broadcastEvent('trackStopped', {});
        }
    }
    
    /**
     * Play next track
     */
    playNext() {
        const channel = this.channels[this.currentChannel];
        
        // Check queue first
        if (this.queue.length > 0) {
            const nextTrack = this.queue.shift();
            this.addToHistory(channel.playlist[channel.currentTrack]);
            channel.playlist.splice(channel.currentTrack, 0, nextTrack);
        } else {
            // Move to next track
            this.addToHistory(channel.playlist[channel.currentTrack]);
            channel.currentTrack = (channel.currentTrack + 1) % channel.playlist.length;
        }
        
        if (this.isPlaying) {
            this.play();
        }
    }
    
    /**
     * Play previous track
     */
    playPrevious() {
        const channel = this.channels[this.currentChannel];
        
        if (this.history.length > 0) {
            const previousTrack = this.history.pop();
            channel.currentTrack = channel.playlist.findIndex(t => t.id === previousTrack.id);
            
            if (this.isPlaying) {
                this.play();
            }
        }
    }
    
    /**
     * Add track to queue
     */
    addToQueue(track) {
        this.queue.push(track);
        this.broadcastEvent('queueUpdated', { queue: this.queue });
        return { success: true, queue: this.queue };
    }
    
    /**
     * Remove track from queue
     */
    removeFromQueue(index) {
        if (index >= 0 && index < this.queue.length) {
            const removed = this.queue.splice(index, 1);
            this.broadcastEvent('queueUpdated', { queue: this.queue });
            return { success: true, removed: removed[0] };
        }
        return { success: false };
    }
    
    /**
     * Add track to history
     */
    addToHistory(track) {
        this.history.push(track);
        if (this.history.length > 50) {
            this.history.shift();
        }
    }
    
    /**
     * Set volume
     */
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        if (this.gainNode) {
            this.gainNode.gain.setValueAtTime(this.volume, this.audioContext.currentTime);
        }
        this.broadcastEvent('volumeChanged', { volume: this.volume });
    }
    
    /**
     * Get current track info
     */
    getCurrentTrack() {
        const channel = this.channels[this.currentChannel];
        if (channel.playlist.length === 0) return null;
        
        return {
            ...channel.playlist[channel.currentTrack],
            channel: this.currentChannel,
            channelInfo: channel,
            position: this.audioElement ? this.audioElement.currentTime : 0,
            duration: this.audioElement ? this.audioElement.duration : 0
        };
    }
    
    /**
     * Get visualizer data
     */
    getVisualizerData() {
        if (!this.analyserNode) return { frequencies: [], waveform: [] };
        
        const frequencyData = new Uint8Array(this.analyserNode.frequencyBinCount);
        const waveformData = new Uint8Array(this.analyserNode.frequencyBinCount);
        
        this.analyserNode.getByteFrequencyData(frequencyData);
        this.analyserNode.getByteTimeDomainData(waveformData);
        
        return {
            frequencies: Array.from(frequencyData),
            waveform: Array.from(waveformData)
        };
    }
    
    /**
     * Add track to channel playlist
     */
    addTrackToChannel(channelId, track) {
        if (!this.channels[channelId]) {
            return { success: false, message: 'Channel not found' };
        }
        
        const newTrack = {
            id: Date.now(),
            title: track.title,
            artist: track.artist,
            url: track.url,
            duration: track.duration || 0,
            bpm: track.bpm || this.channels[channelId].bpm[0],
            genre: track.genre || channelId,
            artwork: track.artwork || null,
            uploadedAt: new Date().toISOString()
        };
        
        this.channels[channelId].playlist.push(newTrack);
        this.broadcastEvent('playlistUpdated', {
            channel: channelId,
            playlist: this.channels[channelId].playlist
        });
        
        return { success: true, track: newTrack };
    }
    
    /**
     * Remove track from channel
     */
    removeTrackFromChannel(channelId, trackId) {
        if (!this.channels[channelId]) {
            return { success: false, message: 'Channel not found' };
        }
        
        const index = this.channels[channelId].playlist.findIndex(t => t.id === trackId);
        if (index !== -1) {
            this.channels[channelId].playlist.splice(index, 1);
            this.broadcastEvent('playlistUpdated', {
                channel: channelId,
                playlist: this.channels[channelId].playlist
            });
            return { success: true };
        }
        
        return { success: false, message: 'Track not found' };
    }
    
    /**
     * Chat system - Add message
     */
    addChatMessage(username, message) {
        const chatMessage = {
            id: Date.now(),
            username,
            message,
            timestamp: new Date().toISOString(),
            channel: this.currentChannel
        };
        
        this.chatMessages.push(chatMessage);
        
        // Keep only recent messages
        if (this.chatMessages.length > this.maxChatMessages) {
            this.chatMessages.shift();
        }
        
        this.broadcastEvent('chatMessage', chatMessage);
        return chatMessage;
    }
    
    /**
     * Get chat messages
     */
    getChatMessages(limit = 50) {
        return this.chatMessages.slice(-limit);
    }
    
    /**
     * Update listener count
     */
    updateListeners(count) {
        this.listeners = count;
        this.stats.totalListeners = Math.max(this.stats.totalListeners, count);
        this.broadcastEvent('listenersUpdated', { listeners: count });
    }
    
    /**
     * Get statistics
     */
    getStatistics() {
        return {
            ...this.stats,
            currentListeners: this.listeners,
            channels: Object.keys(this.channels).length,
            totalTracks: Object.values(this.channels).reduce((sum, ch) => sum + ch.playlist.length, 0),
            queueLength: this.queue.length,
            historyLength: this.history.length
        };
    }
    
    /**
     * Broadcast event to listeners
     */
    broadcastEvent(eventName, data) {
        window.dispatchEvent(new CustomEvent(`radio:${eventName}`, { detail: data }));
    }
    
    /**
     * Update progress
     */
    updateProgress() {
        if (!this.audioElement) return;
        
        const progress = {
            currentTime: this.audioElement.currentTime,
            duration: this.audioElement.duration,
            percentage: (this.audioElement.currentTime / this.audioElement.duration) * 100 || 0
        };
        
        this.broadcastEvent('progressUpdated', progress);
    }
    
    /**
     * Handle playback errors
     */
    handleError(error) {
        console.error('Radio error:', error);
        this.broadcastEvent('playbackError', { error: error.message });
        
        // Try to skip to next track
        setTimeout(() => this.playNext(), 2000);
    }
    
    /**
     * Seek to position
     */
    seek(seconds) {
        if (this.audioElement) {
            this.audioElement.currentTime = seconds;
        }
    }
    
    /**
     * Get all channels info
     */
    getAllChannels() {
        return Object.entries(this.channels).map(([id, channel]) => ({
            id,
            ...channel,
            trackCount: channel.playlist.length,
            isCurrent: id === this.currentChannel
        }));
    }
}

export default RadioStation;
