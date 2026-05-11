import { LayerType, BackgroundType, QRCodeErrorLevel } from '@/common/config';
import Delta from 'quill-delta';
import { AnimationSettingType } from './constants';
// 设计时数据/函数类型

// 画布数据编辑函数类型
export type MainData = {
  // 画布版本
  v: string;
  // 画布名称
  nm: string;
  // 卡尺-辅助线
  guide?: Guide;
  // 记录图片资源, 用于预加载(canvas 也方便出路)
  assets?: Asset[];
  panels: Panel[];
};
export interface Panel {
  // 画板名称
  nm: string;
  id: string;
  // 画板宽高
  w: number;
  h: number;
  // 画布背景
  bg: Background;
  // 画布图层
  layers: Layer[];
}
export type Guide = {
  show: boolean;
  // 锁定, 不能拖拽编辑
  isLock: boolean;
  hLines: number[];
  vLines: number[];
};
// 资源数据, 当前只有图片资源
export interface Asset {
  // 图片id
  id: string;
  // 图片地址
  p: string;
  // 图片真实宽高
  w?: number;
  h?: number;
}

// 画布背景
export type Background = {
  type: BackgroundType;
  // 颜色背景 (rgba)
  color: ColorBack;
  // 图片背景
  img?: ImageBack;
};
export type ColorBack = {
  // 颜色背景 (rgba)
  c?: RgbaColor;
  // 是否渐变色
  isLinear?: boolean;
  // 渐变色
  linear?: LinearColor | null;
};
export type LinearColor = {
  // 渐变色集合
  cs: Array<{
    // 颜色
    c: RgbaColor;
    // 位置占比
    p: number;
  }>;
  // 渐变色角度(默认向右==90°)
  angle: number;
};
// 图片背景
export type ImageBack = {
  // 图片地址
  p: string;
  // 图片展示宽高
  w: number;
  h: number;
  // 图片真实宽高
  imgW: number;
  imgH: number;
  // 背景图片变换记录
  tr?: {
    palette?: Palette;
    clip?: Clip;
    // 翻转
    flip?: Flip;
  };
};
export type Flip = {
  // 水平翻转
  h?: boolean;
  // 垂直翻转
  v?: boolean;
};
/* 
  图片裁剪数据类型
*/
export type Clip = {
  // 缩放比例
  s: number;
  // 图片位置(相对于 - 画布/展示图层)
  x: number;
  y: number;
};

// 调色板
export type Palette = {
  // 调色透明度
  o: number;
  // 调色颜色
  c: string;
};

export interface LayerAnimation {
  // 动画类型 (与预设的tweenjs动画函数名一致)
  ty: string;
  // 动画时间
  t: {
    // 开始时间
    // i: number;
    // 结束时间
    // o: number;

    [k: string]: unknown;
  };
}

// 图层数据
export interface MainLayer {
  // 图层id
  id: string;
  // 图层名称
  nm?: string;
  // 图层类型
  ty: string;
  // 图层宽高(展示)
  w: number;
  h: number;
  // 是否锁定
  isLocked: boolean;
  // 图层变换信息
  tr: MainTransform;
  // 翻转
  flip?: Flip;
  // 绑定的动画
  anm?: LayerAnimation[];
}

export interface GroupLayer extends MainLayer {
  ty: LayerType.GROUP;
  childrens: Layer[]; // 子图层
}
// 文本图层
export interface TextLayer extends MainLayer {
  p: Delta | string;
  ty: LayerType.TEXT;
  tr: TextTransform;
  isFixedWH: boolean;
}

// 图片图层
export interface ImageLayer extends MainLayer {
  p: string;
  ty: LayerType.IMAGE;
  // 裁剪信息
  clip?: Clip;
  /* 图片展示宽 */
  imgW: number;
  imgH: number;
  tr: ImageTransform;
}
// 矢量图
export interface ShapeLayer extends MainLayer {
  ty: LayerType.SHAPE;
  // 裁剪信息
}

export interface QrCodeLayer extends MainLayer {
  ty: LayerType.QRCODE;
  // 二维码内容
  p: string;
  // 二维码中间的标签
  icon?: string;
  url?: string;
  // 二维码背景填充色 (默认#fff)
  bgc: string;
  // 二维码点位填充色 (默认#000)
  fgc: string;
  // 二维码容错等级
  errorLevel: QRCodeErrorLevel;
}
export type Layer = GroupLayer | TextLayer | ImageLayer | QrCodeLayer | ShapeLayer;

// 主要变换信息
export interface MainTransform {
  // 位置信息
  x: number;
  y: number;
  // 透明度
  o: number;
  // 旋转角度
  r: number;
  // 缩放比例(暂时没用 - 缩放是做宽高的计算)
  s?: number | IVector;
  // 倾斜角度
  sk?: number | IVector;
}
// 文本变换信息
export interface TextTransform extends MainTransform {
  /* 文本图层,不同文字有不同属性 */
  // 文本信息 - 公共处理(其他字体等属性,单独处理)
  font: {
    // 最外层默认文字大小
    defaultSize: string;
    defaultFamily: string;
    defaultColor: RgbaColor;
    // 文本字间距 精度0
    letterSpacing: number;
    // 文本行间距 精度2 => 0.00
    lineHeight: number;
    // 文本对齐方式 (left  center right justify fullWidth[分散对齐])
    align: string;
    // 文本书写方向 ((vertical-rl)) / *-lr | horizontal-tb
    writingMode?: string;
    // 填充色 - 渐变使用
    fillColor?: LinearColor | null;
    isShowFillColor?: boolean;
    ishaveFillColor?: boolean;
    /* 和文字渐变色实现方式冲突 -用before先实现- 等后面改canvas再优化 */
    // 文本描边颜色
    strokeColor?: LinearColor | null;
    // 文本描边宽度
    strokeWidth?: number;
    isShowStroke?: boolean;
    ishaveStroke?: boolean;
  };
}
// 图片变换信息
export interface ImageTransform extends MainTransform {
  // 图片信息
  mask?: MaskType;
}
// 图片遮罩信息接口
export interface MaskType {
  // 固定遮罩的类型名称
  ty: string;
}

interface AnimationSchemaSettingBase<T extends AnimationSettingType, V, P> {
  label: string;
  name: string;
  type: T;
  default?: V;
  props?: P;
}

export type AnimationSettingNumberValue = number;
export interface AnimationSettingNumberProps {
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
  unit?: string;
}
export type AnimationSchemaSettingNumber = AnimationSchemaSettingBase<
  AnimationSettingType.Number,
  AnimationSettingNumberValue,
  AnimationSettingNumberProps
>;
export type AnimationSchemaSettingDelay = AnimationSchemaSettingBase<
  AnimationSettingType.Delay,
  AnimationSettingNumberValue,
  AnimationSettingNumberProps
>;

export type AnimationSettingSwitchValue = boolean;
export interface AnimationSettingSwitchProps {}
export type AnimationSchemaSettingSwitch = AnimationSchemaSettingBase<
  AnimationSettingType.Switch,
  AnimationSettingSwitchValue,
  AnimationSettingSwitchProps
>;

export type AnimationSettingSelectValue = string | number;
export interface AnimationSettingSelectOption {
  label: string;
  value: string | number;
  icon?: string;
}
export interface AnimationSettingSelectProps {
  options: AnimationSettingSelectOption[] | (() => AnimationSettingSelectOption[]);
}
export type AnimationSchemaSettingSelect = AnimationSchemaSettingBase<
  AnimationSettingType.Select,
  AnimationSettingSelectValue,
  AnimationSettingSelectProps
>;

export type AnimationSettingRangeValue = number;
export interface AnimationSettingRangeProps {
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
  unit?: string;
}
export type AnimationSchemaSettingRange = AnimationSchemaSettingBase<
  AnimationSettingType.Range,
  AnimationSettingRangeValue,
  AnimationSettingRangeProps
>;

export type AnimationSchemaSetting<T extends AnimationSettingType = AnimationSettingType> =
  T extends AnimationSettingType.Number
    ? AnimationSchemaSettingNumber
    : T extends AnimationSettingType.Switch
      ? AnimationSchemaSettingSwitch
      : T extends AnimationSettingType.Select
        ? AnimationSchemaSettingSelect
        : T extends AnimationSettingType.Range
          ? AnimationSchemaSettingRange
          : T extends AnimationSettingType.Delay
            ? AnimationSchemaSettingDelay
            : never;

export interface AnimationSchemaTween {
  ease?: string;
  from: number;
  to: number;
  repeat?: number;
  yoyo?: boolean;
  init: (
    originalLayerData: MainLayer | null,
    animationSetting: LayerAnimation,
  ) => null | { from?: object | null; to?: object | null; setting?: object | null };
  update?: (
    animationState: object,
    layerState: object,
    originalLayerData: MainLayer | null,
    animationSetting: LayerAnimation,
  ) => object;
}

export interface AnimationSchema {
  type: string;
  name: string;
  previewImage: string;
  settings: AnimationSchemaSetting[];
  defaults?: {
    [k: string]:
      | AnimationSettingNumberValue
      | AnimationSettingSwitchValue
      | AnimationSettingSelectValue
      | AnimationSettingRangeValue;
  };
  tweens: AnimationSchemaTween[];
}

export type AnimationUpdateCallback = (state: object) => void;
