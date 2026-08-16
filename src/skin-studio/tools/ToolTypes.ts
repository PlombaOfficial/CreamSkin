import { ToolType, ColorRGBA, LayerType, BodyPart } from '../types';

export interface ToolConfig {
  activeTool: ToolType;
  brushSize: number;
  primaryColor: ColorRGBA;
  secondaryColor: ColorRGBA;
  activeLayer: LayerType;
  activePart: BodyPart;
  symmetryX: boolean;
  symmetryY: boolean;
  noiseAmount: number;
}

export const DEFAULT_TOOL_CONFIG: ToolConfig = {
  activeTool: 'pencil',
  brushSize: 1,
  primaryColor: { r: 52, g: 152, b: 219, a: 255 },
  secondaryColor: { r: 231, g: 76, b: 60, a: 255 },
  activeLayer: 'both',
  activePart: 'all',
  symmetryX: false,
  symmetryY: false,
  noiseAmount: 12,
};
