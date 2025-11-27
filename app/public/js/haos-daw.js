/**
 * HAOS.fm Interactive Studio
 * Replaces the traditional DAW interface with a genre-based "Studio" view.
 */

const STUDIO = {
    currentGenre: 'techno',
    instruments: [],
    isPlaying: false,
    visualizerCtx: null,
    analyser: null
};

let toastTimeout = null;
const modalState = {
    onPrimary: null,
    currentTemplate: null
};

// --- LIVING SYSTEM (The "Organism" Logic) ---
window.LIVING_SYSTEM = {
    active: true,
    chaosLevel: 0.2, // 0.0 to 1.0
    evolutionRate: 0.005,
    pulsePhase: 0,
    
    // State for "breathing" modulation
    breath: 0, 

    start() {
        console.log('🧬 Living System Activated');
        this.loop();
    },

    loop() {
        if (!this.active) return;

        // 1. Global "Breath" LFO (0 to 1)
        this.pulsePhase += this.evolutionRate;
        this.breath = (Math.sin(this.pulsePhase) + 1) / 2;

        // 2. Apply "Life" to Instruments
        this.modulateOrganism();

        // 3. Random Mutation (Chaos)
        if (Math.random() < this.chaosLevel * 0.01) {
            this.mutatePattern();
        }

        requestAnimationFrame(() => this.loop());
    },

    modulateOrganism() {
        // Subtle parameter drift based on "breath"
        STUDIO.instruments.forEach(inst => {
            if (!inst.synth || !inst.panel) return;

            // Find knobs to modulate
            const knobs = inst.panel.querySelectorAll('.knob-circle');
            knobs.forEach(knob => {
                const param = knob.dataset.param;
                let baseValue = parseFloat(knob.dataset.value || 0.5);
                
                // Only modulate certain parameters to avoid chaos
                if (['cutoff', 'decay', 'release', 'tone'].includes(param)) {
                    // Calculate drift: sine wave based on breath + random jitter
                    // We want the drift to be subtle (e.g., +/- 0.05)
                    const drift = (this.breath - 0.5) * 0.1; 
                    const newValue = Math.min(1, Math.max(0, baseValue + drift));
                    
                    // Update Synth (but NOT the knob visual, to keep user's setting as "center")
                    // Actually, updating the synth is enough.
                    updateSynthParam(inst.synth, inst.panel.dataset.type, param, newValue);
                }
            });
        });
    },

    mutatePattern() {
        // Find a sequencer and flip a step
        const sequencers = STUDIO.instruments.filter(i => i.synth && i.synth.pattern);
        if (sequencers.length === 0) return;

        const target = sequencers[Math.floor(Math.random() * sequencers.length)];
        const step = Math.floor(Math.random() * 16);
        
        // Flip state
        if (target.synth.pattern) {
            target.synth.pattern[step] = !target.synth.pattern[step];
            
            // Update UI Step
            const stepEl = target.panel.querySelector(`.seq-step[data-step="${step}"]`);
            if (stepEl) {
                stepEl.classList.toggle('active', target.synth.pattern[step]);
                // Add a "mutation" flash effect
                stepEl.style.borderColor = '#fff';
                setTimeout(() => stepEl.style.borderColor = '', 200);
            }
        }
    }
};

// Genre Configurations
const GENRES = {
    techno: [
        { type: 'tr909', name: 'TECHNO DRUMS', color: '#39FF14' },
        { type: 'tb303', name: 'ACID BASS', color: '#39FF14' }
    ],
    trap: [
        { type: 'tr808', name: 'TRAP DRUMS', color: '#FF006E' },
        { type: 'arp2600', name: 'LEAD SYNTH', color: '#FF006E' }
    ],
    ambient: [
        { type: 'strings', name: 'ETHEREAL PADS', color: '#00D9FF' },
        { type: 'arp2geo', name: 'TEXTURES', color: '#00D9FF' }
    ],
    hard_techno: [
        { type: 'tr909', name: 'HARD KICK', color: '#ff4500' },
        { type: 'arp2600', name: 'INDUSTRIAL SYNTH', color: '#ff4500' }
    ],
    acid: [
        { type: 'tr808', name: 'ACID DRUMS', color: '#FFFF00' },
        { type: 'tb303', name: 'SQUELCH BASS', color: '#FFFF00' }
    ],
    dub_techno: [
        { type: 'tr909', name: 'DUB DRUMS', color: '#00FFFF' },
        { type: 'strings', name: 'DUB CHORDS', color: '#00FFFF' }
    ]
};

document.addEventListener('DOMContentLoaded', () => {
    console.log('🎹 HAOS Interactive Studio Loading...');
    
    // Setup UI
    setupTransport();
    setupVisualizer();
    setupModeTabs();
    setupBasicModeShortcuts();
    setupAdvancedShortcuts();
    setupModalControls();
    setupSystemPanel();
    setupBeginnerIntro();
    
    // Initialize Audio on first click
    document.addEventListener('click', initAudio, { once: true });
    
    // Load default genre
    switchGenre('techno');
});

async function initAudio() {
    if (HAOS.initialized) return;
    try {
        await HAOS.init();
        console.log('🔊 Audio Engine Started');
        startVisualizer();
        LIVING_SYSTEM.start();
    } catch (e) {
        console.error('Audio Init Failed:', e);
    }
}

function setupModeTabs() {
    const tabs = document.querySelectorAll('.mode-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            setActiveMode(tab.dataset.mode);
        });
    });
}

function setActiveMode(mode) {
    const targetId = `${mode}-mode`;
    document.querySelectorAll('.mode-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.mode === mode);
    });
    document.querySelectorAll('.mode-panel').forEach(panel => {
        panel.classList.toggle('active', panel.id === targetId);
    });

    if (mode === 'pro') {
        // Resize visualizer when panel becomes visible
        requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));
    }
}

function setupBasicModeShortcuts() {
    document.querySelectorAll('.beat-launch').forEach(button => {
        button.addEventListener('click', async () => {
            const primary = button.dataset.primary;
            const secondary = button.dataset.secondary;
            if (!primary) return;
            setActiveMode('pro');
            await triggerHybridLaunch(primary, secondary);
        });
    });

    document.querySelectorAll('.basic-auto-btn').forEach(button => {
        button.addEventListener('click', () => {
            handleBasicAction(button.dataset.action);
        });
    });
}

function setupAdvancedShortcuts() {
    document.querySelectorAll('#advanced-mode [data-advanced]').forEach(button => {
        button.addEventListener('click', () => {
            handleAdvancedAction(button.dataset.advanced);
        });
    });
}

function setupModalControls() {
    const modal = document.getElementById('studio-modal');
    if (!modal) return;

    modal.querySelectorAll('[data-modal-close]').forEach(el => {
        el.addEventListener('click', () => closeStudioModal());
    });

    const primaryBtn = document.getElementById('modal-primary-action');
    if (primaryBtn) {
        primaryBtn.addEventListener('click', () => {
            if (typeof modalState.onPrimary === 'function') {
                modalState.onPrimary();
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeStudioModal();
        }
    });
}

function setupBeginnerIntro() {
    const quickStartBtn = document.querySelector('.beginner-start-btn');
    if (quickStartBtn) {
        quickStartBtn.addEventListener('click', () => {
            const primary = quickStartBtn.dataset.beginnerPrimary || 'techno';
            const secondary = quickStartBtn.dataset.beginnerSecondary || 'trap';
            setActiveMode('basic');
            triggerHybridLaunch(primary, secondary);
            showStudioToast('Loaded your starter loop. Scroll to Basic for more tips.');
        });
    }

    const guideBtn = document.querySelector('[data-beginner-guide]');
    if (guideBtn) {
        guideBtn.addEventListener('click', () => {
            showStudioToast('Tour: Start with Basic mode cards, then hop into Pro for visual rack.');
            setActiveMode('basic');
        });
    }
}

function setupSystemPanel() {
    const panel = document.getElementById('system-setup-panel');
    if (!panel) return;

    const interfaceSelect = panel.querySelector('[data-system-select]');
    if (interfaceSelect) {
        interfaceSelect.addEventListener('change', (event) => {
            const selectedLabel = event.target.selectedOptions?.[0]?.textContent?.trim() || 'new interface';
            showStudioToast(`Routing HAOS output to ${selectedLabel}`);
            window.dispatchEvent(new CustomEvent('haos-system-interface-change', {
                detail: { value: event.target.value, label: selectedLabel }
            }));
        });
    }

    const actionMessages = {
        engine: 'Restarting HAOS Hybrid DSP…',
        interface: 'Opening interface selector…',
        sync: 'Linking HAOS transport to Ableton clock…',
        calibrate: 'Calibrating Link drift compensation…',
        session: 'Pushing hybrid arrangement into Ableton Live…',
        guide: 'Loading setup checklist…'
    };

    panel.querySelectorAll('[data-setup-action]').forEach(button => {
        button.addEventListener('click', () => {
            const action = button.dataset.setupAction;
            const message = actionMessages[action] || 'System action triggered.';
            showStudioToast(message);
            window.dispatchEvent(new CustomEvent('haos-system-action', { detail: { action } }));
        });
    });
}

async function triggerHybridLaunch(primaryGenre, secondaryGenre) {
    await switchGenre(primaryGenre);
    if (secondaryGenre && GENRES[secondaryGenre]) {
        showStudioToast(`Hybridizing ${formatGenreLabel(primaryGenre)} × ${formatGenreLabel(secondaryGenre)}`);
    } else {
        showStudioToast(`Loaded ${formatGenreLabel(primaryGenre)} rig`);
    }
    highlightInstrumentRack();
}

function handleBasicAction(action) {
    switch (action) {
        case 'arrange':
            LIVING_SYSTEM.active = true;
            LIVING_SYSTEM.chaosLevel = Math.min(1, LIVING_SYSTEM.chaosLevel + 0.1);
            showStudioToast('Living System is evolving modulation + accents.');
            break;
        case 'play':
            if (!HAOS.initialized) {
                showStudioToast('Tap once to unlock audio, then try again.');
                return;
            }
            if (HAOS.state.playbackState !== 'playing') {
                HAOS.play();
                STUDIO.instruments.forEach(inst => inst.play && inst.play());
                updatePlayButton(true);
                showStudioToast('Transport rolling. Flip to Pro for deep edits.');
            }
            break;
        case 'presets':
            launchPresetLibraryModal();
            break;
        default:
            break;
    }
}

function handleAdvancedAction(action) {
    window.dispatchEvent(new CustomEvent('haos-advanced-action', { detail: { action } }));

    switch (action) {
        case 'patch-designer':
            launchPatchDesignerModal();
            break;
        case 'preset-library':
            launchPresetLibraryModal();
            break;
        case 'cli':
            launchCliModal();
            break;
        default:
            showStudioToast('Advanced function coming online soon.');
            break;
    }
}

function highlightInstrumentRack() {
    const rack = document.getElementById('instrument-rack');
    if (!rack) return;
    rack.classList.add('hybrid-glow');
    setTimeout(() => rack.classList.remove('hybrid-glow'), 1800);
}

function formatGenreLabel(genre = '') {
    return genre.replace(/_/g, ' ').toUpperCase();
}

function showStudioToast(message) {
    let toast = document.querySelector('.studio-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'studio-toast';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toast.classList.remove('show'), 2500);
}

function openStudioModal({ title, description, pill = 'ADVANCED', templateId, primaryText, onPrimary } = {}) {
    const modal = document.getElementById('studio-modal');
    if (!modal) return;

    document.getElementById('modal-title').textContent = title || 'Advanced Tool';
    document.getElementById('modal-description').textContent = description || '';
    document.getElementById('modal-pill').textContent = pill;

    const primaryBtn = document.getElementById('modal-primary-action');
    if (primaryText) {
        primaryBtn.textContent = primaryText;
        primaryBtn.style.display = 'inline-flex';
    } else {
        primaryBtn.style.display = 'none';
    }

    modalState.onPrimary = typeof onPrimary === 'function' ? onPrimary : null;
    modalState.currentTemplate = templateId;
    injectModalTemplate(templateId);

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
}

function closeStudioModal() {
    const modal = document.getElementById('studio-modal');
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    modalState.onPrimary = null;
    modalState.currentTemplate = null;
    const body = document.getElementById('modal-body');
    if (body) body.innerHTML = '';
}

function injectModalTemplate(templateId) {
    const body = document.getElementById('modal-body');
    if (!body) return;
    body.innerHTML = '';
    if (!templateId) return;
    const template = document.getElementById(templateId);
    if (template && 'content' in template) {
        body.appendChild(template.content.cloneNode(true));
        wireTemplateInteractions(templateId);
    }
}

function wireTemplateInteractions(templateId) {
    const body = document.getElementById('modal-body');
    if (!body) return;

    if (templateId === 'template-patch-designer') {
        const randomBtn = body.querySelector('[data-patch-action="randomize"]');
        if (randomBtn) {
            randomBtn.addEventListener('click', () => {
                generateAIPatch();
            });
        }
    }

    if (templateId === 'template-preset-library') {
        const openBtn = body.querySelector('[data-preset-action="open-browser"]');
        if (openBtn) {
            openBtn.addEventListener('click', () => {
                focusPresetWorkflow();
            });
        }
    }

    if (templateId === 'template-cli') {
        const cliBtn = body.querySelector('[data-cli-action="launch"]');
        if (cliBtn) {
            cliBtn.addEventListener('click', () => {
                launchCliTerminal();
            });
        }
    }
}

function launchPatchDesignerModal() {
    if (HAOS?.aiSystem?.initPatchDesigner) {
        HAOS.aiSystem.initPatchDesigner();
    }
    openStudioModal({
        title: 'AI Patch Designer',
        description: 'Blend techno drive with trap swagger and randomize neural patch routings.',
        templateId: 'template-patch-designer',
        primaryText: 'Generate Patch',
        onPrimary: () => generateAIPatch()
    });
}

function launchPresetLibraryModal() {
    openStudioModal({
        title: 'Hybrid Preset Library',
        description: 'Browse curated banks and inject them straight into the Pro rack.',
        templateId: 'template-preset-library',
        pill: 'BASIC → PRO',
        primaryText: 'Focus Pro Rack',
        onPrimary: () => focusPresetWorkflow()
    });
}

function launchCliModal() {
    openStudioModal({
        title: 'HAOS CLI & Automation',
        description: 'Pipe patterns to Ableton, render stems, or script modulation remotely.',
        templateId: 'template-cli',
        primaryText: 'Open CLI',
        onPrimary: () => launchCliTerminal()
    });
}

function focusPresetWorkflow() {
    setActiveMode('pro');
    closeStudioModal();
    showStudioToast('Select an instrument, then inject presets from the Advanced drawer.');
}

function generateAIPatch() {
    if (!HAOS?.aiSystem) {
        showStudioToast('Initialize the HAOS system to access AI patching.');
        return;
    }
    const patch = HAOS.aiSystem.generatePatch?.(STUDIO.currentGenre, 'bass', 'hybrid');
    if (patch) {
        HAOS.aiSystem.applyPatch?.(patch);
        showStudioToast('AI patch injected into the current rack.');
    } else {
        showStudioToast('Unable to generate patch at this time.');
    }
}

function launchCliTerminal() {
    if (window.AbletonCLI && typeof window.AbletonCLI.open === 'function') {
        window.AbletonCLI.open();
        closeStudioModal();
        showStudioToast('CLI bridge connected. Type commands to automate your rig.');
    } else {
        showStudioToast('Run `haos cli` locally to connect Ableton automation.');
    }
}

// --- GENRE SWITCHING ---
window.switchGenre = async function(genre) {
    if (STUDIO.currentGenre === genre && STUDIO.instruments.length > 0) return;
    
    console.log(`Switching to ${genre}...`);
    STUDIO.currentGenre = genre;
    
    // Update UI Buttons
    document.querySelectorAll('.genre-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.genre === genre);
    });

    // Clear Rack
    const rack = document.getElementById('instrument-rack');
    rack.innerHTML = '';
    STUDIO.instruments = [];

    // Stop current playback if playing
    if (HAOS.state.playbackState === 'playing') {
        HAOS.stop();
        STUDIO.instruments.forEach(inst => {
            if (inst.stop) inst.stop();
        });
        updatePlayButton(false);
    }

    // Load New Instruments
    const config = GENRES[genre];
    for (const instConfig of config) {
        await createInstrumentPanel(instConfig, rack);
    }
};

// --- INSTRUMENT CREATION ---
async function createInstrumentPanel(config, container) {
    // 1. Get Synth Instance via HAOS Engine Manager
    let synth;
    try {
        if (config.type === 'tb303') synth = HAOS.engineManager.createTB303();
        else if (config.type === 'tr808') synth = HAOS.engineManager.createTR808();
        else if (config.type === 'tr909') synth = HAOS.engineManager.createTR909();
        else if (config.type === 'arp2600') synth = HAOS.engineManager.createARP2600();
        else if (config.type === 'strings') synth = HAOS.engineManager.createStringMachine();
    } catch (e) {
        console.error('Error creating synth:', e);
        return;
    }
    
    if (!synth) return;
    
    // Ensure synth is in our list
    if (!STUDIO.instruments.includes(synth)) {
        STUDIO.instruments.push(synth);
    }

    // 2. Create DOM Elements
    const panel = document.createElement('div');
    panel.className = 'instrument-panel';
    panel.dataset.type = config.type;
    panel.style.setProperty('--accent-color', config.color);
    
    // Generate ID for sequencer
    const synthId = config.type + '-' + Date.now();
    
    panel.innerHTML = `
        <div class="panel-header">
            <div class="instrument-name">${config.name}</div>
            <div class="instrument-type">${config.type.toUpperCase()}</div>
        </div>
        
        <div class="controls-grid">
            ${generateKnobs(config.type)}
        </div>

        <div class="sequencer-strip" id="seq-${synthId}">
            ${generateSequencerSteps(16)}
        </div>

        ${(config.type === 'tr808' || config.type === 'tr909') ? generateMixerControls(config.type) : ''}

        ${(config.type === 'arp2600') ? generatePatchBay(config.type) : ''}

        <div class="patch-management">
            <button class="patch-btn patch-bay-toggle" title="Toggle Patch Bay"><i class="fas fa-project-diagram"></i></button>
            <input type="text" class="patch-name" placeholder="Patch Name">
            <button class="patch-btn save-patch" title="Save Patch"><i class="fas fa-save"></i></button>
            <button class="patch-btn load-patch" title="Load Patch"><i class="fas fa-folder-open"></i></button>
            <button class="patch-btn random-patch" title="Randomize Patch"><i class="fas fa-random"></i></button>
        </div>
    `;

    container.appendChild(panel);

    // 3. Bind Events
    bindKnobs(panel, synth);
    bindSequencer(panel, synth);
    bindPatchControls(panel, synth, config.type);

    if (config.type === 'tr808' || config.type === 'tr909') {
        bindMixerControls(panel, synth);
    }

    if (config.type === 'arp2600') {
        const patchBayToggle = panel.querySelector('.patch-bay-toggle');
        const patchBay = panel.querySelector('.patch-bay');
        patchBayToggle.addEventListener('click', () => {
            patchBay.classList.toggle('visible');
        });
        bindPatchBay(panel, synth);
    }
}

function generatePatchBay(type) {
    if (type !== 'arp2600') return '';

    const sources = [
        { group: 'VCOs', items: ['vco1_saw', 'vco1_square', 'vco2_saw', 'vco2_square', 'vco3_sine'] },
        { group: 'LFO', items: ['lfo_sine', 'lfo_square'] },
        { group: 'Envelopes', items: ['env1', 'env2'] },
        { group: 'Noise', items: ['noise_white', 'noise_pink'] }
    ];

    const destinations = [
        { group: 'VCOs', items: ['vco1_pitch', 'vco2_pitch', 'vco1_pwm', 'vco2_pwm'] },
        { group: 'VCF', items: ['vcf_cutoff', 'vcf_resonance'] },
        { group: 'VCA', items: ['vca_gain'] }
    ];

    return `
        <div class="patch-bay">
            <div class="patch-bay-header">ARP 2600 PATCH BAY</div>
            <div class="patch-bay-grid">
                ${destinations.map(destGroup => `
                    <div class="patch-column">
                        <div class="patch-group-title">${destGroup.group}</div>
                        ${destGroup.items.map(dest => `
                            <div class="patch-point" data-destination="${dest}">
                                <label>${dest.split('_')[1].toUpperCase()}</label>
                                <select class="patch-select" data-dest="${dest}">
                                    <option value="none">---</option>
                                    ${sources.map(srcGroup => `
                                        <optgroup label="${srcGroup.group}">
                                            ${srcGroup.items.map(src => `<option value="${src}">${src.replace('_', ' ').toUpperCase()}</option>`).join('')}
                                        </optgroup>
                                    `).join('')}
                                </select>
                            </div>
                        `).join('')}
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function generateMixerControls(type) {
    const sounds = (type === 'tr808') 
        ? ['kick', 'snare', 'hat', 'clap'] 
        : ['kick', 'snare', 'hatClosed', 'hatOpen', 'tomLow', 'tomMid'];

    return `
        <div class="mixer-controls">
            <div class="mixer-header">DRUM MIXER</div>
            ${sounds.map(sound => `
                <div class="mixer-channel" data-sound="${sound}">
                    <label>${sound.toUpperCase()}</label>
                    <div class="fader-container">
                        <input type="range" class="fader volume-fader" min="0" max="1" step="0.01" value="1">
                    </div>
                    <div class="knob-wrapper mini-knob">
                        <div class="knob-circle tune-knob" data-param="tune"></div>
                        <div class="knob-label">TUNE</div>
                    </div>
                    <div class="knob-wrapper mini-knob">
                        <div class="knob-circle decay-knob" data-param="decay"></div>
                        <div class="knob-label">DECAY</div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function generateKnobs(type) {
    // Define knobs based on synth type
    let knobs = [];
    if (type === 'tb303') {
        knobs = [
            { param: 'cutoff', label: 'CUTOFF' },
            { param: 'resonance', label: 'RESON' },
            { param: 'envMod', label: 'ENV MOD' },
            { param: 'decay', label: 'DECAY' },
            { param: 'distortion', label: 'DIST' },
            { param: 'glide', label: 'GLIDE' }
        ];
    } else if (type === 'tr808' || type === 'tr909') {
        knobs = [
            { param: 'volume', label: 'LEVEL' },
            { param: 'tempo', label: 'SWING' }, // Mock param
            { param: 'tone', label: 'TONE' },
            { param: 'decay', label: 'DECAY' },
            { param: 'distortion', label: 'DRIVE' }
        ];
    } else if (type === 'arp2600') {
        knobs = [
            { param: 'waveform', label: 'WAVE' },
            { param: 'cutoff', label: 'CUTOFF' },
            { param: 'attack', label: 'ATTACK' },
            { param: 'release', label: 'RELEASE' },
            { param: 'lfo', label: 'LFO' },
            { param: 'unison', label: 'UNISON' },
            { param: 'detune', label: 'DETUNE' },
            { param: 'reverb', label: 'VERB' }
        ];
    } else {
        knobs = [
            { param: 'attack', label: 'ATTACK' },
            { param: 'release', label: 'RELEASE' },
            { param: 'cutoff', label: 'CUTOFF' },
            { param: 'lfo', label: 'LFO' },
            { param: 'reverb', label: 'VERB' },
            { param: 'delay', label: 'DELAY' }
        ];
    }

    return knobs.map(k => `
        <div class="knob-wrapper">
            <div class="knob-circle" data-param="${k.param}"></div>
            <div class="knob-label">${k.label}</div>
        </div>
    `).join('');
}

function generateSequencerSteps(count) {
    let html = '';
    for (let i = 0; i < count; i++) {
        html += `<div class="seq-step" data-step="${i}"></div>`;
    }
    return html;
}

// --- INTERACTION BINDING ---
function bindKnobs(panel, synth) {
    const knobs = panel.querySelectorAll('.knob-circle');
    const type = panel.dataset.type;
    
    knobs.forEach(knob => {
        let isDragging = false;
        let startY = 0;
        let value = 0.5; // Default center
        knob.dataset.value = value; // Store for Living System

        knob.addEventListener('mousedown', (e) => {
            isDragging = true;
            startY = e.clientY;
            document.body.style.cursor = 'ns-resize';
        });

        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const delta = startY - e.clientY;
            value = Math.min(1, Math.max(0, value + delta * 0.01));
            knob.dataset.value = value; // Update stored value
            startY = e.clientY; // Reset for relative movement

            // Update Visual
            const rotation = (value * 270) - 135;
            knob.style.setProperty('--rotation', `${rotation}deg`);

            // Update Synth
            const param = knob.dataset.param;
            updateSynthParam(synth, type, param, value);
        });

        window.addEventListener('mouseup', () => {
            isDragging = false;
            document.body.style.cursor = 'default';
        });
    });
}

function updateSynthParam(synth, type, param, value) {
    if (!synth) return;

    try {
        if (type === 'tb303') {
            // TB-303 Scaling
            if (param === 'cutoff') synth.setParam('cutoff', 50 + value * 3000);
            else if (param === 'resonance') synth.setParam('resonance', 1 + value * 20);
            else if (param === 'envMod') synth.setParam('envMod', value * 100);
            else if (param === 'decay') synth.setParam('decay', 0.1 + value * 2.0);
            else if (param === 'distortion') {
                if (synth.setDistortion) synth.setDistortion(value * 100);
            }
            else if (param === 'glide') {
                 if (synth.setParam) synth.setParam('glide', value * 0.1);
            }
        } 
        else if (type === 'tr808' || type === 'tr909') {
            // Drum Machine Scaling (Simplified: Affects Kick or Master)
            if (param === 'volume') {
                if (synth.masterVolume !== undefined) synth.masterVolume = value;
            }
            else if (param === 'tone') {
                // Affect Kick Tone
                if (synth.setDrumModulation) synth.setDrumModulation('kick', 'toneColor', value * 100);
                if (synth.params && synth.params.kick) synth.params.kick.attack = value * 0.1;
            }
            else if (param === 'decay') {
                // Affect Kick Decay
                if (synth.setDrumModulation) synth.setDrumModulation('kick', 'pitchDecay', value * 1.0);
                if (synth.params && synth.params.kick) synth.params.kick.decay = value;
            }
            else if (param === 'distortion') {
                if (synth.setDistortion) synth.setDistortion(value * 50);
            }
        }
        else if (type === 'arp2600') {
            // ARP 2600 Scaling
            if (param === 'cutoff') {
                if (synth.vcf) synth.vcf.cutoff = 50 + value * 5000;
            }
            else if (param === 'attack') {
                if (synth.adsr) synth.adsr.attack = value * 2.0;
            }
            else if (param === 'release') {
                if (synth.adsr) synth.adsr.release = value * 4.0;
            }
            else if (param === 'lfo') {
                if (synth.lfo) synth.lfo.rate = value * 20;
            }
            else if (param === 'reverb') {
                if (synth.setReverb) synth.setReverb(value);
            }
            else if (param === 'delay') {
                if (synth.setDelay) synth.setDelay(value, 0.5); // Assuming 0.5 feedback
            }
            else if (param === 'waveform') {
                if (synth.setOscillatorType) {
                    const waves = ['sine', 'triangle', 'sawtooth', 'square'];
                    synth.setOscillatorType(waves[Math.floor(value * (waves.length - 0.01))]);
                }
            }
            else if (param === 'unison') {
                if (synth.setUnison) synth.setUnison(1 + Math.floor(value * 6));
            }
            else if (param === 'detune') {
                if (synth.setDetune) synth.setDetune(value * 50);
            }
        }
        else if (type === 'strings') {
             // String Machine
             if (param === 'attack') {
                 if (synth.setEnvelope) synth.setEnvelope(value * 2.0, synth.envelope.release);
             }
             else if (param === 'release') {
                 if (synth.setEnvelope) synth.setEnvelope(synth.envelope.attack, value * 4.0);
             }
             else if (param === 'cutoff') {
                 if (synth.setFilter) synth.setFilter(value * 5000, synth.filter.resonance);
             }
             else if (param === 'reverb') {
                if (synth.setReverb) synth.setReverb(value);
             }
             else if (param === 'delay') {
                if (synth.setDelay) synth.setDelay(value, 0.5);
             }
        }
    } catch (e) {
        console.warn('Param update failed:', e);
    }
}


function bindSequencer(panel, synth) {
    const steps = panel.querySelectorAll('.seq-step');
    
    steps.forEach(step => {
        step.addEventListener('click', () => {
            step.classList.toggle('active');
            const stepIndex = parseInt(step.dataset.step);
            const isActive = step.classList.contains('active');
            
            // Update Synth Pattern
            if (synth && synth.toggleStep) {
                synth.toggleStep(stepIndex, isActive);
            }
        });
    });
}

function bindPatchControls(panel, synth, instrumentType) {
    const saveBtn = panel.querySelector('.save-patch');
    const loadBtn = panel.querySelector('.load-patch');
    const randomBtn = panel.querySelector('.random-patch');
    const nameInput = panel.querySelector('.patch-name');

    // --- SAVE PATCH ---
    saveBtn.addEventListener('click', async () => {
        const patchName = nameInput.value.trim();
        if (!patchName) {
            alert('Please enter a name for the patch.');
            return;
        }

        const patchData = synth.getPatch();
        
        try {
            const response = await fetch('/api/patches', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: patchName,
                    instrument: instrumentType,
                    data: patchData
                })
            });

            if (!response.ok) {
                throw new Error(`Server responded with ${response.status}`);
            }

            const savedPatch = await response.json();
            console.log('Patch saved:', savedPatch);
            alert(`Patch "${savedPatch.name}" saved successfully!`);
            nameInput.value = '';
        } catch (error) {
            console.error('Error saving patch:', error);
            alert('Failed to save patch. See console for details.');
        }
    });

    // --- LOAD PATCH ---
    loadBtn.addEventListener('click', async () => {
        try {
            const response = await fetch(`/api/patches/${instrumentType}`);
            if (!response.ok) throw new Error('Failed to fetch patches.');
            
            const patches = await response.json();
            if (patches.length === 0) {
                alert(`No saved patches found for ${instrumentType}.`);
                return;
            }

            showPatchLoadModal(patches, (selectedPatch) => {
                synth.setPatch(selectedPatch.data);
                // After setting the patch, we need to update the UI knobs to reflect the new state.
                updateUIAfterPatchLoad(panel, selectedPatch.data);
                alert(`Patch "${selectedPatch.name}" loaded.`);
            });

        } catch (error) {
            console.error('Error loading patches:', error);
            alert('Failed to load patches. See console for details.');
        }
    });

    // --- RANDOMIZE PATCH (Placeholder) ---
    randomBtn.addEventListener('click', () => {
        // This will eventually use the AI Patch Designer
        if (synth.randomize) {
            synth.randomize(); // Assuming a simple randomize method for now
            alert('Patch randomized!');
        } else {
            alert('Randomize feature not yet implemented for this instrument.');
        }
    });
}

function showPatchLoadModal(patches, onSelect) {
    // Remove existing modal if any
    const existingModal = document.getElementById('patch-load-modal');
    if (existingModal) existingModal.remove();

    // Create modal
    const modal = document.createElement('div');
    modal.id = 'patch-load-modal';
    modal.style.cssText = `
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
        background: rgba(20, 20, 20, 0.95); border: 1px solid #39FF14;
        padding: 20px; z-index: 1000; color: white; max-height: 80vh; overflow-y: auto;
    `;

    const list = patches.map(p => `
        <div class="patch-list-item" data-id="${p.id}" style="padding: 10px; cursor: pointer; border-bottom: 1px solid #333;">
            ${p.name} <span style="font-size: 0.8em; color: #888;">(${new Date(p.createdAt).toLocaleDateString()})</span>
        </div>
    `).join('');

    modal.innerHTML = `
        <h3 style="margin-top: 0;">Load Patch</h3>
        <div class="patch-list">${list}</div>
        <button id="close-patch-modal" style="margin-top: 15px;">Close</button>
    `;

    document.body.appendChild(modal);

    // Event Listeners
    modal.querySelector('#close-patch-modal').addEventListener('click', () => modal.remove());
    modal.querySelectorAll('.patch-list-item').forEach(item => {
        item.addEventListener('click', () => {
            const patchId = parseInt(item.dataset.id);
            const selectedPatch = patches.find(p => p.id === patchId);
            if (selectedPatch) {
                onSelect(selectedPatch);
            }
            modal.remove();
        });
    });
}

function updateUIAfterPatchLoad(panel, patchData) {
    if (!patchData.params) return;

    const knobs = panel.querySelectorAll('.knob-circle');
    const type = panel.dataset.type;

    Object.keys(patchData.params).forEach(param => {
        const knob = panel.querySelector(`.knob-circle[data-param="${param}"]`);
        if (!knob) return;

        let value;
        // This is the inverse of the scaling in updateSynthParam
        if (type === 'tb303') {
            if (param === 'cutoff') value = (patchData.params.cutoff - 50) / 3000;
            else if (param === 'resonance') value = (patchData.params.resonance - 1) / 20;
            else if (param === 'envMod') value = patchData.params.envMod / 100;
            else if (param === 'decay') value = (patchData.params.decay - 0.1) / 2.0;
            else if (param === 'distortion') value = patchData.params.distortion / 100;
            else if (param === 'glide') value = patchData.params.glide / 0.1;
            else value = 0.5;
        } else { // Add other synth types here
            value = 0.5; // Default for un-scaled params
        }
        
        value = Math.min(1, Math.max(0, value)); // Clamp to 0-1 range
        knob.dataset.value = value;
        const rotation = (value * 270) - 135;
        knob.style.setProperty('--rotation', `${rotation}deg`);
    });
}

function bindMixerControls(panel, synth) {
    const channels = panel.querySelectorAll('.mixer-channel');

    channels.forEach(channel => {
        const sound = channel.dataset.sound;
        const volumeFader = channel.querySelector('.volume-fader');
        const tuneKnob = channel.querySelector('.tune-knob');
        const decayKnob = channel.querySelector('.decay-knob');

        // Bind Volume Fader
        volumeFader.addEventListener('input', (e) => {
            synth.setParam(sound, 'volume', e.target.value);
        });

        // Bind Tune Knob (using existing knob logic)
        bindMiniKnob(tuneKnob, (value) => {
            // Scale tune from -12 to +12 semitones
            const tuneValue = (value - 0.5) * 24;
            synth.setParam(sound, 'tune', tuneValue);
        });

        // Bind Decay Knob
        bindMiniKnob(decayKnob, (value) => {
            // Scale decay appropriately (e.g., 0.01 to 2.0 seconds)
            const decayValue = 0.01 + (value * 2.0);
            synth.setParam(sound, 'decay', decayValue);
        });
    });
}

function bindPatchBay(panel, synth) {
    const selects = panel.querySelectorAll('.patch-select');
    selects.forEach(select => {
        select.addEventListener('change', (e) => {
            const source = e.target.value;
            const destination = e.target.dataset.dest;

            console.log(`Patching ${source} to ${destination}`);
            
            if (synth.addPatch) {
                // First, clear any existing patch for this destination
                if(synth.clearPatchesForDestination) synth.clearPatchesForDestination(destination);
                if (source !== 'none') {
                    synth.addPatch(source, destination);
                }
            }
        });
    });
}

function bindMiniKnob(knob, onUpdate) {
    let isDragging = false;
    let startY = 0;
    let value = 0.5; // Default center
    knob.dataset.value = value;

    knob.addEventListener('mousedown', (e) => {
        isDragging = true;
        startY = e.clientY;
        document.body.style.cursor = 'ns-resize';
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const delta = startY - e.clientY;
        value = Math.min(1, Math.max(0, value + delta * 0.01));
        knob.dataset.value = value;
        startY = e.clientY;

        const rotation = (value * 270) - 135;
        knob.style.setProperty('--rotation', `${rotation}deg`);

        onUpdate(value);
    });

    window.addEventListener('mouseup', () => {
        isDragging = false;
        document.body.style.cursor = 'default';
    });
}

// --- TRANSPORT ---
function setupTransport() {
    const playBtn = document.getElementById('play-btn');
    playBtn.addEventListener('click', () => {
        if (!HAOS.initialized) return;
        
        // Toggle Playback State
        if (HAOS.state.playbackState === 'playing') {
            HAOS.stop();
            // Stop our instruments
            STUDIO.instruments.forEach(inst => {
                if (inst.stop) inst.stop();
            });
        } else {
            HAOS.play();
            // Play our instruments
            STUDIO.instruments.forEach(inst => {
                if (inst.play) inst.play();
            });
        }
        
        updatePlayButton(HAOS.state.playbackState === 'playing');
    });
}

function updatePlayButton(isPlaying) {
    const btn = document.getElementById('play-btn');
    const icon = btn.querySelector('i');
    
    if (isPlaying) {
        btn.classList.add('playing');
        icon.className = 'fas fa-stop';
    } else {
        btn.classList.remove('playing');
        icon.className = 'fas fa-play';
    }
}

// --- VISUALIZER ---
function setupVisualizer() {
    const canvas = document.getElementById('main-visualizer');
    STUDIO.visualizerCtx = canvas.getContext('2d');
    
    // Resize handler
    const resize = () => {
        canvas.width = canvas.parentElement.offsetWidth;
        canvas.height = canvas.parentElement.offsetHeight;
    };
    window.addEventListener('resize', resize);
    resize();
}

function startVisualizer() {
    if (!HAOS.context) return;
    
    // Create Analyser if not exists
    if (!STUDIO.analyser) {
        STUDIO.analyser = HAOS.context.createAnalyser();
        STUDIO.analyser.fftSize = 256;
        HAOS.masterGain.connect(STUDIO.analyser);
    }

    const bufferLength = STUDIO.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const ctx = STUDIO.visualizerCtx;
    const canvas = ctx.canvas;

    function draw() {
        requestAnimationFrame(draw);
        
        STUDIO.analyser.getByteFrequencyData(dataArray);

        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / bufferLength) * 2.5;
        let barHeight;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            barHeight = dataArray[i] / 2;

            // Dynamic Color based on Genre
            let color = '#fff';
            if (STUDIO.currentGenre === 'techno') color = `rgb(57, ${barHeight + 100}, 20)`;
            if (STUDIO.currentGenre === 'trap') color = `rgb(255, 0, ${barHeight + 50})`;
            if (STUDIO.currentGenre === 'ambient') color = `rgb(0, ${barHeight + 100}, 255)`;

            ctx.fillStyle = color;
            ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

            x += barWidth + 1;
        }
    }
    draw();
}
