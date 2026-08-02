#pragma once

#include <JuceHeader.h>

namespace haos
{

/** Pulls presets from the haos.fm patch API on a background thread and caches the
    raw JSON to disk, so the browser still works with no network. */
class HaosFmClient : private juce::Thread
{
public:
    using Progress = std::function<void (juce::String)>;
    using Finished = std::function<void (bool, juce::String)>;

    HaosFmClient();
    ~HaosFmClient() override;

    /** The instruments the haos.fm API currently serves patches for. */
    static juce::StringArray defaultInstruments();
    static juce::String      defaultBaseUrl();

    juce::String getBaseUrl() const;
    void         setBaseUrl (const juce::String&);   // persisted to settings.json

    /** Starts a background sync. Callbacks fire on the message thread.
        Does nothing if a sync is already running. */
    void sync (const juce::StringArray& instruments, Progress onProgress, Finished onFinished);

    bool isSyncing() const { return isThreadRunning(); }

private:
    void run() override;

    /** GETs a URL and parses the body as JSON. Returns false (with a reason) on any
        transport error, non-2xx status, or unparseable body. */
    static bool fetchJson (const juce::String& url, juce::var& out, juce::String& error);

    static juce::File settingsFile();
    void loadSettings();
    void saveSettings() const;

    juce::CriticalSection lock;
    juce::StringArray     pending;
    juce::String          baseUrl;
    Progress              progress;
    Finished              finished;

    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR (HaosFmClient)
};

} // namespace haos
