// ============================================================================
// HAOS.fm Platform - Universal ADSR Envelope System
// Shared ADSR module for all synthesizer pages
// ============================================================================

/**
 * ADSR Envelope Class
 * Manages Attack, Decay, Sustain, Release parameters for audio synthesis
 */
class ADSREnvelope {
  constructor(options = {}) {
    // Default ADSR values (in seconds, except sustain which is 0-1)
    this.attack = options.attack || 0.01;
    this.decay = options.decay || 0.2;
    this.sustain = options.sustain || 0.7;
    this.release = options.release || 0.3;
    
    // Curve types
    this.attackCurve = options.attackCurve || 'linear';
    this.decayCurve = options.decayCurve || 'exponential';
    this.releaseCurve = options.releaseCurve || 'exponential';
    
    // Minimum value for exponential ramps (must be > 0)
    this.minValue = 0.001;
  }
  
  /**
   * Apply ADSR envelope to an AudioParam (typically gain)
   * @param {AudioParam} param - The audio parameter to modulate (e.g., gain.gain)
   * @param {number} startTime - When to start the envelope (audioContext.currentTime)
   * @param {number} duration - How long the note is held (sustain duration)
   * @param {number} peakValue - Maximum value for the envelope (default 1.0)
   */
  applyToGain(param, startTime, duration, peakValue = 1.0) {
    const sustainValue = peakValue * this.sustain;
    
    // Cancel any scheduled values
    param.cancelScheduledValues(startTime);
    
    // Start at zero
    param.setValueAtTime(this.minValue, startTime);
    
    // Attack phase
    if (this.attackCurve === 'exponential') {
      param.exponentialRampToValueAtTime(peakValue, startTime + this.attack);
    } else {
      param.linearRampToValueAtTime(peakValue, startTime + this.attack);
    }
    
    // Decay phase
    const decayEnd = startTime + this.attack + this.decay;
    if (this.decayCurve === 'exponential' && sustainValue > this.minValue) {
      param.exponentialRampToValueAtTime(Math.max(sustainValue, this.minValue), decayEnd);
    } else {
      param.linearRampToValueAtTime(sustainValue, decayEnd);
    }
    
    // Sustain phase (hold at sustain level)
    const releaseStart = startTime + this.attack + this.decay + duration;
    param.setValueAtTime(sustainValue, releaseStart);
    
    // Release phase
    const releaseEnd = releaseStart + this.release;
    if (this.releaseCurve === 'exponential') {
      param.exponentialRampToValueAtTime(this.minValue, releaseEnd);
    } else {
      param.linearRampToValueAtTime(0, releaseEnd);
    }
    
    return releaseEnd;
  }
  
  /**
   * Apply ADSR envelope to filter frequency
   * @param {BiquadFilterNode} filter - The filter to modulate
   * @param {number} startTime - When to start the envelope
   * @param {number} duration - How long the note is held
   * @param {number} baseFreq - Base frequency value
   * @param {number} peakFreq - Peak frequency value
   */
  applyToFilter(filter, startTime, duration, baseFreq, peakFreq) {
    const sustainFreq = baseFreq + (peakFreq - baseFreq) * this.sustain;
    
    filter.frequency.cancelScheduledValues(startTime);
    filter.frequency.setValueAtTime(baseFreq, startTime);
    
    // Attack
    filter.frequency.exponentialRampToValueAtTime(peakFreq, startTime + this.attack);
    
    // Decay
    filter.frequency.exponentialRampToValueAtTime(
      Math.max(sustainFreq, 20), 
      startTime + this.attack + this.decay
    );
    
    // Sustain (hold)
    const releaseStart = startTime + this.attack + this.decay + duration;
    filter.frequency.setValueAtTime(sustainFreq, releaseStart);
    
    // Release
    filter.frequency.exponentialRampToValueAtTime(
      Math.max(baseFreq, 20),
      releaseStart + this.release
    );
  }
  
  /**
   * Get total envelope duration
   */
  getTotalDuration(noteDuration = 0) {
    return this.attack + this.decay + noteDuration + this.release;
  }
  
  /**
   * Update ADSR parameters
   */
  setAttack(value) { this.attack = Math.max(0.001, value); }
  setDecay(value) { this.decay = Math.max(0.001, value); }
  setSustain(value) { this.sustain = Math.max(0, Math.min(1, value)); }
  setRelease(value) { this.release = Math.max(0.001, value); }
  
  /**
   * Get ADSR parameters as object
   */
  getParams() {
    return {
      attack: this.attack,
      decay: this.decay,
      sustain: this.sustain,
      release: this.release
    };
  }
  
  /**
   * Set all ADSR parameters at once
   */
  setParams(params) {
    if (params.attack !== undefined) this.setAttack(params.attack);
    if (params.decay !== undefined) this.setDecay(params.decay);
    if (params.sustain !== undefined) this.setSustain(params.sustain);
    if (params.release !== undefined) this.setRelease(params.release);
  }
  
  /**
   * Clone this envelope
   */
  clone() {
    return new ADSREnvelope({
      attack: this.attack,
      decay: this.decay,
      sustain: this.sustain,
      release: this.release,
      attackCurve: this.attackCurve,
      decayCurve: this.decayCurve,
      releaseCurve: this.releaseCurve
    });
  }
}

/**
 * ADSR UI Controller
 * Manages UI controls for ADSR envelope
 */
class ADSRController {
  constructor(envelope, containerId) {
    this.envelope = envelope;
    this.container = document.getElementById(containerId);
    this.canvas = null;
    this.callbacks = [];
    
    if (!this.container) {
      console.warn(`ADSR Controller: Container '${containerId}' not found`);
    }
  }
  
  /**
   * Create ADSR controls UI
   */
  createUI(options = {}) {
    if (!this.container) return;
    
    const style = options.style || 'default';
    const showCanvas = options.showCanvas !== false;
    
    const html = `
      <div class="adsr-envelope-controls" style="padding: 15px; background: rgba(0,0,0,0.3); border-radius: 8px;">
        <h3 style="color: #64FFDA; margin-bottom: 15px; font-family: 'Space Mono', monospace;">
          📈 ADSR Envelope
        </h3>
        
        ${showCanvas ? `
        <canvas id="adsr-canvas-${this.container.id}" 
                width="300" 
                height="150" 
                style="width: 100%; max-width: 300px; border-radius: 4px; margin-bottom: 15px; background: rgba(0,0,0,0.5);">
        </canvas>
        ` : ''}
        
        <div class="adsr-sliders">
          <!-- Attack -->
          <div class="adsr-control" style="margin-bottom: 12px;">
            <label style="color: #64FFDA; font-size: 0.9em; display: flex; justify-content: space-between; margin-bottom: 5px;">
              <span>Attack</span>
              <span id="adsr-attack-value">${(this.envelope.attack * 1000).toFixed(0)}ms</span>
            </label>
            <input type="range" 
                   id="adsr-attack-slider"
                   min="1" 
                   max="2000" 
                   value="${this.envelope.attack * 1000}"
                   style="width: 100%;">
          </div>
          
          <!-- Decay -->
          <div class="adsr-control" style="margin-bottom: 12px;">
            <label style="color: #64FFDA; font-size: 0.9em; display: flex; justify-content: space-between; margin-bottom: 5px;">
              <span>Decay</span>
              <span id="adsr-decay-value">${(this.envelope.decay * 1000).toFixed(0)}ms</span>
            </label>
            <input type="range" 
                   id="adsr-decay-slider"
                   min="1" 
                   max="2000" 
                   value="${this.envelope.decay * 1000}"
                   style="width: 100%;">
          </div>
          
          <!-- Sustain -->
          <div class="adsr-control" style="margin-bottom: 12px;">
            <label style="color: #64FFDA; font-size: 0.9em; display: flex; justify-content: space-between; margin-bottom: 5px;">
              <span>Sustain</span>
              <span id="adsr-sustain-value">${(this.envelope.sustain * 100).toFixed(0)}%</span>
            </label>
            <input type="range" 
                   id="adsr-sustain-slider"
                   min="0" 
                   max="100" 
                   value="${this.envelope.sustain * 100}"
                   style="width: 100%;">
          </div>
          
          <!-- Release -->
          <div class="adsr-control" style="margin-bottom: 12px;">
            <label style="color: #64FFDA; font-size: 0.9em; display: flex; justify-content: space-between; margin-bottom: 5px;">
              <span>Release</span>
              <span id="adsr-release-value">${(this.envelope.release * 1000).toFixed(0)}ms</span>
            </label>
            <input type="range" 
                   id="adsr-release-slider"
                   min="1" 
                   max="3000" 
                   value="${this.envelope.release * 1000}"
                   style="width: 100%;">
          </div>
        </div>
      </div>
    `;
    
    this.container.innerHTML = html;
    
    if (showCanvas) {
      this.canvas = document.getElementById(`adsr-canvas-${this.container.id}`);
      this.drawEnvelope();
    }
    
    this.attachEventListeners();
  }
  
  /**
   * Attach event listeners to sliders
   */
  attachEventListeners() {
    const attackSlider = document.getElementById('adsr-attack-slider');
    const decaySlider = document.getElementById('adsr-decay-slider');
    const sustainSlider = document.getElementById('adsr-sustain-slider');
    const releaseSlider = document.getElementById('adsr-release-slider');
    
    if (attackSlider) {
      attackSlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value) / 1000;
        this.envelope.setAttack(value);
        document.getElementById('adsr-attack-value').textContent = e.target.value + 'ms';
        this.drawEnvelope();
        this.notifyChange();
      });
    }
    
    if (decaySlider) {
      decaySlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value) / 1000;
        this.envelope.setDecay(value);
        document.getElementById('adsr-decay-value').textContent = e.target.value + 'ms';
        this.drawEnvelope();
        this.notifyChange();
      });
    }
    
    if (sustainSlider) {
      sustainSlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value) / 100;
        this.envelope.setSustain(value);
        document.getElementById('adsr-sustain-value').textContent = e.target.value + '%';
        this.drawEnvelope();
        this.notifyChange();
      });
    }
    
    if (releaseSlider) {
      releaseSlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value) / 1000;
        this.envelope.setRelease(value);
        document.getElementById('adsr-release-value').textContent = e.target.value + 'ms';
        this.drawEnvelope();
        this.notifyChange();
      });
    }
  }
  
  /**
   * Draw ADSR envelope visualization
   */
  drawEnvelope() {
    if (!this.canvas) return;
    
    const ctx = this.canvas.getContext('2d');
    const width = this.canvas.width;
    const height = this.canvas.height;
    
    ctx.clearRect(0, 0, width, height);
    
    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, width, height);
    
    // Grid
    ctx.strokeStyle = 'rgba(100, 255, 218, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = (height / 4) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    // Calculate time points (in milliseconds for display)
    const attackMs = this.envelope.attack * 1000;
    const decayMs = this.envelope.decay * 1000;
    const sustainMs = 200; // Fixed display duration
    const releaseMs = this.envelope.release * 1000;
    const totalMs = attackMs + decayMs + sustainMs + releaseMs;
    
    const attackX = (attackMs / totalMs) * width;
    const decayX = attackX + (decayMs / totalMs) * width;
    const sustainX = decayX + (sustainMs / totalMs) * width;
    const releaseX = width;
    
    const peakY = height * 0.1;
    const sustainY = height - (this.envelope.sustain * height * 0.8);
    const baseY = height - 5;
    
    // Draw envelope curve
    ctx.strokeStyle = '#64FFDA';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    // Attack phase
    ctx.moveTo(0, baseY);
    ctx.lineTo(attackX, peakY);
    
    // Decay phase
    ctx.lineTo(decayX, sustainY);
    
    // Sustain phase
    ctx.lineTo(sustainX, sustainY);
    
    // Release phase
    ctx.lineTo(releaseX, baseY);
    
    ctx.stroke();
    
    // Draw phase markers
    ctx.fillStyle = '#64FFDA';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    
    ctx.fillText('A', attackX / 2, baseY - 5);
    ctx.fillText('D', (attackX + decayX) / 2, baseY - 5);
    ctx.fillText('S', (decayX + sustainX) / 2, baseY - 5);
    ctx.fillText('R', (sustainX + releaseX) / 2, baseY - 5);
    
    // Draw time labels
    ctx.font = '10px monospace';
    ctx.fillStyle = 'rgba(100, 255, 218, 0.7)';
    ctx.fillText(`${attackMs.toFixed(0)}ms`, attackX / 2, height - 20);
    ctx.fillText(`${decayMs.toFixed(0)}ms`, (attackX + decayX) / 2, height - 20);
    ctx.fillText(`${(this.envelope.sustain * 100).toFixed(0)}%`, (decayX + sustainX) / 2, sustainY - 10);
    ctx.fillText(`${releaseMs.toFixed(0)}ms`, (sustainX + releaseX) / 2, height - 20);
  }
  
  /**
   * Register a callback for when ADSR values change
   */
  onChange(callback) {
    this.callbacks.push(callback);
  }
  
  /**
   * Notify all registered callbacks
   */
  notifyChange() {
    const params = this.envelope.getParams();
    this.callbacks.forEach(cb => cb(params));
  }
  
  /**
   * Update UI with new envelope values
   */
  updateUI(params) {
    this.envelope.setParams(params);
    
    const attackSlider = document.getElementById('adsr-attack-slider');
    const decaySlider = document.getElementById('adsr-decay-slider');
    const sustainSlider = document.getElementById('adsr-sustain-slider');
    const releaseSlider = document.getElementById('adsr-release-slider');
    
    if (attackSlider) {
      attackSlider.value = this.envelope.attack * 1000;
      document.getElementById('adsr-attack-value').textContent = (this.envelope.attack * 1000).toFixed(0) + 'ms';
    }
    
    if (decaySlider) {
      decaySlider.value = this.envelope.decay * 1000;
      document.getElementById('adsr-decay-value').textContent = (this.envelope.decay * 1000).toFixed(0) + 'ms';
    }
    
    if (sustainSlider) {
      sustainSlider.value = this.envelope.sustain * 100;
      document.getElementById('adsr-sustain-value').textContent = (this.envelope.sustain * 100).toFixed(0) + '%';
    }
    
    if (releaseSlider) {
      releaseSlider.value = this.envelope.release * 1000;
      document.getElementById('adsr-release-value').textContent = (this.envelope.release * 1000).toFixed(0) + 'ms';
    }
    
    this.drawEnvelope();
  }
}

// Export for use in modules or global scope
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ADSREnvelope, ADSRController };
}
