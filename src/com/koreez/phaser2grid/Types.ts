import { IGridConfig } from '@koreez/grid-core';

export class Debugger extends Phaser.Graphics {
  public defaultStrokeColor!: number;
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
