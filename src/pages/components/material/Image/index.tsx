import { EditData, EditFn, SourceData } from '@/pages/design/context';
import ImageAnalyse from '@/utils/imageAnalyse';
import TranformBox from '../../tranformBox';
import manageFactory from '@/utils/manageFactory';
import classnames from 'classnames';
import { DEFAULT_LAYER_CLASS, DESIGNCANVASCONTENT, EditTypeEnum, getTransformBoxSubId } from '@/common/config';
import { isHit } from '../../editer/SelectToAndMoveableTool';
import TransformOperation, { matrixMulti2 } from '@/utils/transform';
import ImageListModal from '../../imageListModal';
import ImageClip from '../../editer/ImageClip';
import style from './index.module.less';
import { Flip, ImageLayer } from '@/pages/design/interface';
import { onResizeParam } from '../../editer/SelectToAndMoveableTool/interface';
import { omit } from 'lodash';
import Fn from '@/utils/utils';
import { merge } from '../../../../hocks';

const Image_Material = memo(
  (props: ImageLayer & { path: string; elRef?: React.MutableRefObject<HTMLElement | null> }) => {
    const sourceData = useContext(SourceData);

    const { zoom, selectLayers, editParam, setEditParam, unSelectLayersFn } = useContext(EditData);
    const { updateLayer } = useContext(EditFn);
    const trRef = useRef({
      // 公共变换对象
      commonTr: new TransformOperation(),
      // 碰撞检测变换对象
      hintTr: new TransformOperation(),
    });
    const ref = useRef({
      preUrl: '',
      // 验证鼠标是否在图片的透明空间上
      imgAnalyse: new ImageAnalyse(),
      /* 避免react严格模式的2次渲染,造成数据异常 */
      fn: {
        unSelectLayersFn,
      },
    });
    ref.current.fn.unSelectLayersFn = useMemo(() => unSelectLayersFn, [unSelectLayersFn]);

    const isClip = editParam.type == EditTypeEnum.MATERIALIMAGECLIP && editParam.id == props.id;
    const showWidth = props.w * zoom;
    const showHeight = props.h * zoom;
    useEffect(() => {
      if (ref.current.imgAnalyse.isLoaded) {
        ref.current.imgAnalyse.destroy();
      }
      return () => {
        ref.current.fn.unSelectLayersFn(props.id);
        manageFactory.removeById(props.id);
      };
    }, []);

    const layRef = useRef<HTMLElement>();
    useEffect(() => {
      manageFactory.setPathById(props.id, props.path);
      manageFactory.setLayerDataById(props.id, omit(props, ['path', 'elRef']));
      if (layRef.current) {
        manageFactory.setDomById(props.id, layRef.current);
        trRef.current.hintTr.resetData({
          skew: props.tr.sk,
          scale: props.clip?.s,
          rotate: props.tr.r,
        });
        /* 整合事件注册 */
        manageFactory.register(props.id, 'dbclick', () => {
          if (!manageFactory.isLockedById(props.id)) {
            ImageListModal({
              onSelect: (img) => {
                /* 
                根据图片实际宽高比,和展示框宽高比
                计算偏移量,使用裁剪值承载
              */
                const { maxw, maxh } = Fn.calc.whScaleOnly(img.w, img.h, props.w, props.h);
                updateLayer(props.id, {
                  p: img.url,
                  imgW: maxw,
                  imgH: maxh,
                  clip: {
                    x: -(maxw - props.w) / 2,
                    y: -(maxh - props.h) / 2,
                  },
                });
              },
            });
          }
        });
        manageFactory.register(props.id, 'onResize', (param) => {
          const { x, y, w, h, s } = param as onResizeParam;
          const dom = document.getElementById(getTransformBoxSubId(props.id)) as HTMLElement;
          const imageDom = document.querySelector(`[data-id="${props.id + '-img-clip'}"]`) as HTMLElement;
          trRef.current.commonTr.resetData({
            translate: {
              x,
              y,
            },
            skew: props.tr.sk,
            scale: props.tr.s,
            rotate: props.tr.r,
          });
          dom.style.width = w + 'px';
          dom.style.setProperty('--transform-width', w / zoom + 'px');
          dom.style.height = h + 'px';
          dom.style.setProperty('--transform-height', h / zoom + 'px');
          dom.style.transform = trRef.current.commonTr.getMatrixCssStr();

          trRef.current.commonTr.resetData({
            scale: props.clip?.s || 1,
            translate: {
              x: (props.clip?.x || 0) * zoom * s[0],
              y: (props.clip?.y || 0) * zoom * s[1],
            },
          });
          /* 只需要零时处理展示的图片dom即可, 裁剪的clip层dom,会在事件处理后更新数据 */
          imageDom.style.width = props.imgW * zoom * s[0] + 'px';
          imageDom.style.height = props.imgH * zoom * s[1] + 'px';
          imageDom.style.transform = trRef.current.commonTr.getMatrixCssStr();
        });
        manageFactory.register(props.id, 'onResizeEnd', (param) => {
          const { x, y, w, h, s } = param as onResizeParam;
          updateLayer(props.id, {
            tr: {
              x: x / zoom,
              y: y / zoom,
            },
            w: w / zoom,
            h: h / zoom,
            imgW: props.imgW * s[0],
            imgH: props.imgH * s[1],
            clip: {
              x: (props.clip?.x || 0) * s[0],
              y: (props.clip?.y || 0) * s[1],
            },
          });
        });
        /* 
        透明验证函数逻辑
        1. 变换图片时,存在偏移值(在canvas的验证中不需要处理,这边减去了,避免影响后续的clip的值)
        2. 图片的旋转是在外部壳子承载,图片的偏移计算,需要先做旋转计算处理
      */
        const scaleXY = matrixMulti2([
          trRef.current.hintTr.rotateMatrix,
          [
            ((props.clip?.x || 0) + (props.imgW - props.w) / 2) * zoom,
            ((props.clip?.y || 0) + (props.imgH - props.h) / 2) * zoom,
            1,
          ],
        ]);
        trRef.current.hintTr.setTranslate(scaleXY[0], scaleXY[1]);
        ref.current.imgAnalyse.setUrl(props.p).then(() => {
          // 判断碰撞的位置,是否是透明的,透明部分穿透下去
          const boxDom = document.getElementById(props.id);
          if (boxDom) {
            const { width, height } = boxDom.getBoundingClientRect();
            ref.current.imgAnalyse
              .setCanvasWH({
                w: width,
                h: height,
              })
              .setWH({
                w: props.imgW * zoom,
                h: props.imgH * zoom,
              })
              .setMatrix(trRef.current.hintTr.getMatrix_css());
          }
          manageFactory.setHintFnById(props.id, (point) => {
            if (layRef.current) {
              // 判断是否碰撞到dom
              if (isHit(point, layRef.current)) {
                // 编辑状态, 选中状态, 不做穿透处理,
                if (isClip || selectLayers.includes(props.id)) {
                  return 1;
                }
                const { x, y } = layRef.current.getBoundingClientRect();
                // 坐标系是dom的左上角 - 所以point需要减去dom离screen的距离
                if (
                  ref.current.imgAnalyse.isTransparent({
                    x: point.x - x,
                    y: point.y - y,
                  })
                ) {
                  return 2;
                }
                return 1;
              }
            }
            return 0;
          });
        });
      }
    }, [sourceData, selectLayers, isClip, zoom]);
    /* 翻转 */
    trRef.current.commonTr.resetData({});
    if (props?.flip?.h) {
      trRef.current.commonTr.horizontal();
    }
    if (props?.flip?.v) {
      trRef.current.commonTr.vertical();
    }
    return (
      <TranformBox
        tr={props.tr}
        id={props.id}
        isLocked={props.isLocked}
        elRef={props.elRef}
        style={
          {
            width: showWidth + 'px',
            height: showHeight + 'px',
            '--transform-width': props.w + 'px',
            '--transform-height': props.h + 'px',
            zIndex: isClip ? 9999 : 0,
          } as React.CSSProperties
        }
      >
        <div
          id={props.id}
          ref={(img) => {
            if (img) layRef.current = img;
          }}
          style={{
            opacity: props.tr?.o,
            transform: trRef.current.commonTr.getMatrixStr(),
          }}
          className={classnames(DEFAULT_LAYER_CLASS)}
        >
          <ImageClip
            id={props.id + '-img-clip'}
            container={document.getElementById(DESIGNCANVASCONTENT) as HTMLElement}
            target={document.getElementById(getTransformBoxSubId(props.id)) as HTMLElement}
            scale={props.clip?.s || 1}
            flip={props.flip as Flip}
            translate={{
              x: props.clip?.x || 0,
              y: props.clip?.y || 0,
            }}
            open={isClip}
            clippable={true}
            containerTr={props.tr}
            containerWH={{ w: props.w, h: props.h }}
            imgWH={{ w: props.imgW, h: props.imgH }}
            zoom={zoom}
            onCancle={() => {
              setEditParam({ type: '', id: '' });
            }}
            onOk={({ scale, translate, transform, imgWH, containerWH }) => {
              // 组内子元素, 同步数据到缓存,由父级元素同步更新
              const isSub = manageFactory.isSubId(props.id);
              const newLayer = {
                ...containerWH,
                imgW: imgWH.w,
                imgH: imgWH.h,
                tr: {
                  ...transform,
                },
                clip: {
                  s: scale,
                  ...translate,
                },
              };
              if (isSub) {
                manageFactory.setLayerDataById(props.id, merge(manageFactory.getLayerDataById(props.id)!, newLayer));
                manageFactory.dispatchRegister(manageFactory.getIdBySubId(props.id), 'syncWH');
              } else {
                updateLayer(props.id, newLayer);
              }
            }}
          >
            {({ id, mainStyle }, isBack) => {
              trRef.current.commonTr.resetData({
                scale: props.clip?.s || 1,
                translate: {
                  x: (props.clip?.x || 0) * zoom,
                  y: (props.clip?.y || 0) * zoom,
                },
              });
              return (
                <div
                  id={id}
                  className={style['design-image-editer-box']}
                  data-top={props.clip?.y || 0}
                  data-left={props.clip?.x || 0}
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
                    style={
                      {
                        transform: trRef.current.commonTr.getMatrixStr(),
                        width: (props.imgW || 0) * zoom + 'px',
                        height: (props.imgH || 0) * zoom + 'px',
                        '--scale': props.clip?.s,
                      } as React.CSSProperties
                    }
                    onMouseDown={(e) => {
                      if (isBack) {
                        e.stopPropagation();
                      }
                    }}
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
              );
            }}
          </ImageClip>
        </div>
      </TranformBox>
    );
  },
);

export default Image_Material;
