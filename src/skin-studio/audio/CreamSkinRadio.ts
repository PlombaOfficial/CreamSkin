export class CreamSkinRadio {
  private audioElement: HTMLAudioElement | null = null;
  private isPlaying = false;
  private isMuted = false;
  private volume = 0.45;
  private hasInteracted = false;

  constructor() {
    try {
      const savedVol = localStorage.getItem('creamskin_radio_vol');
      if (savedVol) this.volume = parseFloat(savedVol);
      const savedMute = localStorage.getItem('creamskin_radio_mute');
      if (savedMute) this.isMuted = savedMute === 'true';
    } catch {}

    if (typeof window !== 'undefined') {
      this.audioElement = new Audio();
      this.audioElement.src = './audio/music.mp3';
      this.audioElement.loop = true;
      this.audioElement.volume = this.isMuted ? 0 : this.volume;

      this.audioElement.addEventListener('play', () => {
        this.isPlaying = true;
      });

      this.audioElement.addEventListener('pause', () => {
        this.isPlaying = false;
      });

      this.audioElement.addEventListener('error', () => {
        if (this.audioElement && this.audioElement.src.includes('music.mp3')) {
          this.audioElement.src = './audio/музыка.mp3';
        }
      });

      const startOnFirstGesture = () => {
        if (this.hasInteracted) return;
        this.hasInteracted = true;
        if (!this.isMuted && !this.isPlaying) {
          this.play();
        }
        window.removeEventListener('click', startOnFirstGesture);
        window.removeEventListener('keydown', startOnFirstGesture);
        window.removeEventListener('touchstart', startOnFirstGesture);
      };

      window.addEventListener('click', startOnFirstGesture);
      window.addEventListener('keydown', startOnFirstGesture);
      window.addEventListener('touchstart', startOnFirstGesture);
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
          .catch(() => {
            this.isPlaying = false;
          });
      }
      return true;
    }
  }

  public play() {
    if (!this.audioElement) return;
    this.audioElement.volume = this.isMuted ? 0 : this.volume;
    const p = this.audioElement.play();
    if (p !== undefined) {
      p.then(() => {
        this.isPlaying = true;
      }).catch(() => {});
    }
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
    localStorage.setItem('creamskin_radio_mute', this.isMuted.toString());

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
