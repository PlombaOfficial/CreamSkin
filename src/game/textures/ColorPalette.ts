/**
 * Cohesive pixel-art color palettes with shading and dithering utilities
 */

export const PALETTE = {
  // Grass & Foliage
  grassBright: '#6cb33f',
  grassNormal: '#52962f',
  grassDark: '#3e7423',
  grassBirch: '#7ebd42',
  grassSnow: '#dce8eb',

  // Earth & Dirt
  dirtLight: '#9b714b',
  dirtNormal: '#7c5737',
  dirtDark: '#5d4128',
  dirtDeep: '#432e1c',

  // Stone & Mineral
  stoneLight: '#949494',
  stoneNormal: '#747474',
  stoneDark: '#545454',
  deepslateLight: '#4d4e57',
  deepslateNormal: '#36373f',
  deepslateDark: '#202127',
  bedrock: '#121215',

  // Desert / Sand
  sandLight: '#e7d99c',
  sandNormal: '#d2be75',
  sandDark: '#b29c54',
  sandstone: '#c7b275',

  // Snow & Ice
  snowPure: '#ffffff',
  snowShade: '#d5e4ec',
  iceGlint: '#c3ebfc',
  iceBase: '#7db9db',
  iceDeep: '#538dae',

  // Wood & Planks
  oakBarkLight: '#785b37',
  oakBarkNormal: '#594123',
  oakBarkDark: '#3c2b16',
  oakWoodLight: '#c29a63',
  oakWoodNormal: '#a67d46',
  oakWoodDark: '#855f2f',

  birchBarkLight: '#e4decb',
  birchBarkNormal: '#c5bfae',
  birchBarkDark: '#38332d',
  birchWoodLight: '#e2cc9b',
  birchWoodNormal: '#c7ad76',
  birchWoodDark: '#a38953',

  // Ores
  oreCoal: '#252528',
  oreCoalGlint: '#42434a',
  oreIron: '#d8af93',
  oreIronGlint: '#f0c8ae',
  oreGold: '#fcee4b',
  oreGoldGlint: '#fff98e',
  oreDiamond: '#4eeddb',
  oreDiamondGlint: '#a7fcf4',
  oreRedstone: '#ea2323',
  oreRedstoneGlint: '#ff6666',
  oreEmerald: '#2ccc4f',
  oreEmeraldGlint: '#78f792',

  // Liquids
  waterSurface: 'rgba(52, 134, 235, 0.7)',
  waterDeep: 'rgba(30, 89, 180, 0.85)',
  lavaSurface: '#ff5500',
  lavaCore: '#ffbb00',
  lavaCrust: '#992200',

  // Utility
  glassFrame: 'rgba(215, 235, 245, 0.65)',
  glassGlint: 'rgba(255, 255, 255, 0.85)',
  brickRed: '#9e3b2b',
  brickMortar: '#d5cfc7',
  torchGlow: '#ffaa00',
  torchCore: '#ffffff',

  // UI
  uiBg: '#21242d',
  uiBorder: '#3d4353',
  uiBorderLight: '#5c647b',
  uiSlot: '#14161c',
  uiSlotHighlight: '#4c78af',
  uiText: '#ffffff',
  uiTextGold: '#ffcc00',
  uiTextGreen: '#55ff55',
  uiTextRed: '#ff5555',
};

/**
 * Pixel drawing helper
 */
export function setPixel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  alpha: number = 1.0
) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.fillRect(Math.floor(x), Math.floor(y), 1, 1);
  ctx.restore();
}

/**
 * Dithering noise generator for rich micro-textures
 */
export function pseudoRandom(seed: number): number {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}
