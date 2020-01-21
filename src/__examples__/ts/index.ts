import { IMGKeys, IMGKeyValues } from '../assets';
import { MainView } from './MainView';

class Game extends Phaser.Game {
  constructor() {
    super('100%', '100%', Phaser.CANVAS);
  }
}

// tslint:disable-next-line: max-classes-per-file
class ExampleState extends Phaser.State {
  public init() {
    this.stage.backgroundColor = '#cdcdcd';
    this.scale.scaleMode = Phaser.ScaleManager.RESIZE;
    // console.log('State', this.key);
    // console.log('IMG Key Values');
    // console.table(IMGKeyValues.default);
    // console.log('IMG Keys');
    // console.table(IMGKeys);
  }

  public preload() {
    this.load.images(Object.keys(IMGKeys), Object.values(IMGKeyValues.default));
  }

  public create() {
    this.add.existing(new MainView(this.game));
  }
}

document.onreadystatechange = () => {
  if (document.readyState === 'complete') {
    const game = new Game();
    game.state.add('ExampleState', ExampleState, true);

    // @ts-ignore
    window.game = game;
  }
};
