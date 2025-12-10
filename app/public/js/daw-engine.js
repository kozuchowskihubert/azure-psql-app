/**
 * HAOS.fm DAW Engine
 * Complete Digital Audio Workstation System
 *
 * Features:
 * - Multi-track recording and playback
 * - Real-time synthesis integration
 * - Patch verification and validation
 * - Enhanced modulation routing
 * - MIDI-like sequencing
 * - Mixer with effects
 * - Session management
 */

class DAWEngine {
    constructor(audioContext) {
        this.audioContext = audioContext;

        // Synth instances (will be set externally)
        this.synths = {
            tb303: null,
            tr808: null,
            tr909: null,
            arp2600: null,
            stringMachine: null,
        };

        // Transport
        this.transport = {
            playing: false,
            recording: false,
            bpm: 130,
            timeSignature: [4, 4],
            currentBar: 0,
            currentBeat: 0,
            currentTick: 0,
            loopStart: 0,
            loopEnd: 16,
            loopEnabled: false,
        };

        // Tracks
        this.tracks = [];
        this.maxTracks = 16;

        // Master bus
        this.masterBus = {
            gainNode: this.audioContext.createGain(),
            compressor: this.audioContext.createDynamicsCompressor(),
            analyser: this.audioContext.createAnalyser(),
        };

        // Setup master chain
        this.masterBus.gainNode.connect(this.masterBus.compressor);
        this.masterBus.compressor.connect(this.masterBus.analyser);
        this.masterBus.analyser.connect(this.audioContext.destination);
        this.masterBus.gainNode.gain.value = 0.8;

        // Compressor settings
        this.masterBus.compressor.threshold.value = -20;
        this.masterBus.compressor.knee.value = 10;
        this.masterBus.compressor.ratio.value = 4;
        this.masterBus.compressor.attack.value = 0.003;
        this.masterBus.compressor.release.value = 0.25;

        // Analyser settings
        this.masterBus.analyser.fftSize = 2048;

        // Modulation matrix
        this.modulationMatrix = {
            connections: [],
            sources: ['lfo1', 'lfo2', 'env1', 'env2', 'sequencer', 'midi'],
            destinations: ['pitch', 'filter', 'amplitude', 'pan', 'fx'],
        };

        // Patch validation
        this.patchValidator = {
            verified: false,
            errors: [],
            warnings: [],
        };

        // Session data
        this.session = {
            name: 'Untitled Session',
            created: Date.now(),
            modified: Date.now(),
            tempo: 130,
            key: 'C',
            scale: 'minor',
        };

        // Scheduling
        this.scheduler = {
            lookahead: 25.0, // ms
            scheduleAheadTime: 0.1, // s
            nextNoteTime: 0.0,
            currentNote: 0,
            timerID: null,
        };

        // Initialize default tracks
        this.initializeTracks();
    }

    /**
     * Initialize default track setup
     */
    initializeTracks() {
        // Track 1: TB-303 Bass
        this.addTrack({
            name: 'Acid Bass',
            type: 'synth',
            synth: 'tb303',
            color: '#39FF14',
            muted: false,
            solo: false,
            volume: 0.8,
            pan: 0,
            pattern: [],
            effects: [],
        });

        // Track 2: TR-808 Drums
        this.addTrack({
            name: 'Drums',
            type: 'drums',
            synth: 'tr808',
            color: '#FF6B35',
            muted: false,
            solo: false,
            volume: 0.9,
            pan: 0,
            pattern: [],
            effects: [],
        });

        // Track 3: ARP-2600 Lead
        this.addTrack({
            name: 'Modular Lead',
            type: 'synth',
            synth: 'arp2600',
            color: '#00D9FF',
            muted: false,
            solo: false,
            volume: 0.7,
            pan: 0.2,
            pattern: [],
            effects: [],
        });

        // Track 4: String Machine Pad
        this.addTrack({
            name: 'String Pad',
            type: 'synth',
            synth: 'stringMachine',
            color: '#FFD700',
            muted: false,
            solo: false,
            volume: 0.6,
            pan: -0.2,
            pattern: [],
            effects: [],
        });
    }

    /**
     * Add new track
     */
    addTrack(trackData) {
        if (this.tracks.length >= this.maxTracks) {
            console.warn('Maximum tracks reached');
            return null;
        }

        const track = {
            id: this.tracks.length,
            name: trackData.name || `Track ${this.tracks.length + 1}`,
            type: trackData.type || 'synth',
            synth: trackData.synth || null,
            color: trackData.color || '#FFFFFF',
            muted: trackData.muted || false,
            solo: trackData.solo || false,
            volume: trackData.volume || 0.8,
            pan: trackData.pan || 0,
            pattern: trackData.pattern || [],
            effects: trackData.effects || [],
            gainNode: this.audioContext.createGain(),
            panNode: this.audioContext.createStereoPanner(),
            clips: [],
            automation: [],
        };

        // Setup audio chain
        track.gainNode.gain.value = track.volume;
        track.panNode.pan.value = track.pan;
        track.gainNode.connect(track.panNode);
        track.panNode.connect(this.masterBus.gainNode);

        this.tracks.push(track);
        return track.id;
    }

    /**
     * Set synth instances
     */
    setSynths(synthInstances) {
        this.synths = { ...this.synths, ...synthInstances };
        this.verifyPatches();
    }

    /**
     * Verify all synth patches and connections
     */
    verifyPatches() {
        this.patchValidator.errors = [];
        this.patchValidator.warnings = [];

        // Check TB-303
        if (this.synths.tb303) {
            const tb303Checks = this.verifyTB303();
            this.patchValidator.errors.push(...tb303Checks.errors);
            this.patchValidator.warnings.push(...tb303Checks.warnings);
        }

        // Check TR-808
        if (this.synths.tr808) {
            const tr808Checks = this.verifyTR808();
            this.patchValidator.errors.push(...tr808Checks.errors);
            this.patchValidator.warnings.push(...tr808Checks.warnings);
        }

        // Check ARP-2600
        if (this.synths.arp2600) {
            const arpChecks = this.verifyARP2600();
            this.patchValidator.errors.push(...arpChecks.errors);
            this.patchValidator.warnings.push(...arpChecks.warnings);
        }

        this.patchValidator.verified = this.patchValidator.errors.length === 0;

        return {
            verified: this.patchValidator.verified,
            errors: this.patchValidator.errors,
            warnings: this.patchValidator.warnings,
        };
    }

    /**
     * Verify TB-303 patch
     */
    verifyTB303() {
        const errors = [];
        const warnings = [];
        const synth = this.synths.tb303;

        // Check filter settings
        if (synth.params.cutoff < 50) {
            warnings.push('TB-303: Cutoff very low - may result in muffled sound');
        }
        if (synth.params.cutoff > 5000) {
            warnings.push('TB-303: Cutoff very high - filter may have no effect');
        }

        // Check resonance
        if (synth.params.resonance > 20) {
            warnings.push('TB-303: High resonance may cause self-oscillation');
        }

        // Check envelope modulation
        if (synth.params.envMod < 10) {
            warnings.push('TB-303: Low envelope modulation - classic acid sound needs 50-80%');
        }

        // Check pattern
        const activeSteps = synth.pattern.filter(s => s.active).length;
        if (activeSteps === 0) {
            warnings.push('TB-303: No active steps in pattern');
        }

        // Check for accents
        const hasAccents = synth.pattern.some(s => s.active && s.accent);
        if (!hasAccents && activeSteps > 0) {
            warnings.push('TB-303: No accents - pattern may sound flat');
        }

        return { errors, warnings };
    }

    /**
     * Verify TR-808 patch
     */
    verifyTR808() {
        const errors = [];
        const warnings = [];
        const synth = this.synths.tr808;

        // Check master volume
        if (synth.masterVolume < 0.3) {
            warnings.push('TR-808: Master volume very low');
        }
        if (synth.masterVolume > 0.95) {
            warnings.push('TR-808: Master volume very high - may clip');
        }

        // Verify all drum variations are valid
        const validVariations = {
            kick: ['classic', 'deep', 'punchy', 'sub', 'acid', 'minimal', 'fm', 'distorted'],
            hat: ['classic', 'open', 'closed', 'tight', 'loose', 'metallic'],
            clap: ['classic', 'tight', 'reverb', 'layered'],
            perc: ['classic', 'conga', 'rim', 'cowbell'],
            ride: ['classic', 'crash', 'bell'],
            crash: ['classic', 'splash', 'reverse'],
        };

        Object.entries(synth.currentVariations).forEach(([drum, variation]) => {
            if (validVariations[drum] && !validVariations[drum].includes(variation)) {
                errors.push(`TR-808: Invalid ${drum} variation: ${variation}`);
            }
        });

        return { errors, warnings };
    }

    /**
     * Verify ARP-2600 patch with enhanced modulation checks
     */
    verifyARP2600() {
        const errors = [];
        const warnings = [];
        const synth = this.synths.arp2600;

        // Check oscillator configuration
        const enabledOscs = [synth.vco1.enabled, synth.vco2.enabled, synth.vco3.enabled].filter(Boolean).length;
        if (enabledOscs === 0) {
            errors.push('ARP-2600: No oscillators enabled - no sound will be produced');
        }

        // Check filter settings
        if (synth.vcf.cutoff < 100) {
            warnings.push('ARP-2600: Very low filter cutoff - sound may be inaudible');
        }
        if (synth.vcf.resonance > 15) {
            warnings.push('ARP-2600: High filter resonance may cause self-oscillation or instability');
        }

        // Check envelope
        if (synth.envelope.attack + synth.envelope.decay > 5) {
            warnings.push('ARP-2600: Very long envelope - may cause legato issues');
        }
        if (synth.envelope.sustain < 0.1 && synth.vca.mode === 'envelope') {
            warnings.push('ARP-2600: Low sustain level - notes may be very quiet');
        }

        // Check LFO
        if (synth.lfo.amount > 0.5 && synth.lfo.rate > 20) {
            warnings.push('ARP-2600: Fast LFO with high amount may cause harsh modulation');
        }

        // Check external modulation
        if (synth.externalMod.enabled && !synth.externalMod.source) {
            errors.push('ARP-2600: External modulation enabled but no source connected');
        }

        // Verify patch connections
        synth.patches.forEach((patch, index) => {
            const validSources = ['vco1', 'vco2', 'vco3', 'lfo', 'envelope', 'noise', 'ringmod', 'sh'];
            const validDestinations = ['vco1_pitch', 'vco2_pitch', 'vco3_pitch', 'vcf_cutoff', 'vcf_resonance', 'vca_level'];

            if (!validSources.includes(patch.source)) {
                errors.push(`ARP-2600: Invalid patch source at index ${index}: ${patch.source}`);
            }
            if (!validDestinations.includes(patch.destination)) {
                errors.push(`ARP-2600: Invalid patch destination at index ${index}: ${patch.destination}`);
            }
            if (patch.amount < 0 || patch.amount > 1) {
                warnings.push(`ARP-2600: Patch amount out of range at index ${index}: ${patch.amount}`);
            }
        });

        return { errors, warnings };
    }

    /**
     * Enhanced modulation for TB-303
     */
    addTB303Modulation(source, destination, amount, shape = 'linear') {
        if (!this.synths.tb303) return false;

        const mod = {
            synth: 'tb303',
            source,
            destination,
            amount,
            shape,
            active: true,
        };

        this.modulationMatrix.connections.push(mod);
        return true;
    }

    /**
     * Enhanced modulation for TR-808
     */
    addTR808Modulation(drum, parameter, source, amount) {
        if (!this.synths.tr808) return false;

        const mod = {
            synth: 'tr808',
            drum,
            parameter,
            source,
            amount,
            active: true,
        };

        this.modulationMatrix.connections.push(mod);
        return true;
    }

    /**
     * Enhanced modulation for ARP-2600
     */
    addARP2600Modulation(source, destination, amount, mode = 'add') {
        if (!this.synths.arp2600) return false;

        // Validate source
        const validSources = ['lfo', 'env1', 'env2', 'vco3', 'noise', 'external'];
        if (!validSources.includes(source)) {
            console.error(`Invalid modulation source: ${source}`);
            return false;
        }

        // Validate destination
        const validDestinations = ['vco1_pitch', 'vco2_pitch', 'vco3_pitch', 'vcf_cutoff', 'vcf_resonance', 'vca_level', 'pan'];
        if (!validDestinations.includes(destination)) {
            console.error(`Invalid modulation destination: ${destination}`);
            return false;
        }

        const mod = {
            synth: 'arp2600',
            source,
            destination,
            amount: Math.max(0, Math.min(1, amount)),
            mode, // 'add', 'multiply', 'replace'
            active: true,
        };

        this.modulationMatrix.connections.push(mod);

        // Add as patch cable in ARP-2600
        this.synths.arp2600.addPatch(source, destination, amount);

        return true;
    }

    /**
     * Start transport
     */
    play() {
        if (this.transport.playing) return;

        this.transport.playing = true;
        this.scheduler.currentNote = 0;
        this.scheduler.nextNoteTime = this.audioContext.currentTime;
        this.scheduleNotes();
    }

    /**
     * Stop transport
     */
    stop() {
        this.transport.playing = false;
        if (this.scheduler.timerID) {
            clearTimeout(this.scheduler.timerID);
        }
        this.transport.currentBar = 0;
        this.transport.currentBeat = 0;
        this.transport.currentTick = 0;
    }

    /**
     * Pause transport
     */
    pause() {
        this.transport.playing = false;
        if (this.scheduler.timerID) {
            clearTimeout(this.scheduler.timerID);
        }
    }

    /**
     * Schedule notes (main sequencer loop)
     */
    scheduleNotes() {
        const secondsPerBeat = 60.0 / this.transport.bpm;

        while (this.scheduler.nextNoteTime < this.audioContext.currentTime + this.scheduler.scheduleAheadTime) {
            this.playNotesAtTime(this.scheduler.currentNote, this.scheduler.nextNoteTime);
            this.advanceNote();
        }

        if (this.transport.playing) {
            this.scheduler.timerID = setTimeout(() => this.scheduleNotes(), this.scheduler.lookahead);
        }
    }

    /**
     * Play all active notes at scheduled time
     */
    playNotesAtTime(stepNumber, time) {
        this.tracks.forEach(track => {
            if (track.muted) return;

            const step = track.pattern[stepNumber];
            if (!step || !step.active) return;

            // Get synth instance
            const synth = this.synths[track.synth];
            if (!synth) return;

            // Play note based on synth type
            if (track.synth === 'tb303') {
                synth.playNote(step.note, time);
            } else if (track.synth === 'tr808') {
                if (step.drum) {
                    synth[`play${step.drum.charAt(0).toUpperCase() + step.drum.slice(1)}`](null, time);
                }
            } else if (track.synth === 'tr909') {
                if (step.drum) {
                    // TR-909 uses playKick, playSnare, etc. similar to 808
                    const method = `play${step.drum.charAt(0).toUpperCase() + step.drum.slice(1)}`;
                    if (typeof synth[method] === 'function') {
                        synth[method](null, time);
                    }
                }
            } else if (track.synth === 'arp2600') {
                const freq = this.noteToFrequency(step.note);
                synth.playNote(freq, step.duration || 0.5, step.velocity || 1.0, time);
            }
        });
    }

    /**
     * Advance note counter
     */
    advanceNote() {
        const secondsPerBeat = 60.0 / this.transport.bpm;
        const secondsPerStep = secondsPerBeat / 4; // 16th notes

        this.scheduler.nextNoteTime += secondsPerStep;
        this.scheduler.currentNote++;

        // Loop if needed
        if (this.transport.loopEnabled && this.scheduler.currentNote >= this.transport.loopEnd) {
            this.scheduler.currentNote = this.transport.loopStart;
        }

        // Update position
        this.transport.currentTick = this.scheduler.currentNote % 4;
        this.transport.currentBeat = Math.floor(this.scheduler.currentNote / 4) % this.transport.timeSignature[0];
        this.transport.currentBar = Math.floor(this.scheduler.currentNote / (4 * this.transport.timeSignature[0]));
    }

    /**
     * Convert note name to frequency
     */
    noteToFrequency(note) {
        const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const octave = parseInt(note.slice(-1));
        const noteName = note.slice(0, -1);
        const semitone = notes.indexOf(noteName);
        return 440 * 2 ** ((octave - 4) + (semitone - 9) / 12);
    }

    /**
     * Set BPM
     */
    setBPM(bpm) {
        this.transport.bpm = Math.max(40, Math.min(300, bpm));
        this.session.tempo = this.transport.bpm;
    }

    /**
     * Get master level (for VU meter)
     */
    getMasterLevel() {
        const dataArray = new Uint8Array(this.masterBus.analyser.frequencyBinCount);
        this.masterBus.analyser.getByteTimeDomainData(dataArray);

        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
            const normalized = (dataArray[i] - 128) / 128;
            sum += normalized * normalized;
        }
        const rms = Math.sqrt(sum / dataArray.length);
        return rms;
    }

    /**
     * Export session
     */
    exportSession() {
        return {
            session: this.session,
            transport: this.transport,
            tracks: this.tracks.map(t => ({
                name: t.name,
                type: t.type,
                synth: t.synth,
                color: t.color,
                volume: t.volume,
                pan: t.pan,
                pattern: t.pattern,
                effects: t.effects,
            })),
            modulation: this.modulationMatrix.connections,
            patchValidation: this.patchValidator,
        };
    }

    /**
     * Import session
     */
    importSession(sessionData) {
        this.session = sessionData.session;
        this.transport = sessionData.transport;
        this.modulationMatrix.connections = sessionData.modulation || [];

        // Recreate tracks
        this.tracks = [];
        sessionData.tracks.forEach(trackData => {
            this.addTrack(trackData);
        });

        this.verifyPatches();
    }
}
