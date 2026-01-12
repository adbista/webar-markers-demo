// AR Memory Game - Configuration
export const CONFIG = {
    // Game settings
    INITIAL_LEVEL: 1,
    INITIAL_SCORE: 0,
    
    // Colors
    COLORS: ['red', 'green', 'blue'],
    
    // Color mapping with sphere references
    COLOR_MAP: {
        red: { 
            original: '#FF0000', 
            bright: '#FFFFFF',
            element: null,
            button: null,
            light: null
        },
        green: { 
            original: '#00FF00', 
            bright: '#FFFFFF',
            element: null,
            button: null,
            light: null
        },
        blue: { 
            original: '#0000FF', 
            bright: '#FFFFFF',
            element: null,
            button: null,
            light: null
        }
    },
    
    // Audio frequencies
    SOUND_FREQUENCIES: {
        red: 261.63,    // C
        green: 329.63,  // E
        blue: 392.00    // G
    },
    
    // Victory melody
    VICTORY_MELODY: [261.63, 329.63, 392.00, 523.25, 659.25, 783.99],
    
    // Timing
    TIMING: {
        SEQUENCE_DELAY: 1000,
        FLASH_DURATION: 600,
        SEQUENCE_PAUSE: 600,
        CELEBRATION_DURATION: 2000,
        START_INDICATOR_DURATION: 2500
    },
    
    // Gesture challenge settings
    GESTURE_CHALLENGE: {
        ENABLED: true,
        TRIGGER_CHANCE: 0.3,
        TIME_LIMIT: 4,
        CHECK_INTERVAL: 8000,
        BONUS_POINTS_MIN: 20,
        BONUS_POINTS_MAX: 35
    },
    
    // Gesture types
    GESTURE_TYPES: {
        'thumbs_up': { emoji: '👍', name: 'Kciuk do góry', sound: 'high' },
        'peace': { emoji: '✌️', name: 'Znak pokoju', sound: 'low' }
    },
    
    // Particle settings
    PARTICLES: {
        NORMAL_COUNT: 50,
        BURST_COUNT: 150,
        NORMAL_SIZE: '0.1,0.15',
        BURST_SIZE: 0.15,
        BURST_DURATION: 600
    }
};
