/**
 * Dedicated Music Player for public/audio/music.mp3
 * Simple, reliable, zero-bloat audio player.
 */

export class CreamSkinRadio {
  private audioElement: HTMLAudioElement | null = null;
  private isPlaying = false;
  private isMuted = false;
  private volume = 0.5;

  constructor() {
    try {
      const savedVol = localStorage.getItem('creamskin_radio_vol');
      if (savedVol) this.volume = parseFloat(savedVol);
    } catch {}

    if (typeof window !== 'undefined') {
      this.audioElement = new Audio();
      this.audioElement.src = './audio/music.mp3';
      this.audioElement.loop = true;
      this.audioElement.volume = this.volume;

      this.audioElement.addEventListener('play', () => {
        this.isPlaying = true;
      });

      this.audioElement.addEventListener('pause', () => {
        this.isPlaying = false;
      });

      this.audioElement.addEventListener('error', () => {
        // Try fallback to russian name or relative without ./
        if (this.audioElement && this.audioElement.src.includes('music.mp3')) {
          this.audioElement.src = './audio/музыка.mp3';
        }
      });
    }
  }

  public togglePlay(): boolean {
    if (!this.audioElement) return false;

    if (this.isPlaying) {
      this.audioElement.pause();
      this.isPlaying = false;
      return false;
    } else {
      this.audioElement.volume = this.isMuted ? 0 : this.volume;
      const playPromise = this.audioElement.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            this.isPlaying = true;
          })
          .catch((err) => {
            console.warn('Audio playback waiting for user interaction or file not found:', err);
            this.isPlaying = false;
          });
      }
      return true;
    }
  }

  public play() {
    if (!this.audioElement) return;
    this.audioElement.volume = this.isMuted ? 0 : this.volume;
    this.audioElement.play().catch(() => {});
    this.isPlaying = true;
  }

  public pause() {
    if (!this.audioElement) return;
    this.audioElement.pause();
    this.isPlaying = false;
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    localStorage.setItem('creamskin_radio_vol', this.volume.toString());

    if (this.audioElement) {
      this.audioElement.volume = this.isMuted ? 0 : this.volume;
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.audioElement) {
      this.audioElement.volume = this.isMuted ? 0 : this.volume;
    }
    return this.isMuted;
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
}

export const creamSkinRadio = new CreamSkinRadio();
