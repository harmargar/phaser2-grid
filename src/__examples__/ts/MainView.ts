import { CellAlign, CellScale, IGridConfig } from '@koreez/grid-core';
import { Phaser2Grid } from '../../com/koreez/phaser2grid/Phaser2Grid';

function getCanvasBounds() {
  // @ts-ignore
  return { x: 0, y: 0, width: window.game.scale.width, height: window.game.scale.height };
}

function getMainViewGridConfig(): IGridConfig {
  // @ts-ignore
  return window.game.scale.isLandscape ? getMainViewLandscapeGridConfig() : getMainViewPortraitGridConfig();
}

function getMainViewPortraitGridConfig(): IGridConfig {
  return {
    bounds: getCanvasBounds,
    cells: [
      {
        bounds: { x: 0, y: 0, width: 0.5, height: 1 },
        name: 'main_1',
        padding: 0.1,
      },
      {
        bounds: { x: 0.5, y: 0 },
        name: 'main_2',
      },
    ],
    debug: { color: 0xff0000 },
    name: 'main',
  };
}

function getMainViewLandscapeGridConfig(): IGridConfig {
  return {
    bounds: getCanvasBounds,
    cells: [
      {
        bounds: { x: 0, y: 0, width: 0.4, height: 1 },
        name: 'main_1',
      },
      {
        bounds: { x: 0.4, y: 0, width: 0.3, height: 1 },
        name: 'main_2',
      },
      {
        bounds: { x: 0.7, y: 0, width: 0.3, height: 1 },
        name: 'main_3',
      },
    ],
    debug: { color: 0xff0000 },
    name: 'main',
  };
}

function getChildViewGridConfig(): IGridConfig {
  return {
    bounds: getCanvasBounds,
    cells: [
      {
        bounds: { x: 0, y: 0, height: 0.25 },
        name: 'ui_1',
      },
      {
        bounds: { x: 0, y: 0.25, height: 0.25 },
        name: 'ui_2',
      },
      {
        bounds: { x: 0, y: 0.5, height: 0.25 },
        name: 'ui_3',
      },
      {
        bounds: { x: 0 },
        name: 'ui_4',
        padding: 0.1,
      },
    ],
    debug: { color: 0x626262 },
    name: 'ui',
  };
}

export class MainView extends Phaser2Grid {
  constructor(game: Phaser.Game) {
    super(game);
    this.build(getMainViewGridConfig());
  }

  public build(config: IGridConfig): void {
    super.build(config);

    const group = this.game.make.group();
    const owl = this.game.add.sprite(0, 0, 'owl');
    const duck = this.game.add.sprite(200, 0, 'duck');

    owl.anchor.set(-2, 2);
    duck.anchor.set(2, -2);

    group.add(owl);
    group.add(duck);

    this.setChild('main_1', group);

    const childView = new ChildView(this.game);
    this.setChild('main_2', childView);

    setInterval(() => {
      group.rotation += 0.005;
      this.rebuild();
    }, 0);

    this.game.scale.onOrientationChange.add(() => {
      this.rebuild(getMainViewGridConfig());
    });

    this.game.scale.setResizeCallback(() => {
      setTimeout(() => {
        this.rebuild();
      });
    }, this);
  }
}

// tslint:disable-next-line: max-classes-per-file
class ChildView extends Phaser2Grid {
  constructor(game: Phaser.Game) {
    super(game);
    this.build(getChildViewGridConfig());
  }

  public build(config: IGridConfig): void {
    super.build(config);

    const owl = this.game.make.sprite(0, 0, 'owl');
    owl.anchor.set(0.5);
    const parrot1 = this.game.make.sprite(200, 0, 'parrot');
    const parrot2 = this.game.make.sprite(-200, 0, 'parrot');
    const chick = this.game.make.sprite(0, 0, 'chick');
    const pixel = this.game.make.sprite(0, 0, 'pixel');

    const parrotCont = this.game.make.group();
    parrotCont.add(parrot1);
    parrotCont.add(parrot2);

    this.setChild('ui_1', owl, { align: CellAlign.LeftTop });
    this.setChild('ui_2', parrotCont);
    this.setChild('ui_3', chick, { align: CellAlign.RightBottom });
    this.setChild('ui_4', pixel, {
      debug: { color: 0xffffff },
      padding: 0.2,
      scale: CellScale.ShowAll,
    });

    setInterval(() => {
      owl.rotation += 0.005;
      parrotCont.rotation += 0.005;
      pixel.rotation += 0.005;
      chick.rotation += 0.005;
      parrot1.rotation -= 0.005;

      this.rebuild();
    }, 0);
  }
}
