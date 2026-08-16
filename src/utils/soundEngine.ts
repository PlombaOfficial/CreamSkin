// ==========================================================================
// ABYSS NATIVE WEB AUDIO ENGINE
// Procedural Abyssal Soundscapes, Sonar Ping, Sub-bass Drone & Hydrophone Audio
// ==========================================================================

class AbyssalAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = true;
  private ambientGain: GainNode | null = null;
  private isInitialized: boolean = false;

  constructor() {
    // Audio starts muted by default to respect browser autoplay policies and user preference
    const saved = localStorage.getItem('abyss_audio_muted');
    this.isMuted = saved !== null ? saved === 'true' : true;
  }

  public init() {
    if (this.isInitialized) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.isInitialized = true;
      this.setupAmbientSoundscape();
    } catch (e) {
      console.warn('Web Audio API is not supported or was blocked:', e);
    }
  }

  private setupAmbientSoundscape() {
    if (!this.ctx) return;

    // Master Ambient Gain
    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.setValueAtTime(this.isMuted ? 0 : 0.15, this.ctx.currentTime);
    this.ambientGain.connect(this.ctx.destination);

    // Deep Sub-Bass Oceanic Drone (42 Hz with subtle 0.1Hz LFO vibrato)
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(42, this.ctx.currentTime);

    // LFO for breathing drone
    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.08, this.ctx.currentTime);

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(4, this.ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    // Low-pass filter for the abyss
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(120, this.ctx.currentTime);
    filter.Q.setValueAtTime(3.0, this.ctx.currentTime);

    osc.connect(filter);
    filter.connect(this.ambientGain);

    osc.start();
    lfo.start();

    // Oceanic Pink Noise Floor (Marine Snow / Hydrophone currents)
    try {
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        output[i] *= 0.035;
        b6 = white * 0.115926;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(280, this.ctx.currentTime);
      noiseFilter.Q.setValueAtTime(1.2, this.ctx.currentTime);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.3, this.ctx.currentTime);

      whiteNoise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.ambientGain);

      whiteNoise.start();
    } catch {
      // safe fallback
    }
  }

  public toggleMute(): boolean {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.isMuted = !this.isMuted;
    localStorage.setItem('abyss_audio_muted', String(this.isMuted));

    if (this.ambientGain && this.ctx) {
      const targetGain = this.isMuted ? 0 : 0.18;
      this.ambientGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.3);
    }

    if (!this.isMuted) {
      this.playSonarPing();
    }

    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  // Sonar Ping Sound Effect (Scientific Hydrophone Ping)
  public playSonarPing(frequency: number = 880) {
    if (this.isMuted || !this.ctx) return;
    try {
      if (this.ctx.state === 'suspended') this.ctx.resume();

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(frequency * 0.75, this.ctx.currentTime + 1.8);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(frequency, this.ctx.currentTime);
      filter.Q.setValueAtTime(8.0, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.22, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 2.2);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 2.3);
    } catch (e) {
      console.warn(e);
    }
  }

  // UI Telemetry Click / Radar Chirp
  public playTelemetryClick() {
    if (this.isMuted || !this.ctx) return;
    try {
      if (this.ctx.state === 'suspended') this.ctx.resume();

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1400, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.06);
    } catch (e) {
      console.warn(e);
    }
  }

  // Deep Submersible Depth Displacement Drone
  public playDepthDescent() {
    if (this.isMuted || !this.ctx) return;
    try {
      if (this.ctx.state === 'suspended') this.ctx.resume();

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(65, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(32, this.ctx.currentTime + 1.2);

      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 1.4);
    } catch (e) {
      console.warn(e);
    }
  }
}

export const soundEngine = new AbyssalAudioEngine();
