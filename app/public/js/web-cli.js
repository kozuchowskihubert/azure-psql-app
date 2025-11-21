/**
 * Behringer 2600 Web CLI Terminal
 * Interactive command-line interface in the browser
 */

class WebCLI {
    constructor() {
        this.terminal = document.getElementById('terminal');
        this.commandInput = document.getElementById('command-input');
        this.currentPreset = null;
        this.commandHistory = [];
        this.historyIndex = -1;
        this.patchMatrix = [];

        this.initializeEventListeners();
        this.loadCommandHistory();
    }

    initializeEventListeners() {
        this.commandInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.handleCommand();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.navigateHistory(-1);
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.navigateHistory(1);
            } else if (e.key === 'Tab') {
                e.preventDefault();
                this.autocomplete();
            }
        });

        // Keep input focused
        this.terminal.addEventListener('click', () => {
            this.commandInput.focus();
        });
    }

    handleCommand() {
        const command = this.commandInput.value.trim();
        if (!command) return;

        // Add to history
        this.commandHistory.push(command);
        this.historyIndex = this.commandHistory.length;
        this.saveCommandHistory();

        // Display command in terminal
        this.addTerminalLine(`<span class="prompt">2600${this.currentPreset ? ' [<span class="prompt-current">' + this.currentPreset + '</span>]' : ''}></span> ${command}`);

        // Clear input
        this.commandInput.value = '';

        // Execute command
        this.executeCommand(command);

        // Scroll to bottom
        this.terminal.scrollTop = this.terminal.scrollHeight;
    }

    async executeCommand(command) {
        const parts = command.trim().split(/\s+/);
        const cmd = parts[0].toLowerCase();
        const args = parts.slice(1);

        // Command aliases
        const aliases = {
            ls: 'list',
            l: 'list',
            p: 'preset',
            load: 'preset',
            show: 'patch',
            s: 'patch',
            cls: 'clear',
            '?': 'help',
            q: 'quit',
        };

        const actualCmd = aliases[cmd] || cmd;

        try {
            switch (actualCmd) {
                case 'help':
                    this.showHelp();
                    break;

                case 'presets':
                case 'list':
                    await this.listPresets();
                    break;

                case 'preset':
                    if (args.length === 0) {
                        this.addErrorLine('Usage: preset <name>');
                    } else {
                        await this.loadPreset(args[0]);
                    }
                    break;

                case 'info':
                    this.showInfo();
                    break;

                case 'patch':
                    this.showPatchMatrix();
                    break;

                case 'add':
                    if (args.length < 2) {
                        this.addErrorLine('Usage: add <source> <destination> [level]');
                    } else {
                        this.addPatchCable(args[0], args[1], args[2] || '1.0');
                    }
                    break;

                case 'remove':
                    if (args.length < 2) {
                        this.addErrorLine('Usage: remove <source> <destination>');
                    } else {
                        this.removePatchCable(args[0], args[1]);
                    }
                    break;

                case 'vco1':
                case 'vco2':
                    if (args.length === 0) {
                        this.addErrorLine(`Usage: ${cmd} <frequency> [waveform]`);
                    } else {
                        this.setOscillator(actualCmd, args[0], args[1] || 'sawtooth');
                    }
                    break;

                case 'lfo':
                    if (args.length === 0) {
                        this.addErrorLine('Usage: lfo <rate>');
                    } else {
                        this.setLFO(args[0]);
                    }
                    break;

                case 'filter':
                    if (args.length === 0) {
                        this.addErrorLine('Usage: filter <cutoff> [resonance]');
                    } else {
                        this.setFilter(args[0], args[1] || '0.5');
                    }
                    break;

                case 'envelope':
                    if (args.length < 4) {
                        this.addErrorLine('Usage: envelope <attack> <decay> <sustain> <release>');
                    } else {
                        this.setEnvelope(args[0], args[1], args[2], args[3]);
                    }
                    break;

                case 'export':
                    if (args.length === 0) {
                        this.addErrorLine('Usage: export <filename> [bars]');
                    } else {
                        await this.exportMIDI(args[0], args[1] || '4');
                    }
                    break;

                case 'clear':
                    this.clearTerminal();
                    break;

                case 'history':
                    this.showHistory();
                    break;

                case 'quit':
                case 'exit':
                    this.addWarningLine('👋 To exit, close this browser tab or window.');
                    break;

                default:
                    this.addErrorLine(`Unknown command: ${cmd}`);
                    this.addInfoLine('Type \'help\' for available commands');
            }
        } catch (error) {
            this.addErrorLine(`Error: ${error.message}`);
            console.error('Command execution error:', error);
        }
    }

    // Terminal Output Methods
    addTerminalLine(html, className = '') {
        const line = document.createElement('div');
        line.className = 'terminal-line ' + className;
        line.innerHTML = html;

        // Insert before input line
        const inputLine = this.terminal.querySelector('.input-line');
        this.terminal.insertBefore(line, inputLine);
    }

    addSuccessLine(text) {
        this.addTerminalLine(`<span class="success">✓ ${text}</span>`);
    }

    addErrorLine(text) {
        this.addTerminalLine(`<span class="error">✗ ${text}</span>`);
    }

    addWarningLine(text) {
        this.addTerminalLine(`<span class="warning">⚠ ${text}</span>`);
    }

    addInfoLine(text) {
        this.addTerminalLine(`<span class="info">${text}</span>`);
    }

    // Command Implementations
    showHelp() {
        const help = `
<span class="info">╔════════════════════════════════════════════════════════════╗
║                    AVAILABLE COMMANDS                       ║
╚════════════════════════════════════════════════════════════╝</span>

<span class="warning">Preset Management:</span>
  <span class="success">presets</span> | <span class="success">list</span>              List all available presets
  <span class="success">preset</span> &lt;name&gt;              Load a specific preset
  <span class="success">info</span>                       Show current configuration

<span class="warning">Patch Matrix:</span>
  <span class="success">patch</span> | <span class="success">show</span>              Show current patch matrix
  <span class="success">add</span> &lt;src&gt; &lt;dst&gt; [lvl]      Add patch cable (0.0-1.0)
  <span class="success">remove</span> &lt;src&gt; &lt;dst&gt;         Remove patch cable

<span class="warning">Oscillators:</span>
  <span class="success">vco1</span> &lt;freq&gt; [wave]         Set VCO1 frequency & waveform
  <span class="success">vco2</span> &lt;freq&gt; [wave]         Set VCO2 frequency & waveform
  <span class="success">lfo</span> &lt;rate&gt;                 Set LFO rate

<span class="warning">Filter & Envelope:</span>
  <span class="success">filter</span> &lt;cutoff&gt; [res]      Set filter cutoff & resonance
  <span class="success">envelope</span> &lt;a&gt; &lt;d&gt; &lt;s&gt; &lt;r&gt;   Set ADSR envelope

<span class="warning">Export:</span>
  <span class="success">export</span> &lt;file&gt; [bars]       Export to MIDI file

<span class="warning">System:</span>
  <span class="success">help</span> | <span class="success">?</span>                  Show this help
  <span class="success">history</span>                    Show command history
  <span class="success">clear</span> | <span class="success">cls</span>              Clear terminal

<span class="warning">Examples:</span>
  preset evolving_drone
  vco1 440 sawtooth
  filter 1200 0.8
  add VCO1/OUT VCF/IN 0.9
  export my_patch.mid 8
`;
        this.addTerminalLine(help);
    }

    async listPresets() {
        try {
            const response = await fetch('/api/music/synth2600/presets');
            const data = await response.json();

            if (data.success) {
                this.addInfoLine('\n╔════════════════════════════════════════════════════════════╗');
                this.addInfoLine('║                   AVAILABLE PRESETS                        ║');
                this.addInfoLine('╚════════════════════════════════════════════════════════════╝\n');

                const categoryNames = {
                    soundscape: '<span class="warning">Soundscape Generators:</span>',
                    rhythmic: '<span class="warning">Rhythmic Experiments:</span>',
                    modulation: '<span class="warning">Modulation Madness:</span>',
                    cinematic: '<span class="warning">Cinematic FX:</span>',
                    psychedelic: '<span class="warning">Psychedelic:</span>',
                    performance: '<span class="warning">Performance:</span>',
                    musical: '<span class="warning">Musical Techniques:</span>',
                };

                Object.entries(data.categories).forEach(([category, presets]) => {
                    if (presets.length > 0) {
                        this.addTerminalLine(categoryNames[category]);
                        presets.forEach(preset => {
                            this.addTerminalLine(`  <span class="success">•</span> ${preset}`);
                        });
                        this.addTerminalLine('');
                    }
                });
            } else {
                this.addErrorLine('Failed to load presets');
            }
        } catch (error) {
            this.addErrorLine(`Error loading presets: ${error.message}`);
        }
    }

    async loadPreset(presetName) {
        try {
            const response = await fetch(`/api/music/synth2600/preset/${presetName}`);
            const data = await response.json();

            if (data.success) {
                this.currentPreset = presetName;
                this.patchMatrix = data.patchConnections;

                this.addSuccessLine(`Loaded preset: ${presetName}`);
                this.addTerminalLine('');
                this.showPatchMatrix();
            } else {
                this.addErrorLine(`Preset not found: ${presetName}`);
                this.addInfoLine('Type \'presets\' to see available options');
            }
        } catch (error) {
            this.addErrorLine(`Error loading preset: ${error.message}`);
        }
    }

    showInfo() {
        if (this.currentPreset) {
            this.addInfoLine(`\nCurrent Preset: <span class="warning">${this.currentPreset}</span>`);
            this.showPatchMatrix();
        } else {
            this.addWarningLine('No preset loaded');
            this.addInfoLine('Use \'preset <name>\' to load a preset');
        }
    }

    showPatchMatrix() {
        if (this.patchMatrix.length === 0) {
            this.addWarningLine('No patch cables connected');
            return;
        }

        this.addInfoLine('\n╔════════════════════════════════════════════════════════════╗');
        this.addInfoLine('║              BEHRINGER 2600 PATCH MATRIX                   ║');
        this.addInfoLine('╚════════════════════════════════════════════════════════════╝\n');

        this.patchMatrix.forEach(conn => {
            const colorName = conn.color.toUpperCase();
            const level = (conn.level * 100).toFixed(0);
            this.addTerminalLine(
                `  [<span style="color: ${this.getCableColor(conn.color)}">${colorName}</span>] ` +
                `<span class="info">${conn.source}</span> → ` +
                `<span class="success">${conn.destination}</span> ` +
                `<span class="warning">(Level: ${level}%)</span>`,
            );
        });
        this.addTerminalLine('');
    }

    addPatchCable(source, dest, level) {
        const cable = {
            color: 'red',
            source,
            destination: dest,
            level: parseFloat(level),
        };
        this.patchMatrix.push(cable);
        this.addSuccessLine(`Added patch: ${source} → ${dest} (Level: ${level})`);
    }

    removePatchCable(source, dest) {
        const initialLength = this.patchMatrix.length;
        this.patchMatrix = this.patchMatrix.filter(
            c => !(c.source === source && c.destination === dest),
        );

        if (this.patchMatrix.length < initialLength) {
            this.addSuccessLine(`Removed patch: ${source} → ${dest}`);
        } else {
            this.addWarningLine('No matching patch found');
        }
    }

    setOscillator(osc, freq, waveform) {
        this.addSuccessLine(`${osc.toUpperCase()}: ${freq}Hz, ${waveform}`);
    }

    setLFO(rate) {
        this.addSuccessLine(`LFO: ${rate}Hz`);
    }

    setFilter(cutoff, resonance) {
        this.addSuccessLine(`Filter: ${cutoff}Hz, Q=${resonance}`);
    }

    setEnvelope(attack, decay, sustain, release) {
        this.addSuccessLine(`Envelope: A=${attack}s D=${decay}s S=${sustain} R=${release}s`);
    }

    async exportMIDI(filename, bars) {
        try {
            const response = await fetch('/api/music/synth2600/export', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ filename, bars: parseInt(bars) }),
            });

            const data = await response.json();

            if (data.success) {
                this.addSuccessLine(`Exported MIDI to: ${filename}`);

                // Download the file
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

                this.addInfoLine('File downloaded to your browser\'s download folder');
            } else {
                this.addErrorLine('Export failed');
            }
        } catch (error) {
            this.addErrorLine(`Export error: ${error.message}`);
        }
    }

    showHistory() {
        this.addInfoLine('\n<span class="warning">Command History:</span>');
        this.commandHistory.slice(-20).forEach((cmd, i) => {
            this.addTerminalLine(`  <span class="info">${i + 1}.</span> ${cmd}`);
        });
        this.addTerminalLine('');
    }

    clearTerminal() {
        // Remove all lines except banner and input
        const lines = this.terminal.querySelectorAll('.terminal-line');
        lines.forEach(line => {
            if (!line.classList.contains('banner') &&
                !line.classList.contains('input-line')) {
                line.remove();
            }
        });
    }

    // History Navigation
    navigateHistory(direction) {
        const newIndex = this.historyIndex + direction;
        if (newIndex >= 0 && newIndex <= this.commandHistory.length) {
            this.historyIndex = newIndex;
            this.commandInput.value = this.commandHistory[newIndex] || '';
        }
    }

    autocomplete() {
        const commands = [
            'help', 'presets', 'preset', 'info', 'patch', 'add', 'remove',
            'vco1', 'vco2', 'lfo', 'filter', 'envelope', 'export', 'clear', 'history',
        ];

        const input = this.commandInput.value.toLowerCase();
        const matches = commands.filter(cmd => cmd.startsWith(input));

        if (matches.length === 1) {
            this.commandInput.value = matches[0] + ' ';
        } else if (matches.length > 1) {
            this.addInfoLine('\nPossible completions:');
            matches.forEach(match => {
                this.addTerminalLine(`  <span class="success">${match}</span>`);
            });
            this.addTerminalLine('');
        }
    }

    // Utility Methods
    getCableColor(colorName) {
        const colors = {
            red: '#ff0000',
            blue: '#00d4ff',
            green: '#0f0',
            yellow: '#ffff00',
            white: '#fff',
            orange: '#ff8800',
            purple: '#ff00ff',
        };
        return colors[colorName.toLowerCase()] || '#00d4ff';
    }

    saveCommandHistory() {
        localStorage.setItem('cli_history', JSON.stringify(this.commandHistory));
    }

    loadCommandHistory() {
        const saved = localStorage.getItem('cli_history');
        if (saved) {
            this.commandHistory = JSON.parse(saved);
            this.historyIndex = this.commandHistory.length;
        }
    }
}

// Tab Management
function showTab(tabName) {
    // Update tab buttons
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');

    // Update panels
    const panels = document.querySelectorAll('.doc-panel');
    panels.forEach(panel => panel.classList.remove('active'));
    document.getElementById(tabName + '-panel').classList.add('active');
}

// Quick Actions
function loadPreset(presetName) {
    if (window.cli) {
        window.cli.executeCommand(`preset ${presetName}`);
        window.cli.commandInput.focus();
    }
}

function executeCommand(command) {
    if (window.cli) {
        window.cli.commandInput.value = command;
        window.cli.handleCommand();
        window.cli.commandInput.focus();
    }
}

function clearTerminal() {
    if (window.cli) {
        window.cli.clearTerminal();
        window.cli.commandInput.focus();
    }
}

// Initialize CLI on page load
document.addEventListener('DOMContentLoaded', () => {
    window.cli = new WebCLI();
    console.log('🎛️ Behringer 2600 Web CLI initialized');
});
