import _ from 'lodash';
import { merge, mergeFn, useUndo } from '../../hocks';
import ImageSelect from '../components/imageSelect';
import DesignContainer from './DesignContainer';
import LeftBar from './LeftBar';
import RightBar from './RightBar';
import TopBar from './TopBar';
import { EditData, EditFn, SourceData } from './context';
import style from './index.module.less';
import { v4 as uuid } from 'uuid';
import KeyboardShortcuts from './KeyboardShortcuts';
import { GroupLayer, Layer, MainData, Panel } from '@/pages/design/interface';
import { BackgroundType, COPYOFFSETSTEP, LayerType, QRCodeErrorLevel } from '@/common/config';
import manageFactory from '@/utils/manageFactory';
import Fn, { handleTextLayer } from '@/utils/utils';
import './Animation';
import useAnimation from './Animation/display/useAnimation';
import photos from '@/assets/images/photos';
import { getNewLayers, getOverIds } from './RightBar/MaterialEditPanel/ToolPanel/setting/SequenceSetting';
/* 
  功能点思路记录:
  1. 图层hover, 只到第一层图层
  2. 图层点击, 选中第一层是gourp,并且递归到最深层图层(不做透明穿透)
  3. 右侧panel
    组: 
      1. 成组
      2. 拆分组(flatmap 拆分当前层所有组, 并选中拆分后的子级图层)
      3. 组内移动
    图片:
      0. 替换
      1. 裁剪
      2. 滤镜
      3. 抠图
      4. 美化
      5. 特效
      6. 蒙版
    文字:
      1. 字体
      2. 字号
      3. 加粗 / 倾斜等
      4. 对齐
      5. 展示方向
      6. 行间距 / 字间距
      7. 宽高的固定方式
      8. 排序
      9. 颜色
    二维码:
      1. url
      2. icon
      3. 背景色
      4. 填充色
    矢量图
      1. 颜色 (描边 / 填充)
    公共: 透明度
  ==================
  选择:
    1. 组图层
      1.1 组内图层(包括组)
    2. 单个图层
  ==================
  编辑:
    1. 编辑类型
    2. 是否需要有编辑id (图片裁剪 / 矢量图编辑[暂定])
*/

const EditDataProvider = EditData.Provider;
const EditFnProvider = EditFn.Provider;
const SourceDataProvider = SourceData.Provider;
const Design = () => {
  if (!window.imageCache) {
    window.imageCache = {};
  }
  /* 快照数据(核心数据) */
  const {
    state: mainData,
    canRedo,
    canUndo,
    setState,
    updateState: updateSourceData,
    initState: initSourceData,
    resetState: resetSourceData,
    undo,
    redo,
  } = useUndo(Fn.common.getInitData());
  /* 编辑时的展示数据和信息, 不需要回撤 */
  const [zoom, setZoom] = useState(1);
  // 是否展示画板列表
  const [showPanelList, setShowPanelList] = useState(false);
  // 编辑中的画板下标
  const [panelIndex, setPanelIndex] = useState(0);
  // 是否选中当前画板
  const [isChoosePanel, setIsChoosePanel] = useState(false);
  /* 当前编辑的画板数据 */
  const sourceData = useMemo(() => mainData?.panels?.[panelIndex] || {}, [mainData, panelIndex]);
  /* 更新画板数据函数(直接传值) */
  const setSourceData = useCallback(
    (data: DeepPartial<Panel>, isEnd = true) => {
      return updateSourceData((draft) => {
        return _.mergeWith(draft, { panels: { [panelIndex]: data } }, mergeFn);
      }, isEnd);
    },
    [updateSourceData],
  );
  /* 
    选中的图层集合
  */
  const [selectLayers, setSelectLayers] = useState<string[]>([]);
  /* 
    选中的子图层 (组内子图层,暂定只能选中一个)
  */
  const [selectSubLayer, setSelectSubLayer] = useState<string>('');
  /* 
    子图层的选中和组图层时关联的, 
    所以每次切换selectLayers时, 都要重置selectSubLayer,
    子图层的选中逻辑在函数selectLayersFn中控制,其他地方无感
  */
  const setSelectLayersFn = useCallback(
    (ids: string[]) => {
      setSelectSubLayer('');
      setSelectLayers(ids);
    },
    [setSelectLayers, setSelectSubLayer],
  );
  // 编辑类型
  const [editParam, setEditParam] = useReducer(
    (state: PickByValue<EditData, 'editParam'>, action: Partial<PickByValue<EditData, 'editParam'>>) => {
      return {
        ...state,
        ...action,
      };
    },
    {
      type: '',
      id: '',
    },
  );
  useAnimation();
  // 编辑图层id (便于全局事件协调)
  useEffect(() => {
    initData();
  }, []);
  const initData = useCallback(
    (data?: MainData) => {
      manageFactory.clear();
      setEditParam({
        type: '',
        id: '',
      });
      setSelectLayersFn([]);
      if (data) {
        resetSourceData(data);
      } else {
        initSourceData({
          v: '0.0.1',
          nm: '',
          panels: [
            {
              nm: '',
              id: uuid(),
              w: 1024,
              h: 2048,
              bg: {
                color: { c: { r: 255, g: 255, b: 255, a: 0 }, isLinear: false, linear: null },
                type: BackgroundType.IMAGE,
                img: {
                  p: photos[0],
                  imgW: 3276.8,
                  w: 3276.8,
                  h: 2048,
                  imgH: 2048,
                  tr: {
                    palette: {
                      c: '#fff',
                      o: 0.31,
                    },
                    clip: {
                      s: 1,
                      x: -1126.4,
                      y: 0,
                    },
                  },
                },
              },
              layers: [
                {
                  ty: LayerType.GROUP,
                  id: uuid(),
                  tr: {
                    x: 0,
                    y: 0,
                    o: 1,
                    r: 0,
                  },
                  isLocked: false,
                  w: 408.96 + 353.6675159235669,
                  h: 614.4 + 935.8131401273885,
                  childrens: [
                    {
                      ty: LayerType.IMAGE,
                      nm: '',
                      p: '/src/assets/images/photos/1.jpg',
                      h: 614.4,
                      w: 408.96,
                      imgW: 408.96,
                      imgH: 614.4,
                      isLocked: false,
                      tr: {
                        x: 353.6675159235669,
                        y: 935.8131401273885,
                        o: 1,
                        r: 0,
                      },
                      id: '2344f341-6b6a-491a-9717-ff9b39e56154',
                      anm: [
                        {
                          ty: 'slide-fade-out',
                          t: {
                            duration: 1,
                            loop: false,
                            dir: 'tl',
                          },
                        },
                      ],
                    },
                    {
                      id: uuid(),
                      ty: LayerType.TEXT,
                      nm: '',
                      p: '测试文本1',
                      isLocked: false,
                      w: 300,
                      h: 84,
                      isFixedWH: false,
                      flip: {
                        v: true,
                        h: true,
                      },
                      tr: {
                        x: 0,
                        y: 0,
                        r: 0,
                        o: 0.6,
                        font: {
                          defaultSize: '60px',
                          defaultFamily: 'LiSu',
                          defaultColor: { r: 0, g: 0, b: 0, a: 1 },
                          letterSpacing: 0,
                          lineHeight: 1.4,
                          align: 'center',
                        },
                      },
                    },
                  ],
                },
                {
                  id: uuid(),
                  ty: LayerType.QRCODE,
                  nm: '',
                  p: 'http://www.weimob.com',
                  isLocked: false,
                  bgc: '#fff',
                  fgc: '#000',
                  w: 200,
                  h: 200,
                  errorLevel: QRCodeErrorLevel.L,
                  tr: {
                    x: 400,
                    y: 400,
                    r: 0,
                    o: 1,
                  },
                },
                {
                  id: uuid(),
                  ty: LayerType.TEXT,
                  nm: '',
                  p: '测试文本2',
                  isLocked: false,
                  w: 56,
                  h: 200,
                  isFixedWH: false,
                  tr: {
                    x: 100,
                    y: 100,
                    r: 0,
                    o: 1,
                    font: {
                      defaultSize: '40px',
                      defaultFamily: 'Microsoft YaHei',
                      defaultColor: { r: 0, g: 0, b: 0, a: 1 },
                      writingMode: 'vertical-rl',
                      letterSpacing: 0,
                      lineHeight: 1.4,
                      align: 'center',
                      ishaveFillColor: true,
                      isShowFillColor: true,
                      fillColor: {
                        angle: 90,
                        cs: [
                          {
                            c: {
                              r: 30,
                              g: 150,
                              b: 0,
                              a: 1,
                            },
                            p: 0,
                          },
                          {
                            c: {
                              r: 255,
                              g: 242,
                              b: 0,
                              a: 1,
                            },
                            p: 0.5,
                          },
                          {
                            c: {
                              r: 243,
                              g: 41,
                              b: 53,
                              a: 1,
                            },
                            p: 1,
                          },
                        ],
                      },
                      ishaveStroke: true,
                      isShowStroke: true,
                      strokeColor: {
                        angle: 90,
                        cs: [
                          {
                            c: {
                              r: 34,
                              g: 84,
                              b: 244,
                              a: 1,
                            },
                            p: 0.2539,
                          },
                          {
                            c: {
                              r: 10,
                              g: 207,
                              b: 245,
                              a: 1,
                            },
                            p: 1,
                          },
                        ],
                      },
                      strokeWidth: 5,
                    },
                  },
                },
              ],
            },
          ],
        });
      }
    },
    [resetSourceData, initSourceData],
  );
  const changeTemplate: PickByValue<EditFn, 'changeTemplate'> = useCallback(
    (data) => {
      updateSourceData((draft) => {
        draft.panels[panelIndex] = data;
        return draft;
      });
    },
    [updateSourceData, panelIndex],
  );
  useEffect(() => {
    // 切换选择时,关闭编辑状态
    setEditParam({
      id: '',
      type: '',
    });
    /* 有图层选中时, 取消画板的选中 */
    if (selectLayers.length > 0) {
      setIsChoosePanel(false);
    }
  }, [selectLayers, setEditParam]);
  /* 
    避免,撤销回退操作时, layer数据还未绑定manageFactory,导致一些需要数据的功能无法正常工作
    */
  useEffect(() => {
    /* 每次更新sourceData时, 都验证一次selectLayers是否合法 */
    const allId = (sourceData?.layers || []).map((layer) => layer.id);
    if (selectLayers.some((id) => !allId.includes(id))) {
      setSelectLayersFn(selectLayers.filter((id) => allId.includes(id)));
    }
  }, [sourceData.layers, selectLayers, setSelectLayersFn]);

  const unSelectLayersFn: PickByValue<EditData, 'unSelectLayersFn'> = useCallback(
    (id) => {
      if (selectLayers.includes(id)) {
        setSelectLayersFn(selectLayers.filter((layerId) => layerId != id));
      }
    },
    [setSelectLayersFn, selectLayers],
  );
  /* 图层选中逻辑 */
  const selectLayersFn: PickByValue<EditData, 'selectLayersFn'> = useCallback(
    (id, isMore = false, isChoosePanel = false) => {
      if (id) {
        const groupId = manageFactory.getHighestIdBySubId(id);
        // shift键按下,多选
        if (isMore) {
          if (!selectLayers.includes(groupId)) {
            if (manageFactory.isLockedById(groupId)) {
              setSelectLayers([groupId]);
            } else {
              setSelectLayers([...selectLayers, groupId].filter((layerId) => !manageFactory.isLockedById(layerId)));
            }
          } else {
            setSelectLayers(selectLayers.filter((layerId) => layerId != groupId));
          }
        } else {
          // 避免-编辑text图层时,多次触发点击选中
          if (
            !(selectLayers.length == 1 && selectLayers.includes(groupId)) ||
            !(selectLayers.length == 1 && selectLayers[0] == groupId)
          ) {
            setSelectLayers([groupId]);
          }
        }
        /* 每次选中图层时, 都更新选中的子图层 */
        setSelectSubLayer(id !== groupId && !isMore ? id : '');
      } else {
        /* 延迟清空选中图层, 避免修正数据时,onBlur事件不触发 */
        setTimeout(() => {
          if (selectLayers.length > 0) {
            setSelectLayers([]);
          }
          if (Fn.verify.isNotEmpty(selectSubLayer, '')) {
            setSelectSubLayer('');
          }
        });
      }
      setIsChoosePanel(isChoosePanel);
    },
    [selectLayers, setSelectLayers],
  );
  // 替换图片
  const updateBgImg: PickByValue<EditFn, 'updateBgImg'> = useCallback(
    (img, isEnd = true) => {
      setSourceData(
        {
          bg: {
            img,
          },
        },
        isEnd,
      );
    },
    [setSourceData],
  );
  // 更新设计区域的宽高
  const updateWH: PickByValue<EditFn, 'updateWH'> = useCallback(
    (wh) => {
      setSourceData({
        ...wh,
      });
      if (sourceData.bg.type == BackgroundType.IMAGE) {
        const image = sourceData.bg.img!;
        const ms = Math.max(wh.w / image.imgW, wh.h / image.imgH);
        updateBgImg({
          w: image.imgW * ms,
          h: image.imgH * ms,
          tr: {
            clip: {
              x: -(image.imgW * ms - wh.w) / 2,
              y: -(image.imgH * ms - wh.h) / 2,
            },
          },
        });
      }
    },
    [sourceData, setSourceData, updateBgImg],
  );
  // 切换背景类型 - 图片 / 颜色
  const switchBgType: PickByValue<EditFn, 'switchBgType'> = useCallback(
    (type) => {
      let nextType: BackgroundType =
        sourceData.bg.type == BackgroundType.IMAGE ? BackgroundType.COLOR : BackgroundType.IMAGE;
      if (type) {
        nextType = type;
      }
      setSourceData({
        bg: {
          type: nextType,
        },
      });
      setEditParam({ type: '', id: '' });
    },
    [sourceData, setSourceData, setEditParam],
  );
  /* 
    替换颜色
    isEnd
      颜色变化过于频繁, 该字段用于判断是否是最后一次change, 用于撤销/重做功能是否记录数据的判断
      默认为true    
  */
  const updateBgColor: PickByValue<EditFn, 'updateBgColor'> = useCallback(
    (color, isEnd = true) => {
      setSourceData(
        {
          bg: {
            color: color,
          },
        },
        isEnd,
      );
    },
    [setSourceData],
  );
  const replaceBgImg: PickByValue<EditFn, 'replaceBgImg'> = useCallback(
    (image, isEnd = true) => {
      const ms = Math.max(sourceData.w / image.w, sourceData.h / image.h);
      updateBgImg(
        {
          p: image.url,
          w: image.w * ms,
          h: image.h * ms,
          imgW: image.w,
          imgH: image.h,
          tr: {
            clip: {
              x: -(image.w * ms - sourceData.w) / 2,
              y: -(image.h * ms - sourceData.h) / 2,
            },
          },
        },
        isEnd,
      );
    },
    [sourceData, updateBgImg],
  );
  const setGuide: PickByValue<EditFn, 'setGuide'> = useCallback(
    (data, isEnd = true) => {
      setState(
        {
          guide: {
            isLock: false,
            ...data,
          },
        },
        isEnd,
      );
    },
    [setState],
  );
  /* 更新图层数据 */
  const updateLayer: PickByValue<EditFn, 'updateLayer'> = useCallback(
    (id, data, isEnd = true, isUpdate = false) => {
      // 需要提前更新manageFactory中layerData数据,避免其他地方使用旧数据
      const oldLayer = manageFactory.getLayerDataById(id);
      if (oldLayer) {
        manageFactory.setLayerDataById(id, merge(oldLayer, data));
      }
      return updateSourceData(
        (draft) => _.update(draft, manageFactory.getPathById(id), (old) => _.mergeWith(old, data, mergeFn)),
        isEnd,
      ).then(() => {
        if (isUpdate) {
          window.imageCache.moveable?.updateRect();
        }
      });
    },
    [updateSourceData],
  );
  /* 替换图层数据 */
  const replaceLayer: PickByValue<EditFn, 'replaceLayer'> = useCallback(
    (path, layers, isEnd = true, isUpdate = false) => {
      /* 
        当前函数是panel层级在用, 更新数据时,需要加上 看板 panels[panelIndex]. 前缀
      */
      path = `panels[${panelIndex}].${path}`;
      // 更新了图层顺序,需要同步更新manageFactory中path
      layers.forEach((layer, index) => {
        manageFactory.setPathById(layer.id, `${path}[${index}]`);
      });
      return updateSourceData((draft) => _.set(draft, path, layers), isEnd).then(() => {
        if (isUpdate) {
          window.imageCache.moveable?.updateRect();
        }
      });
    },
    [updateSourceData],
  );
  /* 更新图层动画数据 */
  const updateLayerAnimations: PickByValue<EditFn, 'updateLayerAnimations'> = useCallback(
    (path, data, isEnd = true) => {
      updateSourceData((draft) => {
        const res = _.update(draft, path, (old) => {
          old.anm = data;
          return old;
        });
        return res;
      }, isEnd);
    },
    [updateSourceData],
  );
  /* 新增图层 */
  const addLayers: PickByValue<EditFn, 'addLayers'> = useCallback(
    (layers, isEnd = true, isRunDefault = true) => {
      if (layers.length > 0) {
        const selectIds: string[] = [];
        const newLayers = layers.map((layer) => {
          const id = layer.id || uuid();
          selectIds.push(id);
          // 新增时就注册数据 - 避免图层未渲染时,manageFactory数据存在延迟
          manageFactory.setLayerDataById(id, layer as Layer);
          return {
            ...layer,
            id,
          } as Layer;
        });
        return updateSourceData((draft) => {
          draft.panels[panelIndex].layers = draft.panels[panelIndex].layers.concat(newLayers);
          return draft;
        }, isEnd).then(() => {
          if (isRunDefault) {
            setSelectLayersFn(selectIds);
          }
        });
      }
      return Promise.resolve();
    },
    [updateSourceData, setSelectLayersFn, panelIndex],
  );
  /* 创建副本 */
  const duplicateLayers: PickByValue<EditFn, 'duplicateLayers'> = useCallback(
    (ids, isEnd = true, isRunDefault = true) => {
      const unLockedIds = ids.filter((id) => !manageFactory.isLockedById(id));
      const newLayers: Layer[] = [];
      /* 
        递归更新处理子图层的id
      */
      manageFactory.getLayerDatasByIds(unLockedIds).forEach((layer) => {
        if (layer) {
          const step = isRunDefault ? COPYOFFSETSTEP / zoom : 0;
          const newLayer = {
            ...layer,
            id: uuid(),
            tr: {
              ...layer.tr,
              x: layer.tr.x + step,
              y: layer.tr.y + step,
            },
          } as Layer;
          if (layer.ty === LayerType.GROUP && Reflect.has(layer, 'childrens')) {
            (newLayer as GroupLayer).childrens = Fn.common.deepUpdateLayerId(layer.childrens);
          }
          newLayers.push(newLayer);
        }
      });
      addLayers(newLayers, isEnd, isRunDefault);
    },
    [addLayers],
  );
  /* 新增文字图层 */
  const addTextLayer: PickByValue<EditFn, 'addTextLayer'> = useCallback(
    (text, offset) => {
      const textLayer = handleTextLayer(sourceData.w, sourceData.h, text, offset);
      return addLayers([textLayer]);
    },
    [sourceData, addLayers],
  );
  /* 新增图片图层(支持多个) */
  const addImageLayers: PickByValue<EditFn, 'addImageLayers'> = useCallback(
    (imgs) => {
      const imgLayers = imgs.map(({ url, w, h, offset }) => {
        const { w: sw, h: sh } = sourceData;
        // 图片自适应当前背景宽高,做居中处理
        const { minw: rw, minh: rh } = Fn.calc.whScaleByRatio(w, h, sw, sh, {
          ratio: 0.6,
          isFull: true,
        });
        return {
          ty: LayerType.IMAGE,
          nm: '',
          p: url,
          w: rw,
          h: rh,
          imgW: rw,
          imgH: rh,
          tr: {
            x: (sourceData.w - rw) / 2 + (offset?.x || 0),
            y: (sourceData.h - rh) / 2 + (offset?.y || 0),
            o: 1,
          },
        };
      });
      return addLayers(imgLayers as Layer[]);
    },
    [sourceData, addLayers],
  );
  const addQRCodeLayer: PickByValue<EditFn, 'addQRCodeLayer'> = useCallback(
    (text, offset) => {
      const wh = Math.min(sourceData.w, sourceData.h) * 0.25;
      return addLayers([
        {
          ty: LayerType.QRCODE,
          nm: '',
          /* 默认微盟官网地址二维码 */
          p: text || 'https://www.weimob.com',
          w: wh,
          h: wh,
          /* 默认白色背景,黑色填充 */
          fgc: '#000',
          bgc: '#fff',
          errorLevel: QRCodeErrorLevel.L,
          tr: {
            x: (sourceData.w - wh) / 2 + (offset?.x || 0),
            y: (sourceData.h - wh) / 2 + (offset?.y || 0),
            o: 1,
          },
        },
      ]);
    },
    [sourceData, addLayers],
  );
  /* 删除图层 - 通过id */
  const deleteLayer: PickByValue<EditFn, 'deleteLayer'> = useCallback(
    (ids, isEnd = true) => {
      manageFactory.clearAllHover();
      const unLockedIds = ids.filter((id) => !manageFactory.isLockedById(id));
      return updateSourceData((draft) => {
        draft.panels[panelIndex].layers = draft.panels[panelIndex].layers.filter(
          (layer: Layer) => !unLockedIds.includes(layer.id),
        );
        return draft;
      }, isEnd).then(() => {
        setSelectLayersFn(_.difference(selectLayers, unLockedIds));
      });
    },
    [updateSourceData, setSelectLayersFn, panelIndex],
  );
  /* 图层顺序切换 */
  const changeLayerZindex: PickByValue<EditFn, 'changeLayerZindex'> = useCallback(
    (type, ids) => {
      const changeIds = ids || selectLayers;
      const isMore = changeIds.length > 1;
      const layers = sourceData.layers;
      const { overIds, value, min, max } = getOverIds({
        ids: changeIds,
        layers: layers,
        isMore: ['top', 'bottom'].includes(type) || isMore,
      });
      let index = value;
      switch (type) {
        case 'top':
          index = max;
          break;
        case 'up':
          index = Math.min(max, value + 1);
          break;
        case 'down':
          index = Math.max(min, value - 1);
          break;
        case 'bottom':
          index = min;
          break;
        default:
          break;
      }
      const newLayers = getNewLayers({
        overIds,
        ids: changeIds,
        layers: layers,
        isMore,
        preIndex: value,
        index,
      });
      replaceLayer('layers', newLayers);
    },
    [selectLayers, sourceData, replaceLayer],
  );
  /* 图层锁定/解锁 */
  const lockOrUnLockLayer: PickByValue<EditFn, 'lockOrUnLockLayer'> = useCallback(
    (ids, isLocked, isEnd = true) => {
      [].concat(ids as never[]).forEach((id) => {
        updateLayer(id, { isLocked }, isEnd);
      });
    },
    [updateLayer],
  );
  /* 画板 */
  /* 在对应下标(index)后面新增画板 */
  const addNewPanelByIndex: PickByValue<EditFn, 'addNewPanelByIndex'> = useCallback(
    (index) => {
      // 获取当前正在编辑的画板
      const newIndex = index + 1;
      const { w, h } = sourceData;
      const newPanel = Fn.common.getPanelInitData(w, h);
      return updateSourceData((draft) => {
        if (newIndex <= draft.panels.length - 1) {
          draft.panels.splice(newIndex, 0, newPanel);
        } else {
          draft.panels.push(newPanel);
        }
        return draft;
      }, true).then(() => {
        setPanelIndex(newIndex);
        setIsChoosePanel(true);
      });
    },
    [mainData, panelIndex, setPanelIndex],
  );
  const addNewPanelByData: PickByValue<EditFn, 'addNewPanelByData'> = useCallback(
    (panel) => {
      const newIndex = panelIndex + 1;
      const newPanel = {
        ...panel,
        id: uuid(),
      };
      newPanel.layers = Fn.common.deepUpdateLayerId(panel.layers);
      // 获取当前正在编辑的画板
      return updateSourceData((draft) => {
        if (newIndex <= draft.panels.length - 1) {
          draft.panels.splice(newIndex, 0, newPanel);
        } else {
          draft.panels.push(newPanel);
        }
        return draft;
      }, true).then(() => {
        setPanelIndex(newIndex);
        setIsChoosePanel(true);
      });
    },
    [mainData, panelIndex, setPanelIndex],
  );
  /* 复制对应下标(index)画板,并在后面新增画板 */
  const duplicatePanelByIndex: PickByValue<EditFn, 'duplicatePanelByIndex'> = useCallback(
    (index) => {
      return updateSourceData((draft) => {
        const panel = draft.panels[index];
        const newPanel = {
          ...panel,
          id: uuid(),
        };
        newPanel.layers = Fn.common.deepUpdateLayerId(panel.layers);
        draft.panels.splice(index + 1, 0, newPanel);
        return draft;
      }, true).then(() => {
        setPanelIndex(index + 1);
        setIsChoosePanel(true);
      });
    },
    [mainData, panelIndex, setPanelIndex],
  );
  /* 删除对应下标(index)的画板 */
  const deletePanelByIndex: PickByValue<EditFn, 'deletePanelByIndex'> = useCallback(
    (index) => {
      /* 需要先计算选中的画板下标, 避免删除后, 选中的画板下标超出范围 */
      setPanelIndex(Math.max(Math.min(index, mainData.panels.length - 2), 0));
      /* 删除画板的数据更新会比下标更新慢(updateSourceData函数会延迟20ms更新[合并同一时间的操作,一起更新数据]) */
      return updateSourceData((draft) => {
        draft.panels.splice(index, 1);
        if (draft.panels.length === 0) {
          draft.panels.push(Fn.common.getPanelInitData(sourceData.w, sourceData.h));
        }
        return draft;
      }, true).then(() => {
        setIsChoosePanel(true);
      });
    },
    [mainData, panelIndex, setPanelIndex],
  );
  /* 更新画板基础信息, 不含图层数据 */
  const updatePanel: PickByValue<EditFn, 'updatePanel'> = useCallback(
    (index, data, isEnd = true) => {
      return updateSourceData(
        (draft) => _.update(draft, `panels[${index}]`, (old) => _.mergeWith(old, data, mergeFn)),
        isEnd,
      );
    },
    [updateSourceData],
  );
  /* 替换画板数据 - 主要用于排序替换等操作 */
  const replacePanel: PickByValue<EditFn, 'replacePanel'> = useCallback(
    (panels, isEnd = true) => {
      return updateSourceData((draft) => _.set(draft, 'panels', panels), isEnd);
    },
    [updateSourceData],
  );

  window.dd = mainData;
  if (!mainData || !mainData.panels) {
    return null;
  }
  return (
    <SourceDataProvider value={mainData}>
      {/* 编辑时的展示数据和信息, 不需要回撤 */}
      <EditDataProvider
        value={{
          selectLayers,
          setSelectLayers: setSelectLayersFn,
          selectSubLayer,
          unSelectLayersFn,
          selectLayersFn,
          editParam,
          setEditParam,
          zoom,
          setZoom,
          panelIndex,
          setPanelIndex,
          isChoosePanel,
          setIsChoosePanel,
          showPanelList,
          setShowPanelList,
        }}
      >
        {/* 编辑sourceData的函数需要顶部处理, 记录操作,便于撤销功能的实现 */}
        <EditFnProvider
          value={{
            canRedo,
            canUndo,
            undo,
            redo,
            setGuide,
            updateWH,
            switchBgType,
            updateBgColor,
            updateBgImg,
            replaceBgImg,
            updateLayer,
            updateLayerAnimations,
            addLayers,
            addImageLayers,
            addTextLayer,
            addQRCodeLayer,
            duplicateLayers,
            deleteLayer,
            changeLayerZindex,
            changeTemplate,
            replaceLayer,
            lockOrUnLockLayer,
            addNewPanelByIndex,
            addNewPanelByData,
            duplicatePanelByIndex,
            deletePanelByIndex,
            updatePanel,
            replacePanel,
          }}
        >
          <div
            className={style.design}
            onDragOver={(e) => {
              e.preventDefault();
            }}
            onDrop={(e) => {
              e.preventDefault();
            }}
          >
            <TopBar />
            <div className={style['design-container']}>
              <LeftBar />
              <DesignContainer />
              <RightBar />
            </div>
            <ImageSelect />
            <KeyboardShortcuts />
          </div>
        </EditFnProvider>
      </EditDataProvider>
    </SourceDataProvider>
  );
};

export default Design;
