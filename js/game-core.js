// AR Memory Game - Core Game Logic
import { CONFIG } from './config.js';
import { AudioManager } from './audio.js';
import { AnimationManager } from './animations.js';
import { ParticleManager } from './particles.js';
import { UIManager } from './ui.js';
import { GestureManager } from './gestures.js';

export class ARMemoryGame {
    constructor() {
        // Game state
        this.sequence = [];
        this.playerSuccessIndex = 0;
        this.level = CONFIG.INITIAL_LEVEL;
        this.score = CONFIG.INITIAL_SCORE;
        this.isShowingSequence = false;
        this.canPlay = false;
        this.gameStarted = false;
        this.combo = 0;
        this.inputLock = false;
        this.repeatSequenceUsed = false;
        
        // Gesture challenge state
        this.currentChallenge = null;
        this.challengeTimer = null;
        this.challengeInterval = null;
        
        // Marker tracking
        this.visibleMarkers = {
            'marker1': false,
            'marker2': false,
            'marker3': false
        };
        
        // Managers
        this.audio = new AudioManager();
        this.animations = new AnimationManager(this.audio);
        this.particles = new ParticleManager();
        this.ui = new UIManager();
        this.gestures = new GestureManager(
            this.audio, 
            this.repeatSequence.bind(this),
            this.onChallengeGestureDetected.bind(this)
        );
    }
    
    // Initialize game
    async init() {
        console.log('🎮 Initializing AR Memory Game...');
        
        // Initialize audio
        this.audio.init();
        
        // Initialize UI
        this.ui.init();
        
        // Initialize gesture detection
        await this.gestures.init();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Wait for A-Frame scene
        const scene = document.querySelector('a-scene');
        scene.addEventListener('loaded', () => this.onSceneLoaded());
    }
    
    onSceneLoaded() {
        console.log('📦 A-Frame scene loaded');
        
        // Hide AR.js loader
        const loader = document.querySelector('.arjs-loader');
        if (loader) {
            console.log('🔧 Hiding loader...');
            loader.style.display = 'none';
            loader.remove(); // Completely remove from DOM
        }
        
        // Check for any other overlays that might be blocking
        setTimeout(() => {
            const allDivs = document.querySelectorAll('div');
            allDivs.forEach(div => {
                const style = window.getComputedStyle(div);
                if (style.position === 'fixed' || style.position === 'absolute') {
                    const zIndex = parseInt(style.zIndex);
                    if (zIndex > 100 && div.className !== 'arjs-loader') {
                        console.log('🔍 Found overlay:', div.className || div.id, 'z-index:', zIndex);
                    }
                }
            });
        }, 1000);
        
        // Get model references
        CONFIG.COLOR_MAP.red.element = document.getElementById('sphere1');
        CONFIG.COLOR_MAP.green.element = document.getElementById('sphere2');
        CONFIG.COLOR_MAP.blue.element = document.getElementById('sphere3');
        
        // Get light references
        CONFIG.COLOR_MAP.red.light = document.getElementById('light1');
        CONFIG.COLOR_MAP.green.light = document.getElementById('light2');
        CONFIG.COLOR_MAP.blue.light = document.getElementById('light3');
        
        // Get button references
        CONFIG.COLOR_MAP.red.button = this.ui.elements.btnRed;
        CONFIG.COLOR_MAP.green.button = this.ui.elements.btnGreen;
        CONFIG.COLOR_MAP.blue.button = this.ui.elements.btnBlue;
        
        // Setup AR click handlers
        this.setupARClickHandlers();
        
        // Setup marker detection
        this.setupMarkerDetection();
        
        // Hide instructions after delay
        this.ui.hideInstructions();
        
        // Show waiting message
        this.ui.setStatus('📷 Wyceluj kamerą we wszystkie 3 markery...', 'rgba(255, 165, 0, 0.8)');
        
        // Start gesture detection
        setTimeout(() => {
            const video = document.querySelector('video');
            if (video) {
                video.setAttribute('playsinline', '');
                video.setAttribute('webkit-playsinline', '');
                video.muted = true;
                this.gestures.startDetection(video);
                this.ui.setGestureStatus('✋ Gesty: Aktywne');
            }
        }, 2000);
    }
    
    setupEventListeners() {
        // Button click handlers
        Object.keys(CONFIG.COLOR_MAP).forEach(color => {
            const button = this.ui.elements[`btn${color.charAt(0).toUpperCase() + color.slice(1)}`];
            if (button) {
                button.addEventListener('click', () => this.handleButtonClick(color));
            }
        });
        
        // Restart button
        if (this.ui.elements.restartBtn) {
            this.ui.elements.restartBtn.addEventListener('click', () => location.reload());
        }
    }
    
    setupARClickHandlers() {
        const clickable1 = document.getElementById('clickable1');
        const clickable2 = document.getElementById('clickable2');
        const clickable3 = document.getElementById('clickable3');
        
        [
            { el: clickable1, color: 'red' },
            { el: clickable2, color: 'green' },
            { el: clickable3, color: 'blue' }
        ].forEach(item => {
            if (item.el) {
                const clickHandler = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const marker = item.el.parentElement;
                    if (marker && marker.object3D.visible && this.gameStarted) {
                        this.handleButtonClick(item.color);
                    }
                };
                
                item.el.addEventListener('click', clickHandler);
                item.el.addEventListener('touchstart', clickHandler);
            }
        });
    }
    
    setupMarkerDetection() {
        const markers = ['marker1', 'marker2', 'marker3'];
        
        markers.forEach(markerId => {
            const marker = document.getElementById(markerId);
            if (marker) {
                marker.addEventListener('markerFound', () => {
                    this.visibleMarkers[markerId] = true;
                    console.log(`✅ Marker ${markerId} found`);
                    this.checkAllMarkersVisible();
                });
                
                marker.addEventListener('markerLost', () => {
                    this.visibleMarkers[markerId] = false;
                    console.log(`❌ Marker ${markerId} lost`);
                });
            }
        });
    }
    
    checkAllMarkersVisible() {
        const allVisible = Object.values(this.visibleMarkers).every(visible => visible === true);
        
        if (allVisible && !this.gameStarted) {
            console.log('🎮 All markers visible! Starting game...');
            this.gameStarted = true;
            
            this.ui.setStatus('🟢 START! Gra się rozpoczyna...', 'rgba(0, 255, 0, 0.9)');
            this.animations.animateStart();
            
            setTimeout(() => this.startNewRound(), CONFIG.TIMING.START_INDICATOR_DURATION);
        }
    }
    
    startNewRound() {
        this.playerSuccessIndex = 0;
        this.canPlay = false;
        this.ui.disableButtons(true);
        this.repeatSequenceUsed = false;
        
        // Add random color to sequence
        const randomColor = CONFIG.COLORS[Math.floor(Math.random() * CONFIG.COLORS.length)];
        this.sequence.push(randomColor);
        
        // Update UI
        this.ui.updateLevel(this.level);
        this.ui.setStatus('👀 Obserwuj sekwencję...', 'rgba(255, 165, 0, 0.8)');
        
        setTimeout(() => this.showSequence(), CONFIG.TIMING.SEQUENCE_DELAY);
    }
    
    async showSequence() {
        this.isShowingSequence = true;
        this.ui.disableButtons(true);
        
        for (let i = 0; i < this.sequence.length; i++) {
            await this.wait(CONFIG.TIMING.SEQUENCE_PAUSE);
            await this.animations.flashModel(this.sequence[i], true);
        }
        
        this.isShowingSequence = false;
        this.canPlay = true;
        this.ui.disableButtons(false);
        this.ui.setStatus('🎮 Twoja kolej - klikaj przyciski lub markery!', 'rgba(0, 128, 255, 0.8)');
    }
    
    handleButtonClick(color) {
        if (!this.gameStarted || this.inputLock || !this.canPlay || this.isShowingSequence) {
            return;
        }
        
        this.inputLock = true;
        this.canPlay = false;
        this.ui.disableButtons(true);
        
        // Visual & audio feedback
        this.ui.flashButton(color);
        this.animations.flashModelClick(color);
        this.audio.playColorSound(color);
        this.particles.triggerBurst(color);
        
        // Check if correct
        const expectedColor = this.sequence[this.playerSuccessIndex];
        
        if (color !== expectedColor) {
            this.inputLock = false;
            this.combo = 0;
            this.ui.updateCombo(this.combo);
            this.gameOver();
            return;
        }
        
        // Correct!
        this.playerSuccessIndex++;
        this.combo++;
        this.ui.updateCombo(this.combo);
        
        // Check if sequence complete
        if (this.playerSuccessIndex === this.sequence.length) {
            console.log('🎉 Sequence complete!');
            this.inputLock = false;
            
            const bonusPoints = this.combo > 5 ? this.level * 15 : this.level * 10;
            this.score += bonusPoints;
            this.ui.updateScore(this.score);
            this.ui.setStatus('✅ Dobrze! Następny poziom...', 'rgba(0, 255, 0, 0.8)');
            
            this.animations.celebrateVictory();
            
            setTimeout(() => {
                this.level++;
                this.startNewRound();
            }, 2000);
            
            // Uruchom system wyzwań po pierwszym ukończonym poziomie
            if (this.level === 1 && !this.challengeInterval) {
                setTimeout(() => this.startGestureChallengeSystem(), 5000);
            }
        } else {
            // Re-enable for next input
            setTimeout(() => {
                if (this.gameStarted && !this.isShowingSequence) {
                    this.canPlay = true;
                    this.ui.disableButtons(false);
                }
                this.inputLock = false;
            }, 300);
        }
    }
    
    repeatSequence() {
        if (!this.canPlay || this.isShowingSequence || this.sequence.length === 0) {
            return;
        }
        
        if (this.repeatSequenceUsed) {
            this.ui.setStatus('❌ Powtórzenie już użyte!', 'rgba(255, 0, 0, 0.8)');
            setTimeout(() => {
                this.ui.setStatus('👆 Twoja kolej!', 'rgba(0, 200, 0, 0.8)');
            }, 1500);
            return;
        }
        
        this.repeatSequenceUsed = true;
        const pointsDeducted = 10;
        this.score = Math.max(0, this.score - pointsDeducted);
        this.ui.updateScore(this.score);
        
        this.canPlay = false;
        this.ui.setStatus('🔄 Powtarzam sekwencję... (-10 pkt)', 'rgba(138, 43, 226, 0.8)');
        
        setTimeout(() => this.showSequence(), 500);
    }
    
    gameOver() {
        this.canPlay = false;
        this.isShowingSequence = false;
        this.ui.disableButtons(true);
        this.combo = 0;
        this.ui.updateCombo(this.combo);
        this.ui.setStatus('❌ Źle! Koniec gry', 'rgba(255, 0, 0, 0.8)');
        
        this.audio.playErrorSound();
        
        setTimeout(() => {
            this.ui.showGameOver(this.level, this.score);
        }, 1500);
    }
    
    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // Play challenge sound
    playChallengeSound(soundType) {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            if (soundType === 'high') {
                oscillator.frequency.value = 880; // A5
                oscillator.type = 'sine';
            } else {
                oscillator.frequency.value = 220; // A3
                oscillator.type = 'triangle';
            }
            
            gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.8);
        } catch (e) {
            console.log('Audio error:', e);
        }
    }
    
    // Play success sound for correct gesture
    playSuccessSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            [523.25, 659.25, 783.99].forEach((freq, i) => {
                setTimeout(() => {
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(audioContext.destination);
                    
                    oscillator.frequency.value = freq;
                    oscillator.type = 'sine';
                    
                    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                    
                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + 0.2);
                }, i * 100);
            });
        } catch (e) {
            console.log('Audio error:', e);
        }
    }
    
    // Play fail sound
    playFailSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 150;
            oscillator.type = 'sawtooth';
            
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.4);
        } catch (e) {
            console.log('Audio error:', e);
        }
    }
    
    // Gesture Challenge System
    startGestureChallengeSystem() {
        if (!CONFIG.GESTURE_CHALLENGE.ENABLED) return;
        
        this.challengeInterval = setInterval(() => {
            // Losowanie czy pokazać wyzwanie - TYLKO gdy ruch po naszej stronie
            if (this.canPlay && !this.isShowingSequence && !this.currentChallenge && !this.inputLock) {
                const shouldTrigger = Math.random() < CONFIG.GESTURE_CHALLENGE.TRIGGER_CHANCE;
                if (shouldTrigger) {
                    this.triggerGestureChallenge();
                }
            }
        }, CONFIG.GESTURE_CHALLENGE.CHECK_INTERVAL);
    }
    
    triggerGestureChallenge() {
        // Losuj typ gestu
        const gestureTypes = Object.keys(CONFIG.GESTURE_TYPES);
        const randomGesture = gestureTypes[Math.floor(Math.random() * gestureTypes.length)];
        const gestureInfo = CONFIG.GESTURE_TYPES[randomGesture];
        
        this.currentChallenge = {
            type: randomGesture,
            emoji: gestureInfo.emoji,
            sound: gestureInfo.sound,
            timeLeft: CONFIG.GESTURE_CHALLENGE.TIME_LIMIT,
            startTime: Date.now()
        };
        
        // Pauza gry
        this.canPlay = false;
        this.ui.disableButtons(true);
        
        console.log(`🎯 Gesture Challenge: ${gestureInfo.name}`);
        this.ui.showGestureChallenge(gestureInfo.emoji, this.currentChallenge.timeLeft);
        
        // Play challenge sound
        this.playChallengeSound(this.currentChallenge.sound);
        
        // Timer countdown
        this.challengeTimer = setInterval(() => {
            this.currentChallenge.timeLeft--;
            this.ui.updateChallengeTimer(this.currentChallenge.timeLeft);
            
            if (this.currentChallenge.timeLeft <= 0) {
                this.failGestureChallenge();
            }
        }, 1000);
    }
    
    onChallengeGestureDetected(gestureType) {
        if (!this.currentChallenge) return;
        
        if (gestureType === this.currentChallenge.type) {
            this.completeGestureChallenge();
        }
    }
    
    completeGestureChallenge() {
        if (!this.currentChallenge) return;
        
        clearInterval(this.challengeTimer);
        
        // Hide challenge UI
        this.ui.hideGestureChallenge();
        
        // Show success animation
        this.ui.showGestureSuccess();
        
        // Play success sound
        this.playSuccessSound();
        
        // Show success message
        this.ui.setStatus('✅ Świetnie! Uniknąłeś przegrańej!', 'rgba(0, 255, 0, 0.9)');
        
        // Hide success animation and resume game
        setTimeout(() => {
            this.ui.hideGestureSuccess();
            this.currentChallenge = null;
            
            // Resume game
            if (this.gameStarted && !this.isShowingSequence) {
                this.canPlay = true;
                this.ui.disableButtons(false);
                this.ui.setStatus('🎮 Twoja kolej - klikaj przyciski lub markery!', 'rgba(0, 128, 255, 0.8)');
            }
        }, 2000);
    }
    
    failGestureChallenge() {
        if (!this.currentChallenge) return;
        
        clearInterval(this.challengeTimer);
        
        // Hide challenge UI
        this.ui.hideGestureChallenge();
        
        // Show fail animation
        this.ui.showGestureFail();
        
        // Play fail sound
        this.playFailSound();
        
        // Show fail message
        this.ui.setStatus('❌ Nie zdążyłeś z gestem!', 'rgba(255, 0, 0, 0.8)');
        
        // Game over after showing fail animation
        setTimeout(() => {
            this.ui.hideGestureFail();
            this.currentChallenge = null;
            this.gameOver();
        }, 1500);
    }
}
