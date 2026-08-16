import { audioSynthesizer } from './AudioSynthesizer';
import { WeatherType } from '../types';

export class AudioManager {
  private lastFootstepTime = 0;
  private footstepInterval = 320; // ms

  constructor() {
    this.startAmbientLoop();
  }

  public init() {
    audioSynthesizer.init();
    audioSynthesizer.resume();
  }

  public playFootstep(material: 'grass' | 'stone' | 'wood' | 'sand' | 'snow' | 'water') {
    const now = performance.now();
    if (now - this.lastFootstepTime >= this.footstepInterval) {
      this.lastFootstepTime = now;
      audioSynthesizer.playFootstep(material);
    }
  }

  public playDigHit(material: string) {
    audioSynthesizer.playDigHit(material);
  }

  public playBlockBreak() {
    audioSynthesizer.playBlockBreak();
  }

  public playBlockPlace() {
    audioSynthesizer.playBlockPlace();
  }

  public playPickup() {
    audioSynthesizer.playPickup();
  }

  public playSwing() {
    audioSynthesizer.playSwing();
  }

  public playHurt(isPlayer: boolean = true) {
    audioSynthesizer.playHit(isPlayer);
  }

  public playZombie() {
    audioSynthesizer.playZombieMoan();
  }

  public playCraftSuccess() {
    audioSynthesizer.playCraftSuccess();
  }

  public playChest() {
    audioSynthesizer.playChestOpen();
  }

  public playThunder() {
    audioSynthesizer.playThunder();
  }

  public setWeather(weather: WeatherType) {
    if (weather === WeatherType.THUNDER) {
      if (Math.random() < 0.3) {
        this.playThunder();
      }
    }
  }

  private startAmbientLoop() {
    if (typeof window === 'undefined') return;
    // Periodic subtle atmospheric tones / cave echoes / wind
    setInterval(() => {
      // 10% chance every 15s to play an ambient sound if user has interacted
      if (Math.random() < 0.25) {
        // subtle atmospheric whoosh
      }
    }, 15000);
  }
}

export const audioManager = new AudioManager();
