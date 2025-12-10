/**
 * Behringer 2600 Studio - Main Application
 * Interactive patching with visual cable routing
 */

class Synth2600Studio {
    constructor() {
        this.currentPreset = null;
        this.patches = [];
        this.selectedSocket = null;
        this.modules = this.initializeModules();
        this.presets = {};
        this.patterns = this.initializePatterns();

        this.init();
    }

    init() {
        this.loadPresets();
        this.renderModules();
        this.setupControls();
        this.loadPatterns();
        this.setupMIDIGenerator();
    }

    initializeModules() {
        return [
            {
                id: 'vco1',
                name: 'VCO1',
                color: '#00d4ff',
                outputs: ['OUT'],
                inputs: ['FM', 'CV', 'PWM'],
            },
            {
                id: 'vco2',
                name: 'VCO2',
                color: '#00d4ff',
                outputs: ['OUT'],
                inputs: ['FM', 'CV', 'PWM', 'SYNC'],
            },
            {
                id: 'vco3',
                name: 'VCO3/LFO',
                color: '#ff00ff',
                outputs: ['OUT'],
                inputs: ['CV'],
            },
            {
                id: 'vcf',
                name: 'VCF',
                color: '#0f0',
                outputs: ['OUT', 'BP', 'HP'],
                inputs: ['IN', 'CUTOFF', 'RESONANCE'],
            },
            {
                id: 'vca',
                name: 'VCA',
                color: '#ffff00',
                outputs: ['OUT'],
                inputs: ['IN', 'CV'],
            },
            {
                id: 'env',
                name: 'ENVELOPE',
                color: '#ff8800',
                outputs: ['OUT'],
                inputs: ['GATE', 'TRIG'],
            },
            {
                id: 'mixer',
                name: 'MIXER',
                color: '#00d4ff',
                outputs: ['OUT'],
                inputs: ['IN1', 'IN2', 'IN3', 'IN4'],
            },
            {
                id: 'noise',
                name: 'NOISE',
                color: '#888',
                outputs: ['WHITE', 'PINK'],
                inputs: [],
            },
            {
                id: 'sequencer',
                name: 'SEQUENCER',
                color: '#ff0099',
                outputs: ['CV', 'GATE', 'VELOCITY', 'TRIG'],
                inputs: ['CLOCK', 'RESET'],
                special: true,
            },
            {
                id: 'keyboard',
                name: 'KEYBOARD',
                color: '#9900ff',
                outputs: ['CV', 'GATE', 'VELOCITY'],
                inputs: [],
                special: true,
            },
            {
                id: 'snh',
                name: 'S&H',
                color: '#00ffcc',
                outputs: ['OUT'],
                inputs: ['IN', 'TRIG'],
            },
            {
                id: 'ringmod',
                name: 'RING MOD',
                color: '#ff6600',
                outputs: ['OUT'],
                inputs: ['X', 'Y'],
            },
            {
                id: 'delay',
                name: 'DELAY',
                color: '#6600ff',
                outputs: ['OUT'],
                inputs: ['IN', 'TIME', 'FEEDBACK'],
            },
            {
                id: 'lfo2',
                name: 'LFO2',
                color: '#ff00ff',
                outputs: ['TRI', 'SQR', 'SAW'],
                inputs: ['RATE'],
            },
        ];
    }

    initializePatterns() {
        return [
            {
                id: 'evolving_drone',
                name: 'Evolving Drone',
                icon: '🌊',
                description: 'Slowly morphing atmospheric drone',
                cables: [
                    { from: 'vco1.OUT', to: 'mixer.IN1', level: 0.7, color: '#ff0000' },
                    { from: 'vco2.OUT', to: 'mixer.IN2', level: 0.7, color: '#ff0000' },
                    { from: 'vco3.OUT', to: 'vco1.FM', level: 0.3, color: '#00d4ff' },
                    { from: 'vco3.OUT', to: 'vco2.PWM', level: 0.4, color: '#0f0' },
                    { from: 'mixer.OUT', to: 'vcf.IN', level: 1.0, color: '#ff0000' },
                    { from: 'vcf.OUT', to: 'vca.IN', level: 1.0, color: '#ff0000' },
                ],
            },
            {
                id: 'fm_bass',
                name: 'FM Bass',
                icon: '🎵',
                description: 'Powerful FM modulated bass',
                cables: [
                    { from: 'vco2.OUT', to: 'vco1.FM', level: 0.8, color: '#00d4ff' },
                    { from: 'vco1.OUT', to: 'vcf.IN', level: 1.0, color: '#ff0000' },
                    { from: 'env.OUT', to: 'vcf.CUTOFF', level: 0.6, color: '#ff8800' },
                    { from: 'vcf.OUT', to: 'vca.IN', level: 1.0, color: '#ff0000' },
                    { from: 'env.OUT', to: 'vca.CV', level: 1.0, color: '#ff8800' },
                ],
            },
            {
                id: 'ring_mod',
                name: 'Ring Modulation',
                icon: '💍',
                description: 'Metallic bell-like tones',
                cables: [
                    { from: 'vco1.OUT', to: 'mixer.IN1', level: 0.5, color: '#ff0000' },
                    { from: 'vco2.OUT', to: 'mixer.IN2', level: 0.5, color: '#ff0000' },
                    { from: 'mixer.OUT', to: 'vcf.IN', level: 1.0, color: '#ff0000' },
                    { from: 'vcf.OUT', to: 'vca.IN', level: 1.0, color: '#ff0000' },
                ],
            },
            {
                id: 'filter_sweep',
                name: 'Filter Sweep',
                icon: '🎛️',
                description: 'LFO modulated filter sweep',
                cables: [
                    { from: 'vco1.OUT', to: 'vcf.IN', level: 1.0, color: '#ff0000' },
                    { from: 'vco3.OUT', to: 'vcf.CUTOFF', level: 0.7, color: '#ff00ff' },
                    { from: 'vcf.OUT', to: 'vca.IN', level: 1.0, color: '#ff0000' },
                ],
            },
            {
                id: 'noise_sweep',
                name: 'Noise Sweep',
                icon: '🌪️',
                description: 'Filtered noise with LFO',
                cables: [
                    { from: 'noise.WHITE', to: 'vcf.IN', level: 1.0, color: '#888' },
                    { from: 'vco3.OUT', to: 'vcf.CUTOFF', level: 0.8, color: '#ff00ff' },
                    { from: 'vcf.OUT', to: 'vca.IN', level: 1.0, color: '#ff0000' },
                ],
            },
            {
                id: 'sync_lead',
                name: 'Sync Lead',
                icon: '🎸',
                description: 'Hard sync lead sound',
                cables: [
                    { from: 'vco1.OUT', to: 'vco2.SYNC', level: 1.0, color: '#00d4ff' },
                    { from: 'vco2.OUT', to: 'vcf.IN', level: 1.0, color: '#ff0000' },
                    { from: 'env.OUT', to: 'vcf.CUTOFF', level: 0.8, color: '#ff8800' },
                    { from: 'vcf.OUT', to: 'vca.IN', level: 1.0, color: '#ff0000' },
                ],
            },
            {
                id: 'dual_vco',
                name: 'Dual VCO Stack',
                icon: '🎹',
                description: 'Two oscillators slightly detuned',
                cables: [
                    { from: 'vco1.OUT', to: 'mixer.IN1', level: 0.5, color: '#ff0000' },
                    { from: 'vco2.OUT', to: 'mixer.IN2', level: 0.5, color: '#ff0000' },
                    { from: 'mixer.OUT', to: 'vcf.IN', level: 1.0, color: '#ff0000' },
                    { from: 'env.OUT', to: 'vca.CV', level: 1.0, color: '#ff8800' },
                    { from: 'vcf.OUT', to: 'vca.IN', level: 1.0, color: '#ff0000' },
                ],
            },
            {
                id: 'pwm_pad',
                name: 'PWM Pad',
                icon: '🎼',
                description: 'Pulse width modulation pad',
                cables: [
                    { from: 'vco3.OUT', to: 'vco1.PWM', level: 0.5, color: '#ff00ff' },
                    { from: 'vco3.OUT', to: 'vco2.PWM', level: 0.6, color: '#ff00ff' },
                    { from: 'vco1.OUT', to: 'mixer.IN1', level: 0.5, color: '#ff0000' },
                    { from: 'vco2.OUT', to: 'mixer.IN2', level: 0.5, color: '#ff0000' },
                    { from: 'mixer.OUT', to: 'vcf.IN', level: 1.0, color: '#ff0000' },
                    { from: 'vcf.OUT', to: 'vca.IN', level: 1.0, color: '#ff0000' },
                ],
            },
            {
                id: 'sequencer_bass',
                name: 'Sequencer Bass',
                icon: '🎚️',
                description: 'Sequenced bassline with modulation',
                cables: [
                    { from: 'sequencer.CV', to: 'vco1.CV', level: 1.0, color: '#ff0099' },
                    { from: 'sequencer.GATE', to: 'env.GATE', level: 1.0, color: '#ff0099' },
                    { from: 'vco1.OUT', to: 'vcf.IN', level: 1.0, color: '#ff0000' },
                    { from: 'env.OUT', to: 'vcf.CUTOFF', level: 0.7, color: '#ff8800' },
                    { from: 'vcf.OUT', to: 'vca.IN', level: 1.0, color: '#ff0000' },
                    { from: 'env.OUT', to: 'vca.CV', level: 1.0, color: '#ff8800' },
                ],
            },
            {
                id: 'keyboard_lead',
                name: 'Keyboard Lead',
                icon: '🎹',
                description: 'Playable keyboard controlled lead',
                cables: [
                    { from: 'keyboard.CV', to: 'vco1.CV', level: 1.0, color: '#9900ff' },
                    { from: 'keyboard.GATE', to: 'env.GATE', level: 1.0, color: '#9900ff' },
                    { from: 'vco1.OUT', to: 'vcf.IN', level: 1.0, color: '#ff0000' },
                    { from: 'env.OUT', to: 'vcf.CUTOFF', level: 0.8, color: '#ff8800' },
                    { from: 'vcf.OUT', to: 'delay.IN', level: 0.7, color: '#ff0000' },
                    { from: 'delay.OUT', to: 'vca.IN', level: 1.0, color: '#6600ff' },
                    { from: 'env.OUT', to: 'vca.CV', level: 1.0, color: '#ff8800' },
                ],
            },
            {
                id: 'random_melody',
                name: 'Random Melody',
                icon: '🎲',
                description: 'Sample & hold random melodies',
                cables: [
                    { from: 'noise.WHITE', to: 'snh.IN', level: 1.0, color: '#888' },
                    { from: 'sequencer.TRIG', to: 'snh.TRIG', level: 1.0, color: '#ff0099' },
                    { from: 'snh.OUT', to: 'vco1.CV', level: 1.0, color: '#00ffcc' },
                    { from: 'sequencer.GATE', to: 'env.GATE', level: 1.0, color: '#ff0099' },
                    { from: 'vco1.OUT', to: 'vcf.IN', level: 1.0, color: '#ff0000' },
                    { from: 'vcf.OUT', to: 'vca.IN', level: 1.0, color: '#ff0000' },
                    { from: 'env.OUT', to: 'vca.CV', level: 1.0, color: '#ff8800' },
                ],
            },
            {
                id: 'ring_bells',
                name: 'Ring Bells',
                icon: '🔔',
                description: 'Ring modulated bell tones',
                cables: [
                    { from: 'keyboard.CV', to: 'vco1.CV', level: 1.0, color: '#9900ff' },
                    { from: 'vco1.OUT', to: 'ringmod.X', level: 1.0, color: '#ff0000' },
                    { from: 'vco2.OUT', to: 'ringmod.Y', level: 1.0, color: '#ff0000' },
                    { from: 'ringmod.OUT', to: 'vcf.IN', level: 1.0, color: '#ff6600' },
                    { from: 'keyboard.GATE', to: 'env.GATE', level: 1.0, color: '#9900ff' },
                    { from: 'vcf.OUT', to: 'vca.IN', level: 1.0, color: '#ff0000' },
                    { from: 'env.OUT', to: 'vca.CV', level: 1.0, color: '#ff8800' },
                ],
            },
            {
                id: 'delay_echo',
                name: 'Delay Echo',
                icon: '🔄',
                description: 'Rhythmic delay patterns',
                cables: [
                    { from: 'sequencer.CV', to: 'vco1.CV', level: 1.0, color: '#ff0099' },
                    { from: 'sequencer.GATE', to: 'env.GATE', level: 1.0, color: '#ff0099' },
                    { from: 'vco1.OUT', to: 'vca.IN', level: 0.5, color: '#ff0000' },
                    { from: 'env.OUT', to: 'vca.CV', level: 1.0, color: '#ff8800' },
                    { from: 'vca.OUT', to: 'delay.IN', level: 1.0, color: '#ffff00' },
                    { from: 'lfo2.TRI', to: 'delay.TIME', level: 0.3, color: '#ff00ff' },
                    { from: 'delay.OUT', to: 'vcf.IN', level: 1.0, color: '#6600ff' },
                ],
            },
            {
                id: 'lfo_chaos',
                name: 'LFO Chaos',
                icon: '⚡',
                description: 'Multiple LFOs create chaos',
                cables: [
                    { from: 'vco3.OUT', to: 'vco1.FM', level: 0.6, color: '#ff00ff' },
                    { from: 'lfo2.SAW', to: 'vco2.FM', level: 0.5, color: '#ff00ff' },
                    { from: 'vco1.OUT', to: 'mixer.IN1', level: 0.5, color: '#ff0000' },
                    { from: 'vco2.OUT', to: 'mixer.IN2', level: 0.5, color: '#ff0000' },
                    { from: 'lfo2.SQR', to: 'vcf.CUTOFF', level: 0.4, color: '#ff00ff' },
                    { from: 'mixer.OUT', to: 'vcf.IN', level: 1.0, color: '#ff0000' },
                    { from: 'vcf.OUT', to: 'vca.IN', level: 1.0, color: '#ff0000' },
                ],
            },
            {
                id: 'arp_sequence',
                name: 'Arpeggio Sequence',
                icon: '🎼',
                description: 'Classic arpeggiator pattern',
                cables: [
                    { from: 'sequencer.CV', to: 'vco1.CV', level: 1.0, color: '#ff0099' },
                    { from: 'sequencer.CV', to: 'vco2.CV', level: 1.0, color: '#ff0099' },
                    { from: 'sequencer.GATE', to: 'env.GATE', level: 1.0, color: '#ff0099' },
                    { from: 'vco1.OUT', to: 'mixer.IN1', level: 0.5, color: '#ff0000' },
                    { from: 'vco2.OUT', to: 'mixer.IN2', level: 0.5, color: '#ff0000' },
                    { from: 'mixer.OUT', to: 'vcf.IN', level: 1.0, color: '#ff0000' },
                    { from: 'env.OUT', to: 'vcf.CUTOFF', level: 0.6, color: '#ff8800' },
                    { from: 'vcf.OUT', to: 'vca.IN', level: 1.0, color: '#ff0000' },
                    { from: 'env.OUT', to: 'vca.CV', level: 1.0, color: '#ff8800' },
                ],
            },
        ];
    }

    async loadPresets() {
        try {
            console.log('Loading presets from API...');
            const response = await fetch('/api/music/synth2600/presets');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Preset data received:', data);

            if (data.success && data.categories) {
                this.presets = data.categories;
                console.log(`✅ Loaded ${data.total} presets in ${Object.keys(data.categories).length} categories`);
                this.renderPresets();
            } else {
                console.error('Invalid preset data format:', data);
            }
        } catch (error) {
            console.error('Error loading presets:', error);
            const container = document.getElementById('preset-list');
            if (container) {
                container.innerHTML = `
                    <p style="color: var(--accent-red); padding: 20px; text-align: center;">
                        ⚠️ Error loading presets<br>
                        <small>${error.message}</small>
                    </p>
                `;
            }
        }
    }

    renderPresets() {
        const container = document.getElementById('preset-list');
        container.innerHTML = '';

        const categoryNames = {
            bass: 'Bass',
            lead: 'Lead',
            pad: 'Pad',
            effects: 'Effects',
            percussion: 'Percussion',
            sequence: 'Sequence',
            modulation: 'Modulation',
            // Legacy categories (fallback)
            soundscape: 'Soundscape',
            rhythmic: 'Rhythmic',
            cinematic: 'Cinematic FX',
            psychedelic: 'Psychedelic',
            performance: 'Performance',
            musical: 'Musical',
        };

        const categoryIcons = {
            bass: '🔊',
            lead: '🎸',
            pad: '🌊',
            effects: '✨',
            percussion: '🥁',
            sequence: '🎵',
            modulation: '🎛️',
            // Legacy icons (fallback)
            soundscape: '🌊',
            rhythmic: '🥁',
            cinematic: '🎬',
            psychedelic: '🌀',
            performance: '🎸',
            musical: '🎹',
        };

        Object.entries(this.presets).forEach(([category, presets]) => {
            if (presets.length > 0) {
                const header = document.createElement('div');
                header.className = 'category-header';
                const categoryName = categoryNames[category] || category.charAt(0).toUpperCase() + category.slice(1);
                const categoryIcon = categoryIcons[category] || '🎹';
                header.innerHTML = `${categoryIcon} ${categoryName}`;
                container.appendChild(header);

                presets.forEach(preset => {
                    const item = document.createElement('div');
                    item.className = 'preset-item';
                    item.innerHTML = `
                        <div class="preset-name">${preset.replace(/_/g, ' ')}</div>
                        <div class="preset-desc">Click to load</div>
                    `;
                    item.onclick = () => this.loadPreset(preset);
                    container.appendChild(item);
                });
            }
        });

        // Show message if no presets loaded
        if (Object.keys(this.presets).length === 0) {
            container.innerHTML = '<p style="color: var(--text-secondary); padding: 20px; text-align: center;">No presets available</p>';
        }
    }

    async loadPreset(presetName) {
        try {
            const response = await fetch(`/api/music/synth2600/preset/${presetName}`);
            const data = await response.json();

            if (data.success) {
                // Clear existing patches
                this.clearAllPatches();

                // Add new patches
                data.patchConnections.forEach(conn => {
                    this.addPatch({
                        from: conn.source,
                        to: conn.destination,
                        level: conn.level,
                        color: this.getCableColor(conn.color),
                    });
                });

                this.currentPreset = presetName;
                this.updateUI();

                // Highlight active preset
                document.querySelectorAll('.preset-item').forEach(item => {
                    item.classList.remove('active');
                    if (item.textContent.toLowerCase().includes(presetName.replace(/_/g, ' '))) {
                        item.classList.add('active');
                    }
                });
            }
        } catch (error) {
            console.error('Error loading preset:', error);
        }
    }

    renderModules() {
        const rack = document.getElementById('module-rack');
        rack.innerHTML = '';

        this.modules.forEach(module => {
            const moduleEl = document.createElement('div');
            moduleEl.className = 'module';
            moduleEl.id = `module-${module.id}`;

            let html = `
                <div class="module-header" style="border-color: ${module.color}; color: ${module.color};">
                    ${module.name}
                </div>
                <div class="patch-points">
            `;

            // Output jacks
            module.outputs.forEach(output => {
                html += `
                    <div class="patch-point output" data-module="${module.id}" data-point="${output}">
                        <span style="color: #0f0;">${output}</span>
                        <div class="patch-socket output" onclick="app.selectSocket('${module.id}.${output}', 'output')"></div>
                    </div>
                `;
            });

            // Input jacks
            module.inputs.forEach(input => {
                html += `
                    <div class="patch-point input" data-module="${module.id}" data-point="${input}">
                        <div class="patch-socket input" onclick="app.selectSocket('${module.id}.${input}', 'input')"></div>
                        <span style="color: #ff0000;">${input}</span>
                    </div>
                `;
            });

            html += '</div>';
            moduleEl.innerHTML = html;
            rack.appendChild(moduleEl);
        });
    }

    selectSocket(socketId, type) {
        if (!this.selectedSocket) {
            // First selection
            this.selectedSocket = { id: socketId, type };
            this.highlightSocket(socketId, true);
        } else {
            // Second selection - create cable
            if (this.selectedSocket.type === 'output' && type === 'input') {
                // Valid connection: output -> input
                this.addPatch({
                    from: this.selectedSocket.id,
                    to: socketId,
                    level: 1.0,
                    color: '#ff0000',
                });
                this.highlightSocket(this.selectedSocket.id, false);
                this.selectedSocket = null;
                this.updateUI();
            } else if (this.selectedSocket.type === 'input' && type === 'output') {
                // Valid connection: output -> input (reversed order)
                this.addPatch({
                    from: socketId,
                    to: this.selectedSocket.id,
                    level: 1.0,
                    color: '#ff0000',
                });
                this.highlightSocket(this.selectedSocket.id, false);
                this.selectedSocket = null;
                this.updateUI();
            } else {
                // Invalid connection - deselect
                this.highlightSocket(this.selectedSocket.id, false);
                this.selectedSocket = null;
            }
        }
    }

    highlightSocket(socketId, highlight) {
        const [module, point] = socketId.split('.');
        const socket = document.querySelector(
            `.patch-point[data-module="${module}"][data-point="${point}"] .patch-socket`,
        );
        if (socket) {
            if (highlight) {
                socket.style.boxShadow = '0 0 20px var(--accent-cyan)';
                socket.style.transform = 'scale(1.3)';
            } else {
                socket.style.boxShadow = '';
                socket.style.transform = '';
            }
        }
    }

    addPatch(patch) {
        // Check if patch already exists
        const exists = this.patches.some(p => p.from === patch.from && p.to === patch.to);
        if (!exists) {
            this.patches.push(patch);
        }
    }

    removePatch(from, to) {
        this.patches = this.patches.filter(p => !(p.from === from && p.to === to));
        this.updateUI();
    }

    clearAllPatches() {
        this.patches = [];
        this.updateUI();
    }

    updateUI() {
        this.renderCables();
        this.renderPatchList();
        this.updateSocketStates();
    }

    renderCables() {
        const svg = document.getElementById('cables-svg');
        const canvas = document.getElementById('patch-canvas');

        // Set SVG size
        svg.setAttribute('width', canvas.offsetWidth);
        svg.setAttribute('height', canvas.offsetHeight);

        // Clear existing cables
        svg.innerHTML = '';

        this.patches.forEach(patch => {
            const fromSocket = this.getSocketPosition(patch.from);
            const toSocket = this.getSocketPosition(patch.to);

            if (fromSocket && toSocket) {
                const path = this.createCablePath(fromSocket, toSocket, patch.color);
                svg.appendChild(path);
            }
        });
    }

    getSocketPosition(socketId) {
        const [module, point] = socketId.split('.');
        const socket = document.querySelector(
            `.patch-point[data-module="${module}"][data-point="${point}"] .patch-socket`,
        );

        if (socket) {
            const rect = socket.getBoundingClientRect();
            const canvasRect = document.getElementById('patch-canvas').getBoundingClientRect();
            return {
                x: rect.left - canvasRect.left + rect.width / 2,
                y: rect.top - canvasRect.top + rect.height / 2,
            };
        }
        return null;
    }

    createCablePath(from, to, color) {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

        // Create bezier curve for cable
        const midX = (from.x + to.x) / 2;
        const midY = (from.y + to.y) / 2;
        const curve = Math.abs(to.x - from.x) * 0.5;

        const d = `M ${from.x} ${from.y} Q ${from.x + curve} ${midY}, ${midX} ${midY} T ${to.x} ${to.y}`;

        path.setAttribute('d', d);
        path.setAttribute('class', 'cable-line');
        path.setAttribute('stroke', color);
        path.style.color = color;

        path.onclick = () => {
            const fromId = this.patches.find(p =>
                this.getSocketPosition(p.from)?.x === from.x &&
                this.getSocketPosition(p.from)?.y === from.y,
            )?.from;
            const toId = this.patches.find(p =>
                this.getSocketPosition(p.to)?.x === to.x &&
                this.getSocketPosition(p.to)?.y === to.y,
            )?.to;
            if (fromId && toId && confirm('Remove this cable?')) {
                this.removePatch(fromId, toId);
            }
        };

        return path;
    }

    renderPatchList() {
        const container = document.getElementById('active-patches');
        const count = document.getElementById('cable-count');

        count.textContent = this.patches.length;

        if (this.patches.length === 0) {
            container.innerHTML = '<p style="color: var(--text-secondary); font-size: 0.9em;">No cables connected</p>';
            return;
        }

        container.innerHTML = '';
        this.patches.forEach(patch => {
            const conn = document.createElement('div');
            conn.className = 'patch-connection';
            conn.style.borderColor = patch.color;
            conn.innerHTML = `
                <div class="cable-color-dot" style="background: ${patch.color};"></div>
                <div class="connection-info">
                    <div class="connection-source">${patch.from}</div>
                    <div style="color: var(--accent-yellow);">→</div>
                    <div class="connection-dest">${patch.to}</div>
                    <div class="connection-level">Level: ${(patch.level * 100).toFixed(0)}%</div>
                </div>
                <button class="remove-cable-btn" onclick="app.removePatch('${patch.from}', '${patch.to}')">
                    <i class="fas fa-times"></i>
                </button>
            `;
            container.appendChild(conn);
        });
    }

    updateSocketStates() {
        // Reset all sockets
        document.querySelectorAll('.patch-socket').forEach(socket => {
            socket.classList.remove('connected');
        });

        // Mark connected sockets
        this.patches.forEach(patch => {
            const [fromModule, fromPoint] = patch.from.split('.');
            const [toModule, toPoint] = patch.to.split('.');

            const fromSocket = document.querySelector(
                `.patch-point[data-module="${fromModule}"][data-point="${fromPoint}"] .patch-socket`,
            );
            const toSocket = document.querySelector(
                `.patch-point[data-module="${toModule}"][data-point="${toPoint}"] .patch-socket`,
            );

            if (fromSocket) fromSocket.classList.add('connected');
            if (toSocket) toSocket.classList.add('connected');
        });
    }

    loadPatterns() {
        const grid = document.getElementById('pattern-grid');
        grid.innerHTML = '';

        this.patterns.forEach(pattern => {
            const card = document.createElement('div');
            card.className = 'pattern-card';
            card.innerHTML = `
                <div class="pattern-icon">${pattern.icon}</div>
                <div class="pattern-name">${pattern.name}</div>
            `;
            card.onclick = () => this.applyPattern(pattern);
            grid.appendChild(card);
        });
    }

    applyPattern(pattern) {
        this.clearAllPatches();
        pattern.cables.forEach(cable => {
            this.addPatch(cable);
        });
        this.updateUI();

        // Show notification
        alert(`Pattern "${pattern.name}" applied!\n\n${pattern.description}`);
    }

    setupControls() {
        // VCO1 Frequency
        const vco1Freq = document.getElementById('vco1-freq');
        const vco1FreqValue = document.getElementById('vco1-freq-value');
        vco1Freq.oninput = () => {
            vco1FreqValue.textContent = vco1Freq.value + ' Hz';
        };

        // VCF Cutoff
        const vcfCutoff = document.getElementById('vcf-cutoff');
        const vcfCutoffValue = document.getElementById('vcf-cutoff-value');
        vcfCutoff.oninput = () => {
            vcfCutoffValue.textContent = vcfCutoff.value + ' Hz';
        };

        // VCF Resonance
        const vcfRes = document.getElementById('vcf-res');
        const vcfResValue = document.getElementById('vcf-res-value');
        vcfRes.oninput = () => {
            vcfResValue.textContent = parseFloat(vcfRes.value).toFixed(2);
        };

        // Waveform buttons
        document.querySelectorAll('.waveform-btn').forEach(btn => {
            btn.onclick = () => {
                document.querySelectorAll('.waveform-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            };
        });

        // MIDI bars slider
        const midiBars = document.getElementById('midi-bars');
        const midiBarsValue = document.getElementById('midi-bars-value');
        if (midiBars) {
            midiBars.oninput = () => {
                midiBarsValue.textContent = midiBars.value;
            };
        }
    }

    setupMIDIGenerator() {
        const container = document.getElementById('midi-controls');
        container.innerHTML = `
            <div style="background: rgba(0,212,255,0.1); border: 2px solid var(--accent-cyan); border-radius: 12px; padding: 30px;">
                <h3 style="color: var(--accent-cyan); margin-bottom: 20px;">
                    <i class="fas fa-sliders-h"></i> MIDI Export Settings
                </h3>
                
                <div class="knob-control">
                    <div class="knob-label">
                        <span>Root Note</span>
                        <span class="knob-value" id="midi-root-value">C4</span>
                    </div>
                    <select id="midi-root" style="width: 100%; padding: 10px; background: rgba(0,212,255,0.1); border: 2px solid var(--accent-cyan); color: white; border-radius: 6px;">
                        <option value="48">C3</option>
                        <option value="60" selected>C4</option>
                        <option value="72">C5</option>
                    </select>
                </div>
                
                <div class="knob-control">
                    <div class="knob-label">
                        <span>Tempo (BPM)</span>
                        <span class="knob-value" id="midi-tempo-value">120</span>
                    </div>
                    <input type="range" class="slider" id="midi-tempo" min="60" max="180" value="120" step="1">
                </div>
                
                <div class="knob-control">
                    <div class="knob-label">
                        <span>Pattern Length</span>
                        <span class="knob-value" id="midi-length-value">16 steps</span>
                    </div>
                    <input type="range" class="slider" id="midi-length" min="4" max="32" value="16" step="4">
                </div>
                
                <div class="knob-control">
                    <div class="knob-label">
                        <span>Note Density</span>
                        <span class="knob-value" id="midi-density-value">50%</span>
                    </div>
                    <input type="range" class="slider" id="midi-density" min="0" max="100" value="50" step="10">
                </div>
                
                <button class="action-btn" onclick="app.generateMIDI()" style="margin-top: 20px;">
                    <i class="fas fa-magic"></i>
                    Generate MIDI Pattern
                </button>
            </div>
        `;

        // Setup MIDI control listeners
        const tempo = document.getElementById('midi-tempo');
        const tempoValue = document.getElementById('midi-tempo-value');
        tempo.oninput = () => tempoValue.textContent = tempo.value;

        const length = document.getElementById('midi-length');
        const lengthValue = document.getElementById('midi-length-value');
        length.oninput = () => lengthValue.textContent = length.value + ' steps';

        const density = document.getElementById('midi-density');
        const densityValue = document.getElementById('midi-density-value');
        density.oninput = () => densityValue.textContent = density.value + '%';
    }

    async generateMIDI() {
        const tempo = document.getElementById('midi-tempo').value;
        const length = document.getElementById('midi-length').value;
        const density = document.getElementById('midi-density').value;
        const root = document.getElementById('midi-root').value;

        alert(`Generating MIDI with:\nTempo: ${tempo} BPM\nLength: ${length} steps\nDensity: ${density}%\nRoot: ${root}`);

        // TODO: Implement actual MIDI generation
        // This would call the backend API to generate a MIDI file
    }

    getCableColor(colorName) {
        const colors = {
            RED: '#ff0000',
            BLUE: '#00d4ff',
            GREEN: '#0f0',
            YELLOW: '#ffff00',
            WHITE: '#fff',
            ORANGE: '#ff8800',
            PURPLE: '#ff00ff',
        };
        return colors[colorName] || '#ff0000';
    }
}

// Panel switching
function showPanel(panelName) {
    document.querySelectorAll('.content-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    document.getElementById(panelName + '-panel').classList.add('active');

    // Update desktop nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    const desktopBtn = document.getElementById('btn-' + panelName);
    if (desktopBtn) {
        desktopBtn.classList.add('active');
    }

    // Update mobile nav buttons
    const mobileBtn = document.getElementById('mobile-btn-' + panelName);
    if (mobileBtn) {
        mobileBtn.classList.add('active');
    }
}

// Export functions
function exportMIDI() {
    document.getElementById('export-modal').classList.add('active');
}

async function doExportMIDI() {
    const filename = document.getElementById('midi-filename').value;
    const bars = document.getElementById('midi-bars').value;

    try {
        const response = await fetch('/api/music/synth2600/export', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename, bars: parseInt(bars) }),
        });

        const data = await response.json();

        if (data.success) {
            // Download file
            const midiBlob = new Blob(
                [Uint8Array.from(atob(data.midiData), c => c.charCodeAt(0))],
                { type: 'audio/midi' },
            );
            const url = URL.createObjectURL(midiBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);

            closeModal('export-modal');
            alert('MIDI file exported successfully!');
        }
    } catch (error) {
        alert('Error exporting MIDI: ' + error.message);
    }
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function playSound() {
    alert('Audio playback feature coming soon!\n\nFor now, export to MIDI and play in your DAW.');
}

function clearAllPatches() {
    if (confirm('Clear all patch cables?')) {
        app.clearAllPatches();
    }
}

// Initialize app
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new Synth2600Studio();
    console.log('🎛️ Behringer 2600 Studio initialized');
});

// Handle window resize
window.addEventListener('resize', () => {
    if (app) {
        app.updateUI();
    }
});
