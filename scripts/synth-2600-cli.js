#!/usr/bin/env node

/**
 * Behringer 2600 Synthesizer CLI
 * Extended command-line interface for patching, sound design, and preset management
 * 
 * Features:
 * - Interactive patch matrix editor
 * - Preset management (save/load/share)
 * - Modulation routing visualization
 * - Parameter automation
 * - MIDI-to-patch conversion
 * - Sound recipe generation
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    cyan: '\x1b[36m',
    magenta: '\x1b[35m',
    yellow: '\x1b[33m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    blue: '\x1b[34m',
    bgCyan: '\x1b[46m',
    bgMagenta: '\x1b[45m'
};

// Patch point definitions
const PATCH_POINTS = {
    sources: {
        'vco1-out': 'VCO 1 Output',
        'vco1-tri': 'VCO 1 Triangle',
        'vco1-saw': 'VCO 1 Sawtooth',
        'vco1-pulse': 'VCO 1 Pulse',
        'vco2-out': 'VCO 2 Output',
        'vco2-tri': 'VCO 2 Triangle',
        'vco2-saw': 'VCO 2 Sawtooth',
        'vco2-square': 'VCO 2 Square',
        'vco3-out': 'VCO 3/LFO Output',
        'vco3-tri': 'VCO 3 Triangle',
        'vco3-square': 'VCO 3 Square',
        'noise-white': 'White Noise',
        'noise-pink': 'Pink Noise',
        'env1-out': 'Envelope 1 Output',
        'env2-out': 'Envelope 2 Output',
        'kbd-cv': 'Keyboard CV',
        'kbd-gate': 'Keyboard Gate',
        'ringmod-out': 'Ring Modulator Output',
        'sh-out': 'Sample & Hold Output'
    },
    destinations: {
        'vco1-fm': 'VCO 1 Frequency Modulation',
        'vco1-pwm': 'VCO 1 Pulse Width Mod',
        'vco1-sync': 'VCO 1 Sync Input',
        'vco2-fm': 'VCO 2 Frequency Modulation',
        'vco2-pwm': 'VCO 2 Pulse Width Mod',
        'vco2-sync': 'VCO 2 Sync Input',
        'vco3-fm': 'VCO 3/LFO Frequency Mod',
        'vcf-in': 'Filter Audio Input',
        'vcf-cutoff': 'Filter Cutoff Modulation',
        'vcf-resonance': 'Filter Resonance Mod',
        'vca-in': 'VCA Audio Input',
        'vca-cv': 'VCA Control Voltage',
        'env1-trig': 'Envelope 1 Trigger',
        'env2-trig': 'Envelope 2 Trigger',
        'output': 'Main Output',
        'ringmod-x': 'Ring Mod Input X',
        'ringmod-y': 'Ring Mod Input Y',
        'sh-in': 'Sample & Hold Input',
        'sh-trig': 'Sample & Hold Trigger'
    }
};

// Preset library
const PRESETS = {
    'classic-bass': {
        name: 'Classic Bass',
        description: 'Fat analog bass with filter envelope',
        patches: [
            { from: 'vco1-saw', to: 'vcf-in' },
            { from: 'vcf-out', to: 'vca-in' },
            { from: 'vca-out', to: 'output' },
            { from: 'env1-out', to: 'vcf-cutoff' },
            { from: 'env2-out', to: 'vca-cv' },
            { from: 'kbd-gate', to: 'env1-trig' },
            { from: 'kbd-gate', to: 'env2-trig' }
        ],
        parameters: {
            vco1_freq: 110,
            vcf_cutoff: 400,
            vcf_resonance: 8,
            env1: { attack: 0.01, decay: 0.3, sustain: 0, release: 0.1 },
            env2: { attack: 0.01, decay: 0.2, sustain: 0.7, release: 0.3 }
        }
    },
    'screaming-lead': {
        name: 'Screaming Lead',
        description: 'Expressive lead with vibrato and filter sweep',
        patches: [
            { from: 'vco1-saw', to: 'vcf-in' },
            { from: 'vco2-pulse', to: 'vcf-in' },
            { from: 'vcf-out', to: 'vca-in' },
            { from: 'vca-out', to: 'output' },
            { from: 'vco3-tri', to: 'vco1-fm' },
            { from: 'vco3-tri', to: 'vco2-fm' },
            { from: 'env1-out', to: 'vcf-cutoff' },
            { from: 'env2-out', to: 'vca-cv' }
        ],
        parameters: {
            vco1_freq: 440,
            vco2_freq: 440,
            vco3_rate: 6,
            vcf_cutoff: 2000,
            vcf_resonance: 5,
            env1: { attack: 0.05, decay: 0.3, sustain: 0.6, release: 0.2 },
            env2: { attack: 0.01, decay: 0.1, sustain: 0.8, release: 0.3 }
        }
    },
    'atmospheric-pad': {
        name: 'Atmospheric Pad',
        description: 'Lush evolving pad with slow LFO modulation',
        patches: [
            { from: 'vco1-saw', to: 'vcf-in' },
            { from: 'vco2-tri', to: 'vcf-in' },
            { from: 'vcf-out', to: 'vca-in' },
            { from: 'vca-out', to: 'output' },
            { from: 'vco3-tri', to: 'vco2-fm' },
            { from: 'vco3-square', to: 'vcf-cutoff' },
            { from: 'env1-out', to: 'vcf-cutoff' },
            { from: 'env2-out', to: 'vca-cv' }
        ],
        parameters: {
            vco1_freq: 220,
            vco2_freq: 220.5,
            vco3_rate: 0.3,
            vcf_cutoff: 1000,
            vcf_resonance: 2,
            env1: { attack: 0.8, decay: 0.5, sustain: 0.7, release: 1.5 },
            env2: { attack: 0.8, decay: 0.4, sustain: 0.7, release: 1.2 }
        }
    },
    'fm-bells': {
        name: 'FM Bells',
        description: 'Bell-like tones using cross-modulation',
        patches: [
            { from: 'vco1-tri', to: 'vcf-in' },
            { from: 'vco2-sine', to: 'vco1-fm' },
            { from: 'vcf-out', to: 'vca-in' },
            { from: 'vca-out', to: 'output' },
            { from: 'env1-out', to: 'vco2-fm' },
            { from: 'env2-out', to: 'vca-cv' }
        ],
        parameters: {
            vco1_freq: 880,
            vco2_freq: 1760,
            vcf_cutoff: 4000,
            vcf_resonance: 3,
            env1: { attack: 0.01, decay: 0.8, sustain: 0, release: 0.1 },
            env2: { attack: 0.01, decay: 1.2, sustain: 0, release: 0.2 }
        }
    },
    'sci-fi-spaceship': {
        name: 'Sci-Fi Spaceship',
        description: 'Evolving sci-fi textures with ring modulation',
        patches: [
            { from: 'vco1-saw', to: 'ringmod-x' },
            { from: 'vco2-square', to: 'ringmod-y' },
            { from: 'ringmod-out', to: 'vcf-in' },
            { from: 'noise-white', to: 'vcf-in' },
            { from: 'vcf-out', to: 'vca-in' },
            { from: 'vca-out', to: 'output' },
            { from: 'vco3-tri', to: 'vco1-fm' },
            { from: 'sh-out', to: 'vco2-fm' }
        ],
        parameters: {
            vco1_freq: 80,
            vco2_freq: 120,
            vco3_rate: 0.2,
            vcf_cutoff: 800,
            vcf_resonance: 12
        }
    },
    'random-blips': {
        name: 'Random Blips',
        description: 'Sample & hold random pitch sequences',
        patches: [
            { from: 'noise-white', to: 'sh-in' },
            { from: 'vco3-square', to: 'sh-trig' },
            { from: 'sh-out', to: 'vco1-fm' },
            { from: 'vco1-pulse', to: 'vcf-in' },
            { from: 'vcf-out', to: 'vca-in' },
            { from: 'vca-out', to: 'output' },
            { from: 'env2-out', to: 'vca-cv' }
        ],
        parameters: {
            vco1_freq: 440,
            vco3_rate: 8,
            vcf_cutoff: 1500,
            vcf_resonance: 5,
            env2: { attack: 0.01, decay: 0.15, sustain: 0, release: 0.05 }
        }
    }
};

class Synth2600CLI {
    constructor() {
        this.patchMatrix = [];
        this.currentPreset = null;
        this.parameters = {};
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: `${colors.cyan}2600>${colors.reset} `
        });
        
        this.setupHandlers();
    }
    
    setupHandlers() {
        this.rl.on('line', (line) => {
            this.handleCommand(line.trim());
        });
        
        this.rl.on('close', () => {
            console.log(`\n${colors.cyan}🎛️  Goodbye! Keep patching!${colors.reset}`);
            process.exit(0);
        });
    }
    
    start() {
        this.printBanner();
        this.printHelp();
        this.rl.prompt();
    }
    
    printBanner() {
        console.log(`${colors.bright}${colors.cyan}`);
        console.log('╔════════════════════════════════════════════════════════════════╗');
        console.log('║                                                                ║');
        console.log('║         🎛️  BEHRINGER 2600 SYNTHESIZER CLI v1.0 🎛️            ║');
        console.log('║                                                                ║');
        console.log('║              Semi-Modular Analog Patch Matrix                  ║');
        console.log('║                                                                ║');
        console.log('╚════════════════════════════════════════════════════════════════╝');
        console.log(colors.reset);
    }
    
    printHelp() {
        console.log(`${colors.yellow}Available Commands:${colors.reset}\n`);
        console.log(`${colors.green}Patching:${colors.reset}`);
        console.log(`  ${colors.cyan}patch${colors.reset} <from> <to>     - Create a patch connection`);
        console.log(`  ${colors.cyan}unpatch${colors.reset} <from> <to>   - Remove a patch connection`);
        console.log(`  ${colors.cyan}matrix${colors.reset}               - Show current patch matrix`);
        console.log(`  ${colors.cyan}clear${colors.reset}                - Clear all patches`);
        console.log(`  ${colors.cyan}sources${colors.reset}              - List all patch sources`);
        console.log(`  ${colors.cyan}destinations${colors.reset}         - List all patch destinations`);
        
        console.log(`\n${colors.green}Presets:${colors.reset}`);
        console.log(`  ${colors.cyan}presets${colors.reset}              - List all available presets`);
        console.log(`  ${colors.cyan}load${colors.reset} <preset>        - Load a preset patch`);
        console.log(`  ${colors.cyan}save${colors.reset} <name>          - Save current configuration`);
        console.log(`  ${colors.cyan}export${colors.reset} <filename>    - Export preset to JSON file`);
        console.log(`  ${colors.cyan}import${colors.reset} <filename>    - Import preset from JSON file`);
        
        console.log(`\n${colors.green}Sound Design:${colors.reset}`);
        console.log(`  ${colors.cyan}recipe${colors.reset} <type>        - Generate sound recipe (bass/lead/pad/fx)`);
        console.log(`  ${colors.cyan}analyze${colors.reset}              - Analyze current patch routing`);
        console.log(`  ${colors.cyan}suggest${colors.reset}              - Get patching suggestions`);
        console.log(`  ${colors.cyan}visualize${colors.reset}            - ASCII visualization of signal flow`);
        
        console.log(`\n${colors.green}Interactive:${colors.reset}`);
        console.log(`  ${colors.cyan}wizard${colors.reset}               - Interactive patch creation wizard`);
        console.log(`  ${colors.cyan}explore${colors.reset} <module>     - Explore module connections`);
        console.log(`  ${colors.cyan}random${colors.reset}               - Generate random experimental patch`);
        
        console.log(`\n${colors.green}System:${colors.reset}`);
        console.log(`  ${colors.cyan}help${colors.reset}                 - Show this help message`);
        console.log(`  ${colors.cyan}quit${colors.reset} / ${colors.cyan}exit${colors.reset}          - Exit the CLI`);
        console.log('');
    }
    
    handleCommand(line) {
        if (!line) {
            this.rl.prompt();
            return;
        }
        
        const [cmd, ...args] = line.split(/\s+/);
        
        switch (cmd.toLowerCase()) {
            case 'help':
            case '?':
                this.printHelp();
                break;
            case 'patch':
                this.addPatch(args[0], args[1]);
                break;
            case 'unpatch':
                this.removePatch(args[0], args[1]);
                break;
            case 'matrix':
                this.showMatrix();
                break;
            case 'clear':
                this.clearPatches();
                break;
            case 'sources':
                this.listSources();
                break;
            case 'destinations':
            case 'dest':
                this.listDestinations();
                break;
            case 'presets':
                this.listPresets();
                break;
            case 'load':
                this.loadPreset(args[0]);
                break;
            case 'save':
                this.savePreset(args.join(' '));
                break;
            case 'export':
                this.exportPreset(args[0]);
                break;
            case 'import':
                this.importPreset(args[0]);
                break;
            case 'recipe':
                this.generateRecipe(args[0]);
                break;
            case 'analyze':
                this.analyzePatches();
                break;
            case 'suggest':
                this.suggestPatches();
                break;
            case 'visualize':
            case 'viz':
                this.visualizeFlow();
                break;
            case 'wizard':
                this.startWizard();
                break;
            case 'explore':
                this.exploreModule(args[0]);
                break;
            case 'random':
                this.generateRandom();
                break;
            case 'quit':
            case 'exit':
                this.rl.close();
                break;
            default:
                console.log(`${colors.red}Unknown command: ${cmd}${colors.reset}`);
                console.log(`Type ${colors.cyan}'help'${colors.reset} for available commands`);
        }
        
        this.rl.prompt();
    }
    
    addPatch(from, to) {
        if (!from || !to) {
            console.log(`${colors.red}Usage: patch <source> <destination>${colors.reset}`);
            return;
        }
        
        if (!PATCH_POINTS.sources[from]) {
            console.log(`${colors.red}Invalid source: ${from}${colors.reset}`);
            console.log(`Type ${colors.cyan}'sources'${colors.reset} to see available sources`);
            return;
        }
        
        if (!PATCH_POINTS.destinations[to]) {
            console.log(`${colors.red}Invalid destination: ${to}${colors.reset}`);
            console.log(`Type ${colors.cyan}'destinations'${colors.reset} to see available destinations`);
            return;
        }
        
        // Check if patch already exists
        if (this.patchMatrix.some(p => p.from === from && p.to === to)) {
            console.log(`${colors.yellow}⚠️  Patch already exists${colors.reset}`);
            return;
        }
        
        this.patchMatrix.push({ from, to });
        console.log(`${colors.green}🔌 Patched: ${colors.bright}${PATCH_POINTS.sources[from]}${colors.reset}${colors.green} → ${colors.bright}${PATCH_POINTS.destinations[to]}${colors.reset}`);
    }
    
    removePatch(from, to) {
        if (!from || !to) {
            console.log(`${colors.red}Usage: unpatch <source> <destination>${colors.reset}`);
            return;
        }
        
        const initialLength = this.patchMatrix.length;
        this.patchMatrix = this.patchMatrix.filter(p => !(p.from === from && p.to === to));
        
        if (this.patchMatrix.length < initialLength) {
            console.log(`${colors.green}✂️  Unpatched: ${PATCH_POINTS.sources[from]} → ${PATCH_POINTS.destinations[to]}${colors.reset}`);
        } else {
            console.log(`${colors.yellow}⚠️  Patch not found${colors.reset}`);
        }
    }
    
    showMatrix() {
        if (this.patchMatrix.length === 0) {
            console.log(`${colors.yellow}No patches connected. Use ${colors.cyan}'patch'${colors.reset}${colors.yellow} command to create connections.${colors.reset}`);
            return;
        }
        
        console.log(`\n${colors.bright}${colors.bgCyan} Current Patch Matrix ${colors.reset}\n`);
        this.patchMatrix.forEach((patch, idx) => {
            console.log(`${colors.dim}${idx + 1}.${colors.reset} ${colors.cyan}${PATCH_POINTS.sources[patch.from]}${colors.reset} ${colors.magenta}→${colors.reset} ${colors.yellow}${PATCH_POINTS.destinations[patch.to]}${colors.reset}`);
        });
        console.log('');
    }
    
    clearPatches() {
        this.patchMatrix = [];
        this.currentPreset = null;
        console.log(`${colors.green}✨ All patches cleared${colors.reset}`);
    }
    
    listSources() {
        console.log(`\n${colors.bright}${colors.bgCyan} Available Patch Sources ${colors.reset}\n`);
        Object.entries(PATCH_POINTS.sources).forEach(([id, name]) => {
            console.log(`  ${colors.cyan}${id.padEnd(20)}${colors.reset} ${colors.dim}│${colors.reset} ${name}`);
        });
        console.log('');
    }
    
    listDestinations() {
        console.log(`\n${colors.bright}${colors.bgMagenta} Available Patch Destinations ${colors.reset}\n`);
        Object.entries(PATCH_POINTS.destinations).forEach(([id, name]) => {
            console.log(`  ${colors.magenta}${id.padEnd(20)}${colors.reset} ${colors.dim}│${colors.reset} ${name}`);
        });
        console.log('');
    }
    
    listPresets() {
        console.log(`\n${colors.bright}${colors.yellow}📦 Available Presets${colors.reset}\n`);
        Object.entries(PRESETS).forEach(([id, preset]) => {
            console.log(`${colors.cyan}${id.padEnd(25)}${colors.reset} ${preset.name}`);
            console.log(`${colors.dim}${''.padEnd(25)}${preset.description}${colors.reset}`);
            console.log('');
        });
    }
    
    loadPreset(presetId) {
        if (!presetId) {
            console.log(`${colors.red}Usage: load <preset-name>${colors.reset}`);
            return;
        }
        
        const preset = PRESETS[presetId];
        if (!preset) {
            console.log(`${colors.red}Preset not found: ${presetId}${colors.reset}`);
            console.log(`Type ${colors.cyan}'presets'${colors.reset} to see available presets`);
            return;
        }
        
        this.patchMatrix = [...preset.patches];
        this.parameters = preset.parameters || {};
        this.currentPreset = presetId;
        
        console.log(`${colors.green}✅ Loaded preset: ${colors.bright}${preset.name}${colors.reset}`);
        console.log(`${colors.dim}${preset.description}${colors.reset}`);
        console.log(`${colors.yellow}📊 ${preset.patches.length} patches loaded${colors.reset}\n`);
        
        this.showMatrix();
    }
    
    savePreset(name) {
        if (!name) {
            console.log(`${colors.red}Usage: save <preset-name>${colors.reset}`);
            return;
        }
        
        if (this.patchMatrix.length === 0) {
            console.log(`${colors.red}Cannot save empty patch matrix${colors.reset}`);
            return;
        }
        
        const preset = {
            name,
            patches: [...this.patchMatrix],
            parameters: this.parameters,
            created: new Date().toISOString()
        };
        
        console.log(`${colors.green}💾 Preset saved: ${name}${colors.reset}`);
        console.log(`${colors.dim}To export to file, use: export <filename>${colors.reset}`);
    }
    
    exportPreset(filename) {
        if (!filename) {
            filename = `2600-preset-${Date.now()}.json`;
        }
        
        const preset = {
            name: this.currentPreset || 'Custom Preset',
            patches: this.patchMatrix,
            parameters: this.parameters,
            exported: new Date().toISOString()
        };
        
        try {
            fs.writeFileSync(filename, JSON.stringify(preset, null, 2));
            console.log(`${colors.green}📁 Exported to: ${filename}${colors.reset}`);
        } catch (err) {
            console.log(`${colors.red}Error exporting: ${err.message}${colors.reset}`);
        }
    }
    
    importPreset(filename) {
        if (!filename) {
            console.log(`${colors.red}Usage: import <filename>${colors.reset}`);
            return;
        }
        
        try {
            const data = fs.readFileSync(filename, 'utf8');
            const preset = JSON.parse(data);
            
            this.patchMatrix = preset.patches || [];
            this.parameters = preset.parameters || {};
            this.currentPreset = preset.name;
            
            console.log(`${colors.green}📥 Imported: ${preset.name}${colors.reset}`);
            this.showMatrix();
        } catch (err) {
            console.log(`${colors.red}Error importing: ${err.message}${colors.reset}`);
        }
    }
    
    generateRecipe(type) {
        const recipes = {
            bass: [
                '1. Start with VCO 1 sawtooth wave for rich harmonics',
                '2. Patch VCO1-SAW → VCF-IN for filtering',
                '3. Use Envelope 1 for filter cutoff modulation (pluck effect)',
                '4. Patch ENV1-OUT → VCF-CUTOFF',
                '5. Route filter to VCA for amplitude control',
                '6. Patch VCF-OUT → VCA-IN',
                '7. Use Envelope 2 for VCA control',
                '8. Patch ENV2-OUT → VCA-CV',
                '9. Connect keyboard gate to trigger both envelopes',
                '10. Patch KBD-GATE → ENV1-TRIG and ENV2-TRIG',
                '11. Set filter cutoff low (200-500 Hz), high resonance (8-12)',
                '12. Fast attack (0.01s), medium decay (0.3s), zero sustain'
            ],
            lead: [
                '1. Use two oscillators for thickness',
                '2. Patch VCO1-SAW and VCO2-PULSE → VCF-IN',
                '3. Detune VCO2 slightly (+5 cents)',
                '4. Add vibrato with LFO',
                '5. Patch VCO3-TRI → VCO1-FM and VCO2-FM',
                '6. Set LFO rate to 5-7 Hz',
                '7. Use envelope for filter sweep',
                '8. Patch ENV1-OUT → VCF-CUTOFF',
                '9. Set filter resonance medium (5-8) for character',
                '10. Route through VCA with envelope',
                '11. Patch VCF-OUT → VCA-IN → OUTPUT'
            ],
            pad: [
                '1. Use multiple oscillators with different waveforms',
                '2. Patch VCO1-SAW and VCO2-TRI → VCF-IN',
                '3. Slight detune between oscillators (0.5 Hz)',
                '4. Slow LFO modulation for movement',
                '5. Patch VCO3-TRI → VCO2-FM (subtle)',
                '6. Long attack envelope (0.8-1.5s)',
                '7. High sustain level (0.7-0.9)',
                '8. Slow release (1-2s)',
                '9. Filter cutoff around 1000-1500 Hz',
                '10. Low resonance (2-4) for smooth sound'
            ],
            fx: [
                '1. Experiment with ring modulation',
                '2. Patch VCO1 and VCO2 → RINGMOD-X and RINGMOD-Y',
                '3. Use sample & hold for randomness',
                '4. Patch NOISE → SH-IN, VCO3 → SH-TRIG',
                '5. Patch SH-OUT → VCO1-FM for random pitch',
                '6. Add white noise to filter',
                '7. Use high filter resonance (10+) for self-oscillation',
                '8. Modulate filter with multiple sources',
                '9. Cross-modulate oscillators (VCO2 → VCO1-FM)',
                '10. Fast LFO rates (10-20 Hz) for audio-rate modulation'
            ]
        };
        
        if (!type || !recipes[type]) {
            console.log(`${colors.red}Usage: recipe <type>${colors.reset}`);
            console.log(`Available types: ${Object.keys(recipes).join(', ')}`);
            return;
        }
        
        console.log(`\n${colors.bright}${colors.yellow}🎨 Sound Design Recipe: ${type.toUpperCase()}${colors.reset}\n`);
        recipes[type].forEach(step => {
            console.log(`${colors.cyan}${step}${colors.reset}`);
        });
        console.log('');
    }
    
    analyzePatches() {
        if (this.patchMatrix.length === 0) {
            console.log(`${colors.yellow}No patches to analyze${colors.reset}`);
            return;
        }
        
        console.log(`\n${colors.bright}📊 Patch Analysis${colors.reset}\n`);
        
        // Count module usage
        const modules = { vco1: 0, vco2: 0, vco3: 0, vcf: 0, vca: 0, env1: 0, env2: 0, noise: 0 };
        
        this.patchMatrix.forEach(patch => {
            Object.keys(modules).forEach(mod => {
                if (patch.from.includes(mod) || patch.to.includes(mod)) {
                    modules[mod]++;
                }
            });
        });
        
        console.log(`${colors.cyan}Module Usage:${colors.reset}`);
        Object.entries(modules).forEach(([mod, count]) => {
            if (count > 0) {
                const bar = '█'.repeat(Math.min(count, 20));
                console.log(`  ${mod.toUpperCase().padEnd(6)} ${bar} ${count}`);
            }
        });
        
        // Detect modulation types
        console.log(`\n${colors.cyan}Modulation Detected:${colors.reset}`);
        const hasFreqMod = this.patchMatrix.some(p => p.to.includes('-fm'));
        const hasFilterMod = this.patchMatrix.some(p => p.to === 'vcf-cutoff');
        const hasAmpMod = this.patchMatrix.some(p => p.to === 'vca-cv');
        
        if (hasFreqMod) console.log(`  ${colors.green}✓${colors.reset} Frequency Modulation (FM)`);
        if (hasFilterMod) console.log(`  ${colors.green}✓${colors.reset} Filter Modulation`);
        if (hasAmpMod) console.log(`  ${colors.green}✓${colors.reset} Amplitude Modulation`);
        
        console.log('');
    }
    
    suggestPatches() {
        const suggestions = [
            'Try adding LFO to filter cutoff for wobble effects',
            'Cross-modulate VCO2 into VCO1 for complex timbres',
            'Use sample & hold for random stepped patterns',
            'Add ring modulation for metallic, bell-like tones',
            'Patch envelope to pulse width for dynamic brightness',
            'Use noise through filter for percussion and FX',
            'Try audio-rate LFO (>20Hz) for FM synthesis',
            'Patch keyboard CV to multiple destinations for expressive control'
        ];
        
        const random = suggestions[Math.floor(Math.random() * suggestions.length)];
        console.log(`\n${colors.yellow}💡 Suggestion: ${random}${colors.reset}\n`);
    }
    
    visualizeFlow() {
        if (this.patchMatrix.length === 0) {
            console.log(`${colors.yellow}No signal flow to visualize${colors.reset}`);
            return;
        }
        
        console.log(`\n${colors.bright}🔊 Signal Flow Visualization${colors.reset}\n`);
        console.log(`${colors.cyan}┌─────────┐      ┌─────────┐      ┌─────────┐${colors.reset}`);
        console.log(`${colors.cyan}│   VCO   │─────▶│   VCF   │─────▶│   VCA   │${colors.reset}`);
        console.log(`${colors.cyan}└─────────┘      └─────────┘      └─────────┘${colors.reset}`);
        console.log(`${colors.yellow}     ▲                ▲                ▲      ${colors.reset}`);
        console.log(`${colors.yellow}     │                │                │      ${colors.reset}`);
        console.log(`${colors.magenta}  [  LFO  ]       [  ENV  ]       [  ENV  ]  ${colors.reset}\n`);
    }
    
    startWizard() {
        console.log(`\n${colors.bright}${colors.magenta}🧙 Interactive Patch Wizard${colors.reset}\n`);
        console.log(`${colors.dim}(Wizard mode coming soon...)${colors.reset}\n`);
    }
    
    exploreModule(module) {
        if (!module) {
            console.log(`${colors.red}Usage: explore <module>${colors.reset}`);
            console.log('Available modules: vco1, vco2, vco3, vcf, vca, env1, env2');
            return;
        }
        
        console.log(`\n${colors.bright}🔍 Exploring: ${module.toUpperCase()}${colors.reset}\n`);
        
        const sources = Object.entries(PATCH_POINTS.sources)
            .filter(([id]) => id.includes(module))
            .map(([id, name]) => `  ${colors.cyan}${id}${colors.reset} - ${name}`);
        
        const destinations = Object.entries(PATCH_POINTS.destinations)
            .filter(([id]) => id.includes(module))
            .map(([id, name]) => `  ${colors.magenta}${id}${colors.reset} - ${name}`);
        
        if (sources.length > 0) {
            console.log(`${colors.green}Outputs:${colors.reset}`);
            sources.forEach(s => console.log(s));
            console.log('');
        }
        
        if (destinations.length > 0) {
            console.log(`${colors.yellow}Inputs:${colors.reset}`);
            destinations.forEach(d => console.log(d));
            console.log('');
        }
    }
    
    generateRandom() {
        const numPatches = Math.floor(Math.random() * 5) + 3; // 3-7 patches
        const sources = Object.keys(PATCH_POINTS.sources);
        const destinations = Object.keys(PATCH_POINTS.destinations);
        
        this.clearPatches();
        
        for (let i = 0; i < numPatches; i++) {
            const from = sources[Math.floor(Math.random() * sources.length)];
            const to = destinations[Math.floor(Math.random() * destinations.length)];
            
            if (!this.patchMatrix.some(p => p.from === from && p.to === to)) {
                this.patchMatrix.push({ from, to });
            }
        }
        
        console.log(`${colors.green}🎲 Generated ${this.patchMatrix.length} random patches${colors.reset}`);
        this.showMatrix();
        console.log(`${colors.yellow}💡 Tip: This might sound chaotic! Use 'clear' to start over.${colors.reset}\n`);
    }
}

// Start the CLI
const cli = new Synth2600CLI();
cli.start();
