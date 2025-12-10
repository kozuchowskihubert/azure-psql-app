/**
 * HAOS Platform - Waveshaper Module
 * Distortion and saturation effect using waveshaping
 * 
 * @version 1.0.0
 * @category effects
 * @tier free
 */

class WaveshaperModule extends AudioModule {
    constructor(name = 'Waveshaper', category = 'effects', options = {}) {
        super(name, category, {
            tier: 'free',
            cpuRating: 'light',
            version: '1.0.0',
            author: 'HAOS Platform',
            description: 'Distortion and saturation effect with multiple waveshaping curves',
            icon: '✨',
            tags: ['distortion', 'saturation', 'overdrive', 'fuzz'],
            ...options
        });

        // Default parameters
        this.setParam('drive', 1.0);      // 0-10 (amount of distortion)
        this.setParam('output', 0.5);     // 0-1 (output volume)
        this.setParam('curve', 'soft');   // soft, hard, asymmetric, foldback
        this.setParam('mix', 1.0);        // 0-1 (dry/wet mix)
    }

    async createAudioGraph() {
        if (!this.audioContext) {
            throw new Error('[Waveshaper] AudioContext required');
        }

        // Create nodes
        this.inputNode = this.audioContext.createGain();
        this.dryNode = this.audioContext.createGain();
        this.wetNode = this.audioContext.createGain();
        this.waveshaper = this.audioContext.createWaveShaper();
        this.preGain = this.audioContext.createGain();
        this.postGain = this.audioContext.createGain();
        this.outputNode = this.audioContext.createGain();

        // Set initial values
        this.updateCurve();
        this.updateMix();
        this.preGain.gain.value = this.getParam('drive');
        this.postGain.gain.value = this.getParam('output');

        // Connect audio graph
        // Dry path
        this.inputNode.connect(this.dryNode);
        this.dryNode.connect(this.outputNode);

        // Wet path (processed)
        this.inputNode.connect(this.preGain);
        this.preGain.connect(this.waveshaper);
        this.waveshaper.connect(this.postGain);
        this.postGain.connect(this.wetNode);
        this.wetNode.connect(this.outputNode);

        console.log('[Waveshaper] Audio graph created');
    }

    /**
     * Generate waveshaping curve based on selected algorithm
     */
    updateCurve() {
        const curve = this.getParam('curve');
        const samples = 1024;
        const curveData = new Float32Array(samples);

        for (let i = 0; i < samples; i++) {
            const x = (i / samples) * 2 - 1; // -1 to 1

            switch (curve) {
                case 'soft':
                    // Soft clipping (tanh-like)
                    curveData[i] = Math.tanh(x * 2) * 0.9;
                    break;

                case 'hard':
                    // Hard clipping
                    curveData[i] = Math.max(-0.9, Math.min(0.9, x * 1.5));
                    break;

                case 'asymmetric':
                    // Asymmetric distortion (more harmonics)
                    curveData[i] = x > 0 
                        ? Math.pow(x, 0.7) * 0.9
                        : Math.pow(Math.abs(x), 1.3) * -0.9;
                    break;

                case 'foldback':
                    // Foldback distortion
                    let folded = x * 2;
                    while (Math.abs(folded) > 1) {
                        folded = folded > 1 ? 2 - folded : -2 - folded;
                    }
                    curveData[i] = folded * 0.9;
                    break;

                default:
                    curveData[i] = x; // Bypass
            }
        }

        this.waveshaper.curve = curveData;
        this.waveshaper.oversample = '4x'; // High quality
    }

    /**
     * Update dry/wet mix
     */
    updateMix() {
        const mix = this.getParam('mix');
        
        // Equal power crossfade
        const dryGain = Math.cos(mix * Math.PI / 2);
        const wetGain = Math.sin(mix * Math.PI / 2);
        
        this.dryNode.gain.setValueAtTime(dryGain, this.audioContext.currentTime);
        this.wetNode.gain.setValueAtTime(wetGain, this.audioContext.currentTime);
    }

    /**
     * Parameter setters with audio graph updates
     */
    setDrive(value) {
        const clampedValue = Math.max(0, Math.min(10, value));
        if (this.preGain && this.audioContext) {
            this.preGain.gain.setValueAtTime(clampedValue, this.audioContext.currentTime);
        }
    }

    setOutput(value) {
        const clampedValue = Math.max(0, Math.min(1, value));
        if (this.postGain && this.audioContext) {
            this.postGain.gain.setValueAtTime(clampedValue, this.audioContext.currentTime);
        }
    }

    setCurve(value) {
        if (['soft', 'hard', 'asymmetric', 'foldback'].includes(value)) {
            if (this.waveshaper) {
                this.updateCurve();
            }
        }
    }

    setMix(value) {
        const clampedValue = Math.max(0, Math.min(1, value));
        this.parameters.set('mix', clampedValue);
        if (this.dryNode && this.wetNode && this.audioContext) {
            this.updateMix();
        }
    }

    /**
     * Get UI-friendly parameter info
     */
    getParameterInfo() {
        return {
            drive: {
                name: 'Drive',
                value: this.getParam('drive'),
                min: 0,
                max: 10,
                step: 0.1,
                unit: '',
                description: 'Amount of distortion'
            },
            output: {
                name: 'Output',
                value: this.getParam('output'),
                min: 0,
                max: 1,
                step: 0.01,
                unit: '',
                description: 'Output volume level'
            },
            curve: {
                name: 'Curve Type',
                value: this.getParam('curve'),
                options: ['soft', 'hard', 'asymmetric', 'foldback'],
                description: 'Waveshaping algorithm'
            },
            mix: {
                name: 'Mix',
                value: this.getParam('mix'),
                min: 0,
                max: 1,
                step: 0.01,
                unit: '%',
                description: 'Dry/wet balance'
            }
        };
    }
}

// Register module in the global registry
if (typeof window !== 'undefined' && window.ModuleRegistry) {
    window.ModuleRegistry.register('Waveshaper', WaveshaperModule, {
        category: 'effects',
        tier: 'free',
        cpuRating: 'light',
        version: '1.0.0',
        author: 'HAOS Platform',
        description: 'Distortion and saturation effect with multiple waveshaping curves',
        icon: '✨',
        tags: ['distortion', 'saturation', 'overdrive', 'fuzz']
    });
}
