export interface PlaylistItem {
  id: string;
  title: string;
  artist: string;
  src: string;
}

export const PLAYLIST: PlaylistItem[] = [
  {
    id: 'track_custom',
    title: 'Custom Track (public/audio/music.mp3)',
    artist: 'CreamSkin Radio',
    src: './audio/music.mp3',
  },
  {
    id: 'track_custom_alt',
    title: 'Track 1 (public/audio/track1.mp3)',
    artist: 'CreamSkin Radio',
    src: './audio/track1.mp3',
  },
  {
    id: 'synth_subwoofer',
    title: 'Subwoofer Lullaby (Ambient)',
    artist: 'CreamSkin Ambient',
    src: '',
  },
  {
    id: 'synth_sunrise',
    title: 'Cubic Sunrise (Ambient)',
    artist: 'CreamSkin Ambient',
    src: '',
  },
];

export class CreamSkinRadio {
  private audioElement: HTMLAudioElement | null = null;
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isPlaying = false;
  private isMuted = false;
  private volume = 0.5;
  private currentTrackIdx = 0;
  private intervalId: any = null;
  private noteStep = 0;
  private isAudioFileActive = false;
  private customBlobUrl: string | null = null;

  constructor() {
    try {
      const savedVol = localStorage.getItem('creamskin_radio_vol');
      if (savedVol) this.volume = parseFloat(savedVol);
      const savedIdx = localStorage.getItem('creamskin_radio_track_idx');
      if (savedIdx) {
        const idx = parseInt(savedIdx, 10);
        if (!isNaN(idx) && idx >= 0 && idx < PLAYLIST.length) {
          this.currentTrackIdx = idx;
        }
      }
    } catch {}

    if (typeof window !== 'undefined') {
      this.audioElement = new Audio();
      this.audioElement.loop = true;
      this.audioElement.volume = this.volume;

      this.audioElement.addEventListener('error', () => {
        this.isAudioFileActive = false;
        // Fallback to procedural synth if file path 404s
        if (this.isPlaying) {
          this.startProceduralSynth();
        }
      });

      this.audioElement.addEventListener('playing', () => {
        this.isAudioFileActive = true;
        this.stopProceduralSynth();
      });
    }
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
    this.isPlaying = true;
    const track = PLAYLIST[this.currentTrackIdx];
    const targetSrc = this.customBlobUrl || track.src;

    if (targetSrc && this.audioElement) {
      this.audioElement.src = targetSrc;
      this.audioElement.volume = this.isMuted ? 0 : this.volume;

      const playPromise = this.audioElement.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            this.isAudioFileActive = true;
            this.stopProceduralSynth();
          })
          .catch(() => {
            this.isAudioFileActive = false;
            this.startProceduralSynth();
          });
        return;
      }
    }

    this.startProceduralSynth();
  }

  public pause() {
    this.isPlaying = false;
    if (this.audioElement) {
      this.audioElement.pause();
    }
    this.stopProceduralSynth();
  }

  /**
   * Load any local MP3/WAV/OGG directly from user's disk
   */
  public loadCustomFile(file: File) {
    if (this.customBlobUrl) {
      URL.revokeObjectURL(this.customBlobUrl);
    }
    this.customBlobUrl = URL.createObjectURL(file);
    PLAYLIST[0].title = file.name.replace(/\.[^/.]+$/, '');
    this.currentTrackIdx = 0;

    if (this.audioElement) {
      this.audioElement.src = this.customBlobUrl;
      if (this.isPlaying) {
        this.play();
      }
    }
  }

  public nextTrack(): PlaylistItem {
    this.currentTrackIdx = (this.currentTrackIdx + 1) % PLAYLIST.length;
    localStorage.setItem('creamskin_radio_track_idx', this.currentTrackIdx.toString());
    if (this.isPlaying) {
      this.pause();
      this.play();
    }
    return PLAYLIST[this.currentTrackIdx];
  }

  public prevTrack(): PlaylistItem {
    this.currentTrackIdx = (this.currentTrackIdx - 1 + PLAYLIST.length) % PLAYLIST.length;
    localStorage.setItem('creamskin_radio_track_idx', this.currentTrackIdx.toString());
    if (this.isPlaying) {
      this.pause();
      this.play();
    }
    return PLAYLIST[this.currentTrackIdx];
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    localStorage.setItem('creamskin_radio_vol', this.volume.toString());

    if (this.audioElement) {
      this.audioElement.volume = this.isMuted ? 0 : this.volume;
    }
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setValueAtTime(this.volume * 0.35, this.ctx.currentTime);
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.audioElement) {
      this.audioElement.volume = this.isMuted ? 0 : this.volume;
    }
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume * 0.35, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  public getCurrentTrack(): PlaylistItem {
    return PLAYLIST[this.currentTrackIdx];
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

  private startProceduralSynth() {
    this.initContext();
    if (!this.ctx) return;

    this.noteStep = 0;
    if (this.intervalId) clearInterval(this.intervalId);

    const beatIntervalMs = (60 / 68) * 1000;
    this.playStep();
    this.intervalId = setInterval(() => {
      if (this.isPlaying && !this.isAudioFileActive) this.playStep();
    }, beatIntervalMs);
  }

  private stopProceduralSynth() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private playStep() {
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const chords = [
      [261.63, 329.63, 392.0, 523.25],
      [220.0, 261.63, 329.63, 392.0],
      [174.61, 220.0, 261.63, 349.23],
      [196.0, 246.94, 293.66, 392.0],
    ];

    const chordIdx = Math.floor((this.noteStep / 4) % chords.length);
    const chord = chords[chordIdx];

    if (this.noteStep % 4 === 0) {
      chord.forEach((freq, i) => {
        this.playSoftSine(freq, t, 3.5, 0.08 / (i + 1));
      });
    }

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
