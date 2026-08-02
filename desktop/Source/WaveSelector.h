#pragma once

#include <JuceHeader.h>

namespace haos
{

//==============================================================================
/** Segmented wave-shape picker (mockup style): four metal icon buttons — saw,
    pulse, triangle, sine — instead of a combo box. Bound to an
    AudioParameterChoice via ParameterAttachment, so preset loads and host
    automation light the right glyph and clicks are undoable host gestures. */
class WaveSelector : public juce::Component,
                     public juce::SettableTooltipClient
{
public:
    explicit WaveSelector (juce::RangedAudioParameter& param)
        : attach (param, [this] (float v)
                  {
                      current = juce::jlimit (0, 3, (int) std::lround (v));
                      repaint();
                  })
    {
        attach.sendInitialUpdate();
    }

    void paint (juce::Graphics& g) override
    {
        auto b = getLocalBounds().toFloat();

        // recessed strip the buttons sit in
        g.setColour (juce::Colour (0xff0c0d10));
        g.fillRoundedRectangle (b, 5.0f);
        g.setColour (juce::Colour (0xff2a2d34));
        g.drawRoundedRectangle (b.reduced (0.5f), 5.0f, 1.0f);

        const float cw = b.getWidth() / 4.0f;
        for (int i = 0; i < 4; ++i)
        {
            auto cell = juce::Rectangle<float> (b.getX() + i * cw, b.getY(), cw, b.getHeight())
                            .reduced (2.0f, 2.0f);
            const bool on = (i == current);

            if (on)
            {
                // lit metal button with an orange wash, mockup-style
                juce::Graphics::ScopedSaveState ss (g);
                juce::ColourGradient lit (juce::Colour (0xff3a2a1c), cell.getX(), cell.getY(),
                                          juce::Colour (0xff241a12), cell.getX(), cell.getBottom(), false);
                g.setGradientFill (lit);
                g.fillRoundedRectangle (cell, 4.0f);
            }
            else if (i == hover)
            {
                g.setColour (juce::Colours::white.withAlpha (0.05f));
                g.fillRoundedRectangle (cell, 4.0f);
            }

            if (on)
            {
                g.setColour (juce::Colour (0xffff6b35).withAlpha (0.9f));
                g.drawRoundedRectangle (cell.reduced (0.5f), 4.0f, 1.0f);
            }

            const auto gPath = glyph (i, cell.reduced (cw * 0.18f, cell.getHeight() * 0.3f));
            if (on)   // neon under-glow beneath the active glyph
            {
                g.setColour (juce::Colour (0xffff6b35).withAlpha (0.35f));
                g.strokePath (gPath, juce::PathStrokeType (4.0f, juce::PathStrokeType::curved,
                                                           juce::PathStrokeType::rounded));
            }
            g.setColour (on ? juce::Colour (0xffff6b35)
                            : juce::Colour (0xff8a8d93));
            g.strokePath (gPath, juce::PathStrokeType (1.6f, juce::PathStrokeType::curved,
                                                       juce::PathStrokeType::rounded));
        }
    }

    void mouseDown (const juce::MouseEvent& e) override
    {
        const int idx = juce::jlimit (0, 3, 4 * e.x / juce::jmax (1, getWidth()));
        attach.setValueAsCompleteGesture ((float) idx);
    }

    void mouseMove (const juce::MouseEvent& e) override
    {
        const int idx = juce::jlimit (0, 3, 4 * e.x / juce::jmax (1, getWidth()));
        if (idx != hover) { hover = idx; repaint(); }
    }

    void mouseExit (const juce::MouseEvent&) override { hover = -1; repaint(); }

private:
    /** 0 = Saw, 1 = Pulse, 2 = Triangle, 3 = Sine — matches the choice param. */
    static juce::Path glyph (int kind, juce::Rectangle<float> r)
    {
        juce::Path p;
        const float x = r.getX(), y = r.getY(), w = r.getWidth(), h = r.getHeight();
        switch (kind)
        {
            case 0:                                    // saw: ramp up, drop
                p.startNewSubPath (x, y + h);
                p.lineTo (x + w * 0.5f, y);
                p.lineTo (x + w * 0.5f, y + h);
                p.lineTo (x + w, y);
                break;
            case 1:                                    // pulse: square step
                p.startNewSubPath (x, y + h);
                p.lineTo (x, y);
                p.lineTo (x + w * 0.5f, y);
                p.lineTo (x + w * 0.5f, y + h);
                p.lineTo (x + w, y + h);
                p.lineTo (x + w, y);
                break;
            case 2:                                    // triangle
                p.startNewSubPath (x, y + h);
                p.lineTo (x + w * 0.25f, y);
                p.lineTo (x + w * 0.75f, y + h);
                p.lineTo (x + w, y);
                break;
            default:                                   // sine: hump up, hump down
                p.startNewSubPath (x, y + h * 0.5f);
                p.quadraticTo (x + w * 0.25f, y - h * 0.55f, x + w * 0.5f, y + h * 0.5f);
                p.quadraticTo (x + w * 0.75f, y + h * 1.55f, x + w,        y + h * 0.5f);
                break;
        }
        return p;
    }

    juce::ParameterAttachment attach;
    int current = 0, hover = -1;

    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR (WaveSelector)
};

} // namespace haos
