import { BackgroundType, LayerType } from '@/common/config';
import { Layer, LinearColor, MainData, Panel, TextLayer } from '@/pages/design/interface';
import { v4 as uuid } from 'uuid';
import manageFactory from './manageFactory';
import TransformOperation, { getDiffXYByDiffOrgin, matrixMulti } from './transform';

const Fn = {
  // 计算(公共能力)
  calc: {
    /* 
      计算宽高对应的缩放比例
      iw,ih: 缩放前宽高
      bw,bh: 对比宽高
      ext: 额外数据 x / y 偏移量
      isFull: 是否需要预留ext的偏移量
      
    */
    whScale: (iw: number, ih: number, bw: number, bh: number, ext?: { x?: number; y?: number; isFull?: boolean }) => {
      // 两边间隔40px;上下间隔 40px;
      const ox = ext?.x || 0,
        oy = ext?.y || 0;
      let sx = 1,
        sy = 1;
      // 需要预留空间, iw需要加ox
      if (iw + ox > bw) {
        sx = (bw - ox) / (ext?.isFull ? iw : iw + ox);
      }
      if (ih + oy > bh) {
        sy = (bh - oy) / (ext?.isFull ? ih : ih + oy);
      }
      const mins = Math.min(sx, sy),
        maxs = Math.max(sx, sy);
      return {
        mins,
        maxs,
        minw: iw * mins,
        minh: ih * mins,
        maxw: iw * maxs,
        maxh: ih * maxs,
      };
    },
    /* 
      计算宽高对应的缩放比例
      iw,ih: 缩放前宽高
      bw,bh: 对比宽高
      ratio: 预留的比例 (bw/bh的参考宽高)
      isFull: 是否需要预留的偏移量
    */
    whScaleByRatio: (iw: number, ih: number, bw: number, bh: number, ext?: { ratio?: number; isFull?: boolean }) => {
      const ratio = ext?.ratio || 1;
      let sx = 1,
        sy = 1;
      if (iw > bw * ratio) {
        sx = (bw * ratio) / (ext?.isFull ? iw : iw / ratio);
      }
      if (ih > bh * ratio) {
        sy = (bh * ratio) / (ext?.isFull ? ih : ih / ratio);
      }
      const mins = Math.min(sx, sy),
        maxs = Math.max(sx, sy);
      return {
        mins,
        maxs,
        minw: iw * mins,
        minh: ih * mins,
        maxw: iw * maxs,
        maxh: ih * maxs,
      };
    },
    // 计算宽高对应的缩放比例
    whScaleOnly: (iw: number, ih: number, bw: number, bh: number) => {
      let sx = 1,
        sy = 1;
      sx = bw / iw;
      sy = bh / ih;
      const mins = Math.min(sx, sy),
        maxs = Math.max(sx, sy);
      return {
        mins,
        maxs,
        minw: iw * mins,
        minh: ih * mins,
        maxw: iw * maxs,
        maxh: ih * maxs,
      };
    },
    // 计算宽高对应的缩放比例 type: 'w'根据h的比例,缩放w, 'h'根据w的比例,缩放h
    whScaleOneSide: (type: 'w' | 'h', iw: number, ih: number, bw: number, bh: number) => {
      let sx = 1,
        sy = 1;
      if (type === 'w') {
        /* 根据h缩放w */
        sx = sy = bh / ih;
      } else {
        /* 根据w缩放h */
        sx = sy = bw / iw;
      }
      const mins = Math.min(sx, sy),
        maxs = Math.max(sx, sy);
      return {
        mins,
        maxs,
        minw: iw * mins,
        minh: ih * mins,
        maxw: iw * maxs,
        maxh: ih * maxs,
      };
    },
    toFixed: (num: number, len = 2) => {
      return Number(num?.toFixed(len)) || 0;
    },
    toFixed2: (num: number, len = 2) => {
      if (!num) return num;
      return Fn.calc.toFixed(Math.floor(num * 10 ** len) / 10 ** len);
    },
    /* 文字size的转换计算 */
    removeUnit: (str: string, unit: string = 'px') => {
      return Number(str?.replace(new RegExp(unit, 'g'), '') || 0);
    },
    changeSizeByScale: (size: string, scale: number) => {
      return Fn.calc.removeUnit(size) * scale;
    },
    addUnit: (num: number | string, unit: string = 'px') => {
      return `${num}${unit}`;
    },
  },
  /* 计算(和图层相关) */
  calcByLayer: {
    /* 原始数据,均未与zoom做过等比 */
    getGroupLayerNewWHSById: (id: string) => {
      const WHS = { w: 0, h: 0, s: [1, 1], dx: 0, dy: 0 };
      const layer = manageFactory.getLayerDataById(id)!;
      if (layer) {
        // 组图层的宽高,取决于子图层的最大宽高 (+xy),所以这边不记录组图层的宽高
        const subWs: number[] = [],
          subHs: number[] = [],
          subXs: number[] = [],
          subYs: number[] = [];
        WHS.w = layer.w;
        WHS.h = layer.h;
        WHS.dx = layer.tr.x;
        WHS.dy = layer.tr.y;
        const subIds = manageFactory.getSubIdsById(id);
        subIds.forEach((subId) => {
          const subLayer = manageFactory.getLayerDataById(subId);
          if (subLayer) {
            const tr = new TransformOperation({
              translate: {
                x: subLayer.tr.x,
                y: subLayer.tr.y,
              },
              skew: subLayer.tr.sk,
              scale: subLayer.tr.s,
              rotate: subLayer.tr.r,
            });
            const pos0 = matrixMulti(tr.getMatrix(), [0, 0, 1]);
            const pos1 = matrixMulti(tr.getMatrix(), [subLayer.w, 0, 1]);
            const pos2 = matrixMulti(tr.getMatrix(), [subLayer.w, subLayer.h, 1]);
            const pos3 = matrixMulti(tr.getMatrix(), [0, subLayer.h, 1]);
            const xm = Math.min(pos0[0], pos1[0], pos2[0], pos3[0]),
              ym = Math.min(pos0[1], pos1[1], pos2[1], pos3[1]),
              xM = Math.max(pos0[0], pos1[0], pos2[0], pos3[0]),
              yM = Math.max(pos0[1], pos1[1], pos2[1], pos3[1]);
            const transferW = xM - xm;
            const transferH = yM - ym;
            /* 
              有过变化的图层, 真实宽高就不是layerData的w,h了,需要计算下
              这边使用xy+layerData的w,h的一半,计算出变化的orgin的坐标
              然后加上变化后的宽高,就得到了图层在画布上的真实宽高占位(不改变x,y的情况)
            */
            subWs.push(subLayer.tr.x + (subLayer.w + transferW) / 2);
            subHs.push(subLayer.tr.y + (subLayer.h + transferH) / 2);
            /* 
              组的xy变化,是根据修改数据后, 子图层的最小xy值归0(作为组的原点),来计算
            */
            subXs.push(subLayer.tr.x - (transferW - subLayer.w) / 2);
            subYs.push(subLayer.tr.y - (transferH - subLayer.h) / 2);
          }
        });
        WHS.dx = Math.min(...subXs);
        WHS.dy = Math.min(...subYs);
        WHS.w = Math.max(...subWs) - WHS.dx;
        WHS.h = Math.max(...subHs) - WHS.dy;
        WHS.s = [WHS.w / layer.w, WHS.h / layer.h];
      }
      return WHS;
    },
    /* 
      拖拽后, 子图层的位置变化, 计算出新的缩放事件的返回参数 
    */
    getNewResizeParamWithChildLayer: (id: string, data: { s: number[]; direction: number[] }, zoom: number) => {
      const layer = manageFactory.getLayerDataById(id)!;
      return Fn.calcByLayer.getNewResizeParamByScale(layer, data, zoom, true);
    },
    /* 
      根据缩放比或给定宽或高,计算出新的 缩放事件的返回参数 
      (用于手动修改宽高和组图层拖拽后同步子图层数据) 
      数据是和zoom等比计算的
    */
    getNewResizeParamByScale: (
      layerData: Layer,
      data: { s: number[]; w?: number; h?: number; direction: number[]; offset?: { x: number; y: number } },
      zoom: number,
      isScaleXY = false,
    ) => {
      const result = {
        x: layerData.tr.x * zoom,
        y: layerData.tr.y * zoom,
        w: Fn.verify.isNotEmpty(data.w) ? data.w! * zoom : layerData.w * zoom * data.s[0],
        h: Fn.verify.isNotEmpty(data.h) ? data.h! * zoom : layerData.h * zoom * data.s[1],
        direction: data.direction,
        s: data.s,
      };
      const orgin = {
        x: (layerData.w * zoom) / 2,
        y: (layerData.h * zoom) / 2,
      };
      const cOrgin = {
        x: result.w / 2,
        y: result.h / 2,
      };
      const tr = new TransformOperation({
        translate: {
          x: result.x,
          y: result.y,
        },
        skew: layerData.tr.sk,
        scale: layerData.tr.s,
        rotate: layerData.tr.r,
      });
      const tr1 = new TransformOperation({
        translate: {
          x: result.x * data.s[0] - result.x,
          y: result.y * data.s[1] - result.y,
        },
        skew: layerData.tr.sk,
        scale: layerData.tr.s,
        rotate: layerData.tr.r,
      });
      /* 缩放组图层, 子图层的xy也要跟着变化 - 这边统一原xy和新xy的坐标系(新的orgin), 计算出子图层的xy变化 */
      if (isScaleXY) {
        const { x, y } = getDiffXYByDiffOrgin(cOrgin, cOrgin, tr.getMatrix4_4());
        const { x: xs, y: ys } = getDiffXYByDiffOrgin(cOrgin, cOrgin, tr1.getMatrix4_4());
        return { ...result, x: x + xs, y: y + ys };
      }
      //改变宽高后, 也以原来的orgin计算旋转偏移,避免宽高变动后,位置错位(已左上角为准[切换点位,通过修改xy的值来实现])
      const { x, y } = getDiffXYByDiffOrgin(orgin, cOrgin, tr.getMatrix4_4());
      /* 
        宽高变动后, 还需要偏移xy的差值(并且xy的差值是未transfer的值,这边在wh变化计算后,再计算一次偏移的正确显示值)
      */
      if (data.offset) {
        tr.setTranslate(data.offset.x, data.offset.y);
        const { x: nx, y: ny } = getDiffXYByDiffOrgin(
          { x: result.w / zoom / 2, y: result.h / zoom / 2 },
          { x: result.w / zoom / 2 + data.offset.x, y: result.h / zoom / 2 + data.offset.y },
          tr.getMatrix4_4(),
        );
        return { ...result, x: x + nx * zoom, y: y + ny * zoom };
      }
      return { ...result, x, y };
    },
  },
  // 验证
  verify: {
    isEmpty: (word: unknown, ext?: React.Key | React.Key[]) => {
      const emptys = [undefined, null].concat(ext as []);
      return emptys.some((item) => word === item);
    },
    defaultByEmpty: <T>(defalut: string | number, word: T, ext?: React.Key | React.Key[]) => {
      return Fn.verify.isEmpty(word, ext) ? defalut : word;
    },
    isNotEmpty: (word: unknown, ext?: React.Key | React.Key[]): boolean => {
      return !Fn.verify.isEmpty(word, ext);
    },
    isImageUrl: (text: string) => {
      const pattern = /(?:https?:\/\/|www\.)[\w.-]+(\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+/gi; // eslint-disable-line
      return pattern.test(text);
    },
  },
  // 转换
  trans: {
    rgbaToRgbaStr: (rgba: RgbaColor) => {
      if (!rgba) return '';
      return `rgba(${rgba.r},${rgba.g},${rgba.b},${rgba.a})`;
    },
    linearToLinearStr: (linear?: LinearColor) => {
      if (!linear) return '';
      return `linear-gradient(${linear.angle}deg,${linear.cs
        ?.map((c) => {
          return `${Fn.trans.rgbaToRgbaStr(c.c)} ${c.p * 100}%`;
        })
        .join(',')})`;
    },
    hexToRgba: (hex: string, opacity = 1) => {
      try {
        if (hex.indexOf('#') === 0) {
          hex = hex.slice(1);
        }
        if (hex.length === 3) {
          hex = hex
            .split('')
            .map(function (hex) {
              return hex + hex;
            })
            .join('');
        }
        const num = parseInt(hex, 16);
        const r = num >> 16;
        const g = (num >> 8) & 255;
        const b = num & 255;
        return {
          rgbString: 'rgba(' + r + ', ' + g + ', ' + b + ', ' + opacity + ')',
          rgb: { r, g, b, a: opacity },
        };
      } catch (error) {
        return { rgbString: 'rgba(0, 0, 0, 1)', rgb: { r: 0, g: 0, b: 0, a: 1 } };
      }
    },
    rgbaToHex: (rgba: RgbaColor) => {
      return '#' + ((1 << 24) + (rgba.r << 16) + (rgba.g << 8) + rgba.b).toString(16).slice(1);
    },
    colorStrToRgba: (str: string, defalut?: RgbaColor): RgbaColor => {
      if (str) {
        if (str.indexOf('#') > -1) {
          return Fn.trans.hexToRgba(str).rgb;
        }
        if (str.indexOf('rgb') > -1) {
          const rgba = str.substring(str.indexOf('(') + 1, str.indexOf(')')).split(',');
          return {
            r: (rgba?.[0] || 255) as number,
            g: (rgba?.[1] || 255) as number,
            b: (rgba?.[2] || 255) as number,
            a: (rgba?.[3] || 1) as number,
          };
        }
      }
      return defalut || { r: 255, g: 255, b: 255, a: 1 };
    },
  },
  common: {
    getInitData: (w = 500, h = 500): MainData => {
      return {
        v: '0.0.1',
        nm: '',
        panels: [Fn.common.getPanelInitData(w, h)],
      };
    },
    getPanelInitData: (w = 500, h = 500): Panel => {
      return {
        nm: '',
        id: uuid(),
        w: w,
        h: h,
        bg: {
          color: { c: { r: 255, g: 255, b: 255, a: 1 }, isLinear: false, linear: null },
          type: BackgroundType.COLOR,
          // img: {},
        },
        layers: [],
      };
    },
    deepUpdateLayerId: (layers: Layer[]): Layer[] => {
      return layers.map((layer) => {
        if (layer.ty === LayerType.GROUP && Reflect.has(layer, 'childrens')) {
          return {
            ...layer,
            id: uuid(),
            childrens: Fn.common.deepUpdateLayerId(layer.childrens),
          };
        } else {
          return {
            ...layer,
            id: uuid(),
          };
        }
      });
    },
    arrayJoin: <T, D>(ary: T[], joinData: D) => {
      return ary.reduce(
        (prev, curr, index) => {
          if (index === 0) {
            return [curr];
          }
          return [...prev, joinData, curr];
        },
        [] as (T | D)[],
      );
    },
    reorder: <T>(list: T[], startIndex: number, endIndex: number): T[] => {
      const result = Array.from(list);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);

      return result;
    },
  },
};

export default Fn;

/* 
1. 只注册一次, 避免多次注册
2. 缓存注册函数
*/
export class Listener<T extends Window | HTMLElement> {
  cache = new Map<string, EventListenerOrEventListenerObject>();
  source: T;
  constructor(source: T) {
    this.source = source;
  }
  on: PickByValue<T, 'addEventListener'> = (
    key: string,
    fn: EventListenerOrEventListenerObject,
    options: boolean | AddEventListenerOptions | undefined,
  ) => {
    if (this.cache.has(key)) {
      this.off(key);
    }
    this.cache.set(key, fn);
    this.source?.addEventListener(key, fn, options);
  };
  off = (key: string, fn?: (this: T, ev: unknown) => unknown) => {
    if (this.cache.has(key)) {
      const fun = fn || (this.cache.get(key) as (this: T, ev: unknown) => unknown);
      this.source?.removeEventListener(key, fun);
    }
  };
  destroy = () => {
    this.cache.forEach((value, key) => {
      this.source?.removeEventListener(key, value);
    });
    this.cache.clear();
  };
}

// 处理文本图层 - 新增逻辑
export function handleTextLayer(
  sw: number,
  sh: number,
  text?: string,
  offset?: { x?: number; y?: number },
): DeepPartial<TextLayer> {
  const str = text || '双击编辑文字';
  const scale = 0.6;
  const textList = str.split('\n');
  const maxLen = Math.max(...textList.map((str) => str.length));
  const size = Math.max(12, Math.round((Math.min(sw, sh) * scale) / maxLen));
  const lineHeight = 1.4,
    w = size * maxLen,
    h = size * lineHeight * textList.length;
  // if (w > sw) {
  //   w = sw * scale;
  // }
  return {
    ty: LayerType.TEXT,
    nm: '文字',
    p: str,
    w: w,
    h: h,
    isFixedWH: false,
    tr: {
      x: sw * 0.2 + (offset?.x || 0),
      y: (sh - textList.length * size) / 2 + (offset?.y || 0),
      o: 1,
      font: {
        defaultSize: size + 'px',
        defaultFamily: 'Microsoft YaHei',
        defaultColor: { r: 0, g: 0, b: 0, a: 1 },
        letterSpacing: 0,
        lineHeight: lineHeight,
        align: text ? 'left' : 'center',
      },
    },
  };
}

// 上传图片 - 前端展示模拟 - 后面又后端实现
export type ImgRes = { url: string; w: number; h: number };
export function uploadImgs(blods: File[]): Promise<ImgRes[]> {
  return new Promise((resolve) => {
    const list = blods.map(async (blod) => {
      return uploadImg(blod);
    });
    Promise.all(list).then((res) => {
      resolve(res);
    });
  });
}
export function uploadImg(blod: File): Promise<ImgRes> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(blod);
    const imgRes: ImgRes = {
      url,
      w: 0,
      h: 0,
    };
    const img = new Image();
    img.src = url;
    img.onload = () => {
      imgRes.w = img.width;
      imgRes.h = img.height;
      // URL.revokeObjectURL(url);
      resolve(imgRes);
    };
  });
}

// 获取对应图片地址的真实图片wh信息
export function getImgMsgByUrl(url: string): Promise<ImgRes> {
  return new Promise((resolve) => {
    const imgRes: ImgRes = {
      url,
      w: 0,
      h: 0,
    };
    const img = new Image();
    img.src = url;
    img.onload = () => {
      imgRes.w = img.width;
      imgRes.h = img.height;
      resolve(imgRes);
    };
  });
}
