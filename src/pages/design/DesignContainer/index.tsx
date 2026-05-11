import { EditData, EditFn, SourceData } from '../context';
import _ from 'lodash';
import style from './index.module.less';
import Fn from '@/utils/utils';
import { ZoomTool, GuidesTool } from './FloatTool';
import BgRender from '@/pages/components/material/BgRender';
import SelectToAndMoveableTool, { isHit } from '@/pages/components/editer/SelectToAndMoveableTool';
import {
  DESIGNCANVASCONTAINER,
  DESIGNCANVASCONTENT,
  DESIGNCANVASID,
  DESIGNOUTERID,
  EditTypeEnum,
  EventsManageByEditType,
  LETFBARID,
} from '@/common/config';
import manageFactory from '@/utils/manageFactory';
import Moveable from 'moveable';
import AnimationContext from '../Animation/display/AnimationContext';
import classNames from 'classnames';
import { PlayCircleOutlined, PauseCircleOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import type { AnimationManager } from '../Animation/animationManager';
import { onResizeParam, onRotateParam } from '@/pages/components/editer/SelectToAndMoveableTool/interface';
import ContextMenu from './ContextMenu';
import MaterialRender from '@/pages/components/material';
import PanelList from './PanelList';
import { MINZOOM } from './FloatTool/zoom';

const PANELLISTHEIGHT = 90;
const FLOATTOOLBOTTOM = 12;
const SCROLLBARWH = 8;
// 画布设计区域的最大宽高
export const designSpace = {
  top: 38,
  bottom: 40 + FLOATTOOLBOTTOM,
  left: 50,
  right: 50,
};
const DesignContainer = () => {
  const sourceData = useContext(SourceData);
  const {
    zoom,
    setZoom,
    selectLayers,
    setSelectLayers,
    selectLayersFn,
    editParam,
    setEditParam,
    panelIndex,
    showPanelList,
    setShowPanelList,
  } = useContext(EditData);
  const { updateLayer, duplicateLayers } = useContext(EditFn);
  const panelData = useMemo(() => sourceData.panels[panelIndex], [sourceData, panelIndex]);

  const { togglePreviewTimeline, stopPreviewAnimation, addCallback, removeCallback } = useContext(AnimationContext);
  const domRef = useRef({
    container: null as HTMLElement | null,
    canvasContainer: null as HTMLElement | null,
  });
  const ref = useRef({
    timer: null as NodeJS.Timeout | null,
    resizeObserverWidth: null as number | null,
    moveable: null as Moveable | null,
    // 避免不触发 moveable的dragEnd事件
    isUp: false,
  });
  const [center, setCenter] = useState({ top: 0, left: 0 });
  const [moveableHidden, setMoveableHidden] = useState(false);
  const [contextMenu, setContextMenu] = useState({ open: false, clientXY: { x: 0, y: 0 } });
  const [animationPreviewAvailable, setAnimationPreviewAvailable] = useState(false);
  const [animationPreviewing, setAnimationPreviewing] = useState(false);
  const animationTimeElRef = useRef<HTMLSpanElement | null>(null);
  const animationTimeValueRef = useRef<string>('');
  const collectAnimationTimeEl = useCallback((node: HTMLSpanElement) => {
    animationTimeElRef.current = node;
    if (node) {
      node.textContent = animationTimeValueRef.current;
    }
  }, []);
  const designSpaceBottom = useMemo(() => designSpace.bottom + (showPanelList ? PANELLISTHEIGHT : 0), [showPanelList]);
  useEffect(() => {
    alignCenter();
    const leftBarDom = document.getElementById(LETFBARID) as HTMLDivElement;
    /* 
      监听右侧看板宽度
      1. 动画居中
      2. 防抖
    */
    const res = new ResizeObserver(([resizeEntry]) => {
      const { width } = resizeEntry.contentRect;
      if (ref.current.resizeObserverWidth === null) {
        ref.current.resizeObserverWidth = width;
        return;
      }
      if (ref.current.resizeObserverWidth == width) return;
      ref.current.resizeObserverWidth = width;
      // alignCenter();
      // if (!ref.current.timer) {
      if (ref.current.timer) {
        clearTimeout(ref.current.timer);
      }
      res.unobserve(leftBarDom);
      ref.current.timer = setTimeout(() => {
        res.observe(leftBarDom);
        alignCenter();
      }, 300);
      // } else {
      //   clearTimeout(ref.current.timer);
      //   ref.current.timer = null;
      // }
    });
    res.observe(leftBarDom);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      res.disconnect();
    };
  }, [panelData.w, panelData.h, zoom]);
  const onResize = useCallback(() => {
    resetZoom();
  }, [zoom]);
  useEffect(() => {
    resetZoom();
  }, [panelData.w, panelData.h]);
  useEffect(() => {
    if (!addCallback || !removeCallback) {
      return;
    }

    const update = (value: string | number) => {
      // const val = String(Number(Number(value).toFixed(2)));
      const val = Number(value).toFixed(2);
      animationTimeValueRef.current = val;
      if (animationTimeElRef.current) {
        animationTimeElRef.current.textContent = val;
      }
    };

    const callback = (state: AnimationManager['state']) => {
      if (!state) {
        setMoveableHidden(false);
        setAnimationPreviewAvailable(false);
        setAnimationPreviewing(false);
        update('');
        return;
      }
      setMoveableHidden(
        state.playing === true ||
          state.previewingItem === true ||
          state.previewingTimeline === true ||
          state.previewingGroup === true ||
          false,
      );
      const available = state.count !== undefined && state.count > 0;
      const previewing = state.previewingTimeline === true;
      setAnimationPreviewAvailable(available);
      setAnimationPreviewing(previewing);
      if (available) {
        if (previewing) {
          update(state.progress || '');
        } else {
          update(state.duration || '');
        }
      } else {
        update('');
      }
    };

    addCallback(callback);

    return () => {
      removeCallback(callback);
    };
  }, [addCallback, removeCallback]);
  /* 不需要记录操作步骤的函数 */
  const resetZoom = (type?: 'fill') => {
    if (!domRef.current.container) return;
    const { width, height } = domRef.current.container.getBoundingClientRect();
    let scale = zoom;
    if (type === 'fill') {
      scale = Fn.calc.whScaleOneSide(
        'h',
        panelData.w,
        panelData.h,
        /* 需要减去2边留白 */
        width - (designSpace.left + designSpace.right + SCROLLBARWH),
        height,
      ).mins;
    } else {
      scale = Fn.calc.whScale(panelData.w, panelData.h, width, height, {
        x: designSpace.left + designSpace.right,
        y: designSpace.top + designSpaceBottom,
      }).mins;
    }
    // 避免 zoom值未变,但是位置没居中
    if (scale == zoom) {
      alignCenter();
    }
    setZoom(Math.max(scale, MINZOOM));
  };
  const alignCenter = useCallback(() => {
    if (!domRef.current.container) return;
    const { width, height } = domRef.current.container.getBoundingClientRect();
    /* 
      -60:design-canvas-container的padding(需要减去)
    */
    const top = (height - (designSpace.top + designSpaceBottom) - (panelData.h || 0) * zoom) / 2;
    const left = (width - designSpace.left * 2 - (panelData.w || 0) * zoom) / 2;
    /* top和left减去 滚动条宽度和高度(设计区域, 滚动条长期展示, 避免显隐造成抖动) */
    setCenter({
      top: top > 0 ? top - SCROLLBARWH : 0,
      left: left > 0 ? left - SCROLLBARWH : 0,
    });
  }, [designSpaceBottom, zoom, panelData]);
  /* 
    rules: 碰撞验证的限制规则
    1: 屏蔽选中的图层区域的碰撞检测
  */
  const getHintId = useCallback(
    ({ x, y }: { x: number; y: number }, rules: number[] = []) => {
      // 只处理设计区域的碰撞
      if (domRef.current.canvasContainer) {
        // 编辑时,不做设计区域碰撞检测(避免编辑图层时,触发碰撞检测,造成编辑功能无法使用)
        if (!editParam.type) {
          if (!isHit({ x, y }, domRef.current.canvasContainer as HTMLElement)) return null;
        }
        // 阻止选中的图层区域,触发碰撞检测
        if (rules.includes(1) && isHit({ x, y }, window.imageCache.moveable?.getDragElement() as HTMLElement)) {
          return null;
        }
        let ids = panelData.layers.map((layer) => layer.id).reverse();
        // 提高选中id的碰撞层级
        ids = [...selectLayers, ...ids.filter((id) => !selectLayers.includes(id))];
        // 提高编辑图层的碰撞层级 (暂定编辑图层的层级最高)
        if (editParam.id) {
          ids = [editParam.id, ...ids.filter((id) => id != editParam.id)];
        }
        ids = ids
          .map((id) => {
            if (manageFactory.isGroupId(id)) {
              // 图层在上的, 数组在后面(需要做一下翻转)
              return manageFactory.getAllSubIdsById(id).reverse();
            } else {
              return id;
            }
          })
          .flat();
        const id = manageFactory.getHintIdByEvent({ x, y }, ids);
        return id;
      }
      return null;
    },
    [panelData.layers, selectLayers, editParam],
  );
  /* 拖拽时间统一处理, 拖拽中和拖拽结束, 逻辑一致 */
  const handlerResize = (eventName: 'onResize' | 'onResizeEnd', resize: onResizeParam[]) => {
    resize.forEach(({ id, ...param }) => {
      if (manageFactory.isGroupId(id)) {
        const subIds = manageFactory.getAllSubIdsById(id, true);
        subIds.forEach((subId) => {
          manageFactory.dispatchRegister(
            subId,
            eventName,
            Fn.calcByLayer.getNewResizeParamWithChildLayer(
              subId,
              {
                s: param.s,
                direction: param.direction,
              },
              zoom,
            ),
          );
        });
      }
      manageFactory.dispatchRegister(id, eventName, param);
    });
  };
  if (_.isEmpty(sourceData)) return null;
  return (
    <>
      {contextMenu.open ? <ContextMenu {...contextMenu} setContextMenu={setContextMenu} /> : null}
      <div
        className={style['editor-outer']}
        id={DESIGNOUTERID}
        style={
          {
            '--container-space-top': center.top + 'px',
            '--container-space-left': center.left + 'px',
            '--design-space-top': designSpace.top + 'px',
            '--design-space-bottom': designSpaceBottom + 'px',
            '--design-space-left': designSpace.left + 'px',
            '--canvas-width': panelData.w * zoom + 'px',
            '--canvas-height': panelData.h * zoom + 'px',
            '--zoom': zoom,
            '--float-tool-bottom': (showPanelList ? FLOATTOOLBOTTOM + PANELLISTHEIGHT : FLOATTOOLBOTTOM) + 'px',
            '--panel-list-height': PANELLISTHEIGHT + 'px',
          } as React.CSSProperties
        }
      >
        {animationPreviewAvailable && (
          <Button
            className={style['editor-animation-preview']}
            icon={animationPreviewing ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
            onClick={togglePreviewTimeline}
          >
            <span ref={collectAnimationTimeEl}></span> 秒
          </Button>
        )}
        <ZoomTool resetZoom={resetZoom} />
        <PanelList
          togglePanelList={() => {
            setShowPanelList(!showPanelList);
          }}
          panelListOpen={showPanelList}
        />
        <div
          className={classNames(style['editer-bar'], {
            [style['is-playing']]: moveableHidden,
          })}
          ref={(container) => {
            if (container) {
              domRef.current.container = container;
            }
          }}
          onContextMenu={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setContextMenu({
              open: true,
              clientXY: {
                x: e.clientX,
                y: e.clientY,
              },
            });
          }}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files.length > 0) {
              // 执行window的粘贴事件,完成拖拽粘贴逻辑(拖拽到设计区域时)
              const event = new ClipboardEvent('paste', { clipboardData: e.dataTransfer });
              window.dispatchEvent(event);
            }
          }}
        >
          {sourceData.guide?.show ? (
            <GuidesTool
              container={document.getElementById(DESIGNCANVASID) as HTMLElement}
              wh={30}
              offsetTop={designSpace.top + center.top - 30}
              offsetLeft={designSpace.left + center.left - 30}
            />
          ) : null}
          <div
            id={DESIGNCANVASID}
            className={style['editer-container']}
            onDoubleClick={(e) => {
              const point = { x: e.clientX, y: e.clientY };
              const id = getHintId(point);
              if (id) {
                manageFactory.dispatchRegister(id, 'dbclick', point);
              }
            }}
            onMouseMove={(e) => {
              if (!EventsManageByEditType.isEditBg(editParam.type)) {
                const hoverId = manageFactory.getHighestIdBySubId(getHintId({ x: e.clientX, y: e.clientY }, [1]));
                if (hoverId && !selectLayers.includes(hoverId)) {
                  manageFactory.toggleHoverById(hoverId);
                } else {
                  manageFactory.toggleHoverById('');
                }
              }
            }}
            onMouseDown={(e) => {
              // 选中时, 清除hover状态
              manageFactory.clearAllHover();
              ref.current.isUp = false;
              // 中键不触发点击事件
              const clientXY = { x: e.clientX, y: e.clientY };
              if (
                (e.button === 0 || (e.button === 2 && selectLayers.length <= 1)) &&
                !EventsManageByEditType.isEditBg(editParam.type)
              ) {
                const id = getHintId(clientXY);
                if (EventsManageByEditType.isClipImage(editParam.type)) {
                  if (!id || editParam.id != id) {
                    setEditParam({ type: '', id: '' });
                  }
                } else {
                  if (id) {
                    // 阻止 selectTo的框选触发
                    e.stopPropagation();
                    // 直接出发拖动(不用等点击选中后再处理)
                    if (!(e.shiftKey || e.ctrlKey)) {
                      window.imageCache.moveable?.waitToChangeTarget().then(() => {
                        if (!ref.current.isUp) {
                          window.imageCache.moveable?.dragStart(e.nativeEvent);
                        }
                      });
                    }
                  }
                  selectLayersFn(
                    id,
                    e.shiftKey || e.ctrlKey,
                    /* 选中图层时,取消画板的选中 */
                    id ? false : isHit(clientXY, document.getElementById(DESIGNCANVASCONTENT) as HTMLElement),
                  );
                }
              }
            }}
            onMouseUp={() => {
              ref.current.isUp = true;
            }}
          >
            {/* 居中占位使用容器 */}
            <div
              ref={(ref) => {
                if (ref) domRef.current.canvasContainer = ref;
              }}
              id={DESIGNCANVASCONTAINER}
              className={style['design-canvas-container']}
            >
              {/* 画布 */}
              <div
                id={DESIGNCANVASCONTENT}
                className={style['design-canvas']}
                onClick={(e) => {
                  if (stopPreviewAnimation) {
                    stopPreviewAnimation();
                  }
                  e.stopPropagation();
                }}
                onDragStart={(e) => e.preventDefault}
              >
                <BgRender />
                {/* 整个模板的容器 */}
                <div
                  className={style['design-template-container']}
                  style={{
                    overflow: EventsManageByEditType.isEditLayer(editParam.type) ? '' : 'hidden',
                  }}
                >
                  <div className={style['design-template-box']}>
                    <MaterialRender layers={panelData.layers} prePath={`panels[${panelIndex}].layers`} hasAnimation />
                  </div>
                </div>
              </div>
            </div>
            <SelectToAndMoveableTool
              dragContainer={document.getElementById(DESIGNCANVASID) as HTMLElement}
              container={document.getElementById(DESIGNCANVASCONTAINER) as HTMLElement}
              guideLines={{
                vertical: [0, panelData.w * zoom, ...(sourceData.guide?.vLines || []).map((num) => num * zoom)],
                horizontal: [0, panelData.h * zoom, ...(sourceData.guide?.hLines || []).map((num) => num * zoom)],
              }}
              zoom={zoom}
              // selectTo
              disabled={EventsManageByEditType.isUnSelectTo(editParam.type)}
              isHint={(point) => {
                return manageFactory.getHighestIdBySubId(getHintId(point));
              }}
              selectEnd={(ids) => {
                // 处理组id和子级id, 框中子集id,切换成组id
                if (ids.length > 0) {
                  const dealIds = new Set<string>();
                  ids.forEach((id) => {
                    if (manageFactory.isSubId(id)) {
                      dealIds.add(manageFactory.getHighestIdBySubId(id));
                    } else {
                      dealIds.add(id);
                    }
                  });
                  setSelectLayers([...dealIds]);
                }
              }}
              onDragStart={(e, ids) => {
                if (ids && e?.button === 0 && e?.altKey) {
                  /* 需要替换copy的缓存 */
                  const copyEvent = new ClipboardEvent('copy', {});
                  window.dispatchEvent(copyEvent);
                  duplicateLayers(ids, true, false);
                }
              }}
              onLayerClick={(e) => {
                if (
                  (e.button === 0 || (e.button === 2 && selectLayers.length <= 1)) &&
                  !EventsManageByEditType.isEditBg(editParam.type)
                ) {
                  const clientXY = { x: e.clientX, y: e.clientY };
                  const id = getHintId(clientXY);
                  if (EventsManageByEditType.isClipImage(editParam.type)) {
                    if (!id || editParam.id != id) {
                      setEditParam({ type: '', id: '' });
                    }
                  } else {
                    selectLayersFn(id, e.shiftKey || e.ctrlKey);
                  }
                }
              }}
              // moveable
              ids={selectLayers.filter((id) => {
                if (editParam.type == EditTypeEnum.TEXTEDIT) {
                  return true;
                }
                return id != manageFactory.getHighestIdBySubId(editParam.id);
              })}
              onDragEnd={(positions) => {
                positions.forEach(({ id, x, y }) => {
                  const param = {
                    tr: {
                      x: x / zoom,
                      y: y / zoom,
                    },
                  };
                  if (manageFactory.hasRegister(id, 'sync')) {
                    manageFactory.dispatchRegister(id, 'sync', { data: param });
                  } else {
                    updateLayer(id, param);
                  }
                });
              }}
              onRotateEnd={(rotates) => {
                // 批量时,会有xy的值,单个时,没有xy的值
                rotates.forEach(({ id, r, x, y }) => {
                  const param = {
                    tr: {
                      r,
                    } as onRotateParam,
                  };
                  if (x) {
                    param.tr.x = x / zoom;
                  }
                  if (y) {
                    param.tr.y = y / zoom;
                  }
                  if (manageFactory.hasRegister(id, 'sync')) {
                    manageFactory.dispatchRegister(id, 'sync', { data: param });
                  } else {
                    updateLayer(id, param);
                  }
                });
              }}
              onResize={(resize) => {
                // 缩放进行时处理
                handlerResize('onResize', resize);
              }}
              onResizeEnd={(resize) => {
                // 缩放结束后处理, 保存数据
                handlerResize('onResizeEnd', resize);
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
};
export default DesignContainer;

/* 
  selectTo 只做框选
  组的概念: 加入组图层概念, 合并和拆分时, 做组和组内图层的数据处理
  hover(只针对第一层,在组内的下层图层,无hover展示) 和 选中(做组和图层分开选中逻辑) 自己实现
  事件注册逻辑,也做组和图层分开处理(判断碰撞时,先图层,再组)
  tr的数据,先绑定在组中,拆分时,再分配给图层 (合并时,先整合组的数据,再做组内图层数据的兼容)

*/
