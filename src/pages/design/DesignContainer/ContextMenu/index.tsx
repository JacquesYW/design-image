import style from './index.module.less';
import { EditData, EditFn, SourceData } from '../../context';
import { Dropdown, MenuProps } from 'antd';
import {
  Paste,
  Copy,
  Cut,
  PositionHorizontalCenter,
  PositionVerticalCenter,
  Overlap,
  ChangeToImg,
  BackgroundFill,
} from '@/pages/components/svgIcon/contextMenuIcons';
import { DeleteOutlined, Duplicate, Focus, LayerPosition, Lock, Unlock } from '@/pages/components/svgIcon';
import manageFactory from '@/utils/manageFactory';
import { RootID } from '../../../../main';
import SequenceIcon from '@/pages/components/svgIcon/SequenceIcon';
import PositionIcon from '@/pages/components/svgIcon/PositionIcon';
import { BackgroundType, DESIGNCANVASCONTENT, IconByTy, LayerType, nameByTr, pasteEvent } from '@/common/config';
import { AlignPosition, getPositionXY, isHit, isOverlapByIds } from '@/pages/components/editer/SelectToAndMoveableTool';
import { ImageLayer, Layer } from '../../interface';
import { getOverIds } from '../../RightBar/MaterialEditPanel/ToolPanel/setting/SequenceSetting';
import Delta from 'quill-delta';
import Fn from '@/utils/utils';

interface ContextMenuProps {
  clientXY: { x: number; y: number };
  open: boolean;
  setContextMenu: (param: { open: boolean; clientXY: { x: number; y: number } }) => void;
}

type ActionData = {
  // 操作模块的key,和点击事件集合的key一致
  key: string;
  // 操作的文案名称
  name: string | (() => React.ReactNode);
  // 个别操作有快捷键, 快捷键提示文案
  shortCutKey?: string;
  icon?: React.ReactNode;
  // 判断菜单操作是否展示
  active?: (arg: ActiveParams) => boolean;
  // 判断菜单操作是否disabled (active判断是false,disabled就不会执行了)
  disabled?: (arg: ActiveParams) => boolean;
  // 特殊事件操作 (如: 重叠图层列表,需要和画布图层的hover事件联动)
  exterEventFns?: Record<string, (arg: { key: string }) => void>;
  children?: ActionData[];
};
// active判断条件的入参, 这边事件整合统一, 入参就包含了所有需要判断条件
type ActiveParams = {
  isInCanvas: boolean;
  isSelected: boolean;
  isSingle: boolean;
  isLocked: boolean;
  isMore: boolean;
  isImgBg: boolean;
  layerType: LayerType | undefined;
  zIndex: {
    index: number;
    min: number;
    max: number;
  };
};
// 将actionData转换成 menuDown的menu.items数据类型
const renderAction = ({
  actionData,
  activeVerify,
  disabledVerify,
}: {
  actionData: ActionData[];
  activeVerify: (callFn: (arg: ActiveParams) => boolean) => boolean;
  disabledVerify: (callFn: (arg: ActiveParams) => boolean) => boolean;
}): MenuProps['items'] => {
  return actionData
    .filter((item) => {
      if (item.active) {
        return activeVerify(item.active);
      }
      return true;
    })
    .map((item) => {
      const res = {
        label:
          typeof item.name == 'function' ? (
            item.name()
          ) : (
            <div className={style['menu-button']}>
              <div className={style.content}>{item.name}</div>
              {item.shortCutKey ? <div className={style.hint}>{item.shortCutKey}</div> : null}
            </div>
          ),
        icon: item.icon,
        key: item.key,
        disabled: item.disabled ? disabledVerify(item.disabled) : false,
        ...(item.exterEventFns || {}),
      };
      if (item.children) {
        return {
          ...res,
          popupClassName: style['drop-down-menu-root'],
          children: item.children ? renderAction({ actionData: item.children, activeVerify, disabledVerify }) : [],
        };
      }
      return res;
    });
};
// 重叠图层数据key
const OVERLAPKEY = 'overlap';
// 上下箭头的Unicode
const upArrow = '\u2191',
  downArrow = '\u2193';
const bgActionData: ActionData[] = [
  {
    key: 'changetoimg',
    name: '分离背景图片',
    icon: <ChangeToImg size={20} />,
    active: ({ isSelected, isInCanvas, isImgBg }) => {
      return !isSelected && isInCanvas && isImgBg;
    },
  },
  {
    key: 'backgroundfill',
    name: '设为背景',
    icon: <BackgroundFill size={20} />,
    active: ({ isSingle, layerType }) => {
      return isSingle && layerType == LayerType.IMAGE;
    },
  },
];
// 复制粘贴模块的菜单数据
const copyPasteActionData: ActionData[] = [
  {
    key: 'copy',
    name: '复制',
    shortCutKey: 'Ctrl + C',
    icon: <Copy size={20} />,
    active: ({ isSelected }) => {
      return isSelected;
    },
    disabled: ({ isLocked }) => {
      return isLocked;
    },
  },
  {
    key: 'cut',
    name: '剪切',
    shortCutKey: 'Ctrl + X',
    icon: <Cut size={20} />,
    active: ({ isSelected }) => {
      return isSelected;
    },
    disabled: ({ isLocked }) => {
      return isLocked;
    },
  },
  {
    key: 'paste',
    name: '粘贴',
    shortCutKey: 'Ctrl + V',
    icon: <Paste size={20} />,
    disabled: ({ isLocked }) => {
      return isLocked;
    },
  },
  {
    key: 'duplicate',
    name: '创建副本',
    shortCutKey: 'Ctrl + D',
    icon: <Duplicate size={20} />,
    active: ({ isSelected }) => {
      return isSelected;
    },
    disabled: ({ isLocked }) => {
      return isLocked;
    },
  },
];
// 图层操作模块的菜单数据
const initLayerActionData: ActionData[] = [
  {
    key: 'sequence',
    name: '图层顺序',
    icon: <SequenceIcon action="up" size={20} />,
    active: ({ isSelected, isMore }) => {
      return isSelected || isMore;
    },
    disabled: ({ isLocked }) => {
      return isLocked;
    },
    children: [
      {
        key: 'seqTop',
        name: '移到顶层',
        shortCutKey: `Ctrl + Shift + ${upArrow}`,
        disabled: ({ zIndex }) => {
          const { index, max } = zIndex;
          return index >= max;
        },
      },
      {
        key: 'seqUp',
        name: '上移一层',
        shortCutKey: `Ctrl + ${upArrow}`,
        disabled: ({ zIndex }) => {
          const { index, max } = zIndex;
          return index >= max;
        },
      },
      {
        key: 'seqDown',
        name: '下移一层',
        shortCutKey: `Ctrl + ${downArrow}`,
        disabled: ({ zIndex }) => {
          const { index, min } = zIndex;
          return index <= min;
        },
      },
      {
        key: 'seqBottom',
        name: '移到底层',
        shortCutKey: `Ctrl + Shift + ${downArrow}`,
        disabled: ({ zIndex }) => {
          const { index, min } = zIndex;
          return index <= min;
        },
      },
    ],
  },
  {
    key: 'position',
    name: '图层位置',
    icon: <LayerPosition size={20} />,
    active: ({ isSelected, isMore }) => {
      return isSelected || isMore;
    },
    disabled: ({ isLocked }) => {
      return isLocked;
    },
    children: [
      { key: 'posHorCenter', name: '水平居中', icon: <PositionHorizontalCenter size={20} /> },
      { key: 'positionVerticalCenter', name: '垂直居中', icon: <PositionVerticalCenter size={20} /> },
      { key: 'posTop', name: '贴顶部', icon: <PositionIcon direction="top" size={20} /> },
      { key: 'posBottom', name: '贴底部', icon: <PositionIcon direction="bottom" size={20} /> },
      { key: 'posCenter', name: '画布中心', icon: <Focus size={20} /> },
      { key: 'posRight', name: '贴右侧', icon: <PositionIcon direction="right" size={20} /> },
      { key: 'posLeft', name: '贴左侧', icon: <PositionIcon direction="left" size={20} /> },
    ],
  },
  {
    key: 'lock',
    name: '锁定',
    icon: <Lock size={20} />,
    active: ({ isSingle, isLocked }) => {
      return isSingle && !isLocked;
    },
  },
  {
    key: 'unlock',
    name: '解锁',
    icon: <Unlock size={20} />,
    active: ({ isSingle, isLocked }) => {
      return isSingle && isLocked;
    },
  },
];
// 删除操作模块的菜单数据
const deleteActionData: ActionData[] = [
  {
    key: 'delete',
    name: '删除',
    shortCutKey: 'DEL',
    icon: <DeleteOutlined size={20} />,
    active: ({ isSelected }) => {
      return isSelected;
    },
    disabled: ({ isLocked }) => {
      return isLocked;
    },
  },
  {
    key: 'deleteBg',
    name: '删除背景图片',
    icon: <DeleteOutlined size={20} />,
    active: ({ isSelected, isInCanvas, isImgBg }) => {
      return !isSelected && isInCanvas && isImgBg;
    },
  },
];
const useItems = (
  { ids, allIds, overIds }: { ids: string[]; allIds: string[]; overIds: string[] },
  verify: PickByValue<Parameters<typeof renderAction>[number], 'activeVerify'>,
) => {
  // 重叠图层渲染 - 文字需要特殊处理
  const getName = useCallback((layer: Layer) => {
    switch (layer.ty) {
      case LayerType.TEXT: {
        let textName = '';
        if (typeof layer.p == 'string') {
          textName = layer.p;
        } else {
          new Delta(layer.p).forEach((op) => {
            textName += op.insert;
          });
        }
        return textName;
      }
      default:
        return nameByTr[layer.ty];
    }
  }, []);
  // 重叠图层渲染 - 各图层icon需要特殊处理
  const getIcon = useCallback((layer: Layer) => {
    let icon = IconByTy['default'];
    switch (layer.ty) {
      case LayerType.TEXT:
      case LayerType.GROUP:
      case LayerType.QRCODE:
        icon = IconByTy[layer.ty];
        break;
      case LayerType.IMAGE:
        icon = () => <img src={layer.p} alt="" />;
        break;
    }
    return <div className={style['layer-item-Icon']}>{icon(16)}</div>;
  }, []);
  const layerActionData = useMemo(() => {
    const layerAction = [...initLayerActionData];
    // 单选才展示 重叠图层
    if (ids.length == 1) {
      /* 获取重叠图层id,含自身 */
      const overIds = isOverlapByIds(allIds, ids[0]);
      if (overIds.length > 0) {
        layerAction.splice(2, 0, {
          key: OVERLAPKEY,
          name: '选择重叠图层',
          icon: <Overlap size={20} />,
          children: overIds.map((id) => {
            const layer = manageFactory.getLayerDataById(id) as Layer;
            return {
              key: id,
              name: getName(layer),
              icon: getIcon(layer),
              exterEventFns: {
                onMouseEnter: ({ key }: { key: string }) => {
                  const isSelected = ids.includes(key);
                  if (!isSelected) {
                    manageFactory.toggleHoverById(key);
                  }
                },
                onMouseLeave: () => {
                  manageFactory.clearAllHover();
                },
              },
            };
          }),
        });
      }
    }
    return layerAction;
  }, [ids, overIds]);
  const actionList = new Set<MenuProps['items']>();
  /* 背景菜单操作集合 */
  actionList.add(renderAction({ actionData: bgActionData, activeVerify: verify, disabledVerify: verify }));
  /* 复制/粘贴/剪切集合 */
  actionList.add(renderAction({ actionData: copyPasteActionData, activeVerify: verify, disabledVerify: verify }));
  /* 图层顺序和位置操作集合 */
  actionList.add(renderAction({ actionData: layerActionData, activeVerify: verify, disabledVerify: verify }));
  /* 删除操作集合 */
  actionList.add(renderAction({ actionData: deleteActionData, activeVerify: verify, disabledVerify: verify }));
  const items = useMemo(() => {
    return Fn.common
      .arrayJoin(
        [...actionList].filter((ary) => ary?.length && ary?.length > 0),
        { type: 'divider' },
      )
      .flat();
  }, [actionList]);
  return items;
};
const useSelect = (ids: string[]) => {
  return useMemo(() => {
    const isSingle = ids.length == 1,
      isMore = ids.length > 1;
    return {
      isSingle,
      isMore,
      isSelected: isMore || isSingle,
    };
  }, [ids]);
};
const ContextMenu = (props: ContextMenuProps) => {
  const sourceData = useContext(SourceData);
  const { zoom, selectLayers, panelIndex, selectLayersFn } = useContext(EditData);
  const panelData = useMemo(() => sourceData.panels[panelIndex], [sourceData, panelIndex]);

  // 延迟执行selectLayers, 避免菜单在关闭前2次更新
  const ids = useDeferredValue(selectLayers);
  const {
    switchBgType,
    addImageLayers,
    updateBgImg,
    replaceBgImg,
    updateLayer,
    deleteLayer,
    changeLayerZindex,
    duplicateLayers,
    lockOrUnLockLayer,
  } = useContext(EditFn);
  const closeDropdown = () => {
    props.setContextMenu({ open: false, clientXY: { x: 0, y: 0 } });
  };
  useEffect(() => {
    /* 关闭右键菜单事件(点击非画布部分) */
    const rootDom = document.getElementById(RootID) as HTMLElement;
    rootDom.addEventListener('click', closeDropdown, true);
    return () => {
      rootDom.removeEventListener('click', closeDropdown, true);
    };
  }, []);
  // 背景是否有图片
  const isImgBg = useMemo(() => {
    return panelData.bg.type == BackgroundType.IMAGE && !!panelData.bg.img?.p;
  }, [panelData]);
  // 所有图层ids
  const allIds = useMemo(() => (panelData.layers || []).map((layer) => layer.id), [panelData.layers]);
  // 是否点击在画布上
  const isInCanvas = useMemo(() => {
    return isHit(props.clientXY, document.getElementById(DESIGNCANVASCONTENT) as HTMLElement);
  }, [props.clientXY]);
  const { isSelected, isSingle, isMore } = useSelect(ids);
  const isLocked = useMemo(() => isSelected && manageFactory.isLockedByIds(ids), [ids, panelData]);
  const layerType = useMemo(() => {
    if (isSingle) {
      return manageFactory.getLayerTypeById(selectLayers[0]);
    }
  }, [isSingle]);
  const {
    overIds,
    value: indexVal,
    min,
    max,
  } = useMemo(
    () =>
      getOverIds({
        ids,
        layers: panelData.layers,
        isMore,
      }),
    [ids, panelData.layers],
  );
  const verify = useCallback(
    (fn: PickByValue<Required<ActionData>, 'active'>) => {
      return fn({
        isInCanvas,
        isSelected,
        isSingle,
        isMore,
        isLocked,
        isImgBg,
        layerType,
        zIndex: {
          index: indexVal,
          min,
          max,
        },
      });
    },
    [ids, isInCanvas, isLocked, isImgBg, indexVal, min, max],
  );
  const items = useItems({ ids, allIds, overIds }, verify);
  /* 图层位置切换 */
  const changePosition: (direction: keyof AlignPosition) => void = useCallback(
    (direction) => {
      const positon = getPositionXY(ids, { w: panelData.w, h: panelData.h }, zoom);
      if (ids) {
        ids.forEach((id) => {
          updateLayer(
            id,
            {
              tr: {
                ...positon.get(id)?.[direction],
              },
            } as DeepPartial<Layer>,
            true,
            true,
          );
        });
      }
    },
    [ids, zoom, panelData.w, panelData.h, updateLayer],
  );
  const deleteBgImg = useCallback(
    (isEnd = true) => {
      updateBgImg(
        {
          p: '',
          w: 0,
          h: 0,
          imgW: 0,
          imgH: 0,
          tr: {},
        },
        isEnd,
      );
    },
    [updateBgImg],
  );
  /* menuButton点击事件集合 */
  const itemFn: Record<string, <T extends string | undefined>(arg?: T) => void> = useMemo(
    () => ({
      /* 背景图片转图片图层 */
      changetoimg: () => {
        if (panelData.bg.img) {
          // 删除背景图片
          deleteBgImg();
          //新增
          addImageLayers([
            {
              url: panelData.bg.img.p,
              w: panelData.bg.img.w,
              h: panelData.bg.img.h,
            },
          ]);
        }
      },
      /* 图片图层转背景图片 */
      backgroundfill: () => {
        switchBgType(BackgroundType.IMAGE);
        const layer = manageFactory.getLayerDataById(selectLayers[0]) as ImageLayer;
        deleteLayer(selectLayers);
        if (layer) {
          replaceBgImg({
            url: layer.p,
            w: layer.imgW,
            h: layer.imgH,
          });
        }
      },
      /* 
      粘贴,需要获取上一次copy或cut的缓存数据,所以,pasteEvent需要使用统一变量
      复制和裁剪,只是缓存数据,所以执行以下默认监听操作缓存数据即可(会缓存到pasteEvent下)
    */
      paste: () => {
        window.dispatchEvent(pasteEvent);
      },
      copy: () => {
        const copyEvent = new ClipboardEvent('copy', {});
        window.dispatchEvent(copyEvent);
      },
      cut: () => {
        const cutEvent = new ClipboardEvent('cut', {});
        window.dispatchEvent(cutEvent);
      },
      duplicate: () => {
        duplicateLayers(ids);
      },
      /* 图层方向位置 */
      posHorCenter: () => {
        changePosition('horizontalCenter');
      },
      positionVerticalCenter: () => {
        changePosition('verticalCenter');
      },
      posTop: () => {
        changePosition('top');
      },
      posBottom: () => {
        changePosition('bottom');
      },
      posCenter: () => {
        changePosition('center');
      },
      posRight: () => {
        changePosition('right');
      },
      posLeft: () => {
        changePosition('left');
      },
      /* 图层顺序 */
      seqTop: () => {
        changeLayerZindex('top');
      },
      seqUp: () => {
        changeLayerZindex('up');
      },
      seqDown: () => {
        changeLayerZindex('down');
      },
      seqBottom: () => {
        changeLayerZindex('bottom');
      },
      /* 重叠图层选择 */
      [OVERLAPKEY]: (id?: string) => {
        if (id) {
          selectLayersFn(id);
        }
      },
      /* 锁定图层 */
      lock: () => {
        lockOrUnLockLayer(ids, true);
      },
      unlock: () => lockOrUnLockLayer(ids, false),
      /* 删除-图层/背景图 */
      delete: () => {
        deleteLayer(ids);
      },
      deleteBg: () => {
        deleteBgImg();
      },
    }),
    [ids, deleteLayer, duplicateLayers, changePosition, changeLayerZindex, lockOrUnLockLayer, updateBgImg],
  );
  return props.open ? (
    <Dropdown
      key={props.clientXY.x + props.clientXY.y}
      open={props.open}
      overlayClassName={style['drop-down-menu-root']}
      menu={{
        items: items as MenuProps['items'],
        onClick: (item) => {
          if (item.keyPath.includes(OVERLAPKEY)) {
            itemFn[OVERLAPKEY](item.key);
          }
          itemFn[item.key]?.();
          props.setContextMenu({ open: false, clientXY: { x: 0, y: 0 } });
        },
      }}
    >
      <div
        className={style['down-menu-position']}
        style={{
          top: props.clientXY.y,
          left: props.clientXY.x,
        }}
      ></div>
    </Dropdown>
  ) : null;
};

export default ContextMenu;
