#include "PluginProcessor.h"
#include "PluginEditor.h"
#include "Params.h"

using namespace haos;

namespace
{
    juce::NormalisableRange<float> timeRange (float lo, float hi, float def)
    {
        juce::ignoreUnused (def);
        auto r = juce::NormalisableRange<float> (lo, hi);
        r.setSkewForCentre (juce::jlimit (lo, hi, (lo + hi) * 0.25f));
        return r;
    }
}

//==============================================================================
juce::AudioProcessorValueTreeState::ParameterLayout HaosHubProcessor::createLayout()
{
    using APF = juce::AudioParameterFloat;
    using APC = juce::AudioParameterChoice;

    juce::AudioProcessorValueTreeState::ParameterLayout layout;

    const juce::StringArray shapes { "Saw", "Pulse", "Triangle", "Sine" };

    // --- Oscillators: three independent VCOs, as on the 2600 ---
    const juce::StringArray octaves { "-3", "-2", "-1", "0", "+1", "+2", "+3" };

    auto addOsc = [&layout, &shapes, &octaves] (const char* shapeId, const char* octId,
                                                const char* detId, const char* lvlId,
                                                const juce::String& label, int defOct, float defLevel)
    {
        layout.add (std::make_unique<APC> (juce::ParameterID { shapeId, 1 }, label + " Shape", shapes, 0));
        layout.add (std::make_unique<APC> (juce::ParameterID { octId, 1 }, label + " Octave",
                                           octaves, defOct + 3));
        layout.add (std::make_unique<APF> (juce::ParameterID { detId, 1 }, label + " Detune",
                                           juce::NormalisableRange<float> (-12.0f, 12.0f, 0.01f), 0.0f));
        layout.add (std::make_unique<APF> (juce::ParameterID { lvlId, 1 }, label + " Level",
                                           juce::NormalisableRange<float> (0.0f, 1.0f), defLevel));
    };

    addOsc (pid::osc1Shape, pid::osc1Octave, pid::osc1Detune, pid::osc1Level, "Osc 1",  0, 0.80f);
    addOsc (pid::osc2Shape, pid::osc2Octave, pid::osc2Detune, pid::osc2Level, "Osc 2",  0, 0.00f);
    addOsc (pid::osc3Shape, pid::osc3Octave, pid::osc3Detune, pid::osc3Level, "Osc 3", -1, 0.00f);

    layout.add (std::make_unique<APF> (juce::ParameterID { pid::pulseWidth, 1 }, "Pulse Width",
                                       juce::NormalisableRange<float> (0.05f, 0.95f), 0.5f));
    layout.add (std::make_unique<APF> (juce::ParameterID { pid::ringMod, 1 }, "Ring Mod",
                                       juce::NormalisableRange<float> (0.0f, 1.0f), 0.0f));
    layout.add (std::make_unique<APF> (juce::ParameterID { pid::subLevel, 1 }, "Sub",
                                       juce::NormalisableRange<float> (0.0f, 1.0f), 0.0f));
    layout.add (std::make_unique<APF> (juce::ParameterID { pid::noiseLevel, 1 }, "Noise",
                                       juce::NormalisableRange<float> (0.0f, 1.0f), 0.0f));

    // --- Modulation matrix ---
    layout.add (std::make_unique<APC> (juce::ParameterID { pid::lfoShape, 1 }, "LFO Shape", shapes, 3));
    layout.add (std::make_unique<APF> (juce::ParameterID { pid::shRate, 1 }, "S&H Rate",
                                       juce::NormalisableRange<float> (0.1f, 40.0f), 8.0f));

    auto addMod = [&layout] (const char* id, const juce::String& label, float def)
    {
        layout.add (std::make_unique<APF> (juce::ParameterID { id, 1 }, label,
                                           juce::NormalisableRange<float> (0.0f, 1.0f), def));
    };
    addMod (pid::modEnvFilter, "Env > Filter",   0.50f);
    addMod (pid::modEnvPitch,  "Env > Pitch",    0.0f);
    addMod (pid::modLfoFilter, "LFO > Filter",   0.0f);
    addMod (pid::modLfoPitch,  "LFO > Pitch",    0.0f);
    addMod (pid::modLfoAmp,    "LFO > Amp",      0.0f);
    addMod (pid::modLfoPwm,    "LFO > PWM",      0.0f);
    addMod (pid::modKeyTrack,  "Key > Filter",   0.50f);
    addMod (pid::modVelFilter, "Vel > Filter",   0.30f);
    addMod (pid::modShFilter,  "S&H > Filter",   0.0f);
    addMod (pid::modShPitch,   "S&H > Pitch",    0.0f);

    // --- Filter ---
    auto cutoffRange = juce::NormalisableRange<float> (20.0f, 18000.0f);
    cutoffRange.setSkewForCentre (1000.0f);
    layout.add (std::make_unique<APF> (juce::ParameterID { pid::cutoff, 1 }, "Cutoff", cutoffRange, 1000.0f));
    layout.add (std::make_unique<APF> (juce::ParameterID { pid::resonance, 1 }, "Resonance",
                                       juce::NormalisableRange<float> (0.0f, 0.95f), 0.30f));
    layout.add (std::make_unique<APF> (juce::ParameterID { pid::envMod, 1 }, "Env Mod",
                                       juce::NormalisableRange<float> (0.0f, 1.0f), 0.50f));
    layout.add (std::make_unique<APF> (juce::ParameterID { pid::drive, 1 }, "Drive",
                                       juce::NormalisableRange<float> (1.0f, 12.0f), 1.5f));

    // --- Modulation ---
    layout.add (std::make_unique<APF> (juce::ParameterID { pid::glide, 1 }, "Glide",
                                       timeRange (0.0f, 1.0f, 0.0f), 0.0f));
    layout.add (std::make_unique<APF> (juce::ParameterID { pid::lfoRate, 1 }, "LFO Rate",
                                       juce::NormalisableRange<float> (0.0f, 20.0f), 0.0f));
    layout.add (std::make_unique<APF> (juce::ParameterID { pid::lfoDepth, 1 }, "LFO Depth",
                                       juce::NormalisableRange<float> (0.0f, 1.0f), 0.0f));

    // --- Envelopes ---
    layout.add (std::make_unique<APF> (juce::ParameterID { pid::ampA, 1 }, "Amp Attack",  timeRange (0.001f, 5.0f, 0.005f), 0.005f));
    layout.add (std::make_unique<APF> (juce::ParameterID { pid::ampD, 1 }, "Amp Decay",   timeRange (0.005f, 5.0f, 0.200f), 0.200f));
    layout.add (std::make_unique<APF> (juce::ParameterID { pid::ampS, 1 }, "Amp Sustain", juce::NormalisableRange<float> (0.0f, 1.0f), 0.70f));
    layout.add (std::make_unique<APF> (juce::ParameterID { pid::ampR, 1 }, "Amp Release", timeRange (0.005f, 8.0f, 0.250f), 0.250f));

    layout.add (std::make_unique<APF> (juce::ParameterID { pid::fltA, 1 }, "Filter Attack",  timeRange (0.001f, 5.0f, 0.002f), 0.002f));
    layout.add (std::make_unique<APF> (juce::ParameterID { pid::fltD, 1 }, "Filter Decay",   timeRange (0.005f, 5.0f, 0.250f), 0.250f));
    layout.add (std::make_unique<APF> (juce::ParameterID { pid::fltS, 1 }, "Filter Sustain", juce::NormalisableRange<float> (0.0f, 1.0f), 0.0f));
    layout.add (std::make_unique<APF> (juce::ParameterID { pid::fltR, 1 }, "Filter Release", timeRange (0.005f, 8.0f, 0.200f), 0.200f));

    // --- Output ---
    layout.add (std::make_unique<APF> (juce::ParameterID { pid::gain, 1 }, "Output",
                                       juce::NormalisableRange<float> (0.0f, 1.5f), 0.8f));

    // --- Instrument / transport ---
    layout.add (std::make_unique<APC> (juce::ParameterID { pid::instrument, 1 }, "Instrument",
                                       juce::StringArray { "Analog", "TR-909", "TR-808", "Sampler" }, 0));
    layout.add (std::make_unique<APF> (juce::ParameterID { pid::bpm, 1 }, "BPM",
                                       juce::NormalisableRange<float> (40.0f, 300.0f, 0.01f), 128.0f));

    // --- Drum machine ---
    layout.add (std::make_unique<APF> (juce::ParameterID { pid::kickPitch, 1 }, "Kick Pitch",
                                       juce::NormalisableRange<float> (20.0f, 120.0f), 60.0f));
    layout.add (std::make_unique<APF> (juce::ParameterID { pid::kickDecay, 1 }, "Kick Decay",
                                       juce::NormalisableRange<float> (0.05f, 2.0f), 0.5f));
    layout.add (std::make_unique<APF> (juce::ParameterID { pid::kickTone, 1 }, "Kick Tone",
                                       juce::NormalisableRange<float> (0.0f, 1.0f), 0.5f));
    layout.add (std::make_unique<APF> (juce::ParameterID { pid::snareTune, 1 }, "Snare Tune",
                                       juce::NormalisableRange<float> (80.0f, 500.0f), 200.0f));
    layout.add (std::make_unique<APF> (juce::ParameterID { pid::snareSnappy, 1 }, "Snappy",
                                       juce::NormalisableRange<float> (0.0f, 2.0f), 0.7f));
    layout.add (std::make_unique<APF> (juce::ParameterID { pid::snareDecay, 1 }, "Snare Decay",
                                       juce::NormalisableRange<float> (0.05f, 1.5f), 0.2f));
    layout.add (std::make_unique<APF> (juce::ParameterID { pid::hatTune, 1 }, "Hat Tune",
                                       juce::NormalisableRange<float> (0.0f, 1.5f), 0.5f));
    layout.add (std::make_unique<APF> (juce::ParameterID { pid::hatDecay, 1 }, "Hat Decay",
                                       juce::NormalisableRange<float> (0.01f, 0.6f), 0.05f));
    layout.add (std::make_unique<APF> (juce::ParameterID { pid::clapTone, 1 }, "Clap Tone",
                                       juce::NormalisableRange<float> (0.0f, 1.0f), 0.5f));
    layout.add (std::make_unique<APF> (juce::ParameterID { pid::clapDecay, 1 }, "Clap Decay",
                                       juce::NormalisableRange<float> (0.05f, 1.0f), 0.2f));

    // --- Master effects ---
    layout.add (std::make_unique<APF> (juce::ParameterID { pid::fxDrive, 1 }, "FX Drive",
                                       juce::NormalisableRange<float> (1.0f, 20.0f), 1.0f));
    layout.add (std::make_unique<APF> (juce::ParameterID { pid::fxChorus, 1 }, "Chorus",
                                       juce::NormalisableRange<float> (0.0f, 1.0f), 0.0f));
    layout.add (std::make_unique<APF> (juce::ParameterID { pid::fxDelayMix, 1 }, "Delay",
                                       juce::NormalisableRange<float> (0.0f, 1.0f), 0.0f));
    layout.add (std::make_unique<APF> (juce::ParameterID { pid::fxDelayTime, 1 }, "Delay Time",
                                       juce::NormalisableRange<float> (20.0f, 1000.0f), 375.0f));
    layout.add (std::make_unique<APF> (juce::ParameterID { pid::fxDelayFb, 1 }, "Feedback",
                                       juce::NormalisableRange<float> (0.0f, 0.95f), 0.35f));
    layout.add (std::make_unique<APF> (juce::ParameterID { pid::fxReverbMix, 1 }, "Reverb",
                                       juce::NormalisableRange<float> (0.0f, 1.0f), 0.0f));
    layout.add (std::make_unique<APF> (juce::ParameterID { pid::fxReverbSize, 1 }, "Room Size",
                                       juce::NormalisableRange<float> (0.0f, 1.0f), 0.6f));

    return layout;
}

//==============================================================================
HaosHubProcessor::HaosHubProcessor()
    : juce::AudioProcessor (BusesProperties().withOutput ("Output", juce::AudioChannelSet::stereo(), true)),
      apvts (*this, nullptr, "HAOSHUB", createLayout())
{
    synth.addSound (new AnalogSound());
    for (int i = 0; i < 8; ++i)
        synth.addVoice (new AnalogVoice (engine));

    pGain = apvts.getRawParameterValue (pid::gain);

    formatManager.registerBasicFormats();

    // The ENTIRE library (haos.fm caches, bundle folders, third-party scan) is
    // loaded lazily by the editor via ensureLibraryLoaded(): only the editor's
    // browser needs it, and any work here slows / hung Ableton's plugin scan,
    // which constructs and destroys instances without ever opening an editor.

    // Seed a groove so the very first press of Play in the Sequencer makes sound
    // rather than sweeping a silent, empty grid.
    sequencer.loadDefaultPattern();
}

HaosHubProcessor::~HaosHubProcessor()
{
    scanThread.stopThread (4000);      // join — the thread must never outlive us
}

void HaosHubProcessor::ensureLibraryLoaded()
{
    if (libraryLoadStarted)
        return;
    libraryLoadStarted = true;

    // HAOS content ONLY — Cymatics-Hub logic (user call 2026-07-30): the hub
    // is a product manager for OUR packs/presets/plugins, so the third-party
    // preset scan (Serum/NI/... folders) is gone. Local caches + bundles only.
    library.loadCaches();
    library.rescanBundles();
    ++libraryVersion;
}

void HaosHubProcessor::ScanThread::run()
{
    // Third-party scanning retired with the HAOS-only library. The owned
    // thread object stays (harmless) so the header/dtor contract is unchanged.
    owner.scanning = false;
}

void HaosHubProcessor::applyPendingScanIfReady()
{
    if (! scanReady.exchange (false))
        return;

    {
        const juce::SpinLock::ScopedLockType sl (scanResultLock);
        library.setExternalBundles (scanResult, false);    // cache already written by the worker
        scanResult.clearQuick();
    }
    ++libraryVersion;
}

//==============================================================================
void HaosHubProcessor::prepareToPlay (double sampleRate, int samplesPerBlock)
{
    synth.setCurrentPlaybackSampleRate (sampleRate);
    drums.prepare (sampleRate);
    sequencer.prepare (sampleRate);
    fx.prepare (sampleRate, samplesPerBlock, getTotalNumOutputChannels());
    silentSink.setSize (juce::jmax (1, getTotalNumOutputChannels()),
                        juce::jmax (1, samplesPerBlock), false, true, true);
    lastGain = pGain != nullptr ? pGain->load() : 0.8f;
}

void HaosHubProcessor::releaseResources()
{
    fx.reset();
}

HaosHubProcessor::Instrument HaosHubProcessor::getInstrument() const
{
    const auto v = (int) apvts.getRawParameterValue (pid::instrument)->load();
    return (Instrument) juce::jlimit (0, 3, v);
}

bool HaosHubProcessor::isBusesLayoutSupported (const BusesLayout& layouts) const
{
    const auto out = layouts.getMainOutputChannelSet();
    return out == juce::AudioChannelSet::stereo() || out == juce::AudioChannelSet::mono();
}

void HaosHubProcessor::pullParams()
{
    auto get = [this] (const char* id) { return apvts.getRawParameterValue (id)->load(); };

    auto pullOsc = [&get] (haos::OscParams& o, const char* shape, const char* oct,
                           const char* det, const char* lvl, float pw)
    {
        o.shape      = (int) get (shape);
        o.octave     = (int) get (oct) - 3;      // choice index -> -3..+3
        o.detune     = get (det);
        o.level      = get (lvl);
        o.pulseWidth = pw;
    };

    const float pw = get (pid::pulseWidth);
    pullOsc (engine.osc1, pid::osc1Shape, pid::osc1Octave, pid::osc1Detune, pid::osc1Level, pw);
    pullOsc (engine.osc2, pid::osc2Shape, pid::osc2Octave, pid::osc2Detune, pid::osc2Level, pw);
    pullOsc (engine.osc3, pid::osc3Shape, pid::osc3Octave, pid::osc3Detune, pid::osc3Level, pw);

    engine.ringModMix = get (pid::ringMod);
    engine.subLevel   = get (pid::subLevel);
    engine.noiseLevel = get (pid::noiseLevel);

    engine.lfoShape   = (int) get (pid::lfoShape);
    engine.shRate     = get (pid::shRate);

    auto& mm = engine.mod;
    mm.env1ToFilter     = get (pid::modEnvFilter);
    mm.env1ToPitch      = get (pid::modEnvPitch);
    mm.lfoToFilter      = get (pid::modLfoFilter);
    mm.lfoToPitch       = get (pid::modLfoPitch);
    mm.lfoToAmp         = get (pid::modLfoAmp);
    mm.lfoToPwm         = get (pid::modLfoPwm);
    mm.keyTrackToFilter = get (pid::modKeyTrack);
    mm.velToFilter      = get (pid::modVelFilter);
    mm.shToFilter       = get (pid::modShFilter);
    mm.shToPitch        = get (pid::modShPitch);

    engine.cutoff     = get (pid::cutoff);
    engine.resonance  = get (pid::resonance);
    engine.envMod     = get (pid::envMod);
    engine.drive      = get (pid::drive);

    engine.glide      = get (pid::glide);
    engine.lfoRate    = get (pid::lfoRate);
    engine.lfoDepth   = get (pid::lfoDepth);

    engine.amp = { get (pid::ampA), get (pid::ampD), get (pid::ampS), get (pid::ampR) };
    engine.flt = { get (pid::fltA), get (pid::fltD), get (pid::fltS), get (pid::fltR) };

    // --- drum machine ---
    auto& dp = drums.params;
    dp.kickPitch   = get (pid::kickPitch);
    dp.kickDecay   = get (pid::kickDecay);
    dp.kickTone    = get (pid::kickTone);
    dp.snareTune   = get (pid::snareTune);
    dp.snareSnappy = get (pid::snareSnappy);
    dp.snareDecay  = get (pid::snareDecay);
    dp.hatTune     = get (pid::hatTune);
    dp.hatClosedDecay = get (pid::hatDecay);
    dp.hatOpenDecay   = juce::jmax (get (pid::hatDecay) * 5.0f, 0.15f);
    dp.clapTone    = get (pid::clapTone);
    dp.clapDecay   = get (pid::clapDecay);
    drums.model808 = getInstrument() == TR808;

    // --- effects ---
    auto& fp = fx.params;
    fp.drive         = get (pid::fxDrive);
    fp.chorusMix     = get (pid::fxChorus);
    fp.delayMix      = get (pid::fxDelayMix);
    fp.delayTimeMs   = get (pid::fxDelayTime);
    fp.delayFeedback = get (pid::fxDelayFb);
    fp.reverbMix     = get (pid::fxReverbMix);
    fp.reverbSize    = get (pid::fxReverbSize);

    sequencer.setBpm (get (pid::bpm));
}

void HaosHubProcessor::processBlock (juce::AudioBuffer<float>& buffer, juce::MidiBuffer& midi)
{
    juce::ScopedNoDenormals noDenormals;

    pullParams();

    // Merge in notes played on the editor's on-screen keyboard.
    keyboardState.processNextMidiBuffer (midi, 0, buffer.getNumSamples(), true);

    // clip audition: inject the loaded .mid into this block's MIDI stream so
    // it plays through the CURRENT instrument (analog/909/808/sampler)
    if (clipActive.load (std::memory_order_acquire))
    {
        juce::SpinLock::ScopedTryLockType sl (clipLock);
        if (sl.isLocked())
        {
            const double sr = getSampleRate() > 1000.0 ? getSampleRate() : 44100.0;
            const int    n  = buffer.getNumSamples();
            const double t0 = clipTime, t1 = clipTime + n / sr;
            while (clipEvent < clipSeq.getNumEvents())
            {
                auto* ev = clipSeq.getEventPointer (clipEvent);
                const double ts = ev->message.getTimeStamp();
                if (ts >= t1) break;
                if (ev->message.isNoteOnOrOff())
                    midi.addEvent (ev->message,
                                   juce::jlimit (0, n - 1, (int) ((ts - t0) * sr)));
                ++clipEvent;
            }
            clipTime = t1;
            if (clipEvent >= clipSeq.getNumEvents()
                && t1 > clipSeq.getEndTime() + 1.0)
                clipActive.store (false);
        }
    }

    buffer.clear();

    const bool analog = getInstrument() == Analog;

    // The keyboard plays whichever instrument the selector points at.
    if (analog)
    {
        synth.renderNextBlock (buffer, midi, 0, buffer.getNumSamples());
    }
    else
    {
        // The synth must still see the MIDI even when it is not the audible
        // instrument, or a note held across an instrument switch never receives
        // its note-off and hangs forever.
        // Sampler: the clicked sample sits on the keyboard, pitched from C3.
        if (getInstrument() == Sampler)
            renderSampler (buffer, midi);

        silentSink.clear();
        synth.renderNextBlock (silentSink, midi, 0,
                               juce::jmin (buffer.getNumSamples(), silentSink.getNumSamples()));

        for (const auto meta : midi)
        {
            const auto m = meta.getMessage();
            if (! m.isNoteOn() || getInstrument() == Sampler)
                continue;

            const int note = m.getNoteNumber();
            haos::DrumMachine::Voice v;
            switch (note)
            {
                case 36: v = haos::DrumMachine::Kick;      break;
                case 38: v = haos::DrumMachine::Snare;     break;
                case 39: v = haos::DrumMachine::Clap;      break;
                case 42: v = haos::DrumMachine::HatClosed; break;
                case 46: v = haos::DrumMachine::HatOpen;   break;
                default: v = (haos::DrumMachine::Voice) (note % haos::DrumMachine::NumVoices); break;
            }
            drums.trigger (v, m.getFloatVelocity());
        }
    }

    // The step sequencer ALWAYS drives the drums when it is running, regardless
    // of the keyboard instrument — otherwise pressing Play in the default Analog
    // mode produced total silence, which read as "the sequencer is broken". When
    // Analog is selected the drums default to a 909 kit. When stopped this only
    // rings out any remaining tails.
    drums.model808 = (getInstrument() == TR808);
    sequencer.process (drums, buffer, 0, buffer.getNumSamples());

    fx.process (buffer);

    // Ramp rather than a per-block constant, otherwise moving the Output knob
    // steps the waveform and clicks.
    const float targetGain = pGain != nullptr ? pGain->load() : 0.8f;
    buffer.applyGainRamp (0, buffer.getNumSamples(), lastGain, targetGain);
    lastGain = targetGain;

    mixAudition (buffer);

    // Scope tap LAST so the editor's oscilloscope shows exactly what leaves the
    // plugin (including sample auditions). Lock-free by design — see copyScope.
    {
        const int    n = buffer.getNumSamples();
        const float* l = buffer.getReadPointer (0);
        const float* r = buffer.getNumChannels() > 1 ? buffer.getReadPointer (1) : nullptr;

        int pos = scopePos.load (std::memory_order_relaxed);
        for (int i = 0; i < n; ++i)
        {
            scopeBuf[pos] = r != nullptr ? 0.5f * (l[i] + r[i]) : l[i];
            pos = (pos + 1) & (kScopeSize - 1);
        }
        scopePos.store (pos, std::memory_order_release);
    }
}

void HaosHubProcessor::copyScope (float* dest) const
{
    const int pos = scopePos.load (std::memory_order_acquire);
    for (int i = 0; i < kScopeSize; ++i)
        dest[i] = scopeBuf[(pos + i) & (kScopeSize - 1)];
}

//==============================================================================
bool HaosHubProcessor::loadDrumPreset (const haos::Preset& preset)
{
    if (! preset.isDrumPattern())
        return false;

    // Switch the engine to the right machine and load the kit's per-voice sound.
    if (auto* p = apvts.getParameter (pid::instrument))
        p->setValueNotifyingHost (p->convertTo0to1 (preset.instrument == "tr808" ? 2.0f : 1.0f));

    if (preset.bpm > 0.0)
        if (auto* p = apvts.getParameter (pid::bpm))
            p->setValueNotifyingHost (p->convertTo0to1 ((float) preset.bpm));

    // Only replace the grid when the preset actually carries a step pattern.
    // Some presets are kit-sound only; those load their voices without wiping
    // whatever the user already has on the grid, and report "not playable".
    // Patterns come lane-keyed (object) or as 16 step objects (factory array).
    const bool hasPattern = preset.pattern().getDynamicObject() != nullptr
                         || preset.pattern().getArray() != nullptr;
    if (hasPattern)
        sequencer.loadPattern (preset.pattern());

    // Per-voice parameters, where the patch supplies them.
    auto params = preset.params();
    if (auto* obj = params.getDynamicObject())
    {
        auto grab = [&obj] (const char* voice, const char* key, float& target)
        {
            if (auto* v = obj->getProperty (voice).getDynamicObject())
                if (v->hasProperty (key))
                    target = (float) (double) v->getProperty (key);
        };

        auto set = [this] (const char* id, float value)
        {
            if (auto* p = apvts.getParameter (id))
                p->setValueNotifyingHost (p->convertTo0to1 (value));
        };

        float v;
        v = drums.params.kickPitch;   grab ("kick",  "pitch",  v); set (pid::kickPitch, v);
        v = drums.params.kickDecay;   grab ("kick",  "decay",  v); set (pid::kickDecay, v);
        v = drums.params.kickTone;    grab ("kick",  "tone",   v); set (pid::kickTone,  v);
        v = drums.params.snareTune;   grab ("snare", "tune",   v); set (pid::snareTune, v);
        v = drums.params.snareSnappy; grab ("snare", "snappy", v); set (pid::snareSnappy, v);
        v = drums.params.snareDecay;  grab ("snare", "decay",  v); set (pid::snareDecay, v);
        v = drums.params.clapTone;    grab ("clap",  "tone",   v); set (pid::clapTone,  v);
        v = drums.params.clapDecay;   grab ("clap",  "decay",  v); set (pid::clapDecay, v);

        // hats live under different keys on the two machines
        v = drums.params.hatClosedDecay;
        grab ("hatClosed", "decay", v);
        grab ("hat",       "decay", v);
        set (pid::hatDecay, v);

        v = drums.params.hatTune;
        grab ("hatClosed", "tune", v);
        set (pid::hatTune, v);
    }

    currentPresetName = preset.name;
    return hasPattern;   // true => there is a pattern to play
}

//==============================================================================
// Sample audition
//==============================================================================

bool HaosHubProcessor::loadSampleForKeyboard (const juce::File& file)
{
    std::unique_ptr<juce::AudioFormatReader> reader (formatManager.createReaderFor (file));
    if (reader == nullptr)
        return false;

    const auto numSamples = (int) juce::jmin (reader->lengthInSamples,
                                              (juce::int64) (reader->sampleRate * 30.0));
    if (numSamples <= 0)
        return false;

    juce::AudioBuffer<float> loaded ((int) juce::jmax (1u, reader->numChannels), numSamples);
    reader->read (&loaded, 0, numSamples, 0, true, true);

    const auto hostRate = getSampleRate() > 0.0 ? getSampleRate() : 44100.0;

    {
        const juce::SpinLock::ScopedLockType sl (samplerLock);
        samplerBuffer    = std::move (loaded);
        samplerFileRatio = reader->sampleRate / hostRate;
        for (auto& v : sampVoices) v.active = false;
    }
    samplerName = file.getFileNameWithoutExtension();

    if (auto* p = apvts.getParameter (pid::instrument))
        p->setValueNotifyingHost (p->convertTo0to1 ((float) Sampler));
    return true;
}

void HaosHubProcessor::renderSampler (juce::AudioBuffer<float>& buffer, const juce::MidiBuffer& midi)
{
    const juce::SpinLock::ScopedTryLockType sl (samplerLock);
    if (! sl.isLocked() || samplerBuffer.getNumSamples() < 2)
        return;

    // note events -> voices (root C3 = 60; steal the quietest slot when full)
    for (const auto meta : midi)
    {
        const auto m = meta.getMessage();
        if (m.isNoteOn())
        {
            SampleVoice* slot = nullptr;
            for (auto& v : sampVoices) if (! v.active) { slot = &v; break; }
            if (slot == nullptr) { slot = &sampVoices[0];
                for (auto& v : sampVoices) if (v.env < slot->env) slot = &v; }
            slot->note = m.getNoteNumber(); slot->pos = 0.0; slot->env = 0.0f;
            slot->vel = juce::jmax (0.1f, m.getFloatVelocity());
            slot->held = true; slot->active = true;
        }
        else if (m.isNoteOff() || m.isAllNotesOff())
        {
            for (auto& v : sampVoices)
                if (v.active && (m.isAllNotesOff() || v.note == m.getNoteNumber()))
                    v.held = false;
        }
    }

    const int srcLen = samplerBuffer.getNumSamples();
    const int srcCh  = samplerBuffer.getNumChannels();
    const int outCh  = buffer.getNumChannels();
    const int n      = buffer.getNumSamples();
    const double sr  = getSampleRate() > 0.0 ? getSampleRate() : 44100.0;
    const float relC = std::exp (-1.0f / (0.045f * (float) sr));   // ~45 ms release
    const float atkI = 1.0f / (0.002f * (float) sr);               // ~2 ms declick attack

    for (auto& v : sampVoices)
    {
        if (! v.active) continue;
        const double step = samplerFileRatio * std::pow (2.0, (v.note - 60) / 12.0);
        for (int i = 0; i < n; ++i)
        {
            if (v.pos >= (double) (srcLen - 1)) { v.active = false; break; }
            v.env = v.held ? juce::jmin (1.0f, v.env + atkI) : v.env * relC;
            if (! v.held && v.env < 1.0e-4f) { v.active = false; break; }

            const int    i0 = (int) v.pos;
            const float  fr = (float) (v.pos - i0);
            const float  g  = v.env * v.vel * 0.9f;
            for (int ch = 0; ch < outCh; ++ch)
            {
                const auto* src = samplerBuffer.getReadPointer (juce::jmin (ch, srcCh - 1));
                buffer.addSample (ch, i, (src[i0] + fr * (src[i0 + 1] - src[i0])) * g);
            }
            v.pos += step;
        }
    }
}

bool HaosHubProcessor::auditionFile (const juce::File& file)
{
    std::unique_ptr<juce::AudioFormatReader> reader (formatManager.createReaderFor (file));
    if (reader == nullptr)
        return false;

    // Preview clips are loops/one-shots; cap at 30s so a stray long file can't
    // swallow a huge allocation on the message thread.
    const auto numSamples = (int) juce::jmin (reader->lengthInSamples,
                                              (juce::int64) (reader->sampleRate * 30.0));
    if (numSamples <= 0)
        return false;

    juce::AudioBuffer<float> loaded ((int) juce::jmax (1u, reader->numChannels), numSamples);
    reader->read (&loaded, 0, numSamples, 0, true, true);

    const auto hostRate = getSampleRate() > 0.0 ? getSampleRate() : 44100.0;

    {
        const juce::SpinLock::ScopedLockType sl (previewLock);
        previewBuffer = std::move (loaded);
        previewRatio  = reader->sampleRate / hostRate;
        previewPos    = 0.0;
    }

    previewActive = true;
    return true;
}

void HaosHubProcessor::stopAudition()
{
    previewActive = false;
}

void HaosHubProcessor::mixAudition (juce::AudioBuffer<float>& buffer)
{
    if (! previewActive.load())
        return;

    const juce::SpinLock::ScopedTryLockType sl (previewLock);
    if (! sl.isLocked() || previewBuffer.getNumSamples() == 0)
        return;

    const int srcLen  = previewBuffer.getNumSamples();
    const int srcCh   = previewBuffer.getNumChannels();
    const int outCh   = buffer.getNumChannels();
    const int numOut  = buffer.getNumSamples();

    for (int i = 0; i < numOut; ++i)
    {
        if (previewPos >= (double) (srcLen - 1))
        {
            previewActive = false;
            break;
        }

        const int    i0 = (int) previewPos;
        const float  f  = (float) (previewPos - i0);

        for (int ch = 0; ch < outCh; ++ch)
        {
            const auto* src = previewBuffer.getReadPointer (juce::jmin (ch, srcCh - 1));
            const float s   = src[i0] + f * (src[i0 + 1] - src[i0]);
            buffer.addSample (ch, i, s * 0.9f);
        }

        previewPos += previewRatio;
    }
}

//==============================================================================
bool HaosHubProcessor::auditionMidiClip (const juce::File& f)
{
    juce::FileInputStream is (f);
    juce::MidiFile mf;
    if (! is.openedOk() || ! mf.readFrom (is))
        return false;
    mf.convertTimestampTicksToSeconds();

    juce::MidiMessageSequence seq;
    for (int t = 0; t < mf.getNumTracks(); ++t)
        seq.addSequence (*mf.getTrack (t), 0.0);
    seq.updateMatchedPairs();
    if (seq.getNumEvents() == 0)
        return false;

    {
        juce::SpinLock::ScopedLockType sl (clipLock);
        clipSeq   = std::move (seq);
        clipEvent = 0;
        clipTime  = 0.0;
    }
    clipActive.store (true, std::memory_order_release);
    return true;
}

//==============================================================================
juce::AudioProcessorEditor* HaosHubProcessor::createEditor()
{
    return new HaosHubEditor (*this);
}

void HaosHubProcessor::getStateInformation (juce::MemoryBlock& destData)
{
    auto state = apvts.copyState();
    state.setProperty ("presetName", currentPresetName, nullptr);

    // Persist the step pattern too — in the standalone the app *is* the session,
    // so losing the beat on relaunch felt like the sequencer forgot everything.
    for (int lane = 0; lane < haos::Sequencer::NumLanes; ++lane)
        state.setProperty ("seqLane" + juce::String (lane),
                           (int) sequencer.getLaneMask (lane), nullptr);

    if (auto xml = std::unique_ptr<juce::XmlElement> (state.createXml()))
        copyXmlToBinary (*xml, destData);
}

void HaosHubProcessor::setStateInformation (const void* data, int sizeInBytes)
{
    if (auto xml = getXmlFromBinary (data, sizeInBytes))
    {
        auto state = juce::ValueTree::fromXml (*xml);
        if (state.isValid())
        {
            currentPresetName = state.getProperty ("presetName", "init").toString();

            if (state.hasProperty ("seqLane0"))
                for (int lane = 0; lane < haos::Sequencer::NumLanes; ++lane)
                    sequencer.setLaneMask (lane,
                        (uint32_t) (int) state.getProperty ("seqLane" + juce::String (lane), 0));

            apvts.replaceState (state);
        }
    }
}

//==============================================================================
juce::AudioProcessor* JUCE_CALLTYPE createPluginFilter()
{
    return new HaosHubProcessor();
}
