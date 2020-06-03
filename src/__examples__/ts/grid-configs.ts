import { CellAlign, CellScale, IGridConfig } from '@koreez/grid-core';
import { Rect } from '@koreez/grid-core/lib/utils/geom/Rect';

const getCanvasBounds = (): Rect => {
  return new Rect(0, 0, window.game.scale.width, window.game.scale.height);
};

export function getMainViewGridConfig(): IGridConfig {
  return window.game.scale.isLandscape ? getMainViewGridLandscapeConfig() : getMainViewGridPortraitConfig();
}

function getMainViewGridPortraitConfig(): IGridConfig {
  return {
    name: 'main',
    bounds: getCanvasBounds,
    debug: { color: 0x000000 },
    cells: [
      {
        name: 'main_1',
        bounds: { x: 0, y: 0, width: 0.5, height: 1 },
        padding: 0.1,
      },
      {
        name: 'main_2',
        bounds: { x: 0.5, y: 0 },
      },
    ],
  };
}

function getMainViewGridLandscapeConfig(): IGridConfig {
  return {
    name: 'main',
    bounds: getCanvasBounds,
    debug: { color: 0x000000 },
    cells: [
      {
        name: 'main_1',
        bounds: { x: 0, y: 0, width: 0.4, height: 1 },
      },
      {
        name: 'main_3',
        bounds: { x: 0.4, y: 0, width: 0.3, height: 1 },
      },
      {
        name: 'main_2',
        bounds: { x: 0.7, y: 0, width: 0.3, height: 1 },
      },
    ],
  };
}

export function getChildViewGridConfig(): IGridConfig {
  return {
    name: 'ui',
    bounds: getCanvasBounds,
    debug: { color: 0xffffff },
    cells: [
      {
        name: 'ui_1',
        debug: { color: 0xa16639, fill: true },
        bounds: { x: 0, y: 0, height: 0.25 },
        align: CellAlign.LeftTop,
        padding: 0.1,
      },
      {
        name: 'ui_2',
        bounds: { x: 0, y: 0.25, height: 0.25 },
      },
      {
        name: 'ui_3',
        bounds: { x: 0, y: 0.5, height: 0.25 },
        align: CellAlign.RightBottom,
      },
      {
        name: 'ui_4',
        debug: { color: 0x5bc8a1 },
        bounds: { x: 0 },
        padding: 0.2,
        scale: CellScale.ShowAll,
      },
    ],
  };
}
