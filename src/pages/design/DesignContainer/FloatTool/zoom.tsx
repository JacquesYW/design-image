import { CheckOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { EditData, EditFn, SourceData } from '../../context';
import style from './index.module.less';
import classnames from 'classnames';
import { Divider, Popover } from 'antd';
import { DESIGNOUTERID } from '@/common/config';

// 固定比例集合
const zoomList = [
  { key: 0.02, label: '2%' },
  { key: 0.05, label: '5%' },
  { key: 0.1, label: '10%' },
  { key: 0.15, label: '15%' },
  { key: 0.25, label: '25%' },
  { key: 0.33, label: '33%' },
  { key: 0.5, label: '50%', show: true },
  { key: 0.75, label: '75%' },
  { key: 1, label: '100%', show: true },
  { key: 1.25, label: '125%' },
  { key: 1.5, label: '150%' },
  { key: 1.75, label: '175%' },
  { key: 2, label: '200%', show: true },
  { key: 3, label: '300%' },
  { key: 4, label: '400%', show: true },
];
const showZoomList = zoomList.filter((item) => item.show).toReversed();
export const MINZOOM = zoomList[0].key as number;
export const MAXZOOM = zoomList[zoomList.length - 2].key as number;
const ZoomTool = (props: { resetZoom: (type?: 'fill') => void }) => {
  const sourceData = useContext(SourceData);
  const { setGuide } = useContext(EditFn);
  const hasGuides = useMemo(
    () => sourceData.guide?.hLines?.length || sourceData.guide?.vLines?.length,
    [sourceData.guide],
  );
  const isLockGuide = useMemo(() => sourceData.guide?.isLock, [sourceData.guide]);
  const ref = useRef({
    zoomChangeStatus: 'auto' as 'selected' | 'auto',
  });
  const { zoom, setZoom } = useContext(EditData);
  const [open, setOpen] = useState(false);
  const [selectKey, setSelectKey] = useState<number | 'auto' | 'fill' | ''>('auto');
  // 滚轮事件 ctrl + 滚轮
  useEffect(() => {
    if (ref.current.zoomChangeStatus === 'selected') {
      ref.current.zoomChangeStatus = 'auto';
    } else {
      setSelectKey('');
    }
    const canvasContainer = document.getElementById(DESIGNOUTERID);
    canvasContainer?.addEventListener('wheel', setZoomByWheel, { passive: false });
    return () => {
      canvasContainer?.removeEventListener('wheel', setZoomByWheel);
    };
  }, [zoom]);
  // 滚轮缩放
  const setZoomByWheel = (e: WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();
      if (e.deltaY < 0) {
        setZoom(Math.min(zoom + 0.015, MAXZOOM));
      } else {
        setZoom(Math.max(zoom - 0.015, MINZOOM));
      }
    }
  };
  const changeZoom = (key: number | 'auto' | 'fill') => {
    ref.current.zoomChangeStatus = 'selected';
    setSelectKey(key);
    if (key === 'auto') {
      props.resetZoom();
      return;
    }
    if (key === 'fill') {
      props.resetZoom('fill');
      return;
    }
    setZoom(key as number);
  };
  return (
    <div
      className={classnames(style['zoom-tool'], {
        [style['focus']]: open,
      })}
      onClick={(e) => {
        e.stopPropagation();
      }}
      onMouseDownCapture={(e) => {
        e.stopPropagation();
      }}
    >
      <div
        className={classnames(style['zoom-tool-item'], style['show'], {
          [style['disabled']]: zoom <= MINZOOM,
        })}
        onClick={() => {
          let newZoomIndex = zoomList.findIndex((item) => typeof item.key == 'number' && item.key >= zoom);
          newZoomIndex -= 1;
          newZoomIndex = Math.max(newZoomIndex, 0);
          setZoom(zoomList[newZoomIndex].key as number);
        }}
      >
        <MinusOutlined />
      </div>
      <div
        className={classnames(style['zoom-tool-item'], style['show'], {
          [style['disabled']]: zoom >= MAXZOOM,
        })}
        onClick={() => {
          // 增大比例 / 最大 400%
          const newZoomIndex = zoomList.findIndex(
            (item) => (typeof item.key == 'number' && item.key > zoom) || item.key == 4,
          );
          setZoom(zoomList[newZoomIndex].key);
        }}
      >
        <PlusOutlined />
      </div>
      <Popover
        title={null}
        open={open}
        onOpenChange={(open) => setOpen(open)}
        placement="topRight"
        trigger={'click'}
        overlayClassName={style['zoom-tool-popover']}
        content={
          <div onClick={() => setOpen(false)}>
            {/* 参考线 guides */}
            <div
              className={classnames(style['zoom-tool-popover-item'], {
                [style['disabled']]: !hasGuides,
              })}
              onClick={() => hasGuides && setGuide({ isLock: !isLockGuide, show: true })}
            >
              {isLockGuide ? '解锁' : '锁定'}参考线
            </div>
            <div
              className={classnames(style['zoom-tool-popover-item'], {
                [style['disabled']]: !hasGuides,
              })}
              onClick={() =>
                hasGuides &&
                setGuide({
                  show: true,
                  hLines: [],
                  vLines: [],
                })
              }
            >
              清除参考线
            </div>
            <Divider style={{ margin: '8px 0px' }} />
            {/* 固定比例 */}
            {showZoomList.map((item) => {
              return (
                <div
                  key={item.key}
                  className={classnames(style['zoom-tool-popover-item'], {
                    [style['selected']]: item.key == selectKey,
                  })}
                  onClick={() => {
                    changeZoom(item.key);
                  }}
                >
                  {item.label}
                  <CheckOutlined className={style['check-icon']} />
                </div>
              );
            })}
            <Divider style={{ margin: '8px 0px' }} />
            {/* 自适应/原尺寸 - 快捷按钮 */}
            <div
              className={classnames(style['zoom-tool-popover-item'], {
                [style['selected']]: 'auto' == selectKey,
              })}
              onClick={() => changeZoom('auto')}
            >
              适合屏幕
              <CheckOutlined className={style['check-icon']} />
            </div>
            <div
              className={classnames(style['zoom-tool-popover-item'], {
                [style['selected']]: 'fill' == selectKey,
              })}
              onClick={() => changeZoom('fill')}
            >
              填满屏幕
              <CheckOutlined className={style['check-icon']} />
            </div>
          </div>
        }
      >
        {/* 展示比例 */}
        <div className={classnames(style['zoom-tool-item'], style['zoom-tool-content-item'])}>
          {(zoom * 100).toFixed(0) + '%'}
        </div>
      </Popover>
    </div>
  );
};

export default ZoomTool;
