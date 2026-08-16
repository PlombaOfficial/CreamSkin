import { WeatherType } from '../types';

export interface RainParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  life: number;
}

export interface SplashParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

export class WeatherEngine {
  // Day / Night Cycle (Day length = 24000 ticks, ~20 mins, 1200 ticks/min)
  public timeOfDay: number = 6000; // 0 = dawn, 6000 = noon, 12000 = sunset, 18000 = midnight
  public dayCount: number = 1;
  public weather: WeatherType = WeatherType.CLEAR;
  public weatherTimer: number = 3600; // ticks until next weather change

  public rainParticles: RainParticle[] = [];
  public splashParticles: SplashParticle[] = [];
  public lightningFlash: number = 0; // 0 to 1 intensity

  private maxRainParticles = 250;

  constructor() {}

  public update(dt: number, cameraX: number, cameraY: number, viewW: number, viewH: number) {
    // 1. Progress time of day (1 second = 20 ticks in standard rate)
    this.timeOfDay = (this.timeOfDay + dt * 20) % 24000;

    // 2. Weather transition timer
    this.weatherTimer -= dt * 20;
    if (this.weatherTimer <= 0) {
      this.weatherTimer = 6000 + Math.random() * 8000; // 5-10 mins
      const r = Math.random();
      if (r < 0.6) this.weather = WeatherType.CLEAR;
      else if (r < 0.8) this.weather = WeatherType.OVERCAST;
      else if (r < 0.95) this.weather = WeatherType.RAIN;
      else this.weather = WeatherType.THUNDER;
    }

    // 3. Lightning in thunderstorm
    if (this.weather === WeatherType.THUNDER) {
      if (Math.random() < 0.003) {
        this.lightningFlash = 1.0;
      }
    }
    if (this.lightningFlash > 0) {
      this.lightningFlash = Math.max(0, this.lightningFlash - dt * 4.0);
    }

    // 4. Update rain particles if raining or thunder
    const isRaining = this.weather === WeatherType.RAIN || this.weather === WeatherType.THUNDER;
    if (isRaining) {
      // Spawn new rain drops around camera
      const spawnCount = Math.min(6, this.maxRainParticles - this.rainParticles.length);
      for (let i = 0; i < spawnCount; i++) {
        this.rainParticles.push({
          x: cameraX - viewW / 2 + Math.random() * (viewW + 200) - 100,
          y: cameraY - viewH / 2 - 20 - Math.random() * 100,
          vx: -1.5 + (Math.random() - 0.5) * 0.5,
          vy: 14 + Math.random() * 4,
          length: 10 + Math.random() * 6,
          life: 1.0,
        });
      }
    }

    // Update existing rain particles
    for (let i = this.rainParticles.length - 1; i >= 0; i--) {
      const p = this.rainParticles[i];
      p.x += p.vx;
      p.y += p.vy;

      // Despawn if out of camera bounds
      if (p.y > cameraY + viewH / 2 + 50) {
        // Spawn splash at ground hit
        if (this.splashParticles.length < 100 && Math.random() < 0.4) {
          this.splashParticles.push({
            x: p.x,
            y: p.y,
            vx: (Math.random() - 0.5) * 3,
            vy: -1.5 - Math.random() * 2,
            life: 0,
            maxLife: 0.15 + Math.random() * 0.1,
          });
        }
        this.rainParticles.splice(i, 1);
      }
    }

    // Update splashes
    for (let i = this.splashParticles.length - 1; i >= 0; i--) {
      const sp = this.splashParticles[i];
      sp.life += dt;
      sp.x += sp.vx;
      sp.y += sp.vy;
      sp.vy += 9.8 * dt; // gravity
      if (sp.life >= sp.maxLife) {
        this.splashParticles.splice(i, 1);
      }
    }
  }

  /**
   * Sky color interpolated based on time of day and weather
   */
  public getSkyColor(): { top: string; bottom: string; ambientLight: number } {
    // 0 = Dawn, 6000 = Noon, 12000 = Sunset, 18000 = Midnight
    let ambient = 1.0;
    let top = '#70a5ff';
    let bottom = '#c6dbff';

    const t = this.timeOfDay;

    if (t < 2000) {
      // Dawn / Sunrise (orange/pink glow)
      const f = t / 2000;
      top = '#5a78c8';
      bottom = '#ff9966';
      ambient = 0.5 + f * 0.5;
    } else if (t < 10000) {
      // Full Day (Bright cyan/blue)
      top = '#68a1f8';
      bottom = '#bde3ff';
      ambient = 1.0;
    } else if (t < 13000) {
      // Sunset (Deep purple/amber)
      const f = (t - 10000) / 3000;
      top = '#423774';
      bottom = '#e65c40';
      ambient = 1.0 - f * 0.6;
    } else {
      // Night (Deep dark navy with stars)
      top = '#090b14';
      bottom = '#151928';
      ambient = 0.35;
    }

    // Weather modifications
    if (this.weather === WeatherType.OVERCAST) {
      top = '#5c6470';
      bottom = '#8a94a2';
      ambient *= 0.75;
    } else if (this.weather === WeatherType.RAIN || this.weather === WeatherType.THUNDER) {
      top = '#2d3340';
      bottom = '#4a5364';
      ambient *= 0.6;
    }

    if (this.lightningFlash > 0) {
      ambient = Math.min(1.0, ambient + this.lightningFlash * 0.8);
      top = '#d6e8ff';
      bottom = '#ffffff';
    }

    return { top, bottom, ambientLight: ambient };
  }
}
