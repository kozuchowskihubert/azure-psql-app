#pragma once

#include <JuceHeader.h>
#include <array>
#include <atomic>
#include "DrumMachine.h"

namespace haos
{

/** 16-step drum sequencer.

    Steps live in one atomic bitmask per lane, so the UI can edit them while the
    audio thread reads with no lock and no allocation.

    Timing is sample-accurate: rather than firing every step at the start of a
    block, process() splits the block at step boundaries, otherwise hits would
    quantise to the buffer size and the groove would drift audibly at small BPMs. */
class Sequencer
{
public:
    static constexpr int NumSteps = 16;
    static constexpr int NumLanes = DrumMachine::NumVoices;   // kick, snare, hatC, hatO, clap

    //== Transport =============================================================
    void prepare (double sampleRate)
    {
        sr = sampleRate > 0.0 ? sampleRate : 44100.0;
        recalc();
        counter = 0.0;
        currentStep = 0;
    }

    void setBpm (double newBpm)
    {
        bpm = juce::jlimit (40.0, 300.0, newBpm);
        recalc();
    }
    double getBpm() const noexcept { return bpm; }

    void start()
    {
        currentStep = 0;
        counter = 0.0;
        playing = true;
    }

    void stop (DrumMachine& drums)
    {
        playing = false;
        drums.allNotesOff();
        displayStep = -1;
    }

    bool isPlaying()      const noexcept { return playing.load(); }
    int  getDisplayStep() const noexcept { return displayStep.load(); }

    //== Pattern ===============================================================
    void setStep (int lane, int step, bool on)
    {
        if (! juce::isPositiveAndBelow (lane, NumLanes) || ! juce::isPositiveAndBelow (step, NumSteps))
            return;

        const uint32_t bit = 1u << step;
        auto& m = lanes[(size_t) lane];
        uint32_t expected = m.load();
        while (! m.compare_exchange_weak (expected, on ? (expected | bit) : (expected & ~bit)))
        {}
    }

    bool getStep (int lane, int step) const
    {
        if (! juce::isPositiveAndBelow (lane, NumLanes) || ! juce::isPositiveAndBelow (step, NumSteps))
            return false;
        return (lanes[(size_t) lane].load() & (1u << step)) != 0;
    }

    void clear()
    {
        for (auto& m : lanes)
            m.store (0);
    }

    //== State (for save/restore) =============================================
    uint32_t getLaneMask (int lane) const
    {
        return juce::isPositiveAndBelow (lane, NumLanes) ? lanes[(size_t) lane].load() : 0u;
    }

    void setLaneMask (int lane, uint32_t mask)
    {
        if (juce::isPositiveAndBelow (lane, NumLanes))
            lanes[(size_t) lane].store (mask);
    }

    bool isEmpty() const
    {
        for (const auto& m : lanes)
            if (m.load() != 0)
                return false;
        return true;
    }

    /** A default four-on-the-floor groove so the first press of Play makes sound. */
    void loadDefaultPattern()
    {
        clear();
        for (int s = 0; s < NumSteps; s += 4)  setStep (DrumMachine::Kick, s, true);      // 1 5 9 13
        setStep (DrumMachine::Snare, 4, true); setStep (DrumMachine::Snare, 12, true);    // backbeat
        for (int s = 2; s < NumSteps; s += 4)  setStep (DrumMachine::HatClosed, s, true); // offbeats
        setStep (DrumMachine::HatOpen, 14, true);
    }

    /** Loads a haos.fm drum pattern. Two shapes exist in the wild:
        { kick: [1,0,..], snare: [...] } — one array per lane — and the factory
        drum presets' [ {note:"C2", active:true, accent, slide}, ... ] — sixteen
        step objects whose GM-flavoured note picks the lane (array index = step). */
    void loadPattern (const juce::var& pattern)
    {
        clear();

        if (auto* arr = pattern.getArray())
        {
            for (int i = 0; i < juce::jmin (NumSteps, arr->size()); ++i)
            {
                auto* st = (*arr)[i].getDynamicObject();
                if (st == nullptr || ! (bool) st->getProperty ("active"))
                    continue;
                const int lane = laneForNote (st->getProperty ("note"));
                if (lane >= 0)
                    setStep (lane, i, true);
            }
            return;
        }

        auto* obj = pattern.getDynamicObject();
        if (obj == nullptr)
            return;

        for (const auto& prop : obj->getProperties())
        {
            const int lane = laneFor (prop.name.toString());
            if (lane < 0)
                continue;

            if (auto* steps = prop.value.getArray())
                for (int i = 0; i < juce::jmin (NumSteps, steps->size()); ++i)
                    if ((int) (*steps)[i] > 0)
                        setStep (lane, i, true);
        }
    }

    /** GM-style drum note -> lane. Accepts a note NAME ("C2", "F#2" — the shape
        the factory drum presets use) or a raw MIDI number; only the pitch class
        matters. Voices we don't have fold to their nearest cousin (rim -> clap,
        toms -> snare, pedal hat -> closed, ride -> open hat). */
    static int laneForNote (const juce::var& note)
    {
        int pc = -1;
        if (note.isInt() || note.isInt64() || note.isDouble())
            pc = ((int) note) % 12;
        else
        {
            const auto s = note.toString().trim().toUpperCase();
            if (s.isEmpty())
                return -1;
            static const char* names[] = { "C#", "D#", "F#", "G#", "A#",
                                           "C", "D", "E", "F", "G", "A", "B" };
            static const int   pcs[]   = { 1, 3, 6, 8, 10, 0, 2, 4, 5, 7, 9, 11 };
            for (int i = 0; i < 12; ++i)
                if (s.startsWith (names[i]))
                {
                    pc = pcs[i];
                    break;
                }
            if (pc < 0)
                return -1;
        }
        switch (pc)
        {
            case 0:  return DrumMachine::Kick;        // C   (36 kick)
            case 1:  return DrumMachine::Clap;        // C#  (37 rimshot)
            case 2:  return DrumMachine::Snare;       // D   (38 snare)
            case 3:  return DrumMachine::Clap;        // D#  (39 clap)
            case 4:  return DrumMachine::Snare;       // E   (40 snare 2)
            case 5:  return DrumMachine::Snare;       // F   (41 floor tom)
            case 6:  return DrumMachine::HatClosed;   // F#  (42 closed hat)
            case 7:  return DrumMachine::Snare;       // G   (43 tom)
            case 8:  return DrumMachine::HatClosed;   // G#  (44 pedal hat)
            case 9:  return DrumMachine::Snare;       // A   (45 low tom)
            case 10: return DrumMachine::HatOpen;     // A#  (46 open hat)
            case 11: return DrumMachine::HatOpen;     // B   (47 tom / 59 ride)
            default: return -1;
        }
    }

    static int laneFor (const juce::String& key)
    {
        const auto k = key.toLowerCase();
        if (k.startsWith ("kick"))  return DrumMachine::Kick;
        if (k.startsWith ("snare")) return DrumMachine::Snare;
        if (k.startsWith ("clap"))  return DrumMachine::Clap;
        if (k.contains ("open"))    return DrumMachine::HatOpen;
        if (k.startsWith ("hat"))   return DrumMachine::HatClosed;
        return -1;
    }

    static const char* laneName (int lane)
    {
        switch (lane)
        {
            case DrumMachine::Kick:      return "KICK";
            case DrumMachine::Snare:     return "SNARE";
            case DrumMachine::HatClosed: return "HAT";
            case DrumMachine::HatOpen:   return "OPEN HAT";
            case DrumMachine::Clap:      return "CLAP";
            default:                     return "?";
        }
    }

    //== Audio =================================================================
    void process (DrumMachine& drums, juce::AudioBuffer<float>& buffer,
                  int startSample, int numSamples)
    {
        if (! playing.load())
        {
            drums.renderAdding (buffer, startSample, numSamples);   // let tails ring out
            return;
        }

        int done = 0;
        while (done < numSamples)
        {
            if (counter <= 0.0)
            {
                fire (drums, currentStep);
                displayStep = currentStep;
                currentStep = (currentStep + 1) % NumSteps;
                counter += samplesPerStep;
            }

            const int chunk = juce::jlimit (1, numSamples - done, (int) std::ceil (counter));
            drums.renderAdding (buffer, startSample + done, chunk);
            counter -= chunk;
            done    += chunk;
        }
    }

private:
    void recalc() noexcept
    {
        // 16th notes
        samplesPerStep = (60.0 / bpm) * 0.25 * sr;
    }

    void fire (DrumMachine& drums, int step)
    {
        for (int lane = 0; lane < NumLanes; ++lane)
            if (lanes[(size_t) lane].load() & (1u << step))
                drums.trigger ((DrumMachine::Voice) lane, 1.0f);
    }

    std::array<std::atomic<uint32_t>, NumLanes> lanes {};
    std::atomic<bool> playing { false };
    std::atomic<int>  displayStep { -1 };

    double sr = 44100.0, bpm = 128.0, samplesPerStep = 0.0, counter = 0.0;
    int    currentStep = 0;
};

} // namespace haos
