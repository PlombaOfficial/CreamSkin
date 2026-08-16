export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  gravity?: number;
  isXp?: boolean;
}

export class ParticleSystem {
  public particles: Particle[] = [];
  private readonly maxParticles = 350;

  public spawnBlockDebris(x: number, y: number, color: string, count: number = 8) {
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;
      this.particles.push({
        x: x + (Math.random() - 0.5) * 0.8,
        y: y + (Math.random() - 0.5) * 0.8,
        vx: (Math.random() - 0.5) * 6,
        vy: 2 + Math.random() * 5,
        color,
        size: 2 + Math.random() * 2,
        life: 0,
        maxLife: 0.4 + Math.random() * 0.3,
        gravity: -20,
      });
    }
  }

  public spawnSpark(x: number, y: number) {
    if (this.particles.length >= this.maxParticles) return;
    this.particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 1.5,
      vy: 1.5 + Math.random() * 2.0,
      color: '#ffaa00',
      size: 2,
      life: 0,
      maxLife: 0.6 + Math.random() * 0.4,
      gravity: -2,
    });
  }

  public spawnCrit(x: number, y: number) {
    for (let i = 0; i < 6; i++) {
      if (this.particles.length >= this.maxParticles) break;
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 7,
        vy: (Math.random() - 0.5) * 7,
        color: '#ffee33',
        size: 3,
        life: 0,
        maxLife: 0.35,
        gravity: 0,
      });
    }
  }

  public update(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.gravity) {
        p.vy += p.gravity * dt;
      }

      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
      }
    }
  }
}
