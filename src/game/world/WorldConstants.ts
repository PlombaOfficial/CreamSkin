export const CHUNK_WIDTH = 16;
export const CHUNK_HEIGHT = 128;

// Depth levels (Y=0 is Bedrock at bottom, Y=127 is Sky top)
export const LEVEL_BEDROCK = 0;
export const LEVEL_MAGMA_CORE = 10;
export const LEVEL_DEEPSLATE = 30;
export const LEVEL_STONE = 55;
export const LEVEL_SEA_LEVEL = 64;
export const LEVEL_SURFACE_BASE = 72;

export const BLOCK_SIZE = 16; // 16 pixels per block in world coordinates

export const RENDER_CHUNK_RADIUS = 4; // Chunks to left/right (total 9 chunks loaded)
export const UNLOAD_CHUNK_DISTANCE = 7; // Chunks beyond this are safely unmounted
