import { IContent } from '@koreez/grid-core';

export type IPhaser2Child = Phaser.Group | Phaser.Sprite | Phaser.Image;

export interface IPhaser2Content extends IContent {
  child: IPhaser2Child;
}

export class Debugger extends Phaser.Graphics {
  public defaultStrokeColor!: number;
}
