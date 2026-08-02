#include <JuceHeader.h>
#include "PluginProcessor.h"
#include "Params.h"
#include <vector>

using namespace haos;

// Offline audio proof: renders the engine headlessly and measures the output, so
// "it makes sound" is a measurement rather than a claim. Checks each instrument
// path independently and reports peak/RMS per case.

namespace
{
    struct Result { float peak = 0.0f, rms = 0.0f, spread = 0.0f; };

    Result measure (HaosHubProcessor& p, int blocks, int blockSize,
                    std::function<void (juce::MidiBuffer&, int)> feedMidi = {})
    {
        juce::AudioBuffer<float> buf (2, blockSize);
        double sumSq = 0.0; int n = 0; float peak = 0.0f;
        std::vector<float> blockRms;

        for (int b = 0; b < blocks; ++b)
        {
            juce::MidiBuffer midi;
            if (feedMidi) feedMidi (midi, b);

            buf.clear();
            p.processBlock (buf, midi);

            double blockSq = 0.0;
            for (int i = 0; i < blockSize; ++i)
            {
                const float v = buf.getSample (0, i);
                blockSq += (double) v * v;
            }
            blockRms.push_back ((float) std::sqrt (blockSq / juce::jmax (1, blockSize)));

            for (int ch = 0; ch < buf.getNumChannels(); ++ch)
                for (int i = 0; i < blockSize; ++i)
                {
                    const float s = buf.getSample (ch, i);
                    peak = juce::jmax (peak, std::abs (s));
                    sumSq += (double) s * s; ++n;
                }
        }
        const float overall = n > 0 ? (float) std::sqrt (sumSq / n) : 0.0f;

        // Spread of per-block RMS: a filter being swept varies block to block even
        // when its average level is unchanged, so this is what detects modulation.
        float mean = 0.0f;
        for (auto v : blockRms) mean += v;
        mean = blockRms.empty() ? 0.0f : mean / (float) blockRms.size();
        float var = 0.0f;
        for (auto v : blockRms) var += (v - mean) * (v - mean);
        var = blockRms.empty() ? 0.0f : var / (float) blockRms.size();

        return { peak, overall, std::sqrt (var) };
    }

    void setParam (HaosHubProcessor& p, const char* id, float v)
    {
        if (auto* param = p.apvts.getParameter (id))
            param->setValueNotifyingHost (param->convertTo0to1 (v));
    }

    int failures = 0;

    void check (const juce::String& name, Result r, float minPeak)
    {
        const bool ok = r.peak >= minPeak;
        if (! ok) ++failures;
        std::cout << (ok ? "  PASS  " : "  FAIL  ")
                  << name.paddedRight (' ', 34).toStdString()
                  << " peak=" << juce::String (r.peak, 4).toStdString()
                  << "  rms=" << juce::String (r.rms, 4).toStdString()
                  << (ok ? "" : ("   (expected peak >= " + juce::String (minPeak, 3)).toStdString() + ")")
                  << "\n";
    }
}

int main()
{
    juce::ScopedJuceInitialiser_GUI gui;

    constexpr double sr = 44100.0;
    constexpr int    bs = 512;

    std::cout << "HAOS Hub offline audio test @ " << sr << " Hz\n\n";

    // --- 1. silence when idle -------------------------------------------------
    {
        HaosHubProcessor p;
        p.prepareToPlay (sr, bs);
        p.sequencer.stop (p.drums);
        auto r = measure (p, 20, bs);
        const bool ok = r.peak < 1.0e-4f;
        if (! ok) ++failures;
        std::cout << (ok ? "  PASS  " : "  FAIL  ")
                  << juce::String ("idle is silent").paddedRight (' ', 34).toStdString()
                  << " peak=" << juce::String (r.peak, 6).toStdString() << "\n";
    }

    // --- 2. sequencer in the DEFAULT Analog mode (the old silent-Play bug) ----
    {
        HaosHubProcessor p;
        p.prepareToPlay (sr, bs);
        setParam (p, pid::instrument, 0.0f);      // Analog: must STILL drum
        p.sequencer.start();
        check ("Play in default Analog mode", measure (p, 120, bs), 0.02f);
    }

    // --- 3. each drum machine -------------------------------------------------
    for (auto m : { std::pair<const char*, float> { "TR-909 sequencer", 1.0f },
                    std::pair<const char*, float> { "TR-808 sequencer", 2.0f } })
    {
        HaosHubProcessor p;
        p.prepareToPlay (sr, bs);
        setParam (p, pid::instrument, m.second);
        p.sequencer.start();
        check (m.first, measure (p, 120, bs), 0.02f);
    }

    // --- 4. individual drum voices, incl. the hats that were inaudible --------
    {
        const std::pair<const char*, haos::DrumMachine::Voice> voices[] = {
            { "kick",       haos::DrumMachine::Kick },
            { "snare",      haos::DrumMachine::Snare },
            { "closed hat", haos::DrumMachine::HatClosed },
            { "open hat",   haos::DrumMachine::HatOpen },
            { "clap",       haos::DrumMachine::Clap },
        };

        for (const auto& v : voices)
        {
            HaosHubProcessor p;
            p.prepareToPlay (sr, bs);
            setParam (p, pid::instrument, 1.0f);
            p.sequencer.stop (p.drums);
            p.drums.trigger (v.second, 1.0f);
            check (juce::String ("drum voice: ") + v.first, measure (p, 40, bs), 0.01f);
        }
    }

    // --- 5. the analog synth from a MIDI note ---------------------------------
    {
        HaosHubProcessor p;
        p.prepareToPlay (sr, bs);
        setParam (p, pid::instrument, 0.0f);
        p.sequencer.stop (p.drums);
        p.sequencer.clear();

        auto r = measure (p, 60, bs, [] (juce::MidiBuffer& m, int b)
        {
            if (b == 0) m.addEvent (juce::MidiMessage::noteOn (1, 45, 0.9f), 0);
        });
        check ("analog voice from MIDI note", r, 0.02f);
    }

    // --- 5b. the filter controls must actually do something --------------------
    // This is the regression guard for the ladder bug: cutoff and resonance were
    // silently inert because the filter's coefficients were never updated.
    {
        auto renderWithCutoff = [&] (float hz, float reso)
        {
            HaosHubProcessor p;
            p.prepareToPlay (sr, bs);
            setParam (p, pid::instrument, 0.0f);
            p.sequencer.stop (p.drums);
            p.sequencer.clear();
            setParam (p, pid::cutoff, hz);
            setParam (p, pid::resonance, reso);
            setParam (p, pid::envMod, 0.0f);       // isolate the static cutoff
            setParam (p, pid::ampS, 1.0f);
            return measure (p, 60, bs, [] (juce::MidiBuffer& m, int b)
            {
                if (b == 0) m.addEvent (juce::MidiMessage::noteOn (1, 45, 0.9f), 0);
            });
        };

        const auto dark   = renderWithCutoff (120.0f, 0.1f);
        const auto bright = renderWithCutoff (12000.0f, 0.1f);
        const bool cutoffWorks = bright.rms > dark.rms * 1.5f;
        if (! cutoffWorks) ++failures;
        std::cout << (cutoffWorks ? "  PASS  " : "  FAIL  ")
                  << juce::String ("cutoff changes the tone").paddedRight (' ', 34).toStdString()
                  << " darkRms=" << juce::String (dark.rms, 4).toStdString()
                  << " brightRms=" << juce::String (bright.rms, 4).toStdString() << "\n";

        // Judge resonance near the fundamental (A2 = 110 Hz), where the peak it
        // adds is unmistakable. Broadband RMS at a far-off cutoff barely moves.
        const auto lowQ  = renderWithCutoff (240.0f, 0.05f);
        const auto highQ = renderWithCutoff (240.0f, 0.95f);
        const bool resoWorks = std::abs (highQ.rms - lowQ.rms) > lowQ.rms * 0.10f;
        if (! resoWorks) ++failures;
        std::cout << (resoWorks ? "  PASS  " : "  FAIL  ")
                  << juce::String ("resonance changes the tone").paddedRight (' ', 34).toStdString()
                  << " lowQRms=" << juce::String (lowQ.rms, 4).toStdString()
                  << " highQRms=" << juce::String (highQ.rms, 4).toStdString() << "\n";
    }

    // --- 5c. the ARP-2600 architecture: 3 VCOs, ring mod, modulation ----------
    {
        auto renderNote = [&] (std::function<void (HaosHubProcessor&)> setup)
        {
            HaosHubProcessor p;
            p.prepareToPlay (sr, bs);
            setParam (p, pid::instrument, 0.0f);
            p.sequencer.stop (p.drums);
            p.sequencer.clear();
            setParam (p, pid::ampS, 1.0f);
            setParam (p, pid::envMod, 0.0f);
            setParam (p, pid::cutoff, 9000.0f);
            setup (p);
            return measure (p, 60, bs, [] (juce::MidiBuffer& m, int b)
            {
                if (b == 0) m.addEvent (juce::MidiMessage::noteOn (1, 45, 0.9f), 0);
            });
        };

        // each oscillator must be independently audible
        const char* lvlIds[3] = { pid::osc1Level, pid::osc2Level, pid::osc3Level };
        const char* names[3]  = { "VCO 1 sounds", "VCO 2 sounds", "VCO 3 sounds" };
        for (int i = 0; i < 3; ++i)
        {
            const int idx = i;
            auto r = renderNote ([&, idx] (HaosHubProcessor& p)
            {
                for (int j = 0; j < 3; ++j)
                    setParam (p, lvlIds[j], j == idx ? 0.9f : 0.0f);
            });
            check (names[i], r, 0.02f);
        }

        // three oscillators together must be louder than one alone
        const auto one = renderNote ([&] (HaosHubProcessor& p)
        {
            setParam (p, pid::osc1Level, 0.9f);
            setParam (p, pid::osc2Level, 0.0f);
            setParam (p, pid::osc3Level, 0.0f);
        });
        const auto three = renderNote ([&] (HaosHubProcessor& p)
        {
            setParam (p, pid::osc1Level, 0.9f);
            setParam (p, pid::osc2Level, 0.9f);
            setParam (p, pid::osc3Level, 0.9f);
            setParam (p, pid::osc2Detune, 7.0f);
            setParam (p, pid::osc3Detune, -5.0f);
        });
        const bool stack = three.rms > one.rms * 1.2f;
        if (! stack) ++failures;
        std::cout << (stack ? "  PASS  " : "  FAIL  ")
                  << juce::String ("3 VCOs stack up").paddedRight (' ', 34).toStdString()
                  << " oneRms=" << juce::String (one.rms, 4).toStdString()
                  << " threeRms=" << juce::String (three.rms, 4).toStdString() << "\n";

        // ring modulation must change the timbre
        const auto ringOff = renderNote ([&] (HaosHubProcessor& p)
        {
            setParam (p, pid::osc1Level, 0.7f); setParam (p, pid::osc2Level, 0.7f);
            setParam (p, pid::osc2Detune, 7.0f); setParam (p, pid::ringMod, 0.0f);
        });
        const auto ringOn = renderNote ([&] (HaosHubProcessor& p)
        {
            setParam (p, pid::osc1Level, 0.7f); setParam (p, pid::osc2Level, 0.7f);
            setParam (p, pid::osc2Detune, 7.0f); setParam (p, pid::ringMod, 1.0f);
        });
        const bool ring = std::abs (ringOn.rms - ringOff.rms) > ringOff.rms * 0.02f;
        if (! ring) ++failures;
        std::cout << (ring ? "  PASS  " : "  FAIL  ")
                  << juce::String ("ring mod alters timbre").paddedRight (' ', 34).toStdString()
                  << " offRms=" << juce::String (ringOff.rms, 4).toStdString()
                  << " onRms=" << juce::String (ringOn.rms, 4).toStdString() << "\n";

        // LFO -> filter must move the tone
        // The cutoff must sweep ACROSS the fundamental (A2 = 110 Hz) to change the
        // level: a saw's energy sits at its fundamental, so sweeping only above it
        // changes timbre while leaving RMS almost untouched. Key tracking is
        // disabled here so the swept range is predictable.
        const auto lfoOff = renderNote ([&] (HaosHubProcessor& p)
        {
            setParam (p, pid::osc1Level, 0.9f); setParam (p, pid::cutoff, 200.0f);
            setParam (p, pid::modKeyTrack, 0.0f);
            setParam (p, pid::modLfoFilter, 0.0f);
        });
        const auto lfoOn = renderNote ([&] (HaosHubProcessor& p)
        {
            setParam (p, pid::osc1Level, 0.9f); setParam (p, pid::cutoff, 200.0f);
            setParam (p, pid::modKeyTrack, 0.0f);
            setParam (p, pid::lfoRate, 4.0f); setParam (p, pid::lfoDepth, 1.0f);
            setParam (p, pid::modLfoFilter, 1.0f);
        });
        // A sweep averages out to roughly the static level, so compare the spread
        // of per-block RMS instead of the overall RMS.
        const bool lfoWorks = lfoOn.spread > lfoOff.spread * 3.0f;
        if (! lfoWorks) ++failures;
        std::cout << (lfoWorks ? "  PASS  " : "  FAIL  ")
                  << juce::String ("LFO > filter modulates").paddedRight (' ', 34).toStdString()
                  << " offSpread=" << juce::String (lfoOff.spread, 5).toStdString()
                  << " onSpread=" << juce::String (lfoOn.spread, 5).toStdString() << "\n";
    }

    // --- 6. effects actually change the signal --------------------------------
    {
        auto render = [&] (bool withReverb)
        {
            HaosHubProcessor p;
            p.prepareToPlay (sr, bs);
            setParam (p, pid::instrument, 1.0f);
            setParam (p, pid::fxReverbMix, withReverb ? 0.9f : 0.0f);
            p.sequencer.start();
            return measure (p, 120, bs);
        };
        const auto dry = render (false), wet = render (true);
        const bool ok = std::abs (wet.rms - dry.rms) > 1.0e-4f;
        if (! ok) ++failures;
        std::cout << (ok ? "  PASS  " : "  FAIL  ")
                  << juce::String ("reverb alters the signal").paddedRight (' ', 34).toStdString()
                  << " dryRms=" << juce::String (dry.rms, 4).toStdString()
                  << " wetRms=" << juce::String (wet.rms, 4).toStdString() << "\n";
    }

    // --- 7. the preset catalog loads and its patches actually sound ----------
    {
        HaosHubProcessor probe;
        probe.prepareToPlay (sr, bs);
        const auto& all = probe.library.getPresets();

        const bool loaded = all.size() > 100;
        if (! loaded) ++failures;
        std::cout << (loaded ? "  PASS  " : "  FAIL  ")
                  << juce::String ("preset catalog loads").paddedRight (' ', 34).toStdString()
                  << " presets=" << all.size() << "\n";

        // Apply a spread of real synth patches and confirm each makes sound.
        int tried = 0, silent = 0;
        for (int i = 0; i < all.size() && tried < 24; i += juce::jmax (1, all.size() / 24))
        {
            const auto& pr = all.getReference (i);
            if (pr.isDrumPattern()) continue;

            HaosHubProcessor p;
            p.prepareToPlay (sr, bs);
            setParam (p, pid::instrument, 0.0f);
            p.sequencer.stop (p.drums);
            p.sequencer.clear();
            if (! haos::PresetLibrary::applyToState (pr, p.apvts))
                continue;

            ++tried;
            // 120 blocks ~ 1.4 s: some FX patches have attacks approaching a second.
            auto r = measure (p, 120, bs, [] (juce::MidiBuffer& m, int b)
            {
                if (b == 0) m.addEvent (juce::MidiMessage::noteOn (1, 45, 0.9f), 0);
            });
            if (r.peak < 0.001f) { ++silent; std::cout << "        silent: " << pr.name.toStdString() << "\n"; }
        }

        const bool audible = tried > 0 && silent == 0;
        if (! audible) ++failures;
        std::cout << (audible ? "  PASS  " : "  FAIL  ")
                  << juce::String ("catalog patches make sound").paddedRight (' ', 34).toStdString()
                  << " tried=" << tried << " silent=" << silent << "\n";
    }

    std::cout << "\n" << (failures == 0 ? "ALL AUDIO CHECKS PASSED\n"
                                        : juce::String (failures).toStdString() + " CHECK(S) FAILED\n");
    return failures == 0 ? 0 : 1;
}
