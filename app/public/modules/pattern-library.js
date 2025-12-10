/**
 * Pattern Library
 * Pre-built patterns for techno and hip-hop
 */

class PatternLibrary {
    constructor() {
        this.patterns = {
            techno: {
                bass: [
                    {
                        name: 'Rolling Bass',
                        pattern: [
                            { note: 'C2', active: true, accent: true, slide: false },
                            { note: 'C2', active: false },
                            { note: 'D#2', active: true, accent: false, slide: true },
                            { note: 'C2', active: true, accent: false, slide: false },
                            { note: 'C2', active: false },
                            { note: 'G2', active: true, accent: true, slide: false },
                            { note: 'F2', active: true, accent: false, slide: true },
                            { note: 'D#2', active: true, accent: false, slide: false }
                        ]
                    },
                    {
                        name: 'Acid Line',
                        pattern: [
                            { note: 'C2', active: true, accent: true, slide: false },
                            { note: 'D#2', active: true, accent: false, slide: true },
                            { note: 'G2', active: true, accent: true, slide: false },
                            { note: 'C3', active: true, accent: true, slide: true },
                            { note: 'G2', active: true, accent: false, slide: false },
                            { note: 'F2', active: true, accent: false, slide: true },
                            { note: 'D#2', active: true, accent: false, slide: false },
                            { note: 'C2', active: true, accent: true, slide: true }
                        ]
                    }
                ],
                drums: [
                    {
                        name: 'Four on Floor',
                        pattern: {
                            kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
                            snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
                            hat: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0]
                        }
                    },
                    {
                        name: 'Offbeat',
                        pattern: {
                            kick: [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0],
                            snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
                            hat: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
                        }
                    }
                ]
            },
            hiphop: {
                drums: [
                    {
                        name: 'Boom Bap',
                        pattern: {
                            kick: [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0],
                            snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
                            hat: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0]
                        }
                    },
                    {
                        name: 'Trap',
                        pattern: {
                            kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0],
                            snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
                            hat: [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1]
                        }
                    }
                ]
            }
        };
    }
    
    getPattern(genre, type, name) {
        if (!this.patterns[genre] || !this.patterns[genre][type]) {
            return null;
        }
        
        const patterns = this.patterns[genre][type];
        return patterns.find(p => p.name === name) || patterns[0];
    }
    
    getAllPatterns(genre) {
        return this.patterns[genre] || {};
    }
}

// Make available globally
window.PatternLibrary = PatternLibrary;
