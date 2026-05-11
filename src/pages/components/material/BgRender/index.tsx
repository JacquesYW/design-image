import { EditData, EditFn, SourceData } from '@/pages/design/context';
import style from './index.module.less';
import TransformOperation from '@/utils/transform';
import Fn from '@/utils/utils';
import { BackgroundType, EditTypeEnum } from '@/common/config';
import ImageClip from '@/pages/components/editer/ImageClip';
import classnames from 'classnames';
import { LinearColor } from '@/pages/design/interface';

/* 
  背景
*/
const BgRender = () => {
  const sourceData = useContext(SourceData);
  const { zoom, editParam, panelIndex, isChoosePanel, setEditParam } = useContext(EditData);
  const panelData = useMemo(() => sourceData.panels[panelIndex], [sourceData, panelIndex]);

  const { updateBgImg } = useContext(EditFn);
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
  return (
    <div
      className={classnames(style['design-canvas-bg-box'], {
        [style['choose']]: isChoosePanel,
      })}
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
        ...(editParam.type == EditTypeEnum.BGIMAGECLIP
          ? {
              zIndex: 9999,
            }
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
        <ImageClip
          id={EditTypeEnum.BGIMAGECLIP.toString()}
          scale={panelData.bg?.img?.tr?.clip?.s || 1}
          translate={{
            x: panelData.bg?.img?.tr?.clip?.x || 0,
            y: panelData.bg?.img?.tr?.clip?.y || 0,
          }}
          clippable={false}
          open={editParam.type == EditTypeEnum.BGIMAGECLIP}
          zoom={zoom}
          onCancle={() => {
            setEditParam({ type: '' });
          }}
          onOk={({ scale, translate }) => {
            updateBgImg({
              tr: {
                clip: {
                  s: scale,
                  ...translate,
                },
              },
            });
          }}
        >
          {({ id, mainStyle }, isBack) => {
            trRef.current.hintTr.resetData({
              scale: panelData.bg?.img?.tr?.clip?.s || 1,
              translate: {
                x: (panelData.bg?.img?.tr?.clip?.x || 0) * zoom,
                y: (panelData.bg?.img?.tr?.clip?.y || 0) * zoom,
              },
            });
            return (
              <div
                id={id}
                className={style['design-image-editer-box']}
                data-top={panelData.bg?.img?.tr?.clip?.y || 0}
                data-left={panelData.bg?.img?.tr?.clip?.x || 0}
                style={mainStyle}
              >
                <div
                  className={classnames(
                    {
                      [style['img-back-box']]: isBack,
                    },
                    style['design-image-editer-main'],
                  )}
                  data-id={id}
                  style={{
                    transform: trRef.current.hintTr.getMatrixStr(),
                    width: (panelData.bg?.img?.w || 0) * zoom + 'px',
                    height: (panelData.bg?.img?.h || 0) * zoom + 'px',
                  }}
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
            );
          }}
        </ImageClip>
      </div>
    </div>
  );
};

export default BgRender;
