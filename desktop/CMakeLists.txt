cmake_minimum_required(VERSION 3.22)

project(HAOSHub VERSION 0.1.0 LANGUAGES C CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_OSX_DEPLOYMENT_TARGET "11.0" CACHE STRING "Minimum macOS")

# --- Pull JUCE (reuse the checkout the other HAOS plugins already fetched) ---
# Disk is very tight on this machine, so never re-clone JUCE when a copy exists.
# CI (Windows) passes -DHAOS_COPY_PLUGIN_AFTER_BUILD=OFF: the runner must not
# copy plugins into system folders. Default ON preserves the local mac workflow.
option(HAOS_COPY_PLUGIN_AFTER_BUILD "Copy plugins into the system plugin folders after each build" ON)

include(FetchContent)
foreach(_haos_juce
        "$ENV{HOME}/Projects/RubikChord/build/_deps/juce-src"
        "$ENV{HOME}/Projects/HAOS-Reactor/build/_deps/juce-src")
    if(EXISTS "${_haos_juce}/CMakeLists.txt")
        set(FETCHCONTENT_SOURCE_DIR_JUCE "${_haos_juce}"
            CACHE PATH "Reuse an existing JUCE checkout")
        message(STATUS "HAOS Hub: reusing JUCE from ${_haos_juce}")
        break()
    endif()
endforeach()
FetchContent_Declare(JUCE
    GIT_REPOSITORY https://github.com/juce-framework/JUCE.git
    GIT_TAG        8.0.4
    GIT_SHALLOW    TRUE)
FetchContent_MakeAvailable(JUCE)

# --- The plugin: analog synth + preset/sample hub ---------------------------
juce_add_plugin(HAOSHub
    COMPANY_NAME              "HAOS"
    BUNDLE_ID                 "com.haos.hub"
    IS_SYNTH                  TRUE
    NEEDS_MIDI_INPUT          TRUE
    NEEDS_MIDI_OUTPUT         FALSE
    IS_MIDI_EFFECT            FALSE
    EDITOR_WANTS_KEYBOARD_FOCUS TRUE
    COPY_PLUGIN_AFTER_BUILD   ${HAOS_COPY_PLUGIN_AFTER_BUILD}
    PLUGIN_MANUFACTURER_CODE  Haos
    PLUGIN_CODE               Hub1
    FORMATS                   VST3 Standalone
    # HAOS Hub is a synth/drum machine — it never records an input, so it needs no
    # microphone entitlement (dropped). Audio OUTPUT opens with defaults, so the
    # standalone makes sound on first launch without any TCC prompt.
    PRODUCT_NAME              "HAOS Hub")

juce_generate_juce_header(HAOSHub)

target_sources(HAOSHub PRIVATE
    Source/PluginProcessor.cpp
    Source/PluginEditor.cpp
    Source/PresetLibrary.cpp
    Source/HaosFmClient.cpp)

# Header-only engine pieces (AnalogVoice, DrumMachine, Sequencer, Effects,
# StepGrid, PluginCatalog, Params) are included directly — no extra .cpp needed.

target_compile_definitions(HAOSHub PUBLIC
    JUCE_WEB_BROWSER=0
    JUCE_USE_CURL=0                 # macOS uses its native URL stack
    JUCE_VST3_CAN_REPLACE_VST2=0
    JUCE_DISPLAY_SPLASH_SCREEN=0
    JUCE_STRICT_REFCOUNTEDPOINTER=1)

target_link_libraries(HAOSHub PRIVATE
    juce::juce_audio_utils
    juce::juce_dsp
    juce::juce_gui_extra
    juce::juce_recommended_config_flags
    juce::juce_recommended_lto_flags)

# --- Headless UI snapshot tool -----------------------------------------------
# Renders each editor page to a PNG so the UI can be reviewed on a machine where
# screen capture is blocked. Console app, not shipped.
juce_add_console_app(HAOSHubSnapshot PRODUCT_NAME "HAOSHubSnapshot")
juce_generate_juce_header(HAOSHubSnapshot)
target_sources(HAOSHubSnapshot PRIVATE
    Source/snapshot_main.cpp
    Source/PluginProcessor.cpp
    Source/PluginEditor.cpp
    Source/PresetLibrary.cpp
    Source/HaosFmClient.cpp)
target_compile_definitions(HAOSHubSnapshot PUBLIC
    JUCE_WEB_BROWSER=0
    JUCE_USE_CURL=0
    JUCE_STANDALONE_APPLICATION=1
    JUCE_MODAL_LOOPS_PERMITTED=1)
target_link_libraries(HAOSHubSnapshot PRIVATE
    juce::juce_audio_utils
    juce::juce_dsp
    juce::juce_gui_extra
    juce::juce_recommended_config_flags)

# --- Offline audio test ------------------------------------------------------
# Renders the engine headlessly and measures peak/RMS so "it makes sound" is a
# measurement, not a claim. Console app, not shipped.
juce_add_console_app(HAOSHubAudioTest PRODUCT_NAME "HAOSHubAudioTest")
juce_generate_juce_header(HAOSHubAudioTest)
target_sources(HAOSHubAudioTest PRIVATE
    Source/audiotest_main.cpp
    Source/PluginProcessor.cpp
    Source/PluginEditor.cpp
    Source/PresetLibrary.cpp
    Source/HaosFmClient.cpp)
target_compile_definitions(HAOSHubAudioTest PUBLIC
    JUCE_WEB_BROWSER=0
    JUCE_USE_CURL=0
    JUCE_STANDALONE_APPLICATION=1
    JUCE_MODAL_LOOPS_PERMITTED=1)
target_link_libraries(HAOSHubAudioTest PRIVATE
    juce::juce_audio_utils
    juce::juce_dsp
    juce::juce_gui_extra
    juce::juce_recommended_config_flags)
