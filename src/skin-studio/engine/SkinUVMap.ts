import { UVRegion } from '../types';

export const SKIN_UV_REGIONS: UVRegion[] = [
  { name: 'Head Top', part: 'head', layer: 'base', x: 8, y: 0, w: 8, h: 8 },
  { name: 'Head Bottom', part: 'head', layer: 'base', x: 16, y: 0, w: 8, h: 8 },
  { name: 'Head Right', part: 'head', layer: 'base', x: 0, y: 8, w: 8, h: 8 },
  { name: 'Head Front', part: 'head', layer: 'base', x: 8, y: 8, w: 8, h: 8 },
  { name: 'Head Left', part: 'head', layer: 'base', x: 16, y: 8, w: 8, h: 8 },
  { name: 'Head Back', part: 'head', layer: 'base', x: 24, y: 8, w: 8, h: 8 },

  { name: 'Hat Top', part: 'head', layer: 'overlay', x: 40, y: 0, w: 8, h: 8 },
  { name: 'Hat Bottom', part: 'head', layer: 'overlay', x: 48, y: 0, w: 8, h: 8 },
  { name: 'Hat Right', part: 'head', layer: 'overlay', x: 32, y: 8, w: 8, h: 8 },
  { name: 'Hat Front', part: 'head', layer: 'overlay', x: 40, y: 8, w: 8, h: 8 },
  { name: 'Hat Left', part: 'head', layer: 'overlay', x: 48, y: 8, w: 8, h: 8 },
  { name: 'Hat Back', part: 'head', layer: 'overlay', x: 56, y: 8, w: 8, h: 8 },

  { name: 'Torso Top', part: 'torso', layer: 'base', x: 20, y: 16, w: 8, h: 4 },
  { name: 'Torso Bottom', part: 'torso', layer: 'base', x: 28, y: 16, w: 8, h: 4 },
  { name: 'Torso Right', part: 'torso', layer: 'base', x: 16, y: 20, w: 4, h: 12 },
  { name: 'Torso Front', part: 'torso', layer: 'base', x: 20, y: 20, w: 8, h: 12 },
  { name: 'Torso Left', part: 'torso', layer: 'base', x: 28, y: 20, w: 4, h: 12 },
  { name: 'Torso Back', part: 'torso', layer: 'base', x: 32, y: 20, w: 8, h: 12 },

  { name: 'Jacket Top', part: 'torso', layer: 'overlay', x: 20, y: 32, w: 8, h: 4 },
  { name: 'Jacket Bottom', part: 'torso', layer: 'overlay', x: 28, y: 32, w: 8, h: 4 },
  { name: 'Jacket Right', part: 'torso', layer: 'overlay', x: 16, y: 36, w: 4, h: 12 },
  { name: 'Jacket Front', part: 'torso', layer: 'overlay', x: 20, y: 36, w: 8, h: 12 },
  { name: 'Jacket Left', part: 'torso', layer: 'overlay', x: 28, y: 36, w: 4, h: 12 },
  { name: 'Jacket Back', part: 'torso', layer: 'overlay', x: 32, y: 36, w: 8, h: 12 },

  { name: 'R. Arm Top', part: 'rightArm', layer: 'base', x: 44, y: 16, w: 4, h: 4 },
  { name: 'R. Arm Bottom', part: 'rightArm', layer: 'base', x: 48, y: 16, w: 4, h: 4 },
  { name: 'R. Arm Right', part: 'rightArm', layer: 'base', x: 40, y: 20, w: 4, h: 12 },
  { name: 'R. Arm Front', part: 'rightArm', layer: 'base', x: 44, y: 20, w: 4, h: 12 },
  { name: 'R. Arm Left', part: 'rightArm', layer: 'base', x: 48, y: 20, w: 4, h: 12 },
  { name: 'R. Arm Back', part: 'rightArm', layer: 'base', x: 52, y: 20, w: 4, h: 12 },

  { name: 'R. Sleeve Top', part: 'rightArm', layer: 'overlay', x: 44, y: 32, w: 4, h: 4 },
  { name: 'R. Sleeve Bottom', part: 'rightArm', layer: 'overlay', x: 48, y: 32, w: 4, h: 4 },
  { name: 'R. Sleeve Right', part: 'rightArm', layer: 'overlay', x: 40, y: 36, w: 4, h: 12 },
  { name: 'R. Sleeve Front', part: 'rightArm', layer: 'overlay', x: 44, y: 36, w: 4, h: 12 },
  { name: 'R. Sleeve Left', part: 'rightArm', layer: 'overlay', x: 48, y: 36, w: 4, h: 12 },
  { name: 'R. Sleeve Back', part: 'rightArm', layer: 'overlay', x: 52, y: 36, w: 4, h: 12 },

  { name: 'L. Arm Top', part: 'leftArm', layer: 'base', x: 36, y: 48, w: 4, h: 4 },
  { name: 'L. Arm Bottom', part: 'leftArm', layer: 'base', x: 40, y: 48, w: 4, h: 4 },
  { name: 'L. Arm Right', part: 'leftArm', layer: 'base', x: 32, y: 52, w: 4, h: 12 },
  { name: 'L. Arm Front', part: 'leftArm', layer: 'base', x: 36, y: 52, w: 4, h: 12 },
  { name: 'L. Arm Left', part: 'leftArm', layer: 'base', x: 40, y: 52, w: 4, h: 12 },
  { name: 'L. Arm Back', part: 'leftArm', layer: 'base', x: 44, y: 52, w: 4, h: 12 },

  { name: 'L. Sleeve Top', part: 'leftArm', layer: 'overlay', x: 52, y: 48, w: 4, h: 4 },
  { name: 'L. Sleeve Bottom', part: 'leftArm', layer: 'overlay', x: 56, y: 48, w: 4, h: 4 },
  { name: 'L. Sleeve Right', part: 'leftArm', layer: 'overlay', x: 48, y: 52, w: 4, h: 12 },
  { name: 'L. Sleeve Front', part: 'leftArm', layer: 'overlay', x: 52, y: 52, w: 4, h: 12 },
  { name: 'L. Sleeve Left', part: 'leftArm', layer: 'overlay', x: 56, y: 52, w: 4, h: 12 },
  { name: 'L. Sleeve Back', part: 'leftArm', layer: 'overlay', x: 60, y: 52, w: 4, h: 12 },

  { name: 'R. Leg Top', part: 'rightLeg', layer: 'base', x: 4, y: 16, w: 4, h: 4 },
  { name: 'R. Leg Bottom', part: 'rightLeg', layer: 'base', x: 8, y: 16, w: 4, h: 4 },
  { name: 'R. Leg Right', part: 'rightLeg', layer: 'base', x: 0, y: 20, w: 4, h: 12 },
  { name: 'R. Leg Front', part: 'rightLeg', layer: 'base', x: 4, y: 20, w: 4, h: 12 },
  { name: 'R. Leg Left', part: 'rightLeg', layer: 'base', x: 8, y: 20, w: 4, h: 12 },
  { name: 'R. Leg Back', part: 'rightLeg', layer: 'base', x: 12, y: 20, w: 4, h: 12 },

  { name: 'R. Pant Top', part: 'rightLeg', layer: 'overlay', x: 4, y: 32, w: 4, h: 4 },
  { name: 'R. Pant Bottom', part: 'rightLeg', layer: 'overlay', x: 8, y: 32, w: 4, h: 4 },
  { name: 'R. Pant Right', part: 'rightLeg', layer: 'overlay', x: 0, y: 36, w: 4, h: 12 },
  { name: 'R. Pant Front', part: 'rightLeg', layer: 'overlay', x: 4, y: 36, w: 4, h: 12 },
  { name: 'R. Pant Left', part: 'rightLeg', layer: 'overlay', x: 8, y: 36, w: 4, h: 12 },
  { name: 'R. Pant Back', part: 'rightLeg', layer: 'overlay', x: 12, y: 36, w: 4, h: 12 },

  { name: 'L. Leg Top', part: 'leftLeg', layer: 'base', x: 20, y: 48, w: 4, h: 4 },
  { name: 'L. Leg Bottom', part: 'leftLeg', layer: 'base', x: 24, y: 48, w: 4, h: 4 },
  { name: 'L. Leg Right', part: 'leftLeg', layer: 'base', x: 16, y: 52, w: 4, h: 12 },
  { name: 'L. Leg Front', part: 'leftLeg', layer: 'base', x: 20, y: 52, w: 4, h: 12 },
  { name: 'L. Leg Left', part: 'leftLeg', layer: 'base', x: 24, y: 52, w: 4, h: 12 },
  { name: 'L. Leg Back', part: 'leftLeg', layer: 'base', x: 28, y: 52, w: 4, h: 12 },

  { name: 'L. Pant Top', part: 'leftLeg', layer: 'overlay', x: 4, y: 48, w: 4, h: 4 },
  { name: 'L. Pant Bottom', part: 'leftLeg', layer: 'overlay', x: 8, y: 48, w: 4, h: 4 },
  { name: 'L. Pant Right', part: 'leftLeg', layer: 'overlay', x: 0, y: 52, w: 4, h: 12 },
  { name: 'L. Pant Front', part: 'leftLeg', layer: 'overlay', x: 4, y: 52, w: 4, h: 12 },
  { name: 'L. Pant Left', part: 'leftLeg', layer: 'overlay', x: 8, y: 52, w: 4, h: 12 },
  { name: 'L. Pant Back', part: 'leftLeg', layer: 'overlay', x: 12, y: 52, w: 4, h: 12 },
];

export function findUVRegion(x: number, y: number): UVRegion | undefined {
  return SKIN_UV_REGIONS.find(
    (r) => x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h
  );
}
