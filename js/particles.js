// AR Memory Game - Particle Effects Module
import { CONFIG } from './config.js';

export class ParticleManager {
    // Trigger particle burst effect
    triggerBurst(color) {
        const particleId = color === 'red' ? 'particles1' : color === 'green' ? 'particles2' : 'particles3';
        const particles = document.getElementById(particleId);
        
        if (!particles) return;
        
        const colorValues = {
            red: '#FF0000,#FF6666,#FFCCCC,#FFFFFF',
            green: '#00FF00,#66FF66,#CCFFCC,#FFFFFF',
            blue: '#0000FF,#6666FF,#CCCCFF,#FFFFFF'
        };
        
        // Eksplozja cząstek
        particles.setAttribute('particle-system', {
            preset: 'default',
            color: colorValues[color],
            particleCount: CONFIG.PARTICLES.BURST_COUNT,
            maxAge: 2,
            size: CONFIG.PARTICLES.BURST_SIZE,
            velocityValue: '0 3 0',
            velocitySpread: '1.5 1.5 1.5',
            accelerationValue: '0 -2 0',
            accelerationSpread: '0.5 0 0.5'
        });
        
        // Animacja źródła emisji
        particles.setAttribute('animation__particle_burst', 'property: position; from: 0 0.5 0; to: 0 0.7 0; dur: 200; dir: alternate; loop: 2; easing: easeOutQuad');
        
        // Powrót do normalnego stanu
        setTimeout(() => {
            particles.setAttribute('particle-system', {
                preset: 'default',
                color: colorValues[color].split(',').slice(0, 3).join(','),
                particleCount: CONFIG.PARTICLES.NORMAL_COUNT,
                maxAge: 2,
                size: 0.1,
                velocityValue: '0 1 0',
                velocitySpread: '0.3 0.3 0.3',
                accelerationValue: '0 -0.5 0'
            });
        }, CONFIG.PARTICLES.BURST_DURATION);
    }
}
