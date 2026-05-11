import { IVector, Matrix3_3, Matrix3_3_css, Matrix4_4 } from './interface';
import Fn from './utils';
interface ITransformOperation {
  rotate?: number;
  scale?: IVector | number;
  skew?: IVector | number;
  translate?: IVector | number;
  width?: number;
  height?: number;
}
/* 
  图元的变换类
  1. 处理生成 transform 对应矩阵样式
  2. 处理点到图元的碰撞检测
  3. 处理图元的变换(如: [水平翻转 / 垂直翻转] / 旋转 / 平移 / 缩放 / 倾斜)

  矩阵变换, 对应transform直接编写的顺序如下:
  translate(x, y) scale(x,y) rotate(deg) skew(x, y)
*/
class TransformOperation {
  rotate: number = 0; // 旋转角度
  scale: IVector = { x: 1, y: 1 }; // 缩放比例
  skew: IVector = { x: 0, y: 0 }; // 倾斜角度
  translate: IVector = { x: 0, y: 0 }; // 平移距离
  width = 0;
  height = 0;
  scaleMatrix: Matrix3_3; // 缩放矩阵
  rotateMatrix: Matrix3_3; // 旋转矩阵
  skewMatrix: Matrix3_3; // 倾斜矩阵
  translateMatrix: Matrix3_3; // 平移矩阵
  // 总变换矩阵_没有translate数据 (算一些变换值的时候需要, translate数据参与计算会导致结果不准确)
  unTran_matrix: Matrix3_3;
  matrix: Matrix3_3; // 总变换矩阵
  filp_unTran_Matrix: Matrix3_3;
  constructor({ rotate, scale, skew, translate, width, height }: ITransformOperation = {}) {
    this.rotate = rotate || 0;
    this.scale = typeof scale == 'number' ? { x: scale, y: scale } : { x: 1, y: 1, ...scale };
    this.skew = typeof skew == 'number' ? { x: skew, y: skew } : { x: 0, y: 0, ...skew };
    this.translate = typeof translate == 'number' ? { x: translate, y: translate } : { x: 0, y: 0, ...translate };
    this.width = width || 0;
    this.height = height || 0;
    this.scaleMatrix = this.scaleToMatrix(this.scale.x, this.scale.y);
    this.rotateMatrix = this.rotateToMatrix(this.rotate);
    this.skewMatrix = this.skewToMatrix(this.skew.x, this.skew.y);
    this.translateMatrix = this.translateToMatrix(this.translate.x, this.translate.y);
    this.unTran_matrix = matrixMulti2([this.scaleMatrix, this.rotateMatrix, this.skewMatrix]) as Matrix3_3;
    this.filp_unTran_Matrix = matrixMulti2([
      this.scaleToMatrix(-this.scale.x, -this.scale.y),
      this.rotateToMatrix(-this.rotate),
      this.skewToMatrix(-this.skew.x, -this.skew.y),
    ]) as Matrix3_3;
    this.matrix = [...this.unTran_matrix];
    this.matrix[6] = this.translate.x;
    this.matrix[7] = this.translate.y;
  }
  /* 
    全量更新数据
  */
  setData({ rotate, scale, skew, translate, width, height }: ITransformOperation) {
    if (Fn.verify.isNotEmpty(rotate)) {
      this.rotate = rotate || 0;
    }
    if (Fn.verify.isNotEmpty(scale)) {
      this.scale = typeof scale == 'number' ? { x: scale, y: scale } : scale || { x: 1, y: 1 };
    }
    if (Fn.verify.isNotEmpty(skew)) {
      this.skew = typeof skew == 'number' ? { x: skew, y: skew } : skew || { x: 0, y: 0 };
    }
    if (Fn.verify.isNotEmpty(translate)) {
      this.translate = typeof translate == 'number' ? { x: translate, y: translate } : translate || { x: 0, y: 0 };
    }
    if (Fn.verify.isNotEmpty(width)) {
      this.width = width || 0;
    }
    if (Fn.verify.isNotEmpty(height)) {
      this.height = height || 0;
    }
    this.scaleMatrix = this.scaleToMatrix(this.scale.x, this.scale.y);
    this.rotateMatrix = this.rotateToMatrix(this.rotate);
    this.skewMatrix = this.skewToMatrix(this.skew.x, this.skew.y);
    this.translateMatrix = this.translateToMatrix(this.translate.x, this.translate.y);
    this.unTran_matrix = matrixMulti2([this.rotateMatrix, this.scaleMatrix, this.skewMatrix]) as Matrix3_3;
    this.filp_unTran_Matrix = matrixMulti2([
      this.scaleToMatrix(-this.scale.x, -this.scale.y),
      this.rotateToMatrix(-this.rotate),
      this.skewToMatrix(-this.skew.x, -this.skew.y),
    ]) as Matrix3_3;
    this.matrix = [...this.unTran_matrix];
    this.matrix[6] = this.translate.x;
    this.matrix[7] = this.translate.y;
    return this;
  }
  /* 重新初始化数据 - 便于一个tr对象作为公共函数使用 */
  resetData({ rotate, scale, skew, translate, width, height }: ITransformOperation = {}) {
    this.rotate = rotate || 0;
    this.scale = typeof scale == 'number' ? { x: scale, y: scale } : scale || { x: 1, y: 1 };
    this.skew = typeof skew == 'number' ? { x: skew, y: skew } : skew || { x: 0, y: 0 };
    this.translate = typeof translate == 'number' ? { x: translate, y: translate } : translate || { x: 0, y: 0 };
    this.width = width || 0;
    this.height = height || 0;
    this.scaleMatrix = this.scaleToMatrix(this.scale.x, this.scale.y);
    this.rotateMatrix = this.rotateToMatrix(this.rotate);
    this.skewMatrix = this.skewToMatrix(this.skew.x, this.skew.y);
    this.translateMatrix = this.translateToMatrix(this.translate.x, this.translate.y);
    this.unTran_matrix = matrixMulti2([this.scaleMatrix, this.skewMatrix, this.rotateMatrix]) as Matrix3_3;
    this.filp_unTran_Matrix = matrixMulti2([
      this.scaleToMatrix(-this.scale.x, -this.scale.y),
      this.rotateToMatrix(-this.rotate),
      this.skewToMatrix(-this.skew.x, -this.skew.y),
    ]) as Matrix3_3;
    this.matrix = [...this.unTran_matrix];
    this.matrix[6] = this.translate.x;
    this.matrix[7] = this.translate.y;
    return this;
  }
  /* 
    更新宽高
  */
  setWH(width: number, height: number) {
    this.width = width;
    this.height = height;
    return this;
  }

  /* 
    更新位移
  */
  setTranslate(x?: number, y?: number) {
    if (y === undefined) {
      y = this.translate.y;
    }
    if (x === undefined) {
      x = this.translate.x;
    }
    this.translate = { x, y };
    this.translateMatrix = this.translateToMatrix(x, y);
    this.matrix[6] = x;
    this.matrix[7] = y;
    return this;
  }
  setTranslateX(x: number) {
    this.setTranslate(x, this.translate.y);
  }
  setTranslateY(y: number) {
    this.setTranslate(this.translate.x, y);
  }
  /* 
    更新缩放
  */
  setScale(x: number, y?: number) {
    if (y === undefined) {
      y = x;
    }
    this.setData({ scale: { x, y } });
    return this;
  }
  /*
    更新旋转
  */
  setRotate(angle: number) {
    this.rotate = angle;
    this.setData({ rotate: angle });
    return this;
  }
  /*
    更新倾斜
  */
  setSkew(x: number, y?: number) {
    if (y === undefined) {
      y = x;
    }
    this.setData({ skew: { x, y } });
    return this;
  }
  /* 
    记录多边形的顶点坐标
    用于后面的点面碰撞检测
    以dom的 getBoundingClientRect 的 左上为原点(0,0)
    矩阵计算的值:
    是以dom展示的左上为基点,计算的其他3个点的位置(计算的值都是相对左上那个点的位置)
    ** 该计算, 不能带入 translate  不然数据会有偏差
  */
  getPolygonXYList() {
    /* 基于左上基点 */
    // 右上坐标
    const [rtx, rty] = matrixMulti(this.unTran_matrix, [this.width, 0, 1]);
    // 右下坐标
    const [rbx, rby] = matrixMulti(this.unTran_matrix, [this.width, this.height, 1]);
    // 左下坐标
    const [lbx, lby] = matrixMulti(this.unTran_matrix, [0, this.height, 1]);
    /* 基于getBoundingClientRect */
    // 原点的现坐标
    const ltXY = {
      x: Math.abs(Math.min(0, rtx, rbx, lbx)),
      y: Math.abs(Math.min(0, rty, rby, lby)),
    };
    // 右上坐标
    const rtXY = { x: ltXY.x + rtx, y: ltXY.y + rty };
    // 右下坐标
    const rbXY = { x: ltXY.x + rbx, y: ltXY.y + rby };
    // 左下坐标
    const lbXY = { x: ltXY.x + lbx, y: ltXY.y + lby };
    return {
      // 对应矩阵变换后,新的左上角xy坐标系的坐标
      xyList: [ltXY, rtXY, rbXY, lbXY],
      // 对应矩阵转换后,各点与原左上角点的相对坐标
      xList: [rtx, rbx, lbx],
      yList: [rty, rby, lby],
    };
  }
  translateToMatrix(x: number, y: number): Matrix3_3 {
    return [1, 0, 0, 0, 1, 0, x, y, 1];
  }
  scaleToMatrix(x: number, y: number): Matrix3_3 {
    return [x, 0, 0, 0, y, 0, 0, 0, 1];
  }
  rotateToMatrix(angle: number): Matrix3_3 {
    const cos = Math.cos((angle * Math.PI) / 180);
    const sin = Math.sin((angle * Math.PI) / 180);
    return [cos, sin, 0, -sin, cos, 0, 0, 0, 1];
  }
  skewToMatrix(x: number, y: number): Matrix3_3 {
    const tanx = Math.tan((x * Math.PI) / 180);
    const tany = Math.tan((y * Math.PI) / 180);
    return [1, tany, 0, tanx, 1, 0, 0, 0, 1];
  }
  toMatrix3_3(matrix: Matrix3_3_css): Matrix3_3 {
    return TransformOperation.toMatrix3_3(matrix);
  }
  toMatrix3_3_css(matrix: Matrix3_3): Matrix3_3_css {
    return TransformOperation.toMatrix3_3_css(matrix);
  }
  getMatrix() {
    return this.matrix;
  }
  getMatrix4_4() {
    return TransformOperation.martix3_3To4_4(this.matrix);
  }
  getMatrix_css() {
    return this.toMatrix3_3_css(this.matrix);
  }
  getMatrixStr(matrix?: Matrix3_3): string {
    return `matrix(${this.toMatrix3_3_css(matrix || this.matrix).join(',')})`;
  }
  getMatrixCssStr() {
    return `translate(${this.translate.x}px,${this.translate.y}px) scale(${this.scale.x},${this.scale.y}) rotate(${this.rotate}deg) skew(${this.skew.x}deg,${this.skew.y}deg)`;
  }
  // 水平翻转
  horizontal(matrix?: Matrix3_3) {
    if (matrix) {
      return matrix.map((t, i) => (i < 2 ? -t : t)) as Matrix3_3;
    }
    this.matrix = this.matrix.map((t, i) => (i < 2 ? -t : t)) as Matrix3_3;
    return this;
  }
  getHorizontalMatrixStr(matrix?: Matrix3_3): string {
    if (matrix) {
      return this.getMatrixStr(this.horizontal(matrix) as Matrix3_3);
    }
    return (this.horizontal() as typeof this).getMatrixStr();
  }
  // 垂直翻转
  vertical(matrix?: Matrix3_3) {
    if (matrix) {
      return (matrix || this.matrix).map((t, i) => (i == 3 || i == 4 ? -t : t)) as Matrix3_3;
    }
    this.matrix = this.matrix.map((t, i) => (i == 3 || i == 4 ? -t : t)) as Matrix3_3;
    return this;
  }
  getVerticalMatrixStr(matrix?: Matrix3_3): string {
    if (matrix) {
      return this.getMatrixStr(this.vertical(matrix) as Matrix3_3);
    }
    return (this.vertical() as typeof this).getMatrixStr();
  }
  /* static Fun */
  /* 
    [1, 0, 0, 1, 0, 0] => [1, 0, 0, 0, 1, 0, 0, 0, 1]
    便于矩阵计算 (css中matrix的计算是3阶的, 3d的是4阶的)
  */
  static toMatrix3_3(matrix: Matrix3_3_css): Matrix3_3 {
    const nm = [...matrix];
    nm.splice(2, 0, 0);
    nm.splice(5, 0, 0);
    nm.splice(8, 0, 1);
    return nm as Matrix3_3;
  }

  static martix3_3To4_4(matrix: Matrix3_3): Matrix4_4 {
    const nm = [...matrix];
    nm.splice(3, 0, 0);
    nm.splice(7, 0, 0);
    nm.splice(8, 0, 0);
    nm.splice(9, 0, 0);
    nm.splice(10, 0, 1);
    nm.splice(11, 0, 0);
    nm.splice(14, 0, 0);
    return nm as Matrix4_4;
  }

  /* 
      [1, 0, 0, 0, 1, 0, 0, 0, 1] => [1, 0, 0, 1, 0, 0]
      便于css使用
    */
  static toMatrix3_3_css(matrix: Matrix3_3): Matrix3_3_css {
    return matrix.filter((t, i) => (i + 1) % 3 != 0 || i == 0) as Matrix3_3_css;
  }
  /* 
    matrix(1, 0, 0, 1, 0, 0) => [1, 0, 0, 1, 0, 0]
    便于计算转换
  */
  static matrixStrToMatrix3_3(matrixStr: string): Matrix3_3_css {
    return matrixStr
      .replace('matrix(', '')
      .replace(')', '')
      .split(',')
      .map((t) => parseFloat(t)) as Matrix3_3_css;
  }
  static getMatrixStr(matrix: Matrix3_3): string {
    return `matrix(${this.toMatrix3_3_css(matrix).join(',')})`;
  }
}

export default TransformOperation;
/**
 * @description: 获取不同transform-orgin值,在矩阵变换后,新的xy值
 * @param {IVector} diffOrgin 变换后的 transform-orgin
 * @param {IVector} orgin 变换前的 transform-orgin
 * @param {Matrix4_4} matrix transform变换矩阵
 * @return {*}
 * 计算参考: https://zhuanlan.zhihu.com/p/567103408
    示例: 图层width/height变动后, ***做左上角对齐***
    转换矩阵不变, origin点的xy值互换,再用origin点xy用于矩阵计算
    将计算结果相减,就得到变换后的差值
    例子: (origin是中心)
    变换前 a: {
      w: 100,
      h: 100,
      //origin就是(x: 50, y: 50)
      // 变换前的 偏移位置
      translate: {x:10,y:10}
    }
    变换后 a`:{
      w: 80,
      h: 80
      //origin 就是 (x:40,y:40)
    }
    a`的translate的值计算如下:(3阶矩阵(旋转45deg)其他数据不动)
    [ax,ay,1]=[0.707107, 0.707107, 0, 0, -0.707107, 0.707107, 0, 0, 0, 0, 1, 0, 40, 40, 0, 1] * [50,50,1]
    [a`x,a`y,1]=[0.707107, 0.707107, 0, 0, -0.707107, 0.707107, 0, 0, 0, 0, 1, 0, 50, 50, 0, 1] * [40,40,1]
    a`.translate = {
      x :a.translate.x + (ax-a`x),
      y: a.translate.y + (ay-a`y)
    }
 */
export const getDiffXYByDiffOrgin = (orgin: IVector, diffOrgin: IVector, matrix: Matrix4_4): IVector => {
  /* 4阶矩阵相乘 */
  // let { 12: x, 13: y } = matrix;
  // const diffOrginMatrix = createOrginMatrix(diffOrgin);
  // const orginMatrix = createOrginMatrix(orgin);
  // const { 12: dx, 13: dy } = matrixMulti2([diffOrginMatrix[0], matrix, diffOrginMatrix[1]], 4);
  // const { 12: ox, 13: oy } = matrixMulti2([orginMatrix[0], matrix, orginMatrix[1]], 4);
  /* xy在4阶矩阵相乘计算的过程 */
  const { 0: a, 1: b, 4: d, 5: e, 12: x, 13: y } = matrix;
  const dx = x - diffOrgin.x * a - diffOrgin.y * d + diffOrgin.x;
  const dy = y - diffOrgin.x * b - diffOrgin.y * e + diffOrgin.y;
  const ox = x - orgin.x * a - orgin.y * d + orgin.x;
  const oy = y - orgin.x * b - orgin.y * e + orgin.y;
  return { x: ox - dx + x, y: oy - dy + y };
};

/* 
  transform-orgin: x,y
  在matrix中,是4阶矩阵
*/
export const createOrginMatrix = ({ x, y }: { x: number; y: number }) => {
  return [
    [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -x, -y, 0, 1],
  ];
};
/* 
  矩阵 乘法 简单运算
  支持: 3阶和2阶矩阵
  3阶矩阵: 3*3 乘以 3*1  / 3*3 乘以 3*3
  2阶矩阵: 2*2 乘以 2*1  / 2*2 乘以 2*2
  数据格式: [1,2,3,4,5,6,7,8,9] 3*3矩阵  [1,2,3] 3*1矩阵
  数据格式: [1,2,3,4] 2*2矩阵 [1,2] 2*1矩阵
*/

export const matrixMulti = (matrix1: Array<number>, matrix2: Array<number>, n = 3): Array<number> => {
  const m6 = matrix1[6] + matrix2[6];
  const m7 = matrix1[7] + matrix2[7];
  const result = [];
  let i = 0,
    j = 0;
  for (let index = 0; index < Math.min(matrix1.length, matrix2.length); index++) {
    i = index % n;
    j = Math.floor(index / n) * n;
    let sum = 0;
    for (let ni = 0; ni < n; ni++) {
      sum += matrix1[i + ni * n] * matrix2[j + ni];
    }
    result.push(sum);
  }
  result[6] = m6;
  result[7] = m7;
  return result;
};
/* 
  使用matrixMulti计算
  支持传入 matrixList: 矩阵列表
  便捷函数
*/
export const matrixMulti2 = (matrixList: Array<number[]>, n = 3): Array<number> => {
  let result = matrixList[0];
  for (let index = 1; index < matrixList.length; index++) {
    result = matrixMulti(result, matrixList[index], n);
  }
  return result;
};
