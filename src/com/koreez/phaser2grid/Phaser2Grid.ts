import { align, Cell, CellAlign, CellScale, fit, ICellConfig, IGridConfig } from '@koreez/grid-core';
import { Debugger } from './Debugger';
import { IPhaser2Child, IPhaser2Grid } from './Types';

export abstract class Phaser2Grid extends Phaser.Group implements IPhaser2Grid {
  public abstract getGridConfig(): IGridConfig;

  protected grid!: Cell<IGridConfig, IPhaser2Child | IPhaser2Grid>;

  private _debugger!: Debugger;

  protected getCellByName(name: string) {
    return this.grid.getCellByName(name);
  }

  protected getCellByContent(content: IPhaser2Child | IPhaser2Grid): Cell<any, any> | undefined {
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
  public rebuild(config?: IGridConfig): void {
    // saves cells references before destroying grid
    const cells = this.grid.getCells();

    // creates new grid
    this._internalBuild(config || this.grid.config);

    // sets old cells contents in new grid cells
    cells.forEach(cell => cell.contents.forEach(content => this.setChild(cell.name, content)));
  }

  /**
   * @description Creates Grid object based on input configuration object
   * @param config Input configuration object.
   * @returns {void}
   */
  protected build(config: IGridConfig): void {
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
    child.position.set(0, 0);
    child.updateTransform();
    child instanceof Phaser2Grid ? this._setChildGrid(child, cell) : this._setChild(child, cell);

    return this;
  }

  protected destroyChild(child: IPhaser2Child | IPhaser2Grid, ...destroyArgs: any[]): void {
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

  private _setChild(child: IPhaser2Child, cell: Cell<ICellConfig, IPhaser2Child>): this {
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
    child.position.set(pos.x + cell.offset.x, pos.y + cell.offset.y);

    child.x -= ((childArea.x - child.worldPosition.x) / child.worldScale.x) * child.scale.x;
    child.y -= ((childArea.y - child.worldPosition.y) / child.worldScale.y) * child.scale.y;

    this.addContent(child, cell.name);

    if (this._debugger) {
      this.bringToTop(this._debugger);
    }

    return this;
  }

  private _setChildGrid(child: IPhaser2Grid, cell: Cell<IGridConfig, IPhaser2Child | IPhaser2Grid>): this {
    child.scale.set(1, 1);

    const gridConfig = child.getGridConfig();
    gridConfig.bounds = () => cell.area;
    gridConfig.scale = CellScale.None;
    gridConfig.align = CellAlign.LeftTop;

    child.rebuild(gridConfig);
    this.addContent(child, cell.name);

    if (this._debugger) {
      this.bringToTop(this._debugger);
    }

    return this;
  }

  private _internalBuild(config: IGridConfig): void {
    this.grid = new Cell(config);

    if (this._debugger) {
      this._debugger.clear();
    }

    this._debug(this.grid);
  }

  private _debug(
    cell: Cell<ICellConfig | IGridConfig, IPhaser2Child>,
    lineWidth: number = 10,
    parentDebug?: { color?: number; fill?: boolean },
  ): void {
    const { x: bx, y: by, width: bw, height: bh } = cell.bounds;
    const { x: px, y: py, width: pw, height: ph } = cell.area;
    const { debug = parentDebug } = cell.config;

    if (debug) {
      if (this._debugger === undefined) {
        // Init debugger
        this._debugger = new Debugger(this.game);
        this.add(this._debugger);
      }

      const { color, fill } = debug;

      // Draw content area
      fill
        ? this._debugger.fillRect(px, py, pw, ph, lineWidth * 0.8, color)
        : this._debugger.strokeRect(px, py, pw, ph, lineWidth * 0.8, color);

      // Draw cell bounds
      fill
        ? this._debugger.fillRect(bx, by, bw, bh, lineWidth, color)
        : this._debugger.strokeRect(bx, by, bw, bh, lineWidth, color);
    }

    cell.cells.forEach(el => this._debug(el, lineWidth * 0.7, debug));
  }
}
