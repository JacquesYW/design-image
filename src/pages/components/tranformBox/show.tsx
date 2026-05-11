import TransformOperation from '@/utils/transform';
import { TranformBoxProps } from '.';

const TranformBoxShow = (props: Omit<TranformBoxProps, 'id' | 'isLocked' | 'elRef'> & { zoom: number }) => {
  const { tr, zoom } = props;
  const trs = new TransformOperation({
    translate: {
      x: tr.x * zoom,
      y: tr.y * zoom,
    },
    skew: tr.sk,
    scale: tr.s,
    rotate: tr.r,
  });
  return (
    <div
      style={
        {
          ...(props.style || {}),
          position: 'absolute',
          // 使用变量的方式, 便于moveable工具获取对应的值
          transform: trs.getMatrixCssStr(),
        } as React.CSSProperties
      }
    >
      {props.children}
    </div>
  );
};

export default TranformBoxShow;
