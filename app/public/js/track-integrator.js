/**
 * Track Integrator - Complete Multi-Track Composition System
 * HAOS.fm - Hardware Analog Oscillator Synthesis
 * 
 * Features:
 * - Multi-track arrangement and layering
 * - AI patch integration across all tracks
 * - Pattern sequencing and automation
 * - Real-time mixing and effects
 * - Complete track export
 * - Arrangement timeline
 */

class TrackIntegrator {
    constructor(audioContext, dawEngine, aiDesigner) {
        this.audioContext = audioContext;
        this.daw = dawEngine;
        this.ai = aiDesigner;
        
        // Track configuration
        this.tracks = new Map();
        this.maxTracks = 16;
        this.currentBar = 0;
        this.bpm = 130;
        this.beatsPerBar = 4;
        this.totalBars = 32; // 32 bars = complete track
        
        // Arrangement
        this.arrangement = {
            intro: { start: 0, end: 8 },
            buildup: { start: 8, end: 16 },
            drop: { start: 16, end: 24 },
            breakdown: { start: 24, end: 28 },
            outro: { start: 28, end: 32 }
        };
        
        // Mixing
        this.masterVolume = 1.0;
        this.masterCompressor = null;
        this.masterReverb = null;
        
        // Playback state
        this.isPlaying = false;
        this.playbackPosition = 0;
        this.loopEnabled = false;
        this.loopStart = 0;
        this.loopEnd = 32;
        
        this.initMasterEffects();
    }
    
    /**
     * Initialize master effects chain
     */
    initMasterEffects() {
        // Master compressor
        this.masterCompressor = this.audioContext.createDynamicsCompressor();
        this.masterCompressor.threshold.value = -24;
        this.masterCompressor.knee.value = 30;
        this.masterCompressor.ratio.value = 3;
        this.masterCompressor.attack.value = 0.003;
        this.masterCompressor.release.value = 0.25;
        
        // Master reverb (convolver)
        this.masterReverb = this.audioContext.createConvolver();
        this.masterReverbGain = this.audioContext.createGain();
        this.masterReverbGain.gain.value = 0.2;
        
        // Create simple reverb impulse
        this.createReverbImpulse();
        
        // Connect master chain
        this.masterCompressor.connect(this.masterReverbGain);
        this.masterReverbGain.connect(this.masterReverb);
        this.masterReverb.connect(this.audioContext.destination);
        this.masterCompressor.connect(this.audioContext.destination);
    }
    
    /**
     * Create reverb impulse response
     */
    createReverbImpulse() {
        const sampleRate = this.audioContext.sampleRate;
        const length = sampleRate * 2; // 2 second reverb
        const impulse = this.audioContext.createBuffer(2, length, sampleRate);
        
        for (let channel = 0; channel < 2; channel++) {
            const channelData = impulse.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
            }
        }
        
        this.masterReverb.buffer = impulse;
    }
    
    /**
     * Add a new track with AI-generated patch
     */
    addTrack(config) {
        const trackId = `track-${this.tracks.size + 1}`;
        
        // Generate AI patch for this track
        const patch = this.ai.generatePatch(
            config.genre || 'minimal-techno',
            config.soundType || 'bass',
            config.mood || 'balanced'
        );
        
        const track = {
            id: trackId,
            name: config.name || `Track ${this.tracks.size + 1}`,
            synth: config.synth,
            patch: patch,
            patterns: new Map(), // bar -> pattern mapping
            volume: config.volume || 0.8,
            pan: config.pan || 0,
            mute: false,
            solo: false,
            effects: {
                delay: { enabled: false, time: 0.25, feedback: 0.3 },
                reverb: { enabled: false, amount: 0.3 },
                filter: { enabled: false, cutoff: 1000, resonance: 0.5 }
            },
            automation: {
                volume: new Map(),
                filter: new Map(),
                effects: new Map()
            },
            gainNode: this.audioContext.createGain(),
            panNode: this.audioContext.createStereoPanner(),
            color: config.color || this.generateTrackColor()
        };
        
        // Setup audio routing
        track.gainNode.gain.value = track.volume;
        track.panNode.pan.value = track.pan;
        track.gainNode.connect(track.panNode);
        track.panNode.connect(this.masterCompressor);
        
        this.tracks.set(trackId, track);
        
        console.log(`✓ Track added: ${track.name} (${patch.synth})`);
        return trackId;
    }
    
    /**
     * Add pattern to track at specific bar
     */
    addPatternToTrack(trackId, bar, pattern) {
        const track = this.tracks.get(trackId);
        if (!track) {
            console.error('Track not found:', trackId);
            return false;
        }
        
        track.patterns.set(bar, pattern);
        console.log(`✓ Pattern added to ${track.name} at bar ${bar}`);
        return true;
    }
    
    /**
     * Generate complete track with AI assistance
     */
    generateCompleteTrack(genre, structure = 'standard') {
        console.log(`🎵 Generating complete ${genre} track...`);
        
        const tracks = [];
        
        // Structure templates
        const structures = {
            'standard': {
                tracks: [
                    { soundType: 'drums', name: 'Drums', synth: 'tr808', bars: [0, 32] },
                    { soundType: 'bass', name: 'Bass', synth: 'tb303', bars: [8, 32] },
                    { soundType: 'lead', name: 'Lead', synth: 'arp2600', bars: [16, 28] },
                    { soundType: 'pad', name: 'Pad', synth: 'arp2600', bars: [12, 32] }
                ]
            },
            'minimal': {
                tracks: [
                    { soundType: 'drums', name: 'Kick', synth: 'tr808', bars: [0, 32] },
                    { soundType: 'bass', name: 'Bass', synth: 'tb303', bars: [4, 32] },
                    { soundType: 'fx', name: 'Perc', synth: 'tr808', bars: [8, 32] }
                ]
            },
            'epic': {
                tracks: [
                    { soundType: 'drums', name: 'Drums', synth: 'tr808', bars: [0, 32] },
                    { soundType: 'bass', name: 'Sub Bass', synth: 'tb303', bars: [8, 32], mood: 'subtle' },
                    { soundType: 'bass', name: 'Mid Bass', synth: 'arp2600', bars: [12, 32], mood: 'balanced' },
                    { soundType: 'lead', name: 'Lead 1', synth: 'arp2600', bars: [16, 28], mood: 'aggressive' },
                    { soundType: 'pad', name: 'Pad', synth: 'stringMachine', bars: [8, 32] },
                    { soundType: 'fx', name: 'FX', synth: 'arp2600', bars: [12, 32] }
                ]
            }
        };
        
        const template = structures[structure] || structures.standard;
        
        // Generate each track
        template.tracks.forEach((trackConfig, index) => {
            const trackId = this.addTrack({
                name: trackConfig.name,
                synth: trackConfig.synth,
                genre: genre,
                soundType: trackConfig.soundType,
                mood: trackConfig.mood || 'balanced',
                volume: this.calculateTrackVolume(trackConfig.soundType),
                pan: this.calculateTrackPan(index, template.tracks.length)
            });
            
            // Generate patterns for this track based on bar range
            const [startBar, endBar] = trackConfig.bars;
            for (let bar = startBar; bar < endBar; bar++) {
                const pattern = this.generatePattern(trackConfig.soundType, bar, genre);
                this.addPatternToTrack(trackId, bar, pattern);
            }
            
            // Add automation
            this.addTrackAutomation(trackId, genre, structure);
            
            tracks.push(trackId);
        });
        
        console.log(`✅ Complete track generated with ${tracks.length} tracks!`);
        return tracks;
    }
    
    /**
     * Calculate optimal track volume based on sound type
     */
    calculateTrackVolume(soundType) {
        const volumes = {
            'drums': 0.9,
            'bass': 0.85,
            'lead': 0.7,
            'pad': 0.6,
            'fx': 0.5
        };
        return volumes[soundType] || 0.7;
    }
    
    /**
     * Calculate track panning for stereo width
     */
    calculateTrackPan(index, total) {
        if (total <= 1) return 0;
        
        // Spread tracks across stereo field
        const position = index / (total - 1);
        return (position - 0.5) * 0.8; // -0.4 to 0.4
    }
    
    /**
     * Generate pattern for specific sound type and bar
     */
    generatePattern(soundType, bar, genre) {
        const pattern = Array(16).fill(false);
        
        // Pattern generation logic based on sound type
        if (soundType === 'drums') {
            // Kick on every 4th step
            for (let i = 0; i < 16; i += 4) {
                pattern[i] = true;
            }
            // Add variation every 8 bars
            if (bar % 8 === 7) {
                pattern[14] = true;
                pattern[15] = true;
            }
        } else if (soundType === 'bass') {
            // Bass pattern
            const bassPatterns = [
                [0, 4, 8, 12],
                [0, 3, 6, 9, 12],
                [0, 2, 4, 6, 8, 10, 12, 14]
            ];
            const patternIndex = Math.floor(bar / 4) % bassPatterns.length;
            bassPatterns[patternIndex].forEach(step => {
                pattern[step] = true;
            });
        } else if (soundType === 'lead') {
            // Melodic lead pattern
            if (bar % 2 === 0) {
                pattern[0] = pattern[4] = pattern[8] = pattern[12] = true;
            } else {
                pattern[2] = pattern[6] = pattern[10] = pattern[14] = true;
            }
        } else if (soundType === 'pad') {
            // Long sustained notes
            pattern[0] = true;
            if (bar % 4 === 0) {
                pattern[8] = true;
            }
        } else if (soundType === 'fx') {
            // Sparse FX hits
            if (bar % 4 === 3) {
                pattern[12] = pattern[14] = true;
            }
        }
        
        return pattern;
    }
    
    /**
     * Add automation to track
     */
    addTrackAutomation(trackId, genre, structure) {
        const track = this.tracks.get(trackId);
        if (!track) return;
        
        // Volume automation for dynamics
        // Intro: gradual fade in
        for (let bar = 0; bar < 8; bar++) {
            const volume = (bar / 8) * track.volume;
            track.automation.volume.set(bar, volume);
        }
        
        // Build tension before drop
        track.automation.volume.set(15, track.volume * 0.7);
        track.automation.volume.set(16, track.volume * 1.2); // Drop impact
        
        // Breakdown: reduce volume
        for (let bar = 24; bar < 28; bar++) {
            track.automation.volume.set(bar, track.volume * 0.6);
        }
        
        // Outro: fade out
        for (let bar = 28; bar < 32; bar++) {
            const volume = track.volume * (1 - (bar - 28) / 4);
            track.automation.volume.set(bar, volume);
        }
        
        // Filter automation for build-ups
        if (track.patch.soundType === 'lead' || track.patch.soundType === 'bass') {
            for (let bar = 12; bar < 16; bar++) {
                const cutoff = 200 + ((bar - 12) / 4) * 2000;
                track.automation.filter.set(bar, { cutoff, resonance: 0.7 });
            }
        }
    }
    
    /**
     * Play complete track
     */
    playCompleteTrack() {
        if (this.isPlaying) {
            this.stopPlayback();
            return;
        }
        
        this.isPlaying = true;
        this.currentBar = 0;
        
        console.log('▶️ Playing complete track...');
        
        this.playbackInterval = setInterval(() => {
            this.playBar(this.currentBar);
            
            this.currentBar++;
            
            // Loop or stop
            if (this.currentBar >= this.totalBars) {
                if (this.loopEnabled) {
                    this.currentBar = this.loopStart;
                } else {
                    this.stopPlayback();
                }
            }
        }, (60 / this.bpm) * this.beatsPerBar * 1000);
        
        return true;
    }
    
    /**
     * Play single bar across all tracks
     */
    playBar(bar) {
        console.log(`🎵 Playing bar ${bar}`);
        
        this.tracks.forEach((track, trackId) => {
            if (track.mute) return;
            
            // Check if any track has solo
            const hasSolo = Array.from(this.tracks.values()).some(t => t.solo);
            if (hasSolo && !track.solo) return;
            
            // Get pattern for this bar
            const pattern = track.patterns.get(bar);
            if (!pattern) return;
            
            // Apply automation
            this.applyAutomation(track, bar);
            
            // Play pattern
            this.playPattern(track, pattern, bar);
        });
    }
    
    /**
     * Apply automation for current bar
     */
    applyAutomation(track, bar) {
        // Volume automation
        if (track.automation.volume.has(bar)) {
            track.gainNode.gain.value = track.automation.volume.get(bar);
        }
        
        // Filter automation
        if (track.automation.filter.has(bar)) {
            const filterAuto = track.automation.filter.get(bar);
            // Apply to synth if it has filter controls
            // This would connect to the actual synth instance
        }
    }
    
    /**
     * Play pattern on track
     */
    playPattern(track, pattern, bar) {
        const stepTime = (60 / this.bpm) * 0.25; // 16th notes
        const barStartTime = this.audioContext.currentTime;
        
        pattern.forEach((active, step) => {
            if (!active) return;
            
            const stepStartTime = barStartTime + (step * stepTime);
            
            // Trigger note based on synth type
            this.triggerNote(track, stepStartTime, step);
        });
    }
    
    /**
     * Trigger note on synth
     */
    triggerNote(track, time, step) {
        // This would call the actual synth instance
        // For now, log the trigger
        console.log(`  ${track.name}: step ${step} at ${time.toFixed(2)}s`);
    }
    
    /**
     * Stop playback
     */
    stopPlayback() {
        if (this.playbackInterval) {
            clearInterval(this.playbackInterval);
            this.playbackInterval = null;
        }
        this.isPlaying = false;
        console.log('⏹️ Playback stopped');
    }
    
    /**
     * Export complete track as audio buffer
     */
    async exportTrack() {
        console.log('📀 Exporting complete track...');
        
        const sampleRate = this.audioContext.sampleRate;
        const duration = (60 / this.bpm) * this.beatsPerBar * this.totalBars;
        const frameCount = Math.ceil(sampleRate * duration);
        
        // Create offline context for rendering
        const offlineContext = new OfflineAudioContext(2, frameCount, sampleRate);
        
        // Render all tracks
        // This would recreate all synths and patterns in offline context
        // and render them to a buffer
        
        const renderedBuffer = await offlineContext.startRendering();
        
        console.log('✅ Track exported!');
        return renderedBuffer;
    }
    
    /**
     * Get track info for UI
     */
    getTrackInfo(trackId) {
        const track = this.tracks.get(trackId);
        if (!track) return null;
        
        return {
            id: track.id,
            name: track.name,
            synth: track.patch.synth,
            genre: track.patch.genre,
            soundType: track.patch.soundType,
            mood: track.patch.mood,
            volume: track.volume,
            pan: track.pan,
            mute: track.mute,
            solo: track.solo,
            patternCount: track.patterns.size,
            color: track.color
        };
    }
    
    /**
     * Get all tracks info
     */
    getAllTracksInfo() {
        const tracksInfo = [];
        this.tracks.forEach((track, trackId) => {
            tracksInfo.push(this.getTrackInfo(trackId));
        });
        return tracksInfo;
    }
    
    /**
     * Toggle track mute
     */
    toggleMute(trackId) {
        const track = this.tracks.get(trackId);
        if (track) {
            track.mute = !track.mute;
            return track.mute;
        }
        return false;
    }
    
    /**
     * Toggle track solo
     */
    toggleSolo(trackId) {
        const track = this.tracks.get(trackId);
        if (track) {
            track.solo = !track.solo;
            return track.solo;
        }
        return false;
    }
    
    /**
     * Set track volume
     */
    setTrackVolume(trackId, volume) {
        const track = this.tracks.get(trackId);
        if (track) {
            track.volume = volume;
            track.gainNode.gain.value = volume;
        }
    }
    
    /**
     * Set track pan
     */
    setTrackPan(trackId, pan) {
        const track = this.tracks.get(trackId);
        if (track) {
            track.pan = pan;
            track.panNode.pan.value = pan;
        }
    }
    
    /**
     * Generate random track color
     */
    generateTrackColor() {
        const colors = [
            '#39FF14', '#FF6B35', '#00D9FF', '#FFD700',
            '#FF1493', '#00FF00', '#FF4500', '#1E90FF'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    /**
     * Clear all tracks
     */
    clearAllTracks() {
        this.tracks.forEach((track) => {
            track.gainNode.disconnect();
            track.panNode.disconnect();
        });
        this.tracks.clear();
        console.log('🗑️ All tracks cleared');
    }
    
    /**
     * Save project
     */
    saveProject() {
        const project = {
            bpm: this.bpm,
            totalBars: this.totalBars,
            arrangement: this.arrangement,
            tracks: []
        };
        
        this.tracks.forEach((track) => {
            project.tracks.push({
                id: track.id,
                name: track.name,
                patch: track.patch,
                patterns: Array.from(track.patterns.entries()),
                volume: track.volume,
                pan: track.pan,
                automation: {
                    volume: Array.from(track.automation.volume.entries()),
                    filter: Array.from(track.automation.filter.entries())
                },
                color: track.color
            });
        });
        
        const projectJSON = JSON.stringify(project, null, 2);
        console.log('💾 Project saved');
        return projectJSON;
    }
    
    /**
     * Load project
     */
    loadProject(projectJSON) {
        try {
            const project = JSON.parse(projectJSON);
            
            this.clearAllTracks();
            this.bpm = project.bpm;
            this.totalBars = project.totalBars;
            this.arrangement = project.arrangement;
            
            project.tracks.forEach((trackData) => {
                // Recreate track
                const trackId = trackData.id;
                const track = {
                    ...trackData,
                    patterns: new Map(trackData.patterns),
                    automation: {
                        volume: new Map(trackData.automation.volume),
                        filter: new Map(trackData.automation.filter),
                        effects: new Map()
                    },
                    gainNode: this.audioContext.createGain(),
                    panNode: this.audioContext.createStereoPanner()
                };
                
                track.gainNode.gain.value = track.volume;
                track.panNode.pan.value = track.pan;
                track.gainNode.connect(track.panNode);
                track.panNode.connect(this.masterCompressor);
                
                this.tracks.set(trackId, track);
            });
            
            console.log('📂 Project loaded');
            return true;
        } catch (error) {
            console.error('Error loading project:', error);
            return false;
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TrackIntegrator;
}
