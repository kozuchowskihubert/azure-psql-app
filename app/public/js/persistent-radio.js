// HAOS Persistent Radio Player - Continues playing across navigation
class HAOSPersistentRadio {
    constructor() {
        this.audio = null;
        this.isPlaying = false;
        this.currentStation = 'haos-main';
        this.volume = 0.5;

        // Radio stations
        this.stations = {
            'haos-main': {
                name: 'HAOS.fm Main',
                url: 'https://streams.example.com/haos-main', // Placeholder
                genre: 'Electronic',
            },
            'haos-techno': {
                name: 'HAOS Techno',
                url: 'https://streams.example.com/haos-techno', // Placeholder
                genre: 'Techno',
            },
            'haos-house': {
                name: 'HAOS House',
                url: 'https://streams.example.com/haos-house', // Placeholder
                genre: 'House',
            },
        };

        // Spotify playlist integration (simulated)
        this.spotifyPlaylists = [
            { id: '37i9dQZF1DX4dyzvuaRJ0n', name: 'mint', genre: 'Electronic' },
            { id: '37i9dQZF1DX6J5NfMJS675', name: 'Techno Bunker', genre: 'Techno' },
            { id: '37i9dQZF1DX8FwnYE6PRvL', name: 'Deep House Relax', genre: 'House' },
        ];
    }

    async init() {
        console.log('📻 HAOS Persistent Radio initializing...');

        // Check for existing audio element
        this.audio = document.getElementById('haos-persistent-audio');

        if (!this.audio) {
            // Create audio element
            this.audio = document.createElement('audio');
            this.audio.id = 'haos-persistent-audio';
            this.audio.crossOrigin = 'anonymous';
            this.audio.preload = 'auto';
            document.body.appendChild(this.audio);
        }

        // Load saved state
        this.loadState();

        // Setup event listeners
        this.setupEventListeners();

        return this;
    }

    setupEventListeners() {
        this.audio.addEventListener('play', () => {
            this.isPlaying = true;
            this.saveState();
            this.dispatchEvent('play');
        });

        this.audio.addEventListener('pause', () => {
            this.isPlaying = false;
            this.saveState();
            this.dispatchEvent('pause');
        });

        this.audio.addEventListener('volumechange', () => {
            this.volume = this.audio.volume;
            this.saveState();
        });

        this.audio.addEventListener('error', (e) => {
            console.error('Radio stream error:', e);
            this.dispatchEvent('error', { error: e });
        });
    }

    async play(station = null) {
        if (station) {
            this.currentStation = station;
        }

        const stationData = this.stations[this.currentStation];

        if (!stationData) {
            console.error('Station not found:', this.currentStation);
            return;
        }

        // For demo: Use HAOS library audio instead of stream
        // In production, this would load actual stream URL
        this.audio.src = stationData.url;
        this.audio.volume = this.volume;

        try {
            await this.audio.play();
            console.log(`📻 Now playing: ${stationData.name}`);
        } catch (err) {
            console.error('Playback error:', err);
            // Fallback to generated audio if stream fails
            this.playGeneratedAudio();
        }
    }

    pause() {
        this.audio.pause();
    }

    stop() {
        this.audio.pause();
        this.audio.currentTime = 0;
    }

    setVolume(vol) {
        this.volume = Math.max(0, Math.min(1, vol));
        this.audio.volume = this.volume;
        this.saveState();
    }

    changeStation(station) {
        this.currentStation = station;
        if (this.isPlaying) {
            this.play(station);
        }
    }

    // Generate audio using HAOS engine as fallback
    async playGeneratedAudio() {
        console.log('🎵 Using HAOS Audio Engine for radio playback');

        // This would integrate with HAOSAudioEngine
        if (window.HAOSAudioEngine) {
            const engine = new HAOSAudioEngine();
            await engine.init();

            // Play generative pattern
            setInterval(() => {
                if (this.isPlaying && Math.random() > 0.5) {
                    engine.tb303?.playNote({ frequency: 65.41 + Math.random() * 200 });
                }
                if (this.isPlaying && Math.random() > 0.7) {
                    engine.tr909?.playKick();
                }
            }, 250);
        }
    }

    // Mix with Spotify playlists (simulated)
    async mixWithSpotify(playlistId) {
        console.log('🎧 Mixing with Spotify playlist:', playlistId);
        // In production, this would use Spotify Web API
        // For now, it's a placeholder
        this.dispatchEvent('spotify-mix', { playlistId });
    }

    saveState() {
        localStorage.setItem('haos-radio-state', JSON.stringify({
            isPlaying: this.isPlaying,
            currentStation: this.currentStation,
            volume: this.volume,
        }));
    }

    loadState() {
        const saved = localStorage.getItem('haos-radio-state');
        if (saved) {
            const state = JSON.parse(saved);
            this.currentStation = state.currentStation || 'haos-main';
            this.volume = state.volume || 0.5;
            // Don't auto-play on load (user interaction required)
        }
    }

    dispatchEvent(eventName, detail = {}) {
        window.dispatchEvent(new CustomEvent(`haos:radio-${eventName}`, {
            detail: {
                station: this.currentStation,
                isPlaying: this.isPlaying,
                volume: this.volume,
                ...detail,
            },
        }));
    }

    getStatus() {
        return {
            isPlaying: this.isPlaying,
            currentStation: this.currentStation,
            stationName: this.stations[this.currentStation]?.name,
            volume: this.volume,
        };
    }
}

// Initialize global radio
window.HAOSRadio = new HAOSPersistentRadio();
