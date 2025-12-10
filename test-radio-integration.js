/**
 * HAOS Radio Integration Test
 * Tests all radio functionality in the studio
 */

const test = {
    passed: 0,
    failed: 0,
    total: 0
};

function assert(condition, message) {
    test.total++;
    if (condition) {
        test.passed++;
        console.log(`✅ PASS: ${message}`);
    } else {
        test.failed++;
        console.error(`❌ FAIL: ${message}`);
    }
}

function assertEquals(actual, expected, message) {
    test.total++;
    if (actual === expected) {
        test.passed++;
        console.log(`✅ PASS: ${message} (${actual})`);
    } else {
        test.failed++;
        console.error(`❌ FAIL: ${message} - Expected: ${expected}, Got: ${actual}`);
    }
}

console.log('\n🎵 ========================================');
console.log('   HAOS RADIO INTEGRATION TEST');
console.log('========================================\n');

// Test 1: Radio object exists
console.log('📋 Test 1: Radio Object Initialization');
assert(typeof StudioRadio !== 'undefined', 'StudioRadio object exists');
assert(typeof StudioRadio.state !== 'undefined', 'StudioRadio.state exists');
assert(typeof StudioRadio.loadPlaylist === 'function', 'loadPlaylist is a function');
assert(typeof StudioRadio.play === 'function', 'play is a function');
assert(typeof StudioRadio.pause === 'function', 'pause is a function');
assert(typeof StudioRadio.shuffle === 'function', 'shuffle is a function');
assert(typeof StudioRadio.clearQueue === 'function', 'clearQueue is a function');
console.log('');

// Test 2: Playlists exist
console.log('📋 Test 2: Playlist Data');
const playlists = StudioRadio.state.playlists;
assert(playlists !== null && typeof playlists === 'object', 'Playlists object exists');
assertEquals(Object.keys(playlists).length, 4, 'Has 4 playlists');

const playlistNames = Object.keys(playlists);
assert(playlistNames.includes('technobot-detroit'), 'Has Technobot Detroit playlist');
assert(playlistNames.includes('industrial-techno'), 'Has Industrial Techno playlist');
assert(playlistNames.includes('acid-classics'), 'Has Acid Classics playlist');
assert(playlistNames.includes('deep-techno'), 'Has Deep Techno playlist');
console.log('');

// Test 3: Playlist content
console.log('📋 Test 3: Playlist Content Validation');
const technobotPlaylist = playlists['technobot-detroit'];
assert(Array.isArray(technobotPlaylist), 'Technobot Detroit is an array');
assert(technobotPlaylist.length > 0, 'Technobot Detroit has tracks');
assert(technobotPlaylist[0].title !== undefined, 'Tracks have titles');
assert(technobotPlaylist[0].artist !== undefined, 'Tracks have artists');
assert(technobotPlaylist[0].duration !== undefined, 'Tracks have durations');

const acidPlaylist = playlists['acid-classics'];
assert(Array.isArray(acidPlaylist), 'Acid Classics is an array');
assert(acidPlaylist.length >= 3, 'Acid Classics has at least 3 tracks');
console.log('');

// Test 4: Load playlist functionality
console.log('📋 Test 4: Load Playlist Functionality');
const initialQueueLength = StudioRadio.state.queue.length;
StudioRadio.loadPlaylist('technobot-detroit');
assert(StudioRadio.state.queue.length > 0, 'Queue populated after loading playlist');
assertEquals(
    StudioRadio.state.queue.length, 
    technobotPlaylist.length, 
    'Queue has correct number of tracks'
);
console.log('');

// Test 5: Queue management
console.log('📋 Test 5: Queue Management');
const queueLengthBefore = StudioRadio.state.queue.length;
StudioRadio.queuePlaylist('acid-classics');
const expectedLength = queueLengthBefore + acidPlaylist.length;
assertEquals(
    StudioRadio.state.queue.length,
    expectedLength,
    'Queue length increased correctly'
);
console.log('');

// Test 6: Shuffle functionality
console.log('📋 Test 6: Shuffle Functionality');
const beforeShuffle = [...StudioRadio.state.queue];
StudioRadio.shuffle();
const afterShuffle = StudioRadio.state.queue;
assertEquals(beforeShuffle.length, afterShuffle.length, 'Queue length unchanged after shuffle');
// Note: We can't test if order changed because it might randomly be the same
console.log('');

// Test 7: Clear queue
console.log('📋 Test 7: Clear Queue');
StudioRadio.clearQueue();
assertEquals(StudioRadio.state.queue.length, 0, 'Queue cleared successfully');
assertEquals(StudioRadio.state.isPlaying, false, 'Playback stopped after clear');
assertEquals(StudioRadio.state.currentTrack, null, 'Current track reset');
console.log('');

// Test 8: Play/Pause functionality
console.log('📋 Test 8: Play/Pause Functionality');
StudioRadio.loadPlaylist('deep-techno');
assertEquals(StudioRadio.state.isPlaying, false, 'Initially not playing');
StudioRadio.play();
assertEquals(StudioRadio.state.isPlaying, true, 'Playing after play() call');
assert(StudioRadio.state.currentTrack !== null, 'Current track is set');
StudioRadio.pause();
assertEquals(StudioRadio.state.isPlaying, false, 'Paused after pause() call');
console.log('');

// Test 9: Volume control
console.log('📋 Test 9: Volume Control');
const initialVolume = StudioRadio.state.volume;
StudioRadio.setVolume(50);
assertEquals(StudioRadio.state.volume, 50, 'Volume set to 50');
StudioRadio.setVolume(100);
assertEquals(StudioRadio.state.volume, 100, 'Volume set to 100');
console.log('');

// Test 10: Quality control
console.log('📋 Test 10: Quality Control');
StudioRadio.setQuality('high');
assertEquals(StudioRadio.state.quality, 'high', 'Quality set to high');
StudioRadio.setQuality('low');
assertEquals(StudioRadio.state.quality, 'low', 'Quality set to low');
StudioRadio.setQuality('medium');
assertEquals(StudioRadio.state.quality, 'medium', 'Quality set to medium');
console.log('');

// Test 11: Next/Previous track
console.log('📋 Test 11: Track Navigation');
StudioRadio.clearQueue();
StudioRadio.loadPlaylist('industrial-techno');
const firstTrackCount = StudioRadio.state.queue.length;
StudioRadio.next();
const afterNext = StudioRadio.state.queue.length;
assertEquals(afterNext, firstTrackCount - 1, 'Next() removed first track from queue');
console.log('');

// Test 12: Remove track
console.log('📋 Test 12: Remove Track');
const queueBeforeRemove = StudioRadio.state.queue.length;
if (queueBeforeRemove > 1) {
    StudioRadio.removeTrack(1);
    assertEquals(
        StudioRadio.state.queue.length,
        queueBeforeRemove - 1,
        'Track removed successfully'
    );
}
console.log('');

// Test 13: YouTube URL integration
console.log('📋 Test 13: YouTube Integration');
// Create mock input element
const mockInput = document.createElement('input');
mockInput.id = 'studio-youtube-url';
mockInput.value = 'https://youtube.com/watch?v=test123';
document.body.appendChild(mockInput);

const queueBeforeYT = StudioRadio.state.queue.length;
StudioRadio.loadYouTubePlaylist();
assertEquals(
    StudioRadio.state.queue.length,
    queueBeforeYT + 1,
    'YouTube track added to queue'
);
assert(
    StudioRadio.state.queue[StudioRadio.state.queue.length - 1].url !== undefined,
    'YouTube track has URL property'
);
document.body.removeChild(mockInput);
console.log('');

// Final Results
console.log('\n🎵 ========================================');
console.log('   TEST RESULTS');
console.log('========================================');
console.log(`✅ Passed: ${test.passed}/${test.total}`);
console.log(`❌ Failed: ${test.failed}/${test.total}`);
console.log(`📊 Success Rate: ${((test.passed/test.total)*100).toFixed(1)}%`);
console.log('========================================\n');

if (test.failed === 0) {
    console.log('🎉 ALL TESTS PASSED! Radio integration is working perfectly!');
} else {
    console.log('⚠️  Some tests failed. Review the output above.');
}
