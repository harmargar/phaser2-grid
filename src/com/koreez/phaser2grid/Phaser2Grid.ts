import { align, Cell, CellAlign, CellScale, fit, ICellConfig } from '@koreez/grid-core';
import { Debug } from './Debugger';
import { ICellChild, IPhaser2Child, IPhaser2Grid } from './Types';

export abstract class Phaser2Grid extends Phaser.Group implements IPhaser2Grid {
  public abstract getGridConfig(): ICellConfig;

  protected grid!: Cell<ICellChild>;

  private _debug!: Debug;

  constructor(game: Phaser.Game) {
    super(game);

    this._debug = new Debug(this);
  }

  protected getCellByName(name: string) {
    return this.grid.getCellByName(name);
  }

  protected getCellByContent(content: ICellChild): Cell<ICellChild> | undefined {
    return this.grid.cells.find(cell => cell.contents.includes(content));
  }

  protected getCellBoundsByName(name: string) {
    return this.getCellByName(name)?.bounds;
  }

  protected getCellAreaByName(name: string) {
    return this.getCellByName(name)?.area;
  }

  /**
   * @description Rebuilds Grid. Destroys existing grid and creates new one based on given or existing configuration
   * @param config Input configuration object. Can be empty, to build with existing configuration
   * @returns {void}
   */
  public rebuild(config?: ICellConfig): void {
    // saves cells references before destroying grid
    const cells = this.grid.getCells();

    // creates new grid
    this._internalBuild(config || this.grid.config);

    // sets old cells contents in new grid cells
    cells.forEach(cell => cell.contents.forEach(content => this._rebuildContent(cell.name, content)));
  }

  /**
   * @description Creates Grid object based on input configuration object
   * @param config Input configuration object.
   * @returns {void}
   */
  protected build(config: ICellConfig): void {
    this._internalBuild(config);
  }

  /**
   * @description Adds the given Game Object, to this Container.
   * @param cellName Cell name which will hold given child as content
   * @param child The Game Object, to add to the Container.
   * @param config Configuration object, which will be merged with cell configuration
   * @returns {this}
   */
  protected setChild(cellName: string, child: IPhaser2Child): this {
    const cell = this.grid.getCellByName(cellName);

    if (cell === undefined) {
      throw new Error(`No cell found with name ${cellName}`);
    }

    this.addChild(child);
    this._rebuildContent(cell.name, child);

    this._debug.bringToTop();

    return this;
  }

  protected destroyChild(child: ICellChild, ...destroyArgs: any[]): void {
    child.destroy(...destroyArgs);

    this.removeContent(child);
  }

  protected addContent(child: any, cellName: any): void {
    const cell = this.getCellByName(cellName);

    if (cell === undefined) {
      throw new Error(`No cell found with name ${cellName}`);
    }

    cell.contents.push(child);
  }

  protected removeContent(child: any, cellName?: any): void {
    const cell = cellName ? this.getCellByName(cellName) : this.getCellByContent(child);

    if (cell === undefined) {
      throw new Error(`No cell found with name ${cellName}`);
    }

    cell.contents.splice(cell.contents.indexOf(child, 1));
  }

  private _internalBuild(config: ICellConfig): void {
    this.grid = new Cell(config);

    this._debug.clear();
    this._debug.draw(this.grid);
  }

  private _rebuildContent(cellName: string, child: IPhaser2Grid | IPhaser2Child): void {
    const cell = this.grid.getCellByName(cellName);

    if (cell === undefined) {
      throw new Error(`No cell found with name ${cellName}`);
    }

    this.addContent(child, cell.name);
    this._resetChild(child, cell);
    this._adjustContent(child, cell);
  }

  private _adjustContent(child: IPhaser2Grid | IPhaser2Child, cell: Cell<ICellChild>): void {
    child instanceof Phaser2Grid ? this._adjustGridChild(child, cell) : this._adjustChild(child, cell);
  }

  private _adjustGridChild(child: IPhaser2Grid, cell: Cell<ICellChild>): void {
    const gridConfig = child.getGridConfig();
    gridConfig.bounds = cell.area;
    gridConfig.scale = CellScale.None;
    gridConfig.align = CellAlign.LeftTop;

    child.rebuild(gridConfig);
  }

  private _adjustChild(child: IPhaser2Child, cell: Cell<ICellChild>): void {
    const childArea = child.getBounds();
    let childDimensions = { width: 1, height: 1 };

    // SCALE
    if (cell.scale !== CellScale.None) {
      childDimensions = {
        height: childArea.height / child.worldScale.y,
        width: childArea.width / child.worldScale.x,
      };

      const scale = fit(childDimensions, cell.area, cell.scale);
      child.scale.set(scale.x, scale.y);
    }

    // POSITION
    childDimensions = {
      height: (childArea.height / child.worldScale.y) * child.scale.y,
      width: (childArea.width / child.worldScale.x) * child.scale.x,
    };

    const pos = align(childDimensions, cell.area, cell.align);
    child.position.set(pos.x, pos.y);

    child.x -= ((childArea.x - child.worldPosition.x) / child.worldScale.x) * child.scale.x;
    child.y -= ((childArea.y - child.worldPosition.y) / child.worldScale.y) * child.scale.y;
  }

  private _resetChild(child: IPhaser2Child, cell: Cell<ICellChild>): void {
    child.position.set(0, 0);

    if (cell.scale !== CellScale.None) {
      child.scale.set(1, 1);
    }

    child.updateTransform();
  }
}
