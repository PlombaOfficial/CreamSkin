/**
 * THE BACKROOMS // PROCEDURAL WEB AUDIO SOUNDSCAPE
 * Continuous 60Hz fluorescent hum, footsteps, sanity heartbeat,
 * flashlight clicks, and entity screams with zero external audio files.
 */

export class BackroomsAudioEngine {
  constructor() {
    this.ctx = null;
    this.isInitialized = false;
    this.masterGain = null;
    this.humGain = null;
    this.heartbeatGain = null;
    this.heartbeatOsc = null;
    this.isHeartbeatPlaying = false;
  }

  init() {
    if (this.isInitialized) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContextClass();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.75, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    // Continuous 60Hz Fluorescent Lamp Hum
    this.startFluorescentHum();

    this.isInitialized = true;
  }

  startFluorescentHum() {
    const now = this.ctx.currentTime;
    this.humGain = this.ctx.createGain();
    this.humGain.gain.setValueAtTime(0.08, now);

    // Fundamental 60Hz + Harmonics (120Hz, 180Hz)
    [60, 120, 180].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();

      osc.type = idx === 0 ? 'sine' : 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);

      // Random slow pitch detune for realistic flickering
      osc.detune.setValueAtTime((Math.random() - 0.5) * 8, now);

      oscGain.gain.setValueAtTime(idx === 0 ? 0.6 : 0.2, now);
      osc.connect(oscGain);
      oscGain.connect(this.humGain);
      osc.start();
    });

    this.humGain.connect(this.masterGain);
  }

  playFootstep(surface = 'carpet') {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(surface === 'carpet' ? 85 : 160, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.08);

    gain.gain.setValueAtTime(surface === 'carpet' ? 0.18 : 0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  playFlashlightClick() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.06);
  }

  playAlmondWater() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Gulp / Refresh harmonic chime
    [523.25, 659.25, 783.99].forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = now + i * 0.12;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, t);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.55);
    });
  }

  playSmilerRoar() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Glitchy screeching drone
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.6);

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.75);
  }

  playElevatorChime() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 1.2);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.3);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 1.4);
  }

  updateSanityHeartbeat(sanity) {
    if (!this.ctx) return;

    if (sanity < 40 && !this.isHeartbeatPlaying) {
      this.isHeartbeatPlaying = true;
      this.heartbeatInterval = setInterval(() => {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(65, now);
        osc.frequency.exponentialRampToValueAtTime(35, now + 0.12);

        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 0.16);
      }, Math.max(450, sanity * 15));
    } else if (sanity >= 40 && this.isHeartbeatPlaying) {
      this.isHeartbeatPlaying = false;
      clearInterval(this.heartbeatInterval);
    }
  }
}
