import Moveable, { OnDrag, OnResize, OnResizeEnd, OnResizeStart, getElementInfo } from 'moveable';
import ScaleTool, { ScaleToolProps } from '../ScaleTool';
import TransformOperation, { matrixMulti } from '@/utils/transform';
import { IVector } from '@/utils/interface';
import { getIntersectionPoints, isInside } from 'overlap-area';
import { Flip, MainTransform } from '@/pages/design/interface';
import _ from 'lodash';
type WH = { w: number; h: number };
interface IProps {
  id: string;
  target?: HTMLElement;
  scale: number;
  translate: IVector;
  open: boolean;
  isOnlyShow?: boolean;
  zoom: number;
  children: (param: { id: string; mainStyle?: React.CSSProperties }, isBack?: boolean) => React.ReactNode;
  onCancle: PickByValue<ScaleToolProps, 'onCancle'>;
  onOk: (param: { scale: number; translate: IVector; transform: IVector; containerWH: WH; imgWH: WH }) => void;
}
interface ClipRelate {
  /* 是否翻转 */
  flip: Flip;
  // 裁剪容器dom
  container: HTMLElement;
  // 裁剪容器的x/y等transform信息
  containerTr: MainTransform;
  /* 裁剪前 容器宽高 / 图片宽高 */
  containerWH: WH;
  imgWH: WH;
}
/* 
  是否具有裁剪功能
  1. 背景图只需要缩放和平移 
  2. 图片图层需要做盒子裁剪展示(transformBox的宽高和xy的变动)
*/
interface ClippableProps extends IProps, ClipRelate {
  clippable: true;
}

interface UnClippableProps extends IProps, Partial<ClipRelate> {
  clippable: false;
}

type ImageClipProps = ClippableProps | UnClippableProps;
const ImageClip = (props: ImageClipProps) => {
  const {
    id,
    target,
    scale = 1,
    translate = { x: 0, y: 0 },
    open,
    isOnlyShow,
    zoom,
    clippable = false,
    flip,
    container,
    containerTr,
    containerWH,
    imgWH,
    children,
    onCancle,
    onOk,
  } = props;
  const subid = id + '-sub';
  const ref = useRef({
    moveable: null as Moveable | null,
    tr: new TransformOperation(),
    containerTr: null as TransformOperation | null,
    preZoom: null as number | null,
    preContainerData: null as { x: number; y: number; w: number; h: number } | null,
    dom: null as unknown as HTMLElement,
    subDom: null as unknown as HTMLElement,
    isEdit: false,
    isClipEvent: false,
    timer: null as NodeJS.Timeout | null,
    /* 重置数据 */
    preScale: null as number | null,
    preTranslate: null as IVector | null,
  });
  const [translateValue, setTranslateValue] = useState(translate);
  const [clipScaleValue, setClipScaleValue] = useState(scale);
  const [scaleValue, setScaleValue] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  useEffect(() => {
    if (open) {
      setClipScaleValue(scale);
      setScaleValue(1);
      if (scale != ref.current.preScale) {
        ref.current.tr.setScale(scale);
        // 弹框打开时, 记录当前的缩放和位移 (用于重置功能)
        ref.current.preScale = scale;
      }
    } else {
      ref.current.preScale = null;
    }
  }, [open, scale]);
  useEffect(() => {
    if (open) {
      setTranslateValue(translate);
      if (!_.isEqual(translate, ref.current.preTranslate)) {
        ref.current.tr.setTranslate(translate.x * zoom, translate.y * zoom);
        ref.current.preTranslate = translate;
      }
    } else {
      ref.current.preTranslate = null;
    }
  }, [open, translate]);
  useEffect(() => {
    if (open) {
      if (ref.current.moveable) {
        ref.current.moveable.off('drag', onDrag);
        ref.current.moveable.off('dragEnd', onDragEnd);
        ref.current.moveable.destroy();
        ref.current.moveable = null;
      }
      if (!ref.current.dom) {
        ref.current.dom = document.getElementById(id) as HTMLElement;
        ref.current.subDom = document.getElementById(subid) as HTMLElement;
      }
      if (containerTr && containerWH && !ref.current.containerTr) {
        ref.current.containerTr = new TransformOperation({
          translate: {
            x: containerTr.x * zoom,
            y: containerTr.y * zoom,
          },
          skew: containerTr.sk,
          scale: containerTr.s,
          rotate: containerTr.r,
          width: containerWH.w * zoom,
          height: containerWH.h * zoom,
        });
        if (!ref.current.preContainerData) {
          ref.current.preContainerData = {
            x: containerTr.x * zoom,
            y: containerTr.y * zoom,
            w: containerWH.w * zoom,
            h: containerWH.h * zoom,
          };
        }
      }
      ref.current.moveable = new Moveable(container || ref.current.dom, {
        target: target || ref.current.dom,
        draggable: true,
        useMutationObserver: true,
        useResizeObserver: true,
        origin: false,
        dragArea: true,
        startDragRotate: 0,
        throttleDragRotate: 0,
        snapThreshold: 5,
        resizable: clippable,
      });
      ref.current.moveable.on('resizeStart', onResizeStart);
      ref.current.moveable.on('resize', onResize);
      ref.current.moveable.on('resizeEnd', onResizeEnd);

      ref.current.moveable.on('drag', onDrag);
      ref.current.moveable.on('dragEnd', onDragEnd);
      reRender(true);
    } else {
      ref.current.preContainerData = null;
      ref.current.tr == new TransformOperation();
      ref.current.containerTr = null;
    }
    return () => {
      if (ref.current.moveable) {
        ref.current.moveable.off('resizeStart');
        ref.current.moveable.off('resize');
        ref.current.moveable.off('resizeEnd');
        ref.current.moveable.off('drag');
        ref.current.moveable.off('dragEnd');
        ref.current.moveable.destroy();
      }
      ref.current.moveable = null;
    };
  }, [zoom, open, scale, scaleValue, clipScaleValue, translateValue, containerTr, children]);
  useEffect(() => {
    if (open) {
      // 第一次同步zoom值
      if (!ref.current.preZoom) {
        ref.current.preZoom = zoom;
      }
      /* 
        编辑时, 改变zoom,
        避免外部数据重新渲染造成编辑零时数据异常
        数据重置操作,放在时间队列,将会在组件渲染后再执行
      */
      if (ref.current.timer) {
        clearTimeout(ref.current.timer);
      }
      ref.current.timer = setTimeout(() => {
        if (ref.current.containerTr && imgWH) {
          const preZoom = ref.current.preZoom || 1;
          ref.current.tr.setTranslate(
            ref.current.tr.translate.x * (zoom / preZoom),
            ref.current.tr.translate.y * (zoom / preZoom),
          );
          ref.current.containerTr.width *= zoom / preZoom;
          ref.current.containerTr.height *= zoom / preZoom;
          renderContainer(
            (ref.current.containerTr.translate.x / preZoom) * zoom,
            (ref.current.containerTr.translate.y / preZoom) * zoom,
            ref.current.containerTr.width,
            ref.current.containerTr.height,
          );
          reRender();
        }
        ref.current.preZoom = zoom;
      });
      // 使用preZoom完成后,在更新zoom
    } else {
      ref.current.preZoom = null;
    }
    () => {
      if (ref.current.timer) {
        clearTimeout(ref.current.timer);
      }
    };
  }, [open, imgWH, zoom]);
  const onResizeStart = (e: OnResizeStart) => {
    setIsDragging(true);
    e.datas.sx = ref.current.tr.translate.x;
    e.datas.sy = ref.current.tr.translate.y;
  };
  const onResize = (e: OnResize) => {
    const { width, height } = e;
    const x = e.drag.beforeTranslate[0],
      y = e.drag.beforeTranslate[1];
    renderContainer(x, y, width, height);
    /* 
      -1 -1  0 -1  1 -1
      -1 0         1 0
      -1 1   0 1   1 1
    */
    if (e.direction.includes(-1)) {
      if (-1 == e.direction[0]) {
        ref.current.tr.setTranslateX(e.datas.sx + e.dist[0]);
      }
      if (-1 == e.direction[1]) {
        ref.current.tr.setTranslateY(e.datas.sy + e.dist[1]);
      }
      reRender();
    }
  };
  const onResizeEnd = (e: OnResizeEnd) => {
    setIsDragging(false);
    if (e.lastEvent) {
      const { width, height, dist } = e.lastEvent;
      const imgDom = ref.current.dom.querySelector('img');
      if (ref.current.containerTr && containerWH && imgDom) {
        ref.current.containerTr.width = width;
        ref.current.containerTr.height = height;
        const { width: imgW, height: imgH } = getElementInfo(imgDom);
        let wx = ref.current.tr.translate.x,
          hy = ref.current.tr.translate.y,
          s = scaleValue,
          cs = clipScaleValue;
        const whs = Math.max(width / (containerWH.w * zoom), height / (containerWH.h * zoom));
        if (width - imgW * ref.current.tr.scale.x >= 0 || height - imgH * ref.current.tr.scale.y >= 0) {
          s = Math.max(s, whs);
          cs = 1;
          if (width - imgW * ref.current.tr.scale.x >= 0) {
            wx = (width - imgW) / 2;
          }
          if (height - imgH * ref.current.tr.scale.y >= 0) {
            hy = (height - imgH) / 2;
          }
        } else {
          if (dist[0] > 0 || dist[1] > 0) {
            s = Math.max(s, whs);
          } else {
            s = Math.min(s, whs);
          }
          cs *= scaleValue / s;
        }
        setClipScaleValue(cs);
        setScaleValue(s);
        ref.current.tr.setScale(s * cs);
        recordTranslate(wx / zoom, hy / zoom);
        reRender();
        onDragEnd();
      }
    }
  };
  const renderContainer = (x: number, y: number, w: number, h: number) => {
    if (target && ref.current.containerTr) {
      ref.current.containerTr.setTranslate(x, y);
      target.style.transform = ref.current.containerTr.getMatrixCssStr();
      target.style.width = w + 'px';
      target.style.height = h + 'px';
      target.style.setProperty('--transform-width', w / zoom + 'px');
      target.style.setProperty('--transform-height', h / zoom + 'px');
    }
  };
  const onDrag = (e: OnDrag) => {
    if (!ref.current.isClipEvent) {
      /*
        固定target的框,只是变动img的父级div,
        实现框不动,拖动图片的功能
      */
      const ox = ref.current.dom.getAttribute('data-left');
      const oy = ref.current.dom.getAttribute('data-top');
      let x = e.left,
        y = e.top;
      if (ref.current.containerTr) {
        [x, y] = matrixMulti(ref.current.containerTr.filp_unTran_Matrix, [-e.left, -e.top, 1]);
      }
      const newX = (flip?.h ? -x : x) + Number(ox || 0) * zoom;
      const newY = (flip?.v ? -y : y) + Number(oy || 0) * zoom;
      ref.current.tr.setTranslate(newX, newY);
      reRender();
    }
  };
  const onDragEnd = () => {
    if (!ref.current.isClipEvent) {
      const imgDom = ref.current.dom.querySelector('img');
      const s = ref.current.tr.scale.x;
      if (imgDom) {
        /*
        拖动结束后
        1. 优化位置x,y - 图片对齐框的边角
        2. 更新图片的clip数据 (x/y)
      */
        const { top, left, pos1, pos2, pos3, pos4, width, height } = getElementInfo(ref.current.dom);
        /*
        targetMatrix: 兼容背景图片缩放展示,避免计算异常
      */
        const {
          top: imgTop,
          left: imgLeft,
          pos1: imgPos1,
          pos2: imgPos2,
          pos3: imgPos3,
          pos4: imgPos4,
          width: imgW,
          height: imgH,
        } = getElementInfo(imgDom);
        /* 
        1.2个dom的位置信息,拉齐到一个坐标系(screen)
        pos数据对应框的位置如下：
        pos1   pos2
        pos3   pos4
        注： inInside函数，需要沿线画出框，不能交叉
        顺序: pos1 -> pos2 -> pos4 -> pos3
      */
        const nps1 = [pos1[0] + left, pos1[1] + top];
        const nps2 = [pos2[0] + left, pos2[1] + top];
        const nps3 = [pos3[0] + left, pos3[1] + top];
        const nps4 = [pos4[0] + left, pos4[1] + top];
        const imgPos = [imgPos1, imgPos2, imgPos4, imgPos3].map((ary) => {
          return [ary[0] + imgLeft, ary[1] + imgTop];
        });
        /* 
        计算图片区域是否覆盖边框的边角
      */
        const cover1 = isInside(nps1, imgPos);
        const cover2 = isInside(nps2, imgPos);
        const cover4 = isInside(nps4, imgPos);
        const cover3 = isInside(nps3, imgPos);
        /*
          拖拽后的x,y
        */
        const { 4: x, 5: y } = TransformOperation.matrixStrToMatrix3_3(
          (ref.current.dom.querySelector(`[data-id="${id}"]`) as HTMLElement).style.transform,
        );
        // 框左上角到图片顶部距离
        const ltTot = getDistance(nps1, getIntersectionPoints([nps1, nps3], [imgPos[0], imgPos[1]])[0]);
        // 框左上角到图片左侧距离
        const ltTol = getDistance(nps1, getIntersectionPoints([nps1, nps2], [imgPos[0], imgPos[3]])[0]);
        // 框右下角到图片右侧距离
        const rbTor = getDistance(nps4, getIntersectionPoints([nps3, nps4], [imgPos[1], imgPos[2]])[0]);
        // 框右下角到图片上侧距离
        const rbTot = getDistance(nps4, getIntersectionPoints([nps2, nps4], [imgPos[0], imgPos[1]])[0]);
        // 框右下角到图片左侧距离
        const rbTol = getDistance(nps4, getIntersectionPoints([nps3, nps4], [imgPos[0], imgPos[3]])[0]);
        // 框右下角到图片底部距离
        const rbTob = getDistance(nps4, getIntersectionPoints([nps2, nps4], [imgPos[3], imgPos[2]])[0]);
        /*
        计算 最优x,y位置
        并且去除zoom的影响
      */
        let newX = Number(x);
        let newY = Number(y);
        // 图片宽高和框宽高的差值
        const cw = width,
          ch = height;
        const offsetW = imgW - width;
        const offsetH = imgH - height;
        // 图片位置覆盖边框的边角 - 不做操作
        if (Math.floor(ltTol + rbTor + cw) > Math.floor(imgW * s)) {
          // 未覆盖左侧线
          if (!cover1 && !cover3) {
            newX = (imgW * s - width) / 2 - offsetW / 2;
          }
          // 未覆盖右侧线
          if (!cover2 && !cover4) {
            if (!(Math.floor(ltTol + rbTol) <= Math.floor(width) || rbTol < ltTol)) {
              newX = -(imgW * s - width) / 2 - offsetW / 2;
            }
          }
        }
        // 图片位置覆盖边框的边角 - 不做操作
        if (Math.floor(ltTot + rbTob + ch) > Math.floor(imgH * s)) {
          // 未覆盖上侧线
          if (!cover1 && !cover2) {
            newY = (imgH * s - height) / 2 - offsetH / 2;
          }
          // 未覆盖下侧线
          if (!cover3 && !cover4) {
            if (!(Math.floor(ltTot + rbTot) <= Math.floor(height) || rbTot < ltTot)) {
              newY = -(imgH * s - height) / 2 - offsetH / 2;
            }
          }
        }
        /* 记录的xy,是原始值,不受zoom的影响 */
        newX /= zoom;
        newY /= zoom;
        /* 记录x,y 用于后续的拖拽的起始位置计算 */
        recordTranslate(newX, newY);
        reRender();
      }
    }
  };
  // 记录xy的信息, tr / dragStateXY / translateValue - 为后续各项功能作为数据依据
  const recordTranslate = (x: number, y: number) => {
    ref.current.dom.setAttribute('data-left', x.toString());
    ref.current.dom.setAttribute('data-top', y.toString());
    ref.current.tr.setTranslate(x * zoom, y * zoom);
    setTranslateValue({ x: x, y: y });
  };
  const reRender = (init = false) => {
    if (!init) {
      ref.current.isEdit = true;
    }
    (document.querySelector(`[data-id="${subid}"]`) as HTMLElement).style.transform = ref.current.tr.getMatrixStr();
    (document.querySelector(`[data-id="${subid}"]`) as HTMLElement).style.setProperty(
      '--scale',
      '' + ref.current.tr.scale.x,
    );
    (document.querySelector(`[data-id="${id}"]`) as HTMLElement).style.transform = ref.current.tr.getMatrixStr();
  };
  /* 
    裁剪后的数据,需要重新整理后,返回外部保存
    1. transformBox的 w/h
    2. imgWH 的 w/h
    3. img的clip > x/y(scale变了)
    4. 
  */
  const clearUpOkParams = () => {
    // translate: clip的偏移,命名暂时不动...
    let newTranslate = translateValue,
      // transformBox的位置,(container)
      newTransform = {} as { x: number; y: number },
      // 图层的图片宽高(切换图片,wh比会变动,所以记录)
      newImgWH = {} as WH,
      // transformBox的wh
      newContainerWH = {} as WH;
    if (ref.current.containerTr) {
      // 新xy位置 - 处理zoom
      newTransform = {
        x: ref.current.containerTr.translate.x / zoom,
        y: ref.current.containerTr.translate.y / zoom,
      };
      newContainerWH = {
        w: ref.current.containerTr.width / zoom,
        h: ref.current.containerTr.height / zoom,
      };
    }
    if (imgWH) {
      newImgWH = {
        w: imgWH.w * scaleValue,
        h: imgWH.h * scaleValue,
      };
      newTranslate = {
        x: translateValue.x - (newImgWH.w - imgWH.w) / 2,
        y: translateValue.y - (newImgWH.h - imgWH.h) / 2,
      };
    }
    onOk({
      scale: clipScaleValue,
      translate: newTranslate,
      transform: newTransform,
      imgWH: newImgWH,
      containerWH: newContainerWH,
    });
  };
  return (
    <>
      <ScaleTool
        isDragging={isDragging}
        open={open}
        onCancle={onCancle}
        scale={clipScaleValue}
        isEdit={!(clipScaleValue == ref.current.preScale && _.isEqual(translateValue, ref.current.preTranslate))}
        onOk={() => {
          if (ref.current.isEdit) {
            ref.current.dom.style.clipPath = '';
            ref.current.isEdit = false;
            clearUpOkParams();
          }
        }}
        onChange={function (val: number) {
          setClipScaleValue(val);
          ref.current.tr.setScale(val * scaleValue);
          reRender();
        }}
        onAfterChange={function (val: number) {
          ref.current.tr.setScale(val * scaleValue);
          setClipScaleValue(val);
          /* 触发下 拖拽后的矫正能力 */
          onDragEnd();
        }}
        reset={() => {
          if (ref.current.preScale && ref.current.preTranslate) {
            const scale = ref.current.preScale;
            const translate = ref.current.preTranslate;
            ref.current.tr.setScale(scale, scale);
            setClipScaleValue(scale);
            setScaleValue(1);
            recordTranslate(translate.x, translate.y);
            if (ref.current.preContainerData) {
              renderContainer(
                ref.current.preContainerData.x,
                ref.current.preContainerData.y,
                ref.current.preContainerData.w,
                ref.current.preContainerData.h,
              );
            }
            reRender();
          }
        }}
      >
        {children(
          {
            id: subid,
            mainStyle: {
              overflow: 'visible',
              display: open ? 'block' : 'none',
            },
          },
          true,
        )}
      </ScaleTool>
      {children({
        id: isOnlyShow ? '' : id,
        mainStyle: {
          cursor: open ? 'all-scroll' : 'default',
        },
      })}
    </>
  );
};

export default ImageClip;

function getDistance(point1: number[], point2: number[]) {
  return Math.sqrt(Math.pow(point1[0] - point2[0], 2) + Math.pow(point1[1] - point2[1], 2));
}
