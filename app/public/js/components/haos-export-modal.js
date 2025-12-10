/**
 * HAOS Export Modal Component
 * UI for audio export with format selection, quality settings, and premium gates
 */

(function() {
  'use strict';

  /**
   * <haos-export-modal> Web Component
   * Modal dialog for exporting audio
   */
  class HAOSExportModal extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this.visible = false;
      this.preset = null;
      this.exportData = {
        format: 'wav',
        sampleRate: 48000,
        duration: 5,
        bitrate: 192,
      };
    }

    connectedCallback() {
      this.render();
      this.attachEventListeners();
    }

    show(preset) {
      this.preset = preset;
      this.visible = true;
      this.render();
      document.body.style.overflow = 'hidden';
    }

    hide() {
      this.visible = false;
      this.render();
      document.body.style.overflow = '';
    }

    attachEventListeners() {
      // Delegate events to shadow root
      this.shadowRoot.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) {
          this.hide();
        }
        if (e.target.classList.contains('close-btn')) {
          this.hide();
        }
        if (e.target.classList.contains('preview-btn')) {
          this.handlePreview();
        }
        if (e.target.classList.contains('export-btn')) {
          this.handleExport();
        }
      });

      this.shadowRoot.addEventListener('change', (e) => {
        if (e.target.name === 'format') {
          this.exportData.format = e.target.value;
          this.render();
        }
        if (e.target.name === 'sampleRate') {
          this.exportData.sampleRate = parseInt(e.target.value);
        }
        if (e.target.name === 'duration') {
          this.exportData.duration = parseInt(e.target.value);
        }
        if (e.target.name === 'bitrate') {
          this.exportData.bitrate = parseInt(e.target.value);
        }
      });
    }

    async handlePreview() {
      const btn = this.shadowRoot.querySelector('.preview-btn');
      btn.disabled = true;
      btn.textContent = '⏳ Rendering Preview...';

      try {
        // Start recording
        const recording = await window.HAOSAudioExport.startRecording({
          sampleRate: this.exportData.sampleRate,
          duration: 3, // 3 second preview
          format: this.exportData.format,
          bitrate: this.exportData.bitrate * 1000,
        });

        // Play the preset through the recording destination
        await this.playPresetToDestination(recording.context, recording.destination);

        // Show success
        btn.textContent = '✓ Preview Rendered';
        btn.style.background = '#39FF14';

        setTimeout(() => {
          btn.disabled = false;
          btn.textContent = '▶️ Preview (3s)';
          btn.style.background = '';
        }, 2000);

      } catch (error) {
        console.error('Preview failed:', error);
        btn.textContent = '❌ Preview Failed';
        btn.style.background = '#FF6B35';
        
        setTimeout(() => {
          btn.disabled = false;
          btn.textContent = '▶️ Preview (3s)';
          btn.style.background = '';
        }, 2000);
      }
    }

    async handleExport() {
      // Check premium access
      const formatConfig = window.EXPORT_FORMATS[this.exportData.format];
      const userPlan = window.HaosPremium?.getPlan()?.code || 'free';
      
      if (!this.canUseFormat(userPlan, formatConfig.minPlan)) {
        window.showUpgradePrompt({
          targetPlan: formatConfig.minPlan,
          reason: `${formatConfig.name} export requires ${formatConfig.minPlan.charAt(0).toUpperCase() + formatConfig.minPlan.slice(1)} plan`,
        });
        return;
      }

      const btn = this.shadowRoot.querySelector('.export-btn');
      btn.disabled = true;
      btn.textContent = '⏳ Rendering...';

      try {
        // Start recording
        const recording = await window.HAOSAudioExport.startRecording({
          sampleRate: this.exportData.sampleRate,
          duration: this.exportData.duration,
          format: this.exportData.format,
          bitrate: this.exportData.bitrate * 1000,
        });

        // Play the preset
        await this.playPresetToDestination(recording.context, recording.destination);

        // Wait for recording to finish
        await this.waitForRecordingComplete();

        // Download
        const filename = this.preset?.name || `haos-sound-${Date.now()}`;
        const result = await window.HAOSAudioExport.downloadRecording(
          filename,
          this.exportData.format
        );

        // Show success
        btn.textContent = `✓ Exported (${this.formatBytes(result.size)})`;
        btn.style.background = '#39FF14';

        setTimeout(() => {
          btn.disabled = false;
          btn.textContent = '💾 Export';
          btn.style.background = '';
          this.hide();
        }, 2000);

      } catch (error) {
        console.error('Export failed:', error);
        btn.textContent = '❌ Export Failed';
        btn.style.background = '#FF6B35';
        
        setTimeout(() => {
          btn.disabled = false;
          btn.textContent = '💾 Export';
          btn.style.background = '';
        }, 2000);
      }
    }

    async playPresetToDestination(audioContext, destination) {
      if (!this.preset) {
        throw new Error('No preset loaded');
      }

      const now = audioContext.currentTime;
      const duration = Math.min(this.exportData.duration, 30);
      const preset = this.preset;

      // Determine note based on category (same as preview player)
      const noteMap = {
        'Bass': 55, 'SUB': 55, 'Pluck': 110,
        'Lead': 440, 'LEAD': 440, 'Arp': 330,
        'Pad': 220, 'Strings': 220, 'Brass': 220, 'Ambient': 165,
        'Acid': 65, 'Techno': 65, 'House': 65,
        'Keys': 440, 'Piano': 440, 'Organ': 262,
        'FX': 330, 'Noise': 440, 'Texture': 220,
        'Guitar': 196, 'Woodwinds': 392,
        'Experimental': 220, 'Cinematic': 165
      };
      const note = noteMap[preset.category] || 220;

      // Check preset type
      const hasSingleOsc = preset.vco1 && !preset.vco2;
      const hasDualOsc = preset.vco1 && preset.vco2;
      const isDrumKit = preset.voices || preset.category === 'Drums' || preset.category === 'Percussion';

      console.log(`🎵 Exporting: ${preset.name} | ${preset.category} | ${note}Hz | ${duration}s`);

      // Handle drum kits differently
      if (isDrumKit) {
        await this.renderDrumKit(audioContext, destination, preset, duration);
        return;
      }

      // Create oscillator 1
      const osc1 = audioContext.createOscillator();
      const osc1Gain = audioContext.createGain();
      
      let wf1 = preset.vco1?.waveform || 'sawtooth';
      if (wf1 !== 'noise') {
        osc1.type = wf1;
        osc1.frequency.setValueAtTime(note * (preset.vco1?.octave ? Math.pow(2, preset.vco1.octave) : 1), now);
      }
      osc1Gain.gain.value = preset.vco1?.level ?? 0.6;

      // Create mixer
      const mixer = audioContext.createGain();
      mixer.gain.value = hasSingleOsc ? 1.3 : 1; // Boost single-osc presets
      
      osc1.connect(osc1Gain);
      osc1Gain.connect(mixer);

      // Create oscillator 2 if preset has it
      let osc2, osc2Gain;
      if (hasDualOsc) {
        osc2 = audioContext.createOscillator();
        osc2Gain = audioContext.createGain();
        
        let wf2 = preset.vco2?.waveform || 'square';
        if (wf2 !== 'noise') {
          osc2.type = wf2;
          const detune = preset.vco2?.detune || 5;
          const osc2Freq = note * (preset.vco2?.octave ? Math.pow(2, preset.vco2.octave) : 1);
          osc2.frequency.setValueAtTime(osc2Freq * (1 + detune/1000), now);
        }
        osc2Gain.gain.value = preset.vco2?.level ?? 0.4;
        
        osc2.connect(osc2Gain);
        osc2Gain.connect(mixer);
      }

      // Create filter
      const filter = audioContext.createBiquadFilter();
      filter.type = preset.vcf?.type || 'lowpass';
      const cutoff = Math.min(preset.vcf?.cutoff || 2000, audioContext.sampleRate / 2.5);
      const resonance = Math.min((preset.vcf?.resonance || 0.3) * 25, 25);
      filter.frequency.setValueAtTime(cutoff, now);
      filter.Q.value = resonance;

      // Filter envelope - enhanced for acid sounds
      const envAmount = preset.vcf?.envAmount ?? 0.5;
      const isAcidSound = preset.category === 'Acid' || (envAmount > 0.5 && resonance > 15);
      
      if (envAmount > 0) {
        const peakMultiplier = isAcidSound ? 8 : 4;
        const peakFreq = Math.min(cutoff * (1 + envAmount * peakMultiplier), audioContext.sampleRate / 2.5);
        const filterDecay = isAcidSound ? 0.15 : (preset.envelope?.decay || 0.3);
        
        if (isAcidSound) {
          // Repeated filter sweeps for acid - match preview
          const noteInterval = 0.25;
          const numNotes = Math.floor(duration / noteInterval);
          for (let i = 0; i < numNotes; i++) {
            const noteStart = now + i * noteInterval;
            filter.frequency.setValueAtTime(peakFreq, noteStart);
            filter.frequency.exponentialRampToValueAtTime(Math.max(cutoff, 80), noteStart + filterDecay);
          }
        } else {
          filter.frequency.setValueAtTime(peakFreq, now);
          filter.frequency.exponentialRampToValueAtTime(Math.max(cutoff, 20), now + filterDecay);
        }
      }

      // Create VCA with envelope
      const vca = audioContext.createGain();
      const env = preset.envelope || { attack: 0.01, decay: 0.2, sustain: 0.6, release: 0.3 };
      const attack = Math.max(env.attack || 0.01, 0.001);
      const decay = env.decay || 0.2;
      const rawSustain = env.sustain;
      const sustain = (rawSustain === 0 || rawSustain === undefined) ? 0.001 : Math.max(rawSustain, 0.001);
      const release = env.release || 0.3;
      
      // Handle zero-sustain (acid/pluck) sounds
      const isPercussive = rawSustain === 0 || rawSustain < 0.1;
      
      if (isPercussive && preset.category === 'Acid') {
        // Play acid sequence - repeated notes throughout duration
        const noteLength = 0.15;
        const gapLength = 0.1;
        const noteInterval = noteLength + gapLength;
        const peakGain = 0.8;
        const numNotes = Math.floor(duration / noteInterval);
        
        vca.gain.setValueAtTime(0, now);
        
        for (let i = 0; i < numNotes; i++) {
          const noteStart = now + i * noteInterval;
          // Attack
          vca.gain.linearRampToValueAtTime(peakGain, noteStart + attack);
          // Decay to near zero
          vca.gain.linearRampToValueAtTime(0.01, noteStart + attack + decay);
          // Gap
          vca.gain.setValueAtTime(0, noteStart + noteLength);
        }
        // Final release
        vca.gain.linearRampToValueAtTime(0, now + duration);
      } else {
        // Standard ADSR envelope
        vca.gain.setValueAtTime(0, now);
        vca.gain.linearRampToValueAtTime(0.7, now + attack);
        vca.gain.linearRampToValueAtTime(0.7 * sustain, now + attack + decay);
        vca.gain.setValueAtTime(0.7 * sustain, now + duration - release);
        vca.gain.linearRampToValueAtTime(0, now + duration);
      }

      // Compressor for clean export
      const compressor = audioContext.createDynamicsCompressor();
      compressor.threshold.value = -12;
      compressor.ratio.value = 4;
      compressor.attack.value = 0.003;
      compressor.release.value = 0.1;

      // Connect chain: mixer -> filter -> vca -> compressor -> destination
      mixer.connect(filter);
      filter.connect(vca);
      vca.connect(compressor);
      compressor.connect(destination);

      // Start oscillators
      osc1.start(now);
      osc1.stop(now + duration + 0.1);
      
      if (osc2) {
        osc2.start(now);
        osc2.stop(now + duration + 0.1);
      }

      // Return promise that resolves when audio finishes
      return new Promise(resolve => setTimeout(resolve, duration * 1000));
    }

    // Render drum kit pattern for export
    async renderDrumKit(audioContext, destination, preset, duration) {
      const now = audioContext.currentTime;
      const bpm = 120;
      const beatDuration = 60 / bpm;
      const numBars = Math.ceil(duration / (beatDuration * 4));
      
      const compressor = audioContext.createDynamicsCompressor();
      compressor.threshold.value = -12;
      compressor.ratio.value = 4;
      compressor.connect(destination);

      for (let bar = 0; bar < numBars; bar++) {
        const barStart = now + bar * beatDuration * 4;
        
        // Kick on 1 and 3
        this.createDrumHit(audioContext, 'kick', barStart, compressor);
        this.createDrumHit(audioContext, 'kick', barStart + beatDuration * 2, compressor);
        
        // Snare on 2 and 4
        this.createDrumHit(audioContext, 'snare', barStart + beatDuration, compressor);
        this.createDrumHit(audioContext, 'snare', barStart + beatDuration * 3, compressor);
        
        // Hi-hats on 8ths
        for (let i = 0; i < 8; i++) {
          const hatType = i % 4 === 2 ? 'openHat' : 'hihat';
          this.createDrumHit(audioContext, hatType, barStart + (beatDuration / 2) * i, compressor);
        }
      }

      return new Promise(resolve => setTimeout(resolve, duration * 1000));
    }

    // Create individual drum sounds for export
    createDrumHit(ctx, type, time, output) {
      switch(type) {
        case 'kick': {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(150, time);
          osc.frequency.exponentialRampToValueAtTime(40, time + 0.1);
          gain.gain.setValueAtTime(1, time);
          gain.gain.exponentialRampToValueAtTime(0.001, time + 0.5);
          osc.connect(gain);
          gain.connect(output);
          osc.start(time);
          osc.stop(time + 0.5);
          break;
        }
        case 'snare': {
          const osc = ctx.createOscillator();
          const oscGain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.value = 200;
          oscGain.gain.setValueAtTime(0.5, time);
          oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
          osc.connect(oscGain);
          oscGain.connect(output);
          osc.start(time);
          osc.stop(time + 0.2);
          
          // Noise component
          const bufferSize = ctx.sampleRate * 0.2;
          const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
          const noise = ctx.createBufferSource();
          noise.buffer = buffer;
          const noiseGain = ctx.createGain();
          const noiseFilter = ctx.createBiquadFilter();
          noiseFilter.type = 'highpass';
          noiseFilter.frequency.value = 1500;
          noiseGain.gain.setValueAtTime(0.6, time);
          noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);
          noise.connect(noiseFilter);
          noiseFilter.connect(noiseGain);
          noiseGain.connect(output);
          noise.start(time);
          noise.stop(time + 0.2);
          break;
        }
        case 'hihat': {
          const bufferSize = ctx.sampleRate * 0.1;
          const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
          const noise = ctx.createBufferSource();
          noise.buffer = buffer;
          const gain = ctx.createGain();
          const filter = ctx.createBiquadFilter();
          filter.type = 'highpass';
          filter.frequency.value = 7000;
          gain.gain.setValueAtTime(0.3, time);
          gain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);
          noise.connect(filter);
          filter.connect(gain);
          gain.connect(output);
          noise.start(time);
          noise.stop(time + 0.1);
          break;
        }
        case 'openHat': {
          const bufferSize = ctx.sampleRate * 0.5;
          const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
          const noise = ctx.createBufferSource();
          noise.buffer = buffer;
          const gain = ctx.createGain();
          const filter = ctx.createBiquadFilter();
          filter.type = 'highpass';
          filter.frequency.value = 6000;
          gain.gain.setValueAtTime(0.35, time);
          gain.gain.exponentialRampToValueAtTime(0.001, time + 0.4);
          noise.connect(filter);
          filter.connect(gain);
          gain.connect(output);
          noise.start(time);
          noise.stop(time + 0.5);
          break;
        }
      }
    }

    waitForRecordingComplete() {
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (!window.HAOSAudioExport.isRecording) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 100);
      });
    }

    canUseFormat(userPlan, requiredPlan) {
      const planOrder = { free: 1, basic: 2, premium: 3, pro: 4 };
      return (planOrder[userPlan] || 1) >= (planOrder[requiredPlan] || 1);
    }

    formatBytes(bytes) {
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    render() {
      if (!this.visible) {
        this.shadowRoot.innerHTML = '';
        return;
      }

      const userPlan = window.HaosPremium?.getPlan()?.code || 'free';
      const availableFormats = window.HAOSAudioExport?.getAvailableFormats(userPlan) || [];
      const availableSampleRates = window.HAOSAudioExport?.getAvailableSampleRates(userPlan) || [44100, 48000];

      this.shadowRoot.innerHTML = `
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono:wght@400;700&family=Inter:wght@300;400;600;700&display=swap');
          
          * { box-sizing: border-box; margin: 0; padding: 0; }
          
          /* HAOS.fm Brand Variables */
          :host {
            --haos-vinyl-black: #0A0A0A;
            --haos-groove-orange: #FF6B35;
            --haos-turntable-gold: #D4AF37;
            --haos-dust-gray: #6B6B6B;
            --haos-sepia-cream: #F4E8D8;
            --haos-acid-green: #39FF14;
            --haos-909-cyan: #00D9FF;
          }
          
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.9);
            backdrop-filter: blur(10px);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.3s ease;
          }
          
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          .modal {
            background: linear-gradient(145deg, #1a1a1a, #0f0f0f);
            border: 2px solid rgba(255, 107, 53, 0.3);
            border-radius: 16px;
            padding: 40px;
            max-width: 550px;
            width: 90%;
            max-height: 90vh;
            overflow-y: auto;
            animation: slideUp 0.3s ease;
            position: relative;
          }
          
          @keyframes slideUp {
            from { transform: translateY(30px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          
          .close-btn {
            position: absolute;
            top: 15px;
            right: 15px;
            background: none;
            border: none;
            color: #6B6B6B;
            font-size: 1.8rem;
            cursor: pointer;
            width: 35px;
            height: 35px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: all 0.2s;
          }
          
          .close-btn:hover {
            background: rgba(255, 255, 255, 0.1);
            color: #F4E8D8;
          }
          
          .modal-header {
            margin-bottom: 30px;
          }
          
          .modal-title {
            font-family: 'Bebas Neue', Arial, sans-serif;
            font-size: 2.5rem;
            letter-spacing: 4px;
            background: linear-gradient(135deg, #FF6B35, #FFB347);
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 10px;
            text-transform: uppercase;
          }
          
          .preset-name {
            font-family: 'Space Mono', 'Courier New', monospace;
            font-size: 0.9rem;
            color: #6B6B6B;
            letter-spacing: 0.05em;
          }
          
          .form-section {
            margin-bottom: 25px;
          }
          
          .form-label {
            font-family: 'Space Mono', monospace;
            font-size: 0.85rem;
            color: #F4E8D8;
            margin-bottom: 10px;
            display: block;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          
          .format-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
          }
          
          .format-option {
            position: relative;
          }
          
          .format-option input {
            position: absolute;
            opacity: 0;
            pointer-events: none;
          }
          
          .format-option label {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 15px;
            background: rgba(20, 20, 20, 0.6);
            border: 2px solid rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            cursor: pointer;
            transition: all 0.3s ease;
            min-height: 80px;
          }
          
          .format-option label:hover {
            border-color: rgba(255, 107, 53, 0.5);
            transform: translateY(-2px);
          }
          
          .format-option input:checked + label {
            border-color: var(--haos-groove-orange);
            background: rgba(255, 107, 53, 0.15);
            box-shadow: 0 0 15px rgba(255, 107, 53, 0.3);
          }
          
          .format-option.locked label {
            opacity: 0.5;
            cursor: not-allowed;
          }
          
          .format-option.locked label:hover {
            transform: none;
          }
          
          .format-icon {
            font-size: 1.5rem;
            margin-bottom: 5px;
          }
          
          .format-name {
            font-family: 'Space Mono', 'Courier New', monospace;
            font-size: 0.85rem;
            font-weight: 700;
            color: var(--haos-sepia-cream);
          }
          
          .format-quality {
            font-size: 0.7rem;
            color: var(--haos-dust-gray);
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          
          .lock-badge {
            position: absolute;
            top: 5px;
            right: 5px;
            background: #D4AF37;
            color: #0a0a0a;
            font-size: 0.65rem;
            padding: 2px 6px;
            border-radius: 4px;
            font-weight: 700;
          }
          
          select, input[type="range"] {
            width: 100%;
            padding: 12px;
            background: rgba(20, 20, 20, 0.6);
            border: 2px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            color: #F4E8D8;
            font-family: 'Space Mono', monospace;
            font-size: 0.9rem;
            cursor: pointer;
          }
          
          select:focus {
            outline: none;
            border-color: #FF6B35;
          }
          
          .range-container {
            position: relative;
          }
          
          input[type="range"] {
            -webkit-appearance: none;
            appearance: none;
            height: 8px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 4px;
            padding: 0;
          }
          
          input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 20px;
            height: 20px;
            background: #FF6B35;
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 0 10px rgba(255, 107, 53, 0.5);
          }
          
          input[type="range"]::-moz-range-thumb {
            width: 20px;
            height: 20px;
            background: #FF6B35;
            border-radius: 50%;
            cursor: pointer;
            border: none;
          }
          
          .range-value {
            position: absolute;
            right: 0;
            top: -25px;
            font-family: 'Space Mono', 'Courier New', monospace;
            font-size: 0.85rem;
            background: linear-gradient(135deg, #FF6B35, #FFB347);
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
            font-weight: 700;
          }
          
          .info-box {
            background: rgba(0, 217, 255, 0.1);
            border: 1px solid rgba(0, 217, 255, 0.3);
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 25px;
            font-family: 'Space Mono', 'Courier New', monospace;
            font-size: 0.8rem;
            color: #00D9FF;
            line-height: 1.5;
          }
          
          .warning-box {
            background: rgba(212, 175, 55, 0.1);
            border: 1px solid rgba(212, 175, 55, 0.3);
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 25px;
            font-family: 'Space Mono', 'Courier New', monospace;
            font-size: 0.8rem;
            color: #D4AF37;
            line-height: 1.5;
          }
          
          .button-group {
            display: flex;
            gap: 12px;
            margin-top: 30px;
          }
          
          button {
            flex: 1;
            padding: 18px 28px;
            border: none;
            border-radius: 6px;
            font-family: 'Bebas Neue', Arial, sans-serif;
            font-weight: 700;
            font-size: 1.1rem;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            text-transform: uppercase;
            letter-spacing: 0.15em;
            position: relative;
            overflow: hidden;
          }
          
          /* Shimmer effect on buttons */
          button::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            transition: left 0.5s ease;
          }
          
          button:hover::before {
            left: 100%;
          }
          
          button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
          
          button:disabled::before {
            display: none;
          }
          
          /* Preview Button - Vinyl Style */
          .preview-btn {
            background: linear-gradient(145deg, #1a1a1a, #2a2a2a);
            border: 2px solid rgba(212, 175, 55, 0.4);
            color: var(--haos-sepia-cream);
            box-shadow: 
              0 4px 15px rgba(0, 0, 0, 0.5),
              inset 0 1px 0 rgba(255, 255, 255, 0.1),
              inset 0 -1px 0 rgba(0, 0, 0, 0.3);
          }
          
          .preview-btn::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            background: radial-gradient(circle, rgba(0, 217, 255, 0.3) 0%, transparent 70%);
            transform: translate(-50%, -50%);
            transition: all 0.4s ease;
            border-radius: 50%;
          }
          
          .preview-btn:hover:not(:disabled) {
            border-color: var(--haos-909-cyan);
            color: var(--haos-909-cyan);
            box-shadow: 
              0 6px 25px rgba(0, 217, 255, 0.4),
              inset 0 1px 0 rgba(255, 255, 255, 0.15),
              0 0 30px rgba(0, 217, 255, 0.2);
            transform: translateY(-3px);
          }
          
          .preview-btn:hover:not(:disabled)::after {
            width: 200px;
            height: 200px;
          }
          
          .preview-btn:active:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 
              0 3px 15px rgba(0, 217, 255, 0.3),
              inset 0 1px 0 rgba(255, 255, 255, 0.1);
          }
          
          /* Export Button - Fire/Orange Theme */
          .export-btn {
            background: linear-gradient(135deg, #FF6B35 0%, #FF8C42 50%, #FFB347 100%);
            color: #0a0a0a;
            font-size: 1.2rem;
            letter-spacing: 3px;
            border: 2px solid #D4AF37;
            box-shadow: 
              0 6px 20px rgba(255, 107, 53, 0.5),
              0 0 40px rgba(255, 107, 53, 0.3),
              inset 0 1px 0 rgba(255, 255, 255, 0.3),
              inset 0 -2px 0 rgba(0, 0, 0, 0.2);
            text-shadow: 0 1px 0 rgba(255, 255, 255, 0.3);
          }
          
          .export-btn::after {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: linear-gradient(
              45deg,
              transparent 30%,
              rgba(255, 255, 255, 0.1) 50%,
              transparent 70%
            );
            transform: rotate(45deg);
            transition: all 0.6s ease;
          }
          
          .export-btn:hover:not(:disabled) {
            transform: translateY(-4px) scale(1.02);
            background: linear-gradient(135deg, #FF8C42 0%, #FFB347 50%, #FF6B35 100%);
            box-shadow: 
              0 10px 35px rgba(255, 107, 53, 0.6),
              0 0 60px rgba(255, 107, 53, 0.4),
              inset 0 1px 0 rgba(255, 255, 255, 0.4),
              0 0 80px rgba(212, 175, 55, 0.3);
            border-color: #FFD700;
          }
          
          .export-btn:hover:not(:disabled)::after {
            left: 100%;
          }
          
          .export-btn:active:not(:disabled) {
            transform: translateY(-1px) scale(1);
            box-shadow: 
              0 4px 15px rgba(255, 107, 53, 0.5),
              0 0 30px rgba(255, 107, 53, 0.3),
              inset 0 2px 4px rgba(0, 0, 0, 0.2);
          }
          
          /* Pulsing animation for export button */
          @keyframes pulse-glow {
            0%, 100% { box-shadow: 0 6px 20px rgba(255, 107, 53, 0.5), 0 0 40px rgba(255, 107, 53, 0.3); }
            50% { box-shadow: 0 6px 25px rgba(255, 107, 53, 0.7), 0 0 50px rgba(255, 107, 53, 0.4); }
          }
          
          .export-btn {
            animation: pulse-glow 2s ease-in-out infinite;
          }
          
          .export-btn:hover:not(:disabled) {
            animation: none;
          }
          
          .stats {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
            margin-top: 20px;
          }
          
          .stat {
            text-align: center;
            padding: 12px;
            background: linear-gradient(145deg, rgba(0, 0, 0, 0.4), rgba(20, 20, 20, 0.6));
            border-radius: 10px;
            border: 1px solid rgba(212, 175, 55, 0.25);
            transition: all 0.3s ease;
          }
          
          .stat:hover {
            border-color: rgba(255, 107, 53, 0.5);
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(255, 107, 53, 0.2);
          }
          
          .stat-value {
            font-family: 'Bebas Neue', Arial, sans-serif;
            font-size: 1.6rem;
            background: linear-gradient(135deg, #FF6B35, #FFB347);
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          
          .stat-label {
            font-family: 'Space Mono', 'Courier New', monospace;
            font-size: 0.7rem;
            color: #6B6B6B;
            text-transform: uppercase;
            letter-spacing: 0.1em;
          }
        </style>
        
        <div class="modal-overlay">
          <div class="modal">
            <button class="close-btn">×</button>
            
            <div class="modal-header">
              <h2 class="modal-title">Export Audio</h2>
              <div class="preset-name">${this.preset?.name || 'Untitled'}</div>
            </div>
            
            <div class="info-box">
              💡 Export your sound as an audio file. Format and quality depend on your plan.
            </div>
            
            <!-- Format Selection -->
            <div class="form-section">
              <label class="form-label">Format</label>
              <div class="format-grid">
                ${availableFormats.map(format => `
                  <div class="format-option ${this.canUseFormat(userPlan, format.minPlan) ? '' : 'locked'}">
                    <input 
                      type="radio" 
                      name="format" 
                      value="${format.key}" 
                      id="format-${format.key}"
                      ${this.exportData.format === format.key ? 'checked' : ''}
                      ${this.canUseFormat(userPlan, format.minPlan) ? '' : 'disabled'}
                    >
                    <label for="format-${format.key}">
                      ${!this.canUseFormat(userPlan, format.minPlan) ? '<span class="lock-badge">🔒</span>' : ''}
                      <div class="format-icon">${format.icon}</div>
                      <div class="format-name">${format.name}</div>
                      <div class="format-quality">${format.quality}</div>
                    </label>
                  </div>
                `).join('')}
              </div>
            </div>
            
            <!-- Sample Rate -->
            <div class="form-section">
              <label class="form-label">Sample Rate</label>
              <select name="sampleRate">
                ${availableSampleRates.map(rate => `
                  <option value="${rate}" ${this.exportData.sampleRate === rate ? 'selected' : ''}>
                    ${rate / 1000}kHz ${rate >= 96000 ? '(Premium)' : ''}
                  </option>
                `).join('')}
              </select>
            </div>
            
            <!-- Duration -->
            <div class="form-section">
              <label class="form-label">Duration</label>
              <div class="range-container">
                <span class="range-value">${this.exportData.duration}s</span>
                <input 
                  type="range" 
                  name="duration" 
                  min="3" 
                  max="30" 
                  value="${this.exportData.duration}"
                  step="1"
                >
              </div>
            </div>
            
            ${this.exportData.format === 'mp3' ? `
              <div class="form-section">
                <label class="form-label">MP3 Bitrate</label>
                <select name="bitrate">
                  <option value="128" ${this.exportData.bitrate === 128 ? 'selected' : ''}>128 kbps</option>
                  <option value="192" ${this.exportData.bitrate === 192 ? 'selected' : ''}>192 kbps</option>
                  <option value="256" ${this.exportData.bitrate === 256 ? 'selected' : ''}>256 kbps</option>
                  <option value="320" ${this.exportData.bitrate === 320 ? 'selected' : ''}>320 kbps</option>
                </select>
              </div>
            ` : ''}
            
            <!-- Stats -->
            <div class="stats">
              <div class="stat">
                <div class="stat-value">${this.exportData.sampleRate / 1000}kHz</div>
                <div class="stat-label">Sample Rate</div>
              </div>
              <div class="stat">
                <div class="stat-value">${this.exportData.duration}s</div>
                <div class="stat-label">Duration</div>
              </div>
              <div class="stat">
                <div class="stat-value">${this.estimateFileSize()}</div>
                <div class="stat-label">Est. Size</div>
              </div>
            </div>
            
            ${userPlan === 'free' ? `
              <div class="warning-box">
                ⚠️ Free plan: WAV only, 44.1kHz max. Upgrade for MP3, FLAC, and higher quality.
              </div>
            ` : ''}
            
            <!-- Actions -->
            <div class="button-group">
              <button class="preview-btn">▶️ Preview (3s)</button>
              <button class="export-btn">💾 Export</button>
            </div>
          </div>
        </div>
      `;

      // Re-attach listeners after render
      setTimeout(() => this.attachEventListeners(), 0);
    }

    estimateFileSize() {
      const format = this.exportData.format;
      const duration = this.exportData.duration;
      const sampleRate = this.exportData.sampleRate;
      
      if (format === 'wav' || format === 'aiff') {
        // Uncompressed: sample_rate * channels * bit_depth * duration / 8
        const bytes = sampleRate * 2 * 2 * duration;
        return this.formatBytes(bytes);
      } else if (format === 'mp3') {
        // Compressed: bitrate * duration / 8
        const bytes = (this.exportData.bitrate * 1000 * duration) / 8;
        return this.formatBytes(bytes);
      } else if (format === 'flac') {
        // FLAC: ~50-60% of WAV
        const wavBytes = sampleRate * 2 * 2 * duration;
        return this.formatBytes(wavBytes * 0.55);
      }
      
      return '~1 MB';
    }

    formatBytes(bytes) {
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }
  }

  // Register component
  customElements.define('haos-export-modal', HAOSExportModal);

  console.log('✅ HAOS Export Modal Component loaded');

})();
