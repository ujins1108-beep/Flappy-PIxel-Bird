/**
 * 8-Bit Retro Sound Synthesizer using Web Audio API
 * Generates instant, zero-latency chiptune sound effects without external audio files.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;
  private volume: number = 0.3;

  constructor() {
    // Restore mute preference
    const savedMute = localStorage.getItem('flappy_muted');
    if (savedMute !== null) {
      this.muted = savedMute === 'true';
    }
  }

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public toggleMute(): boolean {
    this.muted = !this.muted;
    localStorage.setItem('flappy_muted', String(this.muted));
    return this.muted;
  }

  public setMuted(mute: boolean) {
    this.muted = mute;
    localStorage.setItem('flappy_muted', String(this.muted));
  }

  /**
   * Wing Flap sound: quick square wave jump
   */
  public playWing() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(260, t);
      osc.frequency.exponentialRampToValueAtTime(540, t + 0.1);

      gain.gain.setValueAtTime(this.volume * 0.7, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.12);
    } catch {
      // Audio context might be restricted
    }
  }

  /**
   * Score Point sound: iconic two-tone coin bell (C5 -> G5)
   */
  public playPoint() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();

      osc1.type = 'square';
      osc1.frequency.setValueAtTime(784, t); // G5
      gain1.gain.setValueAtTime(this.volume * 0.4, t);
      gain1.gain.exponentialRampToValueAtTime(0.01, t + 0.08);

      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.start(t);
      osc1.stop(t + 0.08);

      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();

      osc2.type = 'square';
      osc2.frequency.setValueAtTime(1046.5, t + 0.08); // C6
      gain2.gain.setValueAtTime(this.volume * 0.45, t + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.01, t + 0.28);

      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(t + 0.08);
      osc2.stop(t + 0.28);
    } catch {
      // Ignore
    }
  }

  /**
   * Hit / Collision sound: heavy crunchy thud
   */
  public playHit() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      // Low square hit
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, t);
      osc.frequency.exponentialRampToValueAtTime(35, t + 0.18);

      gain.gain.setValueAtTime(this.volume * 0.9, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.2);

      // Noise punch
      const bufferSize = this.ctx.sampleRate * 0.1;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(this.volume * 0.5, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

      noise.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);
      noise.start(t);
      noise.stop(t + 0.1);
    } catch {
      // Ignore
    }
  }

  /**
   * Die / Falling sound
   */
  public playDie() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, t);
      osc.frequency.exponentialRampToValueAtTime(60, t + 0.35);

      gain.gain.setValueAtTime(this.volume * 0.6, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.35);
    } catch {
      // Ignore
    }
  }

  /**
   * Swoosh transition sound
   */
  public playSwoosh() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(450, t);
      osc.frequency.exponentialRampToValueAtTime(180, t + 0.15);

      gain.gain.setValueAtTime(this.volume * 0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.15);
    } catch {
      // Ignore
    }
  }
}

export const sound = new SoundEngine();
