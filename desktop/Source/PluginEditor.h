#pragma once

#include <JuceHeader.h>
#include "PluginProcessor.h"
#include "StepGrid.h"
#include "InstrumentGrid.h"
#include "WaveformDisplay.h"
#include "WaveSelector.h"

//==============================================================================
/** Dark hub styling — charcoal panels with a mint accent. */
class HubLookAndFeel : public juce::LookAndFeel_V4
{
public:
    HubLookAndFeel();

    // HAOS.fm brand palette, taken from the site's own CSS:
    //   #0A0A0A / #121212 near-black stage, #FF6B35 groove orange, #FFD700 gold,
    //   #39FF14 neon, #8B5CF6 violet. Display type is condensed, numerals mono.
    static constexpr juce::uint32 bg     = 0xff0a0a0a;
    static constexpr juce::uint32 panel  = 0xff121212;
    static constexpr juce::uint32 raised = 0xff1b1b1e;
    static constexpr juce::uint32 accent = 0xffff6b35;   // groove orange
    static constexpr juce::uint32 gold   = 0xffffd700;
    static constexpr juce::uint32 neon   = 0xff39ff14;
    static constexpr juce::uint32 violet = 0xff8b5cf6;
    static constexpr juce::uint32 text   = 0xfff2f3f5;
    static constexpr juce::uint32 dim    = 0xff8a8d93;

    /** Condensed display face for headings, matching the site's Bebas Neue. */
    static juce::Font displayFont (float height, bool bold = true);
    /** Monospaced face for numeric readouts, matching the site's Space Mono. */
    static juce::Font monoFont (float height);

    void drawRotarySlider (juce::Graphics&, int x, int y, int w, int h,
                           float sliderPos, float startAngle, float endAngle,
                           juce::Slider&) override;

    void drawLinearSlider (juce::Graphics&, int x, int y, int w, int h,
                           float sliderPos, float minPos, float maxPos,
                           juce::Slider::SliderStyle, juce::Slider&) override;

    juce::Font getLabelFont (juce::Label&) override;

    /** Tab buttons (componentID "tab") render as flat text — no box, no outline;
        the editor paints the active-tab underline itself. */
    void drawButtonBackground (juce::Graphics&, juce::Button&,
                               const juce::Colour& backgroundColour,
                               bool highlighted, bool down) override;
    juce::Font getTextButtonFont (juce::TextButton&, int buttonHeight) override;
};

//==============================================================================
/** ListBox whose rows can be dragged straight out into the DAW as files. */
class DragListBox : public juce::ListBox
{
public:
    explicit DragListBox (const juce::String& name = {}, juce::ListBoxModel* model = nullptr)
        : juce::ListBox (name, model)
    {
        // ListBox paints its rows with internal RowComponents, and THOSE consume
        // the mouse events — so ListBox::mouseDrag only ever fired on the empty
        // space below the last row and dragging a row did nothing. Listening to
        // nested children routes every row's drag back here.
        addMouseListener (this, true);
    }
    ~DragListBox() override { removeMouseListener (this); }

    /** Returns the files to hand to the DAW for a given row (empty = not draggable). */
    std::function<juce::StringArray (int row)> filesForRow;

    /** Called when a row had nothing draggable, so the UI can explain why. */
    std::function<void (int row)> onDragUnavailable;

    void mouseDrag (const juce::MouseEvent& e) override;

private:
    bool dragging = false;
};

//==============================================================================
/** Launch splash / about card. Drawn over everything, dismissed by a click or
    by its own fade. It appears once per process — a plugin that splashes every
    time you open its window is an annoyance, not a welcome. */
class SplashOverlay : public juce::Component
{
public:
    SplashOverlay();
    float alpha = 1.0f;          // 1 = fully shown, 0 = gone
    float hold  = 1.6f;          // seconds before the fade begins
    bool  about = false;         // true when opened deliberately from the UI
    juce::String stats, build;
    std::function<void()> onDismiss;

    void paint (juce::Graphics&) override;
    void mouseDown (const juce::MouseEvent&) override { if (onDismiss) onDismiss(); }

private:
    juce::Image art, mark;
};

//==============================================================================
class HaosHubEditor : public juce::AudioProcessorEditor,
                      private juce::Timer
{
public:
    explicit HaosHubEditor (HaosHubProcessor&);
    ~HaosHubEditor() override;

    void paint (juce::Graphics&) override;
    void resized() override;
    bool keyPressed (const juce::KeyPress&) override;
    void mouseUp (const juce::MouseEvent&) override;
    void mouseMove (const juce::MouseEvent&) override;

    /** Opens one pack's sound list (vault card click). Public so the headless
        snapshot harness can photograph the open-pack view. */
    void openPackAt (int libIndex);

private:
    /** v3 information architecture (Cymatics logic): HOME (live intro) |
        VAULT (all packs, audio + MIDI, with in-card previews) | STUDIO
        (presets / instruments / modulation / step-seq / fx as sub-tabs) |
        PLUGINS (product grid). Internal pages keep their identities; the
        top bar exposes only the four groups. */
    enum Page { PageHome = 0, PageSoundPacks, PagePresets, PageMidi, PageInstruments,
                PageModulation, PagePlugins, PageFx, NumPages };
    enum MidiMode { MidiClips = 0, MidiSeq };

    static bool isStudioPage (Page p)
    {
        return p == PagePresets || p == PageInstruments || p == PageModulation
            || p == PageMidi    || p == PageFx;
    }
    /** Which top-level tab a page belongs to: 0 HOME, 1 VAULT, 2 STUDIO, 3 PLUGINS. */
    static int topIndexFor (Page p)
    {
        if (p == PageHome)       return 0;
        if (p == PageSoundPacks) return 1;
        if (p == PagePlugins)    return 3;
        return 2;
    }

    //== List models ===========================================================
    struct BundleModel : public juce::ListBoxModel
    {
        explicit BundleModel (HaosHubEditor& o) : owner (o) {}
        int getNumRows() override;
        void paintListBoxItem (int, juce::Graphics&, int, int, bool) override;
        void selectedRowsChanged (int) override;
        void listBoxItemClicked (int, const juce::MouseEvent&) override;
        HaosHubEditor& owner;
    };

    struct ItemModel : public juce::ListBoxModel
    {
        explicit ItemModel (HaosHubEditor& o) : owner (o) {}
        int getNumRows() override;
        void paintListBoxItem (int, juce::Graphics&, int, int, bool) override;
        void listBoxItemClicked (int, const juce::MouseEvent&) override;
        HaosHubEditor& owner;
    };

    struct MidiPackModel : public juce::ListBoxModel
    {
        explicit MidiPackModel (HaosHubEditor& o) : owner (o) {}
        int getNumRows() override;
        void paintListBoxItem (int, juce::Graphics&, int, int, bool) override;
        void selectedRowsChanged (int) override;
        HaosHubEditor& owner;
    };

    struct MidiItemModel : public juce::ListBoxModel
    {
        explicit MidiItemModel (HaosHubEditor& o) : owner (o) {}
        int getNumRows() override;
        void paintListBoxItem (int, juce::Graphics&, int, int, bool) override;
        void listBoxItemClicked (int, const juce::MouseEvent&) override;
        HaosHubEditor& owner;
    };

    struct PluginModel : public juce::ListBoxModel
    {
        explicit PluginModel (HaosHubEditor& o) : owner (o) {}
        int getNumRows() override;
        void paintListBoxItem (int, juce::Graphics&, int, int, bool) override;
        void selectedRowsChanged (int) override;
        HaosHubEditor& owner;
    };

    //== Helpers ===============================================================
    bool showingSamples() const;
    const haos::Bundle* selectedBundle() const;

    void setPage (Page);
    void refreshFilter();
    void loadPreset (const haos::Preset&);
    void startSync();
    void setStatus (const juce::String&);
    void refreshInstruments();
    void refreshPlugins();
    void installSelectedPlugin();
    void updateInstallButton();

    struct Knob
    {
        juce::Slider slider { juce::Slider::RotaryHorizontalVerticalDrag, juce::Slider::TextBoxBelow };
        juce::Label  label;
        std::unique_ptr<juce::AudioProcessorValueTreeState::SliderAttachment> attach;
    };
    void addKnob (juce::OwnedArray<Knob>&, const char* paramId, const juce::String& name);
    static void layoutKnobs (juce::OwnedArray<Knob>&, juce::Rectangle<int> area, int cols);

    //== State =================================================================
    HaosHubProcessor& processor;
    HubLookAndFeel    lnf;
    Page              page = PageHome;
    Page              lastStudioPage = PagePresets;

    juce::Array<haos::Preset> filtered;
    juce::Array<juce::File>   sampleFiles;

    //== Chrome ================================================================
    juce::Label titleLabel, statusLabel;
    juce::OwnedArray<juce::TextButton> tabs;         // 4 top-level groups
    juce::OwnedArray<juce::TextButton> studioTabs;   // PRESETS..FX sub-tabs

    //== Home page (painted; hero + live wave + nav cards) =====================
    juce::Rectangle<int> homeHeroR, homeWaveR, homeNavR[3];
    int   homeHover = -1;
    float homeScope[512] = {};
    juce::ComboBox instrumentModeBox;
    std::unique_ptr<juce::AudioProcessorValueTreeState::ComboBoxAttachment> instrumentModeAttach;

    //== Sound Packs / Presets pages ===========================================
    juce::Array<int> packIdx;            // library indices shown as audio packs
    void refreshPacks();
    int  totalPresetCount() const;       // haos.fm cache + factory sets in bundle.json

    /** Cymatics-vault card: big cover, name, count, and an in-card preview
        player — up to four preview sounds with prev/next arrows, a play/pause
        chip, dot indicator and a waveform strip; the previewed file drags
        straight out into the DAW. Click anywhere else opens the pack. */
    struct PackCard : public juce::Component
    {
        int libIndex = -1;
        juce::Image cover;
        juce::String name;
        int count = 0;
        bool isMidi = false;   // MIDI packs count CLIPS, not SOUNDS
        bool hover = false;
        juce::Array<juce::File> previews;
        int  prevIdx = 0;
        bool playing = false;
        std::function<void (int)> onOpen;
        std::function<void (PackCard&)> onToggle;   // start/stop the current preview
        void paint (juce::Graphics&) override;
        void mouseEnter (const juce::MouseEvent&) override { hover = true;  repaint(); }
        void mouseExit  (const juce::MouseEvent&) override { hover = false; didDrag = false; repaint(); }
        void mouseUp    (const juce::MouseEvent&) override;
        void mouseDrag  (const juce::MouseEvent&) override;
    private:
        bool didDrag = false;
    };
    juce::Viewport        packView;
    juce::Component       packHost;
    juce::OwnedArray<PackCard> packCards;
    int  openPack = -1;                   // -1 = grid, else library bundle index
    juce::TextButton packBackButton { "<  ALL PACKS" };
    juce::Rectangle<int> packHeaderR;     // painted cover + name when open
    void rebuildPackCards();
    void layoutPackCards();
    MidiMode midiMode = MidiClips;
    juce::TextButton midiClipsTab { "CLIPS" }, midiSeqTab { "STEP SEQ" };
    void setMidiMode (MidiMode);

    //== Modulation page =======================================================
    juce::OwnedArray<Knob> modKnobs;      // 10 matrix amounts
    juce::OwnedArray<Knob> srcKnobs;      // LFO rate/depth, S&H rate, pulse width
    juce::OwnedArray<Knob> fltEnvKnobs;   // filter A/D/S/R
    std::unique_ptr<haos::WaveSelector> lfoWave;
    juce::Label lfoWaveLabel;
    juce::Rectangle<int> srcSect, matrixSect, fltSect;

    //== Browse page ===========================================================
    juce::TextEditor searchBox;
    juce::ComboBox   instrumentBox;
    juce::ComboBox   presetCategoryBox;   // sound-selection taxonomy filter
    juce::TextButton syncButton { "Sync haos.fm" };
    juce::Label      hintLabel;

    BundleModel bundleModel { *this };
    ItemModel   itemModel   { *this };
    juce::ListBox bundleList { "bundles", &bundleModel };
    DragListBox   itemList   { "items",   &itemModel };

    juce::OwnedArray<Knob> synthKnobs;
    std::unique_ptr<haos::WaveSelector> osc1Wave, osc2Wave, osc3Wave;
    juce::Label osc1Label, osc2Label, osc3Label;
    juce::MidiKeyboardComponent keyboard;

    /** Vertical console-style faders for the amp envelope, per the Hub mockup. */
    struct AdsrFader
    {
        juce::Slider slider { juce::Slider::LinearVertical, juce::Slider::NoTextBox };
        juce::Label  label;
        std::unique_ptr<juce::AudioProcessorValueTreeState::SliderAttachment> attach;
    };
    juce::OwnedArray<AdsrFader> adsrFaders;
    juce::Label adsrTitle;
    haos::WaveformDisplay waveform;

    /** Section frames on the Browse synth panel (computed in resized(),
        painted as headed metal panels in paint()). */
    juce::Rectangle<int> oscSect, filtSect, envSect;
    juce::Rectangle<int> sideHeader;   // "PRESETS & PACKS" caption above the sidebar

    SplashOverlay splash;
    juce::Rectangle<int> buildStampR;      // click target that reopens the about card
    void showAbout();

    /** Optional hero banner (Cymatics-style) — ~/.../HAOS/Hub/banner.png. */
    juce::Image bannerImg;
    juce::Rectangle<int> bannerR;

    /** HOME hero plate (hero.png: embossed wordmark on dark metal) and the
        STUDIO leitmotif backdrop (studio-back.png: underground tunnel) —
        loaded per editor open so fresh art lands without a rebuild. */
    juce::Image homeBackImg, studioBackImg;

    //== Sequencer page ========================================================
    std::unique_ptr<haos::StepGrid> grid;
    juce::TextButton playButton { "Play" }, stopButton { "Stop" }, clearButton { "Clear" };
    juce::Slider     bpmSlider;
    juce::Label      bpmLabel;
    std::unique_ptr<juce::AudioProcessorValueTreeState::SliderAttachment> bpmAttach;
    juce::OwnedArray<Knob> drumKnobs;

    //== MIDI page =============================================================
    MidiPackModel midiPackModel { *this };
    MidiItemModel midiItemModel { *this };
    juce::ListBox midiPackList { "midiPacks", &midiPackModel };
    DragListBox   midiItemList { "midiItems", &midiItemModel };
    juce::TextEditor midiSearch;
    juce::Array<juce::File> midiFiles;             // filtered clips of the page
    juce::Array<int> midiBundleIdx;                // indices into library bundles
    void refreshMidi();

    //== FX page ===============================================================
    juce::OwnedArray<Knob> fxKnobs;

    /** Master-output oscilloscope. The editor's timer copies the processor's
        scope ring into `data` and repaints — the component itself is passive. */
    struct FxScope : juce::Component
    {
        float data[HaosHubProcessor::kScopeSize] = {};
        void paint (juce::Graphics&) override;
    };
    FxScope fxScope;

    /** Log-frequency spectrum analyzer over the same scope tap (haos.fm's
        studio has Waveform + Spectrum — this is the Spectrum half). The editor
        timer windows the tap, runs the FFT and smooths the bins; paint() only
        draws. */
    struct FxSpectrum : juce::Component
    {
        static constexpr int kOrder = 10, kSize = 1 << kOrder;   // == kScopeSize
        juce::dsp::FFT fft { kOrder };
        float fftData[kSize * 2] = {};
        float bins[kSize / 2]   = {};      // smoothed display magnitudes
        double sampleRate = 44100.0;
        void push (const float* scope, double sr);
        void paint (juce::Graphics&) override;
    };
    FxSpectrum fxSpectrum;

    //== Instruments page ======================================================
    haos::InstrumentCatalog    instrumentCatalog;
    haos::InstrumentGrid       instrumentGrid;
    juce::Viewport             instrumentView;
    juce::ComboBox             categoryBox;
    juce::Label                categoryLabel;

    //== Plugins page ==========================================================
    PluginModel   pluginModel { *this };
    juce::ListBox pluginList { "plugins", &pluginModel };   // legacy, kept hidden
    juce::TextButton installButton { "Install" }, rescanButton { "Rescan" };
    juce::TextButton installAllButton { "INSTALL ALL" };   // hero CTA pill

    /** Cymatics-Hub-style product card: title, real GUI shot, status pill. */
    struct PluginCard : public juce::Component
    {
        haos::PluginEntry entry;
        juce::Image art;
        std::function<void()> onInstall;
        bool hover = false;
        void paint (juce::Graphics&) override;
        void mouseEnter (const juce::MouseEvent&) override { hover = true;  repaint(); }
        void mouseExit  (const juce::MouseEvent&) override { hover = false; repaint(); }
        void mouseUp    (const juce::MouseEvent&) override;
    };
    juce::Viewport        cardView;
    juce::Component       cardHost;
    juce::OwnedArray<PluginCard> cards;
    void layoutPluginCards();
    juce::TextButton addPackButton { "+ Add Pack" }, removePackButton { "Remove Pack" };
    std::unique_ptr<juce::FileChooser> packChooser;
    void installAllPlugins();
    void addPackFromDisk();
    void removeSelectedPack();

    void timerCallback() override;      // animation + background library refresh
    int  lastLibraryVersion = -1;
    float animPhase = 0.0f;
    int   animTick  = 0;
    float loadFlash = 0.0f;

    /** Plays a short note so a freshly loaded patch is heard, not just stored. */
    void auditionCurrentPatch();

    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR (HaosHubEditor)
};
