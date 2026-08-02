#pragma once

#include <JuceHeader.h>

namespace haos::art
{

//==============================================================================
/** Vector artwork for instruments and bundles.

    Everything here is drawn procedurally rather than shipped as image files:
    the app stays a single self-contained binary, the art scales to any size, and
    it re-colours per instrument. Each style evokes the real hardware — the 303's
    silver box and orange knob row, the 909's coloured pad strip, the Juno's
    slider bank, a Moog's wooden cheeks, the 2600's patch-point grid. */
enum class Style
{
    bassline,      // TB-303 and friends
    drumMachine,   // TR-909 / TR-808
    polySynth,     // Juno-106
    monoSynth,     // Minimoog, Minitaur
    semiModular,   // ARP 2600, Mother-32, DFAM
    strings,       // string machine
    keys,          // piano
    sampler,       // sample bundles
    visual,        // HAOS Reactor, VisualForge — video/spectrum tools
    chord,         // RubikChord — harmony tools
    effect,        // TechnoMaster and other processors
    generic
};

inline Style styleFor (const juce::String& idOrName)
{
    const auto s = idOrName.toLowerCase();

    // --- HAOS plugins, matched before the generic instrument rules ---------
    if (s.contains ("reactor") || s.contains ("visualforge") || s.contains ("visual")) return Style::visual;
    if (s.contains ("rubik") || s.contains ("chord"))                                  return Style::chord;
    if (s.contains ("master") || s.contains ("manta") || s.contains ("fx"))            return Style::effect;
    if (s.contains ("technoforge") || s.contains ("forge"))                            return Style::drumMachine;

    if (s.contains ("303") || s.contains ("bass"))                                   return Style::bassline;
    if (s.contains ("808") || s.contains ("909") || s.contains ("drum")
        || s.contains ("beat") || s.contains ("dfam"))                               return Style::drumMachine;
    if (s.contains ("juno") || s.contains ("poly"))                                  return Style::polySynth;
    if (s.contains ("minimoog") || s.contains ("model d") || s.contains ("minitaur")
        || s.contains ("mono"))                                                      return Style::monoSynth;
    if (s.contains ("2600") || s.contains ("mother") || s.contains ("modular")
        || s.contains ("labyrinth") || s.contains ("subharmonicon"))                 return Style::semiModular;
    if (s.contains ("string"))                                                       return Style::strings;
    if (s.contains ("piano") || s.contains ("keys"))                                 return Style::keys;
    if (s.contains ("pack") || s.contains ("pml") || s.contains ("sample")
        || s.contains ("bundle") || s.contains ("loop"))                             return Style::sampler;

    return Style::generic;
}

//==============================================================================
namespace detail
{
    inline void panel (juce::Graphics& g, juce::Rectangle<float> r,
                       juce::Colour top, juce::Colour bottom, float corner = 4.0f)
    {
        juce::ColourGradient grad (top, r.getCentreX(), r.getY(),
                                   bottom, r.getCentreX(), r.getBottom(), false);
        g.setGradientFill (grad);
        g.fillRoundedRectangle (r, corner);
    }

    /** A row of little knobs — the visual signature of most of this hardware. */
    inline void knobRow (juce::Graphics& g, juce::Rectangle<float> r, int count,
                         juce::Colour cap, juce::Colour mark)
    {
        if (count <= 0) return;
        const float step = r.getWidth() / (float) count;
        const float d    = juce::jmin (step * 0.62f, r.getHeight() * 0.86f);
        if (d < 2.0f) return;

        for (int i = 0; i < count; ++i)
        {
            juce::Point<float> c (r.getX() + step * (i + 0.5f), r.getCentreY());
            auto k = juce::Rectangle<float> (d, d).withCentre (c);

            g.setColour (juce::Colours::black.withAlpha (0.45f));
            g.fillEllipse (k.translated (0.0f, d * 0.07f));
            g.setColour (cap);
            g.fillEllipse (k);
            g.setColour (mark);
            // pointers fanned out so the row looks "set", not uniform
            const float a = -2.2f + 0.9f * (float) ((i * 7) % 5) / 4.0f * 2.6f;
            g.drawLine (c.x, c.y,
                        c.x + std::cos (a) * d * 0.36f,
                        c.y + std::sin (a) * d * 0.36f, juce::jmax (1.0f, d * 0.10f));
        }
    }

    inline void sliderBank (juce::Graphics& g, juce::Rectangle<float> r, int count,
                            juce::Colour trackC, juce::Colour capC)
    {
        if (count <= 0) return;
        const float step = r.getWidth() / (float) count;

        for (int i = 0; i < count; ++i)
        {
            const float cx = r.getX() + step * (i + 0.5f);
            g.setColour (trackC);
            g.fillRoundedRectangle (cx - 1.0f, r.getY(), 2.0f, r.getHeight(), 1.0f);

            const float t  = 0.25f + 0.5f * (float) ((i * 5) % 7) / 6.0f;
            const float cy = r.getBottom() - t * r.getHeight();
            g.setColour (capC);
            g.fillRoundedRectangle (cx - step * 0.26f, cy - 2.0f, step * 0.52f, 4.0f, 1.5f);
        }
    }

    inline void keybed (juce::Graphics& g, juce::Rectangle<float> r, int whites)
    {
        if (whites <= 0 || r.getHeight() < 3.0f) return;
        const float w = r.getWidth() / (float) whites;

        g.setColour (juce::Colour (0xffe8eaec));
        g.fillRoundedRectangle (r, 1.5f);

        g.setColour (juce::Colour (0xff9aa0a6));
        for (int i = 1; i < whites; ++i)
            g.drawLine (r.getX() + w * i, r.getY(), r.getX() + w * i, r.getBottom(), 0.7f);

        // black keys in the usual 2-3 grouping
        g.setColour (juce::Colour (0xff17181c));
        const int pattern[] = { 0, 1, 3, 4, 5 };
        for (int oct = 0; oct * 7 < whites; ++oct)
            for (int p : pattern)
            {
                const int idx = oct * 7 + p;
                if (idx + 1 >= whites) continue;
                g.fillRoundedRectangle (r.getX() + w * (idx + 1) - w * 0.28f, r.getY(),
                                        w * 0.56f, r.getHeight() * 0.62f, 1.0f);
            }
    }

    inline void patchGrid (juce::Graphics& g, juce::Rectangle<float> r,
                           int cols, int rows, juce::Colour jack, juce::Colour lead)
    {
        if (cols <= 0 || rows <= 0) return;
        const float cw = r.getWidth() / (float) cols;
        const float ch = r.getHeight() / (float) rows;
        const float d  = juce::jmin (cw, ch) * 0.48f;
        if (d < 1.0f) return;

        for (int yi = 0; yi < rows; ++yi)
            for (int xi = 0; xi < cols; ++xi)
            {
                juce::Point<float> c (r.getX() + cw * (xi + 0.5f), r.getY() + ch * (yi + 0.5f));
                g.setColour (jack);
                g.fillEllipse (juce::Rectangle<float> (d, d).withCentre (c));
                g.setColour (juce::Colours::black.withAlpha (0.6f));
                g.fillEllipse (juce::Rectangle<float> (d * 0.45f, d * 0.45f).withCentre (c));
            }

        // a couple of patch cables, because that is what a 2600 always looks like
        if (cols >= 3 && rows >= 2)
        {
            juce::Path cable;
            juce::Point<float> a (r.getX() + cw * 0.5f,          r.getY() + ch * 0.5f);
            juce::Point<float> b (r.getX() + cw * (cols - 0.5f), r.getY() + ch * 1.5f);
            cable.startNewSubPath (a);
            cable.cubicTo (a.translated (0, ch * 1.6f), b.translated (0, ch * 1.6f), b);
            g.setColour (lead.withAlpha (0.85f));
            g.strokePath (cable, juce::PathStrokeType (juce::jmax (1.2f, d * 0.28f),
                                                       juce::PathStrokeType::curved,
                                                       juce::PathStrokeType::rounded));
        }
    }

    inline void waveform (juce::Graphics& g, juce::Rectangle<float> r, juce::Colour c, int cycles)
    {
        juce::Path p;
        const int steps = juce::jmax (8, (int) r.getWidth());
        for (int i = 0; i <= steps; ++i)
        {
            const float t = (float) i / (float) steps;
            const float y = r.getCentreY()
                          - std::sin (t * juce::MathConstants<float>::twoPi * (float) cycles)
                            * r.getHeight() * 0.38f;
            const float x = r.getX() + t * r.getWidth();
            if (i == 0) p.startNewSubPath (x, y); else p.lineTo (x, y);
        }
        g.setColour (c);
        g.strokePath (p, juce::PathStrokeType (1.6f, juce::PathStrokeType::curved));
    }
}

//==============================================================================
/** Draws instrument artwork filling `area`. `accent` tints the live elements. */
inline void draw (juce::Graphics& g, juce::Rectangle<float> area,
                  Style style, juce::Colour accent)
{
    using namespace detail;

    if (area.getWidth() < 8.0f || area.getHeight() < 8.0f)
        return;

    juce::Graphics::ScopedSaveState save (g);
    g.reduceClipRegion (area.getSmallestIntegerContainer());

    const float pad = juce::jmax (2.0f, area.getHeight() * 0.08f);
    auto body = area.reduced (pad * 0.5f);

    switch (style)
    {
        case Style::bassline:
        {
            // silver box, black stripe, orange knob row — the 303 look
            panel (g, body, juce::Colour (0xffc9ccd1), juce::Colour (0xff8f959c));
            auto strip = body.removeFromTop (body.getHeight() * 0.30f).reduced (pad * 0.4f);
            g.setColour (juce::Colour (0xff1b1d21));
            g.fillRoundedRectangle (strip, 2.0f);
            waveform (g, strip.reduced (pad * 0.5f, strip.getHeight() * 0.22f), accent, 2);
            knobRow (g, body.removeFromTop (body.getHeight() * 0.55f).reduced (pad * 0.6f, pad * 0.3f),
                     5, juce::Colour (0xffe8802a), juce::Colour (0xff1b1d21));
            break;
        }

        case Style::drumMachine:
        {
            panel (g, body, juce::Colour (0xff43474e), juce::Colour (0xff222529));
            knobRow (g, body.removeFromTop (body.getHeight() * 0.42f).reduced (pad * 0.6f, pad * 0.35f),
                     4, juce::Colour (0xffd8dade), juce::Colour (0xff17181c));

            // the coloured step-button strip
            auto pads = body.reduced (pad * 0.6f, pad * 0.5f);
            const int n = 8;
            const float sw = pads.getWidth() / (float) n;
            const juce::Colour cols[] = { juce::Colour (0xffe0523a), juce::Colour (0xffe8802a),
                                          juce::Colour (0xffe8c53a), juce::Colour (0xffd8dade) };
            for (int i = 0; i < n; ++i)
            {
                auto pd = juce::Rectangle<float> (pads.getX() + sw * i + sw * 0.12f, pads.getY(),
                                                  sw * 0.76f, pads.getHeight()).reduced (0.0f, 1.0f);
                g.setColour (cols[(i / 2) % 4]);
                g.fillRoundedRectangle (pd, 1.6f);
            }
            break;
        }

        case Style::polySynth:
        {
            panel (g, body, juce::Colour (0xff2b3038), juce::Colour (0xff14161a));
            g.setColour (accent.withAlpha (0.85f));
            g.fillRoundedRectangle (body.removeFromTop (juce::jmax (2.0f, body.getHeight() * 0.06f))
                                        .reduced (pad * 0.5f, 0.0f), 1.0f);
            sliderBank (g, body.removeFromTop (body.getHeight() * 0.48f).reduced (pad * 0.7f, pad * 0.35f),
                        7, juce::Colour (0xff3c424b), juce::Colour (0xffdfe3e7));
            keybed (g, body.reduced (pad * 0.5f, pad * 0.35f), 14);
            break;
        }

        case Style::monoSynth:
        {
            // wooden cheeks either side of a dark control panel
            g.setColour (juce::Colour (0xff6b4429));
            g.fillRoundedRectangle (body, 3.0f);
            auto inner = body.reduced (juce::jmax (2.0f, body.getWidth() * 0.07f), pad * 0.4f);
            panel (g, inner, juce::Colour (0xff2f333a), juce::Colour (0xff141619), 2.0f);
            knobRow (g, inner.removeFromTop (inner.getHeight() * 0.46f).reduced (pad * 0.4f, pad * 0.3f),
                     6, juce::Colour (0xff23262b), accent);
            keybed (g, inner.reduced (pad * 0.3f, pad * 0.35f), 12);
            break;
        }

        case Style::semiModular:
        {
            panel (g, body, juce::Colour (0xff23262c), juce::Colour (0xff121417));
            knobRow (g, body.removeFromTop (body.getHeight() * 0.34f).reduced (pad * 0.6f, pad * 0.3f),
                     5, juce::Colour (0xffb9bfc6), juce::Colour (0xff16181c));
            patchGrid (g, body.reduced (pad * 0.6f, pad * 0.4f), 8, 2,
                       juce::Colour (0xff5b626b), accent);
            break;
        }

        case Style::strings:
        {
            panel (g, body, juce::Colour (0xff2a2f38), juce::Colour (0xff15171b));
            auto top = body.removeFromTop (body.getHeight() * 0.5f).reduced (pad * 0.6f, pad * 0.3f);
            for (int i = 0; i < 3; ++i)
                waveform (g, top.removeFromTop (top.getHeight() / (3.0f - i)),
                          accent.withAlpha (0.45f + 0.2f * i), 1 + i);
            keybed (g, body.reduced (pad * 0.5f, pad * 0.3f), 14);
            break;
        }

        case Style::keys:
        {
            panel (g, body, juce::Colour (0xff26292f), juce::Colour (0xff121417));
            keybed (g, body.reduced (pad * 0.4f), 16);
            break;
        }

        case Style::sampler:
        {
            panel (g, body, juce::Colour (0xff24272d), juce::Colour (0xff131519));
            // a little waveform "pack" card
            auto wave = body.reduced (pad * 0.6f, pad * 0.5f);
            g.setColour (juce::Colour (0xff1a1c21));
            g.fillRoundedRectangle (wave, 2.0f);

            const int bars = juce::jmax (6, (int) (wave.getWidth() / 4.0f));
            const float bw = wave.getWidth() / (float) bars;
            for (int i = 0; i < bars; ++i)
            {
                const float t = (float) i / (float) bars;
                const float amp = 0.25f + 0.75f * std::abs (std::sin (t * 9.0f) * std::cos (t * 3.0f));
                const float bh = wave.getHeight() * amp * 0.86f;
                g.setColour (accent.withAlpha (0.55f + 0.35f * amp));
                g.fillRoundedRectangle (wave.getX() + bw * i + bw * 0.2f,
                                        wave.getCentreY() - bh * 0.5f,
                                        juce::jmax (1.0f, bw * 0.6f), bh, 0.8f);
            }
            break;
        }

        case Style::visual:
        {
            // a screen showing a reactive spectrum — Reactor / VisualForge
            panel (g, body, juce::Colour (0xff1c1f26), juce::Colour (0xff0e1014));
            auto screen = body.reduced (pad * 0.5f);
            g.setColour (juce::Colour (0xff09090b));
            g.fillRoundedRectangle (screen, 2.5f);

            const int bars = juce::jmax (7, (int) (screen.getWidth() / 6.0f));
            const float bw = screen.getWidth() / (float) bars;
            for (int i = 0; i < bars; ++i)
            {
                const float t = (float) i / (float) juce::jmax (1, bars - 1);
                const float amp = std::pow (std::sin (t * 3.1f + 0.4f) * 0.5f + 0.55f, 1.4f);
                const float bh = screen.getHeight() * amp * 0.88f;
                g.setColour (accent.withAlpha (0.45f + 0.5f * amp));
                g.fillRoundedRectangle (screen.getX() + bw * i + bw * 0.22f,
                                        screen.getBottom() - bh,
                                        juce::jmax (1.0f, bw * 0.56f), bh, 0.8f);
            }
            g.setColour (juce::Colours::white.withAlpha (0.06f));
            g.fillRoundedRectangle (screen.removeFromTop (screen.getHeight() * 0.28f), 2.0f);
            break;
        }

        case Style::chord:
        {
            // keys with a chord lit up — RubikChord
            panel (g, body, juce::Colour (0xff262a32), juce::Colour (0xff121418));
            auto kb = body.reduced (pad * 0.4f, pad * 0.5f);
            keybed (g, kb, 12);

            const float w = kb.getWidth() / 12.0f;
            const int   triad[] = { 0, 2, 4 };          // root / third / fifth
            for (int t : triad)
            {
                g.setColour (accent.withAlpha (0.72f));
                g.fillRoundedRectangle (kb.getX() + w * t + w * 0.12f,
                                        kb.getY() + kb.getHeight() * 0.55f,
                                        w * 0.76f, kb.getHeight() * 0.4f, 1.0f);
            }
            break;
        }

        case Style::effect:
        {
            // processor face: knob row over a level meter
            panel (g, body, juce::Colour (0xff2a2e35), juce::Colour (0xff141619));
            knobRow (g, body.removeFromTop (body.getHeight() * 0.55f).reduced (pad * 0.6f, pad * 0.35f),
                     4, juce::Colour (0xff30353d), accent);

            auto meter = body.reduced (pad * 0.6f, pad * 0.45f);
            g.setColour (juce::Colour (0xff141619));
            g.fillRoundedRectangle (meter, 2.0f);
            const int segs = 12;
            const float sw = meter.getWidth() / (float) segs;
            for (int i = 0; i < segs; ++i)
            {
                const bool lit = i < segs - 3;
                g.setColour (lit ? (i > segs - 5 ? juce::Colour (0xffe8c53a) : accent).withAlpha (0.85f)
                                 : juce::Colour (0xff23262c));
                g.fillRoundedRectangle (meter.getX() + sw * i + sw * 0.15f, meter.getY() + 1.0f,
                                        juce::jmax (1.0f, sw * 0.7f), meter.getHeight() - 2.0f, 0.8f);
            }
            break;
        }

        case Style::generic:
        default:
        {
            panel (g, body, juce::Colour (0xff2a2e35), juce::Colour (0xff141619));
            knobRow (g, body.reduced (pad * 0.6f, body.getHeight() * 0.28f), 4,
                     juce::Colour (0xff30353d), accent);
            break;
        }
    }
}

/** Convenience: pick the style from a name and draw. */
inline void drawFor (juce::Graphics& g, juce::Rectangle<float> area,
                     const juce::String& idOrName, juce::Colour accent)
{
    draw (g, area, styleFor (idOrName), accent);
}

} // namespace haos::art
