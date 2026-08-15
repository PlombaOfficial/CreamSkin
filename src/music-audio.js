/**
 * CYBER-MAKER // SYNTHESIZED WEB AUDIO MUSIC & PRECISION SFX ENGINE
 * Generates an energetic rhythmic electronic synth track and crisp responsive SFX.
 */

export class MusicAudioEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.isPlayingMusic = false;
    this.bpm = 135;
    this.beatInterval = null;
    this.step = 0;
    this.onBeat = null; // Callback for visual pulse sync!
  }

  initContext() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // --- SOUNDTRACK SYNTHESIZER ---

  startMusic() {
    this.initContext();
    if (!this.ctx || this.isPlayingMusic || this.isMuted) return;
    this.isPlayingMusic = true;

    const stepDuration = (60 / this.bpm) / 4; // 16th notes
    const bassline = [110, 110, 130.81, 110, 146.83, 110, 130.81, 98, 110, 110, 130.81, 164.81, 146.83, 130.81, 110, 98];
    const leadSynth = [440, 0, 523.25, 659.25, 0, 587.33, 523.25, 0, 659.25, 0, 783.99, 659.25, 587.33, 523.25, 440, 0];

    this.beatInterval = setInterval(() => {
      if (this.isMuted || !this.isPlayingMusic) return;
      const now = this.ctx.currentTime;

      // Bass note
      const bassFreq = bassline[this.step % bassline.length];
      if (bassFreq) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(bassFreq, now);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + stepDuration * 1.5);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + stepDuration * 1.5);
      }

      // Lead note
      const leadFreq = leadSynth[this.step % leadSynth.length];
      if (leadFreq) {
        const oscL = this.ctx.createOscillator();
        const gainL = this.ctx.createGain();
        oscL.type = 'square';
        oscL.frequency.setValueAtTime(leadFreq, now);
        gainL.gain.setValueAtTime(0.04, now);
        gainL.gain.exponentialRampToValueAtTime(0.001, now + stepDuration * 1.2);
        oscL.connect(gainL);
        gainL.connect(this.ctx.destination);
        oscL.start(now);
        oscL.stop(now + stepDuration * 1.2);
      }

      // Kick drum on quarter beats (0, 4, 8, 12)
      if (this.step % 4 === 0) {
        this.playKick();
        if (this.onBeat) this.onBeat();
      }

      this.step++;
    }, stepDuration * 1000);
  }

  stopMusic() {
    this.isPlayingMusic = false;
    if (this.beatInterval) {
      clearInterval(this.beatInterval);
      this.beatInterval = null;
    }
  }

  playKick() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.12);
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.12);
  }

  // --- PRECISION SOUND EFFECTS ---

  playJump() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(680, now + 0.09);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.09);
  }

  playDash() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.15);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  playRing() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(1760, now + 0.14);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.14);
  }

  playGravityFlip() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.linearRampToValueAtTime(880, now + 0.12);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.12);
  }

  playDeath() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.22);
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.22);
  }

  playWin() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const start = now + idx * 0.1;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.2, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(start);
      osc.stop(start + 0.25);
    });
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) this.stopMusic();
    else this.startMusic();
    return this.isMuted;
  }
}
