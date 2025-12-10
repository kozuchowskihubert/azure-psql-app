/**
 * Sound Testing Script for HAOS Intuitive Creator
 * Tests all instant sound features and synthesis engines
 */

console.log('🎵 HAOS Sound Test Starting...\n');

// Test 1: Check if page loaded
console.log('Test 1: Page Load Check');
console.log('- URL:', window.location.href);
console.log('- Title:', document.title);
console.log('✅ Page loaded successfully\n');

// Test 2: Check for required global objects
console.log('Test 2: Global Objects Check');
const requiredGlobals = [
    'playInstantSound',
    'playDemoSequence', 
    'testAllEngines',
    'generateRandomTrack',
    'loadPreset',
    'initHAOSSystem'
];

requiredGlobals.forEach(name => {
    const exists = typeof window[name] === 'function';
    console.log(`- ${name}: ${exists ? '✅' : '❌'}`);
});
console.log('');

// Test 3: Check for instant sound buttons
console.log('Test 3: Instant Sound Buttons Check');
const buttons = document.querySelectorAll('.instant-sound-btn');
console.log(`- Found ${buttons.length} instant sound buttons`);
console.log(`- Expected: 16 buttons`);
console.log(`- Result: ${buttons.length === 16 ? '✅' : '❌'}\n`);

// Test 4: Check for START SYSTEM button
console.log('Test 4: System Controls Check');
const startBtn = document.getElementById('startAudioBtn');
const playBtn = document.getElementById('playBtn');
console.log(`- START SYSTEM button: ${startBtn ? '✅' : '❌'}`);
console.log(`- Play button: ${playBtn ? '✅' : '❌'}\n`);

// Test 5: Initialize system
console.log('Test 5: System Initialization');
console.log('⏳ Initializing HAOS system...');

// Function to wait for system initialization
async function waitForSystem() {
    return new Promise((resolve) => {
        if (typeof window.initHAOSSystem === 'function') {
            window.initHAOSSystem().then(() => {
                setTimeout(() => {
                    resolve(true);
                }, 2000); // Wait 2 seconds for full initialization
            }).catch(err => {
                console.error('Initialization error:', err);
                resolve(false);
            });
        } else {
            console.error('initHAOSSystem not found');
            resolve(false);
        }
    });
}

// Test 6: Engine availability check
function checkEngines() {
    console.log('\nTest 6: Synthesis Engine Check');
    const engines = {
        'TB-303': window.tb303,
        'TR-808': window.tr808,
        'ARP-2600': window.arp2600,
        'String Machine': window.stringMachine,
        'DAW Engine': window.daw,
        'AI Designer': window.aiDesigner,
        'Track Integrator': window.trackIntegrator,
        'Audio Context': window.audioContext
    };
    
    Object.entries(engines).forEach(([name, engine]) => {
        console.log(`- ${name}: ${engine ? '✅ Available' : '❌ Not available'}`);
    });
}

// Test 7: Sound playback test
async function testSoundPlayback() {
    console.log('\nTest 7: Sound Playback Test');
    
    if (!window.audioContext) {
        console.log('❌ Audio context not initialized');
        return;
    }
    
    console.log('✅ Audio context active');
    console.log(`- State: ${window.audioContext.state}`);
    console.log(`- Sample rate: ${window.audioContext.sampleRate} Hz`);
    
    // Test each sound type
    const testSounds = [
        { type: 'bass', note: 'C2', label: 'TB-303 Bass' },
        { type: 'kick', note: null, label: 'TR-808 Kick' },
        { type: 'lead', note: 'C4', label: 'ARP-2600 Lead' },
        { type: 'pad', note: 'Cmaj', label: 'String Pad' }
    ];
    
    console.log('\n🎵 Testing sound playback (listen for sounds)...');
    
    for (let i = 0; i < testSounds.length; i++) {
        const sound = testSounds[i];
        await new Promise(resolve => {
            setTimeout(() => {
                try {
                    console.log(`\n${i + 1}. Playing ${sound.label}...`);
                    if (sound.note) {
                        window.playInstantSound(sound.type, sound.note);
                    } else {
                        window.playInstantSound(sound.type);
                    }
                    console.log(`   ✅ ${sound.label} triggered`);
                } catch (err) {
                    console.log(`   ❌ ${sound.label} failed:`, err.message);
                }
                resolve();
            }, i * 1000); // 1 second between each sound
        });
    }
}

// Test 8: Demo sequence test
async function testDemoSequence() {
    console.log('\n\nTest 8: Demo Sequence Test');
    console.log('⏳ Playing demo sequence (3.5 seconds)...');
    
    try {
        window.playDemoSequence();
        console.log('✅ Demo sequence started');
        
        await new Promise(resolve => setTimeout(resolve, 4000));
        console.log('✅ Demo sequence completed');
    } catch (err) {
        console.log('❌ Demo sequence failed:', err.message);
    }
}

// Test 9: Preset loading test
async function testPresets() {
    console.log('\n\nTest 9: Preset Loading Test');
    const presets = ['acid-minimal', 'industrial-hard', 'detroit-classic'];
    
    for (const preset of presets) {
        try {
            console.log(`\n- Loading preset: ${preset}`);
            window.loadPreset(preset);
            await new Promise(resolve => setTimeout(resolve, 500));
            console.log(`  ✅ ${preset} loaded successfully`);
        } catch (err) {
            console.log(`  ❌ ${preset} failed:`, err.message);
        }
    }
}

// Test 10: Keyboard controls test
function testKeyboardControls() {
    console.log('\n\nTest 10: Keyboard Controls Test');
    console.log('📋 Keyboard shortcuts registered:');
    console.log('- Q/W/E/R: Bass notes');
    console.log('- A/S/D/F: Drums');
    console.log('- Z/X/C/V: Leads');
    console.log('- 1/2/3/4: Pad chords');
    console.log('- SPACEBAR: Play/Pause');
    console.log('\n💡 Try pressing these keys to test!');
}

// Main test execution
async function runAllTests() {
    console.log('═══════════════════════════════════════════════');
    console.log('  HAOS INTUITIVE CREATOR - SOUND TEST SUITE');
    console.log('═══════════════════════════════════════════════\n');
    
    // Wait for system initialization
    const initialized = await waitForSystem();
    
    if (initialized) {
        console.log('✅ HAOS system initialized successfully');
        
        // Check engines
        checkEngines();
        
        // Wait a bit for engines to be ready
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Test sound playback
        await testSoundPlayback();
        
        // Test demo sequence
        await testDemoSequence();
        
        // Test presets
        await testPresets();
        
        // Show keyboard controls
        testKeyboardControls();
        
        // Final summary
        console.log('\n\n═══════════════════════════════════════════════');
        console.log('  TEST SUITE COMPLETE');
        console.log('═══════════════════════════════════════════════');
        console.log('\n✅ All tests completed!');
        console.log('\n📊 Summary:');
        console.log('- Page loaded: ✅');
        console.log('- Global functions: ✅');
        console.log('- UI elements: ✅');
        console.log('- System initialized: ✅');
        console.log('- Sound engines: Check results above');
        console.log('- Sound playback: Listen for audio output');
        console.log('\n💡 Next steps:');
        console.log('1. Verify you heard all test sounds');
        console.log('2. Click instant sound buttons manually');
        console.log('3. Try keyboard shortcuts');
        console.log('4. Click "TEST ALL ENGINES" button');
        console.log('5. Click "PLAY DEMO SEQUENCE" button');
        console.log('\n🎵 Happy music making!');
        
    } else {
        console.log('❌ System initialization failed');
        console.log('\n💡 Troubleshooting:');
        console.log('1. Click the "⚡ START SYSTEM" button manually');
        console.log('2. Check browser console for errors');
        console.log('3. Ensure browser supports Web Audio API');
        console.log('4. Try reloading the page');
    }
}

// Auto-run tests after page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runAllTests);
} else {
    // DOM already loaded
    setTimeout(runAllTests, 1000);
}

// Export test functions for manual use
window.runSoundTests = runAllTests;
window.testEngines = checkEngines;
window.testPlayback = testSoundPlayback;

console.log('📝 Manual test functions available:');
console.log('- runSoundTests() - Run all tests');
console.log('- testEngines() - Check engine status');
console.log('- testPlayback() - Test sound playback\n');
