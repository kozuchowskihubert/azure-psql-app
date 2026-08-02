#pragma once

#include <JuceHeader.h>

namespace haos
{

struct PluginEntry
{
    juce::String id, name, description, version;
    juce::File   source;        // a built .vst3 found on this machine
    juce::String downloadUrl;   // optional remote package
    juce::String arch;          // "universal", "arm64", "x86_64" or empty if unknown
    bool         installed = false;
    bool         bundled   = false;   // ships inside the Hub

    bool canInstall() const { return source.exists() || downloadUrl.isNotEmpty(); }

    /** arm64-only plugins are invisible to a host running under Rosetta, which
        is a silent failure worth warning about rather than discovering later. */
    bool armOnly() const { return arch == "arm64"; }
};

/** Finds the HAOS plugins already built on this machine and installs them into
    the user's VST3 folder.

    There is no plugin endpoint on haos.fm yet, so discovery is local: it scans
    the sibling CMake projects' artefact folders (the layout JUCE produces) plus
    an optional catalog.json for anything remote. */
class PluginCatalog
{
public:
    static juce::File vst3Dir()
    {
        return juce::File::getSpecialLocation (juce::File::userHomeDirectory)
                   .getChildFile ("Library/Audio/Plug-Ins/VST3");
    }

    static juce::File catalogFile()
    {
        return juce::File::getSpecialLocation (juce::File::userApplicationDataDirectory)
                  #if JUCE_MAC
                   .getChildFile ("Application Support")
                  #endif
                   .getChildFile ("HAOS").getChildFile ("Hub").getChildFile ("catalog.json");
    }

    const juce::Array<PluginEntry>& entries() const noexcept { return items; }

    /** Architectures of a .vst3, read from the Mach-O header of its binary. */
    static juce::String archOf (const juce::File& vst3)
    {
        auto bin = vst3.getChildFile ("Contents/MacOS")
                       .getChildFile (vst3.getFileNameWithoutExtension());
        if (! bin.existsAsFile())
        {
            auto macos = vst3.getChildFile ("Contents/MacOS");
            auto found = macos.findChildFiles (juce::File::findFiles, false);
            if (found.isEmpty()) return {};
            bin = found.getFirst();
        }

        juce::FileInputStream in (bin);
        if (! in.openedOk()) return {};

        const auto magic = (juce::uint32) in.readIntBigEndian();

        // Fat binary: count the slices and map their CPU types.
        if (magic == 0xcafebabe || magic == 0xcafebabf)
        {
            const int n = in.readIntBigEndian();
            bool arm = false, intel = false;
            for (int i = 0; i < juce::jmin (n, 8); ++i)
            {
                const auto cpu = (juce::uint32) in.readIntBigEndian();
                in.skipNextBytes (16);
                if (cpu == 0x0100000c) arm = true;      // CPU_TYPE_ARM64
                if (cpu == 0x01000007) intel = true;    // CPU_TYPE_X86_64
            }
            if (arm && intel) return "universal";
            if (arm)   return "arm64";
            if (intel) return "x86_64";
            return {};
        }

        // Thin binary: the CPU type follows the little-endian magic. readInt() is
        // already little-endian in JUCE.
        if (magic == 0xcffaedfe || magic == 0xcefaedfe)
        {
            const auto cpu = (juce::uint32) in.readInt();
            if (cpu == 0x0100000c) return "arm64";
            if (cpu == 0x01000007) return "x86_64";
        }
        return {};
    }

    /** Plugins shipped inside the Hub itself.

        The app bundle carries a `Plugins` folder in its Resources, so a fresh
        install can offer every HAOS plugin on a machine that has never seen the
        source tree. Falls back to the DMG's sibling folder when running the
        binary straight out of a build directory. */
    static juce::File bundledPluginsDir()
    {
        auto app = juce::File::getSpecialLocation (juce::File::currentApplicationFile);

        const juce::File candidates[] = {
            app.getChildFile ("Contents/Resources/Plugins"),      // inside the .app
            app.getParentDirectory().getChildFile ("Plugins"),    // beside it on the DMG
        };

        for (const auto& c : candidates)
            if (c.isDirectory())
                return c;

        return {};
    }

    void refresh()
    {
        items.clearQuick();

        // --- plugins shipped inside this app -------------------------------
        if (auto bundled = bundledPluginsDir(); bundled.isDirectory())
            for (const auto& v : bundled.findChildFiles (juce::File::findDirectories, false, "*.vst3"))
                addEntry (v.getFileNameWithoutExtension(), v, {});

        // --- locally built artefacts -------------------------------------
        auto projects = juce::File::getSpecialLocation (juce::File::userHomeDirectory)
                            .getChildFile ("Projects");

        if (projects.isDirectory())
        {
            for (const auto& proj : juce::RangedDirectoryIterator (projects, false, "*", juce::File::findDirectories))
            {
                auto build = proj.getFile().getChildFile ("build");
                if (! build.isDirectory())
                    continue;

                for (const auto& vst3 : build.findChildFiles (juce::File::findDirectories, true, "*.vst3"))
                {
                    // Skip JUCE's own copies and nested bundle internals.
                    if (vst3.getFullPathName().containsIgnoreCase ("juce-src"))
                        continue;
                    if (vst3.getParentDirectory().getFileName() == "Contents")
                        continue;

                    addEntry (vst3.getFileNameWithoutExtension(), vst3, {});
                }
            }
        }

        // --- already installed, even without a local build ----------------
        if (vst3Dir().isDirectory())
            for (const auto& inst : vst3Dir().findChildFiles (juce::File::findDirectories, false, "*.vst3"))
                addEntry (inst.getFileNameWithoutExtension(), {}, {});

        // --- optional remote catalog --------------------------------------
        auto cf = catalogFile();
        if (cf.existsAsFile())
        {
            auto json = juce::JSON::parse (cf.loadFileAsString());
            if (auto* arr = json.getArray())
            {
                for (const auto& v : *arr)
                {
                    if (auto* o = v.getDynamicObject())
                    {
                        auto name = o->getProperty ("name").toString();
                        if (name.isEmpty())
                            continue;

                        auto& e = addEntry (name, {}, o->getProperty ("url").toString());
                        e.description = o->getProperty ("description").toString();
                        e.version     = o->getProperty ("version").toString();
                    }
                }
            }
        }

        auto bundledDir = bundledPluginsDir();

        for (auto& e : items)
        {
            auto installedCopy = vst3Dir().getChildFile (e.name + ".vst3");
            e.installed = installedCopy.exists();
            e.bundled   = bundledDir.isDirectory()
                          && bundledDir.getChildFile (e.name + ".vst3").exists();

            // Prefer reporting the architecture of what we would actually install.
            auto probe = e.source.exists() ? e.source : installedCopy;
            if (probe.exists())
                e.arch = archOf (probe);
        }

        std::sort (items.begin(), items.end(),
                   [] (const PluginEntry& a, const PluginEntry& b)
                   { return a.name.compareIgnoreCase (b.name) < 0; });
    }

    /** Copies a built plugin into the user's VST3 folder. Returns false and sets
        `error` if there is nothing to copy or the copy fails. */
    bool install (const PluginEntry& entry, juce::String& error)
    {
        if (! entry.source.exists())
        {
            error = entry.downloadUrl.isNotEmpty()
                      ? "Remote download is not implemented yet - no package host configured"
                      : "No built copy of " + entry.name + " found on this machine";
            return false;
        }

        auto dest = vst3Dir().getChildFile (entry.name + ".vst3");
        if (! vst3Dir().isDirectory() && ! vst3Dir().createDirectory())
        {
            error = "Could not create " + vst3Dir().getFullPathName();
            return false;
        }

        if (dest.exists() && ! dest.deleteRecursively())
        {
            error = "Could not replace the existing " + dest.getFileName();
            return false;
        }

        if (! entry.source.copyDirectoryTo (dest))
        {
            error = "Copy failed - check permissions on " + vst3Dir().getFullPathName();
            return false;
        }

        return true;
    }

    bool uninstall (const PluginEntry& entry, juce::String& error)
    {
        auto dest = vst3Dir().getChildFile (entry.name + ".vst3");
        if (! dest.exists())
        {
            error = entry.name + " is not installed";
            return false;
        }
        if (! dest.deleteRecursively())
        {
            error = "Could not remove " + dest.getFullPathName();
            return false;
        }
        return true;
    }

private:
    PluginEntry& addEntry (const juce::String& name, const juce::File& source, const juce::String& url)
    {
        for (auto& e : items)
        {
            if (e.name == name)
            {
                if (source.exists() && ! e.source.exists()) e.source = source;
                if (url.isNotEmpty() && e.downloadUrl.isEmpty()) e.downloadUrl = url;
                return e;
            }
        }

        PluginEntry e;
        e.id          = name.toLowerCase().replaceCharacter (' ', '-');
        e.name        = name;
        e.source      = source;
        e.downloadUrl = url;
        items.add (e);
        return items.getReference (items.size() - 1);
    }

    juce::Array<PluginEntry> items;
};

} // namespace haos
