#pragma once

#include <JuceHeader.h>
#include <functional>

namespace haos
{

//==============================================================================
/** One entry in the hub. Either a synth patch (tb303-style, maps onto the analog
    engine) or a drum pattern (tr909 / tr808, exported as a draggable MIDI clip). */
struct Preset
{
    juce::String id, name, category, description, instrument, author, source, maker, kind;
    double bpm = 0.0;
    juce::var data;          // the patch's "data" node: { params: {...}, pattern: ... }

    /** Drum machines carry step patterns rather than synth parameters. */
    bool isDrumPattern() const
    {
        if (kind.isNotEmpty())
            return kind == "drums";
        return instrument == "tr909" || instrument == "tr808";
    }

    juce::var params()  const { return data.getProperty ("params",  juce::var()); }
    juce::var pattern() const { return data.getProperty ("pattern", juce::var()); }
};

//==============================================================================
/** A downloadable/installed pack: a folder of samples plus its presets. */
struct Bundle
{
    juce::String id, name, description;
    juce::File   folder;
    juce::Array<Preset>     presets;
    juce::Array<juce::File> samples;

    /** True for third-party preset folders (Serum, Nexus, Kontakt...) discovered
        by scanExternalFolders(). Those hold patch files rather than audio. */
    bool         isExternal = false;
    juce::String vendor;        // top-level library the folder came from

    juce::Image  cover;         // optional pack logotype (cover.png in the folder)

    bool isInstalled() const { return folder.isDirectory(); }
};

//==============================================================================
/** Owns everything the browser shows: installed bundles on disk plus the presets
    pulled from haos.fm. Pure data + mapping; no UI and no networking here. */
class PresetLibrary
{
public:
    PresetLibrary() = default;

    //== Locations =============================================================
    static juce::File rootDir();
    static juce::File bundlesDir();
    static juce::File cacheDir();
    static juce::File cacheFileFor (const juce::String& instrument);

    //== Loading ===============================================================
    /** Scans ~/Library/Application Support/HAOS/Hub/Bundles for bundle.json packs. */
    void rescanBundles();

    /** Ingests the JSON array returned by GET /api/patches/:instrument.
        Replaces any presets previously held for that instrument. */
    void ingestPatches (const juce::String& instrument, const juce::var& json);

    /** Loads every instrument's cached JSON from disk (used on startup / offline). */
    void loadCaches();

    //== Third-party preset libraries (Serum / Nexus / Kontakt / ...) ==========
    /** Folders searched for third-party patches. Defaults cover the usual vendor
        locations; override by listing paths (one per line) in roots.txt. */
    static juce::Array<juce::File> externalRoots();
    static juce::File rootsFile();
    static juce::File externalCacheFile();

    /** File types treated as third-party presets. */
    static juce::String presetWildcards();

    /** Walks externalRoots() and returns one bundle per folder holding patches.
        SLOW (tens of thousands of files) — call it off the message thread.
        shouldAbort is polled during the walk so an owning thread can join fast. */
    static juce::Array<Bundle> scanExternalFolders (std::function<bool()> shouldAbort = nullptr);

    /** Persists a scan result to the cache file (heavy I/O — worker thread). */
    static void writeExternalCache (const juce::Array<Bundle>&);

    /** Swaps in a scan result (message thread). */
    void setExternalBundles (const juce::Array<Bundle>&, bool writeCache = true);

    /** Instant path: restores the previous scan. True when a cache existed. */
    bool loadExternalCache();

    /** Total third-party patch files currently catalogued. */
    int externalCount() const;

    //== Queries ===============================================================
    const juce::Array<Bundle>& getBundles() const noexcept { return bundles; }
    const juce::Array<Preset>& getPresets() const noexcept { return presets; }

    juce::StringArray getInstruments() const;
    juce::StringArray getCategories() const;

    /** Case-insensitive filter over name/category/description. Empty args match all. */
    juce::Array<Preset> search (const juce::String& query,
                                const juce::String& instrument = {},
                                const juce::String& category   = {}) const;

    //== Applying ==============================================================
    /** Maps a tb303-style patch onto the analog engine's parameters.
        Returns false for drum patterns, which have nothing to map. */
    static bool applyToState (const Preset&, juce::AudioProcessorValueTreeState&);

    /** Renders a drum pattern to a standard MIDI file so it can be dragged into
        the DAW. Returns the file, or an invalid File if the preset has no pattern. */
    static juce::File writePatternMidi (const Preset&);

private:
    juce::Array<Bundle> bundles;
    juce::Array<Preset> presets;

    static Preset parsePatch (const juce::var& item, const juce::String& fallbackInstrument);

    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR (PresetLibrary)
};

} // namespace haos
