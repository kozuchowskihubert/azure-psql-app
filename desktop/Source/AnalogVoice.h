#pragma once

#include <JuceHeader.h>
#include <cmath>

namespace haos
{

//==============================================================================
/** One VCO's settings. The 2600 gives each oscillator its own waveform, coarse
    octave, fine tune and level, rather than a single "osc 2 mix" blend. */
struct OscParams
{
    int   shape  = 0;       // 0 saw, 1 pulse, 2 triangle, 3 sine
    int   octave = 0;       // -3..+3
    float detune = 0.0f;    // semitones, fine tune
    float level  = 0.0f;    // 0..1
    float pulseWidth = 0.5f;
};

/** Modulation routing, mirroring the haos.fm ARP 2600's matrix. Depths are 0..1
    here rather than the web engine's 0..100. */
struct ModMatrix
{
    float env1ToFilter    = 0.50f;
    float env1ToPitch     = 0.0f;
    float lfoToFilter     = 0.0f;
    float lfoToPitch      = 0.0f;
    float lfoToAmp        = 0.0f;   // tremolo
    float lfoToPwm        = 0.0f;
    float keyTrackToFilter= 0.50f;
    float velToFilter     = 0.30f;
    float velToAmp        = 0.50f;
    float shToFilter      = 0.0f;   // sample & hold -> cutoff
    float shToPitch       = 0.0f;
};

/** Lock-free snapshot of the engine parameters, refreshed once per audio block.

    The architecture follows the ARP 2600 rather than a simple two-oscillator
    subtractive voice: three VCOs, a ring modulator, noise, an LFO, sample &
    hold, two envelopes, and a patchable modulation matrix feeding pitch, the
    filter, amplitude and pulse width. */
struct EngineParams
{
    OscParams osc1 { 0, 0,  0.0f, 0.80f, 0.5f };
    OscParams osc2 { 0, 0,  0.0f, 0.00f, 0.5f };
    OscParams osc3 { 0, -1, 0.0f, 0.00f, 0.5f };

    float subLevel   = 0.0f;    // 0..1, one octave below osc1
    float noiseLevel = 0.0f;    // 0..1
    float ringModMix = 0.0f;    // 0..1, osc1 x osc2 blended into the mix
    bool  osc2Sync   = false;   // hard-sync osc2 to osc1

    float cutoff     = 1000.0f; // Hz, base cutoff
    float resonance  = 0.3f;    // 0..1
    float envMod     = 0.5f;    // filter-envelope depth, 0..1 (0..6 octaves)
    float drive      = 1.0f;    // ladder drive, >= 1

    float glide      = 0.0f;    // portamento time in seconds
    int   lfoShape   = 3;       // defaults to sine
    float lfoRate    = 0.0f;    // Hz
    float lfoDepth   = 0.0f;    // 0..1 master LFO depth
    float shRate     = 8.0f;    // sample & hold clock, Hz

    ModMatrix mod;

    juce::ADSR::Parameters amp { 0.005f, 0.200f, 0.70f, 0.250f };
    juce::ADSR::Parameters flt { 0.002f, 0.250f, 0.00f, 0.200f };
};

//==============================================================================
/** Band-limited oscillator (PolyBLEP) — saw / pulse / triangle / sine. */
class PolyBlepOsc
{
public:
    void prepare (double sr) noexcept    { sampleRate = sr > 0.0 ? sr : 44100.0; }
    void reset() noexcept                { phase = 0.0; triState = 0.0; }

    void setFrequency (double hz) noexcept
    {
        inc = juce::jlimit (0.0, 0.45, hz / sampleRate);
    }

    float next (int shape, double pulseWidth = 0.5) noexcept
    {
        const double t = phase, dt = inc;
        double out = 0.0;

        switch (shape)
        {
            case 1: // pulse
            {
                out = (t < pulseWidth) ? 1.0 : -1.0;
                out += blep (t, dt);
                double t2 = t - pulseWidth;
                if (t2 < 0.0) t2 += 1.0;
                out -= blep (t2, dt);
                break;
            }
            case 2: // triangle — leaky-integrated square
            {
                double sq = (t < 0.5) ? 1.0 : -1.0;
                sq += blep (t, dt);
                double t2 = t + 0.5;
                if (t2 >= 1.0) t2 -= 1.0;
                sq -= blep (t2, dt);
                triState = (triState + 4.0 * dt * sq) * 0.9995;
                out = triState;
                break;
            }
            case 3: // sine
                out = std::sin (juce::MathConstants<double>::twoPi * t);
                break;

            default: // saw
                out = 2.0 * t - 1.0;
                out -= blep (t, dt);
                break;
        }

        phase += inc;
        if (phase >= 1.0) phase -= 1.0;

        return (float) out;
    }

private:
    /** PolyBLEP residual that rounds off the discontinuity, killing most aliasing. */
    static double blep (double t, double dt) noexcept
    {
        if (dt <= 0.0) return 0.0;
        if (t < dt)        { t /= dt;            return t + t - t * t - 1.0; }
        if (t > 1.0 - dt)  { t = (t - 1.0) / dt; return t * t + t + t + 1.0; }
        return 0.0;
    }

    double sampleRate = 44100.0, phase = 0.0, inc = 0.0, triState = 0.0;
};

//==============================================================================
/** Four-pole Moog-style ladder, TPT/zero-delay form, with a saturated feedback
    path — same approach as the SvfBP in DrumMachine.h.

    This replaces juce::dsp::LadderFilter, which could not be driven correctly
    here: its processSample() reads coefficients that only its private
    updateSmoothers() writes, and that is called solely from process(). Calling
    processSample() directly therefore left cutoff and resonance permanently at
    whatever was in the uninitialised members — every filter control was inert.
    Owning the coefficients also removes JUCE's fixed 50 ms parameter ramp, which
    would smear exactly the fast filter envelope a 303-style patch depends on. */
class Ladder
{
public:
    void prepare (double sampleRate) noexcept
    {
        sr = sampleRate > 0.0 ? sampleRate : 44100.0;
        reset();
        setCutoffHz (1000.0f);
        setResonance (0.0f);
    }

    void reset() noexcept
    {
        for (auto& v : z) v = 0.0f;
        last = 0.0f;
    }

    void setCutoffHz (float hz) noexcept
    {
        const float nyq = (float) (sr * 0.49);
        hz = juce::jlimit (20.0f, nyq, hz);

        // TPT one-pole coefficient, pre-warped so the cutoff lands where asked.
        const float wd = juce::MathConstants<float>::twoPi * hz;
        const float T  = 1.0f / (float) sr;
        const float wa = (2.0f / T) * std::tan (wd * T * 0.5f);
        const float gg = wa * T * 0.5f;
        G = gg / (1.0f + gg);
    }

    /** 0..1, where 1 is the edge of self-oscillation.

        The mapping is deliberately quadratic: the old linear r*4 hit k=1.2 at
        the DEFAULT 0.3 and k=3.3 on typical acid patches — screaming whistle
        territory ("resonance at 200%") that buried the oscillator timbre. Now
        0.3 -> 0.32 (clean), 0.83 -> 2.4 (juicy 303), 1.0 -> 3.5 (near self-osc). */
    void setResonance (float r) noexcept
    {
        r = juce::jlimit (0.0f, 1.0f, r);
        k = r * r * 3.5f;
    }

    /** >= 1. Pre-gain into the saturator, so pushing it thickens rather than
        just getting louder. */
    void setDrive (float d) noexcept
    {
        drive = juce::jmax (1.0f, d);
    }

    float processSample (float x) noexcept
    {
        // Feedback taken from the previous output, with the classic (1 + k)
        // gain compensation so resonance does not thin the low end out.
        float u = x * drive - k * last;
        u = std::tanh (u);                       // ladder saturation

        for (auto& s : z)
        {
            const float v  = (u - s) * G;
            const float lp = v + s;
            s  = lp + v;
            u  = lp;
        }

        last = u;
        return juce::jlimit (-4.0f, 4.0f, u);    // guard against blow-up
    }

private:
    double sr = 44100.0;
    float  G = 0.5f, k = 0.0f, drive = 1.0f, last = 0.0f;
    float  z[4] { 0.0f, 0.0f, 0.0f, 0.0f };
};

//==============================================================================
struct AnalogSound : public juce::SynthesiserSound
{
    bool appliesToNote (int) override    { return true; }
    bool appliesToChannel (int) override { return true; }
};

//==============================================================================
/** Two-oscillator analog voice: PolyBLEP oscs + sub + noise -> Moog ladder LPF24,
    with a dedicated filter envelope, amp ADSR, portamento and drive. */
class AnalogVoice : public juce::SynthesiserVoice
{
public:
    explicit AnalogVoice (const EngineParams& p) : params (p) {}

    bool canPlaySound (juce::SynthesiserSound* s) override
    {
        return dynamic_cast<AnalogSound*> (s) != nullptr;
    }

    void setCurrentPlaybackSampleRate (double sr) override
    {
        juce::SynthesiserVoice::setCurrentPlaybackSampleRate (sr);
        if (sr <= 0.0)
            return;

        osc1.prepare (sr);
        osc2.prepare (sr);
        osc3.prepare (sr);
        sub .prepare (sr);
        ampEnv.setSampleRate (sr);
        fltEnv.setSampleRate (sr);

        ladder.prepare (sr);
    }

    void startNote (int midiNote, float velocity, juce::SynthesiserSound*, int) override
    {
        targetHz = juce::MidiMessage::getMidiNoteInHertz (midiNote);

        // First note (or glide off) jumps straight to pitch; otherwise slide into it.
        if (currentHz <= 0.0 || params.glide <= 0.0f)
            currentHz = targetHz;

        level = juce::jmax (0.05f, velocity);

        ampEnv.setParameters (params.amp);
        fltEnv.setParameters (params.flt);
        ampEnv.noteOn();
        fltEnv.noteOn();

        // Oscillators stay free-running — resetting phase on every note sounds digital.
        sub.reset();
    }

    void stopNote (float, bool allowTailOff) override
    {
        if (allowTailOff)
        {
            ampEnv.noteOff();
            fltEnv.noteOff();
        }
        else
        {
            ampEnv.reset();
            fltEnv.reset();
            clearCurrentNote();
        }
    }

    void pitchWheelMoved (int) override {}
    void controllerMoved (int, int) override {}

private:
    /** LFO shapes matching the oscillator shape indices: saw / square / tri / sine. */
    static float lfoValue (int shape, double phase) noexcept
    {
        switch (shape)
        {
            case 0:  return (float) (2.0 * phase - 1.0);                       // saw
            case 1:  return phase < 0.5 ? 1.0f : -1.0f;                        // square
            case 2:  return (float) (4.0 * std::abs (phase - 0.5) - 1.0);      // triangle
            default: return (float) std::sin (juce::MathConstants<double>::twoPi * phase);
        }
    }

public:

    void renderNextBlock (juce::AudioBuffer<float>& out, int startSample, int numSamples) override
    {
        if (! ampEnv.isActive())
            return;

        const double sr = getSampleRate();
        if (sr <= 0.0)
            return;

        const double glideCoeff = params.glide > 0.0f
            ? std::exp (-1.0 / (juce::jmax (1.0e-4, (double) params.glide) * sr))
            : 0.0;

        ladder.setResonance (juce::jlimit (0.0f, 0.95f, params.resonance));
        ladder.setDrive     (juce::jmax (1.0f, params.drive));

        const auto& m = params.mod;
        const float nyquistish = (float) (sr * 0.45);
        const int   numCh      = out.getNumChannels();

        // Per-oscillator pitch ratios: coarse octave plus fine detune.
        auto ratioOf = [] (const OscParams& o)
        {
            return std::pow (2.0, o.octave + o.detune / 12.0);
        };
        const double r1 = ratioOf (params.osc1),
                     r2 = ratioOf (params.osc2),
                     r3 = ratioOf (params.osc3);

        // Keyboard tracking is referenced to A440, as the web engine does.
        const float keyTrack = m.keyTrackToFilter
                             * (float) std::log2 (juce::jmax (20.0, targetHz) / 440.0);

        const float shDelta = (float) (juce::jmax (0.01f, params.shRate) / sr);

        for (int i = 0; i < numSamples; ++i)
        {
            // --- pitch (portamento) ---
            currentHz = glideCoeff > 0.0
                ? targetHz + (currentHz - targetHz) * glideCoeff
                : targetHz;

            // --- modulation sources -------------------------------------
            float lfo = 0.0f;
            if (params.lfoRate > 0.0f)
            {
                lfo = lfoValue (params.lfoShape, lfoPhase) * params.lfoDepth;
                lfoPhase += params.lfoRate / sr;
                while (lfoPhase >= 1.0) lfoPhase -= 1.0;
            }

            // Sample & hold: a fresh random value latched at the clock rate.
            shPhase += shDelta;
            if (shPhase >= 1.0f)
            {
                shPhase -= 1.0f;
                shValue = rng.nextFloat() * 2.0f - 1.0f;
            }

            const float fe = fltEnv.getNextSample();
            const float ae = ampEnv.getNextSample();

            // --- pitch modulation ---------------------------------------
            const float pitchOct = m.env1ToPitch * fe
                                 + m.lfoToPitch  * lfo
                                 + m.shToPitch   * shValue;
            const double pitchMul = pitchOct != 0.0f ? std::pow (2.0, pitchOct) : 1.0;
            const double base = currentHz * pitchMul;

            osc1.setFrequency (base * r1);
            osc2.setFrequency (base * r2);
            osc3.setFrequency (base * r3);
            sub .setFrequency (base * 0.5);

            // --- oscillators --------------------------------------------
            // PWM only affects pulse shapes; 0.5 +/- modulation, kept off the rails.
            const float pwm = m.lfoToPwm * lfo * 0.45f;
            const float o1 = osc1.next (params.osc1.shape, juce::jlimit (0.05f, 0.95f, params.osc1.pulseWidth + pwm));
            const float o2 = osc2.next (params.osc2.shape, juce::jlimit (0.05f, 0.95f, params.osc2.pulseWidth + pwm));
            const float o3 = osc3.next (params.osc3.shape, juce::jlimit (0.05f, 0.95f, params.osc3.pulseWidth + pwm));

            float s = o1 * params.osc1.level
                    + o2 * params.osc2.level
                    + o3 * params.osc3.level;

            // Ring modulator: the 2600 multiplies two oscillators, giving the
            // clangorous sum/difference tones it is known for.
            if (params.ringModMix > 0.0f)
                s += (o1 * o2) * params.ringModMix;

            s += sub.next (1) * params.subLevel;
            s += (rng.nextFloat() * 2.0f - 1.0f) * params.noiseLevel;

            // Keep the summed oscillator bank inside a sane range before the filter.
            s *= 0.5f;

            // --- cutoff at control rate: recomputing ladder coefficients every
            //     sample is wasteful, every 16 samples is inaudible and much cheaper.
            if (--cutoffCountdown <= 0)
            {
                cutoffCountdown = 16;

                const float octaves = params.envMod * 4.0f * fe * (0.5f + m.env1ToFilter)
                                    + m.lfoToFilter * lfo * 2.0f
                                    + m.shToFilter  * shValue * 2.0f
                                    + m.velToFilter * (level - 0.5f) * 2.0f
                                    + keyTrack;

                ladder.setCutoffHz (
                    juce::jlimit (20.0f, nyquistish, params.cutoff * std::pow (2.0f, octaves)));
            }

            s = ladder.processSample (s * level * 0.4f);

            // --- amplitude: envelope, velocity depth and tremolo ---------
            float amp = ae * (1.0f - m.velToAmp * (1.0f - level));
            if (m.lfoToAmp > 0.0f)
                amp *= 1.0f - m.lfoToAmp * 0.5f * (1.0f - lfo);

            s *= amp;

            for (int ch = 0; ch < numCh; ++ch)
                out.addSample (ch, startSample + i, s);
        }

        if (! ampEnv.isActive())
            clearCurrentNote();
    }

private:
    const EngineParams& params;

    PolyBlepOsc osc1, osc2, osc3, sub;
    juce::ADSR  ampEnv, fltEnv;
    Ladder      ladder;
    juce::Random rng;

    double currentHz = 0.0, targetHz = 0.0, lfoPhase = 0.0;
    float  shPhase = 0.0f, shValue = 0.0f;   // sample & hold
    float  level = 1.0f;
    int    cutoffCountdown = 0;
};

} // namespace haos
