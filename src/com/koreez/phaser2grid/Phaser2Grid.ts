import { align, Cell, CellScale, fit, ICellConfig } from '@koreez/grid-core';
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
    return this.grid.getCells().find(cell => cell.contents.includes(content));
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
    this.addChild(child);
    this._patchChildDestroy(child, cellName);
    this._rebuildContent(cellName, child);

    this._debug.bringToTop();

    return this;
  }

  protected rebuildChild(child: IPhaser2Child, cellName?: string): this {
    const cell = this.getCellByContent(child);

    if (cell === undefined) {
      throw new Error(`No cell found with ${child}`);
    }

    if (cellName === undefined) {
      cellName = cell.name;
    }

    this._removeContent(child);
    this._rebuildContent(cellName, child);

    return this;
  }

  _patchChildDestroy(child: IPhaser2Child, cellName: string) {
    const childDestroy = child.destroy;
    child.destroy = (...args: any[]) => {
      childDestroy.call(child, ...args);

      this._removeContent(child);
    };
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

    this._removeContent(child);
    this._addContent(child, cell);
    this._resetContent(child, cell);
    this._adjustContent(child, cell);
  }

  protected _addContent(child: IPhaser2Child, cell: Cell<ICellChild>): void {
    cell.contents.push(child);
  }

  protected _removeContent(child: IPhaser2Child): void {
    const cell = this.getCellByContent(child);

    if (cell === undefined) {
      return;
    }

    cell.contents.splice(cell.contents.indexOf(child, 1));
  }

  private _adjustContent(child: IPhaser2Grid | IPhaser2Child, cell: Cell<ICellChild>): void {
    child instanceof Phaser2Grid ? this._adjustGridChild(child, cell) : this._adjustChild(child, cell);
  }

  private _adjustGridChild(child: IPhaser2Grid, cell: Cell<ICellChild>): void {
    const gridConfig = child.getGridConfig();
    gridConfig.bounds = cell.area;

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

  private _resetContent(child: IPhaser2Child, cell: Cell<ICellChild>): void {
    child.position.set(0, 0);

    if (cell.scale !== CellScale.None) {
      child.scale.set(1, 1);
    }

    child.updateTransform();
  }
}
