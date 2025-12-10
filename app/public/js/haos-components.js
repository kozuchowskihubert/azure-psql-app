/**
 * HAOS Reusable UI Components Library
 * Core components for synthesis interfaces, studio controls, and workspace elements
 */

class HAOSComponents {
    constructor() {
        this.componentRegistry = new Map();
        this.themeSystem = new HAOSThemeSystem();
        this.init();
    }

    init() {
        this.registerCoreComponents();
        this.setupComponentObserver();
        this.loadExternalDependencies();
    }

    /**
     * Register all core HAOS components
     */
    registerCoreComponents() {
        // Studio Controls
        this.register('haos-knob', HAOSKnob);
        this.register('haos-slider', HAOSSlider);
        this.register('haos-button', HAOSButton);
        this.register('haos-led', HAOSLED);
        this.register('haos-meter', HAOSMeter);
        this.register('haos-switch', HAOSSwitch);

        // Patch System
        this.register('haos-patch-cable', HAOSPatchCable);
        this.register('haos-patch-jack', HAOSPatchJack);
        this.register('haos-patch-matrix', HAOSPatchMatrix);

        // Sequencer Components
        this.register('haos-step-button', HAOSStepButton);
        this.register('haos-pattern-display', HAOSPatternDisplay);
        this.register('haos-tempo-control', HAOSTempoControl);

        // Synthesis Modules
        this.register('haos-oscillator', HAOSOscillator);
        this.register('haos-filter', HAOSFilter);
        this.register('haos-envelope', HAOSEnvelope);
        this.register('haos-lfo', HAOSLFO);
        this.register('haos-amplifier', HAOSAmplifier);

        // Studio Layout
        this.register('haos-rack-unit', HAOSRackUnit);
        this.register('haos-studio-panel', HAOSStudioPanel);
        this.register('haos-workspace', HAOSWorkspace);

        // Navigation
        this.register('haos-nav-bar', HAOSNavigationBar);
        this.register('haos-breadcrumb', HAOSBreadcrumb);
        this.register('haos-environment-switcher', HAOSEnvironmentSwitcher);
    }

    /**
     * Register a new component
     */
    register(name, componentClass) {
        this.componentRegistry.set(name, componentClass);
        
        // Define custom element if not already defined
        if (!customElements.get(name)) {
            customElements.define(name, componentClass);
        }
    }

    /**
     * Create component instance
     */
    create(componentName, options = {}) {
        const ComponentClass = this.componentRegistry.get(componentName);
        if (!ComponentClass) {
            console.warn(`Component "${componentName}" not found`);
            return null;
        }

        const element = document.createElement(componentName);
        if (options.attributes) {
            Object.entries(options.attributes).forEach(([key, value]) => {
                element.setAttribute(key, value);
            });
        }

        if (options.properties) {
            Object.assign(element, options.properties);
        }

        return element;
    }

    /**
     * Setup component observer for dynamic content
     */
    setupComponentObserver() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        this.initializeComponentsInElement(node);
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    /**
     * Initialize components in a given element
     */
    initializeComponentsInElement(element) {
        // Find all HAOS components and initialize them
        this.componentRegistry.forEach((ComponentClass, name) => {
            const components = element.querySelectorAll(name);
            components.forEach(comp => {
                if (!comp._haosInitialized) {
                    comp._haosInitialized = true;
                    if (typeof comp.initialize === 'function') {
                        comp.initialize();
                    }
                }
            });
        });
    }

    /**
     * Load external dependencies
     */
    loadExternalDependencies() {
        // Load Web Audio API polyfills if needed
        if (!window.AudioContext) {
            this.loadScript('/js/polyfills/webaudio-polyfill.js');
        }

        // Load MIDI support
        if (!navigator.requestMIDIAccess) {
            this.loadScript('/js/polyfills/midi-polyfill.js');
        }
    }

    /**
     * Load external script
     */
    loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
}

/**
 * Base HAOS Component Class
 */
class HAOSBaseComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._value = 0;
        this._listeners = new Map();
        this.audioContext = null;
        this.audioNode = null;
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
        this.initializeAudio();
    }

    disconnectedCallback() {
        this.cleanup();
    }

    /**
     * Get component value
     */
    get value() {
        return this._value;
    }

    /**
     * Set component value with change notification
     */
    set value(newValue) {
        const oldValue = this._value;
        this._value = newValue;
        this.onValueChange(newValue, oldValue);
        this.dispatchEvent(new CustomEvent('valuechange', {
            detail: { value: newValue, oldValue }
        }));
    }

    /**
     * Override in subclasses
     */
    render() {
        this.shadowRoot.innerHTML = this.getTemplate();
        this.applyStyles();
    }

    /**
     * Override in subclasses
     */
    getTemplate() {
        return '<div class="haos-component">HAOS Component</div>';
    }

    /**
     * Apply component styles
     */
    applyStyles() {
        const style = document.createElement('style');
        style.textContent = this.getStyles() + this.getThemeStyles();
        this.shadowRoot.appendChild(style);
    }

    /**
     * Override in subclasses
     */
    getStyles() {
        return `
            :host {
                display: inline-block;
                user-select: none;
                touch-action: none;
            }
            .haos-component {
                font-family: var(--haos-font-body, 'Inter', sans-serif);
                color: var(--haos-text, #e0e0e0);
            }
        `;
    }

    /**
     * Get theme-specific styles
     */
    getThemeStyles() {
        const theme = this.getAttribute('theme') || 'default';
        return haosComponents.themeSystem.getComponentStyles(this.tagName.toLowerCase(), theme);
    }

    /**
     * Setup event listeners - override in subclasses
     */
    setupEventListeners() {
        // Base event handling
    }

    /**
     * Initialize audio connectivity - override in subclasses
     */
    initializeAudio() {
        // Initialize audio context if available
        if (window.audioContext) {
            this.audioContext = window.audioContext;
        }
    }

    /**
     * Value change handler - override in subclasses
     */
    onValueChange(newValue, oldValue) {
        // Override in subclasses
    }

    /**
     * Cleanup resources
     */
    cleanup() {
        if (this.audioNode) {
            this.audioNode.disconnect();
        }
        this._listeners.clear();
    }

    /**
     * Add event listener with cleanup tracking
     */
    addListener(target, event, handler) {
        target.addEventListener(event, handler);
        if (!this._listeners.has(target)) {
            this._listeners.set(target, []);
        }
        this._listeners.get(target).push({ event, handler });
    }

    /**
     * Emit MIDI CC message
     */
    emitMIDI(ccNumber, value) {
        this.dispatchEvent(new CustomEvent('midi', {
            detail: {
                type: 'cc',
                channel: 1,
                number: ccNumber,
                value: Math.round(value * 127),
                normalizedValue: value
            },
            bubbles: true
        }));
    }
}

/**
 * HAOS Knob Component
 */
class HAOSKnob extends HAOSBaseComponent {
    constructor() {
        super();
        this._min = 0;
        this._max = 1;
        this._step = 0.01;
        this._isDragging = false;
        this._startY = 0;
        this._startValue = 0;
        this._sensitivity = 1;
    }

    static get observedAttributes() {
        return ['min', 'max', 'step', 'value', 'label', 'cc', 'sensitivity'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case 'min':
                this._min = parseFloat(newValue) || 0;
                break;
            case 'max':
                this._max = parseFloat(newValue) || 1;
                break;
            case 'step':
                this._step = parseFloat(newValue) || 0.01;
                break;
            case 'value':
                this.value = parseFloat(newValue) || 0;
                break;
            case 'sensitivity':
                this._sensitivity = parseFloat(newValue) || 1;
                break;
        }
        if (this.shadowRoot) {
            this.updateKnobRotation();
        }
    }

    getTemplate() {
        const label = this.getAttribute('label') || '';
        return `
            <div class="haos-knob">
                <div class="knob-container">
                    <div class="knob-track"></div>
                    <div class="knob-body">
                        <div class="knob-indicator"></div>
                    </div>
                    <div class="knob-value">${Math.round(this.value * 100)}</div>
                </div>
                ${label ? `<div class="knob-label">${label}</div>` : ''}
            </div>
        `;
    }

    getStyles() {
        return super.getStyles() + `
            .haos-knob {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 8px;
                padding: 8px;
                min-width: 60px;
            }

            .knob-container {
                position: relative;
                width: 50px;
                height: 50px;
            }

            .knob-track {
                position: absolute;
                width: 100%;
                height: 100%;
                border-radius: 50%;
                border: 2px solid var(--haos-border, rgba(255, 107, 53, 0.3));
                background: var(--haos-panel, rgba(20, 20, 25, 0.85));
            }

            .knob-body {
                position: absolute;
                width: 100%;
                height: 100%;
                border-radius: 50%;
                background: linear-gradient(135deg, var(--haos-orange, #FF6B35), var(--haos-orange-dark, #E55A2B));
                cursor: pointer;
                transition: all 0.1s ease;
            }

            .knob-body:hover {
                transform: scale(1.05);
                box-shadow: 0 0 20px var(--haos-orange, #FF6B35);
            }

            .knob-body:active {
                transform: scale(0.95);
            }

            .knob-indicator {
                position: absolute;
                width: 3px;
                height: 20px;
                background: var(--haos-text, #e0e0e0);
                top: 5px;
                left: 50%;
                transform: translateX(-50%);
                border-radius: 2px;
                box-shadow: 0 0 4px rgba(0, 0, 0, 0.5);
            }

            .knob-value {
                position: absolute;
                bottom: -25px;
                left: 50%;
                transform: translateX(-50%);
                font-size: 10px;
                color: var(--haos-dim, #888);
                font-family: var(--haos-font-mono, 'Space Mono', monospace);
            }

            .knob-label {
                font-size: 12px;
                color: var(--haos-text, #e0e0e0);
                text-align: center;
                font-weight: 500;
            }
        `;
    }

    setupEventListeners() {
        const knobBody = this.shadowRoot.querySelector('.knob-body');
        
        // Mouse events
        this.addListener(knobBody, 'mousedown', this.startDrag.bind(this));
        this.addListener(document, 'mousemove', this.handleDrag.bind(this));
        this.addListener(document, 'mouseup', this.endDrag.bind(this));

        // Touch events
        this.addListener(knobBody, 'touchstart', this.startDrag.bind(this));
        this.addListener(document, 'touchmove', this.handleDrag.bind(this));
        this.addListener(document, 'touchend', this.endDrag.bind(this));

        // Double-click to reset
        this.addListener(knobBody, 'dblclick', () => {
            this.value = (this._min + this._max) / 2;
        });
    }

    startDrag(e) {
        e.preventDefault();
        this._isDragging = true;
        this._startY = e.clientY || e.touches[0].clientY;
        this._startValue = this.value;
        document.body.style.cursor = 'ns-resize';
    }

    handleDrag(e) {
        if (!this._isDragging) return;
        
        e.preventDefault();
        const currentY = e.clientY || e.touches[0].clientY;
        const deltaY = (this._startY - currentY) * this._sensitivity;
        const range = this._max - this._min;
        const deltaValue = (deltaY / 100) * range;
        
        let newValue = this._startValue + deltaValue;
        newValue = Math.max(this._min, Math.min(this._max, newValue));
        
        // Apply step
        if (this._step > 0) {
            newValue = Math.round(newValue / this._step) * this._step;
        }
        
        this.value = newValue;
    }

    endDrag() {
        if (!this._isDragging) return;
        
        this._isDragging = false;
        document.body.style.cursor = '';

        // Emit MIDI CC if configured
        const ccNumber = this.getAttribute('cc');
        if (ccNumber) {
            this.emitMIDI(parseInt(ccNumber), this.normalizedValue);
        }
    }

    get normalizedValue() {
        return (this.value - this._min) / (this._max - this._min);
    }

    onValueChange() {
        this.updateKnobRotation();
        this.updateValueDisplay();
    }

    updateKnobRotation() {
        const indicator = this.shadowRoot.querySelector('.knob-indicator');
        if (indicator) {
            const rotation = this.normalizedValue * 270 - 135; // -135° to +135°
            indicator.parentElement.style.transform = `rotate(${rotation}deg)`;
        }
    }

    updateValueDisplay() {
        const valueDisplay = this.shadowRoot.querySelector('.knob-value');
        if (valueDisplay) {
            valueDisplay.textContent = Math.round(this.value * 100);
        }
    }

    initializeAudio() {
        super.initializeAudio();
        if (this.audioContext) {
            // Create audio parameter for automation
            this.audioNode = this.audioContext.createGain();
            this.audioParam = this.audioNode.gain;
            this.audioParam.value = this.value;
        }
    }
}

/**
 * HAOS Theme System
 */
class HAOSThemeSystem {
    constructor() {
        this.themes = {
            default: {
                primary: '#FF6B35',
                secondary: '#D4AF37',
                background: '#0a0a0a',
                panel: 'rgba(20, 20, 25, 0.85)',
                text: '#e0e0e0',
                dim: '#888',
                border: 'rgba(255, 107, 53, 0.3)',
                glow: 'rgba(255, 107, 53, 0.5)'
            },
            arp2600: {
                primary: '#00D4FF',
                secondary: '#FF00FF',
                background: '#0a0a0a',
                panel: 'rgba(26, 26, 46, 0.9)',
                text: '#e4e4e4',
                dim: '#888',
                border: 'rgba(0, 212, 255, 0.3)',
                glow: 'rgba(0, 212, 255, 0.5)'
            },
            techno: {
                primary: '#39FF14',
                secondary: '#FF6B35',
                background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1410 100%)',
                panel: 'rgba(74, 60, 46, 0.4)',
                text: '#39FF14',
                dim: '#F4E8D8',
                border: 'rgba(57, 255, 20, 0.3)',
                glow: 'rgba(57, 255, 20, 0.5)'
            }
        };
    }

    /**
     * Get component styles for theme
     */
    getComponentStyles(componentName, theme) {
        const themeColors = this.themes[theme] || this.themes.default;
        
        return `
            :host {
                --haos-primary: ${themeColors.primary};
                --haos-secondary: ${themeColors.secondary};
                --haos-background: ${themeColors.background};
                --haos-panel: ${themeColors.panel};
                --haos-text: ${themeColors.text};
                --haos-dim: ${themeColors.dim};
                --haos-border: ${themeColors.border};
                --haos-glow: ${themeColors.glow};
            }
        `;
    }

    /**
     * Apply theme to document
     */
    applyTheme(themeName) {
        const theme = this.themes[themeName];
        if (theme) {
            document.documentElement.style.setProperty('--haos-theme', themeName);
            Object.entries(theme).forEach(([key, value]) => {
                document.documentElement.style.setProperty(`--haos-${key}`, value);
            });
        }
    }
}

// Initialize HAOS Components System
if (typeof window !== 'undefined') {
    window.haosComponents = new HAOSComponents();
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.haosComponents.initializeComponentsInElement(document.body);
        });
    } else {
        window.haosComponents.initializeComponentsInElement(document.body);
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { HAOSComponents, HAOSBaseComponent, HAOSKnob, HAOSThemeSystem };
}