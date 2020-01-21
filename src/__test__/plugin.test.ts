// tslint:disable: ordered-imports
import './phaser';
import { Phaser2Grid } from '../com/koreez/phaser2grid/Phaser2Grid';

test('Phaser2 Grid', done => {
  function create(this: Phaser.State) {
    this.add.existing(new Phaser2Grid(this.game));
    done();
  }
  // tslint:disable-next-line: no-unused-expression
  new Phaser.Game(800, 600, Phaser.CANVAS, null, {
    create,
  });
});
