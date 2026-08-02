#pragma once

#include <JuceHeader.h>
#include <array>
#include <cmath>
#include <vector>

namespace haos
{

//==============================================================================
// Small per-hit filters. Each drum hit owns its own state, so these stay tiny
// and trivially resettable rather than using the heavier juce::dsp objects.
//==============================================================================

struct OnePoleLP
{
    float z = 0.0f, a = 1.0f;
    void set (float hz, double sr) noexcept
    {
        a = 1.0f - std::exp (-2.0f * juce::MathConstants<float>::pi * hz / (float) sr);
        a = juce::jlimit (0.0f, 1.0f, a);
    }
    float process (float x) noexcept { z += a * (x - z); return z; }
    void reset() noexcept { z = 0.0f; }
};

struct OnePoleHP
{
    OnePoleLP lp;
    void set (float hz, double sr) noexcept { lp.set (hz, sr); }
    float process (float x) noexcept { return x - lp.process (x); }
    void reset() noexcept { lp.reset(); }
};

/** Topology-preserving state-variable filter (Cytomic). Used for the clap's
    resonant bandpass, where a one-pole is nowhere near steep enough at Q=10. */
struct SvfBP
{
    float a1 = 0, a2 = 0, a3 = 0, ic1 = 0, ic2 = 0;

    void set (float hz, float Q, double sr) noexcept
    {
        const float g = std::tan (juce::MathConstants<float>::pi * juce::jlimit (20.0f, (float) sr * 0.45f, hz) / (float) sr);
        const float k = 1.0f / juce::jmax (0.05f, Q);
        a1 = 1.0f / (1.0f + g * (g + k));
        a2 = g * a1;
        a3 = g * a2;
    }

    float process (float v0) noexcept
    {
        const float v3 = v0 - ic2;
        const float v1 = a1 * ic1 + a2 * v3;
        const float v2 = ic2 + a2 * ic1 + a3 * v3;
        ic1 = 2.0f * v1 - ic1;
        ic2 = 2.0f * v2 - ic2;
        return v1;   // bandpass tap
    }

    void reset() noexcept { ic1 = ic2 = 0.0f; }
};

//==============================================================================
/** Mirrors the parameter blocks in the haos.fm TR-909 / TR-808 engines. */
struct DrumParams
{
    // kick
    float kickPitch = 60.0f, kickDecay = 0.50f, kickTone = 0.5f, kickLevel = 1.0f;
    // snare
    float snareTune = 200.0f, snareTone = 0.5f, snareSnappy = 0.7f,
          snareDecay = 0.20f, snareLevel = 0.8f;
    // hats
    float hatTune = 0.5f, hatClosedDecay = 0.05f, hatOpenDecay = 0.30f, hatLevel = 0.6f;
    // clap
    float clapTone = 0.5f, clapDecay = 0.20f, clapLevel = 0.8f;
};

//==============================================================================
/** Native port of the haos.fm drum machines.

    The web engines build a fresh Web Audio graph per hit; here each hit is a
    slot in a fixed pool that renders itself sample by sample, so nothing
    allocates on the audio thread. The synthesis itself follows the JS exactly —
    same oscillator ratios, same envelope shapes, same filter corners. */
class DrumMachine
{
public:
    enum Voice { Kick = 0, Snare, HatClosed, HatOpen, Clap, NumVoices };

    /** true = TR-808 behaviour, false = TR-909. They differ most in the kick:
        the 909 sweeps to a fixed 40 Hz through a lowpass, the 808 sweeps from
        pitch*7 down to pitch through a waveshaper. */
    bool model808 = false;

    DrumParams params;

    void prepare (double sampleRate)
    {
        sr = sampleRate > 0.0 ? sampleRate : 44100.0;
        bus.reserve (4096);
        for (auto& h : hits)
            h.active = false;
    }

    void trigger (Voice voice, float velocity = 1.0f)
    {
        auto& h = allocate();
        h.start (voice, juce::jlimit (0.05f, 1.0f, velocity), params, model808, sr);
    }

    void renderAdding (juce::AudioBuffer<float>& out, int startSample, int numSamples)
    {
        const int numCh = out.getNumChannels();
        if (numCh == 0 || numSamples <= 0)
            return;

        // Sum the voices into a mono scratch first. Clipping each hit separately
        // does not bound the sum — N simultaneous hits still stack — so the soft
        // ceiling has to sit on the summed drum bus.
        bus.assign ((size_t) numSamples, 0.0f);

        for (auto& h : hits)
        {
            if (! h.active)
                continue;

            for (int i = 0; i < numSamples && h.active; ++i)
                bus[(size_t) i] += h.next (sr);
        }

        for (int i = 0; i < numSamples; ++i)
        {
            const float s = std::tanh (bus[(size_t) i] * 1.25f) * 0.8f;
            for (int ch = 0; ch < numCh; ++ch)
                out.addSample (ch, startSample + i, s);
        }
    }

    void allNotesOff()
    {
        for (auto& h : hits)
            h.active = false;
    }

private:
    //==========================================================================
    struct Hit
    {
        bool  active = false;
        Voice voice  = Kick;

        int   pos = 0, length = 0;
        float level = 1.0f;

        // envelopes / oscillators
        double phase = 0.0, phase2 = 0.0;
        float  freqStart = 100.0f, freqEnd = 40.0f, freqSweepSamples = 1.0f;
        float  ampCoeff = 0.999f, amp = 1.0f;
        bool   distort = false;

        std::array<double, 6> hatPhase {};
        float hatFreq[6] {};

        OnePoleLP lp;
        OnePoleHP hp;
        SvfBP     bp;
        juce::Random rng;

        // clap re-trigger bursts
        int   burstIndex = 0, nextBurst = 0;
        float burstGain = 1.0f;

        static constexpr float ratios[6] = { 2.0f, 3.0f, 4.16f, 5.43f, 6.79f, 8.21f };

        /** WebAudio's canonical makeDistortionCurve(amount). */
        static float shape (float x, float k) noexcept
        {
            constexpr float deg = juce::MathConstants<float>::pi / 180.0f;
            return ((3.0f + k) * x * 20.0f * deg)
                 / (juce::MathConstants<float>::pi + k * std::abs (x));
        }

        void start (Voice v, float velocity, const DrumParams& p, bool is808, double sr)
        {
            active = true; voice = v; pos = 0; phase = phase2 = 0.0;
            lp.reset(); hp.reset(); bp.reset();
            burstIndex = 0; nextBurst = 0; burstGain = 1.0f;
            distort = false;

            auto decayTo = [sr] (float decaySeconds) -> float
            {
                // exponentialRampToValueAtTime(0.001) over `decaySeconds`
                const float n = juce::jmax (1.0f, (float) (decaySeconds * sr));
                return std::pow (0.001f, 1.0f / n);
            };

            switch (v)
            {
                case Kick:
                {
                    level = p.kickLevel * velocity;
                    const float d = juce::jmax (0.02f, p.kickDecay);
                    length = (int) (d * sr);
                    ampCoeff = decayTo (d);

                    if (is808)
                    {
                        freqStart = juce::jmax (20.0f, p.kickPitch * 7.0f);
                        freqEnd   = juce::jmax (20.0f, p.kickPitch);
                        distort   = true;                       // 808 punch
                    }
                    else
                    {
                        freqStart = 150.0f * (p.kickPitch / 60.0f);
                        freqEnd   = 40.0f;
                        lp.set (150.0f + p.kickTone * 200.0f, sr);
                    }
                    freqSweepSamples = juce::jmax (1.0f, (float) (0.05 * sr));
                    break;
                }

                case Snare:
                {
                    level  = p.snareLevel * velocity;
                    const float d = juce::jmax (0.02f, p.snareDecay);
                    length = (int) (d * sr);
                    ampCoeff = decayTo (d);
                    freqStart = freqEnd = juce::jmax (20.0f, p.snareTune);
                    hp.set (juce::jmax (100.0f, 1000.0f * p.snareSnappy), sr);
                    break;
                }

                case HatClosed:
                case HatOpen:
                {
                    level = p.hatLevel * velocity;
                    const float d = juce::jmax (0.01f, v == HatClosed ? p.hatClosedDecay
                                                                      : p.hatOpenDecay);
                    length = (int) (d * sr);
                    ampCoeff = decayTo (d);

                    // The web engine used a 40 Hz fundamental highpassed at 7 kHz,
                    // which left the partials (80-330 Hz) almost entirely below the
                    // filter — the hats were near-silent. Use a proper metallic
                    // fundamental so the six partials land in the 1.8-7.4 kHz band a
                    // real 808/909 hat occupies, and highpass lower so they pass.
                    const float tuneMul = 0.75f + p.hatTune * 0.5f;   // 0..1.5 tune -> 0.75..1.5
                    for (int i = 0; i < 6; ++i)
                    {
                        hatFreq[i]  = 900.0f * ratios[i] * tuneMul;
                        hatPhase[i] = 0.0;
                    }
                    hp.set (3500.0f, sr);
                    break;
                }

                case Clap:
                {
                    level = p.clapLevel * velocity;
                    const float d = juce::jmax (0.05f, p.clapDecay);
                    length = (int) ((d + 0.06f) * sr);           // 3 bursts, 30 ms apart
                    ampCoeff = decayTo (d);
                    bp.set (1000.0f + p.clapTone * 2000.0f, 10.0f, sr);
                    nextBurst = 0;
                    break;
                }

                default: break;
            }

            amp = level;
        }

        float next (double sr) noexcept
        {
            if (! active)
                return 0.0f;

            float out = 0.0f;

            switch (voice)
            {
                case Kick:
                {
                    // geometric pitch sweep, matching exponentialRampToValueAtTime
                    const float t = juce::jmin (1.0f, (float) pos / freqSweepSamples);
                    const float f = freqStart * std::pow (freqEnd / freqStart, t);

                    out = (float) std::sin (juce::MathConstants<double>::twoPi * phase);
                    phase += f / sr;
                    if (phase >= 1.0) phase -= 1.0;

                    if (distort) out = shape (out, 10.0f);
                    else         out = lp.process (out);

                    out *= amp;
                    break;
                }

                case Snare:
                {
                    // two triangles at tune and tune*1.5
                    auto tri = [] (double ph) { return (float) (2.0 * std::abs (2.0 * (ph - std::floor (ph + 0.5))) - 1.0); };
                    const float tone = tri (phase) + tri (phase2);
                    phase  += freqStart / sr;          if (phase  >= 1.0) phase  -= 1.0;
                    phase2 += freqStart * 1.5 / sr;    if (phase2 >= 1.0) phase2 -= 1.0;

                    const float noise = hp.process (rng.nextFloat() * 2.0f - 1.0f);
                    out = (tone * 0.3f + noise) * amp;
                    break;
                }

                case HatClosed:
                case HatOpen:
                {
                    float sum = 0.0f;
                    for (int i = 0; i < 6; ++i)
                    {
                        sum += (hatPhase[i] < 0.5 ? 1.0f : -1.0f) / 6.0f;   // square
                        hatPhase[i] += hatFreq[i] / sr;
                        if (hatPhase[i] >= 1.0) hatPhase[i] -= 1.0;
                    }
                    out = hp.process (sum) * amp * 1.6f;
                    break;
                }

                case Clap:
                {
                    // three 50 ms noise bursts, 30 ms apart, then the filtered tail
                    if (burstIndex < 3 && pos >= nextBurst)
                    {
                        burstGain = 1.0f;
                        ++burstIndex;
                        nextBurst = (int) (burstIndex * 0.03 * sr);
                    }
                    burstGain *= 0.9994f;

                    const float noise = rng.nextFloat() * 2.0f - 1.0f;
                    out = bp.process (noise * burstGain) * amp * 1.05f;
                    break;
                }

                default: break;
            }

            amp *= ampCoeff;

            if (++pos >= length || amp < 1.0e-5f)
                active = false;

            return out * 0.62f;
        }
    };

    Hit& allocate()
    {
        for (auto& h : hits)
            if (! h.active)
                return h;

        // Steal the oldest-sounding slot rather than dropping the hit.
        auto* oldest = &hits[0];
        for (auto& h : hits)
            if (h.pos > oldest->pos)
                oldest = &h;
        return *oldest;
    }

    std::array<Hit, 24> hits;
    std::vector<float> bus;      // summing scratch, sized in prepare()
    double sr = 44100.0;
};

} // namespace haos
