import { Matrix3_3_css } from './interface';
import Fn from './utils';

type FnReturn = Promise<{ analyse: ImageAnalyse; isLoaded: boolean }>;
/* 
  图片附加功能函数
  1. 透明区域验证
  2. 其他(滤镜等功能后续添加)

  透明验证坐标系:
  是对应元素,旋转/缩放/倾斜/平移后的坐标系(左上角为原点)

  图层在canvas中的坐标系:
  以中心点为原点,旋转/缩放/倾斜/平移
*/
class ImageAnalyse {
  url: string | null;
  // 图片真实宽高
  imgW: number | null;
  imgH: number | null;
  // 显示宽高(canvas根据真实宽高做等比例缩放绘制) [矩阵变换前]
  sw: number | null;
  sh: number | null;
  // canvas画布宽高(对应dom的getBoundingClientRect的宽高) [矩阵变换后]
  cw: number | null;
  ch: number | null;
  // 图片变换矩阵
  matrix: Matrix3_3_css | null;
  // 图片对象
  img: HTMLImageElement | null;
  // 是否加载完成(图片加载完成后,才能进行其他操作)
  isLoaded = false;
  // 图片加载完成后的回调函数 (初始化时传入,更新url时返回promise)
  onload: ((t: ImageAnalyse) => void) | undefined;
  // canvas对象
  cas: HTMLCanvasElement | null;
  // canvas绘制上下文
  ctx: CanvasRenderingContext2D | null;
  constructor({
    url,
    canvasWidth,
    canvasHeight,
    showWidth,
    showHeight,
    matrix,
    onload,
  }: {
    url?: string;
    /* 矩阵变换后真实展示宽高 */
    canvasWidth?: number;
    canvasHeight?: number;
    // 矩阵变换前宽高
    showWidth?: number;
    showHeight?: number;
    matrix?: Matrix3_3_css;
    onload?: (t: ImageAnalyse) => void;
  } = {}) {
    this.url = url || '';
    this.sw = showWidth || 0;
    this.sh = showHeight || 0;
    this.cw = canvasWidth || 0;
    this.ch = canvasHeight || 0;
    this.imgW = 0;
    this.imgH = 0;
    this.matrix = matrix || null;
    this.img = new Image();
    this.cas = document.createElement('canvas');
    this.cas.width = this.cw;
    this.cas.height = this.ch;
    /* 
      该函数需要频繁调用 getImageData, 会导致性能问题
      willReadFrequently: true 优化canvas读取性能
    */
    this.ctx = this.cas.getContext('2d', { willReadFrequently: true });
    this.onload = onload;
    this.loadImg();
  }
  loadImg(reLoad = true): FnReturn {
    if (this.url && reLoad) {
      return new Promise((resolve) => {
        if (this.img) {
          // 避免图片地址是https的跨域地址
          this.img.crossOrigin = 'anonymous';
          (this.img as HTMLImageElement).src = this.url as string;
          (this.img as HTMLImageElement).onload = () => {
            this.imgW = (this.img as HTMLImageElement).width;
            this.imgH = (this.img as HTMLImageElement).height;
            this.canvasDraw();
            // 初始化时 - 传入url的回调函数
            this.onload && this.onload(this);
            // 更新url时 - 返回promise
            resolve({ analyse: this, isLoaded: this.isLoaded });
          };
        }
      });
    }
    return Promise.resolve({ analyse: this, isLoaded: this.isLoaded });
  }
  canvasDraw() {
    if (!(this.ctx && this.sw && this.sh && this.cw && this.ch)) return false;
    if (!this.url || !this.img) return false;
    // 清空transform变换缓存
    this.ctx.resetTransform();
    // 先清空画布
    this.ctx.clearRect(0, 0, this.cw as number, this.ch as number);
    /* 等比例 绘制到画布中 */

    if (this.matrix && this.matrix.length === 6) {
      /* 
        设置画笔起点位置 
        1. 以中心点为变换原点
          1.1 x = cw / 2, y = ch / 2
        2. 偏移值 (**外部处理偏移值的计算顺序 - 保证偏移值的正确性, 如: 旋转后的偏移值,需要做旋转后的偏移值计算 rotateMatrix * [x,y,1])
          3.1 x = x + matrix[4] , y = y + matrix[5]
      */
      this.ctx.translate(this.cw / 2 + this.matrix[4], this.ch / 2 + this.matrix[5]);
      // 矩阵变换
      this.ctx.transform(this.matrix[0], this.matrix[1], this.matrix[2], this.matrix[3], 0, 0);
      this.ctx.drawImage(this.img, -this.sw / 2, -this.sh / 2, this.sw, this.sh);
    } else {
      this.ctx.drawImage(this.img, 0, 0, this.sw, this.sh);
    }
    // 确认所有数据加载完成
    this.isLoaded = true;
  }
  setMatrix(matrix: Matrix3_3_css) {
    this.matrix = matrix;
    this.isLoaded = false;
    this.canvasDraw();
    return this;
  }
  /* 修改图片地址,需要重新初始化 */
  setUrl(url: string): FnReturn {
    if (this.url != url) {
      this.url = url;
      this.isLoaded = false;
      return this.loadImg();
    }
    return this.loadImg(false);
  }
  /* 修改展示宽高,需要重新初始化 */
  setWH({ w, h }: { w: number; h: number }): ImageAnalyse {
    this.sw = w;
    this.sh = h;
    this.isLoaded = false;
    this.canvasDraw();
    return this;
  }
  /* 修改canvas绘制宽高,需要重新初始化 */
  setCanvasWH({ w, h }: { w: number; h: number }): ImageAnalyse {
    this.cw = w;
    this.ch = h;
    if (this.cas) {
      this.cas.width = w;
      this.cas.height = h;
    }
    this.isLoaded = false;
    this.canvasDraw();
    return this;
  }
  /* 
    判断图片对应坐标是否是透明颜色
    x,y: 坐标 (是相对于图片 左上角的坐标)
  */
  isTransparent({ x, y }: { x: number; y: number }): boolean {
    if (!this.isLoaded) return false;
    if (Fn.verify.isEmpty(x) || Fn.verify.isEmpty(y)) return false;
    const imgData = this.ctx?.getImageData(x, y, 1, 1).data || [];
    if (imgData.length == 4 && imgData[3] === 0) {
      return true;
    } else {
      return false;
    }
  }
  getImg() {
    return this.cas?.toDataURL() || '';
  }
  destroy() {
    this.url = null;
    this.imgW = null;
    this.imgH = null;
    this.sw = null;
    this.sh = null;
    this.cw = null;
    this.ch = null;
    this.img = null;
    this.ctx = null;
    this.isLoaded = false;
    this.onload = undefined;
    this.cas = null;
  }
}

export default ImageAnalyse;
