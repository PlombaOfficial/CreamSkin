import { BiomeType } from '../types';
import { SimplexNoise } from './Noise';

export interface BiomeConfig {
  type: BiomeType;
  name: string;
  skyColorDay: string;
  skyColorNight: string;
  ambientLightColor: string;
  treeDensity: number;
  flowerDensity: number;
  tallGrassDensity: number;
}

export class BiomeManager {
  private tempNoise: SimplexNoise;
  private moistureNoise: SimplexNoise;

  constructor(seed: number) {
    this.tempNoise = new SimplexNoise(seed + 101);
    this.moistureNoise = new SimplexNoise(seed + 202);
  }

  public getBiomeAt(worldX: number, depthY: number): BiomeType {
    if (depthY < 12) {
      return BiomeType.MAGMA_CORE;
    }
    if (depthY < 32) {
      return BiomeType.DEEP_CAVERNS;
    }

    const temp = this.tempNoise.noise2D(worldX * 0.002, 0); // -1 to 1
    const moisture = this.moistureNoise.noise2D(worldX * 0.002, 10); // -1 to 1

    if (temp > 0.4 && moisture < -0.1) {
      return BiomeType.DESERT;
    }
    if (temp < -0.3) {
      return BiomeType.SNOW_TUNDRA;
    }
    if (moisture > 0.3) {
      return temp > 0 ? BiomeType.FOREST : BiomeType.BIRCH_FOREST;
    }

    return BiomeType.PLAINS;
  }
}
