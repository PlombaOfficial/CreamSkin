import { AudioTrack } from '../types';

export const RADIO_TRACKS: AudioTrack[] = [
  { id: 'track_1', title: 'Subwoofer Lullaby', artist: 'CreamSkin Ambient', bpm: 68, genre: 'Mellow Ambient' },
  { id: 'track_2', title: 'Cubic Sunrise', artist: 'CreamSkin Ambient', bpm: 72, genre: 'Atmospheric Lo-Fi' },
  { id: 'track_3', title: 'Deepslate Drift', artist: 'CreamSkin Ambient', bpm: 60, genre: 'Deep Chill' },
  { id: 'track_4', title: 'Pixel Rain', artist: 'CreamSkin Ambient', bpm: 64, genre: 'Cozy Synth' },
];

export class CreamSkinRadio {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private isMuted = false;
  private volume = 0.5;
  private currentTrackIdx = 0;
  private intervalId: any = null;
  private masterGain: GainNode | null = null;

  private noteStep = 0;

  constructor() {
    try {
      const savedVol = localStorage.getItem('creamskin_radio_vol');
      if (savedVol) this.volume = parseFloat(savedVol);
      const savedTrack = localStorage.getItem('creamskin_radio_track');
      if (savedTrack) {
        const idx = RADIO_TRACKS.findIndex((t) => t.id === savedTrack);
        if (idx >= 0) this.currentTrackIdx = idx;
      }
    } catch {}
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume * 0.35, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public togglePlay(): boolean {
    if (this.isPlaying) {
      this.pause();
      return false;
    } else {
      this.play();
      return true;
    }
  }

  public play() {
    this.initContext();
    if (!this.ctx) return;

    this.isPlaying = true;
    this.noteStep = 0;

    if (this.intervalId) clearInterval(this.intervalId);

    const track = RADIO_TRACKS[this.currentTrackIdx];
    const beatIntervalMs = (60 / track.bpm) * 1000;

    this.playStep();
    this.intervalId = setInterval(() => {
      if (this.isPlaying) this.playStep();
    }, beatIntervalMs);
  }

  public pause() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  public nextTrack(): AudioTrack {
    this.currentTrackIdx = (this.currentTrackIdx + 1) % RADIO_TRACKS.length;
    localStorage.setItem('creamskin_radio_track', RADIO_TRACKS[this.currentTrackIdx].id);
    if (this.isPlaying) {
      this.pause();
      this.play();
    }
    return RADIO_TRACKS[this.currentTrackIdx];
  }

  public prevTrack(): AudioTrack {
    this.currentTrackIdx = (this.currentTrackIdx - 1 + RADIO_TRACKS.length) % RADIO_TRACKS.length;
    localStorage.setItem('creamskin_radio_track', RADIO_TRACKS[this.currentTrackIdx].id);
    if (this.isPlaying) {
      this.pause();
      this.play();
    }
    return RADIO_TRACKS[this.currentTrackIdx];
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    localStorage.setItem('creamskin_radio_vol', this.volume.toString());
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setValueAtTime(this.volume * 0.35, this.ctx.currentTime);
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume * 0.35, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  public getCurrentTrack(): AudioTrack {
    return RADIO_TRACKS[this.currentTrackIdx];
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public getVolume(): number {
    return this.volume;
  }

  private playStep() {
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;

    // Pentatonic chord palettes (C, G, Am, F progressions)
    const chords = [
      [261.63, 329.63, 392.0, 523.25], // Cmaj7
      [220.0, 261.63, 329.63, 392.0],  // Am7
      [174.61, 220.0, 261.63, 349.23], // Fmaj7
      [196.0, 246.94, 293.66, 392.0],  // G
    ];

    const chordIdx = Math.floor((this.noteStep / 4) % chords.length);
    const chord = chords[chordIdx];

    // Every 4 beats: play soft ambient pad chord
    if (this.noteStep % 4 === 0) {
      chord.forEach((freq, i) => {
        this.playSoftSine(freq, t, 3.5, 0.08 / (i + 1));
      });
    }

    // Melodic kalimba plucks
    if (this.noteStep % 2 === 0 || Math.random() > 0.4) {
      const melodyFreq = chord[Math.floor(Math.random() * chord.length)] * (Math.random() > 0.5 ? 2 : 1);
      this.playKalimba(melodyFreq, t, 0.12);
    }

    this.noteStep = (this.noteStep + 1) % 64;
  }

  private playSoftSine(freq: number, startTime: number, duration: number, gainAmt: number) {
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.exponentialRampToValueAtTime(gainAmt, startTime + 0.8);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  private playKalimba(freq: number, startTime: number, gainAmt: number) {
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(gainAmt, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 1.2);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(startTime);
    osc.stop(startTime + 1.2);
  }
}

export const creamSkinRadio = new CreamSkinRadio();
