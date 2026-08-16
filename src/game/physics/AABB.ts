export class AABB {
  public minX: number;
  public minY: number;
  public maxX: number;
  public maxY: number;

  constructor(minX: number, minY: number, maxX: number, maxY: number) {
    this.minX = minX;
    this.minY = minY;
    this.maxX = maxX;
    this.maxY = maxY;
  }

  public set(minX: number, minY: number, maxX: number, maxY: number) {
    this.minX = minX;
    this.minY = minY;
    this.maxX = maxX;
    this.maxY = maxY;
  }

  public intersects(other: AABB): boolean {
    return (
      this.minX < other.maxX &&
      this.maxX > other.minX &&
      this.minY < other.maxY &&
      this.maxY > other.minY
    );
  }

  public contains(x: number, y: number): boolean {
    return x >= this.minX && x <= this.maxX && y >= this.minY && y <= this.maxY;
  }

  public offset(dx: number, dy: number): AABB {
    return new AABB(this.minX + dx, this.minY + dy, this.maxX + dx, this.maxY + dy);
  }
}
