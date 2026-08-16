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
  ratingAverage: number;
  ratingCount: number;
  base64Png: string;
  previewUrl?: string;
  createdAt: number;
  updatedAt: number;
}

export interface RatingItem {
  id: string;
  skinId: string;
  userId: string;
  stars: number; // 1 to 5
  timestamp: number;
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
  avatarUrl?: string;
  likedSkinIds: string[];
  favoriteSkinIds: string[];
  followingUids: string[];
  followersCount: number;
  publishedCount: number;
  createdAt: number;
}

export interface NotificationItem {
  id: string;
  userId: string;
  type: 'like' | 'rating' | 'comment' | 'follow' | 'message';
  title: string;
  message: string;
  linkUrl?: string;
  read: boolean;
  timestamp: number;
}

export interface DirectMessage {
  id: string;
  conversationId: string;
  senderUid: string;
  senderName: string;
  text: string;
  timestamp: number;
}

export interface Conversation {
  id: string;
  participants: string[]; // [uid1, uid2]
  participantNames: Record<string, string>;
  lastMessageText: string;
  lastMessageTimestamp: number;
  unreadCount?: number;
}

export interface ReportItem {
  id: string;
  targetType: 'skin' | 'comment' | 'user' | 'message';
  targetId: string;
  reason: 'inappropriate' | 'spam' | 'harassment' | 'stolen' | 'other';
  details: string;
  reporterUid: string;
  timestamp: number;
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

export interface AudioTrack {
  id: string;
  title: string;
  artist: string;
  bpm: number;
  genre: string;
}
