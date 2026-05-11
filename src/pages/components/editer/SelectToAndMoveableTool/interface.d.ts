import { GuideLines } from '@/pages/design/context';

export type onDragParam = { id: string; x: number; y: number };
// 批量编辑时, 会有xy的变动
export type onRotateParam = { id: string; r: number; x?: number; y?: number };
/* 
    direction位置信息图
    [-1,-1]  [0,-1]  [1,-1]
    [-1, 0]  [0, 0]  [1, 0]
    [-1, 1]  [0, 1]  [1, 1]
  */
export type onResizeParam = {
  id: string;
  w: number;
  h: number;
  sr: number;
  x: number;
  y: number;
  s: number[];
  direction: number[];
};
export type onScaleParam = { id: string; x: number; y: number; w: number; h: number; s: number[]; direction: number[] };
export interface SelectToProps {
  /* 公共参数 */
  // 容器 (2个功能同一个容器)
  container: HTMLElement;
  dragContainer: HTMLElement;
  zoom?: number;
  guideLines?: GuideLines;
  /* selectTo参数 */
  // 是否禁止触发框选
  disabled: boolean;
  isHint: (point: IVector) => string | null | undefined;
  onDragStart?: (e: MouseEvent, ids: string[]) => void;
  // 多元素拖拽时,出来未拖拽的点击事件
  onLayerClick?: (e: MouseEvent) => void;
  // 选中(框选结束后触发)
  selectEnd: (ids: string[]) => void;
  // 选中target的id集合
  ids: string[];
  onDragEnd?: (positions: onDragParam[]) => void;
  onRotateEnd?: (rotates: onRotateParam[]) => void;
  onResize?: (resizables: onResizeParam[]) => void;
  onResizeEnd?: (resizables: onResizeParam[]) => void;
  onScale?: (scales: onScaleParam[]) => void;
  onScaleEnd?: (scales: onScaleParam[]) => void;
}
