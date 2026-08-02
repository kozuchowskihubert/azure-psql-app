#pragma once

#include <JuceHeader.h>
#include "Params.h"

namespace haos
{

//==============================================================================
/** LCD-style oscilloscope strip for the Browse page. Renders the actual VCO mix
    described by the current patch parameters (shape / level / detune of all
    three oscillators plus sub and noise), so turning a knob or loading a preset
    visibly changes the trace. Pure paint — the editor's animation timer advances
    `phase` and calls repaint(); the component owns no timer and no audio tap. */
class WaveformDisplay : public juce::Component
{
public:
    explicit WaveformDisplay (juce::AudioProcessorValueTreeState& s) : apvts (s)
    {
        setInterceptsMouseClicks (false, false);
    }

    float phase = 0.0f;    // advanced by the editor's timer for a slow scroll

    void paint (juce::Graphics& g) override
    {
        auto b = getLocalBounds().toFloat();

        // LCD well
        g.setColour (juce::Colour (0xff0b0d10));
        g.fillRoundedRectangle (b, 6.0f);
        g.setColour (juce::Colour (0xff23262c));
        g.drawRoundedRectangle (b.reduced (0.5f), 6.0f, 1.0f);

        auto area = b.reduced (8.0f, 6.0f);

        // grid: centre line + quarter divisions
        g.setColour (juce::Colours::white.withAlpha (0.05f));
        for (int i = 1; i < 4; ++i)
        {
            const float gx = area.getX() + area.getWidth() * i / 4.0f;
            g.drawVerticalLine ((int) gx, area.getY(), area.getBottom());
        }
        g.setColour (juce::Colours::white.withAlpha (0.09f));
        g.drawHorizontalLine ((int) area.getCentreY(), area.getX(), area.getRight());

        // trace of the current oscillator mix
        const float l1 = raw (pid::osc1Level), l2 = raw (pid::osc2Level), l3 = raw (pid::osc3Level);
        const float sub = raw (pid::subLevel), noise = raw (pid::noiseLevel);
        const int   s1 = (int) raw (pid::osc1Shape), s2 = (int) raw (pid::osc2Shape), s3 = (int) raw (pid::osc3Shape);
        const float d2 = raw (pid::osc2Detune) * 0.02f, d3 = raw (pid::osc3Detune) * 0.15f;

        const float total = juce::jmax (0.25f, l1 + l2 + l3 + sub + noise * 0.5f);
        const float midY  = area.getCentreY();
        const float amp   = area.getHeight() * 0.42f;

        juce::Path trace;
        const int n = juce::jmax (32, (int) area.getWidth());
        for (int i = 0; i <= n; ++i)
        {
            const float x = area.getX() + area.getWidth() * i / (float) n;
            const float t = phase + 2.0f * i / (float) n;              // two cycles across

            float v = l1 * shape (s1, t)
                    + l2 * shape (s2, t * (1.0f + d2))
                    + l3 * shape (s3, t * (1.0f + d3))
                    + sub * shape (3, t * 0.5f);
            // deterministic pseudo-noise: stable per-x jitter, no flicker storm
            v += noise * 0.35f * std::sin (i * 12.9898f + std::floor (phase * 4.0f) * 78.233f);

            const float y = midY - amp * juce::jlimit (-1.0f, 1.0f, v / total);
            if (i == 0) trace.startNewSubPath (x, y);
            else        trace.lineTo (x, y);
        }

        const auto accent = juce::Colour (0xffff6b35);
        g.setColour (accent.withAlpha (0.25f));                        // glow pass
        g.strokePath (trace, juce::PathStrokeType (4.0f, juce::PathStrokeType::curved));
        g.setColour (accent);
        g.strokePath (trace, juce::PathStrokeType (1.6f, juce::PathStrokeType::curved));

        g.setColour (juce::Colours::white.withAlpha (0.28f));
        g.setFont (juce::FontOptions (9.0f, juce::Font::bold));
        g.drawText ("OSC MIX", getLocalBounds().reduced (10, 4),
                    juce::Justification::topLeft, false);
    }

private:
    float raw (const char* id) const
    {
        if (auto* p = apvts.getRawParameterValue (id))
            return p->load();
        return 0.0f;
    }

    /** 0 = Saw, 1 = Pulse, 2 = Triangle, 3 = Sine — mirrors the shapes combo. */
    static float shape (int kind, float t)
    {
        const float ph = t - std::floor (t);
        switch (kind)
        {
            case 0:  return 2.0f * ph - 1.0f;
            case 1:  return ph < 0.5f ? 1.0f : -1.0f;
            case 2:  return ph < 0.5f ? 4.0f * ph - 1.0f : 3.0f - 4.0f * ph;
            default: return std::sin (juce::MathConstants<float>::twoPi * ph);
        }
    }

    juce::AudioProcessorValueTreeState& apvts;
};

} // namespace haos
