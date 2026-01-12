// AR Memory Game - Animations Module
import { CONFIG } from './config.js';

export class AnimationManager {
    constructor(audioManager) {
        this.audio = audioManager;
    }
    
    // Flash model during sequence display
    async flashModel(color, withSound = false) {
        return new Promise((resolve) => {
            const sphere = CONFIG.COLOR_MAP[color].element;
            const light = CONFIG.COLOR_MAP[color].light;
            const indicator = CONFIG.COLOR_MAP[color].indicator;
            
            if (!sphere) {
                resolve();
                return;
            }
            
            // Pokaż wskaźnik
            if (indicator) {
                indicator.setAttribute('visible', 'true');
            }
            
            // NIE USUWAMY animation__bounce - pozwalamy jej działać w tle!
            // Zamiast tego, dodajemy tymczasowe animacje które nadpiszą pozycję
            
            // Pobierz obecną pozycję
            const currentPos = sphere.getAttribute('position');
            const currentY = currentPos.y;
            
            // Animacja podskoku z rotacją - dla kul używamy radius zamiast scale
            sphere.setAttribute('animation__flash_radius', 'property: radius; from: 0.3; to: 0.45; dur: 250; easing: easeOutCubic');
            sphere.setAttribute('animation__flash_move', `property: position; from: 0 ${currentY} 0; to: 0 0.9 0; dur: 250; easing: easeOutQuad`);
            
            // Zmiana koloru i materiału
            const currentMaterial = sphere.getAttribute('material');
            sphere.setAttribute('material', {
                ...currentMaterial,
                color: CONFIG.COLOR_MAP[color].bright,
                emissiveIntensity: 1.5
            });
            
            if (light) {
                light.setAttribute('animation__flash_light', 'property: intensity; from: 1.5; to: 5; dur: 150; easing: easeOutQuad');
            }
            
            if (withSound) {
                this.audio.playColorSound(color);
            }
            
            // Powrót do normalnego stanu
            setTimeout(() => {
                sphere.setAttribute('animation__flash_radius2', 'property: radius; to: 0.3; dur: 250; easing: easeInOutBack');
                // Usuń animację move żeby pozwolić bounce przejąć kontrolę
                sphere.removeAttribute('animation__flash_move');
                sphere.removeAttribute('animation__flash_move2');
                
                sphere.setAttribute('material', {
                    ...currentMaterial,
                    color: CONFIG.COLOR_MAP[color].original,
                    emissiveIntensity: 0.8
                });
                
                if (light) {
                    light.setAttribute('animation__flash_light2', 'property: intensity; to: 1.5; dur: 200; easing: easeInQuad');
                }
                
                // Ukryj wskaźnik
                if (indicator) {
                    indicator.setAttribute('visible', 'false');
                }
                
                // animation__bounce nigdy nie została usunięta, więc działa cały czas!
                resolve();
            }, 250);
        });
    }
    
    // Flash model on player click (more powerful)
    flashModelClick(color) {
        const sphere = CONFIG.COLOR_MAP[color].element;
        const light = CONFIG.COLOR_MAP[color].light;
        
        if (!sphere) return;
        
        // NIE USUWAMY animation__bounce!
        
        const currentMaterial = sphere.getAttribute('material');
        const currentPos = sphere.getAttribute('position');
        const currentY = currentPos.y;
        
        // Potężniejszy efekt 3-fazowy dla kul
        // Faza 1: Eksplozja
        sphere.setAttribute('animation__click_radius1', 'property: radius; from: 0.3; to: 0.55; dur: 150; easing: easeOutCubic');
        sphere.setAttribute('animation__click_jump1', `property: position; from: 0 ${currentY} 0; to: 0 1.0 0; dur: 150; easing: easeOutCubic`);
        
        sphere.setAttribute('material', {
            ...currentMaterial,
            color: CONFIG.COLOR_MAP[color].bright,
            emissiveIntensity: 2.0
        });
        
        if (light) {
            light.setAttribute('animation__click_light', 'property: intensity; from: 1.5; to: 6; dur: 100; easing: easeOutQuad');
        }
        
        // Faza 2: Compression
        setTimeout(() => {
            sphere.setAttribute('animation__click_radius2', 'property: radius; to: 0.35; dur: 150; easing: easeInBack');
            sphere.setAttribute('animation__click_jump2', 'property: position; to: 0 0.45 0; dur: 150; easing: easeInQuad');
        }, 150);
        
        // Faza 3: Bounce back
        setTimeout(() => {
            sphere.setAttribute('animation__click_radius3', 'property: radius; to: 0.3; dur: 200; easing: easeOutElastic');
            
            // Usuń tymczasowe animacje pozycji, pozwól bounce przejąć kontrolę
            sphere.removeAttribute('animation__click_jump1');
            sphere.removeAttribute('animation__click_jump2');
            sphere.removeAttribute('animation__click_jump3');
            
            sphere.setAttribute('material', {
                ...currentMaterial,
                color: CONFIG.COLOR_MAP[color].original,
                emissiveIntensity: 0.8
            });
            
            if (light) {
                light.setAttribute('animation__click_light_fade', 'property: intensity; to: 1.5; dur: 300; easing: easeInQuad');
            }
            
            // animation__bounce działa cały czas w tle!
        }, 300);
    }
    
    // Victory celebration animation - Rainbow style
    celebrateVictory() {
        const spheres = [
            { color: 'red', element: CONFIG.COLOR_MAP.red.element, light: CONFIG.COLOR_MAP.red.light },
            { color: 'green', element: CONFIG.COLOR_MAP.green.element, light: CONFIG.COLOR_MAP.green.light },
            { color: 'blue', element: CONFIG.COLOR_MAP.blue.element, light: CONFIG.COLOR_MAP.blue.light }
        ];
        
        // Rainbow kolory do przejścia
        const rainbowColors = [
            '#FF0000', // Czerwony
            '#FF7F00', // Pomarańczowy
            '#FFFF00', // Żółty
            '#00FF00', // Zielony
            '#0000FF', // Niebieski
            '#4B0082', // Indygo
            '#9400D3', // Fioletowy
            '#FF1493', // Różowy
            '#00FFFF', // Cyan
            '#FF00FF'  // Magenta
        ];
        
        // Animacja rainbow style
        spheres.forEach((s, sphereIndex) => {
            if (s.element) {
                // Każda kula zaczyna od innego koloru
                let colorIndex = sphereIndex * 3;
                
                const colorInterval = setInterval(() => {
                    const currentColor = rainbowColors[colorIndex % rainbowColors.length];
                    s.element.setAttribute('color', currentColor);
                    s.element.setAttribute('metalness', '0.9');
                    s.element.setAttribute('roughness', '0.1');
                    
                    if (s.light) {
                        s.light.setAttribute('intensity', '3');
                        s.light.setAttribute('color', currentColor);
                    }
                    
                    colorIndex++;
                }, 200); // Zmiana koloru co 200ms
                
                // Stop po 2 sekundach i powrót do oryginalnego koloru
                setTimeout(() => {
                    clearInterval(colorInterval);
                    
                    // Najpierw ustaw właściwości materiału
                    s.element.setAttribute('metalness', '0.5');
                    s.element.setAttribute('roughness', '0.5');
                    
                    // Płynne przejście do oryginalnego koloru
                    s.element.setAttribute('animation__rainbow_fade', 
                        `property: color; to: ${CONFIG.COLOR_MAP[s.color].original}; dur: 800; easing: easeInOutQuad`);
                    
                    if (s.light) {
                        s.light.setAttribute('animation__light_fade', 'property: intensity; to: 0; dur: 800; easing: easeOutQuad');
                    }
                    
                    // Dodatkowe zabezpieczenie - ustaw kolor bezpośrednio po animacji
                    setTimeout(() => {
                        s.element.setAttribute('color', CONFIG.COLOR_MAP[s.color].original);
                    }, 900);
                }, 2000);
            }
        });
        
        // Dźwięk zwycięstwa
        this.audio.playVictoryMelody();
    }
    
    // Start game animation
    animateStart() {
        Object.keys(CONFIG.COLOR_MAP).forEach((color, index) => {
            const model = CONFIG.COLOR_MAP[color].element;
            const sphere = CONFIG.COLOR_MAP[color].element;
            const light = CONFIG.COLOR_MAP[color].light;
            
            if (sphere) {
                setTimeout(() => {
                    sphere.setAttribute('animation__start_jump', 'property: position; from: 0 0.5 0; to: 0 0.9 0; dur: 300; dir: alternate; loop: 2; easing: easeInOutQuad');
                    sphere.setAttribute('animation__start_radius', 'property: radius; from: 0.3; to: 0.4; dur: 300; dir: alternate; loop: 2; easing: easeInOutQuad');
                    sphere.setAttribute('color', '#00FF00');
                    sphere.setAttribute('metalness', '0.8');
                    
                    if (light) {
                        light.setAttribute('animation__start_light', 'property: intensity; from: 0; to: 4; dur: 300; dir: alternate; loop: 2; easing: easeInOutQuad');
                    }
                    
                    setTimeout(() => {
                        sphere.setAttribute('color', CONFIG.COLOR_MAP[color].original);
                        sphere.setAttribute('metalness', '0.5');
                        if (light) light.setAttribute('intensity', '0');
                    }, 1200);
                }, index * 200);
            }
        });
    }
}
