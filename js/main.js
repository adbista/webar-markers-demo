// AR Memory Game - Main Entry Point
import { ARMemoryGame } from './game-core.js';

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Starting AR Memory Game...');
    
    const game = new ARMemoryGame();
    await game.init();
    
    // Make game accessible globally for debugging
    window.arGame = game;
});
