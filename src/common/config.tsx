import { GroupIcon, TextIcon } from '@/pages/components/svgIcon';
import { BlockOutlined, PictureOutlined, QrcodeOutlined } from '@ant-design/icons';

// 编辑类型枚举
export const EditTypeEnum = {
  // 背景图裁剪 (也是背景图dom的id)
  BGIMAGECLIP: Symbol('bg-image-clip'),
  // 物料图片裁剪
  MATERIALIMAGECLIP: Symbol('material-image-clip'),
  // 文字编辑
  TEXTEDIT: Symbol('text-edit'),
  // 组内移动
  GROUPINSIDEMOVE: Symbol('group-inside-move'),
};

// 存在事件冲突的编辑类型集合
export const EventsManageByEditType = {
  isEditBg: <T,>(editType: T) => EditTypeEnum.BGIMAGECLIP == editType,
  /* 
    编辑文字只是状态替换, 没有层级问题
  */
  isClipImage: <T,>(editType: T) => ([EditTypeEnum.MATERIALIMAGECLIP] as T[]).includes(editType),
  /* 
    图层编辑
  */
  isEditLayer: <T,>(editType: T) => ([EditTypeEnum.TEXTEDIT, EditTypeEnum.MATERIALIMAGECLIP] as T[]).includes(editType),
  isUnSelectTo: <T,>(editType: T) =>
    ([EditTypeEnum.BGIMAGECLIP, EditTypeEnum.MATERIALIMAGECLIP] as T[]).includes(editType),
};

// 暂定图标裁剪最大缩放倍数
export const MAXSCALE = 3;
// 设计 - 工具区域 id
export const DESIGNCANVASCONTAINER = 'design-canvas-container';
// 设计 - 展示内容区 - 无工具dom
export const DESIGNCANVASCONTENT = 'design-canvas-content';
// 设计 - 图层区域 id
export const DESIGNCANVASID = 'design-container';
// 设计 - 总区域id
export const DESIGNOUTERID = 'design-outer';
// 左侧看板
export const LETFBARID = 'letf-bar';
// 右侧看板 - 文本编辑工具栏
export const RIGHTPANELTEXTEDITORTOOL = 'right-panel-text-editor-tool';

/* 图层layer固定样式类 */
export const DEFAULT_LAYER_CLASS = 'edit-layer';
export const DEFAULT_LAYER_CLASS_HOVER = 'edit-layer-hover';
export const DEFAULT_LAYER_CLASS_SELECTED = 'edit-layer-selected';

/* transformBox-subId */
export const TRANSFORMBOXSUBID = 'transformbox-subId';

// copy 的图层偏移量
export const COPYOFFSETSTEP = 5;

// 图层外层位移包裹id
export const getTransformBoxSubId = (id: string) => `${TRANSFORMBOXSUBID}-${id}`;

// 画布背景类型
export enum BackgroundType {
  IMAGE = 'image',
  COLOR = 'color',
}

/* 图层类型元组 */
export enum LayerType {
  GROUP = 'group',
  TEXT = 'text',
  IMAGE = 'image',
  SHAPE = 'shape',
  QRCODE = 'qrcode',
}

// 图层类型的文案
export const nameByTr = {
  [LayerType.GROUP]: '组',
  [LayerType.TEXT]: '文本',
  [LayerType.IMAGE]: '图片',
  [LayerType.SHAPE]: '形状',
  [LayerType.QRCODE]: '二维码',
};

const defaultLayerIcon = (size: number) => <BlockOutlined size={size} />;
// 图层类型的文案
export const IconByTy = {
  [LayerType.GROUP]: (size: number) => <GroupIcon size={size} />,
  [LayerType.TEXT]: (size: number) => <TextIcon size={size} />,
  [LayerType.QRCODE]: (size: number) => <QrcodeOutlined size={size} />,
  [LayerType.IMAGE]: (size: number) => <PictureOutlined size={size} />,
  [LayerType.SHAPE]: defaultLayerIcon,
  default: defaultLayerIcon,
};

export enum QRCodeErrorLevel {
  L = 'L',
  M = 'M',
  Q = 'Q',
  H = 'H',
}

export const pasteEvent = new ClipboardEvent('paste', { clipboardData: new DataTransfer() });
