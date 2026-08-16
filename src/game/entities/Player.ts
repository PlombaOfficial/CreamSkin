import { Entity } from './Entity';
import { EntityType, PlayerStats, ToolType, ToolTier, BlockType } from '../types';
import { Inventory } from '../inventory/Inventory';
import { World } from '../world/World';
import { BLOCK_DEFINITIONS, ITEM_DEFINITIONS } from '../inventory/ItemData';
import { audioManager } from '../audio/AudioManager';

export class Player extends Entity {
  public inventory: Inventory;
  public spawnX: number;
  public spawnY: number;

  // Survival Stats
  public hunger: number = 20;
  public maxHunger: number = 20;
  public saturation: number = 5;
  public exhaustion: number = 0;
  public air: number = 20;
  public maxAir: number = 20;
  public experience: number = 0;
  public level: number = 0;
  public score: number = 0;

  // Action States
  public isSprinting: boolean = false;
  public isMining: boolean = false;
  public miningTargetX: number | null = null;
  public miningTargetY: number | null = null;
  public breakProgress: number = 0; // 0 to 1.0
  public swingProgress: number = 0; // 0 to 1.0 for visual arm swing

  public readonly reachDistance = 5.5; // Max block reach in blocks
  public walkCycle: number = 0;

  private hungerTimer: number = 0;
  private drownTimer: number = 0;
  private stepSoundTimer: number = 0;

  constructor(x: number, y: number) {
    super('local_player', EntityType.PLAYER, x, y);
    this.width = 0.8;
    this.height = 1.8;
    this.spawnX = x;
    this.spawnY = y;
    this.inventory = new Inventory();
  }

  public getStats(): PlayerStats {
    const xpNeeded = 7 + this.level * 7;
    return {
      health: this.health,
      maxHealth: this.maxHealth,
      hunger: this.hunger,
      maxHunger: this.maxHunger,
      saturation: this.saturation,
      exhaustion: this.exhaustion,
      armor: this.calculateArmor(),
      air: this.air,
      maxAir: this.maxAir,
      experience: this.experience,
      level: this.level,
      xpToNextLevel: xpNeeded,
      score: this.score,
    };
  }

  public calculateArmor(): number {
    let total = 0;
    for (const piece of Object.values(this.inventory.armor)) {
      if (piece) {
        const def = ITEM_DEFINITIONS[piece.id];
        if (def && def.armorDefense) total += def.armorDefense;
      }
    }
    return total;
  }

  public addExperience(amount: number) {
    this.experience += amount;
    let xpNeeded = 7 + this.level * 7;
    while (this.experience >= xpNeeded) {
      this.experience -= xpNeeded;
      this.level++;
      xpNeeded = 7 + this.level * 7;
      audioManager.playCraftSuccess();
    }
  }

  public handleInput(
    keys: { left: boolean; right: boolean; jump: boolean; sprint: boolean },
    dt: number
  ) {
    if (this.isDead) return;

    this.isSprinting = keys.sprint && this.hunger > 6;
    const speed = this.inWater ? 3.0 : (this.isSprinting ? 6.5 : 4.2);

    if (keys.left) {
      this.vx = -speed;
      this.facingLeft = true;
      this.walkCycle += dt * 8;
    } else if (keys.right) {
      this.vx = speed;
      this.facingLeft = false;
      this.walkCycle += dt * 8;
    }

    if (keys.jump) {
      if (this.inWater) {
        this.vy = 4.5; // Swimming upward
      } else if (this.onGround) {
        this.vy = 8.5; // Jump impulse
      }
    }
  }

  public startMining(targetX: number, targetY: number) {
    const dist = Math.hypot(this.x - (targetX + 0.5), (this.y + 0.9) - (targetY + 0.5));
    if (dist > this.reachDistance) return;

    if (this.miningTargetX !== targetX || this.miningTargetY !== targetY) {
      this.miningTargetX = targetX;
      this.miningTargetY = targetY;
      this.breakProgress = 0;
    }
    this.isMining = true;
  }

  public stopMining() {
    this.isMining = false;
    this.miningTargetX = null;
    this.miningTargetY = null;
    this.breakProgress = 0;
  }

  public updateMining(world: World, dt: number, onBlockBroken: (drop: { dropId: string; dropCount: number } | null, x: number, y: number) => void) {
    if (!this.isMining || this.miningTargetX === null || this.miningTargetY === null) {
      return;
    }

    const tx = this.miningTargetX;
    const ty = this.miningTargetY;
    const dist = Math.hypot(this.x - (tx + 0.5), (this.y + 0.9) - (ty + 0.5));
    if (dist > this.reachDistance) {
      this.stopMining();
      return;
    }

    const block = world.getBlock(tx, ty);
    if (block === BlockType.AIR || block === BlockType.BEDROCK) {
      this.stopMining();
      return;
    }

    const bDef = BLOCK_DEFINITIONS[block];
    if (!bDef) return;

    // Trigger arm swing
    this.swingProgress = (this.swingProgress + dt * 8) % 1.0;

    // Calculate mining speed
    const heldItem = this.inventory.getSelectedItem();
    const itemDef = heldItem ? ITEM_DEFINITIONS[heldItem.id] : null;

    let multiplier = 1.0;
    const toolType = itemDef?.toolType || ToolType.NONE;
    const toolTier = itemDef?.toolTier || ToolTier.HAND;

    if (toolType === bDef.requiredTool && toolTier >= bDef.minToolTier) {
      multiplier = itemDef?.miningSpeed || 2.0;
    } else if (bDef.requiredTool !== ToolType.NONE && toolTier < bDef.minToolTier) {
      multiplier = 0.25; // Ineffective tool penalty
    }

    const breakTimeSec = (bDef.hardness / 1000) / multiplier;
    this.breakProgress += dt / breakTimeSec;

    // Dig sound tick
    if (Math.random() < 0.15) {
      audioManager.playDigHit(bDef.soundType);
    }

    if (this.breakProgress >= 1.0) {
      const drop = world.breakBlock(tx, ty);
      onBlockBroken(drop, tx, ty);
      this.stopMining();
      this.addExhaustion(0.025);
    }
  }

  public eatFood(foodItemId: string): boolean {
    const def = ITEM_DEFINITIONS[foodItemId];
    if (!def || !def.foodRestoration) return false;
    if (this.hunger >= this.maxHunger && this.health >= this.maxHealth) return false;

    this.hunger = Math.min(this.maxHunger, this.hunger + def.foodRestoration);
    this.saturation = Math.min(this.hunger, this.saturation + (def.saturation || 1.0));
    audioManager.playPickup();
    return true;
  }

  public addExhaustion(amount: number) {
    this.exhaustion += amount;
    if (this.exhaustion >= 4.0) {
      this.exhaustion -= 4.0;
      if (this.saturation > 0) {
        this.saturation = Math.max(0, this.saturation - 1);
      } else {
        this.hunger = Math.max(0, this.hunger - 1);
      }
    }
  }

  public override update(dt: number, world: World) {
    super.update(dt, world);

    // Footstep audio
    if (this.onGround && Math.abs(this.vx) > 0.5) {
      this.stepSoundTimer += dt;
      if (this.stepSoundTimer > (this.isSprinting ? 0.28 : 0.4)) {
        this.stepSoundTimer = 0;
        const blockBelow = world.getBlock(Math.floor(this.x), Math.floor(this.y - 0.2));
        const def = BLOCK_DEFINITIONS[blockBelow];
        audioManager.playFootstep(def?.soundType === 'glass' ? 'stone' : (def?.soundType as 'grass' | 'stone' | 'wood' | 'sand' | 'snow' | 'water') || 'grass');
      }
    }

    // Underwater breathing
    if (this.inWater) {
      this.drownTimer += dt;
      if (this.drownTimer >= 1.0) {
        this.drownTimer = 0;
        this.air = Math.max(0, this.air - 1);
        if (this.air <= 0) {
          this.takeDamage(2);
          audioManager.playHurt(true);
        }
      }
    } else {
      this.air = this.maxAir;
      this.drownTimer = 0;
    }

    // Hunger and health regeneration
    this.hungerTimer += dt;
    if (this.hungerTimer >= 4.0) {
      this.hungerTimer = 0;
      if (this.hunger >= 18 && this.health < this.maxHealth) {
        this.health = Math.min(this.maxHealth, this.health + 1);
        this.addExhaustion(1.5);
      } else if (this.hunger === 0) {
        this.takeDamage(1);
        audioManager.playHurt(true);
      }
    }
  }

  public respawn() {
    this.x = this.spawnX;
    this.y = this.spawnY;
    this.vx = 0;
    this.vy = 0;
    this.health = this.maxHealth;
    this.hunger = this.maxHunger;
    this.air = this.maxAir;
    this.isDead = false;
  }

  public override onDeath() {
    audioManager.playHurt(true);
  }
}
