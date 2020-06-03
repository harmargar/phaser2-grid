import { IGridConfig } from '@koreez/grid-core';

export class Debugger extends Phaser.Graphics {
  public static readonly DEFAULT_COLOR: number = 0xffffff;

  public drawStrokedRect(
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

  public drawSolidRect(
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

export type IPhaser2Child = PIXI.DisplayObjectContainer & {
  destroy(...args: any[]): void;
};

export type IPhaser2Grid = IPhaser2Child & {
  getGridConfig(): IGridConfig;
  rebuild(config?: IGridConfig): void;
};

declare global {
  interface Window {
    game: Phaser.Game;
  }
}
