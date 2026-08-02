#pragma once

#include <JuceHeader.h>
#include "AnalogVoice.h"
#include "DrumMachine.h"
#include "Sequencer.h"
#include "Effects.h"
#include "PresetLibrary.h"
#include "PluginCatalog.h"
#include "HaosFmClient.h"

//==============================================================================
class HaosHubProcessor : public juce::AudioProcessor
{
public:
    HaosHubProcessor();
    ~HaosHubProcessor() override;

    //== AudioProcessor ========================================================
    void prepareToPlay (double sampleRate, int samplesPerBlock) override;
    void releaseResources() override;
    bool isBusesLayoutSupported (const BusesLayout&) const override;
    void processBlock (juce::AudioBuffer<float>&, juce::MidiBuffer&) override;

    juce::AudioProcessorEditor* createEditor() override;
    bool hasEditor() const override                       { return true; }

    const juce::String getName() const override           { return "HAOS Hub"; }
    bool acceptsMidi() const override                     { return true; }
    bool producesMidi() const override                    { return false; }
    bool isMidiEffect() const override                    { return false; }
    double getTailLengthSeconds() const override          { return 3.0; }

    int getNumPrograms() override                         { return 1; }
    int getCurrentProgram() override                      { return 0; }
    void setCurrentProgram (int) override                 {}
    const juce::String getProgramName (int) override      { return "Default"; }
    void changeProgramName (int, const juce::String&) override {}

    void getStateInformation (juce::MemoryBlock&) override;
    void setStateInformation (const void*, int) override;

    //== Hub ===================================================================
    juce::AudioProcessorValueTreeState apvts;
    haos::PresetLibrary  library;
    haos::HaosFmClient   client;
    haos::PluginCatalog  catalog;

    /** Instrument currently driving the audio output. */
    enum Instrument { Analog = 0, TR909 = 1, TR808 = 2, Sampler = 3 };
    Instrument getInstrument() const;

    //== Keyboard sampler ======================================================
    /** Loads a file onto the keyboard (root C3 = 60, pitched by note) and
        switches the instrument to Sampler, so the piano roll plays THIS sound —
        clicking a sample previously only previewed it while MIDI kept driving
        the analog synth, which read as "it plays something completely different". */
    bool loadSampleForKeyboard (const juce::File&);
    juce::String getLoadedSampleName() const { return samplerName; }

    //== Library loading (lazy — NOTHING heavy may run in the constructor) =====
    /** Called by the editor when it opens (message thread). Loads local packs +
        the cached third-party library instantly, then refreshes the scan on an
        owned, joinable background thread. Doing ANY of this during construction
        hung Ableton's plugin scanner (it creates and destroys instances rapidly,
        and a detached thread outliving the instance is use-after-free). */
    void ensureLibraryLoaded();

    /** Editor timer polls this on the message thread; applies a finished scan.
        Polling instead of MessageManager::callAsync means no lambda can ever
        outlive the processor. */
    void applyPendingScanIfReady();

    std::atomic<int>  libraryVersion { 0 };
    std::atomic<bool> scanning { false };

    haos::DrumMachine drums;
    haos::Sequencer   sequencer;
    haos::Effects     fx;

    /** Loads a drum preset's pattern and per-voice parameters into the
        sequencer and drum engine. Returns false for non-drum presets. */
    bool loadDrumPreset (const haos::Preset&);

    /** Name of the patch last loaded into the engine — shown in the editor. */
    juce::String currentPresetName { "init" };

    /** Lets the editor's on-screen keyboard play the engine. */
    juce::MidiKeyboardState keyboardState;

    //== MIDI clip audition ====================================================
    /** Plays a .mid clip through whatever instrument is active — clicking a
        clip must be HEARD on the current synth, not revealed in Finder. */
    bool auditionMidiClip (const juce::File&);
    void stopClipAudition() { clipActive.store (false); }

    //== Sample audition =======================================================
    /** Loads a sample and starts previewing it through the plugin's output.
        Returns false if the file could not be read. */
    bool auditionFile (const juce::File&);
    void stopAudition();

    //== Output scope tap (editor visualisation only) ==========================
    static constexpr int kScopeSize = 1024;   // power of two — ring mask below

    /** Copies the last kScopeSize output samples, oldest first. Message thread;
        reads race the audio thread by design — a torn float is still a finite
        float and only ever lives for one 30fps frame of the scope. */
    void copyScope (float* dest) const;

private:
    static juce::AudioProcessorValueTreeState::ParameterLayout createLayout();
    void pullParams();
    void mixAudition (juce::AudioBuffer<float>&);

    juce::Synthesiser  synth;
    haos::EngineParams engine;

    std::atomic<float>* pGain = nullptr;
    float lastGain = 0.8f;   // for the output ramp
    juce::AudioBuffer<float> silentSink;   // preallocated; keeps the synth fed with MIDI

    juce::AudioFormatManager formatManager;
    juce::SpinLock           previewLock;
    juce::AudioBuffer<float> previewBuffer;
    double                   previewRatio = 1.0;   // file rate / host rate
    double                   previewPos   = 0.0;
    std::atomic<bool>        previewActive { false };

    //== keyboard sampler state ================================================
    struct SampleVoice { int note = -1; double pos = 0.0; float env = 0.0f, vel = 1.0f;
                         bool held = false, active = false; };
    void renderSampler (juce::AudioBuffer<float>&, const juce::MidiBuffer&);
    juce::SpinLock            samplerLock;
    juce::AudioBuffer<float>  samplerBuffer;
    double                    samplerFileRatio = 1.0;   // fileSr / hostSr
    juce::String              samplerName;
    SampleVoice               sampVoices[12];

    //== MIDI clip player state ================================================
    juce::SpinLock              clipLock;
    juce::MidiMessageSequence   clipSeq;
    int                         clipEvent = 0;
    double                      clipTime  = 0.0;
    std::atomic<bool>           clipActive { false };

    //== output scope ring (audio thread writes, editor reads) =================
    float            scopeBuf[kScopeSize] = {};
    std::atomic<int> scopePos { 0 };

    //== third-party library scan (owned thread, joined in the destructor) =====
    struct ScanThread : juce::Thread
    {
        explicit ScanThread (HaosHubProcessor& o) : juce::Thread ("HAOS library scan"), owner (o) {}
        void run() override;
        HaosHubProcessor& owner;
    };
    ScanThread scanThread { *this };
    juce::SpinLock scanResultLock;
    juce::Array<haos::Bundle> scanResult;
    std::atomic<bool> scanReady { false };
    bool libraryLoadStarted = false;

    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR (HaosHubProcessor)
};
