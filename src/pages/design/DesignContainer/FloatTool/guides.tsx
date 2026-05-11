import Guides, { OnChangeGuides } from '@scena/guides';
import { EditData, EditFn, SourceData } from '../../context';
import style from './index.module.less';
import { Listener } from '@/utils/utils';
import classnames from 'classnames';
interface GuidesProps {
  container: HTMLElement;
  wh: number;
  offsetTop: number;
  offsetLeft: number;
}
const errorRange = 1;
// 公共配置
const commonGuidesOption = {
  backgroundColor: '#f1f2f4',
  textColor: '#777',
  mainLineSize: '10px',
  shortLineSize: '0px',
  longLineSize: '0px',
  textAlign: 'center' as const,
  displayGuidePos: false,
  displayDragPos: true,
  useResizeObserver: true,
  className: style['guides-container'],
  markColor: '#777',
  selectedBackgroundColor: '#f1f2f4',
  selectedRangesText: true,
  selectedRangesTextColor: '#777',
  defaultPixelScale: window.devicePixelRatio || 2,
};
const getUnit = (zoom: number) => {
  const unit = 50 / zoom;
  if (unit % 50 == 0) {
    return unit;
  } else {
    return Math.ceil(unit / 50) * 50;
  }
};
const GuidesTool = (props: GuidesProps) => {
  const { container, wh, offsetTop, offsetLeft } = props;
  const sourceData = useContext(SourceData);
  const { zoom, panelIndex } = useContext(EditData);
  const panelData = useMemo(() => sourceData.panels[panelIndex], [sourceData.panels, panelIndex]);
  const lockGuides = useMemo(
    () => (sourceData.guide?.isLock ? ['remove', 'change'] : []) as ['remove', 'change'],
    [sourceData.guide],
  );
  const { setGuide } = useContext(EditFn);
  const ref = useRef({
    // vertical
    guidesV: null as Guides | null,
    // horizontal
    guidesH: null as Guides | null,
    listener: null as null | Listener<HTMLElement>,
  });
  useEffect(() => {
    if (container) {
      if (!ref.current.listener) {
        ref.current.listener = new Listener(container);
      }
      // 滚动时同步
      ref.current.listener.on('scroll', () => {
        if (ref.current.guidesH && ref.current.guidesV) {
          ref.current.guidesH.scroll(container.scrollLeft / zoom);
          ref.current.guidesH.scrollGuides(container.scrollTop / zoom);
          ref.current.guidesV.scroll(container.scrollTop / zoom);
          ref.current.guidesV.scrollGuides(container.scrollLeft / zoom);
        }
      });
    }
    return () => {
      if (ref.current.listener) {
        ref.current.listener.off('scroll');
      }
    };
  }, [container, zoom]);
  useEffect(() => {
    destroy();
    eventRegister();
    /* 
      设置偏移量,用于和编辑区域同步
      errorRange 用于修正误差(当前是1px)
    */
    if (ref.current.guidesH && ref.current.guidesV) {
      const offsetX = offsetLeft + wh - errorRange;
      const offsetY = offsetTop + wh - errorRange;
      ref.current.guidesH.setState({
        zoom: zoom,
        unit: getUnit(zoom),
        range: [0, panelData.w],
        marks: [0, panelData.w],
        selectedRanges: [
          [0, 0],
          [panelData.w, panelData.w],
        ],
        lockGuides,
        defaultGuides: sourceData.guide?.hLines.map((num) => num + offsetTop / zoom),
        textOffset: [offsetX, 0],
        selectedRangesTextOffset: [offsetX, 0],
        lineOffset: [offsetX / 2, 0],
        snapThreshold: 3,
        snaps: [offsetTop / zoom, panelData.h / 2 + offsetTop / zoom, panelData.h + offsetTop / zoom],
        guidePosFormat: (value) => {
          return Math.round(value - offsetTop / zoom);
        },
        dragPosFormat: (value) => posFormat('h', value),
      });
      ref.current.guidesV.setState({
        zoom: zoom,
        unit: getUnit(zoom),
        range: [0, panelData.h],
        marks: [0, panelData.h],
        selectedRanges: [
          [0, 0],
          [panelData.h, panelData.h],
        ],
        snapThreshold: 3,
        lockGuides,
        defaultGuides: sourceData.guide?.vLines.map((num) => num + offsetLeft / zoom),
        textOffset: [0, offsetY],
        selectedRangesTextOffset: [0, offsetY],
        /* 
          0.3是凑出来的值, 没有逻辑原因
          作用: 纵向对齐 
        */
        lineOffset: [0, offsetY / 2 + 0.3],
        snaps: [offsetLeft / zoom, panelData.w / 2 + offsetLeft / zoom, panelData.w + offsetLeft / zoom],
        guidePosFormat: (value) => {
          return Math.round(value - offsetLeft / zoom);
        },
        dragPosFormat: (value) => posFormat('v', value),
      });
    }
  }, [zoom, offsetLeft, offsetTop, sourceData]);
  const eventRegister = () => {
    /* 
      拖拽事件, 用于显隐刻度值
      changeGuides 用于同步刻度值
    */
    if (ref.current.guidesH) {
      ref.current.guidesH.on('dragStart', () => {
        setGuide(
          {
            isLock: false,
          },
          false,
        );
      });
      ref.current.guidesH.on('changeGuides', (e) => {
        changeGuides('horizontal', e);
      });
    }
    if (ref.current.guidesV) {
      ref.current.guidesV.on('dragStart', () => {
        setGuide(
          {
            isLock: false,
          },
          false,
        );
      });
      ref.current.guidesV.on('changeGuides', (e) => {
        changeGuides('vertical', e);
      });
    }
  };
  const posFormat = (type: 'v' | 'h', value: number) => {
    if (type === 'v') {
      const showVal = Math.round(value - offsetLeft / zoom);
      if (showVal < 0 || showVal > panelData.w) {
        return '放开删除';
      }
      return `X:${showVal}`;
    } else {
      const showVal = Math.round(value - offsetTop / zoom);
      if (showVal < 0 || showVal > panelData.h) {
        return '放开删除';
      }
      return `Y:${showVal}`;
    }
  };
  const changeGuides = (type: 'horizontal' | 'vertical', e: OnChangeGuides & { currentTarget: Guides }) => {
    const cacheGuides = [] as number[];
    const newGuides = e.guides.filter((num) => {
      const offsetNum = Math.round(num - (type == 'horizontal' ? offsetTop : offsetLeft) / zoom);
      if (offsetNum >= 0 && offsetNum <= panelData[type == 'horizontal' ? 'h' : 'w']) {
        cacheGuides.push(offsetNum);
        return true;
      }
      return false;
    });
    e.currentTarget.setState({
      defaultGuides: newGuides,
    });
    setGuide({
      [type == 'horizontal' ? 'hLines' : 'vLines']: cacheGuides,
    });
  };
  const destroy = () => {
    if (ref.current.guidesH) {
      ref.current.guidesH.off('changeGuides');
    }
    if (ref.current.guidesV) {
      ref.current.guidesV.off('changeGuides');
    }
  };
  /* 
    1. guides插件没有hover展示数值的功能, 这边手动实现
    2. 这边不用MouseEnter的原因是, 需要监听到子元素的移入事件. 
  */
  const mouseOver = useCallback((e: React.MouseEvent<HTMLElement, MouseEvent>, type: 'v' | 'h') => {
    const dom = e.target as HTMLElement;
    if (dom?.hasAttribute('data-pos')) {
      const guide = type === 'v' ? ref.current.guidesV : ref.current.guidesH;
      if (guide) {
        const index = dom.getAttribute('data-index');
        const showDom = dom.parentElement?.querySelector('.scena-guides-display-drag') as HTMLElement;
        if (showDom) {
          const x = e.clientX - (dom.parentElement?.getBoundingClientRect()?.x || 0);
          const y = e.clientY - (dom.parentElement?.getBoundingClientRect()?.y || 0);
          showDom.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
          showDom.innerText = posFormat(type, guide.getGuides()[(index as unknown as number) || 0]);
          showDom.style.display = 'block';
        }
      }
    }
  }, []);
  const mouseOut = useCallback((e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    const dom = e.target as HTMLElement;
    if (dom?.hasAttribute('data-pos')) {
      const showDom = dom.parentElement?.querySelector('.scena-guides-display-drag') as HTMLElement;
      if (showDom) {
        showDom.style.display = 'none';
      }
    }
  }, []);
  return (
    <>
      <div
        className={classnames(style['ruler-tool'], style['ruler-unit'])}
        style={{
          width: wh + 'px',
          height: wh + 'px',
        }}
      >
        px
      </div>
      <div
        className={classnames(style['ruler-tool'], style['ruler-horizontal'], {
          [style['ruler-lock']]: sourceData.guide?.isLock,
        })}
        style={{ height: wh + 'px' }}
        onMouseOver={(e) => {
          mouseOver(e, 'h');
        }}
        onMouseOut={mouseOut}
        ref={(horizontal) => {
          if (horizontal && !ref.current.guidesH) {
            const guideStyle = {
              left: wh + 'px',
              width: `calc(100% - ${wh}px)`,
            };
            ref.current.guidesH = new Guides(horizontal, {
              type: 'horizontal',
              zoom,
              range: [1, panelData.w],
              dragGuideStyle: guideStyle,
              guideStyle: guideStyle,
              ...commonGuidesOption,
            });
          }
        }}
      ></div>
      <div
        className={classnames(style['ruler-tool'], style['ruler-vertical'], {
          [style['ruler-lock']]: sourceData.guide?.isLock,
        })}
        style={{ width: wh + 'px' }}
        onMouseOver={(e) => {
          mouseOver(e, 'v');
        }}
        onMouseOut={mouseOut}
        ref={(vertical) => {
          if (vertical && !ref.current.guidesV) {
            const guideStyle = {
              top: wh + 'px',
              height: `calc(100% - ${wh}px)`,
            };
            ref.current.guidesV = new Guides(vertical, {
              type: 'vertical',
              zoom,
              range: [1, panelData.h],
              dragGuideStyle: guideStyle,
              guideStyle: guideStyle,
              ...commonGuidesOption,
            });
          }
        }}
      ></div>
    </>
  );
};

export default GuidesTool;
