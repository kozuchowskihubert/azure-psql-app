/**
 * Sequencer Module
 * 16-step pattern sequencer with quantization
 */

class Sequencer {
    constructor(coreEngine) {
        this.coreEngine = coreEngine;
        this.context = coreEngine.audioContext;
        
        this.bpm = 128;
        this.steps = 16;
        this.currentStep = 0;
        this.isPlaying = false;
        this.intervalId = null;
        
        // Pattern storage
        this.patterns = {
            bass: [],
            drums: []
        };
    }
    
    // Start playback
    start() {
        if (this.isPlaying) return;
        
        this.isPlaying = true;
        this.currentStep = 0;
        
        const stepDuration = (60 / this.bpm) * 1000 / 4; // 16th notes
        
        this.intervalId = setInterval(() => {
            this.tick();
            this.currentStep = (this.currentStep + 1) % this.steps;
        }, stepDuration);
        
        console.log('Sequencer started at', this.bpm, 'BPM');
    }
    
    // Stop playback
    stop() {
        if (!this.isPlaying) return;
        
        this.isPlaying = false;
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        
        this.currentStep = 0;
        console.log('Sequencer stopped');
    }
    
    // Process current step
    tick() {
        // Trigger notes/drums for current step
        const step = this.currentStep;
        
        // Check bass pattern
        if (this.patterns.bass && this.patterns.bass[step]) {
            const note = this.patterns.bass[step];
            if (note.active && this.onBassNote) {
                this.onBassNote(note);
            }
        }
        
        // Check drum pattern
        if (this.patterns.drums && this.patterns.drums[step]) {
            const drums = this.patterns.drums[step];
            if (this.onDrums) {
                this.onDrums(drums);
            }
        }
        
        // Callback for UI updates
        if (this.onStep) {
            this.onStep(step);
        }
    }
    
    // Set pattern
    setPattern(type, pattern) {
        this.patterns[type] = pattern;
    }
    
    // Set BPM
    setBPM(bpm) {
        const wasPlaying = this.isPlaying;
        if (wasPlaying) this.stop();
        
        this.bpm = bpm;
        
        if (wasPlaying) this.start();
    }
    
    // Clear pattern
    clear() {
        this.patterns = {
            bass: [],
            drums: []
        };
    }
}

// Make available globally
window.Sequencer = Sequencer;
