import { align, Cell, CellAlign, CellScale, fit, ICellConfig, IContentConfig, IGridConfig } from '@koreez/grid-core';
import { Debugger, IPhaser2Child, IPhaser2Content } from './Types';

export class Phaser2Grid extends Phaser.Group {
  private grid!: Cell<IGridConfig>;
  private debugger!: Debugger;

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
    this._internalBuild(config || (this.grid.config as IGridConfig));

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
    child.scale.set(this.scale.x, this.scale.y);
    child.updateTransform();

    if (child instanceof Phaser2Grid) {
      config = config || {};
      config.scale = CellScale.None;
      config.align = CellAlign.LeftTop;
      child.grid.config.bounds = () => cell.contentArea;
      child.rebuild();
    } else {
      const cb = child.getBounds();
      const ct = child.worldTransform;

      // child.getLocalBounds();

      let cDimensions = { width: 1, height: 1 };

      // MERGE
      const merged = cell.mergeContentConfig(config);
      const cellDimensions = { width: merged.area.width, height: merged.area.height };

      // SCALE
      cDimensions = {
        height: (cb.height / child.worldScale.y) * child.scale.y,
        width: (cb.width / child.worldScale.x) * child.scale.x,
      };

      const scale = fit(cDimensions, cellDimensions, merged.scale);
      child.scale.set(scale.x, scale.y);

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
        const { color = this.debugger.defaultStrokeColor } = config.debug;
        const { x, y, width, height } = merged.area;
        this.debugger.lineStyle(5, color, 1);
        this.debugger.drawRect(x, y, width, height);
        this.bringToTop(this.debugger);
      }
    }

    cell.contents.push({ child, config });

    return this;
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

  private _internalBuild(config: IGridConfig): void {
    this.grid = new Cell(config);

    if (config.debug) {
      if (this.debugger === undefined) {
        this.debugger = new Debugger(this.game);
        this.debugger.defaultStrokeColor = config.debug.color || 0xffffff;
        this.add(this.debugger);
      } else {
        this.debugger.clear();
      }
      this._debug(this.grid);
    }
  }

  private _debug(cell: Cell<ICellConfig>, lineWidth: number = 10): void {
    const { x: bx, y: by, width: bw, height: bh } = cell.bounds;
    const { x: px, y: py, width: pw, height: ph } = cell.contentArea;
    const { defaultStrokeColor } = this.debugger;

    this.debugger.lineStyle(lineWidth * 0.8, defaultStrokeColor, 1);
    this.debugger.drawRect(px, py, pw, ph);
    this.debugger.lineStyle(lineWidth, defaultStrokeColor, 1);
    this.debugger.drawRect(bx, by, bw, bh);

    cell.cells.forEach((el: Cell<ICellConfig>) => this._debug(el, lineWidth * 0.7));
  }
}
