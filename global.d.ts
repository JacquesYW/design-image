import Moveable from 'moveable';

declare global {
  interface Window {
    imageCache: {
      moveable?: Moveable;
    };
    dd: Record<string, unknown>;
  }
  // 递归对象中的字段,都变成可选状态
  type DeepPartial<T> = {
    [P in keyof T]?: DeepPartial<T[P]>;
  };

  // 便捷Pick函数
  type PickByValue<T, ValueType extends keyof T> = Pick<T, ValueType>[ValueType];

  // Rgba颜色
  type RgbaColor = { r: number; g: number; b: number; a: number };
}
