import Selecto from 'selecto';
import Moveable, { getElementInfo } from 'moveable';
import manageFactory, { ManageElement } from '@/utils/manageFactory';
import { isInside, getOverlapSize } from 'overlap-area';
import { DEFAULT_LAYER_CLASS, DEFAULT_LAYER_CLASS_SELECTED, getTransformBoxSubId } from '@/common/config';
import { IVector } from '@/utils/interface';
import { SelectToProps } from './interface';

/* 
  框选
*/
const MOVEABLECLASSNAME = 'custom-moveable-control-box-to-remove';
const SelectToAndMoveableTool = (props: SelectToProps) => {
  const {
    container,
    dragContainer,
    disabled,
    ids,
    zoom,
    guideLines,
    isHint,
    selectEnd,
    onDragStart,
    onLayerClick,
    onDragEnd,
    onRotateEnd,
    onResize,
    onResizeEnd,
    onScale,
    onScaleEnd,
  } = props;
  const ref = useRef({
    selecto: null as Selecto | null,
    moveable: null as Moveable | null,
  });
  useEffect(() => {
    if (!ref.current.selecto && container) {
      ref.current.selecto = new Selecto({
        container: container,
        dragContainer: dragContainer,
        selectableTargets: [`.${DEFAULT_LAYER_CLASS}`],
        selectByClick: false,
        continueSelect: true,
        selectFromInside: false,
        toggleContinueSelect: ['shift'],
        keyContainer: container,
        hitRate: 0,
        getElementRect: getElementInfo,
      });
    }
    if (!ref.current.moveable && container) {
      ref.current.moveable = new Moveable(container, {
        // target: manageFactory.getDomsByIds(ids || []),
        target: manageFactory.getTransDomsByIds(ids),
        dragContainer: dragContainer,
        className: MOVEABLECLASSNAME,
        draggable: true,
        rotatable: true,
        // scalable: true,
        resizable: true,
        hideChildMoveableDefaultLines: true,
        // top/left变化时（position）, 会触发resize事件
        useMutationObserver: true,
        // 大小变化时, 会触发resize事件
        useResizeObserver: true,
        scrollable: true,
        origin: false,
        dragArea: true,
        startDragRotate: 0,
        throttleDragRotate: 0,
        snapThreshold: 3,
        rotationPosition: 'bottom',
        snapRotationDegrees: [0, 45, 90, 135, 180, 225, 270, 315],
        snappable: true,
        elementSnapDirections: {
          top: true,
          left: true,
          bottom: true,
          right: true,
          center: true,
          middle: true,
        },
        snapDirections: {
          top: true,
          left: true,
          bottom: true,
          right: true,
          center: true,
          middle: true,
        },
        elementGuidelines: [
          ...manageFactory.getTransDomsByIds(
            manageFactory.getIds().filter((id) => !manageFactory.isSubId(id) && !ids.includes(id)),
          ),
        ],
      });
      window.imageCache.moveable = ref.current.moveable;
    }
    if (ref.current.moveable) {
      // 选中1个图层,并且图层被锁定时, 不做moveable处理
      if (ids.length == 1 && manageFactory.isLockedById(ids[0])) {
        ref.current.moveable.target = [];
      } else {
        ref.current.moveable.target = manageFactory.getTransDomsByIds(ids);
        ref.current.moveable.renderDirections = manageFactory.getMoveableDriectionsByIds(ids);
        ref.current.moveable.elementGuidelines = [
          ...manageFactory.getTransDomsByIds(
            manageFactory.getIds().filter((id) => !manageFactory.isSubId(id) && !ids.includes(id)),
          ),
        ];
      }
      removeUnnecessaryControlBox();
    }
    destory();
    selectToEventsRegister();
    moveAbleEventsRegister();
    return () => {
      destory();
    };
  }, [container, disabled, ids]);
  /* moveable插件内部, 对多个target和单个target的处理不同, 来回切换,会造成冗余的 div, 这边做多余删除处理 */
  const removeUnnecessaryControlBox = () => {
    const boxElms = [...document.querySelectorAll(`.${MOVEABLECLASSNAME}`)];
    boxElms.pop();
    boxElms.forEach((el) => {
      el.remove();
    });
  };
  useEffect(() => {
    if (ref.current.moveable && guideLines) {
      ref.current.moveable.verticalGuidelines = guideLines.vertical;
      ref.current.moveable.horizontalGuidelines = guideLines.horizontal;
    }
  }, [guideLines]);
  useEffect(() => {
    if (ref.current.moveable && zoom) {
      ref.current.moveable.snapDistFormat = (distance) => {
        return Math.floor(distance / (zoom || 1)) + 'px';
      };
    }
  }, [zoom]);
  const selectToEventsRegister = () => {
    if (ref.current.selecto) {
      ref.current.selecto.on('dragStart', (e) => {
        // 点击到选中的节点, 不触发框选
        if (ref.current.moveable?.isMoveableElement(e.inputEvent.target)) {
          e.stop();
        } else if (isHint({ x: e.clientX, y: e.clientY })) {
          e.stop();
        } else {
          if (disabled) {
            e.stop();
          } else {
            selectEnd([]);
          }
        }
      });
      // 框选进行时,实时更新选中的图层
      ref.current.selecto.on('select', (e) => {
        e.removed.forEach((dom) => {
          dom.classList.remove(DEFAULT_LAYER_CLASS_SELECTED);
        });
        e.selected.forEach((dom) => {
          dom.classList.add(DEFAULT_LAYER_CLASS_SELECTED);
        });
      });
      // 选中赋值
      ref.current.selecto.on('selectEnd', (e) => {
        e.selected.forEach((dom) => {
          dom.classList.remove(DEFAULT_LAYER_CLASS_SELECTED);
        });
        if (!e.isClick && e.selected.length > 0) {
          selectEnd(
            manageFactory.getIdsByDoms(e.selected).filter((id) => {
              // 框选时,过滤掉锁定的图层
              return !manageFactory.isLockedById(id);
            }),
          );
          // 清空下对象选中的值, 每次框选都是从0开始
          e.currentTarget.setSelectedTargets([]);
        }
      });
    }
  };
  const moveAbleEventsRegister = () => {
    if (ref.current.moveable) {
      ref.current.moveable.on('dragGroupStart', (e) => {
        e.inputEvent.stopPropagation();
        onDragStart && onDragStart(e.inputEvent, ids);
      });
      ref.current.moveable.on('dragGroup', (e) => {
        e.events
          .filter((ev) => {
            return ids.includes(manageFactory.getIdByDom(ev.target));
          })
          .forEach((ev) => {
            ev.target.style.transform = ev.transform;
          });
      });
      ref.current.moveable.on('dragGroupEnd', (e) => {
        if (e.isDrag) {
          if (onDragEnd) {
            onDragEnd(
              e.events
                .filter((ev) => {
                  return ids.includes(manageFactory.getIdByDom(ev.target));
                })
                .map((ev) => {
                  return {
                    id: manageFactory.getIdByDom(ev.target),
                    x: ev.lastEvent?.translate?.[0],
                    y: ev.lastEvent?.translate?.[1],
                  };
                }),
            );
          }
        } else {
          onLayerClick && onLayerClick(e.inputEvent);
        }
      });
      ref.current.moveable.on('rotateGroupStart', (e) => {
        e.inputEvent.stopPropagation();
        // 避免组合旋转时, 造成位置监听函数的触发, 导致旋转能力重置
        e.currentTarget.useMutationObserver = false;
      });
      ref.current.moveable.on('rotateGroup', (e) => {
        e.events
          .filter((ev) => {
            return ids.includes(manageFactory.getIdByDom(ev.target));
          })
          .forEach((ev) => {
            ev.target.style.transform = ev.drag.transform;
          });
      });
      ref.current.moveable.on('rotateGroupEnd', (e) => {
        // 旋转结束后, 重新开启位置监听函数
        e.currentTarget.useMutationObserver = true;
        if (onRotateEnd) {
          onRotateEnd(
            e.events
              .filter((ev) => {
                return ids.includes(manageFactory.getIdByDom(ev.target));
              })
              .map((ev) => {
                return {
                  id: manageFactory.getIdByDom(ev.target),
                  r: ev.lastEvent?.rotate % 360,
                  x: ev.lastEvent?.drag?.translate?.[0],
                  y: ev.lastEvent?.drag?.translate?.[1],
                };
              }),
          );
        }
      });
      ref.current.moveable.on('resizeGroupStart', (e) => {
        e.inputEvent.stopPropagation();
        // 如文字缩放, 不需要吸附和辅助线
        // if (!manageFactory.getSnappableByIds(ids)) {
        e.currentTarget.snappable = false;
        // }
        if (e.direction.includes(0)) {
          e.currentTarget.keepRatio = false;
        } else {
          e.currentTarget.keepRatio = true;
        }
        e.events.forEach((ev) => {
          const { width, height } = getElementInfo(ev.target);
          ev.datas.sw = width;
          ev.datas.sh = height;
        });
      });
      ref.current.moveable.on('resizeGroup', (e) => {
        if (onResize) {
          onResize(
            e.events.map((ev) => {
              return {
                id: manageFactory.getIdByDom(ev.target),
                direction: ev.direction,
                w: ev.width,
                h: ev.height,
                x: ev.drag.beforeTranslate[0],
                y: ev.drag.beforeTranslate[1],
                s: [ev.width / ev.datas.sw, ev.height / ev.datas.sh],
                sr: ev.startRatio,
              };
            }),
          );
        }
      });
      ref.current.moveable.on('resizeGroupEnd', (e) => {
        e.currentTarget.snappable = true;
        if (onResizeEnd) {
          onResizeEnd(
            e.events.map((ev) => {
              return {
                id: manageFactory.getIdByDom(ev.target),
                direction: ev.lastEvent.direction,
                w: ev.lastEvent.width,
                h: ev.lastEvent.height,
                x: ev.lastEvent.drag.beforeTranslate[0],
                y: ev.lastEvent.drag.beforeTranslate[1],
                s: [ev.lastEvent.width / ev.datas.sw, ev.lastEvent.height / ev.datas.sh],
                sr: ev.lastEvent.startRatio,
              };
            }),
          );
        }
      });
      ref.current.moveable.on('dragStart', (e) => {
        /* 阻止最外层container的mousedown事件的触发 */
        e.inputEvent?.stopPropagation();
        onDragStart && onDragStart(e.inputEvent, ids);
      });
      ref.current.moveable.on('drag', (e) => {
        e.target.style.transform = e.transform;
      });
      ref.current.moveable.on('dragEnd', (e) => {
        if (e.isDrag) {
          if (e.lastEvent && onDragEnd) {
            onDragEnd(
              ids.map((id) => {
                return {
                  id,
                  x: e.lastEvent.translate[0],
                  y: e.lastEvent.translate[1],
                };
              }),
            );
          }
        } else {
          onLayerClick && onLayerClick(e.inputEvent);
        }
      });
      ref.current.moveable.on('rotate', (e) => {
        e.target.style.transform = e.transform;
      });
      ref.current.moveable.on('rotateEnd', (e) => {
        if (e.lastEvent && onRotateEnd) {
          onRotateEnd(
            ids.map((id) => {
              return {
                id,
                r: e.lastEvent.rotate % 360,
              };
            }),
          );
        }
      });
      ref.current.moveable.on('scale', (e) => {
        onScale &&
          onScale(
            ids.map((id) => {
              return {
                id,
                direction: e.direction,
                s: e.scale,
                x: e.drag.translate[0],
                y: e.drag.translate[1],
                w: e.drag.width,
                h: e.drag.height,
              };
            }),
          );
      });
      ref.current.moveable.on('scaleEnd', (e) => {
        if (e.lastEvent && onScaleEnd) {
          onScaleEnd(
            ids.map((id) => {
              return {
                id,
                direction: e.lastEvent.direction,
                s: e.lastEvent.scale,
                x: e.lastEvent.drag.translate[0],
                y: e.lastEvent.drag.translate[1],
                w: e.lastEvent.drag.width,
                h: e.lastEvent.drag.height,
              };
            }),
          );
        }
      });
      ref.current.moveable.on('resizeStart', (e) => {
        const { width, height } = getElementInfo(e.target);
        e.datas.sw = width;
        e.datas.sh = height;
        // 如文字缩放, 不需要吸附和辅助线
        if (!manageFactory.getSnappableByIds(ids)) {
          e.currentTarget.snappable = false;
        }
        if (e.direction.includes(0)) {
          e.currentTarget.keepRatio = false;
        } else {
          e.currentTarget.keepRatio = true;
        }
      });
      ref.current.moveable.on('resize', (e) => {
        onResize &&
          onResize(
            ids.map((id) => {
              return {
                id,
                direction: e.direction,
                w: e.width,
                h: e.height,
                x: e.drag.beforeTranslate[0],
                y: e.drag.beforeTranslate[1],
                s: [e.width / e.datas.sw, e.height / e.datas.sh],
                sr: e.startRatio,
              };
            }),
          );
      });
      ref.current.moveable.on('resizeEnd', (e) => {
        e.currentTarget.snappable = true;
        if (e.lastEvent && onResizeEnd) {
          onResizeEnd(
            ids.map((id) => {
              return {
                id,
                direction: e.lastEvent.direction,
                w: e.lastEvent.width,
                h: e.lastEvent.height,
                x: e.lastEvent.drag.beforeTranslate[0],
                y: e.lastEvent.drag.beforeTranslate[1],
                s: [e.lastEvent.width / e.datas.sw, e.lastEvent.height / e.datas.sh],
                sr: e.lastEvent.startRatio,
              };
            }),
          );
        }
      });
    }
  };
  const destory = () => {
    if (ref.current.selecto) {
      ref.current.selecto.off('dragStart');
      ref.current.selecto.off('select');
      ref.current.selecto.off('selectEnd');
    }
    if (ref.current.moveable) {
      ref.current.moveable.off('dragGroupStart');
      ref.current.moveable.off('dragGroup');
      ref.current.moveable.off('dragGroupEnd');
      ref.current.moveable.off('rotateGroup');
      ref.current.moveable.off('rotateGroupEnd');
      ref.current.moveable.off('resizeGroupStart');
      ref.current.moveable.off('resizeGroup');
      ref.current.moveable.off('resizeGroupEnd');

      ref.current.moveable.off('dragStart');
      ref.current.moveable.off('drag');
      ref.current.moveable.off('dragEnd');
      ref.current.moveable.off('rotate');
      ref.current.moveable.off('rotateEnd');
      ref.current.moveable.off('resizeStart');
      ref.current.moveable.off('resize');
      ref.current.moveable.off('resizeEnd');
      ref.current.moveable.off('scale');
      ref.current.moveable.off('scaleEnd');
    }
  };
  return <></>;
};

export default SelectToAndMoveableTool;

/* 
  计算点和面是否碰撞
  点 point:{x,y} 距离screen的距离 (clientX,clientY)
  dom: 需要计算碰撞的图层模块
*/
export const isHit = (point: IVector, dom: ManageElement): boolean => {
  const { pos1, pos2, pos3, pos4, top, left } = getElementInfo(dom);
  return isInside([point.x - left, point.y - top], [pos1, pos2, pos4, pos3]);
};

/* 
  重叠图层筛选
*/
export const isOverlapByIds = (ids: string[], mainId: string, isInCludeMain = true): string[] => {
  const mainDom = manageFactory.getTransDomById(mainId);
  const overlapIds: string[] = [];
  ids.forEach((id) => {
    if (id == mainId && isInCludeMain) {
      overlapIds.push(id);
    } else if (isOverlap(manageFactory.getTransDomById(id), mainDom)) {
      overlapIds.push(id);
    }
  });
  return overlapIds;
};
/* 
  计算两个图层的重叠面积是否大于0 (判断是否重叠)
*/
export const isOverlap = (dom1: ManageElement, dom2: ManageElement): boolean => {
  const { pos1, pos2, pos3, pos4, top, left } = getElementInfo(dom1);
  const { pos1: pos11, pos2: pos22, pos3: pos33, pos4: pos44, top: top11, left: left11 } = getElementInfo(dom2);
  return (
    getOverlapSize(
      [
        [pos11[0] + left11, pos11[1] + top11],
        [pos22[0] + left11, pos22[1] + top11],
        [pos44[0] + left11, pos44[1] + top11],
        [pos33[0] + left11, pos33[1] + top11],
      ],
      [
        [pos1[0] + left, pos1[1] + top],
        [pos2[0] + left, pos2[1] + top],
        [pos4[0] + left, pos4[1] + top],
        [pos3[0] + left, pos3[1] + top],
      ],
    ) > 0
  );
};

/* 
  计算图层对齐的位置信息数据
  ids: 图层id数组, w/h 当前设计区域的宽高
*/
export type AlignPosition = {
  top: { y: number };
  right: { x: number };
  bottom: { y: number };
  left: { x: number };
  // 水平居中
  horizontalCenter: { x: number };
  // 垂直居中
  verticalCenter: { y: number };
  // 中心
  center: { x: number; y: number };
};
export const getPositionXY = (ids: string[], { w, h }: { w: number; h: number }, zoom: number) => {
  const result = new Map<string, AlignPosition>();
  ids.forEach((id) => {
    const transformDom = document.getElementById(getTransformBoxSubId(id));
    if (transformDom) {
      const { origin, targetOrigin, pos1, pos2, pos3, pos4, width, height } = getElementInfo(transformDom);
      const maxX = Math.max(pos1[0], pos2[0], pos3[0], pos4[0]) / zoom;
      const maxY = Math.max(pos1[1], pos2[1], pos3[1], pos4[1]) / zoom;
      const offsetLeft = (origin[0] - targetOrigin[0]) / zoom;
      const offsetTop = (origin[1] - targetOrigin[1]) / zoom;
      result.set(id, {
        top: {
          y: offsetTop,
        },
        right: {
          x: w - maxX + offsetLeft,
        },
        bottom: {
          y: h - maxY + offsetTop,
        },
        left: {
          x: offsetLeft,
        },
        horizontalCenter: { x: (w - width / zoom) / 2 },
        verticalCenter: { y: (h - height / zoom) / 2 },
        center: {
          x: (w - width / zoom) / 2,
          y: (h - height / zoom) / 2,
        },
      });
    }
  });
  return result;
};
