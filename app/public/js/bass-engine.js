// BASS STUDIO - Audio Engine
// Professional Bass Synthesizer with WAV/MIDI Export

// ===== WEB AUDIO API SETUP =====
let audioContext;
let masterGain;
let filterNode;
let distortionNode;
let compressorNode;
let analyserNode;
let currentOscillators = [];
let isRecording = false;
let recordedChunks = [];
let mediaRecorder;

// ===== SYNTH PARAMETERS =====
let synthParams = {
    osc1Level: 0.8,
    osc2Level: 0.6,
    detune: 5,
    cutoff: 1000,
    resonance: 5,
    envAmount: 0.5,
    attack: 0.01,
    decay: 0.3,
    sustain: 0.7,
    release: 0.5,
    distortion: 20,
    chorus: 30,
    compression: 50
};

// ===== BASS PRESETS =====
const bassPresets = {
    sub: {
        name: 'Sub Bass',
        osc1Level: 1.0,
        osc2Level: 0.0,
        detune: 0,
        cutoff: 200,
        resonance: 2,
        envAmount: 0.3,
        attack: 0.01,
        decay: 0.1,
        sustain: 0.9,
        release: 0.3,
        distortion: 0,
        chorus: 0,
        compression: 70
    },
    reese: {
        name: 'Reese Bass',
        osc1Level: 0.8,
        osc2Level: 0.8,
        detune: 15,
        cutoff: 800,
        resonance: 8,
        envAmount: 0.6,
        attack: 0.02,
        decay: 0.4,
        sustain: 0.7,
        release: 0.6,
        distortion: 30,
        chorus: 40,
        compression: 60
    },
    acid: {
        name: 'Acid Bass',
        osc1Level: 0.9,
        osc2Level: 0.5,
        detune: 7,
        cutoff: 1500,
        resonance: 15,
        envAmount: 0.8,
        attack: 0.01,
        decay: 0.2,
        sustain: 0.4,
        release: 0.2,
        distortion: 40,
        chorus: 20,
        compression: 50
    },
    funk: {
        name: 'Funk Bass',
        osc1Level: 0.7,
        osc2Level: 0.4,
        detune: 3,
        cutoff: 600,
        resonance: 6,
        envAmount: 0.5,
        attack: 0.005,
        decay: 0.15,
        sustain: 0.5,
        release: 0.1,
        distortion: 15,
        chorus: 25,
        compression: 55
    },
    growl: {
        name: 'Growl Bass',
        osc1Level: 0.9,
        osc2Level: 0.7,
        detune: 20,
        cutoff: 1200,
        resonance: 18,
        envAmount: 0.9,
        attack: 0.02,
        decay: 0.5,
        sustain: 0.6,
        release: 0.4,
        distortion: 60,
        chorus: 35,
        compression: 65
    },
    '808': {
        name: '808 Bass',
        osc1Level: 1.0,
        osc2Level: 0.3,
        detune: 0,
        cutoff: 300,
        resonance: 3,
        envAmount: 0.4,
        attack: 0.001,
        decay: 0.8,
        sustain: 0.2,
        release: 0.5,
        distortion: 5,
        chorus: 0,
        compression: 75
    },
    wobble: {
        name: 'Wobble Bass',
        osc1Level: 0.8,
        osc2Level: 0.6,
        detune: 10,
        cutoff: 500,
        resonance: 12,
        envAmount: 0.7,
        attack: 0.01,
        decay: 0.3,
        sustain: 0.8,
        release: 0.3,
        distortion: 35,
        chorus: 30,
        compression: 60
    },
    dnb: {
        name: 'DnB Bass',
        osc1Level: 0.9,
        osc2Level: 0.8,
        detune: 12,
        cutoff: 2000,
        resonance: 14,
        envAmount: 0.85,
        attack: 0.005,
        decay: 0.2,
        sustain: 0.6,
        release: 0.25,
        distortion: 45,
        chorus: 25,
        compression: 70
    }
};

// ===== AUDIO INITIALIZATION =====
function initAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Master gain
        masterGain = audioContext.createGain();
        masterGain.gain.value = 0.5;
        
        // Filter (lowpass)
        filterNode = audioContext.createBiquadFilter();
        filterNode.type = 'lowpass';
        filterNode.frequency.value = synthParams.cutoff;
        filterNode.Q.value = synthParams.resonance;
        
        // Distortion
        distortionNode = audioContext.createWaveShaper();
        updateDistortion();
        
        // Compressor
        compressorNode = audioContext.createDynamicsCompressor();
        compressorNode.threshold.value = -20;
        compressorNode.knee.value = 10;
        compressorNode.ratio.value = 12;
        compressorNode.attack.value = 0.003;
        compressorNode.release.value = 0.25;
        
        // Analyser for visualization
        analyserNode = audioContext.createAnalyser();
        analyserNode.fftSize = 2048;
        
        // Connect chain
        masterGain.connect(filterNode);
        filterNode.connect(distortionNode);
        distortionNode.connect(compressorNode);
        compressorNode.connect(analyserNode);
        analyserNode.connect(audioContext.destination);
        
        console.log('🎸 Bass Studio audio engine initialized');
        
        // Start visualization
        visualize();
    }
}

// ===== DISTORTION CURVE =====
function makeDistortionCurve(amount) {
    const k = typeof amount === 'number' ? amount : 50;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    
    for (let i = 0; i < n_samples; i++) {
        const x = (i * 2) / n_samples - 1;
        curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
}

function updateDistortion() {
    if (distortionNode) {
        distortionNode.curve = makeDistortionCurve(synthParams.distortion);
    }
}

// ===== BASS NOTE SYNTHESIS =====
function playBassNote(frequency, duration = 2) {
    initAudio();
    
    const now = audioContext.currentTime;
    const oscillators = [];
    const gains = [];
    
    // Oscillator 1 - Main
    const osc1 = audioContext.createOscillator();
    const gain1 = audioContext.createGain();
    osc1.type = 'sawtooth';
    osc1.frequency.value = frequency;
    
    // Oscillator 2 - Detuned
    const osc2 = audioContext.createOscillator();
    const gain2 = audioContext.createGain();
    osc2.type = 'square';
    osc2.frequency.value = frequency;
    osc2.detune.value = synthParams.detune;
    
    // Sub oscillator (one octave down)
    const subOsc = audioContext.createOscillator();
    const subGain = audioContext.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.value = frequency / 2;
    
    // ADSR Envelope
    const attack = synthParams.attack;
    const decay = synthParams.decay;
    const sustain = synthParams.sustain;
    const release = synthParams.release;
    
    // Apply envelope to gains
    [gain1, gain2, subGain].forEach((gain, index) => {
        let maxGain;
        if (index === 0) maxGain = synthParams.osc1Level;
        else if (index === 1) maxGain = synthParams.osc2Level;
        else maxGain = 0.3; // Sub osc level
        
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(maxGain, now + attack);
        gain.gain.linearRampToValueAtTime(maxGain * sustain, now + attack + decay);
        gain.gain.setValueAtTime(maxGain * sustain, now + duration - release);
        gain.gain.linearRampToValueAtTime(0, now + duration);
    });
    
    // Filter envelope
    const filterEnv = synthParams.envAmount * synthParams.cutoff * 3;
    filterNode.frequency.setValueAtTime(synthParams.cutoff, now);
    filterNode.frequency.linearRampToValueAtTime(synthParams.cutoff + filterEnv, now + attack);
    filterNode.frequency.linearRampToValueAtTime(synthParams.cutoff, now + attack + decay);
    
    // Connect
    osc1.connect(gain1);
    gain1.connect(masterGain);
    
    osc2.connect(gain2);
    gain2.connect(masterGain);
    
    subOsc.connect(subGain);
    subGain.connect(masterGain);
    
    // Start & Stop
    [osc1, osc2, subOsc].forEach(osc => {
        osc.start(now);
        osc.stop(now + duration);
    });
    
    oscillators.push(osc1, osc2, subOsc);
    gains.push(gain1, gain2, subGain);
    currentOscillators.push(...oscillators);
    
    // Cleanup
    setTimeout(() => {
        oscillators.forEach(osc => {
            try { osc.disconnect(); } catch(e) {}
        });
        gains.forEach(g => {
            try { g.disconnect(); } catch(e) {}
        });
    }, duration * 1000 + 100);
}

// ===== STOP ALL NOTES =====
function stopAllNotes() {
    currentOscillators.forEach(osc => {
        try {
            osc.stop();
            osc.disconnect();
        } catch(e) {}
    });
    currentOscillators = [];
}

// ===== VISUALIZATION =====
function visualize() {
    if (!analyserNode) return;
    
    const canvas = document.getElementById('waveformCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    const bufferLength = analyserNode.fftSize;
    const dataArray = new Uint8Array(bufferLength);
    
    function draw() {
        requestAnimationFrame(draw);
        
        analyserNode.getByteTimeDomainData(dataArray);
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#39FF14';
        ctx.beginPath();
        
        const sliceWidth = canvas.width / bufferLength;
        let x = 0;
        
        for (let i = 0; i < bufferLength; i++) {
            const v = dataArray[i] / 128.0;
            const y = v * canvas.height / 2;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
            
            x += sliceWidth;
        }
        
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();
    }
    
    draw();
}

// ===== PRESET LOADING =====
function loadPreset(presetName) {
    const preset = bassPresets[presetName];
    if (!preset) return;
    
    console.log('Loading preset:', preset.name);
    
    // Update synthParams
    Object.assign(synthParams, preset);
    
    // Update audio nodes
    if (filterNode) {
        filterNode.frequency.value = synthParams.cutoff;
        filterNode.Q.value = synthParams.resonance;
    }
    updateDistortion();
    
    // Update UI knobs
    updateAllKnobs();
    
    // Play test note
    playBassNote(55, 1.5); // A1
}

// ===== UI UPDATES =====
function updateAllKnobs() {
    Object.keys(synthParams).forEach(param => {
        const knob = document.querySelector(`[data-param="${param}"]`);
        if (!knob) return;
        
        const value = synthParams[param];
        knob.dataset.value = value;
        
        // Update value display
        const valueDisplay = knob.nextElementSibling;
        if (valueDisplay && valueDisplay.classList.contains('knob-value')) {
            if (param.includes('attack') || param.includes('decay') || param.includes('release')) {
                valueDisplay.textContent = value.toFixed(2) + 's';
            } else if (param === 'sustain' || param.includes('Level')) {
                valueDisplay.textContent = value.toFixed(2);
            } else {
                valueDisplay.textContent = Math.round(value);
            }
        }
        
        // Rotate indicator
        const indicator = knob.querySelector('.knob-indicator');
        if (indicator) {
            let range, minAngle, maxAngle;
            if (param === 'sustain' || param.includes('Level')) {
                range = 1;
            } else if (param === 'cutoff') {
                range = 5000;
            } else if (param === 'resonance') {
                range = 20;
            } else if (param === 'detune') {
                range = 50;
            } else if (param.includes('distortion') || param.includes('chorus') || param.includes('compression')) {
                range = 100;
            } else {
                range = 2;
            }
            
            const rotation = -135 + ((value / range) * 270);
            indicator.style.transform = `rotate(${rotation}deg)`;
        }
    });
}

// ===== WAV EXPORT =====
function exportWAV() {
    // Record 4 seconds of bass note
    const duration = 4;
    const sampleRate = audioContext.sampleRate;
    const offlineCtx = new OfflineAudioContext(2, sampleRate * duration, sampleRate);
    
    // Recreate the synth in offline context
    const offlineMaster = offlineCtx.createGain();
    offlineMaster.gain.value = 0.5;
    
    const offlineFilter = offlineCtx.createBiquadFilter();
    offlineFilter.type = 'lowpass';
    offlineFilter.frequency.value = synthParams.cutoff;
    offlineFilter.Q.value = synthParams.resonance;
    
    offlineMaster.connect(offlineFilter);
    offlineFilter.connect(offlineCtx.destination);
    
    // Create bass note
    const freq = 55; // A1
    const now = 0;
    
    const osc1 = offlineCtx.createOscillator();
    const gain1 = offlineCtx.createGain();
    osc1.type = 'sawtooth';
    osc1.frequency.value = freq;
    
    const osc2 = offlineCtx.createOscillator();
    const gain2 = offlineCtx.createGain();
    osc2.type = 'square';
    osc2.frequency.value = freq;
    osc2.detune.value = synthParams.detune;
    
    const subOsc = offlineCtx.createOscillator();
    const subGain = offlineCtx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.value = freq / 2;
    
    // ADSR
    [gain1, gain2, subGain].forEach((gain, index) => {
        let maxGain;
        if (index === 0) maxGain = synthParams.osc1Level;
        else if (index === 1) maxGain = synthParams.osc2Level;
        else maxGain = 0.3;
        
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(maxGain, now + synthParams.attack);
        gain.gain.linearRampToValueAtTime(maxGain * synthParams.sustain, now + synthParams.attack + synthParams.decay);
        gain.gain.setValueAtTime(maxGain * synthParams.sustain, now + duration - synthParams.release);
        gain.gain.linearRampToValueAtTime(0, now + duration);
    });
    
    osc1.connect(gain1);
    gain1.connect(offlineMaster);
    osc2.connect(gain2);
    gain2.connect(offlineMaster);
    subOsc.connect(subGain);
    subGain.connect(offlineMaster);
    
    osc1.start(now);
    osc2.start(now);
    subOsc.start(now);
    osc1.stop(now + duration);
    osc2.stop(now + duration);
    subOsc.stop(now + duration);
    
    offlineCtx.startRendering().then(buffer => {
        const wav = bufferToWave(buffer, buffer.length);
        const blob = new Blob([wav], { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `bass-${Date.now()}.wav`;
        a.click();
        
        console.log('✅ WAV exported successfully');
    });
}

function bufferToWave(abuffer, len) {
    const numOfChan = abuffer.numberOfChannels;
    const length = len * numOfChan * 2 + 44;
    const buffer = new ArrayBuffer(length);
    const view = new DataView(buffer);
    const channels = [];
    let i, sample, offset = 0, pos = 0;
    
    // Write WAVE header
    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8); // file length - 8
    setUint32(0x45564157); // "WAVE"
    
    setUint32(0x20746d66); // "fmt " chunk
    setUint32(16); // length = 16
    setUint16(1); // PCM (uncompressed)
    setUint16(numOfChan);
    setUint32(abuffer.sampleRate);
    setUint32(abuffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
    setUint16(numOfChan * 2); // block-align
    setUint16(16); // 16-bit (hardcoded in this demo)
    
    setUint32(0x61746164); // "data" - chunk
    setUint32(length - pos - 4); // chunk length
    
    // Write interleaved data
    for (i = 0; i < abuffer.numberOfChannels; i++)
        channels.push(abuffer.getChannelData(i));
    
    while (pos < length) {
        for (i = 0; i < numOfChan; i++) {
            sample = Math.max(-1, Math.min(1, channels[i][offset]));
            sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
            view.setInt16(pos, sample, true);
            pos += 2;
        }
        offset++;
    }
    
    return buffer;
    
    function setUint16(data) {
        view.setUint16(pos, data, true);
        pos += 2;
    }
    
    function setUint32(data) {
        view.setUint32(pos, data, true);
        pos += 4;
    }
}

// ===== MIDI EXPORT =====
function exportMIDI() {
    // Simple MIDI file with a bass note
    const midiData = [
        // MIDI Header
        0x4d, 0x54, 0x68, 0x64, // "MThd"
        0x00, 0x00, 0x00, 0x06, // Header length
        0x00, 0x00, // Format 0
        0x00, 0x01, // 1 track
        0x00, 0x60, // 96 ticks per quarter note
        
        // Track chunk
        0x4d, 0x54, 0x72, 0x6b, // "MTrk"
        0x00, 0x00, 0x00, 0x0f, // Track length (will be calculated)
        
        // Events
        0x00, 0x90, 0x29, 0x60, // Note on, A1, velocity 96
        0x60, 0x80, 0x29, 0x00, // Note off after 96 ticks
        0x00, 0xff, 0x2f, 0x00  // End of track
    ];
    
    const blob = new Blob([new Uint8Array(midiData)], { type: 'audio/midi' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `bass-${Date.now()}.mid`;
    a.click();
    
    console.log('✅ MIDI exported successfully');
}

// ===== PRESET SAVE/LOAD =====
function savePreset() {
    const presetJSON = JSON.stringify(synthParams, null, 2);
    const blob = new Blob([presetJSON], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `bass-preset-${Date.now()}.json`;
    a.click();
    
    console.log('✅ Preset saved successfully');
}

function loadPresetFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        
        reader.onload = (event) => {
            try {
                const preset = JSON.parse(event.target.result);
                Object.assign(synthParams, preset);
                updateAllKnobs();
                if (filterNode) {
                    filterNode.frequency.value = synthParams.cutoff;
                    filterNode.Q.value = synthParams.resonance;
                }
                updateDistortion();
                console.log('✅ Preset loaded successfully');
                playBassNote(55, 1.5);
            } catch (error) {
                console.error('❌ Failed to load preset:', error);
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

// ===== EVENT LISTENERS =====
document.addEventListener('DOMContentLoaded', () => {
    // Language toggle
    const languageToggle = document.getElementById('languageToggle');
    const languageIcon = document.getElementById('languageIcon');
    const languageText = document.getElementById('languageText');

    function updateLanguageButton() {
        const currentLang = localStorage.getItem('language') || 'en';
        if (currentLang === 'pl') {
            languageIcon.textContent = '🇬🇧';
            languageText.textContent = 'EN';
        } else {
            languageIcon.textContent = '🇵🇱';
            languageText.textContent = 'PL';
        }
    }

    languageToggle.addEventListener('click', () => {
        const currentLang = localStorage.getItem('language') || 'en';
        const newLang = currentLang === 'en' ? 'pl' : 'en';
        localStorage.setItem('language', newLang);
        updateLanguageButton();
        if (window.updateLanguage) window.updateLanguage();
    });

    updateLanguageButton();

    // Preset buttons
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const preset = this.dataset.preset;
            loadPreset(preset);
        });
    });

    // Knob controls
    document.querySelectorAll('.knob-container').forEach(knob => {
        let isDragging = false;
        let startY = 0;
        let startValue = 0;

        knob.addEventListener('mousedown', (e) => {
            isDragging = true;
            startY = e.clientY;
            startValue = parseFloat(knob.dataset.value);
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const deltaY = startY - e.clientY;
            const param = knob.dataset.param;
            let newValue = startValue;
            let range;
            
            // Determine range based on parameter
            if (param === 'sustain' || param.includes('Level')) {
                range = 1;
                newValue = startValue + (deltaY * 0.005);
            } else if (param === 'cutoff') {
                range = 5000;
                newValue = startValue + (deltaY * 20);
            } else if (param === 'resonance') {
                range = 20;
                newValue = startValue + (deltaY * 0.1);
            } else if (param === 'detune') {
                range = 50;
                newValue = startValue + (deltaY * 0.2);
            } else if (param.includes('distortion') || param.includes('chorus') || param.includes('compression')) {
                range = 100;
                newValue = startValue + (deltaY * 0.5);
            } else {
                range = 2;
                newValue = startValue + (deltaY * 0.01);
            }
            
            // Clamp value
            newValue = Math.max(0, Math.min(range, newValue));
            knob.dataset.value = newValue;
            synthParams[param] = newValue;
            
            // Update audio nodes
            if (param === 'cutoff' && filterNode) {
                filterNode.frequency.value = newValue;
            } else if (param === 'resonance' && filterNode) {
                filterNode.Q.value = newValue;
            } else if (param === 'distortion') {
                updateDistortion();
            }
            
            // Update display
            const valueDisplay = knob.nextElementSibling;
            if (param.includes('attack') || param.includes('decay') || param.includes('release')) {
                valueDisplay.textContent = newValue.toFixed(2) + 's';
            } else if (param === 'sustain' || param.includes('Level')) {
                valueDisplay.textContent = newValue.toFixed(2);
            } else {
                valueDisplay.textContent = Math.round(newValue);
            }
            
            // Rotate indicator
            const rotation = -135 + ((newValue / range) * 270);
            knob.querySelector('.knob-indicator').style.transform = `rotate(${rotation}deg)`;
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
    });

    // Transport controls
    const playBtn = document.getElementById('playBtn');
    const stopBtn = document.getElementById('stopBtn');
    const recordBtn = document.getElementById('recordBtn');

    let isPlaying = false;
    let playInterval;

    playBtn.addEventListener('click', () => {
        initAudio();
        isPlaying = !isPlaying;
        playBtn.classList.toggle('playing');
        
        if (isPlaying) {
            // Play bass loop
            const frequencies = [55, 55, 73.42, 55]; // A1, A1, D2, A1
            let noteIndex = 0;
            
            playBassNote(frequencies[0], 1);
            playInterval = setInterval(() => {
                if (!isPlaying) {
                    clearInterval(playInterval);
                    return;
                }
                noteIndex = (noteIndex + 1) % frequencies.length;
                playBassNote(frequencies[noteIndex], 1);
            }, 1000);
        } else {
            stopAllNotes();
            if (playInterval) clearInterval(playInterval);
        }
    });

    stopBtn.addEventListener('click', () => {
        isPlaying = false;
        playBtn.classList.remove('playing');
        stopAllNotes();
        if (playInterval) clearInterval(playInterval);
    });

    recordBtn.addEventListener('click', () => {
        recordBtn.classList.toggle('playing');
        isRecording = !isRecording;
        console.log('Recording:', isRecording);
    });

    // Export buttons
    document.getElementById('exportWAV').addEventListener('click', exportWAV);
    document.getElementById('exportMIDI').addEventListener('click', exportMIDI);
    document.getElementById('savePreset').addEventListener('click', savePreset);
    document.getElementById('loadPreset').addEventListener('click', loadPresetFile);

    // Initialize audio on first click
    document.addEventListener('click', () => {
        if (!audioContext) {
            initAudio();
        }
    }, { once: true });
});
