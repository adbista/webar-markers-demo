// AR Memory Game - UI Module

export class UIManager {
    constructor() {
        this.elements = {};
    }
    
    // Initialize UI elements
    init() {
        this.elements = {
            level: document.getElementById('level'),
            score: document.getElementById('score'),
            status: document.getElementById('status'),
            gameOver: document.getElementById('gameOver'),
            finalScore: document.getElementById('finalScore'),
            finalPoints: document.getElementById('finalPoints'),
            restartBtn: document.getElementById('restartBtn'),
            instructions: document.getElementById('instructions'),
            gestureStatus: document.getElementById('gesture-status'),
            combo: document.getElementById('combo'),
            gestureChallenge: document.getElementById('gesture-challenge'),
            gesturePrompt: document.getElementById('gesture-prompt'),
            challengeTimer: document.getElementById('challenge-timer'),
            gestureSuccess: document.getElementById('gesture-success'),
            gestureFail: document.getElementById('gesture-fail'),
            btnRed: document.getElementById('btnRed'),
            btnGreen: document.getElementById('btnGreen'),
            btnBlue: document.getElementById('btnBlue')
        };
        
        this.setupToggleButton();
    }
    
    setupToggleButton() {
        const toggleUIBtn = document.getElementById('toggleUI');
        const uiElements = [
            this.elements.level?.parentElement,
            this.elements.gestureSuccess,
            this.elements.gestureFail,
            this.elements.instructions
        ].filter(el => el);
        
        if (toggleUIBtn) {
            toggleUIBtn.addEventListener('click', () => {
                uiElements.forEach(el => el.classList.toggle('ui-hidden'));
                toggleUIBtn.textContent = toggleUIBtn.textContent === '👁️' ? '👁️‍🗨️' : '👁️';
            });
        }
    }
    
    updateLevel(level) {
        if (this.elements.level) {
            this.elements.level.textContent = `Poziom: ${level}`;
        }
    }
    
    updateScore(score) {
        if (this.elements.score) {
            this.elements.score.textContent = `Wynik: ${score}`;
        }
    }
    
    updateCombo(combo) {
        if (this.elements.combo) {
            this.elements.combo.textContent = `🔥 Combo: ${combo}`;
            if (combo > 5) {
                this.elements.combo.style.background = 'rgba(255, 215, 0, 0.9)';
                this.elements.combo.style.fontSize = '28px';
            } else {
                this.elements.combo.style.background = 'rgba(255, 140, 0, 0.8)';
                this.elements.combo.style.fontSize = '24px';
            }
        }
    }
    
    setStatus(text, color) {
        if (this.elements.status) {
            this.elements.status.textContent = text;
            this.elements.status.style.background = color;
        }
    }
    
    setGestureStatus(text) {
        if (this.elements.gestureStatus) {
            this.elements.gestureStatus.textContent = text;
        }
    }
    
    showGameOver(level, score) {
        if (this.elements.finalScore) {
            this.elements.finalScore.textContent = `Osiągnięty poziom: ${level}`;
        }
        if (this.elements.finalPoints) {
            this.elements.finalPoints.textContent = `Punkty: ${score}`;
        }
        if (this.elements.gameOver) {
            this.elements.gameOver.style.display = 'block';
        }
    }
    
    hideInstructions(delay = 7000) {
        setTimeout(() => {
            if (this.elements.instructions) {
                this.elements.instructions.style.display = 'none';
            }
        }, delay);
    }
    
    flashButton(color) {
        const button = this.elements[`btn${color.charAt(0).toUpperCase() + color.slice(1)}`];
        if (button) {
            button.classList.add('flash');
            setTimeout(() => button.classList.remove('flash'), 300);
        }
    }
    
    disableButtons(disabled) {
        ['btnRed', 'btnGreen', 'btnBlue'].forEach(btnKey => {
            if (this.elements[btnKey]) {
                this.elements[btnKey].disabled = disabled;
            }
        });
    }
    
    // Gesture challenge UI
    showGestureChallenge(emoji, timeLeft) {
        if (this.elements.gesturePrompt) {
            this.elements.gesturePrompt.textContent = emoji;
        }
        if (this.elements.challengeTimer) {
            this.elements.challengeTimer.textContent = timeLeft;
        }
        if (this.elements.gestureChallenge) {
            this.elements.gestureChallenge.style.display = 'block';
        }
    }
    
    hideGestureChallenge() {
        if (this.elements.gestureChallenge) {
            this.elements.gestureChallenge.style.display = 'none';
        }
    }
    
    updateChallengeTimer(timeLeft) {
        if (this.elements.challengeTimer) {
            this.elements.challengeTimer.textContent = timeLeft;
        }
    }
    
    showGestureSuccess() {
        if (this.elements.gestureSuccess) {
            this.elements.gestureSuccess.style.display = 'block';
        }
    }
    
    hideGestureSuccess() {
        if (this.elements.gestureSuccess) {
            this.elements.gestureSuccess.style.display = 'none';
        }
    }
    
    showGestureFail() {
        if (this.elements.gestureFail) {
            this.elements.gestureFail.style.display = 'block';
        }
    }
    
    hideGestureFail() {
        if (this.elements.gestureFail) {
            this.elements.gestureFail.style.display = 'none';
        }
    }
    
    showGestureSuccess() {
        if (this.elements.gestureSuccess) {
            this.elements.gestureSuccess.style.display = 'block';
        }
        setTimeout(() => {
            if (this.elements.gestureSuccess) {
                this.elements.gestureSuccess.style.display = 'none';
            }
        }, 2000);
    }
    
    showGestureFail() {
        if (this.elements.gestureFail) {
            this.elements.gestureFail.style.display = 'block';
        }
        setTimeout(() => {
            if (this.elements.gestureFail) {
                this.elements.gestureFail.style.display = 'none';
            }
        }, 1500);
    }
}
