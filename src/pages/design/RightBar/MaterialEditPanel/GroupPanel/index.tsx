import manageFactory from '@/utils/manageFactory';
import PanelLine from '../../PanelLine';
import { v4 as uuid } from 'uuid';
import classnames from 'classnames';
import { LayerType } from '@/common/config';
import style from '../../index.module.less';
import { EditData, EditFn, SourceData } from '@/pages/design/context';
import { GroupLayer, Layer } from '@/pages/design/interface';
import TransformOperation, { getDiffXYByDiffOrgin } from '@/utils/transform';
import Fn from '@/utils/utils';

interface GroupPanelProps {
  ids: string[];
}
const GroupPanel = ({ ids }: GroupPanelProps) => {
  const sourceData = useContext(SourceData);
  const { replaceLayer } = useContext(EditFn);
  const { zoom, panelIndex, setSelectLayers } = useContext(EditData);
  const panelData = useMemo(() => sourceData.panels[panelIndex], [sourceData, panelIndex]);

  const canGroup = useMemo(() => ids.length > 1, [ids]);
  // 选中图层中, 组图层的id,( **后续拆分组使用 (单层组逻辑, 当前是嵌套组逻辑)**)
  // 选中的图层中, 有一个是组图层, 就展示拆分组
  const canSplitGroup = useMemo(
    () =>
      ids.some((id) => {
        return manageFactory.getLayerDataById(id)?.ty === LayerType.GROUP;
      }),
    [ids],
  );

  /* 
     成组
     1. 多个图层合并成一个图层
     2. 支持组图层和其他图层合并
     实现功能:
     1. 计算组xy,宽高, 默认旋转时0deg
     2. 计算组内图层xy,宽高, 组内图层的旋转角度不变
  */
  const toGroup = useCallback(() => {
    const newGroupLayer = {
      ty: LayerType.GROUP,
      id: uuid(),
      nm: '组',
      isLocked: false,
      tr: {
        o: 1,
        r: 0,
      },
    } as GroupLayer;
    const { width: w = 0, height: h = 0, left: x = 0, top: y = 0 } = window.imageCache.moveable?.getRect() || {};
    newGroupLayer.w = w / zoom;
    newGroupLayer.h = h / zoom;
    newGroupLayer.tr.x = x / zoom;
    newGroupLayer.tr.y = y / zoom;
    /*
      1. 过滤已经组合layer
      2. 已最后面的layer作为组图层的zindex
    */
    let i = 0;
    const layers = [] as Layer[];
    const newLayers = panelData.layers.filter((layer, index) => {
      if (ids.includes(layer.id)) {
        layers.push(layer);
        i = index;
        return false;
      }
      return true;
    });
    i -= ids.length - 1;
    // 更新下新成组时的path值
    layers.forEach((layer, index) => {
      manageFactory.setPathById(layer.id, `layers[${i}].childrens[${index}]`);
    });

    newGroupLayer.childrens = layers.map((layer) => {
      return {
        ...layer,
        tr: {
          ...layer.tr,
          x: layer.tr.x - newGroupLayer.tr.x,
          y: layer.tr.y - newGroupLayer.tr.y,
        },
      } as Layer;
    });
    newLayers.splice(i, 0, newGroupLayer);
    replaceLayer('layers', newLayers).then(() => {
      setSelectLayers([newGroupLayer.id]);
    });
  }, [panelData.layers, ids, replaceLayer]);
  /* 
     拆分组
     1. 单个组图层拆分成多个图层
     2. 多个组一起拆分成多个图层
     实现功能:
     1. 计算拆分后的图层xy,宽高, 
     2. 子图层旋转角度特殊处理 / 翻转特殊处理 (做 ^ 运算)
     3. 记录组图层的位置,将拆分后的图层插入到组图层的位置(从后往前加, 避免下标变化)
     *** 注: 嵌套组时, 子图层的x,y,w,h等修改, 已经递归上报处理, 拆分组时,不再做计算处理***
  */
  const toSplitGroup = () => {
    // 处理子图层的 xy和 r的数据
    const dealChildLayer = <T extends Layer>(groupLayer: GroupLayer, childLayer: T): T => {
      const tr = new TransformOperation({
        translate: {
          x: childLayer.tr.x + groupLayer.tr.x,
          y: childLayer.tr.y + groupLayer.tr.y,
        },
        skew: groupLayer.tr.sk,
        scale: groupLayer.tr.s,
        rotate: groupLayer.tr.r,
      });
      if (groupLayer.flip?.h) {
        tr.horizontal();
      }

      if (groupLayer.flip?.v) {
        tr.vertical();
      }
      let ow = childLayer.w,
        oh = childLayer.h;

      const { x, y } = getDiffXYByDiffOrgin(
        /* 组图层, 会因为子图层修改的宽高,导致需要重新计算wh,这边计算新的xy时, orgin的差异计算,需要排除 */
        {
          x: (groupLayer.w - ow + childLayer.w) / 2 - childLayer.tr.x,
          y: (groupLayer.h - oh + childLayer.h) / 2 - childLayer.tr.y,
        },
        {
          x: childLayer.w / 2,
          y: childLayer.h / 2,
        },
        tr.getMatrix4_4(),
      );
      return {
        ...childLayer,
        w: ow,
        h: oh,
        tr: {
          ...childLayer.tr,
          x,
          y,
          s: (childLayer.tr.s || 1) * (groupLayer.tr.s || 1),
          r: (childLayer.tr.r || 0) + (groupLayer.tr.r || 0),
        },
        flip: {
          h: ((groupLayer.flip?.h ? 1 : 0) ^ (childLayer.flip?.h ? 1 : 0)) === 1 ? true : false,
          v: ((groupLayer.flip?.v ? 1 : 0) ^ (childLayer.flip?.v ? 1 : 0)) === 1 ? true : false,
        },
      };
    };
    // 下标集合
    const zIndexList = [] as number[];
    // 拆分后的子图层集合
    const childLayersList = [] as Layer[][];
    const selectIds = [] as string[];
    const newLayers = panelData.layers.map((layer, index) => {
      if (ids.includes(layer.id)) {
        if (layer.ty === LayerType.GROUP) {
          zIndexList.push(index);
          childLayersList.push(
            layer.childrens.map((childLayer) => {
              selectIds.push(childLayer.id);
              return dealChildLayer(layer, childLayer);
            }),
          );
        } else {
          selectIds.push(layer.id);
        }
      }
      return layer;
    });
    for (let i = zIndexList.length - 1; i >= 0; i--) {
      const index = zIndexList[i];
      newLayers.splice(index, 1, ...childLayersList[i]);
    }
    replaceLayer('layers', newLayers.flat()).then(() => {
      setSelectLayers(selectIds);
    });
  };
  if (!(canGroup || canSplitGroup)) {
    return null;
  }
  return (
    <PanelLine>
      {canGroup ? (
        <div className={classnames(style['panel-action-btn'])} onClick={toGroup}>
          成组
        </div>
      ) : null}
      {canSplitGroup ? (
        <div className={classnames(style['panel-action-btn'])} onClick={toSplitGroup}>
          拆分组
        </div>
      ) : null}
    </PanelLine>
  );
};

export default GroupPanel;
