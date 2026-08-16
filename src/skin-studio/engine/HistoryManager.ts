import { SkinTextureBuffer } from './SkinTextureBuffer';

export class HistoryManager {
  private undoStack: Uint8ClampedArray[] = [];
  private redoStack: Uint8ClampedArray[] = [];
  private readonly maxSteps: number = 50;

  public pushSnapshot(buffer: SkinTextureBuffer) {
    this.undoStack.push(new Uint8ClampedArray(buffer.data));
    if (this.undoStack.length > this.maxSteps) {
      this.undoStack.shift();
    }
    this.redoStack = []; // Clear redo on new action
  }

  public undo(currentBuffer: SkinTextureBuffer): boolean {
    if (this.undoStack.length === 0) return false;

    // Push current to redo
    this.redoStack.push(new Uint8ClampedArray(currentBuffer.data));

    // Pop from undo
    const prevState = this.undoStack.pop()!;
    currentBuffer.data.set(prevState);
    return true;
  }

  public redo(currentBuffer: SkinTextureBuffer): boolean {
    if (this.redoStack.length === 0) return false;

    // Push current to undo
    this.undoStack.push(new Uint8ClampedArray(currentBuffer.data));

    // Pop from redo
    const nextState = this.redoStack.pop()!;
    currentBuffer.data.set(nextState);
    return true;
  }

  public canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  public canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  public clear() {
    this.undoStack = [];
    this.redoStack = [];
  }
}
