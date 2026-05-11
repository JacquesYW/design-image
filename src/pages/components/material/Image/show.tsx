import classnames from 'classnames';
import { DEFAULT_LAYER_CLASS } from '@/common/config';
import TransformOperation from '@/utils/transform';
import style from './index.module.less';
import { ImageLayer } from '@/pages/design/interface';
import TranformBoxShow from '../../tranformBox/show';

const Image_Material_Show = memo((props: ImageLayer & { zoom: number }) => {
  const { zoom } = props;
  const trRef = useRef({
    // 公共变换对象
    commonTr: new TransformOperation(),
    // 碰撞检测变换对象
    clipTr: new TransformOperation(),
  });

  const showWidth = props.w * zoom;
  const showHeight = props.h * zoom;

  /* 翻转 */
  trRef.current.commonTr.resetData({});
  if (props?.flip?.h) {
    trRef.current.commonTr.horizontal();
  }
  if (props?.flip?.v) {
    trRef.current.commonTr.vertical();
  }
  trRef.current.clipTr.resetData({
    scale: props.clip?.s || 1,
    translate: {
      x: (props.clip?.x || 0) * zoom,
      y: (props.clip?.y || 0) * zoom,
    },
  });
  return (
    <TranformBoxShow
      tr={props.tr}
      zoom={zoom}
      style={
        {
          width: showWidth + 'px',
          height: showHeight + 'px',
          '--transform-width': props.w + 'px',
          '--transform-height': props.h + 'px',
        } as React.CSSProperties
      }
    >
      <div
        style={{
          opacity: props.tr?.o,
          transform: trRef.current.commonTr.getMatrixStr(),
        }}
        className={classnames(DEFAULT_LAYER_CLASS)}
      >
        <div className={style['design-image-editer-box']}>
          <div
            className={classnames(style['design-image-editer-main'])}
            style={
              {
                transform: trRef.current.clipTr.getMatrixStr(),
                width: (props.imgW || 0) * zoom + 'px',
                height: (props.imgH || 0) * zoom + 'px',
                '--scale': props.clip?.s,
              } as React.CSSProperties
            }
          >
            {props?.p ? (
              <img
                draggable={false}
                src={props?.p}
                style={{
                  width: '100%',
                  height: '100%',
                }}
              />
            ) : null}
          </div>
        </div>
      </div>
    </TranformBoxShow>
  );
});

export default Image_Material_Show;
