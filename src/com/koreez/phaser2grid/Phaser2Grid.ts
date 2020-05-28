import { align, Cell, CellAlign, CellScale, fit, ICellConfig, IContentConfig, IGridConfig } from '@koreez/grid-core';
import { Debugger, IPhaser2Child, IPhaser2Content } from './Types';

export class Phaser2Grid extends Phaser.Group {
  protected grid!: Cell<IGridConfig>;
  private _debugger!: Debugger;

  /**
   * Adds a child to the container.
   *
   * @method addChild
   * @param child {DisplayObject} The DisplayObject to add to the container
   * @return {DisplayObject} The child that was added.
   */
  public addChild(child: PIXI.DisplayObject): PIXI.DisplayObject {
    const c = super.addChild(child);
    if (this._debugger && child !== this._debugger) {
      this.bringToTop(this._debugger);
    }

    return c;
  }

  /**
   * @description Creates Grid object based on input configuration object
   * @param config Input configuration object.
   * @returns {void}
   */
  protected build(config: IGridConfig): void {
    this._internalBuild(config);
  }

  /**s
   * @description Rebuilds Grid. Destroys existing grid and creates new one based on given or existing configuration
   * @param config Input configuration object. Can be empty, to build with existing configuration
   * @returns {void}
   */
  protected rebuild(config?: IGridConfig): void {
    // saves cells references before destroying grid
    const cells = this.grid.getCells();

    // creates new grid
    // this._internalBuild(config || (this.grid.config as IGridConfig));
    this._internalBuild(config || this.grid.config);

    // sets old cells contents in new grid cells
    cells.forEach((cell: Cell<ICellConfig>) => {
      const { name, contents } = cell;
      contents.forEach((content: IPhaser2Content) => {
        const { config: childConfig, child } = content;
        this.setChild(name, child, childConfig);
      });
    });
  }

  /**
   * @description Adds the given Game Object, to this Container.
   * @param cellName Cell name which will hold given child as content
   * @param child The Game Object, to add to the Container.
   * @param config Configuration object, which will be merged with cell configuration
   * @returns {this}
   */
  protected setChild(cellName: string, child: IPhaser2Child, config?: IContentConfig): this {
    const cell = this.grid.getCellByName(cellName);

    if (cell === undefined) {
      throw new Error(`No cell found with name ${cellName}`);
    }

    this.add(child);
    // resets child's position and scale
    child.position.set(0);
    child.updateTransform();

    config = config || {};
    child instanceof Phaser2Grid ? this._setInnerGrid(child, config, cell) : this._setChild(child, config, cell);

    return this;
  }

  protected destroyChild(child: IPhaser2Child, ...destroyArgs: any[]) {
    child.destroy.call(child, ...destroyArgs);

    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.grid.cells.length; i += 1) {
      const cell = this.grid.cells[i];

      for (let j = 0; j < cell.contents.length; j += 1) {
        const content = cell.contents[j];

        if (content.child === child) {
          cell.contents.splice(j, 1);
          return;
        }
      }
    }
  }

  protected getCellByName(name: string) {
    return this.grid.getCellByName(name);
  }

  protected getCellBoundsByName(name: string) {
    return this.getCellByName(name)?.bounds;
  }

  protected getCellContentAreaByName(name: string) {
    return this.getCellByName(name)?.contentArea;
  }

  private _setChild(child: IPhaser2Child, config: IContentConfig, cell: Cell<ICellConfig>): this {
    const cb = child.getBounds();

    let cDimensions = { width: 1, height: 1 };

    // MERGE
    const merged = cell.mergeContentConfig(config);
    const cellDimensions = { width: merged.area.width, height: merged.area.height };

    // SCALE
    if (merged.scale !== CellScale.None) {
      cDimensions = {
        height: cb.height / child.worldScale.y,
        width: cb.width / child.worldScale.x,
      };

      const scale = fit(cDimensions, cellDimensions, merged.scale);
      child.scale.set(scale.x, scale.y);
    }

    // POSITION
    cDimensions = {
      height: (cb.height / child.worldScale.y) * child.scale.y,
      width: (cb.width / child.worldScale.x) * child.scale.x,
    };

    const pos = align(cDimensions, merged.area, merged.align);
    child.position.set(pos.x + merged.offset.x, pos.y + merged.offset.y);

    child.x -= ((cb.x - child.worldPosition.x) / child.worldScale.x) * child.scale.x;
    child.y -= ((cb.y - child.worldPosition.y) / child.worldScale.y) * child.scale.y;

    // debugs content area considered paddings
    if (config && config.debug) {
      const { color = this._debugger.defaultStrokeColor } = config.debug;
      const { x, y, width, height } = merged.area;
      this._debugger.lineStyle(5, color, 1);
      this._debugger.drawRect(x, y, width, height);
      this.bringToTop(this._debugger);
    }

    cell.contents.push({ child, config });

    return this;
  }

  private _setInnerGrid(child: Phaser2Grid, config: IContentConfig, cell: Cell<ICellConfig>): this {
    child.scale.set(1);

    // @ts-ignore
    const gridConfig = child.getGridConfig();
    gridConfig.bounds = () => cell.contentArea;
    gridConfig.scale = CellScale.None;
    gridConfig.align = CellAlign.LeftTop;

    // @ts-ignore
    child.rebuild(gridConfig);
    cell.contents.push({ child, config });

    return this;
  }

  private _internalBuild(config: IGridConfig): void {
    this.grid = new Cell(config);

    if (config.debug) {
      if (this._debugger === undefined) {
        this._debugger = new Debugger(this.game);
        this._debugger.defaultStrokeColor = config.debug.color !== undefined ? config.debug.color : 0xffffff;

        this.add(this._debugger);
      } else {
        this._debugger.clear();
      }
      this._debug(this.grid);
    }
  }

  private _debug(cell: Cell<ICellConfig>, lineWidth: number = 10): void {
    const { x: bx, y: by, width: bw, height: bh } = cell.bounds;
    const { x: px, y: py, width: pw, height: ph } = cell.contentArea;
    const { defaultStrokeColor } = this._debugger;

    this._debugger.lineStyle(lineWidth * 0.8, defaultStrokeColor, 1);
    this._debugger.drawRect(px, py, pw, ph);
    this._debugger.lineStyle(lineWidth, defaultStrokeColor, 1);
    this._debugger.drawRect(bx, by, bw, bh);

    cell.cells.forEach((el: Cell<ICellConfig>) => this._debug(el, lineWidth * 0.7));
  }
}
