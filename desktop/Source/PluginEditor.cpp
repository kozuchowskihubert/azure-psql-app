#include "PluginEditor.h"
#include <map>
#include "Params.h"
#include "Artwork.h"

using namespace haos;

//==============================================================================
/** Per-instrument accent, following the haos.fm palette so each machine reads
    as its own thing in the browser. */
static juce::Colour accentFor (const juce::String& instrument)
{
    const auto s = instrument.toLowerCase();
    if (s.contains ("303"))                       return juce::Colour (HubLookAndFeel::gold);
    if (s.contains ("909"))                       return juce::Colour (HubLookAndFeel::accent);
    if (s.contains ("808"))                       return juce::Colour (0xffff4d4d);
    if (s.contains ("juno") || s.contains ("poly"))  return juce::Colour (HubLookAndFeel::violet);
    if (s.contains ("2600") || s.contains ("modular")) return juce::Colour (0xff00d9ff);
    if (s.contains ("moog") || s.contains ("mono"))    return juce::Colour (HubLookAndFeel::neon);
    if (s.contains ("string"))                    return juce::Colour (0xff64ffda);
    // HAOS plugins get their own colours so the suite reads as distinct products
    if (s.contains ("reactor"))                   return juce::Colour (0xff00d9ff);
    if (s.contains ("visualforge") || s.contains ("visual")) return juce::Colour (HubLookAndFeel::violet);
    if (s.contains ("rubik") || s.contains ("chord"))        return juce::Colour (HubLookAndFeel::gold);
    if (s.contains ("manta"))                     return juce::Colour (0xff64ffda);
    if (s.contains ("technoforge"))               return juce::Colour (HubLookAndFeel::accent);
    if (s.contains ("technomaster") || s.contains ("master")) return juce::Colour (HubLookAndFeel::neon);
    return juce::Colour (HubLookAndFeel::accent);
}

// Explicit UTF-8 bytes for "  •  " — a plain "•" literal was being decoded as
// Latin-1 and rendered as mojibake ("â€¢").
static const juce::String kSep = juce::String::fromUTF8 ("  \xe2\x80\xa2  ");

//==============================================================================
// Human-readable value formatting per parameter — so knobs read "1.0 kHz" / "80%"
// / "250 ms" instead of raw floats like "0.8000001".
static juce::String formatParam (const juce::String& id, double v)
{
    using namespace haos::pid;

    if (id == cutoff)
        return v >= 1000.0 ? juce::String (v / 1000.0, 1) + " kHz"
                           : juce::String (juce::roundToInt (v)) + " Hz";
    if (id == bpm)                                return juce::String (juce::roundToInt (v)) + " BPM";
    if (id == lfoRate || id == shRate)            return juce::String (v, v < 10.0 ? 2 : 1) + " Hz";
    if (id == osc2Detune)                         return (v >= 0 ? "+" : "") + juce::String (v, 1) + " st";
    if (id == snareTune || id == kickPitch)       return juce::String (juce::roundToInt (v)) + " Hz";
    if (id == fxDelayTime)                        return juce::String (juce::roundToInt (v)) + " ms";
    if (id == fxDrive || id == drive)             return "x" + juce::String (v, 1);

    // time parameters: ms below a second, seconds above
    if (id == ampA || id == ampD || id == ampR || id == fltA || id == fltD || id == fltR
        || id == glide || id == kickDecay || id == snareDecay || id == hatDecay
        || id == clapDecay)
        return v < 1.0 ? juce::String (juce::roundToInt (v * 1000.0)) + " ms"
                       : juce::String (v, 2) + " s";

    // everything else is a 0..1-ish amount → percentage
    return juce::String (juce::roundToInt (v * 100.0)) + "%";
}

//==============================================================================
// Typography mirrors haos.fm: a condensed display face for headings and a
// monospaced face for numbers. Both fall back gracefully if the exact face the
// site loads from Google Fonts isn't installed locally.
juce::Font HubLookAndFeel::displayFont (float height, bool bold)
{
    static const juce::String face = []
    {
        const juce::StringArray wanted { "Bebas Neue", "Oswald", "Avenir Next Condensed",
                                         "Helvetica Neue Condensed Bold", "Impact" };
        const auto available = juce::Font::findAllTypefaceNames();
        for (const auto& w : wanted)
            if (available.contains (w))
                return w;
        return juce::Font::getDefaultSansSerifFontName();
    }();

    return juce::Font (juce::FontOptions (face, height,
                                          bold ? juce::Font::bold : juce::Font::plain));
}

juce::Font HubLookAndFeel::monoFont (float height)
{
    static const juce::String face = []
    {
        const juce::StringArray wanted { "Space Mono", "JetBrains Mono", "SF Mono", "Menlo" };
        const auto available = juce::Font::findAllTypefaceNames();
        for (const auto& w : wanted)
            if (available.contains (w))
                return w;
        return juce::Font::getDefaultMonospacedFontName();
    }();

    return juce::Font (juce::FontOptions (face, height, juce::Font::plain));
}

//==============================================================================
HubLookAndFeel::HubLookAndFeel()
{
    setColour (juce::ResizableWindow::backgroundColourId, juce::Colour (bg));
    setColour (juce::ListBox::backgroundColourId,         juce::Colour (panel));
    setColour (juce::ListBox::textColourId,               juce::Colour (text));
    setColour (juce::Label::textColourId,                 juce::Colour (text));

    setColour (juce::TextEditor::backgroundColourId,      juce::Colour (raised));
    setColour (juce::TextEditor::textColourId,            juce::Colour (text));
    setColour (juce::TextEditor::outlineColourId,         juce::Colour (0xff2a2d34));
    setColour (juce::TextEditor::focusedOutlineColourId,  juce::Colour (accent));
    setColour (juce::TextEditor::highlightColourId,       juce::Colour (accent).withAlpha (0.3f));

    setColour (juce::ComboBox::backgroundColourId,        juce::Colour (raised));
    setColour (juce::ComboBox::textColourId,              juce::Colour (text));
    setColour (juce::ComboBox::outlineColourId,           juce::Colour (0xff2a2d34));
    setColour (juce::ComboBox::arrowColourId,             juce::Colour (dim));

    setColour (juce::PopupMenu::backgroundColourId,       juce::Colour (raised));
    setColour (juce::PopupMenu::textColourId,             juce::Colour (text));
    setColour (juce::PopupMenu::highlightedBackgroundColourId, juce::Colour (accent).withAlpha (0.25f));

    setColour (juce::TextButton::buttonColourId,          juce::Colour (raised));
    setColour (juce::TextButton::buttonOnColourId,        juce::Colour (accent).withAlpha (0.30f));
    setColour (juce::TextButton::textColourOffId,         juce::Colour (accent));
    setColour (juce::TextButton::textColourOnId,          juce::Colour (text));

    setColour (juce::Slider::rotarySliderFillColourId,    juce::Colour (accent));
    setColour (juce::Slider::rotarySliderOutlineColourId, juce::Colour (0xff2a2d34));
    setColour (juce::Slider::thumbColourId,               juce::Colour (text));
    setColour (juce::Slider::trackColourId,               juce::Colour (accent));
    setColour (juce::Slider::backgroundColourId,          juce::Colour (0xff2a2d34));
    setColour (juce::Slider::textBoxTextColourId,         juce::Colour (dim));
    setColour (juce::Slider::textBoxOutlineColourId,      juce::Colours::transparentBlack);
}

juce::Font HubLookAndFeel::getLabelFont (juce::Label& l)
{
    return l.getFont();
}

//==============================================================================
// Hardware-style knob: tick ring, glowing value arc, brushed metal cap with a
// rim light, and a bright indicator. Knobs are capped in size so a wide cell
// never balloons one control to twice the size of its neighbours.
void HubLookAndFeel::drawRotarySlider (juce::Graphics& g, int x, int y, int w, int h,
                                       float sliderPos, float startAngle, float endAngle,
                                       juce::Slider& s)
{
    constexpr float kMaxDiameter = 96.0f;   // lets the hero CUTOFF breathe; small cells self-limit

    auto cell = juce::Rectangle<int> (x, y, w, h).toFloat();
    const float diameter = juce::jmin (kMaxDiameter,
                                       juce::jmin (cell.getWidth(), cell.getHeight()) - 6.0f);
    if (diameter < 10.0f)
        return;

    const auto  centre = cell.getCentre();
    const float radius = diameter * 0.5f;
    const float angle  = startAngle + sliderPos * (endAngle - startAngle);

    const float tickR = radius;
    const float arcR  = radius * 0.86f;
    const float bodyR = radius * 0.66f;

    const auto knobAccent = s.findColour (juce::Slider::rotarySliderFillColourId);

    // --- tick ring: 11 marks across the travel -----------------------------
    for (int i = 0; i <= 10; ++i)
    {
        const float t  = (float) i / 10.0f;
        const float a  = startAngle + t * (endAngle - startAngle) - juce::MathConstants<float>::halfPi;
        const float ca = std::cos (a), sa = std::sin (a);
        const bool  lit = t <= sliderPos + 1.0e-4f;

        g.setColour (lit ? knobAccent.withAlpha (0.55f) : juce::Colour (0xff2b2f36));
        g.drawLine (centre.x + ca * (tickR - 3.0f), centre.y + sa * (tickR - 3.0f),
                    centre.x + ca * tickR,          centre.y + sa * tickR,
                    (i % 5 == 0) ? 2.0f : 1.2f);
    }

    // --- track + glowing value arc -----------------------------------------
    juce::Path track;
    track.addCentredArc (centre.x, centre.y, arcR, arcR, 0.0f, startAngle, endAngle, true);
    g.setColour (juce::Colour (0xff23262c));
    g.strokePath (track, juce::PathStrokeType (4.0f, juce::PathStrokeType::curved, juce::PathStrokeType::rounded));

    if (sliderPos > 0.001f)
    {
        juce::Path value;
        value.addCentredArc (centre.x, centre.y, arcR, arcR, 0.0f, startAngle, angle, true);

        g.setColour (knobAccent.withAlpha (0.22f));   // bloom
        g.strokePath (value, juce::PathStrokeType (8.0f, juce::PathStrokeType::curved, juce::PathStrokeType::rounded));
        g.setColour (knobAccent);
        g.strokePath (value, juce::PathStrokeType (4.0f, juce::PathStrokeType::curved, juce::PathStrokeType::rounded));
    }

    // --- cap ----------------------------------------------------------------
    // AI knob render (shared with the FX bundle) wins over procedural drawing;
    // its pointer faces up at rotation 0, matching this painter's convention.
    static const juce::Image knobImg = []
    {
        auto f = juce::File::getSpecialLocation (juce::File::userApplicationDataDirectory)
                    .getChildFile ("Application Support/HAOS/FX Assets/knob.png");
        return f.existsAsFile() ? juce::ImageFileFormat::loadFrom (f) : juce::Image();
    }();
    if (knobImg.isValid())
    {
        const float ir = radius * 0.80f;
        const float sc = (ir * 2.0f) / (float) knobImg.getWidth();
        g.setColour (juce::Colours::black.withAlpha (0.45f));
        g.fillEllipse (juce::Rectangle<float> (ir * 2, ir * 2).withCentre (centre).translated (0.0f, 2.5f));
        g.drawImageTransformed (knobImg,
            juce::AffineTransform::translation (-knobImg.getWidth() * 0.5f,
                                                -knobImg.getHeight() * 0.5f)
                .scaled (sc)
                .rotated (angle)
                .translated (centre.x, centre.y));
        g.setColour (knobAccent.withAlpha (0.9f));
        g.fillEllipse (juce::Rectangle<float> (3.6f, 3.6f).withCentre (centre));
        return;
    }

    auto body = juce::Rectangle<float> (bodyR * 2, bodyR * 2).withCentre (centre);

    g.setColour (juce::Colours::black.withAlpha (0.45f));
    g.fillEllipse (body.translated (0.0f, 2.5f));

    // brushed-aluminium cap (mockup reference): bright silver dome
    juce::ColourGradient metal (juce::Colour (0xffd9dde3), centre.x - bodyR * 0.4f, centre.y - bodyR * 0.6f,
                                juce::Colour (0xff5a616b), centre.x + bodyR * 0.3f, centre.y + bodyR, true);
    metal.addColour (0.45, juce::Colour (0xffaab0b9));
    metal.addColour (0.75, juce::Colour (0xff7c838d));
    g.setGradientFill (metal);
    g.fillEllipse (body);
    for (int br = 0; br < 24; ++br)                       // fine radial brushing
    {
        const float ba = (float) br / 24.0f * juce::MathConstants<float>::twoPi;
        g.setColour (juce::Colours::white.withAlpha ((br & 1) ? 0.05f : 0.02f));
        g.drawLine (centre.x + std::cos (ba) * bodyR * 0.35f, centre.y + std::sin (ba) * bodyR * 0.35f,
                    centre.x + std::cos (ba) * bodyR * 0.92f, centre.y + std::sin (ba) * bodyR * 0.92f, 0.7f);
    }

    // rim: bright at the top, dark at the bottom
    g.setColour (juce::Colour (0xff484f59));
    g.drawEllipse (body.reduced (0.5f), 1.2f);
    g.setColour (juce::Colours::white.withAlpha (0.10f));
    juce::Path rimLight;
    rimLight.addCentredArc (centre.x, centre.y, bodyR - 1.0f, bodyR - 1.0f, 0.0f,
                            -2.4f, -0.7f, true);
    g.strokePath (rimLight, juce::PathStrokeType (1.6f));

    // --- indicator ----------------------------------------------------------
    const float ia = angle - juce::MathConstants<float>::halfPi;
    const float ci = std::cos (ia), si = std::sin (ia);
    juce::Point<float> tip  (centre.x + ci * (bodyR - 4.0f), centre.y + si * (bodyR - 4.0f));
    juce::Point<float> base (centre.x + ci * (bodyR * 0.30f), centre.y + si * (bodyR * 0.30f));

    g.setColour (juce::Colours::black.withAlpha (0.8f));
    g.drawLine ({ base.translated (0.0f, 1.0f), tip.translated (0.0f, 1.0f) }, 3.4f);
    g.setColour (juce::Colour (0xfff2f5f7));
    g.drawLine ({ base, tip }, 2.6f);

    g.setColour (knobAccent.withAlpha (0.9f));
    g.fillEllipse (juce::Rectangle<float> (3.6f, 3.6f).withCentre (centre));
}

//==============================================================================
void HubLookAndFeel::drawLinearSlider (juce::Graphics& g, int x, int y, int w, int h,
                                       float sliderPos, float, float,
                                       juce::Slider::SliderStyle style, juce::Slider& s)
{
    if (style == juce::Slider::LinearVertical)
    {
        // Console fader: dark slot, accent fill from the bottom, silver cap.
        const float cx = x + w * 0.5f;

        g.setColour (juce::Colour (0xff2a2d34));
        g.fillRoundedRectangle (cx - 2.5f, (float) y, 5.0f, (float) h, 2.5f);

        g.setColour (juce::Colour (accent));
        g.fillRoundedRectangle (cx - 2.5f, sliderPos, 5.0f,
                                juce::jmax (0.0f, y + h - sliderPos), 2.5f);

        juce::Rectangle<float> cap (20.0f, 11.0f);
        cap = cap.withCentre ({ cx, sliderPos });
        juce::ColourGradient capGrad (juce::Colour (0xffd9dde3), cap.getX(), cap.getY(),
                                      juce::Colour (0xff9aa0a8), cap.getX(), cap.getBottom(), false);
        g.setGradientFill (capGrad);
        g.fillRoundedRectangle (cap, 2.5f);
        g.setColour (juce::Colour (0xff34393f));
        g.drawRoundedRectangle (cap, 2.5f, 1.0f);
        g.setColour (juce::Colour (0xff23262c));
        g.drawHorizontalLine ((int) cap.getCentreY(), cap.getX() + 3.0f, cap.getRight() - 3.0f);
        return;
    }

    if (style != juce::Slider::LinearHorizontal)
    {
        juce::LookAndFeel_V4::drawLinearSlider (g, x, y, w, h, sliderPos, 0, 0, style, s);
        return;
    }

    const float cy   = y + h * 0.5f;
    const float left = (float) x, right = (float) (x + w);

    g.setColour (juce::Colour (0xff2a2d34));
    g.fillRoundedRectangle (left, cy - 2.5f, (float) w, 5.0f, 2.5f);

    g.setColour (juce::Colour (accent));
    g.fillRoundedRectangle (left, cy - 2.5f, juce::jmax (0.0f, sliderPos - left), 5.0f, 2.5f);

    g.setColour (juce::Colour (text));
    g.fillEllipse (juce::Rectangle<float> (14.0f, 14.0f).withCentre ({ sliderPos, cy }));
    g.setColour (juce::Colour (0xff34393f));
    g.drawEllipse (juce::Rectangle<float> (14.0f, 14.0f).withCentre ({ sliderPos, cy }), 1.0f);
    juce::ignoreUnused (right);
}

//==============================================================================
void HaosHubEditor::FxScope::paint (juce::Graphics& g)
{
    auto b = getLocalBounds().toFloat();

    g.setColour (juce::Colour (0xff0b0d10));
    g.fillRoundedRectangle (b, 6.0f);
    g.setColour (juce::Colour (0xff23262c));
    g.drawRoundedRectangle (b.reduced (0.5f), 6.0f, 1.0f);

    auto area = b.reduced (10.0f, 8.0f);

    g.setColour (juce::Colours::white.withAlpha (0.05f));
    for (int i = 1; i < 8; ++i)
        g.drawVerticalLine ((int) (area.getX() + area.getWidth() * i / 8.0f),
                            area.getY(), area.getBottom());
    g.setColour (juce::Colours::white.withAlpha (0.09f));
    g.drawHorizontalLine ((int) area.getCentreY(), area.getX(), area.getRight());

    // peak drives a subtle glow so the panel breathes with the audio
    float peak = 0.0f;
    for (float v : data)
        peak = juce::jmax (peak, std::abs (v));
    peak = juce::jlimit (0.0f, 1.0f, peak);

    const float midY = area.getCentreY();
    const float amp  = area.getHeight() * 0.46f;

    juce::Path trace;
    const int N = HaosHubProcessor::kScopeSize;
    for (int i = 0; i < N; ++i)
    {
        const float x = area.getX() + area.getWidth() * i / (float) (N - 1);
        const float y = midY - amp * juce::jlimit (-1.0f, 1.0f, data[i]);
        if (i == 0) trace.startNewSubPath (x, y);
        else        trace.lineTo (x, y);
    }

    const auto accent = juce::Colour (HubLookAndFeel::accent);
    g.setColour (accent.withAlpha (0.18f + 0.25f * peak));
    g.strokePath (trace, juce::PathStrokeType (4.0f, juce::PathStrokeType::curved));
    g.setColour (accent);
    g.strokePath (trace, juce::PathStrokeType (1.4f, juce::PathStrokeType::curved));

    g.setColour (juce::Colours::white.withAlpha (0.28f));
    g.setFont (juce::FontOptions (9.0f, juce::Font::bold));
    g.drawText ("MASTER OUT", getLocalBounds().reduced (12, 5),
                juce::Justification::topLeft, false);
}

//==============================================================================
void HaosHubEditor::FxSpectrum::push (const float* scope, double sr)
{
    sampleRate = sr > 1000.0 ? sr : 44100.0;

    for (int i = 0; i < kSize; ++i)   // Hann window
    {
        const float w = 0.5f - 0.5f * std::cos (juce::MathConstants<float>::twoPi * i / (kSize - 1));
        fftData[i] = scope[i] * w;
    }
    std::fill (fftData + kSize, fftData + kSize * 2, 0.0f);
    fft.performFrequencyOnlyForwardTransform (fftData);

    for (int i = 0; i < kSize / 2; ++i)
    {
        const float mag = fftData[i] * (2.0f / kSize);
        // fast attack, slow decay — the classic analyzer ballistics
        bins[i] = mag > bins[i] ? mag : bins[i] * 0.86f + mag * 0.14f;
    }
}

void HaosHubEditor::FxSpectrum::paint (juce::Graphics& g)
{
    auto b = getLocalBounds().toFloat();

    g.setColour (juce::Colour (0xff0b0d10));
    g.fillRoundedRectangle (b, 6.0f);
    g.setColour (juce::Colour (0xff23262c));
    g.drawRoundedRectangle (b.reduced (0.5f), 6.0f, 1.0f);

    auto area = b.reduced (10.0f, 8.0f);
    const float fMin = 20.0f, fMax = 20000.0f;
    const float logMin = std::log10 (fMin), logMax = std::log10 (fMax);
    auto freqToX = [&] (float f)
    { return area.getX() + area.getWidth() * (std::log10 (f) - logMin) / (logMax - logMin); };

    // octave grid + labels
    g.setFont (juce::FontOptions (8.0f, juce::Font::bold));
    for (float f : { 50.0f, 100.0f, 200.0f, 500.0f, 1000.0f, 2000.0f, 5000.0f, 10000.0f })
    {
        const float gx = freqToX (f);
        g.setColour (juce::Colours::white.withAlpha (0.05f));
        g.drawVerticalLine ((int) gx, area.getY(), area.getBottom());
        g.setColour (juce::Colours::white.withAlpha (0.22f));
        g.drawText (f >= 1000.0f ? juce::String (f / 1000.0f, 0) + "k" : juce::String ((int) f),
                    (int) gx - 12, (int) area.getBottom() - 9, 24, 9, juce::Justification::centred, false);
    }

    // spectrum path: dB scale -72..0, log frequency. Rendered per pixel with
    // fractional-bin interpolation + 1/24-oct averaging so the low end draws
    // as a curve, not three straight segments (per-bin points are ~47 Hz apart).
    const float dbFloor = -72.0f;
    const float binHz   = (float) sampleRate / (float) kSize;
    const int   nBins   = kSize / 2;
    const float win     = std::pow (2.0f, 1.0f / 24.0f);
    const float logMinF = std::log10 (fMin), logMaxF = std::log10 (fMax);

    auto magAt = [&] (float f) -> float
    {
        const int b0 = juce::jlimit (1, nBins - 2, (int) std::floor (f / win / binHz));
        const int b1 = juce::jlimit (1, nBins - 2, (int) std::ceil  (f * win / binHz));
        if (b1 - b0 >= 2)
        {
            float sum = 0.0f;
            for (int i = b0; i <= b1; ++i) sum += bins[i];
            return sum / (float) (b1 - b0 + 1);
        }
        const float fi = juce::jlimit (1.0f, (float) nBins - 2.0f, f / binHz);
        const int   i0 = (int) fi;
        const float t  = fi - (float) i0;
        return bins[i0] * (1.0f - t) + bins[i0 + 1] * t;
    };

    juce::Path spec;
    spec.startNewSubPath (area.getX(), area.getBottom());
    const int W = juce::jmax (2, (int) area.getWidth());
    for (int px = 0; px <= W; px += 2)
    {
        const float t = (float) px / (float) W;
        const float f = std::pow (10.0f, logMinF + t * (logMaxF - logMinF));
        const float db = juce::jlimit (dbFloor, 0.0f,
                                       20.0f * std::log10 (juce::jmax (1.0e-6f, magAt (f))));
        spec.lineTo (area.getX() + (float) px,
                     area.getBottom() - area.getHeight() * (db - dbFloor) / -dbFloor);
    }
    spec.lineTo (area.getRight(), area.getBottom());
    spec.closeSubPath();

    const auto accent = juce::Colour (HubLookAndFeel::accent);
    {
        juce::Graphics::ScopedSaveState ss (g);
        juce::ColourGradient grad (accent.withAlpha (0.55f), area.getX(), area.getY(),
                                   accent.withAlpha (0.06f), area.getX(), area.getBottom(), false);
        g.setGradientFill (grad);
        g.fillPath (spec);
    }
    g.setColour (accent.withAlpha (0.9f));
    g.strokePath (spec, juce::PathStrokeType (1.2f));

    g.setColour (juce::Colours::white.withAlpha (0.28f));
    g.setFont (juce::FontOptions (9.0f, juce::Font::bold));
    g.drawText ("SPECTRUM", getLocalBounds().reduced (12, 5),
                juce::Justification::topLeft, false);
}

//==============================================================================
void HubLookAndFeel::drawButtonBackground (juce::Graphics& g, juce::Button& b,
                                           const juce::Colour& backgroundColour,
                                           bool highlighted, bool down)
{
    if (b.getComponentID() == "tab")
    {
        if (down || highlighted)
        {
            g.setColour (juce::Colours::white.withAlpha (down ? 0.08f : 0.05f));
            g.fillRoundedRectangle (b.getLocalBounds().toFloat().reduced (2.0f), 5.0f);
        }
        return;
    }

    // Hero CTA pill (INSTALL ALL): orange->gold gradient, fully rounded.
    if (b.getComponentID() == "hero")
    {
        auto r = b.getLocalBounds().toFloat().reduced (1.0f);
        {
            juce::Graphics::ScopedSaveState ss (g);
            juce::ColourGradient grad (juce::Colour (accent), r.getX(), r.getY(),
                                       juce::Colour (gold), r.getRight(), r.getBottom(), false);
            g.setGradientFill (grad);
            g.fillRoundedRectangle (r, r.getHeight() * 0.5f);
        }
        if (highlighted || down)
        {
            g.setColour (juce::Colours::white.withAlpha (down ? 0.18f : 0.10f));
            g.fillRoundedRectangle (r, r.getHeight() * 0.5f);
        }
        g.setColour (juce::Colours::black.withAlpha (0.25f));
        g.drawRoundedRectangle (r, r.getHeight() * 0.5f, 1.0f);
        return;
    }

    juce::LookAndFeel_V4::drawButtonBackground (g, b, backgroundColour, highlighted, down);
}

juce::Font HubLookAndFeel::getTextButtonFont (juce::TextButton& b, int buttonHeight)
{
    if (b.getComponentID() == "tab")
        return displayFont (16.0f);
    if (b.getComponentID() == "hero")
        return displayFont (17.0f);
    return juce::LookAndFeel_V4::getTextButtonFont (b, buttonHeight);
}

//==============================================================================
void DragListBox::mouseDrag (const juce::MouseEvent& e)
{
    if (dragging || filesForRow == nullptr || e.getDistanceFromDragStart() < 12)
    {
        juce::ListBox::mouseDrag (e);
        return;
    }

    // The event may have originated on a row component, so map it back to us to
    // find out which row the gesture actually started on.
    const auto local = e.getEventRelativeTo (this);
    int row = getRowContainingPosition (local.getMouseDownX(), local.getMouseDownY());
    if (row < 0) row = getSelectedRow();
    if (row < 0)
    {
        juce::ListBox::mouseDrag (e);
        return;
    }

    const auto files = filesForRow (row);
    if (files.isEmpty())
    {
        if (onDragUnavailable != nullptr) onDragUnavailable (row);
        juce::ListBox::mouseDrag (e);
        return;
    }

    dragging = true;
    juce::Component::SafePointer<DragListBox> safe (this);
    juce::DragAndDropContainer::performExternalDragDropOfFiles (
        files, false, this, [safe]() mutable { if (safe != nullptr) safe->dragging = false; });
}

//==============================================================================
// List models
//==============================================================================

//==============================================================================
SplashOverlay::SplashOverlay()
{
    setInterceptsMouseClicks (true, false);
    auto dir = haos::PresetLibrary::rootDir();
    if (auto f = dir.getChildFile ("splash.png"); f.existsAsFile())
        art = juce::ImageFileFormat::loadFrom (f);
    if (auto f = dir.getChildFile ("hero.png"); f.existsAsFile())
        mark = juce::ImageFileFormat::loadFrom (f);
}

void SplashOverlay::paint (juce::Graphics& g)
{
    const float a = juce::jlimit (0.0f, 1.0f, alpha);
    if (a <= 0.001f) return;

    // Art only — the wordmark render IS the launch card. No captions, no
    // census, no footer; the About variant adds just the build line.
    juce::Graphics::ScopedSaveState ss (g);
    g.setOpacity (a);
    if (art.isValid())
        g.drawImage (art, getLocalBounds().toFloat(),
                     juce::RectanglePlacement::fillDestination);
    else if (mark.isValid())
        g.drawImage (mark, getLocalBounds().toFloat(),
                     juce::RectanglePlacement::fillDestination);
    else
        g.fillAll (juce::Colour (HubLookAndFeel::bg));

    if (about)
    {
        g.setOpacity (1.0f);
        g.setColour (juce::Colour (HubLookAndFeel::dim).withAlpha (0.85f * a));
        g.setFont (HubLookAndFeel::monoFont (11.0f));
        g.drawText (build, getLocalBounds().removeFromBottom (40).withTrimmedBottom (18),
                    juce::Justification::centred, false);
    }
}

int HaosHubEditor::BundleModel::getNumRows()
{
    return owner.packIdx.size();      // audio packs; MIDI packs live on the MIDI page
}

void HaosHubEditor::BundleModel::paintListBoxItem (int row, juce::Graphics& g, int w, int h, bool selected)
{
    if (selected)
    {
        g.setColour (juce::Colour (HubLookAndFeel::accent).withAlpha (0.18f));
        g.fillRect (0, 0, w, h);
        g.setColour (juce::Colour (HubLookAndFeel::accent));
        g.fillRect (0, 0, 3, h);
    }

    const auto& bundles = owner.processor.library.getBundles();
    if (! juce::isPositiveAndBelow (row, owner.packIdx.size()))
        return;
    const auto& b = bundles.getReference (owner.packIdx[row]);
    const juce::String name = b.name;
    const juce::String sub  = juce::String (b.samples.size()) + " sounds";
    const juce::String artKey = "pack";

    // artwork chip — a pack's own cover.png wins over the generic art
    auto art = juce::Rectangle<float> (10.0f, (h - 34.0f) * 0.5f, 46.0f, 34.0f);
    bool drewCover = false;
    if (b.cover.isValid())
    {
        g.drawImage (b.cover, art, juce::RectanglePlacement::fillDestination);
        drewCover = true;
    }
    if (! drewCover)
        haos::art::drawFor (g, art, artKey, accentFor (artKey));
    g.setColour (juce::Colours::black.withAlpha (0.4f));
    g.drawRoundedRectangle (art, 3.0f, 1.0f);

    const int tx = (int) art.getRight() + 10;

    g.setColour (juce::Colour (HubLookAndFeel::text));
    g.setFont (HubLookAndFeel::displayFont (15.0f));
    g.drawText (name.toUpperCase(), tx, 5, w - tx - 8, h / 2 - 2, juce::Justification::bottomLeft, true);

    g.setColour (juce::Colour (HubLookAndFeel::dim));
    g.setFont (HubLookAndFeel::monoFont (10.5f));
    g.drawText (sub, tx, h / 2, w - tx - 8, h / 2 - 4, juce::Justification::topLeft, true);
}

void HaosHubEditor::BundleModel::selectedRowsChanged (int)
{
    owner.refreshFilter();
}

void HaosHubEditor::BundleModel::listBoxItemClicked (int row, const juce::MouseEvent& e)
{
    // Cymatics-style pack preview: clicking the cover art auditions the pack's
    // first loop (falls back to its first sample) so packs are heard, not read.
    if (row < 0 || e.x > 60)
        return;
    const auto& bundles = owner.processor.library.getBundles();
    if (! juce::isPositiveAndBelow (row, owner.packIdx.size()))
        return;
    const auto& bnd = bundles.getReference (owner.packIdx[row]);
    juce::File pick;
    for (const auto& f : bnd.samples)
        if (f.getFileName().containsIgnoreCase ("loop")) { pick = f; break; }
    if (pick == juce::File() && ! bnd.samples.isEmpty())
        pick = bnd.samples.getReference (0);
    if (pick.existsAsFile() && owner.processor.auditionFile (pick))
        owner.setStatus ("Preview: " + bnd.name + "  -  " + pick.getFileName());
}

//==============================================================================
int HaosHubEditor::ItemModel::getNumRows()
{
    return owner.showingSamples() ? owner.sampleFiles.size() : owner.filtered.size();
}

//==============================================================================
/** Renders (and caches) a real min/max waveform of an audio file. The vault's
    rows show the actual shape of the sound, Cymatics-style, not a stock glyph.
    Decoding happens once per file on the message thread — pack one-shots are
    tiny; longer files are capped at the first 12 seconds. */
static const juce::Image& waveThumbFor (const juce::File& f)
{
    static std::map<juce::String, juce::Image> cache;
    static juce::AudioFormatManager afm;
    static bool init = false;
    if (! init) { afm.registerBasicFormats(); init = true; }

    auto& slot = cache[f.getFullPathName()];
    if (slot.isValid() || cache.size() > 4000)
        return slot;

    constexpr int W = 512, H = 64;
    if (auto r = std::unique_ptr<juce::AudioFormatReader> (afm.createReaderFor (f)))
    {
        const auto len = (int) juce::jmin<juce::int64> (r->lengthInSamples,
                                                        (juce::int64) (r->sampleRate * 12.0));
        if (len > 8)
        {
            juce::AudioBuffer<float> buf (1, len);
            r->read (&buf, 0, len, 0, true, false);
            const float* d = buf.getReadPointer (0);

            juce::Image img (juce::Image::ARGB, W, H, true);
            juce::Graphics g (img);
            const float mid = H * 0.5f;
            const auto accent = juce::Colour (HubLookAndFeel::accent);
            for (int x = 0; x < W; ++x)
            {
                const int a = (int) ((juce::int64) x * len / W);
                const int b = juce::jmax (a + 1, (int) ((juce::int64) (x + 1) * len / W));
                float lo = 0.0f, hi = 0.0f;
                for (int i = a; i < b && i < len; ++i) { lo = juce::jmin (lo, d[i]); hi = juce::jmax (hi, d[i]); }
                const float yT = mid - hi * (mid - 2.0f), yB = mid - lo * (mid - 2.0f);
                g.setColour (accent.withAlpha (0.85f));
                g.drawVerticalLine (x, yT, juce::jmax (yB, yT + 1.0f));
            }
            slot = img;
        }
    }
    return slot;   // stays invalid for non-audio files -> caller falls back
}

void HaosHubEditor::ItemModel::paintListBoxItem (int row, juce::Graphics& g, int w, int h, bool selected)
{
    if (selected)
    {
        // Breathing highlight + a solid accent edge, so the current row reads as
        // live rather than just tinted.
        const float pulse = 0.15f + 0.07f * std::sin (owner.animPhase * 3.4f);
        juce::ColourGradient grad (juce::Colour (HubLookAndFeel::accent).withAlpha (pulse), 0.0f, 0.0f,
                                   juce::Colour (HubLookAndFeel::accent).withAlpha (pulse * 0.15f), (float) w, 0.0f, false);
        g.setGradientFill (grad);
        g.fillRect (0, 0, w, h);

        g.setColour (juce::Colour (HubLookAndFeel::accent).withAlpha (0.85f));
        g.fillRect (0, 0, 3, h);

        if (owner.loadFlash > 0.0f)     // brief flash when a patch is loaded
        {
            g.setColour (juce::Colours::white.withAlpha (owner.loadFlash * 0.22f));
            g.fillRect (0, 0, w, h);
        }
    }

    g.setColour (juce::Colour (0xff23252b));
    g.fillRect (0, h - 1, w, 1);

    juce::String name, right, sub;

    if (owner.showingSamples())
    {
        if (! juce::isPositiveAndBelow (row, owner.sampleFiles.size())) return;
        const auto& f = owner.sampleFiles.getReference (row);
        name  = f.getFileNameWithoutExtension();
        right = f.getFileExtension().toUpperCase().trimCharactersAtStart (".");
        sub   = juce::File::descriptionOfSizeInBytes (f.getSize());
    }
    else
    {
        if (! juce::isPositiveAndBelow (row, owner.filtered.size())) return;
        const auto& p = owner.filtered.getReference (row);
        name  = p.name;
        right = p.instrument.toUpperCase();
        sub   = p.category;
        if (p.isDrumPattern())
            sub += kSep + juce::String (p.bpm > 0 ? (int) p.bpm : 120) + " BPM pattern";
    }

    const auto tint = accentFor (owner.showingSamples() ? juce::String ("pack") : right);

    // artwork chip: the instrument's own panel, or a waveform card for samples
    auto art = juce::Rectangle<float> (10.0f, (h - 30.0f) * 0.5f, 42.0f, 30.0f);
    haos::art::drawFor (g, art, owner.showingSamples() ? juce::String ("sample") : right, tint);
    g.setColour (juce::Colours::black.withAlpha (0.4f));
    g.drawRoundedRectangle (art, 3.0f, 1.0f);

    const int tx = (int) art.getRight() + 12;
    int tw = w - tx - 104;

    // sample rows carry a big REAL waveform preview across the right half
    if (owner.showingSamples() && juce::isPositiveAndBelow (row, owner.sampleFiles.size()))
    {
        const auto& f = owner.sampleFiles.getReference (row);
        if (! f.hasFileExtension ("mid"))
        {
            const auto& thumb = waveThumbFor (f);
            if (thumb.isValid())
            {
                const int waveX = tx + juce::jmin (tw / 2, 320);
                auto waveR = juce::Rectangle<int> (waveX, 6, w - 116 - waveX, h - 12);
                if (waveR.getWidth() > 60)
                {
                    g.setColour (juce::Colours::black.withAlpha (0.30f));
                    g.fillRoundedRectangle (waveR.toFloat(), 4.0f);
                    g.drawImage (thumb, waveR.toFloat(), juce::RectanglePlacement::stretchToFit);
                    tw = waveX - tx - 10;
                }
            }
        }
    }

    g.setColour (juce::Colour (HubLookAndFeel::text));
    g.setFont (HubLookAndFeel::displayFont (16.0f));
    g.drawText (name.toUpperCase(), tx, 5, tw, h / 2 - 2, juce::Justification::bottomLeft, true);

    g.setColour (juce::Colour (HubLookAndFeel::dim));
    g.setFont (HubLookAndFeel::monoFont (10.5f));
    g.drawText (sub, tx, h / 2, tw, h / 2 - 4, juce::Justification::topLeft, true);

    // instrument tag, tinted to that machine
    if (right.isNotEmpty())
    {
        auto tag = juce::Rectangle<float> ((float) (w - 96), (h - 18) * 0.5f, 84.0f, 18.0f);
        g.setColour (tint.withAlpha (0.16f));
        g.fillRoundedRectangle (tag, 9.0f);
        g.setColour (tint);
        g.setFont (HubLookAndFeel::monoFont (10.0f));
        g.drawText (right, tag, juce::Justification::centred, false);
    }
}

void HaosHubEditor::ItemModel::listBoxItemClicked (int row, const juce::MouseEvent&)
{
    if (owner.showingSamples())
    {
        if (juce::isPositiveAndBelow (row, owner.sampleFiles.size()))
        {
            const auto& f = owner.sampleFiles.getReference (row);

            // MIDI clips play through the CURRENT instrument — the synth adapts
            // to the melody, Cymatics-style, instead of a Finder reveal.
            if (f.hasFileExtension ("mid"))
            {
                if (owner.processor.auditionMidiClip (f))
                    owner.setStatus (f.getFileNameWithoutExtension()
                                     + kSep + "playing on the current instrument"
                                     + kSep + "drag into your DAW to keep it");
                return;
            }

            // Third-party patches (.fxp, .nmsv, .vital ...) are not audio: there is
            // nothing to audition, so reveal them instead — and they stay draggable
            // straight into Serum / Nexus / whatever owns the format.
            static const juce::StringArray audioExt { ".wav", ".aif", ".aiff", ".flac", ".mp3", ".ogg", ".m4a" };
            if (! audioExt.contains (f.getFileExtension().toLowerCase()))
            {
                f.revealToUser();
                owner.setStatus (f.getFileName() + " - drag it onto its plugin, or use the Finder window");
                return;
            }

            if (owner.processor.auditionFile (f))
            {
                // Also arm the keyboard sampler, so the piano roll / keys play
                // THIS sound (root C3) instead of the analog synth.
                owner.processor.loadSampleForKeyboard (f);
                owner.setStatus (f.getFileNameWithoutExtension()
                                 + " on the keyboard (root C3) - play MIDI or drag into your DAW");
            }
            else
                owner.setStatus ("Could not read " + f.getFileName());
        }
        return;
    }

    if (juce::isPositiveAndBelow (row, owner.filtered.size()))
        owner.loadPreset (owner.filtered.getReference (row));
}

//==============================================================================
int HaosHubEditor::PluginModel::getNumRows()
{
    return owner.processor.catalog.entries().size();
}

void HaosHubEditor::PluginModel::paintListBoxItem (int row, juce::Graphics& g, int w, int h, bool selected)
{
    const auto& items = owner.processor.catalog.entries();
    if (! juce::isPositiveAndBelow (row, items.size()))
        return;

    const auto& e = items.getReference (row);

    if (selected)
    {
        g.setColour (juce::Colour (HubLookAndFeel::accent).withAlpha (0.16f));
        g.fillRect (0, 0, w, h);
    }
    g.setColour (juce::Colour (0xff23252b));
    g.fillRect (0, h - 1, w, 1);

    const auto tint = accentFor (e.name);

    // artwork chip so the list reads like a product shelf, not a file listing
    auto art = juce::Rectangle<float> (10.0f, (h - 30.0f) * 0.5f, 42.0f, 30.0f);
    haos::art::drawFor (g, art, e.name, tint);
    g.setColour (juce::Colours::black.withAlpha (0.4f));
    g.drawRoundedRectangle (art, 3.0f, 1.0f);

    const int tx = (int) art.getRight() + 12;
    const int tw = w - tx - 150;

    g.setColour (juce::Colour (HubLookAndFeel::text));
    g.setFont (HubLookAndFeel::displayFont (16.0f));
    g.drawText (e.name.toUpperCase(), tx, 4, tw, h / 2 - 2, juce::Justification::bottomLeft, true);

    juce::String sub = e.description;
    if (sub.isEmpty())
        sub = e.bundled          ? "Included with HAOS Hub"
            : e.source.exists()  ? "Built locally"
            : e.downloadUrl.isNotEmpty() ? "Available for download"
                                         : "Installed (no local copy to reinstall)";

    if (e.arch.isNotEmpty())
        sub += "   " + e.arch;

    // arm64-only is a silent failure in a Rosetta host, so say so plainly
    if (e.armOnly())
        sub += "   Apple Silicon only";

    g.setColour (e.armOnly() ? juce::Colour (0xffe8b23a) : juce::Colour (HubLookAndFeel::dim));
    g.setFont (HubLookAndFeel::monoFont (10.5f));
    g.drawText (sub, tx, h / 2, tw, h / 2 - 4, juce::Justification::topLeft, true);

    const juce::String badge = e.installed ? "INSTALLED"
                             : (e.canInstall() ? "READY" : "UNAVAILABLE");
    const auto badgeCol = e.installed ? juce::Colour (HubLookAndFeel::neon)
                        : (e.canInstall() ? juce::Colour (HubLookAndFeel::accent)
                                          : juce::Colour (HubLookAndFeel::dim));

    auto tag = juce::Rectangle<float> ((float) (w - 132), (h - 20) * 0.5f, 108.0f, 20.0f);
    g.setColour (badgeCol.withAlpha (0.15f));
    g.fillRoundedRectangle (tag, 10.0f);
    g.setColour (badgeCol);
    g.setFont (HubLookAndFeel::monoFont (10.0f));
    g.drawText (badge, tag, juce::Justification::centred, false);
}

void HaosHubEditor::PluginModel::selectedRowsChanged (int)
{
    owner.updateInstallButton();
}

//==============================================================================
int HaosHubEditor::MidiPackModel::getNumRows() { return owner.midiBundleIdx.size() + 1; }

void HaosHubEditor::MidiPackModel::paintListBoxItem (int row, juce::Graphics& g, int w, int h, bool selected)
{
    if (selected)
    {
        g.setColour (juce::Colour (HubLookAndFeel::accent).withAlpha (0.18f));
        g.fillRect (0, 0, w, h);
        g.setColour (juce::Colour (HubLookAndFeel::accent));
        g.fillRect (0, 0, 3, h);
    }
    juce::String name = "All MIDI packs";
    int count = 0;
    const auto& bundles = owner.processor.library.getBundles();
    if (row == 0)
    {
        for (int bi : owner.midiBundleIdx) count += bundles.getReference (bi).samples.size();
    }
    else if (juce::isPositiveAndBelow (row - 1, owner.midiBundleIdx.size()))
    {
        const auto& b = bundles.getReference (owner.midiBundleIdx[row - 1]);
        name = b.name.replace ("MIDI ", "");
        count = b.samples.size();
    }
    g.setColour (juce::Colour (HubLookAndFeel::text));
    g.setFont (HubLookAndFeel::displayFont (14.0f));
    g.drawText (name.toUpperCase(), 12, 4, w - 20, h / 2, juce::Justification::bottomLeft, true);
    g.setColour (juce::Colour (HubLookAndFeel::dim));
    g.setFont (HubLookAndFeel::monoFont (10.0f));
    g.drawText (juce::String (count) + " clips", 12, h / 2, w - 20, h / 2 - 3,
                juce::Justification::topLeft, true);
}

void HaosHubEditor::MidiPackModel::selectedRowsChanged (int) { owner.refreshMidi(); }

void HaosHubEditor::MidiItemModel::listBoxItemClicked (int row, const juce::MouseEvent&)
{
    if (! juce::isPositiveAndBelow (row, owner.midiFiles.size()))
        return;
    const auto f = owner.midiFiles.getReference (row);
    if (owner.processor.auditionMidiClip (f))
        owner.setStatus (f.getFileNameWithoutExtension()
                         + kSep + "playing on the current instrument"
                         + kSep + "drag into Ableton to keep it");
}

int HaosHubEditor::MidiItemModel::getNumRows() { return owner.midiFiles.size(); }

void HaosHubEditor::MidiItemModel::paintListBoxItem (int row, juce::Graphics& g, int w, int h, bool selected)
{
    if (! juce::isPositiveAndBelow (row, owner.midiFiles.size())) return;
    if (selected)
    {
        g.setColour (juce::Colour (HubLookAndFeel::accent).withAlpha (0.14f));
        g.fillRect (0, 0, w, h);
    }
    g.setColour (juce::Colour (0xff23252b));
    g.fillRect (0, h - 1, w, 1);

    // tiny piano-roll glyph so the list reads as MIDI, not files
    auto icon = juce::Rectangle<float> (10.0f, h * 0.5f - 9.0f, 26.0f, 18.0f);
    g.setColour (juce::Colour (0xff17181c));
    g.fillRoundedRectangle (icon, 3.0f);
    g.setColour (juce::Colour (HubLookAndFeel::accent).withAlpha (0.8f));
    for (int k = 0; k < 4; ++k)
        g.fillRect (icon.getX() + 3 + k * 5.5f, icon.getY() + 3 + ((k * 7) % 11), 4.0f, 2.5f);

    g.setColour (juce::Colour (HubLookAndFeel::text));
    g.setFont (juce::FontOptions (12.5f));
    g.drawText (owner.midiFiles.getReference (row).getFileNameWithoutExtension(),
                46, 0, w - 230, h, juce::Justification::centredLeft, true);
    g.setColour (juce::Colour (HubLookAndFeel::dim));
    g.setFont (HubLookAndFeel::monoFont (9.5f));
    g.drawText ("click = play  -  drag to DAW", w - 190, 0, 180, h, juce::Justification::centredRight, false);
}

void HaosHubEditor::refreshMidi()
{
    midiBundleIdx.clearQuick();
    const auto& bundles = processor.library.getBundles();
    for (int i = 0; i < bundles.size(); ++i)
        if (bundles.getReference (i).name.containsIgnoreCase ("MIDI"))
            midiBundleIdx.add (i);

    const auto filter = midiSearch.getText().trim();
    const int  sel    = midiPackList.getSelectedRow();
    midiFiles.clearQuick();
    for (int k = 0; k < midiBundleIdx.size(); ++k)
    {
        if (sel > 0 && k != sel - 1) continue;
        for (const auto& f : bundles.getReference (midiBundleIdx[k]).samples)
            if (f.hasFileExtension ("mid")
                && (filter.isEmpty() || f.getFileName().containsIgnoreCase (filter)))
                midiFiles.add (f);
    }
    midiPackList.updateContent();
    midiItemList.updateContent();
    midiPackList.repaint();
    midiItemList.repaint();
}

//==============================================================================
void HaosHubEditor::PackCard::paint (juce::Graphics& g)
{
    auto b = getLocalBounds().toFloat().reduced (6.0f);

    g.setColour (juce::Colour (0xff17181c).brighter (hover ? 0.05f : 0.0f));
    g.fillRoundedRectangle (b, 10.0f);

    auto r = b.reduced (0.0f);
    auto coverR = r.removeFromTop (r.getHeight() - 64.0f).reduced (6.0f, 6.0f);
    {
        juce::Graphics::ScopedSaveState ss (g);
        juce::Path rp; rp.addRoundedRectangle (coverR, 7.0f);
        g.reduceClipRegion (rp);
        if (cover.isValid())
            g.drawImage (cover, coverR, juce::RectanglePlacement::fillDestination);
        else
        {
            g.setColour (juce::Colour (0xff101114));
            g.fillRect (coverR);
            haos::art::drawFor (g, coverR.reduced (coverR.getWidth() * 0.3f,
                                                   coverR.getHeight() * 0.28f),
                                name, juce::Colour (HubLookAndFeel::accent));
        }
        // bottom shade so the play chip always reads
        juce::ColourGradient sh (juce::Colours::transparentBlack,
                                 coverR.getCentreX(), coverR.getBottom() - 56.0f,
                                 juce::Colours::black.withAlpha (0.55f),
                                 coverR.getCentreX(), coverR.getBottom(), false);
        g.setGradientFill (sh);
        g.fillRect (coverR.withTop (coverR.getBottom() - 56.0f));
    }

    // ---- in-card preview player (Cymatics anatomy) --------------------------
    const bool hasPrev = ! previews.isEmpty()
                         && juce::isPositiveAndBelow (prevIdx, previews.size());

    // waveform strip while playing: the previewed sound's real shape + drag cue
    if (playing && hasPrev)
    {
        auto strip = coverR.withTop (coverR.getBottom() - 26.0f);
        g.setColour (juce::Colours::black.withAlpha (0.72f));
        g.fillRect (strip);

        const auto& pf = previews.getReference (prevIdx);
        auto waveR = strip.reduced (8.0f, 3.0f).withTrimmedRight (84.0f);
        if (pf.hasFileExtension ("mid"))
        {
            // piano-roll glyph: MIDI has no waveform, but it still reads as music
            g.setColour (juce::Colour (HubLookAndFeel::accent).withAlpha (0.85f));
            const float cw2 = waveR.getWidth() / 12.0f;
            for (int k = 0; k < 12; ++k)
                g.fillRect (waveR.getX() + k * cw2 + 1.0f,
                            waveR.getY() + (float) ((k * 7) % juce::jmax (1, (int) waveR.getHeight() - 3)),
                            cw2 - 3.0f, 2.6f);
        }
        else if (const auto& th = waveThumbFor (pf); th.isValid())
            g.drawImage (th, waveR, juce::RectanglePlacement::stretchToFit);

        g.setColour (juce::Colour (HubLookAndFeel::gold).withAlpha (0.9f));
        g.setFont (HubLookAndFeel::monoFont (9.0f));
        g.drawText (juce::String::fromUTF8 ("DRAG \xe2\x86\x92 DAW"),
                    strip.withTrimmedRight (8.0f).toNearestInt(),
                    juce::Justification::centredRight, false);
    }

    // dot indicator, top-centre: which of the preview sounds is armed
    if (previews.size() > 1)
    {
        const int n = previews.size();
        const float x0 = coverR.getCentreX() - (n - 1) * 6.0f;
        for (int i = 0; i < n; ++i)
        {
            const bool cur = i == prevIdx;
            const float rr = cur ? 3.2f : 2.3f;
            g.setColour (juce::Colours::black.withAlpha (0.4f));
            g.fillEllipse (x0 + i * 12.0f - rr - 1.0f, coverR.getY() + 10.0f - rr - 1.0f,
                           rr * 2 + 2.0f, rr * 2 + 2.0f);
            g.setColour (cur ? juce::Colour (HubLookAndFeel::accent)
                             : juce::Colours::white.withAlpha (0.40f));
            g.fillEllipse (x0 + i * 12.0f - rr, coverR.getY() + 10.0f - rr, rr * 2, rr * 2);
        }
    }

    // hover chevrons: cycle through the preview sounds
    if (hover && previews.size() > 1)
    {
        auto chev = [&g] (juce::Point<float> c, float dir)
        {
            g.setColour (juce::Colours::black.withAlpha (0.55f));
            g.fillEllipse (c.x - 12.0f, c.y - 12.0f, 24.0f, 24.0f);
            juce::Path p;
            p.startNewSubPath (c.x + dir * 3.0f, c.y - 6.5f);
            p.lineTo (c.x - dir * 4.0f, c.y);
            p.lineTo (c.x + dir * 3.0f, c.y + 6.5f);
            g.setColour (juce::Colours::white.withAlpha (0.92f));
            g.strokePath (p, juce::PathStrokeType (2.2f, juce::PathStrokeType::curved,
                                                   juce::PathStrokeType::rounded));
        };
        chev ({ coverR.getX() + 16.0f,    coverR.getCentreY() },  1.0f);
        chev ({ coverR.getRight() - 16.0f, coverR.getCentreY() }, -1.0f);
    }

    // centre play/pause chip
    if (hasPrev)
    {
        auto chip = juce::Rectangle<float> (44.0f, 44.0f).withCentre (coverR.getCentre());
        g.setColour (juce::Colours::black.withAlpha (hover || playing ? 0.72f : 0.5f));
        g.fillEllipse (chip);
        g.setColour (juce::Colour (HubLookAndFeel::accent));
        g.drawEllipse (chip.reduced (0.6f), 1.4f);
        if (playing)
        {
            g.fillRoundedRectangle (chip.getCentreX() - 8.0f, chip.getCentreY() - 8.0f, 5.5f, 16.0f, 1.5f);
            g.fillRoundedRectangle (chip.getCentreX() + 2.5f, chip.getCentreY() - 8.0f, 5.5f, 16.0f, 1.5f);
        }
        else
        {
            juce::Path tri;
            tri.addTriangle (chip.getX() + 17.0f, chip.getY() + 13.0f,
                             chip.getX() + 17.0f, chip.getBottom() - 13.0f,
                             chip.getRight() - 13.0f, chip.getCentreY());
            g.fillPath (tri);
        }
    }

    auto txt = r.reduced (12.0f, 4.0f);
    g.setColour (juce::Colour (HubLookAndFeel::text));
    g.setFont (HubLookAndFeel::displayFont (19.0f));
    g.drawText (name.toUpperCase(), txt.removeFromTop (26.0f).toNearestInt(),
                juce::Justification::centredLeft, true);
    g.setColour (juce::Colour (HubLookAndFeel::gold).withAlpha (0.85f));
    g.setFont (HubLookAndFeel::monoFont (11.5f));
    g.drawText (juce::String (count) + (isMidi ? " CLIPS" : " SOUNDS"),
                txt.removeFromTop (18.0f).toNearestInt(),
                juce::Justification::centredLeft, false);

    g.setColour (hover ? juce::Colour (HubLookAndFeel::accent)
                       : juce::Colour (0xff26262c));
    g.drawRoundedRectangle (b.reduced (0.5f), 10.0f, hover ? 1.6f : 1.0f);
}

void HaosHubEditor::PackCard::mouseUp (const juce::MouseEvent& e)
{
    if (didDrag) { didDrag = false; return; }
    if (! getLocalBounds().contains (e.getPosition()))
        return;

    // play/pause chip = audition, edge chevrons = cycle previews, else = open
    auto b = getLocalBounds().toFloat().reduced (6.0f);
    auto coverR = b.removeFromTop (b.getHeight() - 64.0f).reduced (6.0f, 6.0f);
    const auto chip = juce::Rectangle<float> (44.0f, 44.0f).withCentre (coverR.getCentre());

    if (! previews.isEmpty() && chip.expanded (6.0f).contains (e.position))
    {
        if (onToggle) onToggle (*this);
        return;
    }
    if (previews.size() > 1 && coverR.contains (e.position))
    {
        const juce::Rectangle<float> larr (coverR.getX(), coverR.getY(), 34.0f, coverR.getHeight());
        const juce::Rectangle<float> rarr (coverR.getRight() - 34.0f, coverR.getY(), 34.0f, coverR.getHeight());
        const int n = previews.size();
        if (larr.contains (e.position) || rarr.contains (e.position))
        {
            prevIdx = (prevIdx + (larr.contains (e.position) ? n - 1 : 1)) % n;
            playing = false;                    // arm the new sound...
            if (onToggle) onToggle (*this);     // ...and auto-play it
            return;
        }
    }
    if (onOpen)
        onOpen (libIndex);
}

void HaosHubEditor::PackCard::mouseDrag (const juce::MouseEvent& e)
{
    // the previewed sound drags straight out into Ableton
    if (didDrag || previews.isEmpty() || e.getDistanceFromDragStart() < 10)
        return;
    if (! juce::isPositiveAndBelow (prevIdx, previews.size()))
        return;
    didDrag = true;
    juce::DragAndDropContainer::performExternalDragDropOfFiles (
        { previews.getReference (prevIdx).getFullPathName() }, true);
}

void HaosHubEditor::rebuildPackCards()
{
    packCards.clear();
    const auto& bundles = processor.library.getBundles();
    for (int idx : packIdx)
    {
        const auto& b = bundles.getReference (idx);
        auto* card = packCards.add (new PackCard());
        card->libIndex = idx;
        card->cover    = b.cover;
        card->name     = b.name.replace ("HAOS — ", "").replace ("HAOS - ", "");
        card->count    = b.samples.size();
        card->isMidi   = b.name.containsIgnoreCase ("MIDI");
        card->onOpen   = [this] (int li) { openPackAt (li); };

        // up to four preview sounds, spread evenly across the pack — audio for
        // sample packs, .mid clips (played on the CURRENT instrument) for MIDI
        {
            static const juce::StringArray audioExt { ".wav", ".aif", ".aiff",
                                                      ".flac", ".mp3", ".ogg", ".m4a" };
            juce::Array<juce::File> pool;
            for (const auto& f : b.samples)
                if (audioExt.contains (f.getFileExtension().toLowerCase()))
                    pool.add (f);
            if (pool.isEmpty())
                for (const auto& f : b.samples)
                    if (f.hasFileExtension ("mid"))
                        pool.add (f);
            const int n = pool.size(), want = juce::jmin (4, n);
            for (int k = 0; k < want; ++k)
                card->previews.add (pool.getReference ((int) ((juce::int64) k * n / want)));
        }

        card->onToggle = [this] (PackCard& c)
        {
            // one preview at a time — starting a card silences the others
            for (auto* other : packCards)
                if (other != &c && other->playing)
                {
                    other->playing = false;
                    other->repaint();
                }

            if (c.playing)
            {
                processor.stopAudition();
                processor.stopClipAudition();
                c.playing = false;
            }
            else if (juce::isPositiveAndBelow (c.prevIdx, c.previews.size()))
            {
                const auto f = c.previews.getReference (c.prevIdx);
                const bool ok = f.hasFileExtension ("mid") ? processor.auditionMidiClip (f)
                                                           : processor.auditionFile (f);
                c.playing = ok;
                setStatus (ok ? c.name + kSep + f.getFileName()
                                  + kSep + "drag the card straight into your DAW"
                              : "Could not read " + f.getFileName());
            }
            c.repaint();
        };
        packHost.addAndMakeVisible (card);
    }
    layoutPackCards();
}

void HaosHubEditor::layoutPackCards()
{
    const int pad  = 12;   // breathing room so row 1 isn't clipped by the viewport edge
    const int vw   = juce::jmax (300, packView.getWidth() - 14);
    const int cols = juce::jmax (1, vw / 300);
    const int cw   = vw / cols, ch = 296;
    for (int i = 0; i < packCards.size(); ++i)
        packCards[i]->setBounds ((i % cols) * cw, pad + (i / cols) * ch, cw, ch);
    const int rows = (packCards.size() + cols - 1) / cols;
    packHost.setSize (vw, juce::jmax (1, rows * ch + pad * 2));
}

void HaosHubEditor::openPackAt (int libIndex)
{
    openPack = libIndex;
    if (page == PageSoundPacks) setPage (PageSoundPacks);
}

//==============================================================================
static juce::String pluginTagline (const juce::String& name)
{
    static const std::map<juce::String, const char*> tags = {
        { "HAOS Comp",            "Feed-Forward Compressor" },
        { "HAOS Limiter",         "Lookahead Brickwall" },
        { "HAOS EQ",              "8-Band Parametric EQ" },
        { "HAOS Sat",             "Analog Saturation" },
        { "HAOS Gate",            "Noise Gate & Expander" },
        { "HAOS Verb",            "Algorithmic Reverb" },
        { "HAOS Echo",            "Tempo-Synced Delay" },
        { "HAOS Width",           "Stereo Imager" },
        { "HAOS Clipper",         "Oversampled Clipper" },
        { "HAOS Hub",             "Sound Suite Manager" },
        { "HAOS TechnoForge",     "Techno Sound Engine" },
        { "HAOS TechnoForge MIDI","Techno MIDI Generator" },
        { "HAOS Reactor",         "Audio-Reactive Video" },
        { "HAOS RubikChord",      "Chord Progression Engine" },
        { "HAOS TechnoMaster",    "Master FX Chain" },
        { "HAOS VisualForge",     "Live Visualizer" },
    };
    auto it = tags.find (name);
    return it != tags.end() ? juce::String (it->second) : juce::String ("HAOS Plugin");
}

void HaosHubEditor::PluginCard::paint (juce::Graphics& g)
{
    auto b = getLocalBounds().toFloat().reduced (5.0f);

    g.setColour (juce::Colour (0xff121317).brighter (hover ? 0.05f : 0.0f));
    g.fillRoundedRectangle (b, 10.0f);
    g.setColour (juce::Colour (hover ? 0xff3a3e46 : 0xff23262c));
    g.drawRoundedRectangle (b.reduced (0.5f), 10.0f, 1.0f);

    auto r = b.reduced (10.0f, 8.0f);

    // centered title + tagline (Cymatics card anatomy)
    g.setColour (juce::Colour (HubLookAndFeel::text));
    g.setFont (HubLookAndFeel::displayFont (19.0f));
    g.drawText (entry.name.toUpperCase().replace ("HAOS ", ""),
                r.removeFromTop (22.0f).toNearestInt(), juce::Justification::centred, true);
    g.setColour (juce::Colour (HubLookAndFeel::dim));
    g.setFont (juce::FontOptions (10.5f));
    g.drawText (pluginTagline (entry.name), r.removeFromTop (14.0f).toNearestInt(),
                juce::Justification::centred, true);

    // FREE badge, top-right
    {
        auto badge = juce::Rectangle<float> (b.getRight() - 52.0f, b.getY() + 8.0f, 44.0f, 17.0f);
        juce::Graphics::ScopedSaveState ss (g);
        juce::ColourGradient grad (juce::Colour (0xffff8a3d), badge.getX(), badge.getY(),
                                   juce::Colour (0xffff4f6e), badge.getRight(), badge.getBottom(), false);
        g.setGradientFill (grad);
        g.fillRoundedRectangle (badge, 8.5f);
        g.setColour (juce::Colours::white);
        g.setFont (juce::FontOptions (9.5f, juce::Font::bold));
        g.drawText ("FREE", badge.toNearestInt(), juce::Justification::centred, false);
    }

    // action pill: single full-width status bar at the card bottom
    auto pill = r.removeFromBottom (26.0f);
    r.removeFromBottom (6.0f);

    // product shot: pseudo-3D tilt (shear + slight rotation) over a soft shadow
    if (art.isValid())
    {
        auto shot = r.reduced (10.0f, 4.0f);
        const float sc = juce::jmin (shot.getWidth() / (float) art.getWidth(),
                                     shot.getHeight() / (float) art.getHeight()) * 0.94f;
        {   // grounding shadow
            juce::Graphics::ScopedSaveState ss (g);
            juce::ColourGradient sh (juce::Colours::black.withAlpha (0.55f),
                                     shot.getCentreX(), shot.getBottom() - 6.0f,
                                     juce::Colours::transparentBlack,
                                     shot.getCentreX(), shot.getBottom() + 16.0f, true);
            g.setGradientFill (sh);
            g.fillEllipse (shot.getCentreX() - art.getWidth() * sc * 0.45f,
                           shot.getBottom() - 12.0f, art.getWidth() * sc * 0.9f, 18.0f);
        }
        g.drawImageTransformed (art,
            juce::AffineTransform::translation (-art.getWidth() * 0.5f, -art.getHeight() * 0.5f)
                .sheared (0.0f, -0.055f)
                .rotated (-0.03f)
                .scaled (sc)
                .translated (shot.getCentreX(), shot.getCentreY() - 2.0f));
    }
    else
        haos::art::drawFor (g, r.reduced (r.getWidth() * 0.25f, r.getHeight() * 0.2f),
                            entry.name, juce::Colour (HubLookAndFeel::accent));

    // status pill (Installed = green like Cymatics, Install = accent CTA)
    const bool inst = entry.installed;
    const bool can  = entry.canInstall() && ! inst;
    if (inst)
    {
        g.setColour (juce::Colour (0xff10291c));
        g.fillRoundedRectangle (pill, 13.0f);
        g.setColour (juce::Colour (0xff37d67a));
        g.drawRoundedRectangle (pill.reduced (0.5f), 13.0f, 1.0f);
        g.setFont (juce::FontOptions (11.5f, juce::Font::bold));
        g.drawText (juce::String::fromUTF8 ("INSTALLED  \xe2\x9c\x93"),
                    pill.toNearestInt(), juce::Justification::centred, false);
    }
    else
    {
        const auto col = can ? juce::Colour (HubLookAndFeel::accent) : juce::Colour (0xff3a3e44);
        g.setColour (col.withAlpha (can ? 0.95f : 0.35f));
        g.fillRoundedRectangle (pill, 13.0f);
        g.setColour (juce::Colours::black.withAlpha (can ? 0.85f : 0.5f));
        g.setFont (juce::FontOptions (11.5f, juce::Font::bold));
        g.drawText (can ? "INSTALL" : "UNAVAILABLE", pill.toNearestInt(),
                    juce::Justification::centred, false);
    }
}

void HaosHubEditor::PluginCard::mouseUp (const juce::MouseEvent& e)
{
    if (! getLocalBounds().contains (e.getPosition()))
        return;
    if (! entry.installed && entry.canInstall() && onInstall != nullptr)
        onInstall();
}

//==============================================================================
// Editor
//==============================================================================

HaosHubEditor::HaosHubEditor (HaosHubProcessor& p)
    : juce::AudioProcessorEditor (&p),
      processor (p),
      keyboard (p.keyboardState, juce::MidiKeyboardComponent::horizontalKeyboard),
      waveform (p.apvts)
{
    setLookAndFeel (&lnf);

    // The wordmark is painted with the site's orange->gold gradient in paint().
    titleLabel.setVisible (false);

    auto styleTab = [this] (juce::TextButton* b)
    {
        b->setComponentID ("tab");
        b->setClickingTogglesState (false);
        // Flat text tabs (the accent underline is drawn in paint()), not gray boxes.
        b->setColour (juce::TextButton::buttonColourId,   juce::Colours::transparentBlack);
        b->setColour (juce::TextButton::buttonOnColourId, juce::Colours::transparentBlack);
        b->setColour (juce::TextButton::textColourOffId,  juce::Colour (HubLookAndFeel::dim));
        b->setColour (juce::TextButton::textColourOnId,   juce::Colour (HubLookAndFeel::accent));
        b->setLookAndFeel (&lnf);
        addAndMakeVisible (b);
    };

    // Four top-level groups (Cymatics logic); pages live under them.
    const char* topNames[] = { "HOME", "VAULT", "STUDIO", "PLUGINS" };
    const Page  topPages[] = { PageHome, PageSoundPacks, PagePresets, PagePlugins };
    for (int i = 0; i < 4; ++i)
    {
        auto* b = tabs.add (new juce::TextButton (topNames[i]));
        styleTab (b);
        const Page target = topPages[i];
        b->onClick = [this, i, target] { setPage (i == 2 ? lastStudioPage : target); };
    }

    // STUDIO sub-tabs
    const char* stNames[] = { "PRESETS", "INSTRUMENTS", "MODULATION", "STEP SEQ", "FX" };
    const Page  stPages[] = { PagePresets, PageInstruments, PageModulation, PageMidi, PageFx };
    for (int i = 0; i < 5; ++i)
    {
        auto* b = studioTabs.add (new juce::TextButton (stNames[i]));
        styleTab (b);
        const Page target = stPages[i];
        b->onClick = [this, target]
        {
            if (target == PageMidi) setMidiMode (MidiSeq);   // clips live in the VAULT now
            setPage (target);
        };
        b->setVisible (false);
    }

    instrumentModeBox.addItemList ({ "Analog", "TR-909", "TR-808", "Sampler" }, 1);
    addAndMakeVisible (instrumentModeBox);
    instrumentModeAttach = std::make_unique<juce::AudioProcessorValueTreeState::ComboBoxAttachment> (
        processor.apvts, pid::instrument, instrumentModeBox);

    statusLabel.setFont (juce::FontOptions (12.0f));
    statusLabel.setColour (juce::Label::textColourId, juce::Colour (HubLookAndFeel::dim));
    addAndMakeVisible (statusLabel);

    //== Browse ================================================================
    searchBox.setTextToShowWhenEmpty ("Search presets and sounds...", juce::Colour (HubLookAndFeel::dim));
    searchBox.onTextChange = [this] { refreshFilter(); };
    addAndMakeVisible (searchBox);

    instrumentBox.addItem ("All instruments", 1);
    instrumentBox.setSelectedId (1, juce::dontSendNotification);
    instrumentBox.onChange = [this] { refreshFilter(); };
    presetCategoryBox.onChange = [this] { refreshFilter(); };
    addAndMakeVisible (presetCategoryBox);
    addAndMakeVisible (instrumentBox);

    syncButton.onClick = [this] { startSync(); };
    addAndMakeVisible (syncButton);

    hintLabel.setFont (juce::FontOptions (11.5f));
    hintLabel.setColour (juce::Label::textColourId, juce::Colour (HubLookAndFeel::dim));
    hintLabel.setText ("Click to load" + kSep + "drag to your DAW",
                       juce::dontSendNotification);
    addAndMakeVisible (hintLabel);

    bundleList.setRowHeight (48);
    bundleList.selectRow (0);
    addAndMakeVisible (bundleList);

    itemList.setRowHeight (64);
    itemList.filesForRow = [this] (int row) -> juce::StringArray
    {
        if (showingSamples())
        {
            if (juce::isPositiveAndBelow (row, sampleFiles.size()))
                return { sampleFiles.getReference (row).getFullPathName() };
            return {};
        }

        if (juce::isPositiveAndBelow (row, filtered.size()))
        {
            auto midiFile = PresetLibrary::writePatternMidi (filtered.getReference (row));
            if (midiFile.existsAsFile())
                return { midiFile.getFullPathName() };
        }
        return {};
    };
    itemList.onDragUnavailable = [this] (int)
    {
        setStatus ("Nothing to drag here - synth patches load into the engine; "
                   "samples, patterns and external files drag out as files");
    };
    addAndMakeVisible (itemList);

    // Waveform icon buttons (mockup style) instead of combo boxes.
    {
        const char* shapeIds[] = { pid::osc1Shape, pid::osc2Shape, pid::osc3Shape };
        const char* oscNames[] = { "OSC 1", "OSC 2", "OSC 3" };
        std::unique_ptr<haos::WaveSelector>* sels[] = { &osc1Wave, &osc2Wave, &osc3Wave };
        juce::Label* labels[] = { &osc1Label, &osc2Label, &osc3Label };

        for (int i = 0; i < 3; ++i)
        {
            labels[i]->setText (oscNames[i], juce::dontSendNotification);
            labels[i]->setFont (juce::FontOptions (10.5f, juce::Font::bold));
            labels[i]->setColour (juce::Label::textColourId, juce::Colour (HubLookAndFeel::dim));
            addAndMakeVisible (*labels[i]);

            if (auto* param = processor.apvts.getParameter (shapeIds[i]))
            {
                *sels[i] = std::make_unique<haos::WaveSelector> (*param);
                addAndMakeVisible (**sels[i]);
            }
        }
    }

    // Three oscillator levels + detune, then the filter and modulation core.
    addKnob (synthKnobs, pid::osc1Level,  "VCO 1");
    addKnob (synthKnobs, pid::osc2Level,  "VCO 2");
    addKnob (synthKnobs, pid::osc3Level,  "VCO 3");
    addKnob (synthKnobs, pid::osc2Detune, "Detune 2");
    addKnob (synthKnobs, pid::osc3Detune, "Detune 3");
    addKnob (synthKnobs, pid::ringMod,    "Ring Mod");
    addKnob (synthKnobs, pid::cutoff,     "Cutoff");
    addKnob (synthKnobs, pid::resonance,  "Reso");
    addKnob (synthKnobs, pid::envMod,     "Env Mod");
    addKnob (synthKnobs, pid::fltD,       "F.Decay");
    addKnob (synthKnobs, pid::drive,      "Drive");
    addKnob (synthKnobs, pid::glide,      "Glide");
    addKnob (synthKnobs, pid::subLevel,   "Sub");
    addKnob (synthKnobs, pid::noiseLevel, "Noise");

    // Amp envelope as vertical console faders (mockup style) — replaces the old
    // single "A.Decay" knob and finally exposes attack/sustain/release.
    {
        const char* ids[]   = { pid::ampA, pid::ampD, pid::ampS, pid::ampR };
        const char* names[] = { "ATTACK", "DECAY", "SUSTAIN", "RELEASE" };
        for (int i = 0; i < 4; ++i)
        {
            auto* f = adsrFaders.add (new AdsrFader());
            f->slider.setSliderStyle (juce::Slider::LinearVertical);
            f->slider.setTextBoxStyle (juce::Slider::NoTextBox, false, 0, 0);
            f->slider.setPopupDisplayEnabled (true, true, this);
            addAndMakeVisible (f->slider);
            f->attach = std::make_unique<juce::AudioProcessorValueTreeState::SliderAttachment> (
                processor.apvts, ids[i], f->slider);

            f->label.setText (names[i], juce::dontSendNotification);
            f->label.setJustificationType (juce::Justification::centred);
            f->label.setFont (juce::FontOptions (8.5f, juce::Font::bold));
            f->label.setColour (juce::Label::textColourId, juce::Colour (HubLookAndFeel::dim));
            addAndMakeVisible (f->label);
        }

        adsrTitle.setText ("AMP ENV", juce::dontSendNotification);
        adsrTitle.setJustificationType (juce::Justification::centred);
        adsrTitle.setFont (juce::FontOptions (10.5f, juce::Font::bold));
        adsrTitle.setColour (juce::Label::textColourId, juce::Colour (HubLookAndFeel::dim));
        addAndMakeVisible (adsrTitle);
    }

    addAndMakeVisible (waveform);

    // hero banner (optional asset, Cymatics-style strip above the browser)
    if (auto bf = haos::PresetLibrary::rootDir().getChildFile ("banner.png"); bf.existsAsFile())
        bannerImg = juce::ImageFileFormat::loadFrom (bf);
    // HOME hero plate + STUDIO leitmotif backdrop (fresh art lands per open)
    if (auto hf = haos::PresetLibrary::rootDir().getChildFile ("hero.png"); hf.existsAsFile())
        homeBackImg = juce::ImageFileFormat::loadFrom (hf);
    if (auto sf = haos::PresetLibrary::rootDir().getChildFile ("studio-back.png"); sf.existsAsFile())
        studioBackImg = juce::ImageFileFormat::loadFrom (sf);

    keyboard.setKeyWidth (22.0f);
    keyboard.setAvailableRange (36, 84);
    // Tone the keybed down to the dark stage; stock JUCE white is blinding here.
    keyboard.setColour (juce::MidiKeyboardComponent::whiteNoteColourId,        juce::Colour (0xffd8dadd));
    keyboard.setColour (juce::MidiKeyboardComponent::blackNoteColourId,        juce::Colour (0xff0d0d0f));
    keyboard.setColour (juce::MidiKeyboardComponent::keySeparatorLineColourId, juce::Colour (0xff2a2a2e));
    keyboard.setColour (juce::MidiKeyboardComponent::shadowColourId,           juce::Colours::transparentBlack);
    keyboard.setColour (juce::MidiKeyboardComponent::textLabelColourId,        juce::Colour (0xff6a6d73));
    keyboard.setColour (juce::MidiKeyboardComponent::keyDownOverlayColourId,   juce::Colour (0xffff6b35));
    keyboard.setColour (juce::MidiKeyboardComponent::mouseOverKeyOverlayColourId,
                        juce::Colour (0xffff6b35).withAlpha (0.35f));
    // warm-ivory keybed with gold press highlights (stark white read as sterile
    // against the cream VU/steel palette; full gold killed key legibility)
    using MK = juce::MidiKeyboardComponent;
    keyboard.setColour (MK::whiteNoteColourId, juce::Colour (0xffd9bd6e));   // antique gold
    keyboard.setColour (MK::blackNoteColourId, juce::Colour (0xff191308));
    keyboard.setColour (MK::keySeparatorLineColourId, juce::Colours::black.withAlpha (0.55f));
    keyboard.setColour (MK::shadowColourId, juce::Colours::black.withAlpha (0.5f));
    keyboard.setColour (MK::keyDownOverlayColourId,
                        juce::Colour (0xfffff0a8).withAlpha (0.9f));
    keyboard.setColour (MK::mouseOverKeyOverlayColourId,
                        juce::Colour (HubLookAndFeel::gold).withAlpha (0.30f));
    keyboard.setColour (MK::textLabelColourId, juce::Colour (0xff4a3a12));
    addAndMakeVisible (keyboard);

    //== Sequencer =============================================================
    grid = std::make_unique<StepGrid> (processor.sequencer);
    addAndMakeVisible (*grid);

    playButton.onClick = [this]
    {
        processor.sequencer.start();
        setStatus ("Playing at " + juce::String (processor.sequencer.getBpm(), 1) + " BPM");
    };
    stopButton.onClick = [this]
    {
        processor.sequencer.stop (processor.drums);
        setStatus ("Stopped");
    };
    clearButton.onClick = [this]
    {
        processor.sequencer.clear();
        grid->repaint();
        setStatus ("Pattern cleared");
    };
    // Mockup transport colours: neon-green PLAY, red STOP, neutral CLEAR.
    playButton.setColour (juce::TextButton::buttonColourId, juce::Colour (0xff123a12));
    playButton.setColour (juce::TextButton::textColourOffId, juce::Colour (HubLookAndFeel::neon));
    stopButton.setColour (juce::TextButton::buttonColourId, juce::Colour (0xff3a1212));
    stopButton.setColour (juce::TextButton::textColourOffId, juce::Colour (0xffff5a4d));
    addAndMakeVisible (playButton);
    addAndMakeVisible (stopButton);
    addAndMakeVisible (clearButton);

    bpmLabel.setText ("BPM", juce::dontSendNotification);
    bpmLabel.setFont (juce::FontOptions (10.5f, juce::Font::bold));
    bpmLabel.setColour (juce::Label::textColourId, juce::Colour (HubLookAndFeel::dim));
    addAndMakeVisible (bpmLabel);
    bpmSlider.setSliderStyle (juce::Slider::LinearHorizontal);
    bpmSlider.setTextBoxStyle (juce::Slider::TextBoxRight, false, 56, 18);
    addAndMakeVisible (bpmSlider);
    bpmAttach = std::make_unique<juce::AudioProcessorValueTreeState::SliderAttachment> (
        processor.apvts, pid::bpm, bpmSlider);
    // after the attachment, or it overwrites the formatter (see addKnob)
    bpmSlider.textFromValueFunction = [] (double v)
        { return juce::String (juce::roundToInt (v)) + " BPM"; };
    bpmSlider.valueFromTextFunction = [] (const juce::String& t) { return t.getDoubleValue(); };
    bpmSlider.updateText();

    addKnob (drumKnobs, pid::kickPitch,   "Kick Pitch");
    addKnob (drumKnobs, pid::kickDecay,   "Kick Dec");
    addKnob (drumKnobs, pid::kickTone,    "Kick Tone");
    addKnob (drumKnobs, pid::snareTune,   "Snr Tune");
    addKnob (drumKnobs, pid::snareSnappy, "Snappy");
    addKnob (drumKnobs, pid::snareDecay,  "Snr Dec");
    addKnob (drumKnobs, pid::hatTune,     "Hat Tune");
    addKnob (drumKnobs, pid::hatDecay,    "Hat Dec");
    addKnob (drumKnobs, pid::clapTone,    "Clap Tone");
    addKnob (drumKnobs, pid::clapDecay,   "Clap Dec");

    //== FX ====================================================================
    addKnob (fxKnobs, pid::fxDrive,      "Amount");
    addKnob (fxKnobs, pid::fxChorus,     "Mix");
    addKnob (fxKnobs, pid::fxDelayMix,   "Mix");
    addKnob (fxKnobs, pid::fxDelayTime,  "Time");
    addKnob (fxKnobs, pid::fxDelayFb,    "Feedback");
    addKnob (fxKnobs, pid::fxReverbMix,  "Mix");
    addKnob (fxKnobs, pid::fxReverbSize, "Room");
    addKnob (fxKnobs, pid::gain,         "Master Out");
    addAndMakeVisible (fxScope);
    addAndMakeVisible (fxSpectrum);

    //== Instruments ===========================================================
    instrumentGrid.onSelect = [this] (const haos::InstrumentInfo& i)
    {
        // STUDIO stays put — clicking an instrument arms/auditions it here;
        // it must never bounce the user out to the vault (user call 2026-07-30).
        if (i.playableHere())
        {
            const float mode = i.id == "tr909" ? 1.0f : (i.id == "tr808" ? 2.0f : 0.0f);
            if (auto* p = processor.apvts.getParameter (pid::instrument))
                p->setValueNotifyingHost (p->convertTo0to1 (mode));
        }

        // let it be HEARD: preview one of its own samples right away
        const Bundle* own = nullptr;
        for (const auto& b : processor.library.getBundles())
            if (b.id == "inst-" + i.id) { own = &b; break; }
        if (own != nullptr && ! own->samples.isEmpty())
            processor.auditionFile (own->samples.getReference (0));

        setStatus (i.name.toUpperCase() + kSep
                   + (i.playableHere() ? "loaded into the engine" : i.maker)
                   + (own != nullptr ? kSep + juce::String (own->samples.size())
                                       + " samples in the VAULT" : juce::String()));
    };
    instrumentView.setViewedComponent (&instrumentGrid, false);
    instrumentView.setScrollBarsShown (true, false);
    addAndMakeVisible (instrumentView);

    categoryLabel.setText ("CATEGORY", juce::dontSendNotification);
    categoryLabel.setFont (HubLookAndFeel::displayFont (12.0f));
    categoryLabel.setColour (juce::Label::textColourId, juce::Colour (HubLookAndFeel::dim));
    addAndMakeVisible (categoryLabel);

    categoryBox.onChange = [this] { refreshInstruments(); };
    addAndMakeVisible (categoryBox);

    //== Plugins ===============================================================
    pluginList.setRowHeight (46);
    pluginList.setVisible (false);          // superseded by the card grid
    cardView.setViewedComponent (&cardHost, false);
    cardView.setScrollBarsShown (true, false);
    addAndMakeVisible (cardView);
    installAllButton.onClick = [this] { installAllPlugins(); };
    installAllButton.setComponentID ("hero");
    installAllButton.setColour (juce::TextButton::textColourOffId, juce::Colours::black);
    installAllButton.setColour (juce::TextButton::textColourOnId,  juce::Colours::black);
    addAndMakeVisible (installAllButton);
    addPackButton.onClick = [this] { addPackFromDisk(); };
    addAndMakeVisible (addPackButton);
    removePackButton.onClick = [this] { removeSelectedPack(); };
    addAndMakeVisible (removePackButton);

    installButton.onClick = [this] { installSelectedPlugin(); };
    rescanButton.onClick  = [this] { refreshPlugins(); };
    addAndMakeVisible (installButton);
    addAndMakeVisible (rescanButton);

    //== MIDI page =============================================================
    for (auto* b : { &midiClipsTab, &midiSeqTab })
    {
        b->setComponentID ("tab");
        b->setClickingTogglesState (false);
        b->setColour (juce::TextButton::buttonColourId,   juce::Colours::transparentBlack);
        b->setColour (juce::TextButton::buttonOnColourId, juce::Colours::transparentBlack);
        b->setColour (juce::TextButton::textColourOffId,  juce::Colour (HubLookAndFeel::dim));
        b->setColour (juce::TextButton::textColourOnId,   juce::Colour (HubLookAndFeel::accent));
        b->setLookAndFeel (&lnf);
        addAndMakeVisible (*b);
    }
    midiClipsTab.onClick = [this] { setMidiMode (MidiClips); };
    midiSeqTab  .onClick = [this] { setMidiMode (MidiSeq); };
    midiClipsTab.setToggleState (true, juce::dontSendNotification);

    //== Modulation page =======================================================
    // These ten routings were already wired into the engine but had no control
    // surface at all — the page is a functional unlock, not a reshuffle.
    addKnob (srcKnobs, pid::lfoRate,    "LFO Rate");
    addKnob (srcKnobs, pid::lfoDepth,   "LFO Depth");
    addKnob (srcKnobs, pid::shRate,     "S&H Rate");
    addKnob (srcKnobs, pid::pulseWidth, "Pulse Width");

    addKnob (modKnobs, pid::modEnvFilter, "Env > Filter");
    addKnob (modKnobs, pid::modEnvPitch,  "Env > Pitch");
    addKnob (modKnobs, pid::modLfoFilter, "LFO > Filter");
    addKnob (modKnobs, pid::modLfoPitch,  "LFO > Pitch");
    addKnob (modKnobs, pid::modLfoAmp,    "LFO > Amp");
    addKnob (modKnobs, pid::modLfoPwm,    "LFO > PWM");
    addKnob (modKnobs, pid::modKeyTrack,  "Key > Filter");
    addKnob (modKnobs, pid::modVelFilter, "Vel > Filter");
    addKnob (modKnobs, pid::modShFilter,  "S&H > Filter");
    addKnob (modKnobs, pid::modShPitch,   "S&H > Pitch");

    addKnob (fltEnvKnobs, pid::fltA, "Attack");
    addKnob (fltEnvKnobs, pid::fltD, "Decay");
    addKnob (fltEnvKnobs, pid::fltS, "Sustain");
    addKnob (fltEnvKnobs, pid::fltR, "Release");

    lfoWaveLabel.setText ("LFO SHAPE", juce::dontSendNotification);
    lfoWaveLabel.setFont (juce::FontOptions (10.5f, juce::Font::bold));
    lfoWaveLabel.setColour (juce::Label::textColourId, juce::Colour (HubLookAndFeel::dim));
    addAndMakeVisible (lfoWaveLabel);
    if (auto* lp = processor.apvts.getParameter (pid::lfoShape))
    {
        lfoWave = std::make_unique<haos::WaveSelector> (*lp);
        addAndMakeVisible (*lfoWave);
    }

    midiPackList.setRowHeight (44);
    addAndMakeVisible (midiPackList);
    midiItemList.setRowHeight (34);
    addAndMakeVisible (midiItemList);
    midiSearch.setTextToShowWhenEmpty ("Filter clips: genre, key, style, bpm...",
                                       juce::Colour (HubLookAndFeel::dim));
    midiSearch.onTextChange = [this] { refreshMidi(); };
    midiSearch.onEscapeKey  = [this] { midiSearch.setText ({}); refreshMidi(); };
    addAndMakeVisible (midiSearch);
    midiItemList.filesForRow = [this] (int row)
    {
        juce::StringArray out;
        if (juce::isPositiveAndBelow (row, midiFiles.size()))
            out.add (midiFiles.getReference (row).getFullPathName());
        return out;
    };
    refreshMidi();

    //== sound-pack card grid ==================================================
    packView.setViewedComponent (&packHost, false);
    packView.setScrollBarsShown (true, false);
    addAndMakeVisible (packView);
    packBackButton.onClick = [this] { openPack = -1; setPage (PageSoundPacks); };
    addAndMakeVisible (packBackButton);

    //== splash / about ========================================================
    splash.build = juce::String ("BUILD ") + __DATE__ + " " + __TIME__;
    splash.onDismiss = [this] { splash.alpha = 0.0f; splash.setVisible (false); };
    addChildComponent (splash);
    {
        // once per process: opening a plugin window repeatedly must not splash
        static bool splashShown = false;
        if (! splashShown)
        {
            splashShown = true;
            splash.setVisible (true);
            splash.toFront (false);
        }
    }

    searchBox.onEscapeKey = [this] { searchBox.setText ({}); refreshFilter(); };
    setWantsKeyboardFocus (true);

    refreshFilter();
    refreshInstruments();
    refreshPlugins();
    setPage (PageHome);

    setStatus (processor.library.getPresets().isEmpty()
                   ? "No presets cached - hit Sync haos.fm"
                   : juce::String (processor.library.getPresets().size()) + " presets ready");

    // Resizable so the window fits smaller laptop screens and the dense knob
    // grids can be enlarged; resized() already reflows.
    setResizable (true, true);
    setResizeLimits (820, 560, 1600, 1100);
    setSize (1000, 700);

    // Kick off the third-party library load HERE, not in the processor ctor —
    // plugin scanners instantiate processors without editors, and any heavy
    // work (or worse, a detached thread) during instantiation hangs the DAW.
    processor.ensureLibraryLoaded();
    refreshInstruments();     // local bundles just loaded — fill sample counts
    refreshMidi();
    refreshPacks();
    lastLibraryVersion = processor.libraryVersion.load();
    bundleList.updateContent();
    bundleList.selectRow (0);
    refreshFilter();

    startTimer (33);    // 30 fps: animation + background library refresh
}

HaosHubEditor::~HaosHubEditor()
{
    stopTimer();
    setLookAndFeel (nullptr);
}

void HaosHubEditor::auditionCurrentPatch()
{
    // Retrigger cleanly if the user is clicking through presets quickly.
    processor.keyboardState.allNotesOff (1);

    constexpr int note = 48;                        // C2 — low enough to hear the filter
    processor.keyboardState.noteOn (1, note, 0.85f);

    juce::Component::SafePointer<HaosHubEditor> safe (this);
    juce::Timer::callAfterDelay (1100, [safe]
    {
        if (safe != nullptr) safe->processor.keyboardState.noteOff (1, note, 0.0f);
    });
}

bool HaosHubEditor::keyPressed (const juce::KeyPress& k)
{
    // Cmd+1..4 selects the four top-level groups (plain digits stay free)
    if (k.getModifiers().isCommandDown())
    {
        const int d = k.getTextCharacter() - '0';
        if (d >= 1 && d <= 4)
        {
            const Page groups[] = { PageHome, PageSoundPacks, lastStudioPage, PagePlugins };
            setPage (groups[d - 1]);
            return true;
        }
    }
    return false;
}

void HaosHubEditor::mouseMove (const juce::MouseEvent& e)
{
    if (page != PageHome)
        return;
    int h = -1;
    for (int i = 0; i < 3; ++i)
        if (homeNavR[i].contains (e.getPosition()))
            h = i;
    if (h != homeHover)
    {
        homeHover = h;
        setMouseCursor (h >= 0 ? juce::MouseCursor::PointingHandCursor
                               : juce::MouseCursor::NormalCursor);
        repaint (homeNavR[0].getUnion (homeNavR[1]).getUnion (homeNavR[2]));
    }
}

void HaosHubEditor::mouseUp (const juce::MouseEvent& e)
{
    // wordmark = home button, like every hub-style app
    if (juce::Rectangle<int> (0, 0, 160, 52).contains (e.getPosition()))
        setPage (PageHome);
    else if (buildStampR.contains (e.getPosition()))
        showAbout();
    else if (page == PageHome)
    {
        const Page targets[] = { PageSoundPacks, lastStudioPage, PagePlugins };
        for (int i = 0; i < 3; ++i)
            if (homeNavR[i].contains (e.getPosition()))
            {
                setPage (targets[i]);
                return;
            }
    }
}

void HaosHubEditor::showAbout()
{
    splash.about = true;
    splash.alpha = 1.0f;
    splash.setVisible (true);
    splash.toFront (false);
    splash.setBounds (getLocalBounds());
}

void HaosHubEditor::timerCallback()
{
    // ---- splash fade ------------------------------------------------------
    if (splash.isVisible())
    {
        splash.stats = juce::String (totalPresetCount())
                     + " presets" + kSep
                     + juce::String (processor.catalog.entries().size()) + " plugins" + kSep
                     + juce::String (processor.library.getBundles().size()) + " packs";
        if (! splash.about)
        {
            if (splash.hold > 0.0f)
                splash.hold -= 0.033f;
            else
                splash.alpha -= 0.035f;
            if (splash.alpha <= 0.0f)
                splash.setVisible (false);
        }
        splash.repaint();
    }

    // ---- animation (30 fps) ----------------------------------------------
    animPhase += 0.033f;
    if (page == PagePresets && waveform.isShowing())
    {
        waveform.phase += 0.012f;
        waveform.repaint();
    }
    if (page == PageHome)
    {
        // feed the intro waveform from the master scope (2:1 decimation)
        float tmp[HaosHubProcessor::kScopeSize];
        processor.copyScope (tmp);
        for (int i = 0; i < 512; ++i)
            homeScope[i] = tmp[i * 2];
        repaint (homeWaveR.expanded (0, 8));
    }
    if (page == PageFx && fxScope.isShowing())
    {
        processor.copyScope (fxScope.data);
        fxScope.repaint();
        static_assert (FxSpectrum::kSize == HaosHubProcessor::kScopeSize,
                       "spectrum FFT reads the whole scope ring");
        fxSpectrum.push (fxScope.data, processor.getSampleRate());
        fxSpectrum.repaint();
    }
    if (loadFlash > 0.0f)
    {
        loadFlash = juce::jmax (0.0f, loadFlash - 0.045f);
        itemList.repaint();
    }
    if (itemList.getSelectedRow() >= 0 || processor.scanning.load())
        itemList.repaint();

    // ---- library refresh (checked ~twice a second) ------------------------
    if (++animTick % 15 != 0)
        return;

    // The scan worker only hands results over when WE ask, on the message
    // thread — nothing asynchronous can touch a dead processor or editor.
    processor.applyPendingScanIfReady();

    const int v = processor.libraryVersion.load();
    if (v == lastLibraryVersion)
        return;

    lastLibraryVersion = v;
    bundleList.updateContent();
    refreshFilter();
    refreshInstruments();      // sample-count pills depend on the bundles
    refreshMidi();
    refreshPacks();

    {
        int sounds = 0;
        for (const auto& b : processor.library.getBundles()) sounds += b.samples.size();
        setStatus ("HAOS library: " + juce::String (sounds) + " sounds in "
                   + juce::String (processor.library.getBundles().size()) + " packs" + kSep
                   + juce::String (processor.library.getPresets().size()) + " presets");
    }
}

void HaosHubEditor::installAllPlugins()
{
    int done = 0, failed = 0;
    for (const auto& e : processor.catalog.entries())
    {
        if (e.installed || ! e.source.exists()) continue;
        juce::String err;
        if (processor.catalog.install (e, err)) ++done; else ++failed;
    }
    refreshPlugins();
    setStatus ("Installed " + juce::String (done) + " plugins"
               + (failed > 0 ? " (" + juce::String (failed) + " failed)" : juce::String()));
}

void HaosHubEditor::addPackFromDisk()
{
    packChooser = std::make_unique<juce::FileChooser> (
        "Add a pack (folder or .zip of samples / bundle)",
        juce::File::getSpecialLocation (juce::File::userHomeDirectory), "*.zip");

    const auto flags = juce::FileBrowserComponent::openMode
                     | juce::FileBrowserComponent::canSelectFiles
                     | juce::FileBrowserComponent::canSelectDirectories;
    packChooser->launchAsync (flags, [this] (const juce::FileChooser& fc)
    {
        const auto src = fc.getResult();
        if (src == juce::File{}) return;

        const auto destRoot = PresetLibrary::bundlesDir();
        destRoot.createDirectory();
        bool ok = false;
        juce::String name = src.getFileNameWithoutExtension();

        if (src.isDirectory())
            ok = src.copyDirectoryTo (destRoot.getChildFile (src.getFileName()));
        else if (src.hasFileExtension ("zip"))
        {
            juce::ZipFile zip (src);
            ok = zip.uncompressTo (destRoot.getChildFile (name), true).wasOk();
        }

        if (ok)
        {
            processor.library.rescanBundles();
            ++processor.libraryVersion;
            setStatus ("Pack \"" + name + "\" installed");
        }
        else setStatus ("Could not install " + src.getFileName());
    });
}

void HaosHubEditor::removeSelectedPack()
{
    const auto* b = selectedBundle();
    if (b == nullptr) { setStatus ("Select a pack first (not the haos.fm row)"); return; }
    if (b->isExternal) { setStatus ("Third-party libraries are indexed, not owned - remove them in Finder"); return; }

    const auto name = b->name;
    if (b->folder.isDirectory() && b->folder.moveToTrash())
    {
        processor.library.rescanBundles();
        ++processor.libraryVersion;
        bundleList.selectRow (0);
        setStatus ("Pack \"" + name + "\" moved to Trash");
    }
    else setStatus ("Could not remove " + name);
}

//==============================================================================
void HaosHubEditor::addKnob (juce::OwnedArray<Knob>& into, const char* paramId, const juce::String& name)
{
    auto* k = into.add (new Knob());

    k->slider.setTextBoxStyle (juce::Slider::TextBoxBelow, true, 68, 15);
    k->slider.setColour (juce::Slider::textBoxTextColourId, juce::Colour (HubLookAndFeel::text));
    if (auto* tb = k->slider.getChildComponent (0))
        if (auto* le = dynamic_cast<juce::Label*> (tb))
            le->setFont (HubLookAndFeel::monoFont (11.0f));

    addAndMakeVisible (k->slider);

    k->label.setText (name.toUpperCase(), juce::dontSendNotification);
    k->label.setFont (HubLookAndFeel::displayFont (12.0f));
    k->label.setJustificationType (juce::Justification::centred);
    k->label.setColour (juce::Label::textColourId, juce::Colour (HubLookAndFeel::dim));
    addAndMakeVisible (k->label);

    k->attach = std::make_unique<juce::AudioProcessorValueTreeState::SliderAttachment> (
        processor.apvts, paramId, k->slider);

    // SliderAttachment installs its own textFromValueFunction in its constructor,
    // so ours must be applied AFTER it or it gets clobbered and the readout falls
    // back to raw floats like "1000.0000610".
    const juce::String id (paramId);
    k->slider.textFromValueFunction = [id] (double v) { return formatParam (id, v); };
    k->slider.valueFromTextFunction = [] (const juce::String& t) { return t.getDoubleValue(); };
    k->slider.updateText();
}

void HaosHubEditor::layoutKnobs (juce::OwnedArray<Knob>& knobs, juce::Rectangle<int> area, int cols)
{
    if (knobs.isEmpty() || cols <= 0)
        return;

    const int rows  = (knobs.size() + cols - 1) / cols;
    const int knobW = area.getWidth() / cols;
    // Cap the cell height: an uncapped cell stretches the knob away from its own
    // readout until the value sits closer to the NEXT row's label than its own.
    const int knobH = juce::jlimit (58, 104, area.getHeight() / juce::jmax (1, rows));

    for (int i = 0; i < knobs.size(); ++i)
    {
        const int col = i % cols, row = i / cols;
        juce::Rectangle<int> cell (area.getX() + col * knobW,
                                   area.getY() + row * knobH,
                                   knobW, knobH);
        knobs[i]->label .setBounds (cell.removeFromTop (13));
        knobs[i]->slider.setBounds (cell.reduced (3, 0));
    }
}

//==============================================================================
void HaosHubEditor::setMidiMode (MidiMode m)
{
    midiMode = m;
    midiClipsTab.setToggleState (m == MidiClips, juce::dontSendNotification);
    midiSeqTab  .setToggleState (m == MidiSeq,   juce::dontSendNotification);
    if (page == PageMidi) setPage (PageMidi);
}

void HaosHubEditor::setPage (Page p)
{
    page = p;
    if (isStudioPage (p)) lastStudioPage = p;
    if (p == PageMidi)    midiMode = MidiSeq;   // MIDI clips browse in the VAULT

    for (int i = 0; i < tabs.size(); ++i)
        tabs[i]->setToggleState (i == topIndexFor (p), juce::dontSendNotification);

    static const Page stPages[] = { PagePresets, PageInstruments, PageModulation, PageMidi, PageFx };
    for (int i = 0; i < studioTabs.size(); ++i)
    {
        studioTabs[i]->setVisible (isStudioPage (p));
        studioTabs[i]->setToggleState (isStudioPage (p) && stPages[i] == p, juce::dontSendNotification);
    }

    const bool packs = (p == PageSoundPacks);
    const bool pre   = (p == PagePresets);
    const bool midi  = (p == PageMidi);
    const bool inst  = (p == PageInstruments);
    const bool mod   = (p == PageModulation);
    const bool plug  = (p == PagePlugins);
    const bool fxp   = (p == PageFx);
    const bool clips = midi && midiMode == MidiClips;
    const bool seq   = midi && midiMode == MidiSeq;

    //-- Sound Packs: vault grid, or one opened pack --------------------------
    const bool packGrid = packs && openPack < 0;
    const bool packOpen = packs && openPack >= 0;
    bundleList      .setVisible (false);          // superseded by the card grid
    packView        .setVisible (packGrid);
    packBackButton  .setVisible (packOpen);
    addPackButton   .setVisible (packGrid);
    removePackButton.setVisible (packOpen);

    //-- shared browser (sounds of the OPEN pack, patches on Presets) ---------
    itemList     .setVisible (packOpen || pre);
    searchBox    .setVisible (packs || pre);
    hintLabel    .setVisible (packOpen || pre);
    instrumentBox.setVisible (pre);
    presetCategoryBox.setVisible (pre);
    syncButton   .setVisible (pre);

    //-- Presets: the analog patch editor ------------------------------------
    if (osc1Wave) osc1Wave->setVisible (pre);
    if (osc2Wave) osc2Wave->setVisible (pre);
    if (osc3Wave) osc3Wave->setVisible (pre);
    osc1Label.setVisible (pre);
    osc2Label.setVisible (pre);
    osc3Label.setVisible (pre);
    for (auto* k : synthKnobs) { k->slider.setVisible (pre); k->label.setVisible (pre); }
    for (auto* f : adsrFaders) { f->slider.setVisible (pre); f->label.setVisible (pre); }
    adsrTitle.setVisible (false);       // painted section header instead
    waveform .setVisible (pre);

    //-- Modulation: sources, matrix, filter envelope ------------------------
    for (auto* k : srcKnobs)    { k->slider.setVisible (mod); k->label.setVisible (mod); }
    for (auto* k : modKnobs)    { k->slider.setVisible (mod); k->label.setVisible (mod); }
    for (auto* k : fltEnvKnobs) { k->slider.setVisible (mod); k->label.setVisible (mod); }
    if (lfoWave) lfoWave->setVisible (mod);
    lfoWaveLabel.setVisible (mod);

    // the keybed follows wherever sound is being shaped or played
    keyboard.setVisible (pre || mod || seq);

    //-- MIDI: step sequencer (clip browsing moved into the VAULT) -----------
    midiClipsTab.setVisible (false);
    midiSeqTab  .setVisible (false);
    midiPackList.setVisible (false);
    midiItemList.setVisible (false);
    midiSearch  .setVisible (false);
    juce::ignoreUnused (clips);
    if (grid) grid->setVisible (seq);
    playButton .setVisible (seq);
    stopButton .setVisible (seq);
    clearButton.setVisible (seq);
    bpmSlider  .setVisible (seq);
    bpmLabel   .setVisible (seq);
    for (auto* k : drumKnobs) { k->slider.setVisible (seq); k->label.setVisible (seq); }

    //-- Instruments / Plugins / FX ------------------------------------------
    instrumentView.setVisible (inst);
    categoryBox   .setVisible (inst);
    categoryLabel .setVisible (inst);

    pluginList      .setVisible (false);     // card grid replaced the list
    installButton   .setVisible (false);     // cards install themselves
    cardView        .setVisible (plug);
    installAllButton.setVisible (plug);
    rescanButton    .setVisible (plug);

    for (auto* k : fxKnobs) { k->slider.setVisible (fxp); k->label.setVisible (fxp); }
    fxScope   .setVisible (fxp);
    fxSpectrum.setVisible (fxp);

    if (packs || pre)
    {
        searchBox.setTextToShowWhenEmpty (packs ? "Search sounds in your packs..."
                                                : "Search presets...",
                                          juce::Colour (HubLookAndFeel::dim));
        refreshFilter();                      // the two pages share one list
    }
    resized();
    repaint();
}

bool HaosHubEditor::showingSamples() const
{
    return page == PageSoundPacks;      // the page decides now, not the selection
}

const Bundle* HaosHubEditor::selectedBundle() const
{
    const auto& bundles = processor.library.getBundles();
    return juce::isPositiveAndBelow (openPack, bundles.size())
             ? &bundles.getReference (openPack) : nullptr;
}

int HaosHubEditor::totalPresetCount() const
{
    // Bundle factory presets are ingested into the global list (source=pack),
    // so the list alone is the truth — summing bundles again double-counted.
    return processor.library.getPresets().size();
}

void HaosHubEditor::refreshPacks()
{
    packIdx.clearQuick();
    const auto& bundles = processor.library.getBundles();
    for (int i = 0; i < bundles.size(); ++i)
        packIdx.add (i);              // every pack — audio AND MIDI — is a vault card

    // Packs with real cover artwork lead the vault; placeholder-cover packs
    // follow, each group keeping its original order.
    std::stable_sort (packIdx.begin(), packIdx.end(), [&bundles] (int a, int b)
    {
        return bundles.getReference (a).cover.isValid()
             > bundles.getReference (b).cover.isValid();
    });
    bundleList.updateContent();
    bundleList.repaint();
    if (openPack >= 0 && ! packIdx.contains (openPack))
        openPack = -1;
    rebuildPackCards();
}

void HaosHubEditor::refreshFilter()
{
    const auto query = searchBox.getText().trim();

    const auto instruments = processor.library.getInstruments();

    // Compare contents, not just the count: a same-sized but differently-named
    // set would otherwise leave stale entries that match no preset.
    juce::StringArray currentItems;
    for (int i = 1; i < instrumentBox.getNumItems(); ++i)
        currentItems.add (instrumentBox.getItemText (i));

    if (currentItems != instruments)
    {
        const auto previous = instrumentBox.getText();
        instrumentBox.clear (juce::dontSendNotification);
        instrumentBox.addItem ("All instruments", 1);
        for (int i = 0; i < instruments.size(); ++i)
            instrumentBox.addItem (instruments[i], i + 2);

        auto id = instrumentBox.getSelectedId();
        for (int i = 0; i < instruments.size(); ++i)
            if (instruments[i] == previous)
                id = i + 2;

        instrumentBox.setSelectedId (id > 0 ? id : 1, juce::dontSendNotification);
    }

    if (showingSamples())
    {
        sampleFiles.clearQuick();
        const auto& bundles = processor.library.getBundles();
        auto take = [&] (const haos::Bundle& b)
        {
            for (const auto& f : b.samples)
                if (query.isEmpty() || f.getFileName().containsIgnoreCase (query))
                    sampleFiles.add (f);
        };
        if (auto* b = selectedBundle())
            take (*b);
        else
            for (int i : packIdx) take (bundles.getReference (i));   // browse everything
    }
    else
    {
        // category combo mirrors the taxonomy actually present in the library
        {
            juce::StringArray cats;
            for (const auto& pr : processor.library.getPresets())
                if (pr.category.isNotEmpty())
                    cats.addIfNotAlreadyThere (pr.category);
            cats.sortNatural();

            juce::StringArray current;
            for (int i = 1; i < presetCategoryBox.getNumItems(); ++i)
                current.add (presetCategoryBox.getItemText (i));
            if (current != cats)
            {
                const auto previous = presetCategoryBox.getText();
                presetCategoryBox.clear (juce::dontSendNotification);
                presetCategoryBox.addItem ("All categories", 1);
                for (int i = 0; i < cats.size(); ++i)
                    presetCategoryBox.addItem (cats[i], i + 2);
                int id = 1;
                for (int i = 0; i < cats.size(); ++i)
                    if (cats[i] == previous) id = i + 2;
                presetCategoryBox.setSelectedId (id, juce::dontSendNotification);
            }
        }

        const auto instrument = instrumentBox.getSelectedId() > 1 ? instrumentBox.getText()
                                                                  : juce::String();
        const auto category   = presetCategoryBox.getSelectedId() > 1 ? presetCategoryBox.getText()
                                                                      : juce::String();
        filtered = processor.library.search (query, instrument, category);
    }

    itemList.updateContent();
    itemList.repaint();
    bundleList.repaint();
}

void HaosHubEditor::loadPreset (const Preset& preset)
{
    if (preset.isDrumPattern())
    {
        const bool playable = processor.loadDrumPreset (preset);
        setMidiMode (MidiSeq);          // drum patterns live in the step grid
        setPage (PageMidi);
        if (grid) grid->repaint();

        if (playable)
        {
            processor.sequencer.start();
            setStatus ("Playing " + preset.name + kSep + preset.instrument.toUpperCase()
                       + kSep + juce::String (preset.bpm > 0 ? (int) preset.bpm : 120) + " BPM");
        }
        else
        {
            // Kit-sound-only preset: loaded its voices, but there is no pattern.
            setStatus ("Loaded " + preset.name + " kit ("+ preset.instrument.toUpperCase()
                       + ") - paint a pattern and press Play");
        }
        return;
    }

    if (PresetLibrary::applyToState (preset, processor.apvts))
    {
        if (auto* p = processor.apvts.getParameter (pid::instrument))
            p->setValueNotifyingHost (p->convertTo0to1 (0.0f));   // analog engine

        processor.currentPresetName = preset.name;

        // Audition straight away. Loading a patch only moves parameters, so with
        // nothing sounding the change is inaudible and the preset reads as dead.
        auditionCurrentPatch();
        loadFlash = 1.0f;

        setStatus ("Loaded " + preset.name
                   + (preset.author.isNotEmpty() ? kSep + preset.author : juce::String()));
    }
    else
    {
        setStatus (preset.name + " has no parameters this engine can map"
                   + kSep + "it is a pattern or an external patch file");
    }
}

void HaosHubEditor::startSync()
{
    if (processor.client.isSyncing())
        return;

    syncButton.setEnabled (false);
    setStatus ("Contacting " + processor.client.getBaseUrl() + "...");

    juce::Component::SafePointer<HaosHubEditor> safe (this);

    processor.client.sync (
        haos::HaosFmClient::defaultInstruments(),
        [safe] (juce::String msg) mutable { if (safe != nullptr) safe->setStatus (msg); },
        [safe] (bool ok, juce::String summary) mutable
        {
            if (safe == nullptr)
                return;

            // Always re-read local state, even on failure: the user may have
            // dropped a new sample pack into Bundles, and an offline sync must
            // not leave the browser stale.
            safe->processor.library.loadCaches();
            safe->processor.library.rescanBundles();
            safe->bundleList.updateContent();
            safe->refreshFilter();
            safe->refreshInstruments();

            safe->syncButton.setEnabled (true);
            safe->setStatus (summary);
        });
}

void HaosHubEditor::setStatus (const juce::String& msg)
{
    statusLabel.setText (msg, juce::dontSendNotification);
}

void HaosHubEditor::refreshInstruments()
{
    instrumentCatalog.load();
    const auto& all = instrumentCatalog.all();

    // Keep the category menu in step with what the catalog actually holds.
    juce::StringArray cats;
    for (const auto& i : all)
        cats.addIfNotAlreadyThere (i.category);
    cats.sort (true);

    juce::StringArray currentCats;
    for (int i = 1; i < categoryBox.getNumItems(); ++i)
        currentCats.add (categoryBox.getItemText (i));

    if (currentCats != cats)
    {
        const auto previous = categoryBox.getText();
        categoryBox.clear (juce::dontSendNotification);
        categoryBox.addItem ("All categories", 1);
        for (int i = 0; i < cats.size(); ++i)
            categoryBox.addItem (cats[i], i + 2);

        int id = 1;
        for (int i = 0; i < cats.size(); ++i)
            if (cats[i] == previous)
                id = i + 2;
        categoryBox.setSelectedId (id, juce::dontSendNotification);
    }

    const auto wanted = categoryBox.getSelectedId() > 1 ? categoryBox.getText() : juce::String();

    juce::Array<haos::InstrumentInfo> shown;
    for (const auto& i : all)
        if (wanted.isEmpty() || i.category == wanted)
            shown.add (i);

    // cross-reference the local instrument bundles so cards show real content
    for (auto& i : shown)
        for (const auto& b : processor.library.getBundles())
            if (b.id == "inst-" + i.id)
                i.localSamples = b.samples.size();

    instrumentGrid.setItems (shown);
    resized();
}

void HaosHubEditor::refreshPlugins()
{
    processor.catalog.refresh();
    pluginList.updateContent();
    pluginList.repaint();
    updateInstallButton();

    // rebuild the Cymatics-style card grid
    cards.clear();
    const auto artDir = haos::PresetLibrary::rootDir().getChildFile ("PluginArt");

    // Curated shelf: only what actually ships in the HAOS Suite. Retired
    // experiments (RubikChord, Manta, VisualForge, the Clipper Web prototype)
    // are hidden rather than deleted — they stay installed for whoever uses
    // them, they just don't pose as products here.
    static const juce::StringArray kSuite
    {
        "HAOS Hub", "HAOS TechnoForge", "HAOS TechnoForge MIDI",
        "HAOS Comp", "HAOS Limiter", "HAOS EQ", "HAOS Sat", "HAOS Gate",
        "HAOS Verb", "HAOS Echo", "HAOS Width", "HAOS Clipper"
    };
    for (const auto& e : processor.catalog.entries())
    {
        if (! kSuite.contains (e.name))
            continue;
        auto* card = cards.add (new PluginCard());
        card->entry = e;
        if (auto f = artDir.getChildFile (e.name + ".png"); f.existsAsFile())
            card->art = juce::ImageFileFormat::loadFrom (f);
        const auto name = e.name;
        card->onInstall = [this, name]
        {
            for (const auto& it : processor.catalog.entries())
                if (it.name == name)
                {
                    juce::String err;
                    if (processor.catalog.install (it, err))
                        setStatus ("Installed " + name);
                    else
                        setStatus ("Install failed: " + err);
                    refreshPlugins();
                    return;
                }
        };
        cardHost.addAndMakeVisible (card);
    }
    layoutPluginCards();
    setStatus (juce::String (processor.catalog.entries().size()) + " HAOS plugins found");
}

void HaosHubEditor::layoutPluginCards()
{
    const int vw   = juce::jmax (300, cardView.getWidth() - 14);
    const int cols = juce::jmax (1, vw / 300);
    const int cw   = vw / cols, ch = 236;
    for (int i = 0; i < cards.size(); ++i)
        cards[i]->setBounds ((i % cols) * cw, (i / cols) * ch, cw, ch);
    const int rows = (cards.size() + cols - 1) / cols;
    cardHost.setSize (vw, juce::jmax (1, rows * ch));
}

void HaosHubEditor::updateInstallButton()
{
    const auto row = pluginList.getSelectedRow();
    const auto& items = processor.catalog.entries();
    const bool canInstall = juce::isPositiveAndBelow (row, items.size())
                            && items.getReference (row).source.exists()
                            && ! items.getReference (row).installed;
    installButton.setEnabled (canInstall);
}

void HaosHubEditor::installSelectedPlugin()
{
    const auto row = pluginList.getSelectedRow();
    const auto& items = processor.catalog.entries();
    if (! juce::isPositiveAndBelow (row, items.size()))
    {
        setStatus ("Select a plugin first");
        return;
    }

    const auto entry = items.getReference (row);
    juce::String error;

    if (processor.catalog.install (entry, error))
    {
        setStatus ("Installed " + entry.name + " -> " + haos::PluginCatalog::vst3Dir().getFullPathName());
        refreshPlugins();
    }
    else
    {
        setStatus ("Install failed: " + error);
    }
}

//==============================================================================
void HaosHubEditor::paint (juce::Graphics& g)
{
    // carbon background art (Hub/bg.png) with the flat colour as fallback
    static const juce::Image bgImg = []
    {
        auto f = haos::PresetLibrary::rootDir().getChildFile ("bg.png");
        return f.existsAsFile() ? juce::ImageFileFormat::loadFrom (f) : juce::Image();
    }();
    if (bgImg.isValid())
        g.drawImage (bgImg, getLocalBounds().toFloat(),
                     juce::RectanglePlacement::fillDestination);
    else
        g.fillAll (juce::Colour (HubLookAndFeel::bg));

    // STUDIO leitmotif: one shared underground-tunnel plate behind all five
    // studio sub-pages, washed down so panels and knobs stay legible.
    if (isStudioPage (page) && studioBackImg.isValid())
    {
        auto content = getLocalBounds().withTrimmedTop (52 + 30).withTrimmedBottom (26);
        g.setOpacity (0.32f);
        g.drawImage (studioBackImg, content.toFloat(),
                     juce::RectanglePlacement::fillDestination);
        g.setOpacity (1.0f);
    }

    // Header: one slim near-black bar holding wordmark + inline tabs (mockup
    // chrome), with the site's orange->gold rule underneath.
    g.setColour (juce::Colour (HubLookAndFeel::panel));
    g.fillRect (0, 0, getWidth(), 52);

    // A gradient fill stays active until something replaces it, so each gradient
    // is scoped — otherwise it leaks into every later fill on this Graphics.
    {
        juce::Graphics::ScopedSaveState ss (g);
        juce::ColourGradient rule (juce::Colour (HubLookAndFeel::accent), 0.0f, 0.0f,
                                   juce::Colour (HubLookAndFeel::accent), (float) getWidth(), 0.0f, false);
        rule.addColour (0.5, juce::Colour (HubLookAndFeel::gold));
        g.setGradientFill (rule);
        g.fillRect (0, 50, getWidth(), 2);
    }

    // Embossed wordmark watermark pressed into the background steel.
    {
        static juce::Image wmW, wmB; static bool wmDone = false;
        if (! wmDone)
        {
            wmDone = true;
            auto lf = juce::File::getSpecialLocation (juce::File::userApplicationDataDirectory)
                         .getChildFile ("Application Support/HAOS/logo.png");
            if (lf.existsAsFile())
            {
                wmW = juce::ImageFileFormat::loadFrom (lf);
                if (wmW.isValid())
                {
                    wmB = wmW.createCopy();
                    juce::Image::BitmapData bd (wmB, juce::Image::BitmapData::readWrite);
                    for (int y = 0; y < bd.height; ++y)
                        for (int x = 0; x < bd.width; ++x)
                            bd.setPixelColour (x, y, juce::Colours::black.withAlpha (bd.getPixelColour (x, y).getAlpha()));
                }
            }
        }
        if (wmW.isValid())
        {
            const float ww = juce::jmin (420.0f, getWidth() * 0.42f);
            juce::Rectangle<float> wr (getWidth() - ww - 40.0f, getHeight() - ww * 0.65f - 60.0f, ww, ww * 0.65f);
            const auto place = juce::RectanglePlacement (juce::RectanglePlacement::centred);
            g.setOpacity (0.30f); g.drawImage (wmB, wr.translated (0.0f, 2.0f), place);
            g.setOpacity (0.045f); g.drawImage (wmW, wr, place);
            g.setOpacity (1.0f);
        }
    }

    // Wordmark: the official HAOS logotype when available, else gradient glyphs.
    {
        static juce::Image logo = [] {
            auto f = juce::File::getSpecialLocation (juce::File::userApplicationDataDirectory)
                        .getChildFile ("Application Support/HAOS/logo.png");
            return f.existsAsFile() ? juce::ImageFileFormat::loadFrom (f) : juce::Image();
        }();

        if (logo.isValid())
        {
            auto mark = juce::Rectangle<float> (16.0f, 6.0f, 74.0f, 44.0f);
            g.setOpacity (0.96f);
            g.drawImage (logo, mark, juce::RectanglePlacement (juce::RectanglePlacement::centred));
            g.setOpacity (1.0f);
            g.setColour (juce::Colour (HubLookAndFeel::gold));
            g.setFont (HubLookAndFeel::displayFont (17.0f));
            g.drawText ("HUB", juce::Rectangle<int> (96, 16, 60, 26), juce::Justification::centredLeft, false);
        }
        else
        {
        juce::Graphics::ScopedSaveState ss (g);
        auto mark = juce::Rectangle<int> (14, 10, 230, 34);

        juce::GlyphArrangement ga;
        ga.addLineOfText (HubLookAndFeel::displayFont (28.0f), "HAOS HUB",
                          (float) mark.getX(), (float) mark.getCentreY() + 9.0f);
        juce::Path textPath;
        ga.createPath (textPath);

        g.reduceClipRegion (textPath, {});

        juce::ColourGradient grad (juce::Colour (HubLookAndFeel::accent), (float) mark.getX(), 0.0f,
                                   juce::Colour (HubLookAndFeel::accent), (float) mark.getRight(), 0.0f, false);
        grad.addColour (0.5, juce::Colour (HubLookAndFeel::gold));
        g.setGradientFill (grad);
        g.fillRect (mark.expanded (4));
        }
    }

    // Active-tab underline — makes the tab row read as a tab strip.
    if (juce::isPositiveAndBelow (topIndexFor (page), tabs.size()))
    {
        auto tb = tabs[topIndexFor (page)]->getBounds();
        g.setColour (juce::Colour (HubLookAndFeel::accent));
        g.fillRoundedRectangle ((float) tb.getX() + 2, (float) tb.getBottom() - 1,
                                (float) tb.getWidth() - 4, 3.0f, 1.5f);
    }

    // STUDIO sub-tab row: hairline under the row + accent tick on the active sub-tab.
    if (isStudioPage (page))
    {
        g.setColour (juce::Colours::white.withAlpha (0.06f));
        g.drawHorizontalLine (52 + 30, 12.0f, (float) getWidth() - 12.0f);
        static const Page stPages[] = { PagePresets, PageInstruments, PageModulation, PageMidi, PageFx };
        for (int i = 0; i < studioTabs.size() && i < 5; ++i)
            if (stPages[i] == page)
            {
                auto sb = studioTabs[i]->getBounds();
                g.setColour (juce::Colour (HubLookAndFeel::accent));
                g.fillRoundedRectangle ((float) sb.getX() + 4, (float) sb.getBottom() - 1,
                                        (float) sb.getWidth() - 8, 2.0f, 1.0f);
            }
    }

    auto panelRect = [&g] (juce::Rectangle<int> rr, const juce::String& title)
    {
        g.setColour (juce::Colour (HubLookAndFeel::panel));
        g.fillRoundedRectangle (rr.toFloat(), 8.0f);
        g.setColour (juce::Colour (0xff2a2d34));
        g.drawRoundedRectangle (rr.toFloat().reduced (0.5f), 8.0f, 1.0f);
        if (title.isNotEmpty())
        {
            g.setColour (juce::Colour (HubLookAndFeel::dim));
            g.setFont (juce::FontOptions (10.5f, juce::Font::bold));
            g.drawText (title, rr.getX() + 12, rr.getY() + 6, rr.getWidth() - 20, 14,
                        juce::Justification::centredLeft, true);
        }
    };

    // which binary am I looking at? — settles every stale-plugin mystery
    g.setColour (juce::Colour (HubLookAndFeel::dim).withAlpha (0.55f));
    g.setFont (HubLookAndFeel::monoFont (9.0f));
    buildStampR = { getWidth() - 190, getHeight() - 20, 180, 14 };
    g.drawText (juce::String ("BUILD ") + __DATE__ + " " + __TIME__,
                buildStampR, juce::Justification::centredRight, false);

    if (page == PageHome)
    {
        // ---- LIVE intro: hero plate (or wordmark), breathing waveform -------
        if (homeBackImg.isValid())
        {
            // the embossed-wordmark plate IS the wordmark — art carries the page
            juce::Graphics::ScopedSaveState ss (g);
            g.reduceClipRegion (homeHeroR);
            g.drawImage (homeBackImg, homeHeroR.toFloat(),
                         juce::RectanglePlacement::fillDestination);
        }
        g.setColour (juce::Colours::black.withAlpha (homeBackImg.isValid() ? 0.34f : 0.5f));
        g.fillRect (homeHeroR);

        static const juce::Image heroLogo = []
        {
            auto f = juce::File::getSpecialLocation (juce::File::userApplicationDataDirectory)
                        .getChildFile ("Application Support/HAOS/logo.png");
            return f.existsAsFile() ? juce::ImageFileFormat::loadFrom (f) : juce::Image();
        }();

        auto hero = homeHeroR;
        hero.removeFromTop (juce::jmax (12, hero.getHeight() / 16));
        if (homeBackImg.isValid())
        {
            // plate already carries the mark; tagline + stats ride at the top
        }
        else if (heroLogo.isValid())
        {
            auto lr = hero.removeFromTop (juce::jmin (140, hero.getHeight() / 4))
                          .toFloat().reduced (hero.getWidth() * 0.30f, 0.0f);
            g.setOpacity (0.97f);
            g.drawImage (heroLogo, lr, juce::RectanglePlacement (juce::RectanglePlacement::centred));
            g.setOpacity (1.0f);
        }
        else
        {
            // gradient logotype fallback, same orange->gold treatment as the header
            auto lr = hero.removeFromTop (76);
            juce::Graphics::ScopedSaveState ss (g);
            juce::GlyphArrangement ga;
            const auto f = HubLookAndFeel::displayFont (64.0f);
            const float tw = juce::GlyphArrangement::getStringWidth (f, "HAOS HUB");
            ga.addLineOfText (f, "HAOS HUB", lr.getCentreX() - tw * 0.5f,
                              (float) lr.getCentreY() + 22.0f);
            juce::Path tp;
            ga.createPath (tp);
            g.reduceClipRegion (tp, {});
            juce::ColourGradient grad (juce::Colour (HubLookAndFeel::accent),
                                       lr.getCentreX() - tw * 0.5f, 0.0f,
                                       juce::Colour (HubLookAndFeel::gold),
                                       lr.getCentreX() + tw * 0.5f, 0.0f, false);
            g.setGradientFill (grad);
            g.fillRect (lr);
        }

        hero.removeFromTop (6);
        g.setColour (juce::Colours::white.withAlpha (0.94f));
        g.setFont (HubLookAndFeel::displayFont (27.0f));
        g.drawText ("YOUR WHOLE STUDIO, UNLOCKED", hero.removeFromTop (32),
                    juce::Justification::centred, false);

        const auto stats = juce::String (totalPresetCount()) + " PRESETS" + kSep
                         + juce::String (processor.catalog.entries().size()) + " PLUGINS" + kSep
                         + juce::String (processor.library.getBundles().size()) + " PACKS";
        g.setColour (juce::Colour (HubLookAndFeel::gold).withAlpha (0.85f));
        g.setFont (HubLookAndFeel::monoFont (12.0f));
        g.drawText (stats, hero.removeFromTop (20), juce::Justification::centred, false);

        // ---- live waveform band (engine scope; breathes on its own in silence)
        if (! homeWaveR.isEmpty())
        {
            auto wr = homeWaveR.toFloat();
            float peak = 0.0f;
            for (float v : homeScope)
                peak = juce::jmax (peak, std::abs (v));
            const bool live = peak > 0.001f;

            g.setColour (juce::Colours::white.withAlpha (0.05f));
            g.drawHorizontalLine ((int) wr.getCentreY(), wr.getX(), wr.getRight());

            juce::Path trace;
            const float midY = wr.getCentreY();
            const float amp  = wr.getHeight() * 0.46f;
            // auto-gain: quiet material still reads as a waveform, not a flatline
            const float gain = live ? juce::jlimit (1.0f, 6.0f, 0.85f / peak) : 1.0f;
            constexpr int N  = 512;
            for (int i = 0; i < N; ++i)
            {
                const float t = i / (float) (N - 1);
                const float x = wr.getX() + wr.getWidth() * t;
                float v;
                if (live)
                    v = juce::jlimit (-1.0f, 1.0f, homeScope[i] * gain);
                else
                {
                    // idle breathing wave: two detuned partials under a slow
                    // amplitude swell, so the page is alive even in silence
                    const float env = std::sin (t * juce::MathConstants<float>::pi);
                    v = (std::sin (t * 46.0f + animPhase * 2.4f) * 0.72f
                       + std::sin (t * 11.0f - animPhase * 1.1f) * 0.38f) * env
                        * (0.52f + 0.20f * std::sin (animPhase * 1.3f));
                }
                const float y = midY - amp * v;
                if (i == 0) trace.startNewSubPath (x, y);
                else        trace.lineTo (x, y);
            }

            const auto ac = juce::Colour (HubLookAndFeel::accent);
            g.setColour (ac.withAlpha (0.14f + 0.28f * juce::jlimit (0.0f, 1.0f, peak)));
            g.strokePath (trace, juce::PathStrokeType (7.0f, juce::PathStrokeType::curved));
            g.setColour (ac.withAlpha (0.55f));
            g.strokePath (trace, juce::PathStrokeType (3.0f, juce::PathStrokeType::curved));
            g.setColour (ac.brighter (0.35f));
            g.strokePath (trace, juce::PathStrokeType (1.3f, juce::PathStrokeType::curved));
        }

        // ---- three nav cards -------------------------------------------------
        const char* navTitles[] = { "VAULT", "STUDIO", "PLUGINS" };
        const char* navSubs[]   = { "your sounds", "play + shape", "install the suite" };
        for (int i = 0; i < 3; ++i)
        {
            auto c = homeNavR[i].toFloat();
            if (c.isEmpty()) continue;
            const bool hov = homeHover == i;

            g.setColour (juce::Colour (0xff141519).withAlpha (0.93f).brighter (hov ? 0.05f : 0.0f));
            g.fillRoundedRectangle (c, 10.0f);
            g.setColour (hov ? juce::Colour (HubLookAndFeel::accent) : juce::Colour (0xff26262c));
            g.drawRoundedRectangle (c.reduced (0.5f), 10.0f, hov ? 1.6f : 1.0f);
            if (hov)
            {
                g.setColour (juce::Colour (HubLookAndFeel::accent).withAlpha (0.9f));
                g.fillRoundedRectangle (c.getX() + 1.5f, c.getY() + 10.0f, 3.0f, c.getHeight() - 20.0f, 1.5f);
            }

            auto tr2 = homeNavR[i].reduced (18, 14);
            g.setColour (juce::Colour (HubLookAndFeel::text));
            g.setFont (HubLookAndFeel::displayFont (22.0f));
            g.drawText (navTitles[i], tr2.removeFromTop (28), juce::Justification::centredLeft, false);
            g.setColour (juce::Colour (HubLookAndFeel::dim));
            g.setFont (HubLookAndFeel::monoFont (11.5f));
            g.drawText (navSubs[i], tr2.removeFromTop (18), juce::Justification::centredLeft, false);

            g.setColour ((hov ? juce::Colour (HubLookAndFeel::accent)
                              : juce::Colour (HubLookAndFeel::dim)).withAlpha (0.9f));
            g.setFont (HubLookAndFeel::displayFont (20.0f));
            g.drawText (juce::String::fromUTF8 ("\xe2\x86\x92"), homeNavR[i].reduced (16, 10),
                        juce::Justification::bottomRight, false);
        }
    }
    else if (page == PagePresets || page == PageSoundPacks || page == PageModulation)
    {
        if (page == PagePresets)
        {
            g.setColour (juce::Colour (HubLookAndFeel::panel));
            g.fillRect (getWidth() - 300, 82, 300, getHeight() - 82 - 108);
        }

        // Headed metal sections (bounds computed in resized()).
        auto section = [&g] (juce::Rectangle<int> rr, const char* title)
        {
            if (rr.isEmpty())
                return;
            auto f = rr.toFloat();
            {
                juce::Graphics::ScopedSaveState ss (g);
                juce::ColourGradient steel (juce::Colour (0xff191a1f), f.getX(), f.getY(),
                                            juce::Colour (0xff0f1013), f.getX(), f.getBottom(), false);
                g.setGradientFill (steel);
                g.fillRoundedRectangle (f, 7.0f);
            }
            // bevel: light top edge, shadowed bottom, hairline border
            g.setColour (juce::Colours::white.withAlpha (0.06f));
            g.drawHorizontalLine ((int) f.getY() + 1, f.getX() + 6.0f, f.getRight() - 6.0f);
            g.setColour (juce::Colours::black.withAlpha (0.5f));
            g.drawHorizontalLine ((int) f.getBottom() - 1, f.getX() + 6.0f, f.getRight() - 6.0f);
            g.setColour (juce::Colour (0xff2a2d34));
            g.drawRoundedRectangle (f.reduced (0.5f), 7.0f, 1.0f);

            g.setColour (juce::Colour (HubLookAndFeel::dim));
            g.setFont (HubLookAndFeel::displayFont (12.0f));
            g.drawText (title, rr.getX() + 10, rr.getY() + 3, rr.getWidth() - 20, 12,
                        juce::Justification::centredLeft, false);
            g.setColour (juce::Colour (HubLookAndFeel::accent).withAlpha (0.75f));
            g.fillRect (rr.getX() + 10, rr.getY() + 15, 18, 2);
        };
        if (page == PagePresets)
        {
            section (oscSect,  "OSC");
            section (filtSect, "FILTER");
            section (envSect,  "AMP ENV");
        }
        else if (page == PageModulation)
        {
            section (srcSect,    "SOURCES");
            section (matrixSect, "MODULATION MATRIX");
            section (fltSect,    "FILTER ENVELOPE");
        }

        if (page == PageSoundPacks && openPack >= 0 && ! packHeaderR.isEmpty())
        {
            const auto& bundles2 = processor.library.getBundles();
            if (juce::isPositiveAndBelow (openPack, bundles2.size()))
            {
                const auto& bnd = bundles2.getReference (openPack);
                auto hr = packHeaderR.toFloat();
                g.setColour (juce::Colour (0xff17181c));
                g.fillRoundedRectangle (hr, 10.0f);
                auto cov = hr.removeFromLeft (hr.getHeight() * 1.25f).reduced (8.0f);
                {
                    juce::Graphics::ScopedSaveState ss (g);
                    juce::Path rp; rp.addRoundedRectangle (cov, 6.0f);
                    g.reduceClipRegion (rp);
                    if (bnd.cover.isValid())
                        g.drawImage (bnd.cover, cov, juce::RectanglePlacement::fillDestination);
                    else
                    {
                        g.setColour (juce::Colour (0xff101114)); g.fillRect (cov);
                    }
                }
                auto tx = hr.reduced (14.0f, 12.0f);
                g.setColour (juce::Colour (HubLookAndFeel::text));
                g.setFont (HubLookAndFeel::displayFont (30.0f));
                g.drawText (bnd.name.replace ("HAOS — ", "").toUpperCase(),
                            tx.removeFromTop (36.0f).toNearestInt(),
                            juce::Justification::centredLeft, true);
                g.setColour (juce::Colour (HubLookAndFeel::gold).withAlpha (0.85f));
                g.setFont (HubLookAndFeel::monoFont (13.0f));
                g.drawText (juce::String (bnd.samples.size()) + " SOUNDS"
                            + kSep + "click = audition" + kSep + "drag = to your DAW",
                            tx.removeFromTop (20.0f).toNearestInt(),
                            juce::Justification::centredLeft, false);
                g.setColour (juce::Colour (0xff2a2d34));
                g.drawRoundedRectangle (packHeaderR.toFloat().reduced (0.5f), 10.0f, 1.0f);
            }
        }

        if (false && ! sideHeader.isEmpty())
        {
            g.setColour (juce::Colour (HubLookAndFeel::dim));
            g.setFont (HubLookAndFeel::displayFont (12.0f));
            g.drawText ("SOUND PACKS", sideHeader.withTrimmedLeft (2),
                        juce::Justification::centredLeft, false);
            g.setColour (juce::Colour (HubLookAndFeel::accent).withAlpha (0.75f));
            g.fillRect (sideHeader.getX() + 2, sideHeader.getBottom() - 2, 18, 2);
        }

        // hero banner: AI art + live library stats on the free right side
        if (page == PageSoundPacks && bannerImg.isValid() && ! bannerR.isEmpty())
        {
            auto bf = bannerR.toFloat();
            {
                juce::Graphics::ScopedSaveState ss (g);
                juce::Path rp; rp.addRoundedRectangle (bf, 8.0f);
                g.reduceClipRegion (rp);
                g.drawImage (bannerImg, bf, juce::RectanglePlacement::fillDestination);
            }
            g.setColour (juce::Colour (0xff2a2d34));
            g.drawRoundedRectangle (bf.reduced (0.5f), 8.0f, 1.0f);
            g.setColour (juce::Colour (HubLookAndFeel::accent).withAlpha (0.10f));
            g.drawRoundedRectangle (bf.expanded (1.5f), 9.0f, 2.0f);

            const auto stats = juce::String (totalPresetCount())
                             + " presets" + kSep
                             + juce::String (processor.catalog.entries().size()) + " plugins" + kSep
                             + juce::String (processor.library.getBundles().size()) + " packs";
            auto tr = bannerR.reduced (18, 10);
            g.setColour (juce::Colours::white.withAlpha (0.92f));
            g.setFont (HubLookAndFeel::displayFont (20.0f));
            g.drawText ("YOUR WHOLE STUDIO, UNLOCKED", tr.removeFromTop (34),
                        juce::Justification::bottomRight, false);
            g.setColour (juce::Colour (HubLookAndFeel::gold).withAlpha (0.85f));
            g.setFont (HubLookAndFeel::monoFont (11.0f));
            g.drawText (stats, tr.withTrimmedTop (4), juce::Justification::topRight, false);
        }
    }
    else if (page == PageFx)
    {
        // Group panels behind the FX knob columns (matches resized() geometry).
        auto area = getLocalBounds();
        area.removeFromTop (52 + 30);          // header + studio sub-tab row
        area.removeFromBottom (26);
        area = area.reduced (24, 26);
        const int colW  = area.getWidth() / 4;
        const int slotH = 96, headH = 22;

        // Each panel is only as tall as the controls it holds, so a one-knob
        // group is not a mostly-empty box.
        auto col = [&] (int knobs, const char* title)
        {
            auto c = area.removeFromLeft (colW).reduced (6);
            panelRect (c.removeFromTop (juce::jmin (c.getHeight(), headH + knobs * slotH)), title);
        };
        col (1, "DRIVE");
        col (1, "CHORUS");
        col (3, "DELAY");
        col (3, "REVERB + OUT");
    }
}

void HaosHubEditor::resized()
{
    splash.setBounds (getLocalBounds());
    auto r = getLocalBounds();

    auto header = r.removeFromTop (52).reduced (12, 10);
    titleLabel.setBounds (header.removeFromLeft (150));   // painted wordmark area
    instrumentModeBox.setBounds (header.removeFromRight (130).reduced (0, 2));
    if (page == PagePresets)
        syncButton.setBounds (header.removeFromRight (118).reduced (4, 2));

    // The four top-level tabs share the header: width proportional to the
    // caption so they always fit, whatever the captions become.
    {
        int totalChars = 0;
        for (auto* b : tabs) totalChars += b->getButtonText().length() + 3;
        const int avail = juce::jmax (1, header.getWidth());
        for (int i = 0; i < tabs.size(); ++i)
        {
            const int units = tabs[i]->getButtonText().length() + 3;
            const int w = (i == tabs.size() - 1) ? header.getWidth()
                                                 : juce::roundToInt (avail * units / (float) totalChars);
            tabs[i]->setBounds (header.removeFromLeft (w));
        }
    }

    auto status = r.removeFromBottom (26).reduced (14, 4);
    if (page == PageSoundPacks || page == PagePresets)
        hintLabel.setBounds (status.removeFromRight (juce::jmin (330, status.getWidth() / 2)).withTrimmedRight (14));
    statusLabel.setBounds (status.withTrimmedRight (150));

    // STUDIO pages carve a sub-tab row from the top of the content area; every
    // studio layout below therefore starts under it automatically.
    if (isStudioPage (page))
    {
        auto sub = r.removeFromTop (30);
        sub.removeFromLeft (12);
        for (auto* b : studioTabs)
            b->setBounds (sub.removeFromLeft (120).reduced (14, 2));
    }

    switch (page)
    {
        case PageHome:
        {
            homeHeroR = r;
            homeWaveR = { r.getX() + 40,
                          r.getY() + (int) (r.getHeight() * 0.55f) - 70,
                          r.getWidth() - 80, 140 };
            auto cardsR = r.reduced (24, 0);
            cardsR = cardsR.withTop (r.getBottom() - 120 - 16).withHeight (120);
            const int gap = 16;
            const int cw  = (cardsR.getWidth() - gap * 2) / 3;
            for (int i = 0; i < 3; ++i)
                homeNavR[i] = { cardsR.getX() + i * (cw + gap), cardsR.getY(), cw, 120 };
            break;
        }

        case PageSoundPacks:
        {
            auto area = r.reduced (12, 12);
            sideHeader = {};
            if (openPack < 0)
            {
                auto top = area.removeFromTop (32);
                addPackButton.setBounds (top.removeFromRight (120).reduced (2, 0));
                top.removeFromRight (8);
                searchBox.setBounds (top.withTrimmedRight (4));
                area.removeFromTop (10);
                if (bannerImg.isValid())
                {
                    bannerR = area.removeFromTop (92);
                    area.removeFromTop (12);
                }
                else
                    bannerR = {};
                packView.setBounds (area);
                layoutPackCards();
            }
            else
            {
                bannerR = {};
                auto top = area.removeFromTop (32);
                packBackButton.setBounds (top.removeFromLeft (130).reduced (0, 1));
                top.removeFromLeft (10);
                removePackButton.setBounds (top.removeFromRight (130).reduced (2, 0));
                top.removeFromRight (8);
                searchBox.setBounds (top.withTrimmedRight (4));
                area.removeFromTop (10);
                packHeaderR = area.removeFromTop (96);
                area.removeFromTop (10);
                itemList.setBounds (area);
            }
            break;
        }

        case PagePresets:
        {
            {
                auto kb = r.removeFromBottom (80).reduced (10, 8);
                keyboard.setKeyWidth (juce::jmax (14.0f, kb.getWidth() / 29.0f));
                keyboard.setBounds (kb);
            }

            auto synthPanel = r.removeFromRight (300).reduced (14, 10);
            auto sectionInner = [] (juce::Rectangle<int>& store, juce::Rectangle<int> a)
            {
                store = a;
                auto inner = a.reduced (8, 4);
                inner.removeFromTop (14);          // painted section header
                return inner;
            };
            auto placeCell = [] (Knob* kk, juce::Rectangle<int> cell)
            {
                kk->label .setBounds (cell.removeFromTop (13));
                kk->slider.setBounds (cell.reduced (3, 0));
            };
            auto row3 = [&] (juce::OwnedArray<Knob>& arr, int a, juce::Rectangle<int> row)
            {
                const int w = row.getWidth() / 3;
                for (int i = 0; i < 3; ++i)
                    placeCell (arr[a + i], { row.getX() + i * w, row.getY(), w, row.getHeight() });
            };

            if (synthKnobs.size() == 14)
            {
                {   // --- OSC ---
                    auto inner  = sectionInner (oscSect, synthPanel.removeFromTop (172));
                    auto oscRow = inner.removeFromTop (40);
                    const int third = oscRow.getWidth() / 3;
                    auto oscA = oscRow.removeFromLeft (third).reduced (2, 0);
                    auto oscB = oscRow.removeFromLeft (third).reduced (2, 0);
                    auto oscC = oscRow.reduced (2, 0);
                    osc1Label.setBounds (oscA.removeFromTop (12));
                    if (osc1Wave) osc1Wave->setBounds (oscA.reduced (0, 1));
                    osc2Label.setBounds (oscB.removeFromTop (12));
                    if (osc2Wave) osc2Wave->setBounds (oscB.reduced (0, 1));
                    osc3Label.setBounds (oscC.removeFromTop (12));
                    if (osc3Wave) osc3Wave->setBounds (oscC.reduced (0, 1));
                    inner.removeFromTop (2);
                    row3 (synthKnobs, 0, inner.removeFromTop (54));
                    row3 (synthKnobs, 3, inner.removeFromTop (54));
                }
                synthPanel.removeFromTop (6);
                {   // --- FILTER (hero cutoff + 2x2) ---
                    auto inner = sectionInner (filtSect, synthPanel.removeFromTop (178));
                    auto filt  = inner.removeFromTop (106);
                    auto hero  = filt.removeFromLeft (filt.getWidth() / 2);
                    placeCell (synthKnobs[6], hero);
                    const int qw = filt.getWidth() / 2, qh = filt.getHeight() / 2;
                    placeCell (synthKnobs[7],  { filt.getX(),      filt.getY(),      qw, qh });
                    placeCell (synthKnobs[8],  { filt.getX() + qw, filt.getY(),      qw, qh });
                    placeCell (synthKnobs[9],  { filt.getX(),      filt.getY() + qh, qw, qh });
                    placeCell (synthKnobs[10], { filt.getX() + qw, filt.getY() + qh, qw, qh });
                    row3 (synthKnobs, 11, inner.removeFromTop (54));
                }
                synthPanel.removeFromTop (6);
                {   // --- AMP ENV faders ---
                    auto env = sectionInner (envSect, synthPanel);
                    const int faderW = env.getWidth() / 4;
                    for (int i = 0; i < adsrFaders.size(); ++i)
                    {
                        auto cell = juce::Rectangle<int> (env.getX() + i * faderW, env.getY(),
                                                          faderW, env.getHeight());
                        adsrFaders[i]->label .setBounds (cell.removeFromBottom (13));
                        adsrFaders[i]->slider.setBounds (cell.reduced (6, 2));
                    }
                }
            }
            else
            {
                oscSect = filtSect = envSect = {};
                layoutKnobs (synthKnobs, synthPanel, 3);
            }

            auto centre = r.reduced (10, 12);
            auto searchRow = centre.removeFromTop (30);
            instrumentBox.setBounds (searchRow.removeFromRight (150).reduced (4, 0));
            presetCategoryBox.setBounds (searchRow.removeFromRight (150).reduced (4, 0));
            searchBox    .setBounds (searchRow.withTrimmedRight (4));
            centre.removeFromTop (6);
            waveform.setBounds (centre.removeFromBottom (58));
            centre.removeFromBottom (6);
            itemList.setBounds (centre);
            break;
        }

        case PageMidi:
        {
            auto area = r.reduced (12, 10);
            auto modeRow = area.removeFromTop (26);
            midiClipsTab.setBounds (modeRow.removeFromLeft (86).reduced (1, 0));
            midiSeqTab  .setBounds (modeRow.removeFromLeft (100).reduced (1, 0));
            if (midiMode == MidiClips)
            {
                modeRow.removeFromLeft (12);
                midiSearch.setBounds (modeRow);
                area.removeFromTop (8);
                midiPackList.setBounds (area.removeFromLeft (250));
                area.removeFromLeft (10);
                midiItemList.setBounds (area);
            }
            else
            {
                area.removeFromTop (6);
                {
                    auto kb = area.removeFromBottom (74).reduced (0, 6);
                    keyboard.setKeyWidth (juce::jmax (14.0f, kb.getWidth() / 29.0f));
                    keyboard.setBounds (kb);
                }
                auto transport = area.removeFromTop (40);
                playButton .setBounds (transport.removeFromLeft (80).reduced (2, 0));
                stopButton .setBounds (transport.removeFromLeft (80).reduced (2, 0));
                clearButton.setBounds (transport.removeFromLeft (80).reduced (2, 0));
                transport.removeFromLeft (16);
                bpmLabel .setBounds (transport.removeFromLeft (40));
                bpmSlider.setBounds (transport.removeFromLeft (juce::jmin (240, transport.getWidth())));
                area.removeFromTop (4);
                if (grid) grid->setBounds (area.removeFromTop (juce::jmin (240, area.getHeight() / 2)));
                area.removeFromTop (6);
                layoutKnobs (drumKnobs, area, 5);
            }
            break;
        }

        case PageInstruments:
        {
            auto top = r.removeFromTop (34).reduced (12, 4);
            categoryLabel.setBounds (top.removeFromLeft (70));
            categoryBox  .setBounds (top.removeFromLeft (200));
            auto area = r.reduced (8, 4);
            instrumentView.setBounds (area);
            instrumentGrid.setSize (area.getWidth() - 12, instrumentGrid.getHeight());
            break;
        }

        case PageModulation:
        {
            {
                auto kb = r.removeFromBottom (80).reduced (10, 8);
                keyboard.setKeyWidth (juce::jmax (14.0f, kb.getWidth() / 29.0f));
                keyboard.setBounds (kb);
            }
            auto area = r.reduced (12, 12);
            auto place = [] (Knob* kk, juce::Rectangle<int> cell)
            {
                kk->label .setBounds (cell.removeFromTop (13));
                kk->slider.setBounds (cell.reduced (3, 0));
            };
            auto grid2 = [&] (juce::OwnedArray<Knob>& arr, juce::Rectangle<int> a, int cols)
            {
                if (arr.isEmpty()) return;
                const int rows = (arr.size() + cols - 1) / cols;
                const int cw = a.getWidth() / cols;
                const int chh = juce::jlimit (56, 132, a.getHeight() / juce::jmax (1, rows));
                for (int i = 0; i < arr.size(); ++i)
                    place (arr[i], { a.getX() + (i % cols) * cw, a.getY() + (i / cols) * chh, cw, chh });
            };

            // SOURCES (left) | MATRIX (centre) | FILTER ENV (right)
            const int sectH = juce::jmin (area.getHeight(), 320);
            srcSect = area.removeFromLeft (262).withHeight (sectH);
            area.removeFromLeft (10);
            fltSect = area.removeFromRight (216).withHeight (sectH);
            area.removeFromRight (10);
            matrixSect = area.withHeight (sectH);

            {
                auto inner = srcSect.reduced (10, 6);
                inner.removeFromTop (16);
                auto waveRow = inner.removeFromTop (40);
                lfoWaveLabel.setBounds (waveRow.removeFromTop (12));
                if (lfoWave) lfoWave->setBounds (waveRow.reduced (0, 1));
                inner.removeFromTop (4);
                grid2 (srcKnobs, inner, 2);
            }
            {
                auto inner = matrixSect.reduced (10, 6);
                inner.removeFromTop (16);
                grid2 (modKnobs, inner, 5);
            }
            {
                auto inner = fltSect.reduced (10, 6);
                inner.removeFromTop (16);
                grid2 (fltEnvKnobs, inner, 2);
            }
            break;
        }

        case PageFx:
        {
            auto area = r.reduced (24, 26);
            {
                auto strip = area.removeFromBottom (110);
                fxScope   .setBounds (strip.removeFromLeft (strip.getWidth() / 2 - 4));
                fxSpectrum.setBounds (strip.withTrimmedLeft (8));
            }
            area.removeFromBottom (10);

            const int colW = area.getWidth() / 4;
            const int slotH = 96, headH = 22;
            auto take = [&] (int knobs)
            {
                auto c = area.removeFromLeft (colW).reduced (10, 8);
                c.removeFromTop (headH - 8);
                return c.removeFromTop (juce::jmin (c.getHeight(), knobs * slotH));
            };
            auto driveCol  = take (1);
            auto chorusCol = take (1);
            auto delayCol  = take (3);
            auto revCol    = take (3);
            auto place = [] (Knob* kk, juce::Rectangle<int> c)
            {
                kk->label .setBounds (c.removeFromTop (14));
                kk->slider.setBounds (c.reduced (6, 2));
            };
            if (fxKnobs.size() == 8)
            {
                place (fxKnobs[0], driveCol);
                place (fxKnobs[1], chorusCol);
                const int dh = juce::jmin (slotH, delayCol.getHeight() / 3);
                place (fxKnobs[2], delayCol.removeFromTop (dh));
                place (fxKnobs[3], delayCol.removeFromTop (dh));
                place (fxKnobs[4], delayCol.removeFromTop (dh));
                const int rh = juce::jmin (slotH, revCol.getHeight() / 3);
                place (fxKnobs[5], revCol.removeFromTop (rh));
                place (fxKnobs[6], revCol.removeFromTop (rh));
                place (fxKnobs[7], revCol.removeFromTop (rh));
            }
            else
            {
                layoutKnobs (fxKnobs, r.reduced (30, 40), 4);
            }
            break;
        }

        case PagePlugins:
        {
            // hero CTA centred at the top of the shelf, utilities kept small
            auto top = r.removeFromTop (58);
            installAllButton.setBounds (top.withSizeKeepingCentre (230, 36));
            rescanButton.setBounds (top.removeFromRight (130).reduced (10, 14));
            cardView.setBounds (r.reduced (12, 10));
            layoutPluginCards();
            break;
        }

        default: break;
    }
    repaint();
}
