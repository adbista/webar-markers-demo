// AR Memory Game - Gesture Detection Module
import { CONFIG } from './config.js';

export class GestureManager {
    constructor(audioManager, onRepeatSequence, onChallengeGesture) {
        this.audio = audioManager;
        this.onRepeatSequence = onRepeatSequence;
        this.onChallengeGesture = onChallengeGesture || (() => {});
        this.enabled = false;
        this.hands = null;
        this.lastGesture = null;
        this.gestureTimeout = null;
    }
    
    // Initialize MediaPipe Hands
    async init() {
        if (typeof Hands === 'undefined') {
            console.log('MediaPipe Hands not loaded');
            return false;
        }
        
        try {
            this.hands = new Hands({
                locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
            });
            
            this.hands.setOptions({
                maxNumHands: 1,
                modelComplexity: 1,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5
            });
            
            this.hands.onResults(this.onResults.bind(this));
            return true;
        } catch (e) {
            console.error('Gesture init error:', e);
            return false;
        }
    }
    
    // Start gesture detection loop
    startDetection(video) {
        if (!video || !this.hands) return;
        
        this.enabled = true;
        
        const loop = async () => {
            if (this.enabled && video.readyState >= 2) {
                try {
                    await this.hands.send({ image: video });
                } catch (e) {
                    console.error('Gesture detection error:', e);
                }
            }
            if (this.enabled) {
                requestAnimationFrame(loop);
            }
        };
        
        loop();
    }
    
    stopDetection() {
        this.enabled = false;
    }
    
    // Process hand detection results
    onResults(results) {
        if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
            return;
        }
        
        const landmarks = results.multiHandLandmarks[0];
        const gesture = this.detectGesture(landmarks);
        
        if (gesture && gesture !== this.lastGesture) {
            this.lastGesture = gesture;
            this.onGestureDetected(gesture);
            
            clearTimeout(this.gestureTimeout);
            this.gestureTimeout = setTimeout(() => {
                this.lastGesture = null;
            }, 1000);
        }
    }
    
    // Detect specific gestures
    detectGesture(landmarks) {
        const thumbTip = landmarks[4];
        const thumbBase = landmarks[2];
        const indexTip = landmarks[8];
        const indexBase = landmarks[5];
        const middleTip = landmarks[12];
        const middleBase = landmarks[9];
        const ringTip = landmarks[16];
        const ringBase = landmarks[13];
        const pinkyTip = landmarks[20];
        const pinkyBase = landmarks[17];
        
        const thumbExtended = Math.abs(thumbTip.x - thumbBase.x) > 0.05;
        const indexExtended = indexTip.y < indexBase.y;
        const middleExtended = middleTip.y < middleBase.y;
        const ringExtended = ringTip.y < ringBase.y;
        const pinkyExtended = pinkyTip.y < pinkyBase.y;
        
        let fingerCount = 0;
        if (indexExtended) fingerCount++;
        if (middleExtended) fingerCount++;
        if (ringExtended) fingerCount++;
        if (pinkyExtended) fingerCount++;
        
        // Open palm (5 fingers) = repeat sequence
        if (fingerCount === 4 && thumbExtended) {
            return 'open_palm';
        }
        
        // Thumbs up - kciuk w górę, reszta palców schowana
        if (thumbExtended && !indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
            return 'thumbs_up';
        }
        
        // Peace/Victory sign - dwa palce (index i middle)
        if (indexExtended && middleExtended && !ringExtended && !pinkyExtended && !thumbExtended) {
            return 'peace';
        }
        
        return null;
    }
    
    // Handle detected gesture
    onGestureDetected(gesture) {
        if (gesture === 'open_palm') {
            console.log('🖐️ Open palm detected - Repeat sequence');
            this.onRepeatSequence();
        } else if (gesture === 'thumbs_up' || gesture === 'peace') {
            console.log(`${gesture === 'thumbs_up' ? '👍' : '✌️'} ${gesture} detected`);
            // Powiadom o wyzwaniu
            this.onChallengeGesture(gesture);
        }
    }
    
    // Get current gesture (for challenges)
    getCurrentGesture(landmarks) {
        return this.detectGesture(landmarks);
    }
}
