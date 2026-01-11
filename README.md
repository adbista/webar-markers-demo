# AR Memory Game with Hand Gesture Challenges

This project was developed with AI assistance (GitHub Copilot).

An interactive augmented reality memory game built with A-Frame and AR.js, featuring advanced 3D animations, particle systems, dynamic lighting, and hand gesture recognition using MediaPipe.

## Project Description

AR Memory Game is an enhanced version of the classic Simon Says game in augmented reality. Players must remember and repeat sequences of colored spheres displayed above AR markers. The game includes an innovative gesture-based audio challenge system that tests reaction speed and hand recognition skills.

## Core Gameplay

- Watch the sequence of colored sphere flashes
- Repeat the sequence by clicking buttons, tapping AR markers, or using hand gestures
- Each correct sequence increases the level and adds a new element
- Complete gesture challenges when they appear for bonus points
- One mistake ends the game

### Color Markers

1. Red Sphere (marker.patt) - Musical note C (261.63 Hz)
2. Green Sphere (markerApple.patt) - Musical note E (329.63 Hz)
3. Blue Sphere (dot0.patt) - Musical note G (392.00 Hz)

## Hand Gesture Challenge System

During gameplay, random audio-visual challenges may appear requiring quick hand gesture responses:

### Challenge Types

- High Sound (880 Hz) - Requires thumbs up gesture
- Low Sound (220 Hz) - Requires peace sign gesture

### Challenge Mechanics

- Audio cue plays with visual prompt showing required gesture
- 3-second countdown timer
- Correct gesture awards 20-35 bonus points (depending on reaction speed)
- Failed challenge results in no point penalty but lost bonus opportunity

## Advanced Features

### 3D Animations and Visual Effects

- Rotating spheres with individual animation speeds
- Torus rings orbiting each sphere
- Particle systems (50-100 particles per marker)
- Dynamic point lighting synchronized with interactions
- PBR materials with metalness and roughness properties
- Scale animations on interaction
- Celebration effects on level completion

### Hand Gesture Recognition

- MediaPipe Hands integration for real-time gesture detection
- Two gesture types: thumbs up and peace sign
- Independent from marker-based gameplay
- Visual status indicator showing gesture system state

### Audio System

- Unique tones for each color (C-E-G musical scale)
- High/low challenge sounds
- Success melody (C-E-G-C progression)
- Failure sound effects
- Web Audio API synthesis

### Combo System

- Tracks consecutive correct answers
- Bonus multiplier at combo greater than 5
- Visual feedback with color and size changes
- Resets on incorrect answer

### Dynamic Lighting

- Point lights at each marker position
- Intensity bursts during interactions
- Color-matched to sphere colors
- Synchronized with particle effects

## How to Run

### Method 1: Local Server (Recommended)

```bash
# Python 3
python -m http.server 8000

# Node.js
npx http-server -p 8000
```

Open: `http://localhost:8000`

### Method 2: Visual Studio Code

1. Install "Live Server" extension
2. Right-click on `index.html`
3. Select "Open with Live Server"

## Requirements

- WebRTC-capable browser (Chrome, Firefox, Safari)
- Camera access (for AR and gesture detection)
- Printed AR markers (pattern files in assets folder)
- HTTPS or localhost (required for camera permissions)
- Good lighting conditions for marker tracking

## Game Instructions

1. Print markers from `assets/` folder
2. Launch game in browser
3. Allow camera access
4. Point camera at all 3 markers to start
5. Watch the sequence of flashing spheres
6. Repeat sequence using buttons, AR markers, or gestures
7. Complete gesture challenges when they appear
8. Continue until making a mistake

## Technologies Used

### Core Frameworks

- A-Frame 1.4.2 - WebVR/AR framework
- AR.js 3.4.5 - Marker-based AR tracking
- MediaPipe Hands - Hand gesture recognition
- Web Audio API - Sound synthesis

### A-Frame Components

- a-sphere - Main game objects
- a-torus - Orbital rings
- a-light (point) - Dynamic lighting
- a-entity with particle-system - Particle effects
- a-text - 3D labels
- a-marker - AR tracking

### Features Implemented

- PBR materials (metalness, roughness)
- Animation system (rotation, scale, position)
- Event system (markerFound, markerLost, click)
- Camera integration
- Custom gesture detection algorithms

## Project Structure

```
ar2/
├── index.html          # Main HTML with A-Frame scene
├── game.js            # Game logic and gesture detection
├── style.css          # Styles and CSS animations
├── README.md          # This file
├── NOWE_FUNKCJE.md   # Feature documentation (Polish)
└── assets/
    ├── marker.patt         # Red marker pattern
    ├── markerApple.patt    # Green marker pattern
    ├── dot0.patt          # Blue marker pattern
    └── license.txt        # License information
```

## Scoring System

- Base points per level: 10 points
- Combo bonus (combo greater than 5): 50% increase
- Gesture challenge base: 20 points
- Gesture speed bonus: +5 points per second remaining
- Maximum gesture bonus: 35 points (1-second reaction)

## Visual Effects

### A-Frame Animations

- Continuous rotation on Y-axis
- Particle emission and physics
- Dynamic light intensity
- Material property changes
- Scale transformations

### CSS Animations

- Pulse effect on UI elements
- Glow effect on gesture status
- Flash effect on buttons
- Challenge panel animations

## Troubleshooting

### Camera Issues

- Ensure HTTPS or localhost connection
- Check browser camera permissions
- Verify no other application is using camera

### Marker Detection Problems

- Print markers clearly with high contrast
- Ensure adequate lighting
- Hold markers flat and stable
- Maintain appropriate distance from camera

### Gesture Recognition Not Working

- MediaPipe may not load on all browsers
- Check console for loading errors
- Safari iOS has limited support
- Ensure hand is visible and well-lit

### Performance Issues

- Close unnecessary browser tabs
- Try different browser
- Reduce particle count if needed
- Check device GPU capabilities

## Development Notes

This project demonstrates:
- Integration of multiple AR/VR technologies
- Real-time computer vision for gesture recognition
- Advanced A-Frame component usage
- Web Audio API for dynamic sound generation
- Event-driven game architecture
- Responsive design for mobile and desktop

## Future Enhancements

Possible improvements:
- Additional gesture types
- Difficulty levels with adjustable speed
- Multiplayer support
- Persistent leaderboards
- Sound themes
- Additional challenge types
- Vibration feedback on mobile
- Tutorial mode


---

Developed with AI assistance using GitHub Copilot
