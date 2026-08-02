#pragma once

#include <JuceHeader.h>
#include "Sequencer.h"

namespace haos
{

/** 16-step grid editor. Repaints on a timer so the playhead tracks the audio
    thread without the audio thread ever touching the UI. */
class StepGrid : public juce::Component,
                 private juce::Timer
{
public:
    explicit StepGrid (Sequencer& s) : seq (s)
    {
        startTimerHz (30);
    }

    void paint (juce::Graphics& g) override
    {
        const int lanes = Sequencer::NumLanes;
        const int steps = Sequencer::NumSteps;
        if (lanes == 0 || steps == 0)
            return;

        const float labelW = 78.0f;
        const float cellW  = (getWidth() - labelW) / (float) steps;
        const float cellH  = getHeight() / (float) lanes;
        const int   head   = seq.getDisplayStep();

        for (int lane = 0; lane < lanes; ++lane)
        {
            const float y = lane * cellH;

            g.setColour (juce::Colour (0xff8a8d93));
            g.setFont (juce::FontOptions (10.5f, juce::Font::bold));
            g.drawText (Sequencer::laneName (lane),
                        0, (int) y, (int) labelW - 8, (int) cellH,
                        juce::Justification::centredRight, true);

            for (int step = 0; step < steps; ++step)
            {
                juce::Rectangle<float> cell (labelW + step * cellW, y, cellW, cellH);
                cell.reduce (2.0f, 3.0f);

                const bool on      = seq.getStep (lane, step);
                const bool onBeat  = (step % 4) == 0;
                const bool playing = (step == head);

                // Signature TR-909 step colours for the four beat blocks
                const juce::Colour blockCols[] = { juce::Colour (0xffe0523a), juce::Colour (0xffe8802a),
                                                   juce::Colour (0xffe8c53a), juce::Colour (0xffe0e4eb) };
                const juce::Colour baseColor = blockCols[(step / 4) % 4];

                if (on)
                {
                    // Active step: glowing saturated pad with a top gradient
                    juce::ColourGradient padGrad (baseColor, cell.getX(), cell.getY(),
                                                  baseColor.darker (0.25f), cell.getX(), cell.getBottom(), false);
                    g.setGradientFill (padGrad);
                    g.fillRoundedRectangle (cell, 4.0f);

                    // Top LED light indicator with a real bloom (Serum-style)
                    juce::Point<float> ledCenter (cell.getCentreX(), cell.getY() + 4.0f);
                    {
                        juce::Graphics::ScopedSaveState ss (g);
                        juce::ColourGradient halo ((playing ? juce::Colours::white
                                                            : juce::Colour (0xffffeaad))
                                                       .withAlpha (playing ? 0.85f : 0.45f),
                                                   ledCenter.x, ledCenter.y,
                                                   juce::Colours::transparentBlack,
                                                   ledCenter.x + (playing ? 12.0f : 8.0f), ledCenter.y, true);
                        g.setGradientFill (halo);
                        g.fillEllipse (juce::Rectangle<float> (24.0f, 24.0f).withCentre (ledCenter));
                    }
                    g.setColour (playing ? juce::Colours::white : juce::Colour (0xffffeaad));
                    g.fillEllipse (juce::Rectangle<float> (5.0f, 5.0f).withCentre (ledCenter));

                    // Highlight rim
                    g.setColour (juce::Colours::white.withAlpha (0.4f));
                    g.drawRoundedRectangle (cell, 4.0f, 1.2f);
                }
                else if (playing)
                {
                    // Playhead step highlight
                    g.setColour (baseColor.withAlpha (0.45f));
                    g.fillRoundedRectangle (cell, 4.0f);
                    g.setColour (baseColor);
                    g.drawRoundedRectangle (cell, 4.0f, 1.5f);
                }
                else
                {
                    // Dim unlit pad with a subtle beat-block tint
                    g.setColour (baseColor.withAlpha (onBeat ? 0.18f : 0.09f));
                    g.fillRoundedRectangle (cell, 4.0f);

                    g.setColour (juce::Colour (0xff252830));
                    g.drawRoundedRectangle (cell, 4.0f, 1.0f);
                }
            }
        }
    }

    void mouseDown (const juce::MouseEvent& e) override { toggleAt (e); }
    void mouseDrag (const juce::MouseEvent& e) override { toggleAt (e, true); }

private:
    void toggleAt (const juce::MouseEvent& e, bool painting = false)
    {
        const float labelW = 78.0f;
        const int steps = Sequencer::NumSteps, lanes = Sequencer::NumLanes;

        if (e.x < labelW)
            return;

        const float cellW = (getWidth() - labelW) / (float) steps;
        const float cellH = getHeight() / (float) lanes;

        const int step = juce::jlimit (0, steps - 1, (int) ((e.x - labelW) / cellW));
        const int lane = juce::jlimit (0, lanes - 1, (int) (e.y / cellH));

        // Dragging paints the value picked up on mouse-down rather than flipping
        // every cell it crosses.
        if (! painting)
            paintValue = ! seq.getStep (lane, step);

        seq.setStep (lane, step, paintValue);
        repaint();
    }

    void timerCallback() override { repaint(); }

    Sequencer& seq;
    bool paintValue = true;
};

} // namespace haos
