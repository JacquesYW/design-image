import { createContext } from 'react';
import { Background, ColorBack, Guide, ImageBack, Layer, MainData, Panel } from '@/pages/design/interface';

// 画布数据快照
export const SourceData = createContext<MainData>({} as MainData);
// 画布更新函数
export interface EditFn {
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  updateWH: (wh: { w: number; h: number }) => void;
  updateBgImg: (img: DeepPartial<ImageBack>, isEnd?: boolean) => void;
  replaceBgImg: (
    img: { url: string; w: number; h: number; offset?: { x?: number; y?: number } },
    isEnd?: boolean,
  ) => void;
  switchBgType: (type?: Background['type']) => void;
  updateBgColor: (color: DeepPartial<ColorBack>, isEnd?: boolean) => void;
  updateLayer: (id: string, layer: DeepPartial<Layer>, isEnd?: boolean, isUpdate?: boolean) => Promise<void | unknown>;
  replaceLayer: (path: string, data: Layer[], isEnd?: boolean, isUpdate?: boolean) => Promise<void | unknown>;
  updateLayerAnimations: (path: string, layer: DeepPartial<Layer['anm']>, isEnd?: boolean) => void;
  addLayers: (
    layer: Array<DeepPartial<Layer> | Layer>,
    isEnd?: boolean,
    isRunDefault?: boolean,
  ) => Promise<void | unknown>;
  addTextLayer: (text?: string, offset?: { x?: number; y?: number }) => Promise<void | unknown>;
  addImageLayers: (
    imgs: { url: string; w: number; h: number; offset?: { x?: number; y?: number } }[],
  ) => Promise<void | unknown>;
  addQRCodeLayer: (text?: string, offset?: { x?: number; y?: number }) => Promise<void | unknown>;
  duplicateLayers: (ids: string[], isEnd?: boolean, isRunDefault?: boolean) => void;
  deleteLayer: (ids: string[], isEnd?: boolean) => Promise<void | unknown>;
  changeLayerZindex: (actionType: 'up' | 'down' | 'top' | 'bottom', ids?: string[]) => void;
  changeTemplate: (data: Panel) => void;
  setGuide: (data: Partial<Guide>, isEnd?: boolean) => void;
  lockOrUnLockLayer: (ids: string[] | string, isLocked: boolean, isEnd?: boolean) => void;
  addNewPanelByIndex: (index: number) => Promise<void | unknown>;
  addNewPanelByData: (panel: Panel) => Promise<void | unknown>;
  duplicatePanelByIndex: (index: number) => Promise<void | unknown>;
  deletePanelByIndex: (index: number) => Promise<void | unknown>;
  updatePanel: (
    panelIndex: number,
    panelData: DeepPartial<Omit<Panel, 'layers'>>,
    isEnd?: boolean,
  ) => Promise<void | unknown>;
  replacePanel: (panels: Panel[], isEnd?: boolean) => Promise<void | unknown>;
}
export const EditFn = createContext<EditFn>({} as EditFn);
export type GuideLines = {
  horizontal: number[];
  vertical: number[];
};
// 画笔编辑中数据
export interface EditData {
  selectLayers: string[];
  selectSubLayer: string;
  editParam: {
    type: symbol | '';
    id: string;
  };
  zoom: number;
  panelIndex: number;
  isChoosePanel: boolean;
  showPanelList: boolean;
  setZoom: (zoom: number) => void;
  setSelectLayers: (ids: string[]) => void;
  selectLayersFn: (id: undefined | null | string, isMore?: boolean, isChoosePanel?: boolean) => void;
  unSelectLayersFn: (id: string) => void;
  setEditParam: (param: Partial<PickByValue<EditData, 'editParam'>>) => void;
  setPanelIndex: (index: number) => void;
  setIsChoosePanel: (isChoosePanel: boolean) => void;
  setShowPanelList: (isShowPanelList: boolean) => void;
}
export const EditData = createContext<EditData>({} as EditData);
