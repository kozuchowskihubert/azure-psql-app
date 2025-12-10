/**
 * HAOS Knob Component
 * Reusable rotary control for synthesizer parameters
 * 
 * Usage:
 * <haos-knob
 *   name="CUTOFF"
 *   min="0"
 *   max="100"
 *   value="50"
 *   color="#FF6B35"
 *   size="80"
 *   sensitivity="1"
 *   format="percent"
 *   bipolar="false"
 *   midi-cc="74">
 * </haos-knob>
 * 
 * Events:
 * - 'change' - fired when value changes, detail: { value, name }
 * - 'input' - fired during dragging, detail: { value, name }
 * 
 * @version 1.0.0
 * @author HAOS.fm
 */

class HAOSKnob extends HTMLElement {
  static get observedAttributes() {
    return ['value', 'min', 'max', 'name', 'color', 'size', 'sensitivity', 'format', 'bipolar', 'disabled', 'midi-cc'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    // State
    this._value = 50;
    this._min = 0;
    this._max = 100;
    this._name = 'PARAM';
    this._color = '#FF6B35';
    this._size = 80;
    this._sensitivity = 1;
    this._format = 'default'; // default, percent, frequency, time, db, pan, semitone
    this._bipolar = false;
    this._disabled = false;
    this._midiCC = null;
    
    // Interaction state
    this._isDragging = false;
    this._startY = 0;
    this._startValue = 0;
    
    // Double-click tracking
    this._lastClickTime = 0;
    
    // Animation
    this._animationFrame = null;
    
    this.render();
    this.attachEvents();
  }

  connectedCallback() {
    this.updateDisplay();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    
    switch (name) {
      case 'value':
        this._value = parseFloat(newValue) || 0;
        break;
      case 'min':
        this._min = parseFloat(newValue) || 0;
        break;
      case 'max':
        this._max = parseFloat(newValue) || 100;
        break;
      case 'name':
        this._name = newValue || 'PARAM';
        break;
      case 'color':
        this._color = newValue || '#FF6B35';
        break;
      case 'size':
        this._size = parseInt(newValue) || 80;
        break;
      case 'sensitivity':
        this._sensitivity = parseFloat(newValue) || 1;
        break;
      case 'format':
        this._format = newValue || 'default';
        break;
      case 'bipolar':
        this._bipolar = newValue === 'true';
        break;
      case 'disabled':
        this._disabled = newValue !== null;
        break;
      case 'midi-cc':
        this._midiCC = parseInt(newValue);
        break;
    }
    
    this.updateDisplay();
  }

  // Getters and setters
  get value() { return this._value; }
  set value(val) {
    this._value = this.clamp(val);
    this.updateDisplay();
    this.dispatchEvent(new CustomEvent('change', {
      detail: { value: this._value, name: this._name },
      bubbles: true
    }));
  }

  get min() { return this._min; }
  set min(val) { this._min = val; this.updateDisplay(); }

  get max() { return this._max; }
  set max(val) { this._max = val; this.updateDisplay(); }

  get name() { return this._name; }
  set name(val) { this._name = val; this.updateDisplay(); }

  get disabled() { return this._disabled; }
  set disabled(val) { this._disabled = val; this.updateDisplay(); }

  render() {
    this.shadowRoot.innerHTML = `
      <style>${this.getStyles()}</style>
      <div class="knob-container" tabindex="0" role="slider" 
           aria-valuemin="${this._min}" 
           aria-valuemax="${this._max}" 
           aria-valuenow="${this._value}"
           aria-label="${this._name}">
        <div class="knob-name">${this._name}</div>
        <div class="knob-wrapper">
          <svg class="knob-svg" viewBox="0 0 100 100">
            <!-- Background track -->
            <circle class="knob-track" cx="50" cy="50" r="40" 
                    fill="none" stroke-width="6" stroke-linecap="round"/>
            <!-- Active arc -->
            <circle class="knob-arc" cx="50" cy="50" r="40" 
                    fill="none" stroke-width="6" stroke-linecap="round"/>
            <!-- Center circle -->
            <circle class="knob-center" cx="50" cy="50" r="30"/>
            <!-- Indicator line -->
            <line class="knob-indicator" x1="50" y1="50" x2="50" y2="25"/>
            <!-- Glow effect -->
            <circle class="knob-glow" cx="50" cy="50" r="35" 
                    fill="none" stroke-width="2"/>
          </svg>
          <!-- Tick marks -->
          <div class="knob-ticks">
            ${this.generateTicks()}
          </div>
        </div>
        <div class="knob-value">${this.formatValue()}</div>
      </div>
    `;
  }

  getStyles() {
    const arcLength = 2 * Math.PI * 40; // circumference
    const arcAngle = 270; // total sweep angle in degrees
    const arcRatio = arcAngle / 360;
    const dashLength = arcLength * arcRatio;
    
    return `
      :host {
        display: inline-block;
        user-select: none;
        -webkit-user-select: none;
        touch-action: none;
      }

      .knob-container {
        width: ${this._size}px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        cursor: pointer;
        outline: none;
        opacity: ${this._disabled ? '0.5' : '1'};
        pointer-events: ${this._disabled ? 'none' : 'auto'};
        transition: transform 0.15s ease;
      }

      .knob-container:focus .knob-center {
        filter: brightness(1.2);
      }

      .knob-container:hover {
        transform: scale(1.02);
      }

      .knob-container.dragging {
        transform: scale(1.05);
      }

      .knob-name {
        font-family: 'Space Mono', monospace;
        font-size: ${Math.max(9, this._size * 0.11)}px;
        color: #888;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        text-align: center;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 100%;
      }

      .knob-wrapper {
        width: ${this._size}px;
        height: ${this._size}px;
        position: relative;
      }

      .knob-svg {
        width: 100%;
        height: 100%;
        transform: rotate(135deg); /* Start from bottom-left */
      }

      .knob-track {
        stroke: rgba(255, 255, 255, 0.08);
        stroke-dasharray: ${dashLength} ${arcLength};
      }

      .knob-arc {
        stroke: ${this._color};
        stroke-dasharray: 0 ${arcLength};
        transition: stroke-dasharray 0.05s ease-out;
        filter: drop-shadow(0 0 4px ${this._color}40);
      }

      .knob-center {
        fill: linear-gradient(145deg, #1a1a1f, #252530);
        stroke: rgba(255, 255, 255, 0.1);
        stroke-width: 1;
        filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.4));
        transition: fill 0.2s ease;
      }

      .knob-indicator {
        stroke: ${this._color};
        stroke-width: 3;
        stroke-linecap: round;
        filter: drop-shadow(0 0 3px ${this._color});
        transition: transform 0.05s ease-out;
        transform-origin: 50px 50px;
      }

      .knob-glow {
        stroke: ${this._color};
        opacity: 0;
        transition: opacity 0.2s ease;
      }

      .knob-container.dragging .knob-glow {
        opacity: 0.4;
        animation: pulse 0.8s ease-in-out infinite;
      }

      @keyframes pulse {
        0%, 100% { opacity: 0.3; }
        50% { opacity: 0.6; }
      }

      .knob-ticks {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
      }

      .knob-tick {
        position: absolute;
        width: 2px;
        height: 6px;
        background: rgba(255, 255, 255, 0.15);
        border-radius: 1px;
        transform-origin: center ${this._size / 2}px;
      }

      .knob-tick.major {
        height: 8px;
        background: rgba(255, 255, 255, 0.3);
      }

      .knob-value {
        font-family: 'Space Mono', monospace;
        font-size: ${Math.max(10, this._size * 0.14)}px;
        color: ${this._color};
        font-weight: bold;
        text-align: center;
        min-width: ${this._size}px;
        transition: color 0.15s ease;
      }

      .knob-container.dragging .knob-value {
        color: white;
      }

      /* MIDI indicator */
      .midi-indicator {
        position: absolute;
        top: 4px;
        right: 4px;
        font-size: 8px;
        color: rgba(255, 255, 255, 0.3);
        font-family: 'Space Mono', monospace;
      }

      .knob-container.midi-learning .midi-indicator {
        color: ${this._color};
        animation: blink 0.5s ease-in-out infinite;
      }

      @keyframes blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.3; }
      }
    `;
  }

  generateTicks() {
    const ticks = [];
    const numTicks = 11; // 0, 10, 20, ..., 100
    const startAngle = -135;
    const endAngle = 135;
    const angleRange = endAngle - startAngle;
    
    for (let i = 0; i < numTicks; i++) {
      const angle = startAngle + (i / (numTicks - 1)) * angleRange;
      const isMajor = i % 5 === 0;
      ticks.push(`
        <div class="knob-tick ${isMajor ? 'major' : ''}" 
             style="left: 50%; top: 2px; transform: translateX(-50%) rotate(${angle}deg);">
        </div>
      `);
    }
    
    return ticks.join('');
  }

  attachEvents() {
    const container = this.shadowRoot.querySelector('.knob-container');
    
    // Mouse events
    container.addEventListener('mousedown', this.handleMouseDown.bind(this));
    document.addEventListener('mousemove', this.handleMouseMove.bind(this));
    document.addEventListener('mouseup', this.handleMouseUp.bind(this));
    
    // Touch events
    container.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    document.addEventListener('touchend', this.handleTouchEnd.bind(this));
    
    // Wheel event
    container.addEventListener('wheel', this.handleWheel.bind(this), { passive: false });
    
    // Keyboard events
    container.addEventListener('keydown', this.handleKeyDown.bind(this));
    
    // Double-click to reset
    container.addEventListener('dblclick', this.handleDoubleClick.bind(this));
    
    // Right-click context menu for MIDI learn
    container.addEventListener('contextmenu', this.handleContextMenu.bind(this));
  }

  handleMouseDown(e) {
    if (this._disabled) return;
    e.preventDefault();
    this._isDragging = true;
    this._startY = e.clientY;
    this._startValue = this._value;
    
    const container = this.shadowRoot.querySelector('.knob-container');
    container.classList.add('dragging');
  }

  handleMouseMove(e) {
    if (!this._isDragging) return;
    
    const deltaY = this._startY - e.clientY;
    const range = this._max - this._min;
    const sensitivity = (range / 200) * this._sensitivity;
    
    // Shift for fine control
    const modifier = e.shiftKey ? 0.1 : 1;
    
    const newValue = this._startValue + deltaY * sensitivity * modifier;
    this.setValue(newValue);
    
    this.dispatchEvent(new CustomEvent('input', {
      detail: { value: this._value, name: this._name },
      bubbles: true
    }));
  }

  handleMouseUp() {
    if (this._isDragging) {
      this._isDragging = false;
      const container = this.shadowRoot.querySelector('.knob-container');
      container.classList.remove('dragging');
      
      this.dispatchEvent(new CustomEvent('change', {
        detail: { value: this._value, name: this._name },
        bubbles: true
      }));
    }
  }

  handleTouchStart(e) {
    if (this._disabled) return;
    e.preventDefault();
    this._isDragging = true;
    this._startY = e.touches[0].clientY;
    this._startValue = this._value;
    
    const container = this.shadowRoot.querySelector('.knob-container');
    container.classList.add('dragging');
  }

  handleTouchMove(e) {
    if (!this._isDragging) return;
    e.preventDefault();
    
    const deltaY = this._startY - e.touches[0].clientY;
    const range = this._max - this._min;
    const sensitivity = (range / 200) * this._sensitivity;
    
    const newValue = this._startValue + deltaY * sensitivity;
    this.setValue(newValue);
    
    this.dispatchEvent(new CustomEvent('input', {
      detail: { value: this._value, name: this._name },
      bubbles: true
    }));
  }

  handleTouchEnd() {
    if (this._isDragging) {
      this._isDragging = false;
      const container = this.shadowRoot.querySelector('.knob-container');
      container.classList.remove('dragging');
      
      this.dispatchEvent(new CustomEvent('change', {
        detail: { value: this._value, name: this._name },
        bubbles: true
      }));
    }
  }

  handleWheel(e) {
    if (this._disabled) return;
    e.preventDefault();
    
    const range = this._max - this._min;
    const step = (range / 100) * this._sensitivity;
    const modifier = e.shiftKey ? 0.1 : 1;
    
    const delta = e.deltaY > 0 ? -step : step;
    this.setValue(this._value + delta * modifier);
    
    this.dispatchEvent(new CustomEvent('change', {
      detail: { value: this._value, name: this._name },
      bubbles: true
    }));
  }

  handleKeyDown(e) {
    if (this._disabled) return;
    
    const range = this._max - this._min;
    const step = range / 100;
    const largeStep = range / 10;
    
    switch (e.key) {
      case 'ArrowUp':
      case 'ArrowRight':
        e.preventDefault();
        this.setValue(this._value + (e.shiftKey ? step : largeStep));
        break;
      case 'ArrowDown':
      case 'ArrowLeft':
        e.preventDefault();
        this.setValue(this._value - (e.shiftKey ? step : largeStep));
        break;
      case 'Home':
        e.preventDefault();
        this.setValue(this._min);
        break;
      case 'End':
        e.preventDefault();
        this.setValue(this._max);
        break;
      case 'r':
      case 'R':
        e.preventDefault();
        this.reset();
        break;
    }
    
    this.dispatchEvent(new CustomEvent('change', {
      detail: { value: this._value, name: this._name },
      bubbles: true
    }));
  }

  handleDoubleClick(e) {
    e.preventDefault();
    this.reset();
    this.dispatchEvent(new CustomEvent('change', {
      detail: { value: this._value, name: this._name },
      bubbles: true
    }));
  }

  handleContextMenu(e) {
    e.preventDefault();
    
    // Dispatch MIDI learn request event
    this.dispatchEvent(new CustomEvent('midi-learn', {
      detail: { name: this._name, midiCC: this._midiCC },
      bubbles: true
    }));
    
    const container = this.shadowRoot.querySelector('.knob-container');
    container.classList.add('midi-learning');
    
    // Reset after 5 seconds if no MIDI received
    setTimeout(() => {
      container.classList.remove('midi-learning');
    }, 5000);
  }

  setValue(val) {
    this._value = this.clamp(val);
    this.updateDisplay();
  }

  clamp(val) {
    return Math.max(this._min, Math.min(this._max, val));
  }

  reset() {
    // Reset to center for bipolar, or minimum for unipolar
    const defaultValue = this._bipolar ? (this._max + this._min) / 2 : this._min;
    this.setValue(defaultValue);
  }

  updateDisplay() {
    if (!this.shadowRoot.querySelector('.knob-arc')) return;
    
    const arc = this.shadowRoot.querySelector('.knob-arc');
    const indicator = this.shadowRoot.querySelector('.knob-indicator');
    const valueDisplay = this.shadowRoot.querySelector('.knob-value');
    const nameDisplay = this.shadowRoot.querySelector('.knob-name');
    const container = this.shadowRoot.querySelector('.knob-container');
    
    // Calculate rotation
    const range = this._max - this._min;
    const normalized = (this._value - this._min) / range;
    const angle = -135 + normalized * 270; // -135 to 135 degrees
    
    // Update indicator rotation
    indicator.style.transform = `rotate(${angle}deg)`;
    
    // Update arc
    const arcLength = 2 * Math.PI * 40;
    const arcAngle = 270;
    const arcRatio = arcAngle / 360;
    const maxDash = arcLength * arcRatio;
    
    let dashOffset;
    if (this._bipolar) {
      // Bipolar: arc from center
      const center = 0.5;
      const dashAmount = Math.abs(normalized - center) * maxDash;
      const startOffset = normalized < center ? (center - (center - normalized)) * maxDash : center * maxDash;
      arc.style.strokeDasharray = `${dashAmount} ${arcLength}`;
      arc.style.strokeDashoffset = -startOffset;
    } else {
      // Unipolar: arc from start
      const dashAmount = normalized * maxDash;
      arc.style.strokeDasharray = `${dashAmount} ${arcLength}`;
    }
    
    // Update value display
    valueDisplay.textContent = this.formatValue();
    
    // Update name
    nameDisplay.textContent = this._name;
    
    // Update ARIA
    container.setAttribute('aria-valuenow', this._value);
  }

  formatValue() {
    switch (this._format) {
      case 'percent':
        return `${Math.round(this._value)}%`;
      case 'frequency':
        if (this._value >= 1000) {
          return `${(this._value / 1000).toFixed(1)}k`;
        }
        return `${Math.round(this._value)} Hz`;
      case 'time':
        if (this._value >= 1000) {
          return `${(this._value / 1000).toFixed(1)}s`;
        }
        return `${Math.round(this._value)}ms`;
      case 'db':
        const sign = this._value >= 0 ? '+' : '';
        return `${sign}${this._value.toFixed(1)}dB`;
      case 'pan':
        if (this._value === 0) return 'C';
        return this._value > 0 ? `R${Math.round(this._value)}` : `L${Math.round(Math.abs(this._value))}`;
      case 'semitone':
        const semSign = this._value >= 0 ? '+' : '';
        return `${semSign}${Math.round(this._value)} st`;
      default:
        if (Number.isInteger(this._value)) {
          return String(this._value);
        }
        return this._value.toFixed(1);
    }
  }

  // MIDI control methods
  setMIDICC(cc) {
    this._midiCC = cc;
    this.setAttribute('midi-cc', cc);
  }

  handleMIDIValue(value) {
    // MIDI values are 0-127
    const normalized = value / 127;
    const newValue = this._min + normalized * (this._max - this._min);
    this.setValue(newValue);
    
    this.dispatchEvent(new CustomEvent('change', {
      detail: { value: this._value, name: this._name, midiCC: this._midiCC },
      bubbles: true
    }));
  }

  // Animation method for external control
  animateTo(targetValue, duration = 300) {
    if (this._animationFrame) {
      cancelAnimationFrame(this._animationFrame);
    }
    
    const startValue = this._value;
    const startTime = performance.now();
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      
      this._value = startValue + (targetValue - startValue) * eased;
      this.updateDisplay();
      
      if (progress < 1) {
        this._animationFrame = requestAnimationFrame(animate);
      } else {
        this.dispatchEvent(new CustomEvent('change', {
          detail: { value: this._value, name: this._name },
          bubbles: true
        }));
      }
    };
    
    this._animationFrame = requestAnimationFrame(animate);
  }
}

// Register the custom element
customElements.define('haos-knob', HAOSKnob);

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HAOSKnob;
}
