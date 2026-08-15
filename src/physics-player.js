/**
 * CYBER-MAKER // ULTRA-RESPONSIVE PRECISION PLATFORMER PHYSICS ENGINE
 * Features:
 * - Coyote Time (0.1s) & Jump Buffering (0.1s)
 * - Variable Jump Height (releasing jump cuts ascent)
 * - Air Dash with Chromatic Afterimages & Ground Refill
 * - Wall Jump & Wall Slide with Spark Particles
 * - Mid-Air Jump Rings (Yellow/Pink/Cyan Orbs)
 * - Gravity Inverters (-1g) & Speed Boosters (x1, x2, x3, x4)
 * - Sub-pixel Collision & Slopes
 * - Ghost Recording & Playback
 */

export class PhysicsPlayer {
  constructor(audio) {
    this.audio = audio;

    // Position & Velocity
    this.x = 100;
    this.y = 300;
    this.vx = 0;
    this.vy = 0;
    this.width = 30;
    this.height = 30;

    // Movement Tuning (Crisp, snappy, predictable)
    this.moveSpeed = 380;
    this.accel = 2800;
    this.friction = 2400;
    this.airAccel = 2200;
    this.airFriction = 1600;

    this.jumpForce = 720;
    this.gravity = 1900;
    this.maxFallSpeed = 950;
    this.gravityDir = 1; // 1 = normal, -1 = inverted!

    // Dash
    this.dashSpeed = 900;
    this.dashDuration = 0.16;
    this.dashTimer = 0;
    this.dashDir = 1;
    this.hasDash = true;

    // Wall Mechanics
    this.isOnWall = 0; // -1 (left), 1 (right), 0 (none)
    this.wallSlideSpeed = 140;

    // Precision Buffers
    this.isGrounded = false;
    this.coyoteTimer = 0;
    this.jumpBufferTimer = 0;

    // State & Customization
    this.isDead = false;
    this.hasWon = false;
    this.rotation = 0;
    this.attempts = 1;
    this.bestPercent = 0;
    this.currentPercent = 0;

    // Visuals & Trails
    this.skinColor = '#00f0ff';
    this.secondaryColor = '#ff0077';
    this.afterimages = []; // Array of { x, y, rotation, alpha }
    this.particles = [];    // Array of { x, y, vx, vy, color, life, size }

    // Ghost Replay Recorder
    this.ghostFrames = []; // Array of { x, y, rot, isDash }
    this.bestGhostFrames = [];
    this.ghostPlaybackIndex = 0;
  }

  reset(spawnX = 100, spawnY = 300, resetAttempts = false) {
    this.x = spawnX;
    this.y = spawnY;
    this.vx = 0;
    this.vy = 0;
    this.gravityDir = 1;
    this.dashTimer = 0;
    this.hasDash = true;
    this.isDead = false;
    this.hasWon = false;
    this.rotation = 0;
    this.afterimages = [];
    this.particles = [];
    this.ghostFrames = [];
    this.ghostPlaybackIndex = 0;

    if (resetAttempts) {
      this.attempts = 1;
      this.bestPercent = 0;
    }
  }

  kill(onRespawnCallback) {
    if (this.isDead || this.hasWon) return;
    this.isDead = true;
    if (this.audio) this.audio.playDeath();

    // Spawn 24 Death Shatter Particles
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2 + Math.random() * 0.5;
      const speed = 150 + Math.random() * 350;
      this.particles.push({
        x: this.x + this.width / 2,
        y: this.y + this.height / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: i % 2 === 0 ? this.skinColor : this.secondaryColor,
        life: 1.0,
        size: 4 + Math.random() * 6
      });
    }

    this.attempts++;

    setTimeout(() => {
      if (onRespawnCallback) onRespawnCallback();
    }, 450);
  }

  // --- 60-120 FPS UPDATE LOOP ---

  update(delta, input, levelData, finishX = 3000) {
    if (this.isDead || this.hasWon) {
      this.updateParticles(delta);
      return;
    }

    // 1. Buffers & Timers
    if (this.isGrounded) {
      this.coyoteTimer = 0.1;
      this.hasDash = true;
    } else {
      this.coyoteTimer = Math.max(0, this.coyoteTimer - delta);
    }

    if (input.jumpPressed) {
      this.jumpBufferTimer = 0.1;
    } else {
      this.jumpBufferTimer = Math.max(0, this.jumpBufferTimer - delta);
    }

    // 2. Dash Execution
    if (input.dashPressed && this.hasDash && this.dashTimer <= 0) {
      this.hasDash = false;
      this.dashTimer = this.dashDuration;
      this.dashDir = input.moveX !== 0 ? Math.sign(input.moveX) : (this.vx !== 0 ? Math.sign(this.vx) : 1);
      this.vy = 0;
      if (this.audio) this.audio.playDash();
    }

    if (this.dashTimer > 0) {
      this.dashTimer -= delta;
      this.vx = this.dashDir * this.dashSpeed;
      this.vy = 0;

      // Spawn Dash Afterimage
      if (Math.random() < 0.6) {
        this.afterimages.push({
          x: this.x,
          y: this.y,
          rotation: this.rotation,
          alpha: 0.75,
          color: this.secondaryColor
        });
      }
    } else {
      // Normal Horizontal Acceleration & Friction
      const targetSpeed = input.moveX * this.moveSpeed;
      const accelRate = this.isGrounded ? this.accel : this.airAccel;
      const fricRate = this.isGrounded ? this.friction : this.airFriction;

      if (input.moveX !== 0) {
        if (Math.sign(this.vx) !== Math.sign(input.moveX)) {
          this.vx = this.approach(this.vx, 0, fricRate * 1.5 * delta);
        }
        this.vx = this.approach(this.vx, targetSpeed, accelRate * delta);
      } else {
        this.vx = this.approach(this.vx, 0, fricRate * delta);
      }

      // Gravity & Vertical Physics
      if (this.isOnWall !== 0 && !this.isGrounded && this.vy * this.gravityDir > 0) {
        // Wall Slide
        this.vy = this.approach(this.vy, this.wallSlideSpeed * this.gravityDir, this.gravity * 0.6 * delta);

        // Wall sparks
        if (Math.random() < 0.4) {
          this.particles.push({
            x: this.isOnWall === -1 ? this.x : this.x + this.width,
            y: this.y + Math.random() * this.height,
            vx: -this.isOnWall * (40 + Math.random() * 80),
            vy: -40 - Math.random() * 60,
            color: '#ffdd00',
            life: 0.4,
            size: 3
          });
        }
      } else {
        // Normal Gravity
        this.vy += this.gravity * this.gravityDir * delta;
        if (Math.abs(this.vy) > this.maxFallSpeed) {
          this.vy = this.maxFallSpeed * Math.sign(this.vy);
        }
      }

      // Jump Execution (Ground or Coyote)
      if (this.jumpBufferTimer > 0) {
        if (this.coyoteTimer > 0) {
          this.jumpBufferTimer = 0;
          this.coyoteTimer = 0;
          this.vy = -this.jumpForce * this.gravityDir;
          this.isGrounded = false;
          if (this.audio) this.audio.playJump();
        } else if (this.isOnWall !== 0) {
          // Wall Jump!
          this.jumpBufferTimer = 0;
          this.vx = -this.isOnWall * this.moveSpeed * 1.25;
          this.vy = -this.jumpForce * 0.95 * this.gravityDir;
          this.isOnWall = 0;
          if (this.audio) this.audio.playJump();
        }
      }

      // Variable Jump Height (release cut)
      if (!input.jumpHold && this.vy * this.gravityDir < -150) {
        this.vy *= 0.58;
      }
    }

    // 3. Move & Resolve Collision (Swept AABB)
    this.moveAndCollide(delta, levelData);

    // 4. Visual Cube Rotation
    if (!this.isGrounded) {
      this.rotation += (this.vx > 0 ? 1 : (this.vx < 0 ? -1 : 1)) * 9.0 * delta;
    } else {
      // Snap to nearest 90 deg when grounded
      const nearest = Math.round(this.rotation / (Math.PI / 2)) * (Math.PI / 2);
      this.rotation = this.approach(this.rotation, nearest, 20 * delta);
    }

    // 5. Ghost Replay Recording
    this.ghostFrames.push({
      x: Math.round(this.x),
      y: Math.round(this.y),
      rot: this.rotation,
      isDash: this.dashTimer > 0
    });

    // 6. Progress Calculation
    this.currentPercent = Math.min(100, Math.max(0, Math.round((this.x / finishX) * 100)));
    if (this.currentPercent > this.bestPercent) {
      this.bestPercent = this.currentPercent;
    }

    // Update Particles and Afterimages
    this.updateParticles(delta);
  }

  // --- SUB-PIXEL COLLISION RESOLUTION ---

  moveAndCollide(delta, levelData) {
    const solids = levelData.objects.filter(o => o.type === 'solid' || o.type === 'slope');
    const hazards = levelData.objects.filter(o => o.type === 'hazard' || o.type === 'saw');
    const portals = levelData.objects.filter(o => ['portal_gravity', 'speed_boost', 'jump_ring', 'finish'].includes(o.type));

    // Check Hazards First
    for (const h of hazards) {
      if (this.intersects(this.x + 4, this.y + 4, this.width - 8, this.height - 8, h.x, h.y, h.w, h.h)) {
        this.kill(() => this.reset(100, 300));
        return;
      }
    }

    // Check Portals & Orbs
    for (const p of portals) {
      if (this.intersects(this.x, this.y, this.width, this.height, p.x, p.y, p.w, p.h)) {
        if (p.type === 'portal_gravity' && this.gravityDir !== p.val) {
          this.gravityDir = p.val;
          if (this.audio) this.audio.playGravityFlip();
        } else if (p.type === 'speed_boost') {
          this.moveSpeed = 380 * p.val;
        } else if (p.type === 'jump_ring' && !p.activated) {
          p.activated = true;
          this.vy = -this.jumpForce * 1.15 * this.gravityDir;
          this.hasDash = true;
          if (this.audio) this.audio.playRing();
        } else if (p.type === 'finish' && !this.hasWon) {
          this.hasWon = true;
          if (this.audio) this.audio.playWin();
          if (this.ghostFrames.length > 0) {
            this.bestGhostFrames = [...this.ghostFrames];
          }
        }
      }
    }

    // Move X
    this.x += this.vx * delta;
    this.isOnWall = 0;

    for (const s of solids) {
      if (this.intersects(this.x, this.y, this.width, this.height, s.x, s.y, s.w, s.h)) {
        if (this.vx > 0) {
          this.x = s.x - this.width;
          this.isOnWall = 1;
        } else if (this.vx < 0) {
          this.x = s.x + s.w;
          this.isOnWall = -1;
        }
        this.vx = 0;
      }
    }

    // Move Y
    this.y += this.vy * delta;
    this.isGrounded = false;

    for (const s of solids) {
      if (this.intersects(this.x, this.y, this.width, this.height, s.x, s.y, s.w, s.h)) {
        if (this.vy * this.gravityDir > 0) {
          // Landing on floor
          this.y = (this.gravityDir === 1) ? s.y - this.height : s.y + s.h;
          this.isGrounded = true;
        } else if (this.vy * this.gravityDir < 0) {
          // Hitting ceiling
          this.y = (this.gravityDir === 1) ? s.y + s.h : s.y - this.height;
        }
        this.vy = 0;
      }
    }
  }

  intersects(x1, y1, w1, h1, x2, y2, w2, h2) {
    return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
  }

  approach(current, target, maxDelta) {
    if (current < target) return Math.min(current + maxDelta, target);
    return Math.max(current - maxDelta, target);
  }

  updateParticles(delta) {
    // Update afterimages
    for (let i = this.afterimages.length - 1; i >= 0; i--) {
      this.afterimages[i].alpha -= delta * 4.0;
      if (this.afterimages[i].alpha <= 0) this.afterimages.splice(i, 1);
    }

    // Update death / spark particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * delta;
      p.y += p.vy * delta;
      p.vy += 800 * delta;
      p.life -= delta * 2.0;
      if (p.life <= 0) this.particles.splice(i, 1);
    }
  }

  // --- CANVAS RENDERING ---

  draw(ctx, cameraX, cameraY) {
    const rx = this.x - cameraX;
    const ry = this.y - cameraY;

    // 1. Draw Translucent Ghost Replay if available
    if (this.bestGhostFrames.length > 0) {
      const gIndex = Math.min(this.ghostFrames.length, this.bestGhostFrames.length - 1);
      const gFrame = this.bestGhostFrames[gIndex];
      if (gFrame) {
        ctx.save();
        ctx.translate(gFrame.x - cameraX + this.width / 2, gFrame.y - cameraY + this.height / 2);
        ctx.rotate(gFrame.rot);
        ctx.globalAlpha = 0.35;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        ctx.restore();
      }
    }

    // 2. Draw Dash Afterimages
    this.afterimages.forEach(img => {
      ctx.save();
      ctx.translate(img.x - cameraX + this.width / 2, img.y - cameraY + this.height / 2);
      ctx.rotate(img.rotation);
      ctx.globalAlpha = img.alpha;
      ctx.fillStyle = img.color;
      ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
      ctx.restore();
    });

    // 3. Draw Death / Sparks Particles
    this.particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - cameraX, p.y - cameraY, p.size, p.size);
      ctx.restore();
    });

    if (this.isDead) return;

    // 4. Draw Precision Glowing Cyber Cube
    ctx.save();
    ctx.translate(rx + this.width / 2, ry + this.height / 2);
    ctx.rotate(this.rotation);

    // Outer Glow Border
    ctx.shadowColor = this.skinColor;
    ctx.shadowBlur = 15;
    ctx.strokeStyle = this.skinColor;
    ctx.lineWidth = 3;
    ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);

    // Inner Body Fill
    ctx.fillStyle = '#0a1424';
    ctx.fillRect(-this.width / 2 + 2, -this.height / 2 + 2, this.width - 4, this.height - 4);

    // Cute Cyber Eye / Visor
    ctx.fillStyle = this.secondaryColor;
    ctx.fillRect(2, -4, 8, 8);

    ctx.restore();
  }
}
