import { Layer } from '@/pages/design/interface';
import { MorePanel } from '../interface';
import PanelLine from '../../PanelLine';
import style from './index.module.less';
import classnames from 'classnames';
import { Tooltip } from 'antd';
import { AlignMultipleIcon } from '@/pages/components/svgIcon';
import manageFactory from '@/utils/manageFactory';
import { EditData, EditFn } from '@/pages/design/context';
/* 
  1. 成组 / 拆分组 / 组内移动 - 等能力
  2. 多选对齐能力
*/
const fontSize = 20;
const MoreLayerPanel = (props: MorePanel<Layer>) => {
  const { ids } = props;
  const { zoom } = useContext(EditData);
  const { updateLayer } = useContext(EditFn);
  const canDistribute = useMemo(() => ids.length > 2, [ids]);
  const distributeAction = useCallback(
    (isVertical = true) => {
      const groupRect = window.imageCache.moveable!.getRect();
      const moveables = window.imageCache.moveable!.getMoveables();
      let { left, top } = groupRect;

      const gap = isVertical
        ? (groupRect.height -
            groupRect.children!.reduce((prev, cur) => {
              return prev + cur.height;
            }, 0)) /
          (moveables.length - 1)
        : (groupRect.width -
            groupRect.children!.reduce((prev, cur) => {
              return prev + cur.width;
            }, 0)) /
          (moveables.length - 1);
      // 根据位置排序-避免图层乱排
      moveables.sort((a, b) => {
        if (isVertical) {
          return a.state.top - b.state.top;
        } else {
          return a.state.left - b.state.left;
        }
      });
      const resultData: Array<{ id: string; x?: number; y?: number }> = [];
      moveables.forEach((child) => {
        const rect = child.getRect();
        if (isVertical) {
          resultData.push({
            id: manageFactory.getIdByDom(child.getDragElement() as HTMLElement),
            y: top / zoom,
          });
          top += rect.height + gap;
        } else {
          resultData.push({
            id: manageFactory.getIdByDom(child.getDragElement() as HTMLElement),
            x: left / zoom,
          });
          left += rect.width + gap;
        }
      });
      resultData
        .filter((item) => {
          // 避免连点多次触发(污染数据记录)
          const layer = manageFactory.getLayerDataById(item.id);
          return !(layer?.tr?.x.toFixed(6) === item.x?.toFixed(6) || layer?.tr?.y.toFixed(6) === item.y?.toFixed(6));
        })
        .forEach((item) => {
          updateLayer(item.id, {
            tr: {
              ...item,
            },
          });
        });
    },
    [updateLayer],
  );
  const alginAction = useCallback(
    (direction: 'h-l' | 'h-c' | 'h-r' | 'v-t' | 'v-c' | 'v-b') => {
      const rect = window.imageCache.moveable!.getRect();
      const moveables = window.imageCache.moveable!.getMoveables();
      const { top, left, height, width } = rect;
      moveables.forEach((child) => {
        const cRect = child.getRect();
        const id = manageFactory.getIdByDom(child.getDragElement() as HTMLElement);
        const layer = manageFactory.getLayerDataById(id);
        const layerX = layer?.tr.x as number;
        const layerY = layer?.tr.y as number;
        const diffLeft = left - cRect.left;
        const diffTop = top - cRect.top;
        switch (direction) {
          case 'h-l':
            updateLayer(id, {
              tr: {
                x: layerX + diffLeft / zoom,
              },
            });
            break;
          case 'h-c':
            updateLayer(id, {
              tr: {
                x: layerX + (diffLeft + (width - cRect.width) / 2) / zoom,
              },
            });
            break;
          case 'h-r':
            updateLayer(id, {
              tr: {
                x: layerX + (diffLeft + width - cRect.width) / zoom,
              },
            });
            break;
          case 'v-t':
            updateLayer(id, {
              tr: {
                y: layerY + diffTop / zoom,
              },
            });
            break;
          case 'v-c':
            updateLayer(id, {
              tr: {
                y: layerY + (diffTop + (height - cRect.height) / 2) / zoom,
              },
            });
            break;
          case 'v-b':
            updateLayer(id, {
              tr: {
                y: layerY + (diffTop + height - cRect.height) / zoom,
              },
            });
            break;
        }
      });
    },
    [updateLayer],
  );
  return (
    <>
      <PanelLine title="对齐">
        <div className={style['icon-btn-box']}>
          <div
            className={classnames(style['icon-btn'])}
            onClick={() => {
              alginAction('h-l');
            }}
          >
            <Tooltip mouseLeaveDelay={0} title="左对齐">
              <span>
                <AlignMultipleIcon direction="horizontalLeft" size={fontSize} />
              </span>
            </Tooltip>
          </div>
          <div
            className={classnames(style['icon-btn'])}
            onClick={() => {
              alginAction('h-c');
            }}
          >
            <Tooltip mouseLeaveDelay={0} title="水平居中对齐">
              <span>
                <AlignMultipleIcon direction="horizontalCenter" size={fontSize} />
              </span>
            </Tooltip>
          </div>
          <div
            className={classnames(style['icon-btn'])}
            onClick={() => {
              alginAction('h-r');
            }}
          >
            <Tooltip mouseLeaveDelay={0} title="右对齐">
              <span>
                <AlignMultipleIcon direction="horizontalRight" size={fontSize} />
              </span>
            </Tooltip>
          </div>
          <div
            className={classnames(style['icon-btn'])}
            onClick={() => {
              alginAction('v-t');
            }}
          >
            <Tooltip mouseLeaveDelay={0} title="上对齐">
              <span>
                <AlignMultipleIcon direction="verticalTop" size={fontSize} />
              </span>
            </Tooltip>
          </div>
          <div
            className={classnames(style['icon-btn'])}
            onClick={() => {
              alginAction('v-c');
            }}
          >
            <Tooltip mouseLeaveDelay={0} title="垂直居中对齐">
              <span>
                <AlignMultipleIcon direction="verticalCenter" size={fontSize} />
              </span>
            </Tooltip>
          </div>
          <div
            className={classnames(style['icon-btn'])}
            onClick={() => {
              alginAction('v-b');
            }}
          >
            <Tooltip mouseLeaveDelay={0} title="下对齐">
              <span>
                <AlignMultipleIcon direction="verticalBottom" size={fontSize} />
              </span>
            </Tooltip>
          </div>
        </div>
        <div className={style['panel-action-btn-box']}>
          <div
            className={classnames(style['panel-action-btn'], {
              [style['disabled']]: !canDistribute,
            })}
            onClick={() => {
              if (canDistribute) {
                distributeAction(false);
              }
            }}
          >
            水平分布
          </div>
          <div
            className={classnames(style['panel-action-btn'], {
              [style['disabled']]: !canDistribute,
            })}
            onClick={() => {
              if (canDistribute) {
                distributeAction();
              }
            }}
          >
            垂直分布
          </div>
        </div>
      </PanelLine>
    </>
  );
};

export default MoreLayerPanel;
