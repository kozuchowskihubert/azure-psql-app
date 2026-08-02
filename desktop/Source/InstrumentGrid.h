#pragma once

#include <JuceHeader.h>
#include "Artwork.h"

namespace haos
{

//==============================================================================
struct InstrumentInfo
{
    juce::String id, name, maker, category, blurb, page;
    juce::Colour accent { 0xffff6b35 };
    bool hasEngine = false;
    int  localSamples = 0;      // one-shots installed as a local bundle

    /** True when the desktop app can actually play this one natively. */
    bool playableHere() const
    {
        return id == "tb303" || id == "tr909" || id == "tr808";
    }
};

//==============================================================================
/** The haos.fm instrument catalog: loaded from GET /api/instruments and cached
    on disk, so the grid is populated even with no network. */
class InstrumentCatalog
{
public:
    static juce::File cacheFile()
    {
        return juce::File::getSpecialLocation (juce::File::userApplicationDataDirectory)
                  #if JUCE_MAC
                   .getChildFile ("Application Support")
                  #endif
                   .getChildFile ("HAOS").getChildFile ("Hub").getChildFile ("instruments.json");
    }

    const juce::Array<InstrumentInfo>& all() const noexcept { return items; }

    void load()
    {
        items.clearQuick();

        auto f = cacheFile();
        if (! f.existsAsFile())
            return;

        auto json = juce::JSON::parse (f.loadFileAsString());
        auto* arr = json.getArray();
        if (arr == nullptr)
            return;

        for (const auto& v : *arr)
        {
            auto* o = v.getDynamicObject();
            if (o == nullptr)
                continue;

            InstrumentInfo i;
            i.id        = o->getProperty ("id").toString();
            i.name      = o->getProperty ("name").toString();
            i.maker     = o->getProperty ("maker").toString();
            i.category  = o->getProperty ("category").toString();
            i.blurb     = o->getProperty ("blurb").toString();
            i.page      = o->getProperty ("page").toString();
            i.hasEngine = (bool) o->getProperty ("hasEngine");

            auto hex = o->getProperty ("accentColour").toString().trimCharactersAtStart ("#");
            if (hex.length() >= 6)
                i.accent = juce::Colour ((juce::uint32) (0xff000000 | hex.getHexValue32()));

            if (i.id.isNotEmpty())
                items.add (i);
        }
    }

    /** Writes a freshly fetched catalog, ignoring empty payloads so a bad
        response can never wipe the cache (same rule as the preset sync). */
    static bool store (const juce::var& json)
    {
        auto* arr = json.getArray();
        if (arr == nullptr || arr->isEmpty())
            return false;

        auto f = cacheFile();
        f.getParentDirectory().createDirectory();
        f.replaceWithText (juce::JSON::toString (json, false));
        return true;
    }

private:
    juce::Array<InstrumentInfo> items;
};

//==============================================================================
/** Card grid of every haos.fm instrument, each with its own artwork. */
class InstrumentGrid : public juce::Component
{
public:
    std::function<void (const InstrumentInfo&)> onSelect;

    void setItems (juce::Array<InstrumentInfo> newItems)
    {
        items = std::move (newItems);
        selected = -1;
        updateHeight();
        repaint();
    }

    const InstrumentInfo* selectedItem() const
    {
        return juce::isPositiveAndBelow (selected, items.size()) ? &items.getReference (selected)
                                                                 : nullptr;
    }

    void resized() override { updateHeight(); }

    void paint (juce::Graphics& g) override
    {
        const int cols = columns();
        if (cols <= 0) return;

        for (int i = 0; i < items.size(); ++i)
        {
            const auto& it = items.getReference (i);
            auto card = cellFor (i).reduced (6.0f);
            if (card.getWidth() < 20.0f) continue;

            const bool isSel = (i == selected);
            const bool isHot = (i == hovered);

            // card body
            g.setColour (juce::Colour (isSel ? 0xff1e1e22 : 0xff141416));
            g.fillRoundedRectangle (card, 6.0f);

            // artwork banner
            auto banner = card.removeFromTop (card.getHeight() * 0.52f).reduced (6.0f, 6.0f);
            haos::art::drawFor (g, banner, it.id + " " + it.name, it.accent);

            // status pip: green when the desktop engine can play it natively
            if (it.playableHere())
            {
                g.setColour (juce::Colour (0xff39ff14));
                g.fillEllipse (banner.getRight() - 9.0f, banner.getY() + 3.0f, 6.0f, 6.0f);
            }

            // sample-count pill: these are real local sounds, not a brochure
            if (it.localSamples > 0)
            {
                auto pill = juce::Rectangle<float> (banner.getX() + 4.0f,
                                                    banner.getBottom() - 21.0f, 92.0f, 17.0f);
                g.setColour (juce::Colours::black.withAlpha (0.55f));
                g.fillRoundedRectangle (pill, 8.5f);
                g.setColour (it.accent);
                g.setFont (juce::Font (juce::FontOptions (10.5f, juce::Font::bold)));
                g.drawText (juce::String (it.localSamples) + " SAMPLES",
                            pill.toNearestInt(), juce::Justification::centred, false);
            }

            auto txt = card.reduced (8.0f, 2.0f);

            g.setColour (juce::Colour (0xfff2f3f5));
            g.setFont (juce::Font (juce::FontOptions (17.0f, juce::Font::bold)));
            g.drawText (it.name.toUpperCase(), txt.removeFromTop (20.0f).toNearestInt(),
                        juce::Justification::centredLeft, true);

            g.setColour (it.accent);
            g.setFont (juce::Font (juce::FontOptions (12.0f)));
            g.drawText (it.maker.toUpperCase() + "   " + it.category.toUpperCase(),
                        txt.removeFromTop (16.0f).toNearestInt(),
                        juce::Justification::centredLeft, true);

            g.setColour (juce::Colour (0xff9a9da3));
            g.setFont (juce::Font (juce::FontOptions (12.0f)));
            g.drawFittedText (it.blurb, txt.toNearestInt(), juce::Justification::topLeft, 3, 0.9f);

            // border last so it sits above everything
            g.setColour (isSel ? it.accent : (isHot ? it.accent.withAlpha (0.55f)
                                                    : juce::Colour (0xff26262a)));
            g.drawRoundedRectangle (cellFor (i).reduced (6.0f), 6.0f, isSel ? 2.0f : 1.0f);
        }

        if (items.isEmpty())
        {
            g.setColour (juce::Colour (0xff8a8d93));
            g.setFont (juce::Font (juce::FontOptions (13.0f)));
            g.drawText ("No instruments cached - press Sync haos.fm",
                        getLocalBounds(), juce::Justification::centred, true);
        }
    }

    void mouseMove (const juce::MouseEvent& e) override
    {
        const int h = indexAt (e.position);
        if (h != hovered) { hovered = h; repaint(); }
    }

    void mouseExit (const juce::MouseEvent&) override
    {
        if (hovered != -1) { hovered = -1; repaint(); }
    }

    void mouseDown (const juce::MouseEvent& e) override
    {
        const int i = indexAt (e.position);
        if (i < 0) return;

        selected = i;
        repaint();
        if (onSelect)
            onSelect (items.getReference (i));
    }

private:
    static constexpr float kCardW = 264.0f;
    static constexpr float kCardH = 208.0f;

    int columns() const
    {
        return juce::jmax (1, (int) (getWidth() / kCardW));
    }

    juce::Rectangle<float> cellFor (int i) const
    {
        const int cols = columns();
        const float w = getWidth() / (float) cols;
        return { (i % cols) * w, (i / cols) * kCardH, w, kCardH };
    }

    int indexAt (juce::Point<float> p) const
    {
        const int cols = columns();
        const int col = juce::jlimit (0, cols - 1, (int) (p.x / (getWidth() / (float) cols)));
        const int row = (int) (p.y / kCardH);
        const int idx = row * cols + col;
        return juce::isPositiveAndBelow (idx, items.size()) ? idx : -1;
    }

    void updateHeight()
    {
        const int cols = columns();
        const int rows = (items.size() + cols - 1) / juce::jmax (1, cols);
        setSize (getWidth(), juce::jmax (rows, 1) * (int) kCardH + 8);
    }

    juce::Array<InstrumentInfo> items;
    int selected = -1, hovered = -1;
};

} // namespace haos
