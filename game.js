// AR Memory Game - Enhanced with Gesture Sound Challenges
let sequence = [];
let playerSequence = [];
let level = 1;
let score = 0;
let isShowingSequence = false;
let canPlay = false;
let gameStarted = false;
let combo = 0;

// Hand gesture detection
let gestureEnabled = false;
let hands = null;
let camera = null;
let gestureStatusEl = null;
let comboEl = null;
let lastGesture = null;
let gestureTimeout = null;

// Gesture Sound Challenge System
let gestureChallengeActive = false;
let currentChallenge = null;
let challengeTimer = null;
let challengeTimeLeft = 10;
let gestureChallengeEl = null;
let gesturePromptEl = null;
let challengeTimerEl = null;

const gestureTypes = {
    'thumbs_up': { emoji: '👍', name: 'Kciuk do góry', sound: 'high' },
    'peace': { emoji: '✌️', name: 'Znak pokoju', sound: 'low' }
};

// Tracking visible markers
let visibleMarkers = {
    'marker1': false,
    'marker2': false,
    'marker3': false
};

const colors = ['red', 'green', 'blue'];
const colorMap = {
    'red': { element: null, original: '#FF0000', bright: '#FF6666', button: null, light: null },
    'green': { element: null, original: '#00FF00', bright: '#66FF66', button: null, light: null },
    'blue': { element: null, original: '#0000FF', bright: '#6666FF', button: null, light: null }
};

// DOM elements
let levelEl, scoreEl, statusEl, gameOverEl, finalScoreEl, finalPointsEl, restartBtn, instructionsEl;
let gestureSuccessEl, gestureFailEl;

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    levelEl = document.getElementById('level');
    scoreEl = document.getElementById('score');
    statusEl = document.getElementById('status');
    gameOverEl = document.getElementById('gameOver');
    finalScoreEl = document.getElementById('finalScore');
    finalPointsEl = document.getElementById('finalPoints');
    restartBtn = document.getElementById('restartBtn');
    instructionsEl = document.getElementById('instructions');
    gestureStatusEl = document.getElementById('gesture-status');
    comboEl = document.getElementById('combo');
    gestureChallengeEl = document.getElementById('gesture-challenge');
    gesturePromptEl = document.getElementById('gesture-prompt');
    challengeTimerEl = document.getElementById('challenge-timer');
    gestureSuccessEl = document.getElementById('gesture-success');
    gestureFailEl = document.getElementById('gesture-fail');

    // Get button elements
    colorMap.red.button = document.getElementById('btnRed');
    colorMap.green.button = document.getElementById('btnGreen');
    colorMap.blue.button = document.getElementById('btnBlue');

    // Add click handlers to buttons
    setupButtonHandlers();
    
    // Initialize hand gesture detection
    initHandGestureDetection();

    // Wait for A-Frame scene to load
    const scene = document.querySelector('a-scene');
    scene.addEventListener('loaded', () => {
        // Get sphere elements
        colorMap.red.element = document.getElementById('sphere1');
        colorMap.green.element = document.getElementById('sphere2');
        colorMap.blue.element = document.getElementById('sphere3');
        
        // Get light elements
        colorMap.red.light = document.getElementById('light1');
        colorMap.green.light = document.getElementById('light2');
        colorMap.blue.light = document.getElementById('light3');

        // Setup click handlers on AR objects
        setupARClickHandlers();

        // Setup marker detection
        setupMarkerDetection();

        // Hide instructions after 7 seconds
        setTimeout(() => {
            if (instructionsEl) instructionsEl.style.display = 'none';
        }, 7000);

        // Don't auto-start game - wait for all markers
        statusEl.textContent = '📷 Wyceluj kamerą we wszystkie 3 markery...';
        statusEl.style.background = 'rgba(255, 165, 0, 0.8)';
    });

    // Restart button
    if (restartBtn) {
        restartBtn.addEventListener('click', () => {
            location.reload();
        });
    }
});

function setupMarkerDetection() {
    const markers = ['marker1', 'marker2', 'marker3'];
    
    markers.forEach(markerId => {
        const marker = document.getElementById(markerId);
        if (marker) {
            // Marker found
            marker.addEventListener('markerFound', () => {
                visibleMarkers[markerId] = true;
                console.log(`Marker ${markerId} found`);
                checkAllMarkersVisible();
            });
            
            // Marker lost
            marker.addEventListener('markerLost', () => {
                visibleMarkers[markerId] = false;
                console.log(`Marker ${markerId} lost`);
            });
        }
    });
}

function checkAllMarkersVisible() {
    const allVisible = Object.values(visibleMarkers).every(visible => visible === true);
    
    if (allVisible && !gameStarted) {
        console.log('🎮 Wszystkie markery widoczne! Rozpoczynam grę...');
        gameStarted = true;
        
        // Show green light effect
        showStartIndicator();
        
        // Start game after indicator
        setTimeout(() => {
            startNewRound();
        }, 2500);
    }
}

function showStartIndicator() {
    statusEl.textContent = '🟢 START! Gra się rozpoczyna...';
    statusEl.style.background = 'rgba(0, 255, 0, 0.9)';
    statusEl.style.fontSize = '24px';
    statusEl.style.animation = 'pulse 0.5s ease-in-out 3';
    
    // Flash all spheres green
    Object.keys(colorMap).forEach(color => {
        const sphere = colorMap[color].element;
        if (sphere) {
            sphere.setAttribute('color', '#00FF00');
            setTimeout(() => {
                sphere.setAttribute('color', colorMap[color].original);
            }, 2000);
        }
    });
}

function setupARClickHandlers() {
    // Get clickable plane elements
    const clickable1 = document.getElementById('clickable1');
    const clickable2 = document.getElementById('clickable2');
    const clickable3 = document.getElementById('clickable3');

    // Add click and touch handlers
    [
        { el: clickable1, color: 'red' },
        { el: clickable2, color: 'green' },
        { el: clickable3, color: 'blue' }
    ].forEach(item => {
        if (item.el) {
            const clickHandler = (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // Get color from the element's data attribute
                const colorFromElement = item.el.getAttribute('data-color');
                console.log('AR Click - Element:', item.el.id, 'Expected color:', item.color, 'Data-color:', colorFromElement);
                
                // Verify the marker is visible and game started before allowing click
                const marker = item.el.parentElement;
                if (marker && marker.object3D.visible && gameStarted) {
                    handleButtonClick(item.color);
                } else {
                    console.log('Marker not visible or game not started, ignoring click');
                }
            };

            // Mouse click
            item.el.addEventListener('click', clickHandler);

            // Touch event
            item.el.addEventListener('touchstart', clickHandler);
        }
    });
}

function setupButtonHandlers() {
    Object.keys(colorMap).forEach(color => {
        const button = colorMap[color].button;
        if (button) {
            button.addEventListener('click', () => handleButtonClick(color));
        }
    });
}

function handleButtonClick(color) {
    console.log('=== handleButtonClick wywołane ===');
    console.log('Kolor:', color);
    console.log('canPlay:', canPlay, 'isShowingSequence:', isShowingSequence, 'gameStarted:', gameStarted);
    console.log('Aktualna sekwencja gry:', sequence);
    console.log('Dotychczasowa sekwencja gracza:', playerSequence);
    console.log('Oczekiwany następny kolor:', sequence[playerSequence.length]);
    
    if (!gameStarted) {
        console.log('⛔ ZABLOKOWANE - gra jeszcze nie rozpoczęta (wyceluj wszystkie markery)');
        return;
    }
    
    if (!canPlay || isShowingSequence) {
        console.log('⛔ ZABLOKOWANE - nie można kliknąć teraz');
        return;
    }

    // Disable all buttons temporarily
    disableButtons(true);

    // Visual feedback on button
    const button = colorMap[color].button;
    if (button) {
        button.classList.add('flash');
        setTimeout(() => button.classList.remove('flash'), 300);
    }

    // Enhanced flash sphere with light effect
    flashSphereWithLight(color);
    playSound(color);
    triggerParticleEffect(color);

    // Add to player sequence
    playerSequence.push(color);
    console.log('Po dodaniu, sekwencja gracza:', playerSequence);

    // Check if correct
    const currentIndex = playerSequence.length - 1;
    const expectedColor = sequence[currentIndex];
    const actualColor = playerSequence[currentIndex];
    
    console.log('Sprawdzanie: index', currentIndex, 'oczekiwano:', expectedColor, 'otrzymano:', actualColor);
    
    if (actualColor !== expectedColor) {
        // Wrong!
        console.log('❌ BŁĄD! Niepoprawny kolor');
        combo = 0;
        updateCombo();
        gameOver();
        return;
    }

    console.log('✅ Poprawny kolor!');
    combo++;
    updateCombo();

    // Check if sequence complete
    if (playerSequence.length === sequence.length) {
        // Correct sequence!
        console.log('🎉 Cała sekwencja poprawna!');
        canPlay = false;
        const bonusPoints = combo > 5 ? level * 15 : level * 10;
        score += bonusPoints;
        scoreEl.textContent = `Wynik: ${score}`;
        statusEl.textContent = '✅ Dobrze! Następny poziom...';
        statusEl.style.background = 'rgba(0, 255, 0, 0.8)';
        
        // Victory celebration effect
        celebrateVictory();
        
        setTimeout(() => {
            level++;
            startNewRound();
        }, 2000);
    } else {
        // Re-enable buttons after short delay
        console.log('Czekam na następny kolor...');
        setTimeout(() => {
            if (canPlay) disableButtons(false);
        }, 300);
    }
}

function disableButtons(disabled) {
    Object.keys(colorMap).forEach(color => {
        const button = colorMap[color].button;
        if (button) button.disabled = disabled;
    });
}

function startNewRound() {
    playerSequence = [];
    canPlay = false;
    disableButtons(true);
    
    // Add new color to sequence
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    sequence.push(randomColor);
    
    // Update UI
    levelEl.textContent = `Poziom: ${level}`;
    statusEl.textContent = '👀 Obserwuj sekwencję...';
    statusEl.style.background = 'rgba(255, 165, 0, 0.8)';
    
    // Show sequence after 1 second
    setTimeout(() => {
        showSequence();
    }, 1000);
}

async function showSequence() {
    isShowingSequence = true;
    disableButtons(true);
    
    for (let i = 0; i < sequence.length; i++) {
        await wait(600);
        
        // Flash only the sphere, NOT the button
        await flashSphere(sequence[i], true);
    }
    
    isShowingSequence = false;
    canPlay = true;
    disableButtons(false);
    statusEl.textContent = '🎮 Twoja kolej - klikaj przyciski lub markery!';
    statusEl.style.background = 'rgba(0, 128, 255, 0.8)';
}

function flashSphere(color, withSound = false) {
    return new Promise((resolve) => {
        const sphere = colorMap[color].element;
        if (!sphere) {
            resolve();
            return;
        }

        // Flash effect - tylko zmiana koloru, bez skalowania
        sphere.setAttribute('color', colorMap[color].bright);
        
        if (withSound) playSound(color);

        setTimeout(() => {
            sphere.setAttribute('color', colorMap[color].original);
            resolve();
        }, 500);
    });
}

function playSound(color) {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Different frequencies for each color
        const frequencies = {
            'red': 261.63,    // C
            'green': 329.63,  // E
            'blue': 392.00    // G
        };
        
        oscillator.frequency.value = frequencies[color];
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.4);
    } catch (e) {
        console.log('Audio error:', e);
    }
}

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function gameOver() {
    canPlay = false;
    isShowingSequence = false;
    disableButtons(true);
    combo = 0;
    updateCombo();
    statusEl.textContent = '❌ Źle! Koniec gry';
    statusEl.style.background = 'rgba(255, 0, 0, 0.8)';
    
    console.log('Game Over! Ostatnia sekwencja:', sequence, 'Gracz próbował:', playerSequence);
    
    // Play error sound
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 100;
        oscillator.type = 'sawtooth';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
        console.log('Audio error:', e);
    }
    
    setTimeout(() => {
        finalScoreEl.textContent = `Osiągnięty poziom: ${level}`;
        finalPointsEl.textContent = `Punkty: ${score}`;
        gameOverEl.style.display = 'block';
    }, 1500);
}

// ============== ENHANCED FEATURES ==============

// Initialize hand gesture detection using MediaPipe
function initHandGestureDetection() {
    if (typeof Hands === 'undefined') {
        console.log('MediaPipe Hands not loaded, gesture detection disabled');
        if (gestureStatusEl) gestureStatusEl.textContent = '✋ Gesty: Niedostępne';
        return;
    }
    
    try {
        const videoElement = document.createElement('video');
        videoElement.style.display = 'none';
        document.body.appendChild(videoElement);
        
        hands = new Hands({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
            }
        });
        
        hands.setOptions({
            maxNumHands: 1,
            modelComplexity: 1,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });
        
        hands.onResults(onHandGestureResults);
        
        navigator.mediaDevices.getUserMedia({ video: true })
            .then((stream) => {
                videoElement.srcObject = stream;
                videoElement.play();
                
                camera = new Camera(videoElement, {
                    onFrame: async () => {
                        if (gestureEnabled && gameStarted) {
                            await hands.send({ image: videoElement });
                        }
                    },
                    width: 640,
                    height: 480
                });
                
                camera.start();
                gestureEnabled = true;
                if (gestureStatusEl) gestureStatusEl.textContent = '✋ Gesty: Aktywne';
                console.log('Hand gesture detection initialized!');
            })
            .catch((error) => {
                console.log('Camera access denied:', error);
                if (gestureStatusEl) gestureStatusEl.textContent = '✋ Gesty: Brak kamery';
            });
    } catch (e) {
        console.log('Gesture detection error:', e);
        if (gestureStatusEl) gestureStatusEl.textContent = '✋ Gesty: Błąd';
    }
}

// Process hand gesture results
function onHandGestureResults(results) {
    if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
        return;
    }
    
    const landmarks = results.multiHandLandmarks[0];
    const gesture = detectGesture(landmarks);
    
    if (gesture && gesture !== lastGesture) {
        lastGesture = gesture;
        
        // Check if gesture challenge is active
        if (gestureChallengeActive && currentChallenge) {
            if (gesture === currentChallenge.gesture) {
                console.log(`Correct gesture: ${gesture}!`);
                handleCorrectGesture();
            } else {
                console.log(`Wrong gesture: ${gesture}, expected: ${currentChallenge.gesture}`);
            }
        }
        
        // Reset gesture after timeout
        clearTimeout(gestureTimeout);
        gestureTimeout = setTimeout(() => {
            lastGesture = null;
        }, 1000);
    }
}

// Detect specific hand gestures
function detectGesture(landmarks) {
    // Simple gesture detection based on finger positions
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    const middleTip = landmarks[12];
    const ringTip = landmarks[16];
    const pinkyTip = landmarks[20];
    
    const wrist = landmarks[0];
    const indexBase = landmarks[5];
    const middleBase = landmarks[9];
    
    // Calculate if fingers are extended
    const thumbUp = thumbTip.y < indexBase.y;
    const indexUp = indexTip.y < indexBase.y;
    const middleUp = middleTip.y < middleBase.y;
    const ringDown = ringTip.y > middleBase.y;
    const pinkyDown = pinkyTip.y > middleBase.y;
    
    // Thumbs up gesture -> High Sound
    if (thumbUp && !indexUp && !middleUp) {
        return 'thumbs_up';
    }
    
    // Peace sign (index + middle up) -> Low Sound
    if (indexUp && middleUp && ringDown && pinkyDown) {
        return 'peace';
    }
    
    return null;
}

// Update combo display
function updateCombo() {
    if (comboEl) {
        comboEl.textContent = `🔥 Combo: ${combo}`;
        if (combo > 5) {
            comboEl.style.background = 'rgba(255, 215, 0, 0.9)';
            comboEl.style.fontSize = '28px';
        } else {
            comboEl.style.background = 'rgba(255, 140, 0, 0.8)';
            comboEl.style.fontSize = '24px';
        }
    }
}

// Flash sphere with light effect
function flashSphereWithLight(color) {
    const sphere = colorMap[color].element;
    const light = colorMap[color].light;
    
    if (sphere) {
        sphere.setAttribute('color', colorMap[color].bright);
        sphere.setAttribute('scale', '1.3 1.3 1.3');
        
        if (light) {
            light.setAttribute('intensity', '2');
        }
        
        setTimeout(() => {
            sphere.setAttribute('color', colorMap[color].original);
            sphere.setAttribute('scale', '1 1 1');
            if (light) {
                light.setAttribute('intensity', '0');
            }
        }, 500);
    }
}

// Trigger particle effect
function triggerParticleEffect(color) {
    const particleId = color === 'red' ? 'particles1' : color === 'green' ? 'particles2' : 'particles3';
    const particles = document.getElementById(particleId);
    
    if (particles) {
        // Temporarily boost particle emission
        particles.setAttribute('particle-system', 'particleCount: 100');
        setTimeout(() => {
            particles.setAttribute('particle-system', 'particleCount: 50');
        }, 500);
    }
}

// Celebration effect for completing a level
function celebrateVictory() {
    // Flash all spheres in sequence
    setTimeout(() => flashSphereWithLight('red'), 100);
    setTimeout(() => flashSphereWithLight('green'), 300);
    setTimeout(() => flashSphereWithLight('blue'), 500);
    setTimeout(() => {
        flashSphereWithLight('red');
        flashSphereWithLight('green');
        flashSphereWithLight('blue');
    }, 700);
    
    // Play victory sound
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        [261.63, 329.63, 392.00, 523.25].forEach((freq, i) => {
            setTimeout(() => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.value = freq;
                oscillator.type = 'sine';
                
                gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.3);
            }, i * 150);
        });
    } catch (e) {
        console.log('Audio error:', e);
    }
}

// ============== GESTURE SOUND CHALLENGE SYSTEM ==============

// Trigger random gesture challenge
function triggerGestureChallenge() {
    if (!gestureEnabled || gestureChallengeActive || !gameStarted || isShowingSequence) {
        return;
    }
    
    // Random chance to trigger (30% during gameplay)
    if (Math.random() > 0.3) {
        return;
    }
    
    const gestureKeys = Object.keys(gestureTypes);
    const randomGesture = gestureKeys[Math.floor(Math.random() * gestureKeys.length)];
    
    currentChallenge = {
        gesture: randomGesture,
        emoji: gestureTypes[randomGesture].emoji,
        sound: gestureTypes[randomGesture].sound
    };
    
    gestureChallengeActive = true;
    challengeTimeLeft = 10;
    
    // Pause game
    const wasCanPlay = canPlay;
    canPlay = false;
    disableButtons(true);
    
    // Show challenge UI
    if (gestureChallengeEl && gesturePromptEl && challengeTimerEl) {
        gesturePromptEl.textContent = currentChallenge.emoji;
        challengeTimerEl.textContent = challengeTimeLeft;
        gestureChallengeEl.style.display = 'block';
    }
    
    // Play challenge sound
    playChallengeSound(currentChallenge.sound);
    
    // Start countdown timer
    challengeTimer = setInterval(() => {
        challengeTimeLeft--;
        if (challengeTimerEl) challengeTimerEl.textContent = challengeTimeLeft;
        
        if (challengeTimeLeft <= 0) {
            // Time's up - failed
            handleFailedGesture();
        }
    }, 1000);
    
    console.log(`Gesture challenge started: ${randomGesture} (${currentChallenge.sound} sound)`);
}

// Play challenge sound
function playChallengeSound(soundType) {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Different sounds for different challenges
        if (soundType === 'high') {
            // High pitched melodic sound
            oscillator.frequency.value = 880; // A5
            oscillator.type = 'sine';
        } else {
            // Low pitched sound
            oscillator.frequency.value = 220; // A3
            oscillator.type = 'triangle';
        }
        
        gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.8);
        
        console.log(`Playing ${soundType} sound`);
    } catch (e) {
        console.log('Audio error:', e);
    }
}

// Handle correct gesture response
function handleCorrectGesture() {
    clearInterval(challengeTimer);
    gestureChallengeActive = false;
    
    // Award bonus points
    const bonusPoints = 20 + (challengeTimeLeft * 5);
    score += bonusPoints;
    scoreEl.textContent = `Wynik: ${score}`;
    
    // Hide challenge UI
    if (gestureChallengeEl) gestureChallengeEl.style.display = 'none';
    
    // Show success animation
    if (gestureSuccessEl) {
        gestureSuccessEl.style.display = 'block';
    }
    
    // Play success sound
    playSuccessSound();
    
    // Show success message
    if (statusEl) {
        statusEl.textContent = `Swietnie! +${bonusPoints} punktow!`;
        statusEl.style.background = 'rgba(0, 255, 0, 0.9)';
    }
    
    // Hide success animation and resume game
    setTimeout(() => {
        if (gestureSuccessEl) gestureSuccessEl.style.display = 'none';
        currentChallenge = null;
        
        // Resume game
        if (gameStarted && !isShowingSequence) {
            canPlay = true;
            disableButtons(false);
            if (statusEl) {
                statusEl.textContent = 'Twoja kolej - klikaj przyciski lub markery!';
                statusEl.style.background = 'rgba(0, 128, 255, 0.8)';
            }
        }
    }, 2000);
}

// Handle failed gesture response
function handleFailedGesture() {
    clearInterval(challengeTimer);
    gestureChallengeActive = false;
    
    // Hide challenge UI
    if (gestureChallengeEl) gestureChallengeEl.style.display = 'none';
    
    // Show fail animation
    if (gestureFailEl) {
        gestureFailEl.style.display = 'block';
    }
    
    // Play fail sound
    playFailSound();
    
    // Show fail message
    if (statusEl) {
        statusEl.textContent = 'Nie zdazyles!';
        statusEl.style.background = 'rgba(255, 140, 0, 0.8)';
    }
    
    // Hide fail animation and resume game
    setTimeout(() => {
        if (gestureFailEl) gestureFailEl.style.display = 'none';
        currentChallenge = null;
        
        // Resume game
        if (gameStarted && !isShowingSequence) {
            canPlay = true;
            disableButtons(false);
            if (statusEl) {
                statusEl.textContent = 'Twoja kolej - klikaj przyciski lub markery!';
                statusEl.style.background = 'rgba(0, 128, 255, 0.8)';
            }
        }
    }, 2000);
}

// Play success sound for correct gesture
function playSuccessSound() {
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
function playFailSound() {
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

// Schedule random gesture challenges during gameplay
setInterval(() => {
    if (gameStarted && canPlay && !isShowingSequence && !gestureChallengeActive && gestureEnabled) {
        triggerGestureChallenge();
    }
}, 8000); // Check every 8 seconds
