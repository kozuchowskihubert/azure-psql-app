// Behringer 2600 Synthesizer Interactive Visualizer
// JavaScript for waveform rendering, patch routing, and ARP sequencer

class Synth2600 {
    constructor() {
        this.arpSequencer = {
            isPlaying: false,
            currentStep: 0,
            steps: Array(16).fill(false),
            tempo: 120,
            intervalId: null
        };
        
        this.patchMatrix = {
            connections: [],
            selectedOutput: null
        };
        
        this.init();
    }

    init() {
        this.setupWaveforms();
        this.setupKnobs();
        this.setupPatchMatrix();
        this.setupArpSequencer();
        this.setupPresets();
    }

    // ========================================
    // Waveform Visualization
    // ========================================
    setupWaveforms() {
        this.drawWaveform('vco1-wave', 'sawtooth', '#00d4ff');
        this.drawWaveform('vco2-wave', 'square', '#ff00ff');
        this.drawWaveform('vco3-wave', 'triangle', '#00ff88');

        // Animate waveforms
        setInterval(() => {
            this.animateWaveforms();
        }, 50);
    }

    drawWaveform(canvasId, type, color) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        const width = canvas.width;
        const height = canvas.height;
        const centerY = height / 2;
        const amplitude = height * 0.4;

        ctx.clearRect(0, 0, width, height);
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 10;
        ctx.shadowColor = color;

        ctx.beginPath();

        for (let x = 0; x < width; x++) {
            const progress = x / width;
            let y;

            switch (type) {
                case 'sawtooth':
                    y = centerY - amplitude * (2 * (progress % 1) - 1);
                    break;
                case 'square':
                    y = centerY - amplitude * (progress % 1 < 0.5 ? 1 : -1);
                    break;
                case 'triangle':
                    const t = progress % 1;
                    y = centerY - amplitude * (t < 0.5 ? 4 * t - 1 : -4 * t + 3);
                    break;
                case 'sine':
                    y = centerY - amplitude * Math.sin(progress * Math.PI * 4);
                    break;
                default:
                    y = centerY;
            }

            if (x === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }

        ctx.stroke();

        // Grid lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        ctx.shadowBlur = 0;
        
        ctx.beginPath();
        ctx.moveTo(0, centerY);
        ctx.lineTo(width, centerY);
        ctx.stroke();
    }

    animateWaveforms() {
        // Add subtle animation to waveforms
        const offset = Date.now() * 0.001;
        
        ['vco1-wave', 'vco2-wave', 'vco3-wave'].forEach((id, index) => {
            const canvas = document.getElementById(id);
            if (canvas) {
                const ctx = canvas.getContext('2d');
                ctx.globalAlpha = 0.8 + Math.sin(offset + index) * 0.2;
            }
        });
    }

    // ========================================
    // Interactive Knobs
    // ========================================
    setupKnobs() {
        const knobs = document.querySelectorAll('.knob-visual');
        
        knobs.forEach(knob => {
            let isDragging = false;
            let startY = 0;
            let startRotation = 0;

            knob.addEventListener('mousedown', (e) => {
                isDragging = true;
                startY = e.clientY;
                const indicator = knob.querySelector('.knob-indicator');
                const transform = indicator.style.transform;
                const match = transform.match(/rotate\((-?\d+)deg\)/);
                startRotation = match ? parseInt(match[1]) : 0;
            });

            document.addEventListener('mousemove', (e) => {
                if (!isDragging) return;

                const deltaY = startY - e.clientY;
                let newRotation = startRotation + deltaY;
                
                // Clamp rotation between -140 and 140 degrees
                newRotation = Math.max(-140, Math.min(140, newRotation));

                const indicator = knob.querySelector('.knob-indicator');
                indicator.style.transform = `translateX(-50%) rotate(${newRotation}deg)`;

                // Update value display
                const valueElement = knob.parentElement.querySelector('.knob-value');
                const label = knob.parentElement.querySelector('.knob-label').textContent;
                
                this.updateKnobValue(label, newRotation, valueElement);
            });

            document.addEventListener('mouseup', () => {
                isDragging = false;
            });
        });
    }

    updateKnobValue(label, rotation, valueElement) {
        const normalized = (rotation + 140) / 280; // 0 to 1
        
        switch (label) {
            case 'Frequency':
                const freq = Math.round(50 + normalized * 2000);
                valueElement.textContent = `${freq} Hz`;
                break;
            case 'Fine Tune':
                const cents = Math.round((normalized - 0.5) * 100);
                valueElement.textContent = `${cents > 0 ? '+' : ''}${cents}¢`;
                break;
            case 'PWM':
            case 'Depth':
                const percent = Math.round(normalized * 100);
                valueElement.textContent = `${percent}%`;
                break;
            case 'Resonance':
                const res = (normalized * 10).toFixed(1);
                valueElement.textContent = res;
                break;
            case 'Cutoff':
                const cutoff = Math.round(20 + normalized * 18000);
                valueElement.textContent = `${cutoff} Hz`;
                break;
            case 'Rate':
                const rate = (0.1 + normalized * 20).toFixed(1);
                valueElement.textContent = `${rate} Hz`;
                break;
            case 'Envelope':
                const env = Math.round((normalized - 0.5) * 200);
                valueElement.textContent = `${env > 0 ? '+' : ''}${env}%`;
                break;
            default:
                valueElement.textContent = Math.round(normalized * 100);
        }
    }

    // ========================================
    // Patch Matrix
    // ========================================
    setupPatchMatrix() {
        const outputs = document.querySelectorAll('[data-type="output"]');
        const inputs = document.querySelectorAll('[data-type="input"]');

        outputs.forEach(output => {
            output.addEventListener('click', () => {
                if (this.patchMatrix.selectedOutput === output) {
                    // Deselect
                    this.patchMatrix.selectedOutput = null;
                    output.classList.remove('active');
                } else {
                    // Select output
                    outputs.forEach(o => o.classList.remove('active'));
                    this.patchMatrix.selectedOutput = output;
                    output.classList.add('active');
                }
            });
        });

        inputs.forEach(input => {
            input.addEventListener('click', () => {
                if (this.patchMatrix.selectedOutput) {
                    // Create connection
                    const connection = {
                        from: this.patchMatrix.selectedOutput.dataset.signal,
                        to: input.dataset.signal
                    };

                    // Check if connection already exists
                    const exists = this.patchMatrix.connections.some(
                        c => c.from === connection.from && c.to === connection.to
                    );

                    if (exists) {
                        // Remove connection
                        this.patchMatrix.connections = this.patchMatrix.connections.filter(
                            c => !(c.from === connection.from && c.to === connection.to)
                        );
                        input.querySelector('.patch-jack').classList.remove('connected');
                    } else {
                        // Add connection
                        this.patchMatrix.connections.push(connection);
                        input.querySelector('.patch-jack').classList.add('connected');
                    }

                    this.patchMatrix.selectedOutput.querySelector('.patch-jack').classList.add('connected');
                    this.patchMatrix.selectedOutput.classList.remove('active');
                    this.patchMatrix.selectedOutput = null;

                    console.log('Patch connections:', this.patchMatrix.connections);
                }
            });
        });
    }

    // ========================================
    // ARP Sequencer
    // ========================================
    setupArpSequencer() {
        const playBtn = document.getElementById('arp-play');
        const stopBtn = document.getElementById('arp-stop');
        const clearBtn = document.getElementById('arp-clear');
        const randomBtn = document.getElementById('arp-random');
        const steps = document.querySelectorAll('.arp-step');

        playBtn.addEventListener('click', () => {
            this.startArpSequencer();
            playBtn.classList.add('active');
            stopBtn.classList.remove('active');
        });

        stopBtn.addEventListener('click', () => {
            this.stopArpSequencer();
            stopBtn.classList.add('active');
            playBtn.classList.remove('active');
        });

        clearBtn.addEventListener('click', () => {
            this.clearArpSequencer();
        });

        randomBtn.addEventListener('click', () => {
            this.randomizeArpSequencer();
        });

        steps.forEach(step => {
            step.addEventListener('click', () => {
                const stepIndex = parseInt(step.dataset.step);
                this.arpSequencer.steps[stepIndex] = !this.arpSequencer.steps[stepIndex];
                step.classList.toggle('active');
            });
        });
    }

    startArpSequencer() {
        if (this.arpSequencer.isPlaying) return;

        this.arpSequencer.isPlaying = true;
        this.arpSequencer.currentStep = 0;

        const beatDuration = (60 / this.arpSequencer.tempo) * 250; // 16th notes

        this.arpSequencer.intervalId = setInterval(() => {
            this.advanceArpStep();
        }, beatDuration);
    }

    stopArpSequencer() {
        if (!this.arpSequencer.isPlaying) return;

        this.arpSequencer.isPlaying = false;
        clearInterval(this.arpSequencer.intervalId);

        // Remove all active visual states
        document.querySelectorAll('.arp-step').forEach(step => {
            if (!this.arpSequencer.steps[parseInt(step.dataset.step)]) {
                step.classList.remove('active');
            }
        });
    }

    advanceArpStep() {
        const steps = document.querySelectorAll('.arp-step');
        
        // Remove previous step highlight
        steps.forEach((step, index) => {
            if (index === this.arpSequencer.currentStep) {
                step.classList.add('active');
            } else if (!this.arpSequencer.steps[index]) {
                step.classList.remove('active');
            }
        });

        // Advance to next step
        this.arpSequencer.currentStep = (this.arpSequencer.currentStep + 1) % 16;
    }

    clearArpSequencer() {
        this.arpSequencer.steps = Array(16).fill(false);
        document.querySelectorAll('.arp-step').forEach(step => {
            if (!this.arpSequencer.isPlaying || parseInt(step.dataset.step) !== this.arpSequencer.currentStep) {
                step.classList.remove('active');
            }
        });
    }

    randomizeArpSequencer() {
        this.arpSequencer.steps = Array(16).fill(false).map(() => Math.random() > 0.5);
        document.querySelectorAll('.arp-step').forEach((step, index) => {
            if (this.arpSequencer.steps[index]) {
                step.classList.add('active');
            } else if (!this.arpSequencer.isPlaying || index !== this.arpSequencer.currentStep) {
                step.classList.remove('active');
            }
        });
    }

    // ========================================
    // Presets
    // ========================================
    setupPresets() {
        const presetButtons = document.querySelectorAll('.preset-btn');
        
        presetButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const preset = btn.dataset.preset;
                this.loadPreset(preset);
                
                // Visual feedback
                presetButtons.forEach(b => b.style.transform = 'scale(1)');
                btn.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    btn.style.transform = 'scale(1)';
                }, 200);
            });
        });
    }

    loadPreset(preset) {
        console.log(`Loading preset: ${preset}`);
        
        const presets = {
            bass: {
                vco1Freq: 110,
                vco2Freq: 109,
                lpfCutoff: 400,
                resonance: 7.5,
                arpPattern: [1,0,0,1, 0,1,0,0, 1,0,0,1, 0,1,0,0]
            },
            lead: {
                vco1Freq: 440,
                vco2Freq: 440,
                lpfCutoff: 2000,
                resonance: 9.5,
                arpPattern: [1,1,1,1, 1,0,1,0, 1,1,0,1, 1,0,0,0]
            },
            pad: {
                vco1Freq: 220,
                vco2Freq: 219,
                lpfCutoff: 1200,
                resonance: 3.0,
                arpPattern: [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0]
            },
            seq: {
                vco1Freq: 110,
                vco2Freq: 330,
                lpfCutoff: 800,
                resonance: 6.0,
                arpPattern: [1,1,0,0, 1,0,1,0, 0,1,1,0, 1,0,0,1]
            }
        };

        const config = presets[preset] || presets.bass;
        
        // Apply preset (in a real implementation, this would update all parameters)
        if (config.arpPattern) {
            this.arpSequencer.steps = config.arpPattern.map(v => v === 1);
            document.querySelectorAll('.arp-step').forEach((step, index) => {
                if (config.arpPattern[index] === 1) {
                    step.classList.add('active');
                } else {
                    step.classList.remove('active');
                }
            });
        }

        // Show notification
        this.showNotification(`✅ Loaded preset: ${preset.toUpperCase()}`);
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #00d4ff, #0088aa);
            color: white;
            padding: 15px 25px;
            border-radius: 25px;
            font-weight: bold;
            z-index: 10000;
            animation: slideIn 0.3s ease;
            box-shadow: 0 10px 30px rgba(0, 212, 255, 0.5);
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const synth = new Synth2600();
    console.log('🎹 Behringer 2600 Synthesizer loaded!');
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
