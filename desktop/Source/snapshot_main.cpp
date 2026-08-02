#include <JuceHeader.h>
#include "PluginProcessor.h"
#include "PluginEditor.h"

// Headless renderer: constructs the real editor, switches to each page by
// clicking its tab, and writes a PNG of every page. Lets us SEE the UI on a
// machine where screen capture is blocked, and iterate the design against
// reality instead of blind.

static void snap (juce::Component* ed, const juce::String& path)
{
    auto img = ed->createComponentSnapshot (ed->getLocalBounds(), true);
    juce::File f (path);
    f.deleteFile();
    if (auto os = std::unique_ptr<juce::FileOutputStream> (f.createOutputStream()))
    {
        juce::PNGImageFormat png;
        png.writeImageToStream (img, *os);
        std::cout << "  wrote " << path << " (" << img.getWidth() << "x" << img.getHeight() << ")\n";
    }
}

static juce::Button* findButton (juce::Component* c, const juce::String& text)
{
    for (auto* ch : c->getChildren())
    {
        if (auto* b = dynamic_cast<juce::Button*> (ch))
            if (b->getButtonText() == text)
                return b;
        if (auto* r = findButton (ch, text))
            return r;
    }
    return nullptr;
}

int main (int argc, char** argv)
{
    juce::ScopedJuceInitialiser_GUI gui;

    const juce::String outDir = argc > 1 ? juce::String (argv[1]) : juce::String ("/tmp");

    HaosHubProcessor proc;
    proc.prepareToPlay (44100.0, 512);

    // Scope-tap smoke: a played note must reach the editor's oscilloscope feed.
    {
        juce::AudioBuffer<float> buf (2, 512);
        juce::MidiBuffer midi;
        midi.addEvent (juce::MidiMessage::noteOn (1, 48, (juce::uint8) 100), 0);
        for (int i = 0; i < 20; ++i)
        {
            buf.clear();
            proc.processBlock (buf, midi);
            midi.clear();
        }
        float scope[HaosHubProcessor::kScopeSize];
        proc.copyScope (scope);
        float pk = 0.0f;
        for (float v : scope) pk = juce::jmax (pk, std::abs (v));
        std::cout << "scope tap peak: " << pk << (pk > 0.001f ? "  OK" : "  FAIL") << "\n";
        if (pk <= 0.001f) return 2;
    }

    // Clip-audition smoke: clicking a .mid must be HEARD through the engine.
    {
        juce::MidiMessageSequence seq;
        seq.addEvent (juce::MidiMessage::noteOn  (1, 48, (juce::uint8) 100), 0.0);
        seq.addEvent (juce::MidiMessage::noteOff (1, 48), 400.0);
        juce::MidiFile mf;
        mf.setTicksPerQuarterNote (480);
        mf.addTrack (seq);
        juce::File clip = juce::File::getSpecialLocation (juce::File::tempDirectory)
                              .getChildFile ("haos_smoke_clip.mid");
        clip.deleteFile();
        { juce::FileOutputStream os (clip); mf.writeTo (os); }

        HaosHubProcessor pr;
        pr.prepareToPlay (44100.0, 512);
        const bool loaded = pr.auditionMidiClip (clip);
        juce::AudioBuffer<float> buf (2, 512);
        juce::MidiBuffer midi;
        double energy = 0.0;
        for (int i = 0; i < 20; ++i)
        {
            buf.clear(); midi.clear();
            pr.processBlock (buf, midi);
            const auto* d = buf.getReadPointer (0);
            for (int s = 0; s < 512; ++s) energy += d[s] * d[s];
        }
        const bool ok = loaded && energy > 1.0e-4;
        std::cout << "midi clip audition: load=" << (loaded ? "yes" : "NO")
                  << " energy=" << energy << (ok ? "  OK" : "  FAIL") << "\n";
        clip.deleteFile();
        if (! ok) return 3;
    }

    auto* ed = proc.createEditorIfNeeded();
    if (ed == nullptr) { std::cout << "editor NULL\n"; return 1; }

    // Drum-grid smoke: an array-shaped factory drum preset (the 42 tr909/tr808
    // grooves) must paint the step grid, not just load kit voices.
    {
        bool found = false;
        for (const auto& b : proc.library.getBundles())
        {
            for (const auto& pr : b.presets)
                if (pr.isDrumPattern() && pr.pattern().isArray())
                {
                    proc.sequencer.clear();
                    proc.loadDrumPreset (pr);
                    int active = 0;
                    for (int lane = 0; lane < haos::Sequencer::NumLanes; ++lane)
                        for (int s = 0; s < haos::Sequencer::NumSteps; ++s)
                            if (proc.sequencer.getStep (lane, s)) ++active;
                    std::cout << "drum pattern paint: " << pr.name << " steps=" << active
                              << (active > 0 ? "  OK" : "  FAIL") << "\n";
                    if (active == 0) return 4;
                    found = true;
                    break;
                }
            if (found) break;
        }
        if (! found)
            std::cout << "drum pattern paint: no array-shaped drum preset found (skipped)\n";
    }

    auto win = std::make_unique<juce::DocumentWindow> ("snap", juce::Colours::black, 0);
    win->setContentNonOwned (ed, true);
    win->setBounds (60, 60, ed->getWidth(), ed->getHeight());
    win->setVisible (true);

    auto pump = [] (int ms) { juce::MessageManager::getInstance()->runDispatchLoopUntil (ms); };
    pump (250);
    snap (ed, outDir + "/hub_splash.png");      // launch card, before it fades
    pump (2600);                                // let the fade finish

    snap (ed, outDir + "/hub_home.png");        // the editor opens on HOME

    const char* pages[] = { "HOME", "VAULT", "STUDIO", "PLUGINS" };
    for (auto* name : pages)
    {
        if (auto* b = findButton (ed, name))
        {
            b->triggerClick();
            pump (450);
        }
        snap (ed, outDir + "/hub_" + juce::String (name).toLowerCase() + ".png");
    }

    // STUDIO sub-pages: click each sub-tab by caption and photograph it.
    if (auto* b = findButton (ed, "STUDIO")) { b->triggerClick(); pump (300); }
    const char* studio[] = { "PRESETS", "INSTRUMENTS", "MODULATION", "STEP SEQ", "FX" };
    for (auto* name : studio)
    {
        if (auto* b = findButton (ed, name))
        {
            b->triggerClick();
            pump (400);
        }
        snap (ed, outDir + "/hub_studio_"
                  + juce::String (name).toLowerCase().replaceCharacter (' ', '_') + ".png");
    }

    // Open-pack view: back to the VAULT, open the richest local pack.
    if (auto* hub = dynamic_cast<HaosHubEditor*> (ed))
    {
        if (auto* b = findButton (ed, "VAULT")) { b->triggerClick(); pump (300); }
        int best = -1, bestN = -1;
        const auto& lib = proc.library.getBundles();
        for (int i = 0; i < lib.size(); ++i)
        {
            const auto& bd = lib.getReference (i);
            if (bd.name.containsIgnoreCase ("MIDI")) continue;
            const int n = bd.presets.size();
            if (n > bestN) { bestN = n; best = i; }
        }
        if (best >= 0)
        {
            hub->openPackAt (best);
            pump (400);
            snap (ed, outDir + "/hub_pack_open.png");
        }
    }

    win->clearContentComponent();
    proc.editorBeingDeleted (ed);
    delete ed;

    std::cout << "snapshots done\n";
    return 0;
}
