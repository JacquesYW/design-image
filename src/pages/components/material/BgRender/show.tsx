import style from './index.module.less';
import TransformOperation from '@/utils/transform';
import Fn from '@/utils/utils';
import { BackgroundType } from '@/common/config';
import classnames from 'classnames';
import { LinearColor, Panel } from '@/pages/design/interface';

/* 
  背景
*/
const BgShow = ({ panelData, zoom }: { panelData: Panel; zoom: number }) => {
  const trRef = useRef({
    // 公共变换对象
    commonTr: new TransformOperation(),
    // 碰撞检测变换对象
    hintTr: new TransformOperation(),
  });
  const bg = {} as Record<string, string | number>;
  if (panelData.bg?.type == BackgroundType.IMAGE) {
    bg['--canvas-bg-image-opacity'] = panelData.bg?.img?.tr?.palette?.o ?? 1;
    bg['--canvas-bg-image-color'] = panelData.bg?.img?.tr?.palette?.c ?? 'transparent';
  }
  /* 翻转 */
  trRef.current.commonTr.resetData({});
  if (panelData.bg?.img?.tr?.flip?.h) {
    trRef.current.commonTr.horizontal();
  }
  if (panelData.bg?.img?.tr?.flip?.v) {
    trRef.current.commonTr.vertical();
  }
  trRef.current.hintTr.resetData({
    scale: panelData.bg?.img?.tr?.clip?.s || 1,
    translate: {
      x: (panelData.bg?.img?.tr?.clip?.x || 0) * zoom,
      y: (panelData.bg?.img?.tr?.clip?.y || 0) * zoom,
    },
  });
  return (
    <div
      className={classnames(style['design-canvas-bg-box'])}
      style={{
        ...(panelData.bg?.type == BackgroundType.IMAGE
          ? ({
              /* 没有图片时, 遮罩层不展示 */
              '--canvas-bg-color': panelData.bg?.img?.p
                ? panelData.bg?.img?.tr?.palette?.c ?? 'transparent'
                : 'transparent',
              '--canvas-bg-opacity':
                Fn.verify.isEmpty(panelData.bg?.img?.tr?.palette?.o) || !panelData.bg?.img?.p
                  ? 1
                  : 1 - (panelData.bg?.img?.tr?.palette?.o || 0),
            } as React.CSSProperties)
          : {}),
      }}
    >
      <div
        className={style['design-canvas-bg-container']}
        style={{
          ...(panelData.bg?.color?.isLinear
            ? {
                backgroundImage: Fn.trans.linearToLinearStr(panelData.bg?.color?.linear as LinearColor),
              }
            : { backgroundColor: Fn.trans.rgbaToRgbaStr(panelData.bg?.color?.c as RgbaColor) }),
          transform: trRef.current.commonTr.getMatrixStr(),
        }}
      >
        <div className={style['design-image-editer-box']}>
          <div
            className={classnames(style['design-image-editer-main'])}
            style={
              {
                transform: trRef.current.hintTr.getMatrixStr(),
                width: (panelData.bg?.img?.w || 0) * zoom + 'px',
                height: (panelData.bg?.img?.h || 0) * zoom + 'px',
              } as React.CSSProperties
            }
          >
            {panelData.bg?.type == BackgroundType.IMAGE && panelData.bg?.img?.p ? (
              <img
                src={panelData.bg?.img?.p}
                draggable={false}
                style={{
                  width: '100%',
                  height: '100%',
                }}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BgShow;
