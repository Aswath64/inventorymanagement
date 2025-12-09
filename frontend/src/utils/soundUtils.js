/**
 * Sound System for Cartoon Inventory App
 * 
 * Features:
 * - Shared AudioContext (Singleton)
 * - Cooldowns per sound type to prevent spam
 * - Volume control & Mute persistence
 * - Reduced motion/sound accessibility check
 */

class SoundManager {
  constructor() {
    this.audioContext = null;
    this.enabled = true;
    this.volume = 0.5;
    this.lastPlayed = {}; // Map<SoundType, Timestamp>
    this.cooldowns = {
      click: 100,
      hover: 50,
      success: 2000,
      error: 1000,
      beep: 50
    };

    // Load initial settings if available, otherwise default
    try {
      const saved = localStorage.getItem('boxy_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.enabled = parsed.soundEnabled ?? true;
        this.volume = parsed.volume ?? 0.5;
      }
    } catch (e) {
      console.warn('Failed to load sound settings', e);
    }
  }

  init() {
    if (!this.audioContext) {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.audioContext = new AudioCtx();
      } catch (e) {
        console.warn('Web Audio API not supported');
        this.enabled = false;
      }
    }
    // Resume if suspended (browser autoplay policy)
    if (this.audioContext?.state === 'suspended') {
      this.audioContext.resume().catch(() => { });
    }
  }

  shouldPlay(type) {
    if (!this.enabled) return false;

    // Check Reduced Motion/Accessibility
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches && type !== 'error' && type !== 'success') {
      return false; // Only play critical sounds in reduced motion
    }

    const now = Date.now();
    const last = this.lastPlayed[type] || 0;
    const cooldown = this.cooldowns[type] || 100;

    if (now - last < cooldown) return false;

    this.lastPlayed[type] = now;
    return true;
  }

  playTone(freq, type = 'sine', duration = 0.1, startTime = 0) {
    if (!this.audioContext) this.init();
    if (!this.audioContext) return;

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.audioContext.currentTime + startTime);

    gain.gain.setValueAtTime(0, this.audioContext.currentTime + startTime);
    gain.gain.linearRampToValueAtTime(this.volume, this.audioContext.currentTime + startTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + startTime + duration);

    osc.connect(gain);
    gain.connect(this.audioContext.destination);

    osc.start(this.audioContext.currentTime + startTime);
    osc.stop(this.audioContext.currentTime + startTime + duration);
  }

  // --- Sound Effects ---

  playClick() {
    if (!this.shouldPlay('click')) return;
    this.playTone(800, 'sine', 0.05);
  }

  playHover() {
    if (!this.shouldPlay('hover')) return;
    this.playTone(400, 'triangle', 0.05); // Pop sound
  }

  playSuccess() {
    if (!this.shouldPlay('success')) return;
    // Maj7 Arpeggio
    this.playTone(523.25, 'sine', 0.2, 0);    // C5
    this.playTone(659.25, 'sine', 0.2, 0.1);  // E5
    this.playTone(783.99, 'sine', 0.2, 0.2);  // G5
    this.playTone(987.77, 'sine', 0.4, 0.3);  // B5
  }

  playError() {
    if (!this.shouldPlay('error')) return;
    // Dissonant low buzz
    this.playTone(150, 'sawtooth', 0.3, 0);
    this.playTone(140, 'sawtooth', 0.3, 0.1);
  }

  playThinking() {
    if (!this.shouldPlay('beep')) return;
    // Quick high blip
    this.playTone(1200, 'sine', 0.05);
  }

  playLevelUp() {
    if (!this.shouldPlay('success')) return;
    // Victory Fanfare
    [523, 659, 784, 1046, 784, 1046].forEach((freq, i) => {
      this.playTone(freq, 'square', 0.15, i * 0.1);
    });
  }

  // --- Controls ---
  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  updateSettings(settings) {
    if (settings.volume !== undefined) this.setVolume(settings.volume);
    if (settings.soundEnabled !== undefined) this.enabled = settings.soundEnabled;
  }

  isEnabled() {
    return this.enabled;
  }
}

const soundManager = new SoundManager();
export default soundManager;



