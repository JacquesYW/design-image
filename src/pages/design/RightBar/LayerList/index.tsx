import React, { CSSProperties } from 'react';
import { IconByTy, LayerType, nameByTr } from '@/common/config';
import { EditData, EditFn, SourceData } from '../../context';
import style from './index.module.less';
import { DragDropContext, Droppable, Draggable, DragDropContextProps } from '@hello-pangea/dnd';
import { Layer } from '../../interface';
import { Lock, Unlock } from '@/pages/components/svgIcon';
import classnames from 'classnames';
import Delta from 'quill-delta';
import manageFactory from '@/utils/manageFactory';
import { Tooltip } from 'antd';
import Fn from '@/utils/utils';

const LayerList = () => {
  const sourceData = useContext(SourceData);
  const { replaceLayer, lockOrUnLockLayer } = useContext(EditFn);
  const { selectLayers, panelIndex, selectLayersFn } = useContext(EditData);
  const panelData = useMemo(() => sourceData.panels[panelIndex], [sourceData, panelIndex]);

  /* 
    直接使用sourceData.layers渲染, 会让拖拽后有抖动(好像是react: 18.2.0的问题)
    和这个issues相似: https://github.com/hello-pangea/dnd/issues/424
  */
  const [items, setItems] = useState<{ id: string; content: React.ReactNode }[]>([]);
  useEffect(() => {
    if (panelData.layers) {
      setItems(
        panelData.layers
          .map((layer) => {
            return {
              id: layer.id,
              content: layerContentRender({ layer, selectLayers }, { selectLayersFn, lockOrUnLockLayer }),
            };
          })
          .reverse(),
      );
    }
  }, [panelData.layers, selectLayers]);
  const changeZIndex = useCallback(
    (start: number, end: number) => {
      // items是layers.reverse后的数组,layers的位置需要反向计算
      const len = items.length - 1;
      const layers = Fn.common.reorder(panelData.layers, len - start, len - end);
      const newItems = Fn.common.reorder(items, start, end);
      setItems(newItems);
      replaceLayer('layers', layers);
    },
    [panelData.layers, items, setItems, replaceLayer],
  );
  const onDragEnd: PickByValue<DragDropContextProps, 'onDragEnd'> = useCallback(
    (result) => {
      if (!result.destination) {
        return;
      }
      changeZIndex(result.source.index, result.destination.index);
    },
    [changeZIndex],
  );

  if (!panelData?.layers) return null;
  return (
    <div className={style['panel-container']}>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable">
          {(provided) => (
            <div className={style['layer-list']} {...provided.droppableProps} ref={provided.innerRef}>
              {items.map((item, index) => (
                <Draggable key={item.id} draggableId={item.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      className={style['layer-list-item']}
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={
                        {
                          '--list-item-bgc': snapshot.isDragging ? '#f6f7f9' : undefined,
                          ...provided.draggableProps.style,
                        } as unknown as CSSProperties
                      }
                    >
                      {item.content}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default LayerList;

export const layerContentRender = (
  { layer, selectLayers }: { layer: Layer; selectLayers: string[] },
  {
    selectLayersFn,
    lockOrUnLockLayer,
  }: {
    selectLayersFn: PickByValue<EditData, 'selectLayersFn'>;
    lockOrUnLockLayer: PickByValue<EditFn, 'lockOrUnLockLayer'>;
  },
) => {
  const render = () => {
    let icon = IconByTy['default'],
      textName = nameByTr[layer.ty];
    switch (layer.ty) {
      case LayerType.TEXT: {
        if (typeof layer.p == 'string') {
          textName = layer.p;
        } else {
          new Delta(layer.p).forEach((op) => {
            textName += op.insert;
          });
        }
        icon = IconByTy[layer.ty];
        break;
      }
      case LayerType.QRCODE:
      case LayerType.GROUP:
        icon = IconByTy[layer.ty];
        break;
      case LayerType.IMAGE:
        icon = () => <img src={layer.p} alt="" />;
        break;
    }

    return (
      <>
        <div className={classnames(style['content-icon'], 'flex flex-center')}>{icon(14)}</div>
        <div className={classnames(style['content-textbox'], 'flex-col')}>
          <div className={classnames(style['content-text'], 'text-ellipsis')} title={textName}>
            {textName}
          </div>
          {layer.nm ? (
            <div className={classnames(style['content-nm'], 'text-ellipsis')} title={layer.nm}>
              {layer.nm}
            </div>
          ) : null}
        </div>
      </>
    );
  };
  const isSelected = selectLayers.includes(layer.id);
  return (
    <div
      className={classnames(style['layer-content'], {
        [style['selected']]: isSelected,
      })}
      onClick={(e) => {
        selectLayersFn(layer.id, e.shiftKey || e.ctrlKey);
      }}
      onMouseEnter={() => {
        if (!isSelected) {
          manageFactory.toggleHoverById(layer.id);
        }
      }}
      onMouseLeave={() => {
        manageFactory.clearAllHover();
      }}
    >
      {render()}
      <Tooltip title={layer.isLocked ? '解锁' : '锁定'}>
        <div
          className={style['layer-status-item']}
          onClick={(e) => {
            e.stopPropagation();
            lockOrUnLockLayer(layer.id, !layer.isLocked);
          }}
        >
          {layer.isLocked ? <Lock size={14} color="var(--color-red-600)" /> : <Unlock size={14} />}
        </div>
      </Tooltip>
    </div>
  );
};
