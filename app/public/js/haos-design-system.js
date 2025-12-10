/**
 * HAOS Unified Design System
 * Modular components and templates for consistent UI across all instruments
 */

class HAOSDesignSystem {
    constructor() {
        this.templates = new Map();
        this.components = new Map();
        this.themes = new Map();
        this.instruments = new Map();
        this.init();
    }

    init() {
        this.registerTemplates();
        this.registerComponents();
        this.registerThemes();
        this.registerInstruments();
        this.setupGlobalStyles();
    }

    /**
     * Register page templates
     */
    registerTemplates() {
        this.templates.set('instrument', {
            structure: `
                <div class="haos-page">
                    <header class="haos-header">
                        {{header}}
                    </header>
                    <main class="haos-main">
                        <div class="instrument-workspace">
                            {{workspace}}
                        </div>
                        <div class="instrument-controls">
                            {{controls}}
                        </div>
                    </main>
                    <footer class="haos-footer">
                        {{footer}}
                    </footer>
                </div>
            `,
            styles: this.getInstrumentStyles()
        });

        this.templates.set('workspace', {
            structure: `
                <div class="haos-workspace">
                    <div class="workspace-sidebar">
                        {{sidebar}}
                    </div>
                    <div class="workspace-main">
                        {{main}}
                    </div>
                    <div class="workspace-mixer">
                        {{mixer}}
                    </div>
                </div>
            `,
            styles: this.getWorkspaceStyles()
        });
    }

    /**
     * Register reusable components
     */
    registerComponents() {
        // Navigation component
        this.components.set('navigation', {
            template: `
                <nav class="haos-nav">
                    <div class="nav-brand">
                        <img src="/images/haos-logo-white.png" alt="HAOS.fm" class="nav-logo">
                        <span class="nav-title">{{title}}</span>
                    </div>
                    <div class="nav-menu">
                        {{menuItems}}
                    </div>
                    <div class="nav-user">
                        {{userMenu}}
                    </div>
                </nav>
            `,
            data: {
                title: 'HAOS.fm',
                menuItems: [
                    { label: 'Studio', href: '/', icon: 'fas fa-home' },
                    { label: 'ARP 2600', href: '/synth-2600-studio.html', icon: 'fas fa-crown', legendary: true },
                    { label: 'Techno', href: '/techno-workspace.html', icon: 'fas fa-cubes' },
                    { label: 'Instruments', href: '/instruments', icon: 'fas fa-music' }
                ]
            }
        });

        // Instrument card component
        this.components.set('instrumentCard', {
            template: `
                <div class="instrument-card {{category}}" data-instrument="{{id}}">
                    <div class="card-header">
                        <div class="card-icon {{legendary ? 'legendary' : ''}}">
                            {{#legendary}}<i class="fas fa-crown"></i>{{/legendary}}
                            <i class="{{icon}}"></i>
                        </div>
                        <h3 class="card-title">{{name}}</h3>
                        <span class="card-category">{{category}}</span>
                    </div>
                    <div class="card-body">
                        <p class="card-description">{{description}}</p>
                        <div class="card-features">
                            {{#features}}
                            <span class="feature-tag">{{.}}</span>
                            {{/features}}
                        </div>
                    </div>
                    <div class="card-footer">
                        <button class="haos-btn primary" onclick="openInstrument('{{id}}')">
                            <i class="fas fa-play"></i> Launch
                        </button>
                        <button class="haos-btn secondary" onclick="showPresets('{{id}}')">
                            <i class="fas fa-list"></i> Presets
                        </button>
                    </div>
                </div>
            `
        });

        // Pattern selector component
        this.components.set('patternSelector', {
            template: `
                <div class="pattern-selector">
                    <div class="pattern-header">
                        <h4>{{title}}</h4>
                        <div class="pattern-controls">
                            <button class="pattern-btn" onclick="addPattern()">
                                <i class="fas fa-plus"></i>
                            </button>
                            <button class="pattern-btn" onclick="randomPattern()">
                                <i class="fas fa-dice"></i>
                            </button>
                        </div>
                    </div>
                    <div class="pattern-grid">
                        {{#patterns}}
                        <div class="pattern-item {{active ? 'active' : ''}}" data-pattern="{{id}}">
                            <div class="pattern-preview">{{preview}}</div>
                            <span class="pattern-name">{{name}}</span>
                        </div>
                        {{/patterns}}
                    </div>
                </div>
            `
        });

        // Control knob component
        this.components.set('controlKnob', {
            template: `
                <div class="control-knob" data-param="{{param}}">
                    <div class="knob-container">
                        <div class="knob-track"></div>
                        <div class="knob-body" style="transform: rotate({{rotation}}deg)">
                            <div class="knob-indicator"></div>
                        </div>
                        <div class="knob-value">{{displayValue}}</div>
                    </div>
                    <label class="knob-label">{{label}}</label>
                </div>
            `,
            behavior: {
                onInteraction: 'handleKnobChange',
                midiCC: true,
                audioParam: true
            }
        });
    }

    /**
     * Register instrument definitions
     */
    registerInstruments() {
        this.instruments.set('arp2600', {
            id: 'arp2600',
            name: 'ARP 2600',
            category: 'synthesizer',
            legendary: true,
            description: 'Legendary semi-modular analog synthesizer with patch matrix',
            icon: 'fas fa-sliders-h',
            features: ['Patch Matrix', 'Semi-Modular', 'Classic Analog', 'MIDI Export'],
            url: '/synth-2600-studio.html',
            presets: ['acid-bass', 'lead-line', 'pad-strings', 'percussion'],
            expandable: {
                kicks: ['808-kick', '909-kick', 'analog-kick', 'custom-kick'],
                patterns: ['16-step', '32-step', 'triplet', 'polyrhythm'],
                effects: ['delay', 'reverb', 'chorus', 'distortion']
            }
        });

        this.instruments.set('violin', {
            id: 'violin',
            name: 'Virtual Violin',
            category: 'strings',
            description: 'Expressive violin with realistic bowing physics and articulation',
            icon: 'fas fa-music',
            features: ['Bowing Physics', 'Vibrato', 'Pizzicato', 'Expression'],
            url: '/instruments/violin.html',
            presets: ['classical', 'folk', 'cinematic', 'experimental'],
            expandable: {
                techniques: ['legato', 'staccato', 'tremolo', 'harmonics'],
                articulations: ['bow-normal', 'bow-sul-pont', 'bow-sul-tasto', 'pizzicato'],
                dynamics: ['pp', 'p', 'mp', 'mf', 'f', 'ff']
            }
        });

        this.instruments.set('guitar', {
            id: 'guitar',
            name: 'Virtual Guitar',
            category: 'strings',
            description: 'Versatile guitar with acoustic and electric modes',
            icon: 'fas fa-guitar',
            features: ['Acoustic Mode', 'Electric Mode', 'Effects Chain', 'Strumming'],
            url: '/instruments/guitar.html',
            presets: ['acoustic-folk', 'electric-clean', 'distorted-rock', 'jazz-clean'],
            expandable: {
                techniques: ['fingerpicking', 'strumming', 'palm-mute', 'harmonics'],
                effects: ['overdrive', 'distortion', 'chorus', 'delay', 'reverb'],
                tunings: ['standard', 'drop-d', 'open-g', 'dadgad']
            }
        });

        this.instruments.set('drums', {
            id: 'drums',
            name: 'Drum Machine',
            category: 'percussion',
            description: 'Classic drum machine with 808/909 sounds',
            icon: 'fas fa-drum',
            features: ['808/909 Sounds', 'Pattern Editor', 'Swing/Shuffle', 'Individual Outs'],
            url: '/drum-machine.html',
            presets: ['basic-house', 'techno-kick', 'breakbeat', 'trap-hats'],
            expandable: {
                kicks: ['808-kick', '909-kick', 'sub-kick', 'punchy-kick', 'analog-kick'],
                snares: ['808-snare', '909-snare', 'clap', 'rim-shot'],
                hats: ['closed-hat', 'open-hat', 'ride', 'crash'],
                patterns: ['4-4-house', 'techno-16', 'breakbeat', 'latin-groove']
            }
        });

        this.instruments.set('tb303', {
            id: 'tb303',
            name: 'TB-303 Bass',
            category: 'synthesizer',
            description: 'Classic acid bass synthesizer',
            icon: 'fas fa-wave-square',
            features: ['Acid Bass', 'Pattern Sequencer', 'Filter Sweep', 'Accent'],
            url: '/tb-303.html',
            presets: ['classic-acid', 'deep-bass', 'squelchy', 'percussive'],
            expandable: {
                patterns: ['classic-16', 'acid-line', 'minimal-bass', 'complex-32'],
                effects: ['overdrive', 'filter-env', 'delay-feedback'],
                modulation: ['filter-lfo', 'pitch-bend', 'accent-variation']
            }
        });
    }

    /**
     * Register themes
     */
    registerThemes() {
        this.themes.set('default', {
            primary: '#FF6B35',
            secondary: '#D4AF37',
            background: '#0A0A0A',
            surface: 'rgba(20, 20, 25, 0.85)',
            text: '#F4E8D8',
            accent: '#FF6B35',
            success: '#39FF14',
            warning: '#FFB000',
            error: '#FF4757'
        });

        this.themes.set('legendary', {
            primary: '#D4AF37',
            secondary: '#FFD700',
            background: '#0A0A0A',
            surface: 'rgba(212, 175, 55, 0.1)',
            text: '#FFE55C',
            accent: '#D4AF37',
            crown: '#FFD700'
        });

        this.themes.set('arp2600', {
            primary: '#00D4FF',
            secondary: '#FF00FF',
            background: '#0A0A0A',
            surface: 'rgba(26, 26, 46, 0.9)',
            text: '#E4E4E4',
            accent: '#00D4FF'
        });

        this.themes.set('techno', {
            primary: '#39FF14',
            secondary: '#FF6B35',
            background: 'linear-gradient(135deg, #0A0A0A 0%, #1A1410 100%)',
            surface: 'rgba(74, 60, 46, 0.4)',
            text: '#39FF14',
            accent: '#39FF14'
        });
    }

    /**
     * Generate instrument card HTML
     */
    generateInstrumentCard(instrumentId) {
        const instrument = this.instruments.get(instrumentId);
        if (!instrument) return '';

        return this.renderTemplate('instrumentCard', instrument);
    }

    /**
     * Generate full instrument hub page
     */
    generateInstrumentHub() {
        const instruments = Array.from(this.instruments.values());
        const categories = this.groupByCategory(instruments);

        let html = this.renderTemplate('navigation', {});
        
        html += `
            <div class="instrument-hub">
                <header class="hub-header">
                    <div class="hero-section">
                        <img src="/images/haos-logo-white.png" alt="HAOS.fm" class="hero-logo">
                        <h1>HAOS.fm Instrument Studio</h1>
                        <p>Professional hardware-inspired instruments for electronic music production</p>
                    </div>
                </header>
                
                <main class="hub-main">
        `;

        // Legendary instruments first
        const legendary = instruments.filter(i => i.legendary);
        if (legendary.length > 0) {
            html += `
                <section class="legendary-section">
                    <h2><i class="fas fa-crown"></i> Legendary Instruments</h2>
                    <div class="instruments-grid legendary-grid">
                        ${legendary.map(i => this.generateInstrumentCard(i.id)).join('')}
                    </div>
                </section>
            `;
        }

        // Other categories
        for (const [category, categoryInstruments] of Object.entries(categories)) {
            if (category === 'legendary') continue;
            
            html += `
                <section class="category-section">
                    <h2>${this.formatCategoryName(category)}</h2>
                    <div class="instruments-grid">
                        ${categoryInstruments.map(i => this.generateInstrumentCard(i.id)).join('')}
                    </div>
                </section>
            `;
        }

        html += `
                </main>
            </div>
        `;

        return html;
    }

    /**
     * Create unified page template
     */
    createPage(type, options = {}) {
        const template = this.templates.get(type);
        if (!template) return '';

        let html = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
                <title>${options.title || 'HAOS.fm'}</title>
                
                <meta name="description" content="${options.description || 'HAOS.fm - Professional hardware-inspired synthesis platform'}">
                <meta name="theme-color" content="#FF6B35">
                <meta name="apple-mobile-web-app-capable" content="yes">
                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
                
                <link rel="apple-touch-icon" sizes="180x180" href="/images/haos-logo-white.png">
                <link rel="manifest" href="/manifest.json">
                <link rel="icon" type="image/png" href="/images/haos-logo-white.png">
                
                <link rel="preconnect" href="https://fonts.googleapis.com">
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono:wght@400;700&family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
                
                <!-- HAOS Design System -->
                <link rel="stylesheet" href="/css/haos-design-system.css">
                <script src="/js/haos-components.js" defer></script>
                <script src="/js/haos-design-system.js" defer></script>
                
                ${template.styles ? `<style>${template.styles}</style>` : ''}
                ${options.additionalCSS || ''}
            </head>
            <body class="haos-page ${options.theme || 'default'}">
                ${this.renderTemplate(type, options)}
                
                <!-- HAOS Platform Integration -->
                <script src="/js/haos-platform.js" defer></script>
                ${options.additionalJS || ''}
            </body>
            </html>
        `;

        return html;
    }

    /**
     * Utility methods
     */
    renderTemplate(templateName, data) {
        const component = this.components.get(templateName);
        if (!component) return '';

        // Simple template engine (can be replaced with Handlebars/Mustache)
        let html = component.template;
        
        // Replace simple variables {{variable}}
        html = html.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            return data[key] || '';
        });

        return html;
    }

    groupByCategory(instruments) {
        return instruments.reduce((acc, instrument) => {
            const category = instrument.legendary ? 'legendary' : instrument.category;
            if (!acc[category]) acc[category] = [];
            acc[category].push(instrument);
            return acc;
        }, {});
    }

    formatCategoryName(category) {
        const names = {
            'synthesizer': '<i class="fas fa-wave-square"></i> Synthesizers',
            'strings': '<i class="fas fa-music"></i> String Instruments', 
            'percussion': '<i class="fas fa-drum"></i> Drums & Percussion',
            'effects': '<i class="fas fa-magic"></i> Effects & Processors'
        };
        return names[category] || category.charAt(0).toUpperCase() + category.slice(1);
    }

    getInstrumentStyles() {
        return `
            .haos-page {
                background: linear-gradient(135deg, #0A0A0A 0%, #1A1410 20%, #0A0A0A 100%);
                color: #F4E8D8;
                font-family: 'Inter', sans-serif;
                min-height: 100vh;
            }
            
            .haos-header {
                background: rgba(20, 20, 25, 0.95);
                border-bottom: 2px solid var(--primary, #FF6B35);
                backdrop-filter: blur(20px);
                position: sticky;
                top: 0;
                z-index: 1000;
            }
            
            .instrument-workspace {
                display: grid;
                grid-template-columns: 1fr 300px;
                gap: 20px;
                padding: 20px;
                min-height: calc(100vh - 200px);
            }
            
            .legendary {
                position: relative;
            }
            
            .legendary::before {
                content: '👑';
                position: absolute;
                top: -5px;
                right: -5px;
                font-size: 20px;
                z-index: 10;
                filter: drop-shadow(0 0 10px gold);
            }
        `;
    }

    getWorkspaceStyles() {
        return `
            .haos-workspace {
                display: grid;
                grid-template-columns: 250px 1fr 300px;
                height: 100vh;
                gap: 0;
            }
            
            .workspace-sidebar {
                background: rgba(26, 26, 46, 0.9);
                border-right: 2px solid var(--primary, #FF6B35);
                overflow-y: auto;
            }
            
            .workspace-main {
                background: rgba(10, 10, 10, 0.8);
                position: relative;
            }
            
            .workspace-mixer {
                background: rgba(20, 20, 25, 0.95);
                border-left: 2px solid var(--primary, #FF6B35);
                overflow-y: auto;
            }
        `;
    }

    /**
     * Setup global CSS variables and utilities
     */
    setupGlobalStyles() {
        const style = document.createElement('style');
        style.textContent = `
            :root {
                --haos-primary: #FF6B35;
                --haos-secondary: #D4AF37;
                --haos-background: #0A0A0A;
                --haos-surface: rgba(20, 20, 25, 0.85);
                --haos-text: #F4E8D8;
                --haos-success: #39FF14;
                --haos-warning: #FFB000;
                --haos-error: #FF4757;
                
                --haos-font-display: 'Bebas Neue', sans-serif;
                --haos-font-mono: 'Space Mono', monospace;
                --haos-font-body: 'Inter', sans-serif;
                
                --haos-border-radius: 12px;
                --haos-shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.3);
                --haos-shadow-md: 0 4px 16px rgba(0, 0, 0, 0.4);
                --haos-shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.5);
            }
            
            .haos-btn {
                padding: 12px 24px;
                border-radius: var(--haos-border-radius);
                border: none;
                font-weight: 600;
                text-decoration: none;
                display: inline-flex;
                align-items: center;
                gap: 8px;
                cursor: pointer;
                transition: all 0.3s ease;
                font-family: var(--haos-font-body);
            }
            
            .haos-btn.primary {
                background: linear-gradient(135deg, var(--haos-primary), var(--haos-secondary));
                color: var(--haos-background);
            }
            
            .haos-btn.secondary {
                background: transparent;
                color: var(--haos-primary);
                border: 2px solid var(--haos-primary);
            }
            
            .haos-btn:hover {
                transform: translateY(-2px);
                box-shadow: var(--haos-shadow-md);
            }
            
            .instruments-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
                gap: 24px;
                padding: 24px;
            }
            
            .legendary-grid {
                grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
            }
        `;
        
        if (!document.head.querySelector('style[data-haos-global]')) {
            style.setAttribute('data-haos-global', 'true');
            document.head.appendChild(style);
        }
    }
}

// Initialize design system
if (typeof window !== 'undefined') {
    window.haosDesign = new HAOSDesignSystem();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HAOSDesignSystem;
}