export class Debugger extends Phaser.Graphics {
  public static readonly DEFAULT_COLOR: number = 0xffffff;

  public strokeRect(
    x: number,
    y: number,
    w: number,
    h: number,
    lineWidth: number,
    color: number = Debugger.DEFAULT_COLOR,
  ): void {
    this.lineStyle(lineWidth, color, 1);
    this.drawRect(x, y, w, h);
  }

  public fillRect(
    x: number,
    y: number,
    w: number,
    h: number,
    lineWidth: number,
    color: number = Debugger.DEFAULT_COLOR,
  ): void {
    this.lineStyle(lineWidth, color, 1);
    this.beginFill(color, 0.4);
    this.drawRect(x, y, w, h);
    this.endFill();
  }
}
