/**
 * Zero-dependency Web Audio procedural sound synthesizer
 * Produces crisp, punchy 8-bit / 16-bit sound effects directly in the browser
 */

export class AudioSynthesizer {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;

  public sfxVolume = 0.7;
  public ambientVolume = 0.5;
  public masterVolume = 0.8;
  public isMuted = false;

  constructor() {
    // Initialized on first user gesture
  }

  public init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    this.ctx = new AudioContextClass();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = this.isMuted ? 0 : this.masterVolume;
    this.masterGain.connect(this.ctx.destination);

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.value = this.sfxVolume;
    this.sfxGain.connect(this.masterGain);

    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.value = this.ambientVolume;
    this.ambientGain.connect(this.masterGain);
  }

  public resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMasterVolume(v: number) {
    this.masterVolume = Math.max(0, Math.min(1, v));
    if (this.masterGain && !this.isMuted) {
      this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx?.currentTime || 0);
    }
  }

  public setSfxVolume(v: number) {
    this.sfxVolume = Math.max(0, Math.min(1, v));
    if (this.sfxGain) {
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx?.currentTime || 0);
    }
  }

  public setAmbientVolume(v: number) {
    this.ambientVolume = Math.max(0, Math.min(1, v));
    if (this.ambientGain) {
      this.ambientGain.gain.setValueAtTime(this.ambientVolume, this.ctx?.currentTime || 0);
    }
  }

  // --- SOUND EFFECTS ---

  /**
   * Footstep sound variations based on block material
   */
  public playFootstep(material: 'grass' | 'stone' | 'wood' | 'sand' | 'snow' | 'water') {
    this.init();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    switch (material) {
      case 'grass':
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, t);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(140 + Math.random() * 40, t);
        osc.frequency.exponentialRampToValueAtTime(40, t + 0.08);
        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);
        break;

      case 'stone':
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(800, t);
        osc.type = 'square';
        osc.frequency.setValueAtTime(260 + Math.random() * 60, t);
        osc.frequency.exponentialRampToValueAtTime(60, t + 0.06);
        gain.gain.setValueAtTime(0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.06);
        break;

      case 'wood':
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(500, t);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(180 + Math.random() * 30, t);
        osc.frequency.exponentialRampToValueAtTime(70, t + 0.09);
        gain.gain.setValueAtTime(0.35, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.09);
        break;

      case 'sand':
        this.playNoise(0.09, 300, 'bandpass', 0.2);
        return;

      case 'snow':
        this.playNoise(0.07, 600, 'highpass', 0.18);
        return;

      case 'water':
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600, t);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, t);
        osc.frequency.exponentialRampToValueAtTime(180, t + 0.12);
        gain.gain.setValueAtTime(0.4, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
        break;
    }

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.15);
  }

  /**
   * Block mining hit tick
   */
  public playDigHit(material: string) {
    this.init();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = material === 'stone' ? 'square' : 'triangle';
    const baseFreq = material === 'stone' ? 180 : 120;
    osc.frequency.setValueAtTime(baseFreq + Math.random() * 30, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.07);

    gain.gain.setValueAtTime(0.22, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.07);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.08);
  }

  /**
   * Block destroyed pop
   */
  public playBlockBreak() {
    this.init();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.15);

    gain.gain.setValueAtTime(0.45, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.16);

    this.playNoise(0.12, 500, 'bandpass', 0.25);
  }

  /**
   * Block placed thud
   */
  public playBlockPlace() {
    this.init();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.1);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.12);
  }

  /**
   * Item pickup pop / chime
   */
  public playPickup() {
    this.init();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800 + Math.random() * 150, t);
    osc.frequency.exponentialRampToValueAtTime(1300 + Math.random() * 150, t + 0.08);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.09);
  }

  /**
   * Tool swing whoosh
   */
  public playSwing() {
    this.playNoise(0.08, 400, 'lowpass', 0.18);
  }

  /**
   * Player / Mob hit damage grunt
   */
  public playHit(isPlayer: boolean = true) {
    this.init();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    const freq = isPlayer ? 180 : 120;
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(50, t + 0.16);

    gain.gain.setValueAtTime(0.45, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.16);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.18);
  }

  /**
   * Zombie moan
   */
  public playZombieMoan() {
    this.init();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(320, t);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(90, t);
    osc.frequency.linearRampToValueAtTime(110, t + 0.4);
    osc.frequency.linearRampToValueAtTime(75, t + 0.9);

    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.2, t + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.9);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.95);
  }

  /**
   * Crafting clink / success
   */
  public playCraftSuccess() {
    this.init();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(523.25, t); // C5
    osc1.frequency.setValueAtTime(659.25, t + 0.08); // E5

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1046.5, t + 0.08); // C6

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain);

    osc1.start(t);
    osc2.start(t + 0.08);
    osc1.stop(t + 0.26);
    osc2.stop(t + 0.26);
  }

  /**
   * Chest creak sound
   */
  public playChestOpen() {
    this.init();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.linearRampToValueAtTime(320, t + 0.18);

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.22);
  }

  /**
   * Noise buffer helper (for sand, snow, rain, thunder)
   */
  private playNoise(
    duration: number,
    filterFreq: number,
    filterType: BiquadFilterType = 'bandpass',
    volume: number = 0.2
  ) {
    this.init();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.value = filterFreq;

    const gain = this.ctx.createGain();
    const t = this.ctx.currentTime;
    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(t);
  }

  /**
   * Thunder rumble
   */
  public playThunder() {
    this.playNoise(1.8, 120, 'lowpass', 0.65);
  }
}

export const audioSynthesizer = new AudioSynthesizer();
