#include "HaosFmClient.h"
#include "PresetLibrary.h"
#include "InstrumentGrid.h"

namespace haos
{

HaosFmClient::HaosFmClient() : juce::Thread ("HAOS Hub sync")
{
    baseUrl = defaultBaseUrl();
    loadSettings();
}

HaosFmClient::~HaosFmClient()
{
    stopThread (4000);
}

juce::StringArray HaosFmClient::defaultInstruments()
{
    return { "tb303", "tr909", "tr808" };
}

juce::String HaosFmClient::defaultBaseUrl()
{
    return "https://haos.fm";
}

juce::File HaosFmClient::settingsFile()
{
    return PresetLibrary::rootDir().getChildFile ("settings.json");
}

void HaosFmClient::loadSettings()
{
    auto f = settingsFile();
    if (! f.existsAsFile())
        return;

    auto json = juce::JSON::parse (f.loadFileAsString());
    if (auto* obj = json.getDynamicObject())
    {
        auto url = obj->getProperty ("baseUrl").toString().trim();
        if (url.isNotEmpty())
            baseUrl = url;
    }
}

void HaosFmClient::saveSettings() const
{
    auto obj = new juce::DynamicObject();
    obj->setProperty ("baseUrl", baseUrl);

    auto f = settingsFile();
    f.getParentDirectory().createDirectory();
    f.replaceWithText (juce::JSON::toString (juce::var (obj), true));
}

juce::String HaosFmClient::getBaseUrl() const
{
    const juce::ScopedLock sl (lock);
    return baseUrl;
}

void HaosFmClient::setBaseUrl (const juce::String& url)
{
    {
        const juce::ScopedLock sl (lock);
        baseUrl = url.trim().trimCharactersAtEnd ("/");
        if (baseUrl.isEmpty())
            baseUrl = defaultBaseUrl();
    }
    saveSettings();
}

void HaosFmClient::sync (const juce::StringArray& instruments, Progress onProgress, Finished onFinished)
{
    if (isThreadRunning())
        return;

    {
        const juce::ScopedLock sl (lock);
        pending  = instruments.isEmpty() ? defaultInstruments() : instruments;
        progress = std::move (onProgress);
        finished = std::move (onFinished);
    }

    startThread();
}

bool HaosFmClient::fetchJson (const juce::String& urlStr, juce::var& out, juce::String& error)
{
    juce::URL url (urlStr);

    int statusCode = 0;
    juce::StringPairArray responseHeaders;

    auto options = juce::URL::InputStreamOptions (juce::URL::ParameterHandling::inAddress)
                       .withConnectionTimeoutMs (12000)
                       .withResponseHeaders (&responseHeaders)
                       .withStatusCode (&statusCode)
                       .withNumRedirectsToFollow (5);

    auto stream = url.createInputStream (options);
    if (stream == nullptr)
    {
        error = "no connection";
        return false;
    }

    const auto body = stream->readEntireStreamAsString();

    if (statusCode < 200 || statusCode >= 300)
    {
        error = "HTTP " + juce::String (statusCode);
        return false;
    }

    auto parsed = juce::JSON::parse (body);
    if (! parsed.isArray() && parsed.getDynamicObject() == nullptr)
    {
        error = "bad JSON";
        return false;
    }

    // An empty array is a valid HTTP response but carries no patches. Treat it as
    // a failure so the caller never overwrites a good cache with nothing — this is
    // exactly what the live server returns today, and silently clobbering the
    // seeded presets with "[]" was destroying the user's library.
    if (auto* arr = parsed.getArray(); arr != nullptr && arr->isEmpty())
    {
        error = "no patches";
        return false;
    }

    out = parsed;
    return true;
}

void HaosFmClient::run()
{
    juce::StringArray instruments;
    juce::String base;
    Progress onProgress;
    Finished onFinished;

    {
        const juce::ScopedLock sl (lock);
        instruments = pending;
        base        = baseUrl;
        onProgress  = progress;
        onFinished  = finished;
    }

    auto report = [&onProgress] (const juce::String& msg)
    {
        if (onProgress)
            juce::MessageManager::callAsync ([onProgress, msg] { onProgress (msg); });
    };

    PresetLibrary::cacheDir().createDirectory();

    int ok = 0, fetched = 0, instrumentCount = 0;
    juce::StringArray failures;

    for (const auto& instrument : instruments)
    {
        if (threadShouldExit())
            break;

        report ("Syncing " + instrument + "...");

        const auto url = base + "/api/patches/" + instrument;

        juce::var json;
        juce::String error;

        if (fetchJson (url, json, error))
        {
            // Second guard, defence in depth: never write an empty payload, and
            // keep a .bak of the previous cache so even a truncated write is
            // recoverable.
            auto* arr = json.getArray();
            if (arr == nullptr || arr->isEmpty())
            {
                failures.add (instrument + " (empty)");
                continue;
            }

            auto cache = PresetLibrary::cacheFileFor (instrument);
            if (cache.existsAsFile())
                cache.copyFileTo (cache.withFileExtension ("json.bak"));

            cache.replaceWithText (juce::JSON::toString (json, false));
            fetched += arr->size();
            ++ok;
        }
        else
        {
            failures.add (instrument + " (" + error + ")");
        }
    }

    // --- instrument catalog ---------------------------------------------------
    // Without this the Instruments page can only ever show what happens to be
    // cached on disk already, i.e. nothing at all on a fresh install.
    if (! threadShouldExit())
    {
        report ("Syncing instruments...");

        juce::var json;
        juce::String error;

        if (fetchJson (base + "/api/instruments", json, error))
        {
            auto* arr = json.getArray();
            if (arr != nullptr && ! arr->isEmpty())
            {
                auto f = InstrumentCatalog::cacheFile();
                f.getParentDirectory().createDirectory();
                if (f.existsAsFile())
                    f.copyFileTo (f.withFileExtension ("json.bak"));
                f.replaceWithText (juce::JSON::toString (json, false));
                instrumentCount = arr->size();
            }
        }
        else
        {
            failures.add ("instruments (" + error + ")");
        }
    }

    const bool success = ok > 0 || instrumentCount > 0;
    juce::String summary;

    if (success)
    {
        summary = "Synced " + juce::String (fetched) + " presets";
        if (instrumentCount > 0)
            summary += " and " + juce::String (instrumentCount) + " instruments";
        if (! failures.isEmpty())
            summary += " (kept existing: " + failures.joinIntoString (", ") + ")";
    }
    else
    {
        // Nothing new was written, but — crucially — nothing was destroyed either.
        summary = "No new presets from server - your library is unchanged";
    }

    // The finished callback also refreshes the library from the (untouched) cache,
    // so a no-op sync leaves the browser exactly as it was.

    if (onFinished)
        juce::MessageManager::callAsync ([onFinished, success, summary] { onFinished (success, summary); });
}

} // namespace haos
