import { useCallback, useRef, useEffect } from 'react';

// Sound effect types
type SoundType = 'success' | 'error' | 'click' | 'levelUp' | 'badge' | 'timer' | 'complete' | 'notification';

// Audio context singleton
let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
}

// Generate sounds using Web Audio API (no external files needed)
function createOscillatorSound(
  ctx: AudioContext,
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume: number = 0.3
): void {
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
  
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
  
  gainNode.gain.setValueAtTime(volume, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
  
  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + duration);
}

// Sound configurations
const SOUND_CONFIGS: Record<SoundType, () => void> = {
  success: () => {
    const ctx = getAudioContext();
    // Happy ascending notes
    createOscillatorSound(ctx, 523.25, 0.15, 'sine', 0.2); // C5
    setTimeout(() => createOscillatorSound(ctx, 659.25, 0.15, 'sine', 0.2), 100); // E5
    setTimeout(() => createOscillatorSound(ctx, 783.99, 0.25, 'sine', 0.25), 200); // G5
  },
  
  error: () => {
    const ctx = getAudioContext();
    // Descending warning tone
    createOscillatorSound(ctx, 400, 0.15, 'square', 0.15);
    setTimeout(() => createOscillatorSound(ctx, 300, 0.2, 'square', 0.12), 150);
  },
  
  click: () => {
    const ctx = getAudioContext();
    // Short click sound
    createOscillatorSound(ctx, 800, 0.05, 'sine', 0.1);
  },
  
  levelUp: () => {
    const ctx = getAudioContext();
    // Triumphant fanfare
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      setTimeout(() => createOscillatorSound(ctx, freq, 0.2, 'sine', 0.2), i * 100);
    });
    // Add sparkle
    setTimeout(() => createOscillatorSound(ctx, 1318.51, 0.3, 'sine', 0.15), 400); // E6
  },
  
  badge: () => {
    const ctx = getAudioContext();
    // Achievement unlock sound
    createOscillatorSound(ctx, 880, 0.1, 'sine', 0.2); // A5
    setTimeout(() => createOscillatorSound(ctx, 1108.73, 0.1, 'sine', 0.2), 80); // C#6
    setTimeout(() => createOscillatorSound(ctx, 1318.51, 0.2, 'sine', 0.25), 160); // E6
    setTimeout(() => createOscillatorSound(ctx, 1760, 0.3, 'triangle', 0.15), 250); // A6
  },
  
  timer: () => {
    const ctx = getAudioContext();
    // Tick sound
    createOscillatorSound(ctx, 1000, 0.03, 'sine', 0.08);
  },
  
  complete: () => {
    const ctx = getAudioContext();
    // Completion melody
    const melody = [
      { freq: 523.25, delay: 0 },    // C5
      { freq: 587.33, delay: 100 },  // D5
      { freq: 659.25, delay: 200 },  // E5
      { freq: 783.99, delay: 300 },  // G5
      { freq: 1046.50, delay: 450 }, // C6
    ];
    melody.forEach(({ freq, delay }) => {
      setTimeout(() => createOscillatorSound(ctx, freq, 0.2, 'sine', 0.2), delay);
    });
  },
  
  notification: () => {
    const ctx = getAudioContext();
    // Gentle notification
    createOscillatorSound(ctx, 880, 0.1, 'sine', 0.15);
    setTimeout(() => createOscillatorSound(ctx, 1174.66, 0.15, 'sine', 0.12), 100);
  },
};

interface UseSoundEffectsOptions {
  enabled?: boolean;
  volume?: number;
}

export function useSoundEffects(options: UseSoundEffectsOptions = {}) {
  // Read from localStorage settings if not explicitly provided
  const getEnabledFromSettings = (): boolean => {
    if (typeof window === 'undefined') return true;
    try {
      const saved = localStorage.getItem('voice-settings');
      if (saved) {
        const settings = JSON.parse(saved);
        return settings.soundEffectsEnabled !== false;
      }
    } catch {}
    return true;
  };

  const { enabled = getEnabledFromSettings() } = options;
  const enabledRef = useRef(enabled);
  
  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  // Listen for settings changes
  useEffect(() => {
    const handleStorage = () => {
      try {
        const saved = localStorage.getItem('voice-settings');
        if (saved) {
          const settings = JSON.parse(saved);
          enabledRef.current = settings.soundEffectsEnabled !== false;
        }
      } catch {}
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const play = useCallback((sound: SoundType) => {
    if (!enabledRef.current) return;
    
    try {
      // Resume audio context if suspended (browser autoplay policy)
      const ctx = getAudioContext();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      
      SOUND_CONFIGS[sound]?.();
    } catch (error) {
      console.warn('Sound effect failed:', error);
    }
  }, []);

  const playSuccess = useCallback(() => play('success'), [play]);
  const playError = useCallback(() => play('error'), [play]);
  const playClick = useCallback(() => play('click'), [play]);
  const playLevelUp = useCallback(() => play('levelUp'), [play]);
  const playBadge = useCallback(() => play('badge'), [play]);
  const playTimer = useCallback(() => play('timer'), [play]);
  const playComplete = useCallback(() => play('complete'), [play]);
  const playNotification = useCallback(() => play('notification'), [play]);

  return {
    play,
    playSuccess,
    playError,
    playClick,
    playLevelUp,
    playBadge,
    playTimer,
    playComplete,
    playNotification,
    enabled,
  };
}

export default useSoundEffects;
