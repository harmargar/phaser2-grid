import { ICellConfig } from '@koreez/grid-core';

export type IPhaser2Child = PIXI.DisplayObjectContainer & {
  destroy(...args: any[]): void;
};

export type IPhaser2Grid = IPhaser2Child & {
  getGridConfig(): ICellConfig;
  rebuild(config?: ICellConfig): void;
};

export type ICellChild = IPhaser2Child | IPhaser2Grid;

declare global {
  interface Window {
    game: Phaser.Game;
  }
}
