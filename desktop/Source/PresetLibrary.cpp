#include "PresetLibrary.h"
#include "Params.h"

#include <map>
#include <algorithm>

namespace haos
{
//==============================================================================
/** "Clean and lean": a preset the engine cannot actually load (no synth params
    and no drum pattern) is noise in the browser — filter it at ingest. */
static bool presetIsLoadable (const haos::Preset& p)
{
    // Only the built-in engines (TB-303 / TR-909 / TR-808) can play a patch —
    // presets for any other instrument are dead weight in the browser.
    if (p.instrument.isNotEmpty()
        && p.instrument != "tb303" && p.instrument != "tr909" && p.instrument != "tr808")
        return false;
    if (p.isDrumPattern())
        return p.pattern().isArray();
    return p.params().getDynamicObject() != nullptr;
}


//==============================================================================
// Locations
//==============================================================================

juce::File PresetLibrary::rootDir()
{
    auto base = juce::File::getSpecialLocation (juce::File::userApplicationDataDirectory);

   #if JUCE_MAC
    // userApplicationDataDirectory is ~/Library on macOS, so descend into Application Support.
    base = base.getChildFile ("Application Support");
   #endif

    return base.getChildFile ("HAOS").getChildFile ("Hub");
}

juce::File PresetLibrary::bundlesDir() { return rootDir().getChildFile ("Bundles"); }
juce::File PresetLibrary::cacheDir()   { return rootDir().getChildFile ("Cache"); }

juce::File PresetLibrary::cacheFileFor (const juce::String& instrument)
{
    return cacheDir().getChildFile (instrument + ".json");
}

//==============================================================================
// Local bundles
//==============================================================================

//==============================================================================
//  Third-party preset libraries
//==============================================================================
juce::File PresetLibrary::rootsFile()         { return rootDir().getChildFile ("roots.txt"); }
juce::File PresetLibrary::externalCacheFile() { return cacheDir().getChildFile ("external-libraries.txt"); }

juce::String PresetLibrary::presetWildcards()
{
    // Serum2, Massive, Vital, u-he, NI, Ableton, Kontakt, AU.
    // .fxp/.fxb deliberately EXCLUDED (user call 2026-07-30): legacy VST2
    // patches (Serum1/Nexus dumps) flooded the vault with tens of thousands
    // of entries the Hub can only reveal, never play.
    return "*.serumpreset;*.nmsv;*.vital;*.h2p;*.nksf;*.nksn;"
           "*.adv;*.adg;*.aupreset;*.vstpreset;*.spf;*.nki;*.exs";
}

juce::Array<juce::File> PresetLibrary::externalRoots()
{
    juce::Array<juce::File> roots;

    // roots.txt (one path per line) wins outright, so the user can point the hub
    // anywhere without a rebuild.
    if (auto f = rootsFile(); f.existsAsFile())
    {
        for (auto line : juce::StringArray::fromLines (f.loadFileAsString()))
        {
            line = line.trim();
            if (line.isEmpty() || line.startsWith ("#")) continue;
            juce::File d (line.replace ("~", juce::File::getSpecialLocation (juce::File::userHomeDirectory).getFullPathName()));
            if (d.isDirectory()) roots.addIfNotAlreadyThere (d);
        }
        if (! roots.isEmpty()) return roots;
    }

    const auto home = juce::File::getSpecialLocation (juce::File::userHomeDirectory);
    const char* candidates[] = {
        "PML", "Documents/Xfer", "Library/Audio/Presets",
        "Library/Application Support/Cymatics", "Downloads/Cymatics",
        "Library/Application Support/reFX"
    };
    for (auto* c : candidates)
        if (auto d = home.getChildFile (c); d.isDirectory()) roots.addIfNotAlreadyThere (d);

    for (auto* abs : { "/Users/Shared/reFX", "/Library/Audio/Presets" })
        if (juce::File d (abs); d.isDirectory()) roots.addIfNotAlreadyThere (d);

    return roots;
}

juce::Array<Bundle> PresetLibrary::scanExternalFolders (std::function<bool()> shouldAbort)
{
    juce::Array<Bundle> out;
    const auto wildcards = presetWildcards();
    int visited = 0;

    for (const auto& root : externalRoots())
    {
        // One bundle per folder that DIRECTLY holds patches: that keeps the
        // granularity at "pack" level instead of one giant blob per vendor.
        std::map<juce::String, Bundle> byFolder;

        for (const auto& entry : juce::RangedDirectoryIterator (root, true, wildcards, juce::File::findFiles))
        {
            if (shouldAbort != nullptr && (++visited & 0xFF) == 0 && shouldAbort())
                return {};

            const auto file   = entry.getFile();
            const auto parent = file.getParentDirectory();
            const auto key    = parent.getFullPathName();

            auto it = byFolder.find (key);
            if (it == byFolder.end())
            {
                Bundle b;
                b.folder     = parent;
                b.name       = parent.getFileName();
                b.id         = "ext-" + juce::String (key.hashCode64());
                b.isExternal = true;
                b.vendor     = root.getFileName();
                b.description = parent.getRelativePathFrom (root);
                it = byFolder.emplace (key, std::move (b)).first;
            }
            it->second.samples.add (file);
        }

        for (auto& [k, b] : byFolder)
        {
            juce::ignoreUnused (k);
            b.samples.sort();
            out.add (std::move (b));
        }
    }

    // Vendors often install the same library in several places (Nexus keeps three
    // ~300 MB copies), so the browser would list every pack two or three times.
    // Treat "same folder name + same file count" as the same pack and keep the
    // copy with the shortest path, which is the canonical install.
    std::sort (out.begin(), out.end(), [] (const Bundle& a, const Bundle& b)
    {
        const int byName = a.name.compareIgnoreCase (b.name);
        if (byName != 0) return byName < 0;
        if (a.samples.size() != b.samples.size()) return a.samples.size() > b.samples.size();
        return a.folder.getFullPathName().length() < b.folder.getFullPathName().length();
    });

    juce::Array<Bundle> deduped;
    for (auto& b : out)
    {
        if (! deduped.isEmpty())
        {
            const auto& prev = deduped.getReference (deduped.size() - 1);
            if (prev.name.equalsIgnoreCase (b.name) && prev.samples.size() == b.samples.size())
                continue;
        }
        deduped.add (std::move (b));
    }

    return deduped;
}

void PresetLibrary::writeExternalCache (const juce::Array<Bundle>& scanned)
{
    // Flat text via a growing stream: quicker to write/parse than JSON at this
    // size, and no repeated String reallocation for ~70k lines.
    juce::MemoryOutputStream txt;
    txt << "# HAOS Hub external preset cache\n";
    for (const auto& b : scanned)
    {
        txt << "B\t" << b.name << "\t" << b.folder.getFullPathName() << "\t" << b.vendor
            << "\t" << b.description << "\n";
        for (const auto& f : b.samples) txt << "F\t" << f.getFullPathName() << "\n";
    }
    externalCacheFile().getParentDirectory().createDirectory();
    externalCacheFile().replaceWithText (txt.toUTF8());
}

void PresetLibrary::setExternalBundles (const juce::Array<Bundle>& scanned, bool writeCache)
{
    for (int i = bundles.size(); --i >= 0;)
        if (bundles.getReference (i).isExternal) bundles.remove (i);

    bundles.addArray (scanned);

    if (writeCache)
        writeExternalCache (scanned);
}

bool PresetLibrary::loadExternalCache()
{
    auto f = externalCacheFile();
    if (! f.existsAsFile()) return false;

    juce::Array<Bundle> loaded;
    juce::StringArray lines;
    f.readLines (lines);

    for (const auto& line : lines)
    {
        if (line.startsWith ("B\t"))
        {
            auto parts = juce::StringArray::fromTokens (line, "\t", "");
            Bundle b;
            b.name        = parts.size() > 1 ? parts[1] : juce::String();
            b.folder      = juce::File (parts.size() > 2 ? parts[2] : juce::String());
            b.vendor      = parts.size() > 3 ? parts[3] : juce::String();
            b.description = parts.size() > 4 ? parts[4] : juce::String();
            b.id          = "ext-" + juce::String (b.folder.getFullPathName().hashCode64());
            b.isExternal  = true;
            loaded.add (std::move (b));
        }
        else if (line.startsWith ("F\t") && ! loaded.isEmpty())
        {
            // caches written before the .fxp/.fxb exclusion still carry them
            juce::File pf (line.substring (2));
            if (! pf.hasFileExtension ("fxp;fxb"))
                loaded.getReference (loaded.size() - 1).samples.add (pf);
        }
    }

    // drop bundles that held nothing but .fxp/.fxb
    for (int i = loaded.size(); --i >= 0;)
        if (loaded.getReference (i).samples.isEmpty()) loaded.remove (i);

    if (loaded.isEmpty()) return false;

    for (int i = bundles.size(); --i >= 0;)
        if (bundles.getReference (i).isExternal) bundles.remove (i);
    bundles.addArray (loaded);
    return true;
}

int PresetLibrary::externalCount() const
{
    int n = 0;
    for (const auto& b : bundles) if (b.isExternal) n += b.samples.size();
    return n;
}

//==============================================================================
void PresetLibrary::rescanBundles()
{
    // Keep any third-party bundles; only the local packs are re-read here.
    for (int i = bundles.size(); --i >= 0;)
        if (! bundles.getReference (i).isExternal) bundles.remove (i);

    // Factory presets living in bundle.json are re-added below — drop the
    // previous scan's copies so repeated rescans can't duplicate them.
    for (int i = presets.size(); --i >= 0;)
        if (presets.getReference (i).source == "pack") presets.remove (i);

    auto dir = bundlesDir();
    if (! dir.isDirectory())
    {
        dir.createDirectory();
        return;
    }

    for (const auto& entry : juce::RangedDirectoryIterator (dir, false, "*", juce::File::findDirectories))
    {
        auto folder = entry.getFile();

        Bundle b;
        b.id     = folder.getFileName();
        b.name   = folder.getFileName();
        b.folder = folder;

        // bundle.json is optional — a bare folder of samples is still a usable pack.
        auto manifest = folder.getChildFile ("bundle.json");
        if (manifest.existsAsFile())
        {
            auto json = juce::JSON::parse (manifest.loadFileAsString());
            if (auto* obj = json.getDynamicObject())
            {
                b.name        = obj->getProperty ("name").toString().isNotEmpty()
                                    ? obj->getProperty ("name").toString() : b.name;
                b.id          = obj->getProperty ("id").toString().isNotEmpty()
                                    ? obj->getProperty ("id").toString() : b.id;
                b.description = obj->getProperty ("description").toString();

                if (auto* arr = obj->getProperty ("presets").getArray())
                    for (const auto& item : *arr)
                        if (auto pr = parsePatch (item, obj->getProperty ("instrument").toString()); presetIsLoadable (pr))
                        {
                            b.presets.add (pr);

                            // ...and into the global list, so the PRESETS page
                            // is the shop window for the whole factory library.
                            pr.source = "pack";
                            if (pr.maker.isEmpty()) pr.maker = b.name;
                            presets.add (pr);
                        }
            }
        }

        b.samples = folder.findChildFiles (juce::File::findFiles, true, "*.wav;*.aif;*.aiff;*.flac;*.mp3;*.mid");
        b.samples.sort();

        if (auto coverFile = folder.getChildFile ("cover.png"); coverFile.existsAsFile())
            b.cover = juce::ImageFileFormat::loadFrom (coverFile);

        bundles.add (std::move (b));
    }
}

//==============================================================================
// haos.fm patches
//==============================================================================

Preset PresetLibrary::parsePatch (const juce::var& item, const juce::String& fallbackInstrument)
{
    Preset p;

    if (auto* obj = item.getDynamicObject())
    {
        p.id          = obj->getProperty ("id").toString();
        p.name        = obj->getProperty ("name").toString();
        p.category    = obj->getProperty ("category").toString();
        p.description = obj->getProperty ("description").toString();
        p.instrument  = obj->getProperty ("instrument").toString();
        p.author      = obj->getProperty ("author").toString();
        p.source      = obj->getProperty ("source").toString();
        p.data        = obj->getProperty ("data");

        if (obj->hasProperty ("bpm"))
            p.bpm = (double) obj->getProperty ("bpm");

        // Unified catalog fields.
        p.maker = obj->getProperty ("maker").toString();
        p.kind  = obj->getProperty ("kind").toString();

        // The catalog puts params/pattern at the top level rather than nested
        // under "data"; keep both shapes working.
        if (p.data.isVoid() || p.data.isUndefined())
        {
            auto* d = new juce::DynamicObject();
            d->setProperty ("params",  obj->getProperty ("params"));
            d->setProperty ("pattern", obj->getProperty ("pattern"));
            p.data = juce::var (d);
        }
    }

    if (p.instrument.isEmpty())  p.instrument = fallbackInstrument;
    if (p.category.isEmpty())    p.category   = "Uncategorised";
    if (p.name.isEmpty())        p.name       = "Untitled";
    if (p.source.isEmpty())      p.source     = p.id.startsWith ("factory-") ? "factory" : "user";

    return p;
}

void PresetLibrary::ingestPatches (const juce::String& instrument, const juce::var& json)
{
    // An empty (or non-array) payload must never remove what we already hold —
    // otherwise a stray empty cache file would silently empty the browser.
    auto* arr = json.getArray();
    if (arr == nullptr || arr->isEmpty())
        return;

    // Drop anything we already held for this instrument so a re-sync replaces
    // rather than duplicates.
    for (int i = presets.size(); --i >= 0;)
        if (presets.getReference (i).instrument == instrument)
            presets.remove (i);

    for (const auto& item : *arr)
        if (auto pr = parsePatch (item, instrument); presetIsLoadable (pr))
            presets.add (pr);
}

void PresetLibrary::loadCaches()
{
    auto dir = cacheDir();
    if (! dir.isDirectory())
    {
        dir.createDirectory();
        return;
    }

    // The unified catalog (every preset the site ships, already normalised to the
    // three-oscillator model) takes precedence. The per-instrument caches remain
    // as a fallback for anyone who only ever synced the older patch endpoints.
    auto unified = dir.getChildFile ("hub-presets.json");
    if (unified.existsAsFile())
    {
        auto json = juce::JSON::parse (unified.loadFileAsString());
        if (auto* arr = json.getArray(); arr != nullptr && ! arr->isEmpty())
        {
            presets.clearQuick();
            for (const auto& item : *arr)
                if (auto pr = parsePatch (item, {}); presetIsLoadable (pr))
                    presets.add (pr);
            return;
        }
    }

    for (const auto& entry : juce::RangedDirectoryIterator (dir, false, "*.json", juce::File::findFiles))
    {
        auto file = entry.getFile();
        if (file.getFileName() == "hub-presets.json")
            continue;

        auto json = juce::JSON::parse (file.loadFileAsString());
        if (json.isArray())
            ingestPatches (file.getFileNameWithoutExtension(), json);
    }
}

//==============================================================================
// Queries
//==============================================================================

juce::StringArray PresetLibrary::getInstruments() const
{
    juce::StringArray out;
    for (const auto& p : presets)
        out.addIfNotAlreadyThere (p.instrument);
    out.sort (true);
    return out;
}

juce::StringArray PresetLibrary::getCategories() const
{
    juce::StringArray out;
    for (const auto& p : presets)
        out.addIfNotAlreadyThere (p.category);
    out.sort (true);
    return out;
}

juce::Array<Preset> PresetLibrary::search (const juce::String& query,
                                           const juce::String& instrument,
                                           const juce::String& category) const
{
    juce::Array<Preset> out;
    const auto q = query.trim().toLowerCase();

    for (const auto& p : presets)
    {
        if (instrument.isNotEmpty() && p.instrument != instrument) continue;
        if (category.isNotEmpty()   && p.category   != category)   continue;

        if (q.isNotEmpty()
            && ! p.name.toLowerCase().contains (q)
            && ! p.category.toLowerCase().contains (q)
            && ! p.description.toLowerCase().contains (q))
            continue;

        out.add (p);
    }

    return out;
}

//==============================================================================
// Applying a patch to the engine
//==============================================================================

namespace
{
    void setParam (juce::AudioProcessorValueTreeState& s, const char* id, float value)
    {
        if (auto* p = s.getParameter (id))
            p->setValueNotifyingHost (p->convertTo0to1 (value));
    }

    int waveformToShape (const juce::String& w)
    {
        const auto s = w.toLowerCase();
        if (s.startsWith ("squ") || s.startsWith ("pul")) return 1;
        if (s.startsWith ("tri"))                         return 2;
        if (s.startsWith ("sin"))                         return 3;
        return 0; // sawtooth
    }
}

bool PresetLibrary::applyToState (const Preset& preset, juce::AudioProcessorValueTreeState& state)
{
    if (preset.isDrumPattern())
        return false;

    auto params = preset.params();
    auto* obj = params.getDynamicObject();
    if (obj == nullptr)
        return false;

    auto num = [] (juce::DynamicObject* o, const char* key, float fallback) -> float
    {
        if (o != nullptr && o->hasProperty (key))
        {
            const auto v = o->getProperty (key);
            if (v.isDouble() || v.isInt() || v.isInt64())
                return (float) (double) v;
        }
        return fallback;
    };

    // ---- oscillators ------------------------------------------------------
    // The catalog expresses fine tune in CENTS (-1200..+1200); the engine's
    // detune parameter is in semitones, so divide by 100. Treating cents as
    // semitones would put a "detune 7" patch a fifth out instead of 7 cents.
    struct OscIds { const char* shape; const char* octave; const char* detune; const char* level; };
    const OscIds ids[3] = {
        { pid::osc1Shape, pid::osc1Octave, pid::osc1Detune, pid::osc1Level },
        { pid::osc2Shape, pid::osc2Octave, pid::osc2Detune, pid::osc2Level },
        { pid::osc3Shape, pid::osc3Octave, pid::osc3Detune, pid::osc3Level },
    };
    const char* oscKeys[3] = { "osc1", "osc2", "osc3" };

    float extraNoise = 0.0f;

    for (int i = 0; i < 3; ++i)
    {
        auto* o = obj->getProperty (oscKeys[i]).getDynamicObject();
        if (o == nullptr)
            continue;

        const auto wave = o->getProperty ("waveform").toString();

        // "noise" is not an oscillator shape here — fold it into the noise
        // generator so the patch still sounds as intended.
        if (wave.equalsIgnoreCase ("noise"))
            extraNoise = juce::jmax (extraNoise, num (o, "level", 0.0f));
        else
            setParam (state, ids[i].shape, (float) waveformToShape (wave));

        // octave is a choice: index 0 == -3
        const float oct = juce::jlimit (-3.0f, 3.0f, num (o, "octave", 0.0f));
        setParam (state, ids[i].octave, oct + 3.0f);

        setParam (state, ids[i].detune,
                  juce::jlimit (-12.0f, 12.0f, num (o, "detune", 0.0f) / 100.0f));
        setParam (state, ids[i].level,
                  juce::jlimit (0.0f, 1.0f, num (o, "level", i == 0 ? 0.8f : 0.0f)));
    }

    // ---- filter -----------------------------------------------------------
    if (auto* flt = obj->getProperty ("filter").getDynamicObject())
    {
        setParam (state, pid::cutoff,
                  juce::jlimit (20.0f, 18000.0f, num (flt, "cutoff", 1000.0f)));
        // The catalog already normalises resonance to 0..1.
        setParam (state, pid::resonance,
                  juce::jlimit (0.0f, 0.95f, num (flt, "resonance", 0.3f)));
        setParam (state, pid::envMod,
                  juce::jlimit (0.0f, 1.0f, num (flt, "envAmount", 0.5f)));
        setParam (state, pid::modKeyTrack,
                  juce::jlimit (0.0f, 1.0f, num (flt, "keyTrack", 0.5f)));
    }

    // ---- envelopes --------------------------------------------------------
    auto applyEnv = [&] (const char* key, const char* a, const char* d,
                         const char* sus, const char* r, float defD)
    {
        if (auto* e = obj->getProperty (key).getDynamicObject())
        {
            setParam (state, a,   juce::jlimit (0.001f, 5.0f, num (e, "attack",  0.005f)));
            setParam (state, d,   juce::jlimit (0.005f, 5.0f, num (e, "decay",   defD)));
            setParam (state, sus, juce::jlimit (0.0f,   1.0f, num (e, "sustain", 0.7f)));
            setParam (state, r,   juce::jlimit (0.005f, 8.0f, num (e, "release", 0.25f)));
        }
    };
    applyEnv ("ampEnv",    pid::ampA, pid::ampD, pid::ampS, pid::ampR, 0.20f);
    applyEnv ("filterEnv", pid::fltA, pid::fltD, pid::fltS, pid::fltR, 0.25f);

    // ---- LFO and its destination -----------------------------------------
    if (auto* l = obj->getProperty ("lfo").getDynamicObject())
    {
        setParam (state, pid::lfoShape, (float) waveformToShape (l->getProperty ("waveform").toString()));
        setParam (state, pid::lfoRate,  juce::jlimit (0.0f, 20.0f, num (l, "rate",  0.0f)));

        const float depth = juce::jlimit (0.0f, 1.0f, num (l, "depth", 0.0f));
        setParam (state, pid::lfoDepth, depth);

        // Route the LFO where the preset says, clearing the others so a patch
        // never inherits the previous one's routing.
        const auto dest = l->getProperty ("dest").toString().toLowerCase();
        setParam (state, pid::modLfoFilter, dest.contains ("filter") || dest.contains ("cutoff") ? depth : 0.0f);
        setParam (state, pid::modLfoPitch,  dest.contains ("pitch")  || dest.contains ("vibrato") ? depth : 0.0f);
        setParam (state, pid::modLfoAmp,    dest.contains ("amp")    || dest.contains ("tremolo") ? depth : 0.0f);
        setParam (state, pid::modLfoPwm,    dest.contains ("pwm")   || dest.contains ("width")   ? depth : 0.0f);
    }

    // ---- extras -----------------------------------------------------------
    // "noise" is either a plain level or an object { type, level } — the FX
    // patches in the catalog are noise-only and use the object form, so reading
    // it as a bare number left them completely silent.
    float noiseLevel = extraNoise;
    {
        const auto n = obj->getProperty ("noise");
        if (auto* no = n.getDynamicObject())
            noiseLevel = juce::jmax (noiseLevel, num (no, "level", 0.0f));
        else
            noiseLevel = juce::jmax (noiseLevel, num (obj, "noise", 0.0f));
    }
    setParam (state, pid::noiseLevel, juce::jlimit (0.0f, 1.0f, noiseLevel));
    setParam (state, pid::ringMod, juce::jlimit (0.0f, 1.0f, num (obj, "ringMod", 0.0f)));
    setParam (state, pid::glide,   juce::jlimit (0.0f, 1.0f, num (obj, "glide", 0.0f)));

    // ---- legacy shape: a flat tb303-style params block ---------------------
    if (obj->hasProperty ("cutoff") || obj->hasProperty ("waveform"))
    {
        if (obj->hasProperty ("waveform"))
            setParam (state, pid::osc1Shape,
                      (float) waveformToShape (obj->getProperty ("waveform").toString()));

        if (obj->hasProperty ("cutoff"))
            setParam (state, pid::cutoff, juce::jlimit (20.0f, 18000.0f, num (obj, "cutoff", 1000.0f)));

        if (obj->hasProperty ("resonance"))
        {
            // The web 303 uses a 0..32 dial; the ladder wants 0..1.
            auto r = num (obj, "resonance", 0.3f);
            if (r > 1.5f) r /= 32.0f;
            setParam (state, pid::resonance, juce::jlimit (0.0f, 0.95f, r));
        }

        if (obj->hasProperty ("envMod"))
            setParam (state, pid::envMod, juce::jlimit (0.0f, 1.0f, num (obj, "envMod", 0.5f)));

        if (obj->hasProperty ("decay"))
        {
            const auto d = juce::jlimit (0.01f, 4.0f, num (obj, "decay", 0.3f));
            setParam (state, pid::fltD, d);
            setParam (state, pid::fltS, 0.0f);
            setParam (state, pid::ampD, juce::jmax (d, 0.10f));
        }

        if (obj->hasProperty ("slideTime"))
            setParam (state, pid::glide, juce::jlimit (0.0f, 1.0f, num (obj, "slideTime", 0.0f)));
    }

    return true;
}

//==============================================================================
// Pattern -> MIDI clip
//==============================================================================

namespace
{
    /** General-MIDI drum note for the web app's instrument keys. */
    int drumNoteFor (const juce::String& key)
    {
        const auto k = key.toLowerCase();
        if (k.startsWith ("kick"))   return 36;
        if (k.startsWith ("rim"))    return 37;
        if (k.startsWith ("snare"))  return 38;
        if (k.startsWith ("clap"))   return 39;
        if (k == "hatopen" || k.contains ("open")) return 46;
        if (k.startsWith ("hat"))    return 42;
        if (k.startsWith ("tom"))    return 45;
        if (k.startsWith ("crash"))  return 49;
        if (k.startsWith ("ride"))   return 51;
        if (k.startsWith ("cowbell"))return 56;
        if (k.startsWith ("conga"))  return 63;
        if (k.startsWith ("clave"))  return 75;
        return 38;
    }

    /** Parses note names like "C2", "D#2", "Ab3" using the C4 = 60 convention. */
    int noteNameToMidi (const juce::String& name)
    {
        static const int base[] = { 9, 11, 0, 2, 4, 5, 7 }; // A B C D E F G
        auto s = name.trim();
        if (s.isEmpty()) return -1;

        const auto letter = juce::CharacterFunctions::toUpperCase (s[0]);
        if (letter < 'A' || letter > 'G') return -1;

        int semitone = base[letter - 'A'];
        int i = 1;
        while (i < s.length() && (s[i] == '#' || s[i] == 'b'))
        {
            semitone += (s[i] == '#') ? 1 : -1;
            ++i;
        }

        const auto octave = s.substring (i).getIntValue();
        return juce::jlimit (0, 127, 12 * (octave + 1) + semitone);
    }
}

juce::File PresetLibrary::writePatternMidi (const Preset& preset)
{
    auto patternVar = preset.pattern();
    if (patternVar.isVoid() || patternVar.isUndefined())
        return {};

    constexpr int ticksPerQuarter = 960;
    constexpr int ticksPerStep    = ticksPerQuarter / 4;   // 16th notes

    juce::MidiMessageSequence notes;

    // Drum kits belong on the GM percussion channel; a melodic 303 line does NOT,
    // or the host plays the bassline as drums.
    const int channel = preset.isDrumPattern() ? 10 : 1;

    auto addNote = [&] (int midiNote, int step, int velocity, int lengthSteps)
    {
        if (midiNote < 0) return;
        const double on  = step * ticksPerStep;
        const double off = on + juce::jmax (1, lengthSteps) * ticksPerStep * 0.9;
        notes.addEvent (juce::MidiMessage::noteOn  (channel, midiNote, (juce::uint8) velocity), on);
        notes.addEvent (juce::MidiMessage::noteOff (channel, midiNote), off);
    };

    if (auto* patObj = patternVar.getDynamicObject())
    {
        // Drum machine: { kick: [1,0,...], snare: [...] }
        for (const auto& prop : patObj->getProperties())
        {
            const auto note = drumNoteFor (prop.name.toString());
            if (auto* steps = prop.value.getArray())
                for (int i = 0; i < steps->size(); ++i)
                    if ((int) (*steps)[i] > 0)
                        addNote (note, i, 100, 1);
        }
    }
    else if (auto* steps = patternVar.getArray())
    {
        // Melodic sequencer: [ { note: "C2", active, accent, slide }, ... ]
        for (int i = 0; i < steps->size(); ++i)
        {
            auto* stepObj = (*steps)[i].getDynamicObject();
            if (stepObj == nullptr) continue;
            if (! (bool) stepObj->getProperty ("active")) continue;

            const auto midiNote = noteNameToMidi (stepObj->getProperty ("note").toString());
            const bool accent   = (bool) stepObj->getProperty ("accent");
            const bool slide    = (bool) stepObj->getProperty ("slide");
            addNote (midiNote, i, accent ? 120 : 90, slide ? 2 : 1);
        }
    }

    if (notes.getNumEvents() == 0)
        return {};

    notes.updateMatchedPairs();

    juce::MidiMessageSequence tempoTrack;
    const double bpm = preset.bpm > 0.0 ? preset.bpm : 120.0;
    tempoTrack.addEvent (juce::MidiMessage::tempoMetaEvent ((int) (60000000.0 / bpm)), 0.0);

    juce::MidiFile midi;
    midi.setTicksPerQuarterNote (ticksPerQuarter);
    midi.addTrack (tempoTrack);
    midi.addTrack (notes);

    auto safeName = juce::File::createLegalFileName (
        preset.name + " " + juce::String ((int) bpm) + "bpm");

    auto out = juce::File::getSpecialLocation (juce::File::tempDirectory)
                   .getChildFile ("HAOS Hub")
                   .getChildFile (safeName + ".mid");

    out.getParentDirectory().createDirectory();
    out.deleteFile();

    if (auto stream = std::unique_ptr<juce::FileOutputStream> (out.createOutputStream()))
    {
        midi.writeTo (*stream);
        stream->flush();
        return out;
    }

    return {};
}

} // namespace haos
