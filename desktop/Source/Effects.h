#pragma once

#include <JuceHeader.h>

namespace haos
{

struct FxParams
{
    float drive         = 1.0f;    // 1..20, 1 = clean
    float chorusMix     = 0.0f;    // 0..1
    float chorusRate    = 1.2f;    // Hz
    float chorusDepth   = 0.3f;    // 0..1
    float delayMix      = 0.0f;    // 0..1
    float delayTimeMs   = 375.0f;
    float delayFeedback = 0.35f;   // 0..0.95
    float reverbMix     = 0.0f;    // 0..1
    float reverbSize    = 0.6f;    // 0..1
};

/** Master effect chain: drive -> chorus -> delay -> reverb.

    Everything is prepared once and processed in place; nothing allocates while
    running. Each wet/dry blend is done explicitly so a mix of 0 is bit-identical
    to bypass rather than merely quiet. */
class Effects
{
public:
    FxParams params;

    void prepare (double sampleRate, int maxBlockSize, int numChannels)
    {
        sr = sampleRate > 0.0 ? sampleRate : 44100.0;

        juce::dsp::ProcessSpec spec { sr,
                                      (juce::uint32) juce::jmax (1, maxBlockSize),
                                      (juce::uint32) juce::jmax (1, numChannels) };

        chorus.prepare (spec);
        chorus.setCentreDelay (7.0f);
        chorus.setFeedback (0.0f);

        delayLine.prepare (spec);
        delayLine.setMaximumDelayInSamples ((int) (sr * 1.05));   // 1 s ceiling
        delayLine.reset();

        reverb.setSampleRate (sr);

        scratch.setSize (juce::jmax (1, numChannels), juce::jmax (1, maxBlockSize), false, true, true);
    }

    void reset()
    {
        delayLine.reset();
        reverb.reset();
        chorus.reset();
    }

    void process (juce::AudioBuffer<float>& buffer)
    {
        const int numCh  = buffer.getNumChannels();
        const int numSmp = buffer.getNumSamples();
        if (numCh == 0 || numSmp == 0)
            return;

        // ---- drive -------------------------------------------------------
        if (params.drive > 1.001f)
        {
            const float k = params.drive;
            // Normalise the SMALL-SIGNAL gain (k), not the full-scale gain. Using
            // 1/tanh(k) made the very first step off bypass jump ~2.4 dB.
            const float makeup = 1.0f / k;
            for (int ch = 0; ch < numCh; ++ch)
            {
                auto* d = buffer.getWritePointer (ch);
                for (int i = 0; i < numSmp; ++i)
                    d[i] = std::tanh (d[i] * k) * makeup;
            }
        }

        // ---- chorus ------------------------------------------------------
        if (params.chorusMix > 0.001f)
        {
            chorus.setRate (juce::jlimit (0.01f, 20.0f, params.chorusRate));
            chorus.setDepth (juce::jlimit (0.0f, 1.0f, params.chorusDepth));
            chorus.setMix (juce::jlimit (0.0f, 1.0f, params.chorusMix));

            juce::dsp::AudioBlock<float> block (buffer);
            chorus.process (juce::dsp::ProcessContextReplacing<float> (block));
        }

        // ---- delay -------------------------------------------------------
        if (params.delayMix > 0.001f)
        {
            const float delaySamples = juce::jlimit (1.0f, (float) (sr * 1.0),
                                                     params.delayTimeMs * 0.001f * (float) sr);
            delayLine.setDelay (delaySamples);

            const float fb  = juce::jlimit (0.0f, 0.95f, params.delayFeedback);
            const float mix = juce::jlimit (0.0f, 1.0f, params.delayMix);

            for (int ch = 0; ch < numCh; ++ch)
            {
                auto* d = buffer.getWritePointer (ch);
                for (int i = 0; i < numSmp; ++i)
                {
                    const float wet = delayLine.popSample (ch);
                    delayLine.pushSample (ch, d[i] + wet * fb);
                    d[i] = d[i] * (1.0f - mix) + wet * mix;
                }
            }
        }

        // ---- reverb ------------------------------------------------------
        if (params.reverbMix > 0.001f)
        {
            juce::Reverb::Parameters rp;
            rp.roomSize   = juce::jlimit (0.0f, 1.0f, params.reverbSize);
            rp.damping    = 0.45f;
            rp.width      = 1.0f;
            rp.wetLevel   = juce::jlimit (0.0f, 1.0f, params.reverbMix);
            rp.dryLevel   = 1.0f - rp.wetLevel * 0.5f;
            rp.freezeMode = 0.0f;
            reverb.setParameters (rp);

            if (numCh >= 2)
                reverb.processStereo (buffer.getWritePointer (0), buffer.getWritePointer (1), numSmp);
            else
                reverb.processMono (buffer.getWritePointer (0), numSmp);
        }
    }

private:
    juce::dsp::Chorus<float> chorus;
    juce::dsp::DelayLine<float, juce::dsp::DelayLineInterpolationTypes::Linear> delayLine { 96000 };
    juce::Reverb reverb;
    juce::AudioBuffer<float> scratch;
    double sr = 44100.0;
};

} // namespace haos
