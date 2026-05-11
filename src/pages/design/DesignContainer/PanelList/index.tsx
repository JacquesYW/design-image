import classnames from 'classnames';
import style from './index.module.less';
import { EditData, EditFn, SourceData } from '../../context';
import { DoubleRightOutlined, EllipsisOutlined, PlusOutlined } from '@ant-design/icons';
import React from 'react';
import { Tooltip } from 'antd';
import ActionPopover from './ActionPopover';
import { DragDropContext, DragDropContextProps, Droppable, Draggable } from '@hello-pangea/dnd';
import Fn from '@/utils/utils';
import ShowPanel from '../../ShowPanel';

const LISTITEMWH = 54;

interface PanelListProps {
  togglePanelList: () => void;
  panelListOpen: boolean;
}
const PanelList = (props: PanelListProps) => {
  const ref = useRef({
    dom: null as HTMLDivElement | null,
  });
  const { panelListOpen, togglePanelList } = props;
  const sourceData = useContext(SourceData);
  const { panelIndex, isChoosePanel, setPanelIndex, setIsChoosePanel } = useContext(EditData);
  const { addNewPanelByIndex, replacePanel } = useContext(EditFn);
  const panels = useMemo(() => sourceData.panels, [sourceData]);
  const panelLength = useMemo(() => panels.length, [panels]);
  const isShowGuide = useMemo(() => sourceData.guide?.show, [sourceData]);
  const [panelItems, setPanelItems] = useState(panels);
  const [selectId, setSelectId] = useState('');

  useEffect(() => {
    if (ref.current.dom) {
      ref.current.dom.addEventListener('wheel', onwheel);
      window.addEventListener('resize', resetPosition);
    }
    return () => {
      if (ref.current.dom) {
        ref.current.dom.removeEventListener('wheel', onwheel);
        window.addEventListener('resize', resetPosition);
      }
    };
  }, []);
  useEffect(() => {
    setPanelItems(panels);
  }, [panels]);
  useEffect(() => {
    setSelectId(panelItems[panelIndex].id);
  }, [panelIndex]);
  useEffect(() => {
    resetPosition();
  }, [panelIndex, panelListOpen]);
  const resetPosition = useCallback(() => {
    if (panelListOpen) {
      /* 避免新增后, 画板被新增模块遮挡 */
      if (ref.current.dom) {
        const dom = ref.current.dom.querySelector(`.${style.choosed}`) as HTMLElement;
        if (dom) {
          const domLeft = dom.offsetLeft;
          const domW = dom.offsetWidth;
          const scrollLeft = ref.current.dom.scrollLeft;
          const boxWidth = ref.current.dom.offsetWidth - 146;
          /* dom在可视区域左侧 */
          if (domLeft < scrollLeft) {
            ref.current.dom.scrollTo({ left: domLeft - 10, behavior: 'smooth' });
          }
          /* dom在可视区域右侧 */
          if (domLeft + domW > scrollLeft + boxWidth) {
            /* 56是画板的默认宽度, 这边需要左移dom的宽度-LISTITEMWH模块宽高, 再加上边线2px,也就是多出来的值 */
            ref.current.dom.scrollTo({
              left: domLeft - boxWidth + domW - (LISTITEMWH + 2),
              behavior: 'smooth',
            });
          }
        }
      }
    }
  }, [panelListOpen]);
  /* 支持鼠标滚轮滑动 横向滑动功能 */
  const onwheel = function (e: WheelEvent) {
    ref.current.dom!.scrollLeft += e.deltaY;
  };
  const onDragEnd: PickByValue<DragDropContextProps, 'onDragEnd'> = useCallback(
    (result) => {
      if (!result.destination) {
        return;
      }
      const newPanels = Fn.common.reorder(panels, result.source.index, result.destination.index);
      replacePanel(newPanels);
      setPanelItems(newPanels);
      setSelectId(newPanels[result.destination!.index].id);
      /* 
      延迟20ms更新panelIndex,replacePanel函数会有20ms的等待, 这边也做个等待
      尽量避免先执行panelIndex的更新, 再执行replacePanel函数, 导致panelIndex更新后, 画板列表还没更新, 导致显示闪动
      */
      setTimeout(() => {
        setPanelIndex(result.destination!.index);
      }, 20);
    },
    [panels, replacePanel],
  );
  return (
    <>
      <div
        className={classnames(style['panel-list'], {
          [style['show']]: panelListOpen,
        })}
        style={{ '--left-offset': isShowGuide ? '30px' : '0px' } as React.CSSProperties}
      >
        <div className={classnames(style['panel-list-action'])} onClick={togglePanelList}>
          <div>
            画板 {panelIndex + 1}/{panels.length}
            <DoubleRightOutlined
              className={classnames(style['action-icon-drection'], {
                [style['up']]: panelListOpen,
              })}
            />
          </div>
        </div>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="droppable" direction="horizontal">
            {(provided) => (
              <div
                className={classnames(style['panel-list-body'])}
                {...provided.droppableProps}
                ref={(dom) => {
                  ref.current.dom = dom;
                  provided.innerRef(dom);
                }}
              >
                {panelItems.map((panel, index) => {
                  const i = index + 1;
                  return (
                    <Draggable key={panel.id} draggableId={panel.id} index={index}>
                      {(provided, snapshot) => {
                        return (
                          <div
                            key={panel.id}
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={
                              {
                                flexShrink: 0,
                                display: 'flex',
                                '--list-item-bgc': snapshot.isDragging ? '#f6f7f9' : undefined,
                                ...provided.draggableProps.style,
                              } as unknown as React.CSSProperties
                            }
                          >
                            <Tooltip
                              destroyTooltipOnHide
                              title={`${i}. ${panel.nm || '画板'}`}
                              placement="top"
                              zIndex={10001}
                            >
                              <div
                                className={classnames(style['panel-list-item'], {
                                  [style.active]: panel.id == selectId,
                                  [style.choosed]: panel.id == selectId && isChoosePanel,
                                })}
                                style={
                                  {
                                    '--aspect-ratio': Math.max(1, panel.w / panel.h),
                                  } as React.CSSProperties
                                }
                                onClick={() => {
                                  if (index != panelIndex) {
                                    setPanelIndex(index);
                                  }
                                  setIsChoosePanel(true);
                                }}
                              >
                                <ShowPanel panel={panel} zoom={LISTITEMWH / panel.h} />
                                <span className={style['panel-list-item-index']}>{i}</span>
                                <ActionPopover index={index} nm={panel.nm}>
                                  <span className={style['panel-list-item-more-action']}>
                                    <EllipsisOutlined />
                                  </span>
                                </ActionPopover>
                              </div>
                            </Tooltip>
                            {index < panelLength - 1 ? (
                              <div
                                className={style['panel-list-item-gap-plus']}
                                onClick={() => addNewPanelByIndex(index)}
                              >
                                <div className={classnames(style['panel-list-gap-plus'], style['small'])}>
                                  <PlusOutlined />
                                </div>
                              </div>
                            ) : null}
                          </div>
                        );
                      }}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
                <div className={style['panel-list-item-plus-box']}>
                  <div
                    className={classnames(style['panel-list-item-plus'])}
                    onClick={() => addNewPanelByIndex(panelLength - 1)}
                  >
                    <PlusOutlined style={{ fontSize: '18px' }} />
                  </div>
                </div>
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </>
  );
};

export default PanelList;
