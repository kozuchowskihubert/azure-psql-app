/**
 * UI Components Library for Modular Synthesis System
 * haos.fm v2.7.0
 * 
 * Provides reusable UI components:
 * - Rotary Knobs (synth-style parameter controls)
 * - Sliders (linear parameter controls)
 * - Buttons (transport, toggle, momentary)
 * - LED Indicators (status display)
 * - Pattern Grids (16-step sequencer grids)
 * - Waveform Displays (oscilloscope visualization)
 * - Patch Points (modular routing jacks)
 * 
 * Features:
 * - Mobile-responsive touch controls
 * - Accessibility (keyboard navigation, ARIA labels)
 * - Custom styling via CSS classes
 * - Event callbacks for parameter changes
 * - Visual feedback and animations
 */

class UIComponents {
    constructor(options = {}) {
        this.options = {
            theme: options.theme || 'dark',
            accentColor: options.accentColor || '#00d4ff',
            secondaryColor: options.secondaryColor || '#ff00ff',
            ...options
        };
        
        this.components = new Map();
        this.activeInteractions = new Map();
        
        // Inject default styles
        this._injectStyles();
    }

    /**
     * Create a rotary knob control
     * @param {Object} config - Knob configuration
     * @returns {HTMLElement} Knob container element
     */
    createKnob(config = {}) {
        const {
            id = `knob-${Date.now()}`,
            label = 'Parameter',
            min = 0,
            max = 100,
            value = 50,
            step = 1,
            unit = '',
            decimals = 0,
            onChange = null,
            bipolar = false, // Center at 50%
            logarithmic = false
        } = config;

        const container = document.createElement('div');
        container.className = 'haos-knob';
        container.id = id;
        container.setAttribute('role', 'slider');
        container.setAttribute('aria-label', label);
        container.setAttribute('aria-valuemin', min);
        container.setAttribute('aria-valuemax', max);
        container.setAttribute('aria-valuenow', value);
        container.setAttribute('tabindex', '0');

        const visual = document.createElement('div');
        visual.className = 'haos-knob-visual';

        const indicator = document.createElement('div');
        indicator.className = 'haos-knob-indicator';
        visual.appendChild(indicator);

        const labelEl = document.createElement('div');
        labelEl.className = 'haos-knob-label';
        labelEl.textContent = label;

        const valueDisplay = document.createElement('div');
        valueDisplay.className = 'haos-knob-value';

        container.appendChild(visual);
        container.appendChild(labelEl);
        container.appendChild(valueDisplay);

        // State
        const state = {
            min, max, value, step, unit, decimals, bipolar, logarithmic,
            isDragging: false,
            startY: 0,
            startValue: value
        };

        // Update visual
        const updateVisual = (newValue) => {
            state.value = Math.max(min, Math.min(max, newValue));
            
            // Calculate rotation (-135° to +135°, total 270°)
            const range = max - min;
            const normalized = (state.value - min) / range;
            const rotation = (normalized * 270) - 135;
            
            indicator.style.transform = `translateX(-50%) rotate(${rotation}deg)`;
            
            // Update value display
            const displayValue = state.value.toFixed(decimals);
            valueDisplay.textContent = `${displayValue}${unit}`;
            
            container.setAttribute('aria-valuenow', state.value);
            
            if (onChange) {
                onChange(state.value);
            }
        };

        // Mouse/Touch handlers
        const startDrag = (e) => {
            state.isDragging = true;
            state.startY = e.clientY || e.touches[0].clientY;
            state.startValue = state.value;
            container.classList.add('dragging');
            e.preventDefault();
        };

        const drag = (e) => {
            if (!state.isDragging) return;
            
            const clientY = e.clientY || (e.touches && e.touches[0].clientY);
            const deltaY = state.startY - clientY; // Inverted (up = increase)
            
            // Sensitivity: 200px = full range
            const sensitivity = (max - min) / 200;
            let newValue = state.startValue + (deltaY * sensitivity);
            
            // Apply step
            newValue = Math.round(newValue / step) * step;
            
            updateVisual(newValue);
            e.preventDefault();
        };

        const endDrag = () => {
            state.isDragging = false;
            container.classList.remove('dragging');
        };

        // Keyboard control
        const handleKey = (e) => {
            let delta = 0;
            if (e.key === 'ArrowUp' || e.key === 'ArrowRight') delta = step;
            if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') delta = -step;
            if (e.key === 'PageUp') delta = step * 10;
            if (e.key === 'PageDown') delta = -step * 10;
            if (e.key === 'Home') {
                updateVisual(min);
                return;
            }
            if (e.key === 'End') {
                updateVisual(max);
                return;
            }
            
            if (delta !== 0) {
                updateVisual(state.value + delta);
                e.preventDefault();
            }
        };

        // Event listeners
        visual.addEventListener('mousedown', startDrag);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', endDrag);
        
        visual.addEventListener('touchstart', startDrag, { passive: false });
        document.addEventListener('touchmove', drag, { passive: false });
        document.addEventListener('touchend', endDrag);
        
        container.addEventListener('keydown', handleKey);

        // Double-click to reset
        visual.addEventListener('dblclick', () => {
            const resetValue = bipolar ? (min + max) / 2 : min;
            updateVisual(resetValue);
        });

        // Initialize
        updateVisual(value);

        // Store component reference
        this.components.set(id, {
            type: 'knob',
            element: container,
            state,
            setValue: (v) => updateVisual(v),
            getValue: () => state.value,
            destroy: () => {
                document.removeEventListener('mousemove', drag);
                document.removeEventListener('mouseup', endDrag);
                document.removeEventListener('touchmove', drag);
                document.removeEventListener('touchend', endDrag);
                container.remove();
                this.components.delete(id);
            }
        });

        return container;
    }

    /**
     * Create a slider control
     * @param {Object} config - Slider configuration
     * @returns {HTMLElement} Slider container element
     */
    createSlider(config = {}) {
        const {
            id = `slider-${Date.now()}`,
            label = 'Parameter',
            min = 0,
            max = 100,
            value = 50,
            step = 1,
            unit = '',
            decimals = 0,
            onChange = null,
            orientation = 'horizontal', // or 'vertical'
            bipolar = false
        } = config;

        const container = document.createElement('div');
        container.className = `haos-slider haos-slider-${orientation}`;
        container.id = id;

        const labelEl = document.createElement('label');
        labelEl.className = 'haos-slider-label';
        labelEl.textContent = label;
        labelEl.htmlFor = `${id}-input`;

        const track = document.createElement('div');
        track.className = 'haos-slider-track';

        const fill = document.createElement('div');
        fill.className = 'haos-slider-fill';
        track.appendChild(fill);

        const thumb = document.createElement('div');
        thumb.className = 'haos-slider-thumb';
        track.appendChild(thumb);

        const valueDisplay = document.createElement('div');
        valueDisplay.className = 'haos-slider-value';

        const input = document.createElement('input');
        input.type = 'range';
        input.id = `${id}-input`;
        input.min = min;
        input.max = max;
        input.step = step;
        input.value = value;
        input.className = 'haos-slider-input';
        input.setAttribute('aria-label', label);

        container.appendChild(labelEl);
        container.appendChild(track);
        container.appendChild(valueDisplay);
        container.appendChild(input);

        // Update visual
        const updateVisual = (newValue) => {
            const normalized = (newValue - min) / (max - min);
            const percent = normalized * 100;

            if (orientation === 'horizontal') {
                thumb.style.left = `${percent}%`;
                fill.style.width = `${percent}%`;
            } else {
                thumb.style.bottom = `${percent}%`;
                fill.style.height = `${percent}%`;
            }

            const displayValue = parseFloat(newValue).toFixed(decimals);
            valueDisplay.textContent = `${displayValue}${unit}`;

            if (onChange) {
                onChange(parseFloat(newValue));
            }
        };

        input.addEventListener('input', (e) => {
            updateVisual(e.target.value);
        });

        // Initialize
        updateVisual(value);

        this.components.set(id, {
            type: 'slider',
            element: container,
            setValue: (v) => {
                input.value = v;
                updateVisual(v);
            },
            getValue: () => parseFloat(input.value),
            destroy: () => {
                container.remove();
                this.components.delete(id);
            }
        });

        return container;
    }

    /**
     * Create a button control
     * @param {Object} config - Button configuration
     * @returns {HTMLElement} Button element
     */
    createButton(config = {}) {
        const {
            id = `button-${Date.now()}`,
            label = 'Button',
            type = 'momentary', // 'toggle', 'momentary', 'transport'
            icon = null,
            active = false,
            onClick = null,
            className = ''
        } = config;

        const button = document.createElement('button');
        button.className = `haos-button haos-button-${type} ${className}`;
        button.id = id;
        button.setAttribute('aria-pressed', active);

        if (icon) {
            const iconEl = document.createElement('i');
            iconEl.className = icon;
            button.appendChild(iconEl);
        }

        const labelEl = document.createElement('span');
        labelEl.textContent = label;
        button.appendChild(labelEl);

        let isActive = active;
        if (isActive) {
            button.classList.add('active');
        }

        button.addEventListener('click', (e) => {
            if (type === 'toggle') {
                isActive = !isActive;
                button.classList.toggle('active', isActive);
                button.setAttribute('aria-pressed', isActive);
            } else if (type === 'momentary') {
                button.classList.add('active');
                setTimeout(() => button.classList.remove('active'), 100);
            }

            if (onClick) {
                onClick(isActive, e);
            }
        });

        this.components.set(id, {
            type: 'button',
            element: button,
            setActive: (state) => {
                isActive = state;
                button.classList.toggle('active', state);
                button.setAttribute('aria-pressed', state);
            },
            getActive: () => isActive,
            destroy: () => {
                button.remove();
                this.components.delete(id);
            }
        });

        return button;
    }

    /**
     * Create an LED indicator
     * @param {Object} config - LED configuration
     * @returns {HTMLElement} LED element
     */
    createLED(config = {}) {
        const {
            id = `led-${Date.now()}`,
            label = '',
            color = 'blue', // 'blue', 'red', 'green', 'yellow', 'purple'
            active = false,
            blinking = false
        } = config;

        const container = document.createElement('div');
        container.className = 'haos-led-container';
        container.id = id;

        const led = document.createElement('div');
        led.className = `haos-led haos-led-${color}`;
        if (active) led.classList.add('active');
        if (blinking) led.classList.add('blinking');

        container.appendChild(led);

        if (label) {
            const labelEl = document.createElement('span');
            labelEl.className = 'haos-led-label';
            labelEl.textContent = label;
            container.appendChild(labelEl);
        }

        this.components.set(id, {
            type: 'led',
            element: container,
            setActive: (state) => {
                led.classList.toggle('active', state);
            },
            setBlinking: (state) => {
                led.classList.toggle('blinking', state);
            },
            destroy: () => {
                container.remove();
                this.components.delete(id);
            }
        });

        return container;
    }

    /**
     * Create a 16-step pattern grid
     * @param {Object} config - Grid configuration
     * @returns {HTMLElement} Grid container element
     */
    createPatternGrid(config = {}) {
        const {
            id = `grid-${Date.now()}`,
            rows = 4, // Number of instrument rows
            steps = 16,
            labels = ['Kick', 'Snare', 'HiHat', 'Perc'],
            pattern = null, // Initial pattern (2D array)
            onStepChange = null,
            onStepTrigger = null
        } = config;

        const container = document.createElement('div');
        container.className = 'haos-pattern-grid';
        container.id = id;

        const gridData = Array(rows).fill(null).map(() => Array(steps).fill(false));
        const buttons = [];
        let currentStep = -1;

        // Create grid rows
        for (let row = 0; row < rows; row++) {
            const rowEl = document.createElement('div');
            rowEl.className = 'haos-grid-row';

            // Row label
            const label = document.createElement('div');
            label.className = 'haos-grid-label';
            label.textContent = labels[row] || `Track ${row + 1}`;
            rowEl.appendChild(label);

            const rowButtons = [];

            // Create step buttons
            for (let step = 0; step < steps; step++) {
                const stepBtn = document.createElement('button');
                stepBtn.className = 'haos-grid-step';
                stepBtn.setAttribute('data-row', row);
                stepBtn.setAttribute('data-step', step);
                stepBtn.setAttribute('aria-label', `${labels[row]} Step ${step + 1}`);

                // Beat emphasis (every 4 steps)
                if (step % 4 === 0) {
                    stepBtn.classList.add('beat-marker');
                }

                stepBtn.addEventListener('click', () => {
                    gridData[row][step] = !gridData[row][step];
                    stepBtn.classList.toggle('active', gridData[row][step]);

                    if (onStepChange) {
                        onStepChange(row, step, gridData[row][step], gridData);
                    }
                });

                rowEl.appendChild(stepBtn);
                rowButtons.push(stepBtn);
            }

            buttons.push(rowButtons);
            container.appendChild(rowEl);
        }

        // Load initial pattern
        if (pattern) {
            for (let row = 0; row < Math.min(rows, pattern.length); row++) {
                for (let step = 0; step < Math.min(steps, pattern[row].length); step++) {
                    if (pattern[row][step]) {
                        gridData[row][step] = true;
                        buttons[row][step].classList.add('active');
                    }
                }
            }
        }

        this.components.set(id, {
            type: 'patternGrid',
            element: container,
            setStep: (step) => {
                // Remove previous step highlight
                if (currentStep >= 0) {
                    for (let row = 0; row < rows; row++) {
                        buttons[row][currentStep].classList.remove('current-step');
                    }
                }

                // Highlight current step
                currentStep = step;
                if (step >= 0 && step < steps) {
                    for (let row = 0; row < rows; row++) {
                        buttons[row][step].classList.add('current-step');
                        
                        // Trigger callback if step is active
                        if (gridData[row][step] && onStepTrigger) {
                            onStepTrigger(row, step);
                        }
                    }
                }
            },
            getPattern: () => gridData,
            setPattern: (newPattern) => {
                for (let row = 0; row < rows; row++) {
                    for (let step = 0; step < steps; step++) {
                        const active = newPattern[row]?.[step] || false;
                        gridData[row][step] = active;
                        buttons[row][step].classList.toggle('active', active);
                    }
                }
            },
            clear: () => {
                for (let row = 0; row < rows; row++) {
                    for (let step = 0; step < steps; step++) {
                        gridData[row][step] = false;
                        buttons[row][step].classList.remove('active');
                    }
                }
            },
            destroy: () => {
                container.remove();
                this.components.delete(id);
            }
        });

        return container;
    }

    /**
     * Create a waveform display (oscilloscope)
     * @param {Object} config - Display configuration
     * @returns {HTMLElement} Canvas element
     */
    createWaveformDisplay(config = {}) {
        const {
            id = `waveform-${Date.now()}`,
            width = 400,
            height = 150,
            backgroundColor = '#000000',
            waveColor = '#00d4ff',
            gridColor = '#333333'
        } = config;

        const canvas = document.createElement('canvas');
        canvas.className = 'haos-waveform';
        canvas.id = id;
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        let animationFrame = null;

        const drawGrid = () => {
            ctx.strokeStyle = gridColor;
            ctx.lineWidth = 1;

            // Horizontal lines
            for (let y = 0; y <= height; y += height / 4) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(width, y);
                ctx.stroke();
            }

            // Vertical lines
            for (let x = 0; x <= width; x += width / 8) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, height);
                ctx.stroke();
            }
        };

        const draw = (dataArray) => {
            // Clear
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(0, 0, width, height);

            // Draw grid
            drawGrid();

            // Draw waveform
            if (dataArray && dataArray.length > 0) {
                ctx.strokeStyle = waveColor;
                ctx.lineWidth = 2;
                ctx.beginPath();

                const sliceWidth = width / dataArray.length;
                let x = 0;

                for (let i = 0; i < dataArray.length; i++) {
                    const v = dataArray[i] / 128.0; // Normalize 0-255 to 0-2
                    const y = (v * height) / 2;

                    if (i === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }

                    x += sliceWidth;
                }

                ctx.stroke();
            }
        };

        // Initial draw
        draw([]);

        this.components.set(id, {
            type: 'waveform',
            element: canvas,
            update: (dataArray) => {
                draw(dataArray);
            },
            startAnimation: (analyser) => {
                const bufferLength = analyser.frequencyBinCount;
                const dataArray = new Uint8Array(bufferLength);

                const animate = () => {
                    animationFrame = requestAnimationFrame(animate);
                    analyser.getByteTimeDomainData(dataArray);
                    draw(dataArray);
                };

                animate();
            },
            stopAnimation: () => {
                if (animationFrame) {
                    cancelAnimationFrame(animationFrame);
                    animationFrame = null;
                }
            },
            destroy: () => {
                if (animationFrame) {
                    cancelAnimationFrame(animationFrame);
                }
                canvas.remove();
                this.components.delete(id);
            }
        });

        return canvas;
    }

    /**
     * Create a patch point (modular jack)
     * @param {Object} config - Patch point configuration
     * @returns {HTMLElement} Patch point element
     */
    createPatchPoint(config = {}) {
        const {
            id = `patch-${Date.now()}`,
            label = 'OUT',
            type = 'output', // 'input' or 'output'
            onConnect = null,
            onDisconnect = null
        } = config;

        const container = document.createElement('div');
        container.className = `haos-patch-point haos-patch-${type}`;
        container.id = id;

        const jack = document.createElement('div');
        jack.className = 'haos-patch-jack';
        container.appendChild(jack);

        const labelEl = document.createElement('div');
        labelEl.className = 'haos-patch-label';
        labelEl.textContent = label;
        container.appendChild(labelEl);

        let connected = false;

        container.addEventListener('click', () => {
            connected = !connected;
            container.classList.toggle('connected', connected);
            jack.classList.toggle('connected', connected);

            if (connected && onConnect) {
                onConnect(id);
            } else if (!connected && onDisconnect) {
                onDisconnect(id);
            }
        });

        this.components.set(id, {
            type: 'patchPoint',
            element: container,
            connect: () => {
                connected = true;
                container.classList.add('connected');
                jack.classList.add('connected');
            },
            disconnect: () => {
                connected = false;
                container.classList.remove('connected');
                jack.classList.remove('connected');
            },
            isConnected: () => connected,
            destroy: () => {
                container.remove();
                this.components.delete(id);
            }
        });

        return container;
    }

    /**
     * Get a component by ID
     */
    getComponent(id) {
        return this.components.get(id);
    }

    /**
     * Destroy a component by ID
     */
    destroyComponent(id) {
        const component = this.components.get(id);
        if (component && component.destroy) {
            component.destroy();
        }
    }

    /**
     * Destroy all components
     */
    destroyAll() {
        this.components.forEach(component => {
            if (component.destroy) {
                component.destroy();
            }
        });
        this.components.clear();
    }

    /**
     * Inject default CSS styles
     */
    _injectStyles() {
        if (document.getElementById('haos-ui-styles')) return;

        const style = document.createElement('style');
        style.id = 'haos-ui-styles';
        style.textContent = `
            /* Knobs */
            .haos-knob {
                display: inline-flex;
                flex-direction: column;
                align-items: center;
                user-select: none;
                margin: 10px;
            }

            .haos-knob-visual {
                width: 80px;
                height: 80px;
                border-radius: 50%;
                background: radial-gradient(circle at 30% 30%, #3a3a4e, #1a1a2e);
                border: 3px solid ${this.options.accentColor};
                position: relative;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .haos-knob-visual:hover {
                border-color: ${this.options.secondaryColor};
                transform: scale(1.05);
            }

            .haos-knob.dragging .haos-knob-visual {
                border-color: ${this.options.secondaryColor};
                box-shadow: 0 0 20px ${this.options.secondaryColor}80;
            }

            .haos-knob-indicator {
                position: absolute;
                width: 4px;
                height: 35px;
                background: linear-gradient(to bottom, ${this.options.secondaryColor}, ${this.options.accentColor});
                left: 50%;
                top: 5px;
                transform-origin: bottom center;
                border-radius: 2px;
            }

            .haos-knob-label {
                margin-top: 8px;
                font-size: 0.85em;
                color: #888;
            }

            .haos-knob-value {
                font-size: 0.9em;
                color: ${this.options.accentColor};
                font-weight: bold;
                margin-top: 4px;
            }

            /* Sliders */
            .haos-slider {
                display: flex;
                align-items: center;
                gap: 15px;
                margin: 15px 0;
            }

            .haos-slider-horizontal {
                flex-direction: row;
            }

            .haos-slider-vertical {
                flex-direction: column;
            }

            .haos-slider-label {
                font-size: 0.9em;
                color: #888;
                min-width: 80px;
            }

            .haos-slider-track {
                position: relative;
                flex: 1;
                height: 8px;
                background: #1a1a2e;
                border-radius: 4px;
                border: 1px solid ${this.options.accentColor}40;
            }

            .haos-slider-fill {
                position: absolute;
                left: 0;
                top: 0;
                height: 100%;
                background: linear-gradient(90deg, ${this.options.accentColor}, ${this.options.secondaryColor});
                border-radius: 4px;
                transition: width 0.1s ease;
            }

            .haos-slider-thumb {
                position: absolute;
                width: 20px;
                height: 20px;
                background: ${this.options.accentColor};
                border: 2px solid #fff;
                border-radius: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
                cursor: pointer;
                box-shadow: 0 2px 5px rgba(0,0,0,0.3);
                transition: left 0.1s ease;
            }

            .haos-slider-thumb:hover {
                transform: translate(-50%, -50%) scale(1.1);
            }

            .haos-slider-input {
                position: absolute;
                opacity: 0;
                width: 100%;
                height: 100%;
                cursor: pointer;
            }

            .haos-slider-value {
                font-size: 0.9em;
                color: ${this.options.accentColor};
                font-weight: bold;
                min-width: 60px;
                text-align: right;
            }

            /* Buttons */
            .haos-button {
                padding: 12px 24px;
                border: 2px solid ${this.options.accentColor};
                background: transparent;
                color: ${this.options.accentColor};
                border-radius: 8px;
                cursor: pointer;
                font-size: 1em;
                font-weight: bold;
                transition: all 0.2s ease;
                display: inline-flex;
                align-items: center;
                gap: 8px;
            }

            .haos-button:hover {
                background: ${this.options.accentColor}20;
                transform: translateY(-2px);
            }

            .haos-button.active {
                background: ${this.options.accentColor};
                color: #000;
                box-shadow: 0 0 20px ${this.options.accentColor}80;
            }

            .haos-button-transport {
                border-radius: 50%;
                width: 50px;
                height: 50px;
                padding: 0;
                justify-content: center;
            }

            /* LEDs */
            .haos-led-container {
                display: inline-flex;
                align-items: center;
                gap: 8px;
            }

            .haos-led {
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background: #333;
                border: 2px solid #555;
                transition: all 0.2s ease;
            }

            .haos-led.active {
                box-shadow: 0 0 10px currentColor, 0 0 20px currentColor;
            }

            .haos-led-blue.active { background: #00d4ff; border-color: #00d4ff; }
            .haos-led-red.active { background: #ff0044; border-color: #ff0044; }
            .haos-led-green.active { background: #00ff88; border-color: #00ff88; }
            .haos-led-yellow.active { background: #ffdd00; border-color: #ffdd00; }
            .haos-led-purple.active { background: #ff00ff; border-color: #ff00ff; }

            .haos-led.blinking {
                animation: blink 1s infinite;
            }

            @keyframes blink {
                0%, 49% { opacity: 1; }
                50%, 100% { opacity: 0.3; }
            }

            .haos-led-label {
                font-size: 0.85em;
                color: #888;
            }

            /* Pattern Grid */
            .haos-pattern-grid {
                background: #1a1a2e;
                padding: 15px;
                border-radius: 10px;
                border: 2px solid ${this.options.accentColor}40;
            }

            .haos-grid-row {
                display: grid;
                grid-template-columns: 100px repeat(16, 1fr);
                gap: 4px;
                margin-bottom: 4px;
            }

            .haos-grid-label {
                display: flex;
                align-items: center;
                justify-content: center;
                color: ${this.options.accentColor};
                font-weight: bold;
                font-size: 0.9em;
                background: #2a2a3e;
                border-radius: 4px;
                padding: 8px;
            }

            .haos-grid-step {
                aspect-ratio: 1;
                background: #2a2a3e;
                border: 1px solid #444;
                border-radius: 3px;
                cursor: pointer;
                transition: all 0.15s ease;
                padding: 0;
            }

            .haos-grid-step:hover {
                border-color: ${this.options.accentColor};
                background: #3a3a4e;
            }

            .haos-grid-step.active {
                background: ${this.options.accentColor};
                border-color: ${this.options.accentColor};
                box-shadow: 0 0 10px ${this.options.accentColor}80;
            }

            .haos-grid-step.current-step {
                border: 2px solid ${this.options.secondaryColor};
                box-shadow: 0 0 15px ${this.options.secondaryColor}80;
            }

            .haos-grid-step.beat-marker {
                border-left: 2px solid ${this.options.accentColor}60;
            }

            /* Waveform */
            .haos-waveform {
                border: 2px solid ${this.options.accentColor};
                border-radius: 8px;
                display: block;
            }

            /* Patch Points */
            .haos-patch-point {
                display: inline-flex;
                flex-direction: column;
                align-items: center;
                padding: 10px;
                border: 2px solid ${this.options.secondaryColor}40;
                border-radius: 8px;
                background: #2a2a3e;
                cursor: pointer;
                transition: all 0.3s ease;
                min-width: 80px;
            }

            .haos-patch-point:hover {
                border-color: ${this.options.secondaryColor};
                transform: scale(1.05);
            }

            .haos-patch-point.connected {
                border-color: ${this.options.accentColor};
                background: ${this.options.accentColor}20;
            }

            .haos-patch-jack {
                width: 30px;
                height: 30px;
                border-radius: 50%;
                background: radial-gradient(circle at 30% 30%, ${this.options.secondaryColor}, #8800aa);
                border: 3px solid #fff;
                margin-bottom: 8px;
                transition: all 0.3s ease;
            }

            .haos-patch-jack.connected {
                background: radial-gradient(circle at 30% 30%, ${this.options.accentColor}, #0088aa);
                box-shadow: 0 0 15px ${this.options.accentColor}80;
            }

            .haos-patch-label {
                font-size: 0.85em;
                color: #888;
                font-weight: bold;
            }
        `;

        document.head.appendChild(style);
    }
}

// Export for ES6 modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIComponents;
}

// Export as browser global
if (typeof window !== 'undefined') {
    window.UIComponents = UIComponents;
}
