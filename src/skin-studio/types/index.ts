export type ModelType = 'classic' | 'slim';

export type LayerType = 'base' | 'overlay' | 'both';

export type ToolType =
  | 'pencil'
  | 'brush'
  | 'eraser'
  | 'fill'
  | 'eyedropper'
  | 'line'
  | 'rectangle'
  | 'circle'
  | 'select'
  | 'noise';

export type BodyPart =
  | 'all'
  | 'head'
  | 'torso'
  | 'rightArm'
  | 'leftArm'
  | 'rightLeg'
  | 'leftLeg';

export interface UVRegion {
  name: string;
  part: BodyPart;
  layer: 'base' | 'overlay';
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface SkinMetadata {
  id: string;
  title: string;
  description: string;
  authorUid: string;
  authorName: string;
  authorAvatar?: string;
  modelType: ModelType;
  category: string;
  tags: string[];
  likesCount: number;
  downloadsCount: number;
  viewsCount: number;
  base64Png: string;
  previewUrl?: string;
  createdAt: number;
  updatedAt: number;
}

export interface CommentItem {
  id: string;
  skinId: string;
  authorUid: string;
  authorName: string;
  authorAvatar?: string;
  text: string;
  timestamp: number;
}

export interface UserProfile {
  uid: string;
  username: string;
  bio?: string;
  avatar?: string;
  likedSkinIds: string[];
  favoriteSkinIds: string[];
  publishedCount: number;
  createdAt: number;
}

export interface ColorRGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface ColorPalette {
  name: string;
  colors: string[];
}
