/**
 * HAOS.fm Audio Recording System
 * Records audio, matches beats, stores recordings with synchronized playback
 * Integrates with sequencer and synthesis engines
 */

export class AudioRecorder {
    constructor(audioContext) {
        this.audioContext = audioContext;
        this.mediaRecorder = null;
        this.recordedChunks = [];
        this.recordings = [];
        this.isRecording = false;
        this.isPaused = false;
        this.startTime = 0;
        this.pauseTime = 0;
        this.totalPauseDuration = 0;

        // Beat matching
        this.currentBPM = 120;
        this.beatsPerBar = 4;
        this.quantizeEnabled = true;
        this.metronomeEnabled = false;

        // Audio nodes
        this.inputNode = null;
        this.analyserNode = null;
        this.gainNode = null;
        this.metronomeSynth = null;

        // Playback
        this.playbackNodes = new Map();
        this.scheduledRecordings = [];

        // Storage
        this.storageKey = 'haos_recordings';
        this.loadRecordingsFromStorage();

        this.initializeMetronome();
    }

    /**
     * Initialize recording with microphone input
     */
    async initializeRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: false,
                    sampleRate: 48000,
                },
            });

            // Create audio nodes
            this.inputNode = this.audioContext.createMediaStreamSource(stream);
            this.analyserNode = this.audioContext.createAnalyser();
            this.gainNode = this.audioContext.createGain();

            this.analyserNode.fftSize = 2048;
            this.gainNode.gain.value = 1.0;

            // Connect nodes for monitoring
            this.inputNode.connect(this.analyserNode);
            this.analyserNode.connect(this.gainNode);
            // Don't connect to output by default (no monitoring feedback)

            // Setup MediaRecorder
            const options = {
                mimeType: 'audio/webm;codecs=opus',
                audioBitsPerSecond: 128000,
            };

            // Fallback for Safari
            if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                options.mimeType = 'audio/mp4';
            }

            this.mediaRecorder = new MediaRecorder(stream, options);

            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.recordedChunks.push(event.data);
                }
            };

            this.mediaRecorder.onstop = () => {
                this.finalizeRecording();
            };

            return {
                success: true,
                message: 'Recording initialized successfully',
            };

        } catch (error) {
            console.error('Failed to initialize recording:', error);
            return {
                success: false,
                message: 'Microphone access denied or not available',
            };
        }
    }

    /**
     * Start recording with beat synchronization
     */
    async startRecording(options = {}) {
        if (!this.mediaRecorder) {
            const result = await this.initializeRecording();
            if (!result.success) {
                return result;
            }
        }

        this.currentBPM = options.bpm || this.currentBPM;
        this.beatsPerBar = options.beatsPerBar || this.beatsPerBar;
        this.quantizeEnabled = options.quantize !== undefined ? options.quantize : this.quantizeEnabled;

        // Wait for next beat if quantize is enabled
        if (this.quantizeEnabled && options.sequencer) {
            await this.waitForNextBeat(options.sequencer);
        }

        this.recordedChunks = [];
        this.startTime = this.audioContext.currentTime;
        this.totalPauseDuration = 0;
        this.isRecording = true;
        this.isPaused = false;

        // Start metronome if enabled
        if (this.metronomeEnabled) {
            this.startMetronome();
        }

        this.mediaRecorder.start(100); // Collect data every 100ms

        return {
            success: true,
            message: 'Recording started',
            startTime: this.startTime,
        };
    }

    /**
     * Wait for next beat to start recording in sync
     */
    waitForNextBeat(sequencer) {
        return new Promise((resolve) => {
            if (!sequencer || !sequencer.isPlaying) {
                resolve();
                return;
            }

            const beatDuration = 60 / this.currentBPM;
            const { currentTime } = this.audioContext;
            const nextBeatTime = Math.ceil(currentTime / beatDuration) * beatDuration;
            const waitTime = (nextBeatTime - currentTime) * 1000;

            setTimeout(resolve, waitTime);
        });
    }

    /**
     * Pause recording
     */
    pauseRecording() {
        if (this.isRecording && !this.isPaused) {
            this.mediaRecorder.pause();
            this.pauseTime = this.audioContext.currentTime;
            this.isPaused = true;
            this.stopMetronome();

            return {
                success: true,
                message: 'Recording paused',
            };
        }
        return {
            success: false,
            message: 'Not recording or already paused',
        };
    }

    /**
     * Resume recording
     */
    resumeRecording() {
        if (this.isRecording && this.isPaused) {
            this.mediaRecorder.resume();
            this.totalPauseDuration += this.audioContext.currentTime - this.pauseTime;
            this.isPaused = false;

            if (this.metronomeEnabled) {
                this.startMetronome();
            }

            return {
                success: true,
                message: 'Recording resumed',
            };
        }
        return {
            success: false,
            message: 'Not paused',
        };
    }

    /**
     * Stop recording and finalize
     */
    stopRecording() {
        if (this.isRecording) {
            this.isRecording = false;
            this.isPaused = false;
            this.mediaRecorder.stop();
            this.stopMetronome();

            return {
                success: true,
                message: 'Recording stopped',
            };
        }
        return {
            success: false,
            message: 'Not recording',
        };
    }

    /**
     * Finalize recording and create audio blob
     */
    async finalizeRecording() {
        const blob = new Blob(this.recordedChunks, { type: 'audio/webm' });
        const duration = this.audioContext.currentTime - this.startTime - this.totalPauseDuration;

        // Calculate bars and beats
        const beatDuration = 60 / this.currentBPM;
        const totalBeats = duration / beatDuration;
        const bars = Math.floor(totalBeats / this.beatsPerBar);
        const beats = Math.floor(totalBeats % this.beatsPerBar);

        // Create recording object
        const recording = {
            id: Date.now(),
            blob,
            url: URL.createObjectURL(blob),
            duration,
            bpm: this.currentBPM,
            beatsPerBar: this.beatsPerBar,
            bars,
            beats,
            timestamp: new Date().toISOString(),
            name: `Recording ${this.recordings.length + 1}`,
            quantized: this.quantizeEnabled,
            tags: [],
        };

        this.recordings.push(recording);
        await this.saveRecordingToStorage(recording);

        // Dispatch event
        window.dispatchEvent(new CustomEvent('recordingComplete', {
            detail: recording,
        }));

        return recording;
    }

    /**
     * Initialize metronome click
     */
    initializeMetronome() {
        this.metronomeSynth = {
            oscillator: null,
            gain: null,
            interval: null,
        };
    }

    /**
     * Start metronome
     */
    startMetronome() {
        this.stopMetronome();

        const beatDuration = 60 / this.currentBPM;
        let beatCount = 0;

        const playClick = () => {
            const isDownbeat = beatCount % this.beatsPerBar === 0;
            const frequency = isDownbeat ? 1000 : 800;
            const gain = isDownbeat ? 0.3 : 0.15;

            const osc = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            osc.frequency.value = frequency;
            osc.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            gainNode.gain.setValueAtTime(gain, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);

            osc.start(this.audioContext.currentTime);
            osc.stop(this.audioContext.currentTime + 0.05);

            beatCount++;
        };

        playClick(); // First click immediately
        this.metronomeSynth.interval = setInterval(playClick, beatDuration * 1000);
    }

    /**
     * Stop metronome
     */
    stopMetronome() {
        if (this.metronomeSynth.interval) {
            clearInterval(this.metronomeSynth.interval);
            this.metronomeSynth.interval = null;
        }
    }

    /**
     * Get input level for visualization
     */
    getInputLevel() {
        if (!this.analyserNode) return 0;

        const dataArray = new Uint8Array(this.analyserNode.frequencyBinCount);
        this.analyserNode.getByteTimeDomainData(dataArray);

        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
            const normalized = (dataArray[i] - 128) / 128;
            sum += normalized * normalized;
        }

        return Math.sqrt(sum / dataArray.length);
    }

    /**
     * Play recording with beat synchronization
     */
    async playRecording(recordingId, options = {}) {
        const recording = this.recordings.find(r => r.id === recordingId);
        if (!recording) {
            return {
                success: false,
                message: 'Recording not found',
            };
        }

        // Decode audio data
        const arrayBuffer = await recording.blob.arrayBuffer();
        const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

        // Create playback nodes
        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();

        source.buffer = audioBuffer;
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        gainNode.gain.value = options.volume !== undefined ? options.volume : 1.0;

        // Calculate start time (quantized to beat if enabled)
        let startTime = this.audioContext.currentTime;
        if (options.quantize && options.sequencer && options.sequencer.isPlaying) {
            const beatDuration = 60 / (options.bpm || this.currentBPM);
            startTime = Math.ceil(startTime / beatDuration) * beatDuration;
        }

        source.start(startTime);

        // Store reference for stopping
        this.playbackNodes.set(recordingId, {
            source,
            gainNode,
            startTime,
        });

        // Auto-remove after playback
        source.onended = () => {
            this.playbackNodes.delete(recordingId);
        };

        return {
            success: true,
            message: 'Playback started',
            startTime,
            duration: audioBuffer.duration,
        };
    }

    /**
     * Stop recording playback
     */
    stopPlayback(recordingId) {
        const playback = this.playbackNodes.get(recordingId);
        if (playback) {
            playback.source.stop();
            this.playbackNodes.delete(recordingId);
            return { success: true, message: 'Playback stopped' };
        }
        return { success: false, message: 'Recording not playing' };
    }

    /**
     * Schedule recording to play in sync with sequencer
     */
    scheduleRecording(recordingId, options = {}) {
        const recording = this.recordings.find(r => r.id === recordingId);
        if (!recording) {
            return { success: false, message: 'Recording not found' };
        }

        const scheduled = {
            recordingId,
            startBar: options.startBar || 0,
            loop: options.loop || false,
            volume: options.volume || 1.0,
            enabled: true,
        };

        this.scheduledRecordings.push(scheduled);

        return {
            success: true,
            message: 'Recording scheduled',
            scheduled,
        };
    }

    /**
     * Trigger scheduled recordings based on sequencer position
     */
    triggerScheduledRecordings(currentBar, sequencer) {
        this.scheduledRecordings.forEach(scheduled => {
            if (!scheduled.enabled) return;

            if (currentBar === scheduled.startBar) {
                this.playRecording(scheduled.recordingId, {
                    volume: scheduled.volume,
                    quantize: true,
                    sequencer,
                });
            }
        });
    }

    /**
     * Delete recording
     */
    deleteRecording(recordingId) {
        const index = this.recordings.findIndex(r => r.id === recordingId);
        if (index !== -1) {
            URL.revokeObjectURL(this.recordings[index].url);
            this.recordings.splice(index, 1);
            this.saveAllRecordingsToStorage();
            return { success: true, message: 'Recording deleted' };
        }
        return { success: false, message: 'Recording not found' };
    }

    /**
     * Rename recording
     */
    renameRecording(recordingId, newName) {
        const recording = this.recordings.find(r => r.id === recordingId);
        if (recording) {
            recording.name = newName;
            this.saveAllRecordingsToStorage();
            return { success: true, message: 'Recording renamed' };
        }
        return { success: false, message: 'Recording not found' };
    }

    /**
     * Add tags to recording
     */
    addTags(recordingId, tags) {
        const recording = this.recordings.find(r => r.id === recordingId);
        if (recording) {
            recording.tags = [...new Set([...recording.tags, ...tags])];
            this.saveAllRecordingsToStorage();
            return { success: true, message: 'Tags added' };
        }
        return { success: false, message: 'Recording not found' };
    }

    /**
     * Export recording as WAV
     */
    async exportRecording(recordingId, format = 'webm') {
        const recording = this.recordings.find(r => r.id === recordingId);
        if (!recording) {
            return { success: false, message: 'Recording not found' };
        }

        const link = document.createElement('a');
        link.href = recording.url;
        link.download = `${recording.name}.${format}`;
        link.click();

        return {
            success: true,
            message: 'Recording exported',
        };
    }

    /**
     * Save recording metadata to localStorage
     */
    async saveRecordingToStorage(recording) {
        try {
            // Convert blob to base64 for storage
            const reader = new FileReader();
            reader.readAsDataURL(recording.blob);

            return new Promise((resolve) => {
                reader.onloadend = () => {
                    const recordings = this.getStoredRecordings();
                    recordings.push({
                        id: recording.id,
                        name: recording.name,
                        duration: recording.duration,
                        bpm: recording.bpm,
                        beatsPerBar: recording.beatsPerBar,
                        bars: recording.bars,
                        beats: recording.beats,
                        timestamp: recording.timestamp,
                        quantized: recording.quantized,
                        tags: recording.tags,
                        data: reader.result,
                    });

                    localStorage.setItem(this.storageKey, JSON.stringify(recordings));
                    resolve();
                };
            });
        } catch (error) {
            console.error('Failed to save recording:', error);
        }
    }

    /**
     * Load recordings from localStorage
     */
    loadRecordingsFromStorage() {
        try {
            const recordings = this.getStoredRecordings();

            recordings.forEach(stored => {
                // Convert base64 back to blob
                fetch(stored.data)
                    .then(res => res.blob())
                    .then(blob => {
                        const recording = {
                            id: stored.id,
                            blob,
                            url: URL.createObjectURL(blob),
                            name: stored.name,
                            duration: stored.duration,
                            bpm: stored.bpm,
                            beatsPerBar: stored.beatsPerBar,
                            bars: stored.bars,
                            beats: stored.beats,
                            timestamp: stored.timestamp,
                            quantized: stored.quantized,
                            tags: stored.tags,
                        };

                        this.recordings.push(recording);
                    });
            });
        } catch (error) {
            console.error('Failed to load recordings:', error);
        }
    }

    /**
     * Get stored recordings from localStorage
     */
    getStoredRecordings() {
        const stored = localStorage.getItem(this.storageKey);
        return stored ? JSON.parse(stored) : [];
    }

    /**
     * Save all recordings to storage
     */
    saveAllRecordingsToStorage() {
        try {
            const recordings = this.recordings.map(r => ({
                id: r.id,
                name: r.name,
                duration: r.duration,
                bpm: r.bpm,
                beatsPerBar: r.beatsPerBar,
                bars: r.bars,
                beats: r.beats,
                timestamp: r.timestamp,
                quantized: r.quantized,
                tags: r.tags,
            }));

            localStorage.setItem(this.storageKey, JSON.stringify(recordings));
        } catch (error) {
            console.error('Failed to save recordings:', error);
        }
    }

    /**
     * Get all recordings
     */
    getAllRecordings() {
        return this.recordings;
    }

    /**
     * Get recording by ID
     */
    getRecording(recordingId) {
        return this.recordings.find(r => r.id === recordingId);
    }

    /**
     * Clear all recordings
     */
    clearAllRecordings() {
        this.recordings.forEach(r => URL.revokeObjectURL(r.url));
        this.recordings = [];
        localStorage.removeItem(this.storageKey);
        return { success: true, message: 'All recordings cleared' };
    }

    /**
     * Enable/disable monitoring (hearing yourself)
     */
    setMonitoring(enabled) {
        if (!this.gainNode) return;

        if (enabled) {
            this.gainNode.connect(this.audioContext.destination);
        } else {
            this.gainNode.disconnect(this.audioContext.destination);
        }
    }

    /**
     * Set input gain
     */
    setInputGain(gain) {
        if (this.gainNode) {
            this.gainNode.gain.value = gain;
        }
    }

    /**
     * Clean up resources
     */
    destroy() {
        this.stopRecording();
        this.stopMetronome();

        if (this.inputNode) {
            this.inputNode.disconnect();
        }

        if (this.mediaRecorder && this.mediaRecorder.stream) {
            this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
        }

        this.playbackNodes.forEach(playback => {
            playback.source.stop();
        });
        this.playbackNodes.clear();
    }
}

export default AudioRecorder;
