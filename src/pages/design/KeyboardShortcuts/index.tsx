import Fn, { Listener, getImgMsgByUrl, uploadImg } from '@/utils/utils';
import { v4 as uuid } from 'uuid';
import { COPYOFFSETSTEP, EditTypeEnum, LayerType, pasteEvent } from '@/common/config';
import { EditData, EditFn, SourceData } from '../context';
import manageFactory from '@/utils/manageFactory';
import keyBoardEventRecord from './KeyBoardEventRecord';
import { Layer, Panel } from '../interface';
import copy from 'copy-to-clipboard';
const KeyboardShortcuts = () => {
  const ref = useRef(new Listener(window));
  const copyRef = useRef({
    // 存图层id
    copyList: [] as string[],
    // 连续复制-信息记录
    copy: {
      type: '',
      step: 0,
      lastTime: 0,
      cache: new Map<string, Layer>(),
    },
    panelCopy: {
      // copy的画板的下标
      index: 0,
      cache: new Map<string, Panel>(),
    },
  });
  const cacheRef = useRef({
    changeOpacityCache: {
      timer: null as NodeJS.Timeout | null,
      preValue: '',
    },
  });
  const sourceData = useContext(SourceData);
  const { zoom, editParam, selectLayers, panelIndex, isChoosePanel, showPanelList, setSelectLayers, setPanelIndex } =
    useContext(EditData);
  const panelData = useMemo(() => sourceData.panels[panelIndex], [sourceData, panelIndex]);
  const panelLen = useMemo(() => sourceData.panels.length, [sourceData]);

  const {
    canRedo,
    canUndo,
    redo,
    undo,
    addLayers,
    addTextLayer,
    addImageLayers,
    duplicateLayers,
    updateLayer,
    changeLayerZindex,
    lockOrUnLockLayer,
    deletePanelByIndex,
    duplicatePanelByIndex,
    addNewPanelByData,
  } = useContext(EditFn);
  const { deleteLayer } = useContext(EditFn);
  const layers = useMemo(() => panelData.layers, [panelData]);
  const selectLength = useMemo(() => selectLayers.length, [selectLayers]);
  // const isMore = useMemo(() => selectLength > 1, [selectLength]);
  enum CopyType {
    // 设计区域外-复制的文字
    PLAIN = 'plain',
    // 设计区域外-复制的图片
    IMAGE = 'image',
    // 设计区域内 - 复制的图层 (文字 / 图片等都是图层)
    WMCOPY = 'wm-copy',
    // 设计区域内 - 剪切的图层
    WMCUT = 'wm-cut',
  }
  /* 
    复制 - 图层位置偏移管理
    1. copy - 需要直接执行偏移
    2. cut / 外部复制的内容 - 连续的第一次,不执行偏移
  */
  const copyStepManage = useCallback((type: CopyType) => {
    if (!copyRef.current.copy.type) {
      copyRef.current.copy.step = type == CopyType.WMCOPY ? 1 : 0;
      copyRef.current.copy.type = type;
    } else {
      if (copyRef.current.copy.type == type) {
        copyRef.current.copy.step++;
      } else {
        copyRef.current.copy.step = type == CopyType.WMCOPY ? 1 : 0;
        copyRef.current.copy.type = type;
      }
    }
  }, []);
  const copyOrCutFn = useCallback(
    (type: 'copy' | 'cut') => {
      /* 
        props字段,用于区分layer/panel
      */
      if (isChoosePanel && showPanelList) {
        /* 画板不支持剪切 */
        if (type === 'cut') return;
        copyRef.current.panelCopy.cache.clear();
        // 缓存下来, 避免先ctrl+c画板被删除了
        if (panelData) {
          copyRef.current.panelCopy.index = panelIndex;
          copyRef.current.panelCopy.cache.set(panelData.id, panelData);
        }
        const copyData = JSON.stringify({ type, ids: [panelData.id], classify: 'panel' });
        copy(copyData, { format: 'data/wm' });
        pasteEvent.clipboardData?.setData('data/wm', copyData);
        return;
      }
      copyRef.current.copy.cache.clear();
      copyRef.current.copy.step = 0;
      // 过滤锁定图层
      const copyIds = selectLayers.filter((id) => {
        return !manageFactory.isLockedById(id);
      });
      if (copyIds.length > 0) {
        // 缓存下来, 避免先ctrl+c/ctrl+x,然后copy/cut的图层被删了
        copyIds.forEach((id) => {
          const layer = manageFactory.getLayerDataById(id);
          if (layer) {
            copyRef.current.copy.cache.set(id, layer);
          }
        });
        /* 
          copy插件,修改原粘贴板的数据,让粘贴功能正常
          pasteEvent.clipboardData执行目的,缓存模拟复制数据,以便粘贴时使用(右键菜单等非常规paste事件)
        */
        const copyData = JSON.stringify({ type, ids: selectLayers, classify: 'layer' });
        copy(copyData, { format: 'data/wm' });
        pasteEvent.clipboardData?.setData('data/wm', copyData);
        type === 'cut' && deleteLayer(copyIds);
      }
    },
    [selectLayers, deleteLayer],
  );
  const changeOpacity = useCallback(
    (val: number) => {
      selectLayers.forEach((id) => {
        updateLayer(
          id,
          {
            tr: {
              o: Number((val / 100).toFixed(2)),
            },
          },
          true,
        );
      });
    },
    [selectLayers, updateLayer],
  );
  useEffect(() => {
    /* 全选 */
    keyBoardEventRecord.register(
      'selectAll',
      (e) => ['a', 'A'].includes(e.key) && e.ctrlKey,
      () => {
        setSelectLayers(
          layers
            .filter((layer) => !layer.isLocked)
            .map((layer) => {
              return layer.id;
            }),
        );
      },
    );
    /* Tab选择 */
    keyBoardEventRecord.register(
      'selectNextOrPreByTab',
      (e) => 'Tab' === e.key,
      (e) => {
        if (selectLength === 1) {
          let index = null;
          const maxLen = layers.length - 1;
          layers.some((layer, i) => {
            if (selectLayers.includes(layer.id)) {
              index = i;
              return true;
            }
            return false;
          });
          if (index !== null) {
            if (e?.shiftKey) {
              // pre
              index--;
              if (index < 0) index = maxLen;
            } else {
              // next
              index++;
              if (index > maxLen) index = 0;
            }
            setSelectLayers([layers[index].id]);
          }
        }
      },
    );
    /* 删除 */
    keyBoardEventRecord.register(
      'delete',
      (e) => ['Backspace', 'Delete'].includes(e.key),
      (e) => {
        // 避免和文字编辑时的删除键冲突
        if (editParam.type != EditTypeEnum.TEXTEDIT) {
          e?.preventDefault();
          /* 选中画板, 并展开画板列表时, 执行删除画板逻辑 */
          if (isChoosePanel && showPanelList) {
            deletePanelByIndex(panelIndex);
          } else {
            if (selectLength > 0) {
              deleteLayer(selectLayers);
            }
          }
        }
      },
    );
    /* 创建副本 */
    keyBoardEventRecord.register(
      'duplicate',
      (e) => e.ctrlKey && ['d', 'D'].includes(e.key),
      () => {
        /* 选中画板, 并展开画板列表时, 执行创建画板逻辑 */
        if (isChoosePanel && showPanelList) {
          duplicatePanelByIndex(panelIndex);
        } else {
          duplicateLayers(selectLayers);
        }
      },
    );
    /* 新增文字图层 */
    keyBoardEventRecord.register(
      'addText',
      (e) => ['t', 'T'].includes(e.key),
      () => {
        addTextLayer();
      },
    );
    /* 撤销 */
    keyBoardEventRecord.register(
      'undo',
      (e) => e.ctrlKey && ['z', 'Z'].includes(e.key),
      (e) => {
        if (e?.shiftKey) {
          canRedo && redo();
        } else {
          canUndo && undo();
        }
      },
    );
    /* 重做 */
    keyBoardEventRecord.register(
      'redo',
      (e) => e.ctrlKey && ['y', 'Y'].includes(e.key),
      () => canRedo && redo(),
    );
    /* 快速修改透明度 */
    keyBoardEventRecord.register(
      'changeOpacity',
      (e) => {
        return selectLength > 0 && ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(e.key);
      },
      (e) => {
        cacheRef.current.changeOpacityCache.preValue += e?.key;
        if (cacheRef.current.changeOpacityCache.timer) {
          clearTimeout(cacheRef.current.changeOpacityCache.timer);
        }
        cacheRef.current.changeOpacityCache.timer = setTimeout(() => {
          const opacityVal = cacheRef.current.changeOpacityCache.preValue;
          changeOpacity(Math.min(100, opacityVal === '0' ? 100 : Number(opacityVal.padEnd(2, '0'))));
          cacheRef.current.changeOpacityCache.timer = null;
          cacheRef.current.changeOpacityCache.preValue = '';
        }, 200);
      },
    );
    /* 方向位移 */
    keyBoardEventRecord.register(
      'ArrowLeft',
      (e) => 'ArrowLeft' == e.key,
      (e) => {
        if (isChoosePanel && showPanelList) {
          // 切换选择画板
          setPanelIndex(panelIndex - 1 < 0 ? panelLen - 1 : panelIndex - 1);
        } else {
          let x = 1;
          if (e?.shiftKey) {
            x = 10;
          }
          move(-x, 0);
        }
      },
    );
    keyBoardEventRecord.register(
      'ArrowRight',
      (e) => 'ArrowRight' == e.key,
      (e) => {
        if (isChoosePanel && showPanelList) {
          // 切换选择画板
          setPanelIndex(panelIndex + 1 > panelLen - 1 ? 0 : panelIndex + 1);
        } else {
          let x = 1;
          if (e?.shiftKey) {
            x = 10;
          }
          move(x, 0);
        }
      },
    );
    keyBoardEventRecord.register(
      'ArrowUp',
      (e) => 'ArrowUp' == e.key,
      (e) => {
        if (e?.ctrlKey) {
          // 图层顺序 ctrl+shift+up/down
          changeLayerZindex(e?.shiftKey ? 'top' : 'up');
        } else {
          if (isChoosePanel && showPanelList) {
            // 切换选择画板
            setPanelIndex(panelIndex - 1 < 0 ? panelLen - 1 : panelIndex - 1);
          } else {
            // 位移
            let y = 1;
            if (e?.shiftKey) {
              y = 10;
            }
            move(0, -y);
          }
        }
      },
    );
    keyBoardEventRecord.register(
      'ArrowDown',
      (e) => 'ArrowDown' == e.key,
      (e) => {
        if (e?.ctrlKey) {
          // 图层顺序 ctrl+shift+up/down
          changeLayerZindex(e?.shiftKey ? 'bottom' : 'down');
        } else {
          if (isChoosePanel && showPanelList) {
            // 切换选择画板
            setPanelIndex(panelIndex + 1 > panelLen - 1 ? 0 : panelIndex + 1);
          } else {
            // 位移 - 图层
            let y = 1;
            if (e?.shiftKey) {
              y = 10;
            }
            move(0, y);
          }
        }
      },
    );
    /* 锁定/解锁 */
    keyBoardEventRecord.register(
      'lockOrUn',
      (e) => e.ctrlKey && ['l', 'L'].includes(e.key),
      () => {
        lockOrUnLockLayer(selectLayers, !manageFactory.isLockedByIds(selectLayers));
      },
    );
    ref.current.on('keydown', (e) => {
      keyBoardEventRecord.getVerifys().forEach(([key, verify]) => {
        if (verify(e)) {
          e?.preventDefault();
          keyBoardEventRecord.getRunFn(key)(e);
        }
      });
    });
    // 复制
    ref.current.on('copy', (e) => {
      e.preventDefault();
      copyOrCutFn('copy');
    });
    // 剪切 - 删除的逻辑后面补
    ref.current.on('cut', (e) => {
      e.preventDefault();
      copyOrCutFn('cut');
    });
    /* 
      粘贴
      1. 文字
      2. 图片 - 先使用 file 生成 url使用 (后续 - 改成先上传服务器)
      3. 项目中的图层
      优先级 1 >= 2 > 3
      text/plain:  可以获取到操作系统中的复制/剪切内容
      data/wm: 是项目模拟的复制和剪切功能数据
    */
    ref.current.on('paste', async (event) => {
      const e = event;
      e.preventDefault();
      if (new Date().getTime() - copyRef.current.copy.lastTime > 1000 * 60) {
        // 1分钟没有执行复制 - 重置step步数
        copyRef.current.copy.step = 0;
      }
      copyRef.current.copy.lastTime = new Date().getTime();
      if (e.clipboardData?.getData('text/plain')) {
        copyStepManage(CopyType.PLAIN);
        const copyText = e.clipboardData?.getData('text/plain');
        if (copyText && Fn.verify.isImageUrl(copyText)) {
          getImgMsgByUrl(copyText).then((img) => {
            addImageLayers([
              {
                ...img,
                offset: {
                  x: (COPYOFFSETSTEP / zoom) * copyRef.current.copy.step,
                  y: (COPYOFFSETSTEP / zoom) * copyRef.current.copy.step,
                },
              },
            ]);
          });
        } else {
          addTextLayer(copyText, {
            x: (COPYOFFSETSTEP / zoom) * copyRef.current.copy.step,
            y: (COPYOFFSETSTEP / zoom) * copyRef.current.copy.step,
          });
        }
      } else if (e.clipboardData?.files && e.clipboardData?.files.length > 0) {
        copyStepManage(CopyType.IMAGE);
        // 只支持png/jpg等图片 - svg暂不支持
        const files = [...e.clipboardData.files].filter((item) => {
          return item.type.indexOf('image') > -1 && item.type !== 'image/svg+xml';
        });
        if (files.length > 0) {
          // 批量处理 - 全选所有图片
          // const imgs = await uploadImgs(files);
          // addImageLayers(imgs);
          // 轮询处理 - 完成后 - 选中最后一个加载的图片
          for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const { url, w, h } = await uploadImg(file);
            addImageLayers([
              {
                url,
                w,
                h,
                offset: {
                  x: (COPYOFFSETSTEP / zoom) * copyRef.current.copy.step,
                  y: (COPYOFFSETSTEP / zoom) * copyRef.current.copy.step,
                },
              },
            ]);
          }
        }
      } else if (e.clipboardData?.getData('data/wm')) {
        try {
          const { type, ids, classify } = JSON.parse(e.clipboardData.getData('data/wm'));
          if (classify === 'layer') {
            const layers: Layer[] = [];
            if (type == 'copy') {
              copyStepManage(CopyType.WMCOPY);
            } else if (type == 'cut') {
              copyStepManage(CopyType.WMCUT);
            }
            ids.forEach((id: string) => {
              if (copyRef.current.copy.cache.has(id) && !manageFactory.isLockedById(id)) {
                layers.push(copyRef.current.copy.cache.get(id) as Layer);
              }
            });
            addLayers(
              layers.map((layer) => {
                const newLayer = {
                  ...layer,
                  id: uuid(),
                  tr: {
                    ...layer?.tr,
                    x: (layer?.tr?.x || 0) + (COPYOFFSETSTEP / zoom) * copyRef.current.copy.step,
                    y: (layer?.tr?.y || 0) + (COPYOFFSETSTEP / zoom) * copyRef.current.copy.step,
                  },
                };
                if (layer.ty === LayerType.GROUP) {
                  return {
                    ...newLayer,
                    childrens: layer?.childrens.map((children) => {
                      return {
                        ...children,
                        id: uuid(),
                      };
                    }),
                  };
                }
                return newLayer;
              }) as Layer[],
            );
          }
          if (classify === 'panel') {
            const panelData = copyRef.current.panelCopy.cache.get(ids[0]);
            if (panelData) {
              addNewPanelByData(panelData);
            }
          }
        } catch (error) {
          console.log(error);
        }
      }
    });
    return () => {
      ref.current.off('keydown');
      ref.current.off('paste');
      ref.current.off('copy');
      ref.current.off('cut');
    };
  }, [editParam, selectLayers, setSelectLayers, changeOpacity, changeLayerZindex, canUndo, canRedo, zoom, undo, redo]);
  // 箭头方向移动能力
  function move(x: number, y: number) {
    manageFactory.getLayerDatasByIds(selectLayers).forEach((layerData) => {
      if (layerData) {
        updateLayer(layerData.id, {
          tr: {
            x: layerData.tr.x + x,
            y: layerData.tr.y + y,
          },
        });
      }
    });
  }
  return <></>;
};

export default KeyboardShortcuts;
