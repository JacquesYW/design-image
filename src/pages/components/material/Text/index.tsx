import TransformOperation from '@/utils/transform';
import TranformBox from '../../tranformBox';
import style from './index.module.less';
import { Layer, LinearColor, TextLayer } from '@/pages/design/interface';
import { DEFAULT_LAYER_CLASS, EditTypeEnum, getTransformBoxSubId } from '@/common/config';
import { EditData, EditFn, SourceData } from '@/pages/design/context';
import classnames from 'classnames';
import manageFactory from '@/utils/manageFactory';
import textEditorFatory from '@/utils/textEditorFatory';
import { isHit } from '../../editer/SelectToAndMoveableTool';
import _ from 'lodash';
import QuillCustom from './QuillCustom';
import Delta from 'quill-delta';
import { getElementInfo } from 'moveable';
import { onResizeParam } from '../../editer/SelectToAndMoveableTool/interface';
import Fn from '@/utils/utils';
import { CSSProperties } from 'react';
type WHType = {
  w: number;
  h: number;
};
const useWh = (w: number, h: number, callback?: { before?: () => void; after?: (wh: WHType) => void }) => {
  const [wh, setState] = useState({ w, h });
  useEffect(() => {
    callback?.after && callback.after(wh);
  }, [wh]);
  const setWh = (state: WHType) => {
    callback?.before && callback.before();
    setState(state);
  };
  return [wh, setWh] as [WHType, (state: WHType) => void];
};
const Text_Material = (props: TextLayer & { path: string; elRef?: React.MutableRefObject<HTMLElement | null> }) => {
  const sourceData = useContext(SourceData);
  const { updateLayer, deleteLayer } = useContext(EditFn);
  const { zoom, selectLayers, selectSubLayer, editParam, setEditParam, unSelectLayersFn } = useContext(EditData);
  const ref = useRef({
    laydom: null as HTMLElement | null,
    trans: new TransformOperation(),
    quill: null as null | QuillCustom,
    fn: {
      unSelectLayersFn,
    },
  });
  ref.current.fn.unSelectLayersFn = useMemo(() => unSelectLayersFn, [unSelectLayersFn]);
  const quillId = 'quill-id' + props.id;
  // 是否垂直
  const isVertical = props.tr.font.writingMode == 'vertical-rl';
  /* 是否选中 */
  const isSelected = selectLayers.includes(props.id) || selectSubLayer === props.id;
  /* 是否编辑 */
  const isEdit = editParam.type == EditTypeEnum.TEXTEDIT && editParam.id == props.id;
  const [wh, setWh] = useWh(0, 0, {
    before: () => {},
    after: () => {},
  });

  useEffect(() => {
    return () => {
      ref.current.fn.unSelectLayersFn(props.id);
      if (ref.current.quill) {
        removeListener();
        ref.current.quill.destroy();
        ref.current.quill = null;
      }
      manageFactory.removeById(props.id);
    };
  }, []);
  const syncData = (param: unknown, isEnd = true) => {
    const sizeList: number[] = [];
    ref.current.quill?.getContents().forEach((item) => {
      if (item.attributes?.size) {
        sizeList.push(Fn.calc.removeUnit(item.attributes.size as string));
      }
    });

    updateLayer(
      props.id,
      _.merge(param, {
        p: ref.current.quill?.getContents(),
        tr: {
          font: {
            defaultSize: sizeList.length > 0 ? Fn.calc.addUnit(Math.max(...sizeList)) : props.tr.font.defaultSize,
          },
        },
      }) as DeepPartial<TextLayer>,
      isEnd,
    );
  };
  useEffect(() => {
    manageFactory.setPathById(props.id, props.path);
    manageFactory.setLayerDataById(props.id, _.omit(props, ['path', 'elRef']));
    if (ref.current.laydom) {
      manageFactory.setDomById(props.id, ref.current.laydom);
      manageFactory.setMoveableDriectionsById(
        props.id,
        ['nw', 'ne', 'sw', 'se'].concat(isVertical ? ['n', 's'] : ['e', 'w']),
      );
      manageFactory.setSnappableById(props.id, false);
      manageFactory.setHintFnById(props.id, (point) => {
        return isHit(point, ref.current.laydom!) ? 1 : 0;
      });
      manageFactory.register(props.id, 'dbclick', () => {
        if (!manageFactory.isLockedById(props.id)) {
          if (ref.current.quill) {
            setEditParam({ type: EditTypeEnum.TEXTEDIT, id: props.id });
            const dom = document.querySelector('.moveable-area') as HTMLElement;
            if (dom) {
              dom.style.pointerEvents = 'none';
            }
            ref.current.quill.enable(true);
            ref.current.quill.setSelection(0, ref.current.quill.getLength(), 'silent');
          }
        }
      });
    }
    /* 
      用于同步数据使用
      编辑quill中的文本样式后, 拖拽 旋转等操作时,一起同步操作
    */
    manageFactory.register(props.id, 'sync', (param) => {
      const p = param as { data: unknown; isEnd: boolean };
      syncData(p.data, p.isEnd);
    });
    /* 实时更新缩放状态 */
    manageFactory.register(props.id, 'onResize', (param) => {
      const { x, y, s, w, h, direction } = param as onResizeParam;
      const dom = document.getElementById(getTransformBoxSubId(props.id)) as HTMLElement;
      const textDom = document.querySelector(`#${quillId}`) as HTMLElement;
      textDom.style.overflow = 'visiable';
      ref.current.trans.resetData({
        translate: {
          x,
          y,
        },
        skew: props.tr.sk,
        scale: props.tr.s,
        rotate: props.tr.r,
      });
      let nw = null,
        nh = null,
        ns = null;
      if (direction.includes(0)) {
        // 单一宽高变动
        if (direction[0] == 0) {
          // 高度变动
          nh = h / zoom;
        }
        if (direction[1] == 0) {
          // 宽度变动
          nw = w / zoom;
        }
      } else {
        ns = s[isVertical ? 1 : 0];
      }
      if (nw) {
        dom.style.width = nw * zoom + 'px';
        textDom.style.width = nw + 'px';
      }
      if (nh) {
        dom.style.height = nh * zoom + 'px';
        textDom.style.height = nh + 'px';
      }
      if (ns) {
        textDom.style.transform = `scale(${ns})`;
      }
      const restwh = restWH(true);
      if (restwh) {
        dom.style.width = restwh.w * zoom * (ns || 1) + 'px';
        dom.style.height = restwh.h * zoom * (ns || 1) + 'px';
        // 文字缩放时-执行了 scale , 所以不需要刷新 minWidth 和 minHeight
        if (direction.includes(0)) {
          if (isVertical) {
            textDom.style.minWidth = restwh.w * (ns || 1) + 'px';
          } else {
            textDom.style.minHeight = restwh.h * (ns || 1) + 'px';
          }
        }
      }
      dom.style.transform = ref.current.trans.getMatrixCssStr();
    });
    /* 缩放结束后,更新数据 */
    manageFactory.register(props.id, 'onResizeEnd', (param) => {
      const { x, y, s, w, h, direction } = param as onResizeParam;
      const newData = {
        p: ref.current.quill?.getContents() || props.p,
        w: w / zoom,
        h: h / zoom,
        isFixedWH: props.isFixedWH,
        tr: {
          x: x / zoom,
          y: y / zoom,
          font: {
            defaultSize: props.tr?.font.defaultSize,
            strokeWidth: props?.tr?.font?.strokeWidth || 0,
          },
        },
      };
      let ns = null as number | null;
      if (direction.includes(0)) {
        newData.isFixedWH = true;
      } else {
        // 字体大小变动
        ns = s[isVertical ? 1 : 0];
        newData.tr.font.defaultSize = Fn.calc.addUnit(Fn.calc.changeSizeByScale(props.tr.font.defaultSize, ns));
        if (props?.tr?.font?.ishaveStroke) {
          newData.tr.font.strokeWidth *= ns;
        }
        newData.p = new Delta(
          (ref.current.quill?.getContents() as Delta).map((op) => {
            if (op.attributes && op.attributes.size) {
              op.attributes.size = Fn.calc.addUnit(
                Fn.calc.changeSizeByScale(op.attributes.size as string, ns as number),
              );
            }
            return op;
          }),
        );
      }
      updateLayer(props.id, newData as DeepPartial<Layer>);
    });
    manageFactory.register(props.id, 'onWhChange', (param) => {
      const { x, y, w, h } = param as onResizeParam;

      updateLayer(props.id, {
        w: w / zoom,
        h: h / zoom,
        isFixedWH: true,
        tr: {
          x: x / zoom,
          y: y / zoom,
        },
      });
    });
    const dom = document.getElementById(quillId);
    // 初始化 - 关联 text 数据和quill实例
    if (dom) {
      dom.style.transform = '';
      if (!ref.current.quill) {
        ref.current.quill = new QuillCustom(dom);
      }
      setWh(restWH());
      textEditorFatory.registerQuill(props.id, ref.current.quill);
      textEditorFatory.registerEvents(props.id, (type) => {
        const { w, h } = restWH(true);
        let space = 0;
        // 变更字间距时 - 宽/高-增加1个字符的像素大小-避免频繁换行渲染
        if (type == 'letterSpacing') {
          space = Fn.calc.changeSizeByScale(props.tr.font.defaultSize, zoom);
        }
        setWh({
          w: w + (isVertical ? 0 : space),
          h: h + (isVertical ? space : 0),
        });
      });
    }
    removeListener();
    addListener();
    return () => {
      removeListener();
      textEditorFatory.removeQuill(props.id);
    };
  }, [sourceData, zoom]);
  useEffect(() => {
    /* 
      源数据的p变动后 - 更新quill中的信息(主要是撤销等操作的回显)
      silent: 静默更新 - 避免触发 text-change事件 - 去同步数据(会使撤销等数据异常)
    */
    if (ref.current.quill) {
      if (typeof props.p == 'string') {
        const data = new Delta();
        data.insert(props.p, {
          size: props.tr.font.defaultSize,
          font: props.tr.font.defaultFamily,
          color: Fn.trans.rgbaToRgbaStr(props.tr.font.defaultColor),
        });
        ref.current.quill.setContents(data, 'silent');
      } else {
        ref.current.quill.setContents(props.p, 'silent');
      }
    }
    setWh(restWH());
  }, [props.p, props.tr]);
  useEffect(() => {
    // 反选时 - 同步quill中的数据到源数据的p中
    if (ref.current.quill?.isEnabled() && !isSelected) {
      ref.current.quill.enable(false);
      ref.current.quill.setSelection(0, 'silent');
      setEditParam({ type: '', id: '' });
      const dom = document.querySelector('.moveable-area') as HTMLElement;
      if (dom) {
        dom.style.pointerEvents = 'auto';
      }
      /* 
          length == 1 
          因为,quill会默认给一个默认的空行(\n) - 所以,需要判断length == 1
        */
      if (ref.current.quill?.getText().trim() == '') {
        deleteLayer([props.id]);
      } else {
        updateLayer(props.id, { p: ref.current.quill.getContents() } as DeepPartial<TextLayer>);
      }
    }
  }, [selectLayers, selectSubLayer]);
  const restWH = (isDrag: boolean = false) => {
    const wh = { w: 0, h: 0 };
    if (ref.current.quill) {
      const dom = (document.getElementById(quillId) as HTMLElement).cloneNode(true) as HTMLElement;
      dom.style.position = 'fixed';
      dom.style.left = '-20000px';
      dom.style.top = '-20000px';
      dom.style.setProperty('--zoom', '' + zoom);
      // 拖拽时,宽高不限定
      if (!isDrag) {
        if (props.w) {
          dom.style.width = props.w + 'px';
        }
        if (props.h) {
          dom.style.height = props.h + 'px';
        }
      }
      document.body.append(dom);
      const { width, height } = getElementInfo(dom.children[0] as HTMLElement);
      wh.w = width;
      wh.h = height;
      dom.remove();
    }
    return wh;
  };
  const addListener = () => {
    if (ref.current.quill) {
      ref.current.quill.addEventListener('text-change', (delta, oldContents, source) => {
        if (ref.current.quill) {
          if (
            source != 'silent' &&
            ref.current.quill.getLines().length == 1 &&
            ref.current.quill.getText().trim() == ''
          ) {
            ref.current.quill.setText('\n', 'silent');
          }
          if (source == 'user') {
            if (oldContents.ops.length == 1 && oldContents.ops[0].insert == '\n') {
              if (ref.current.quill) {
                textEditorFatory.setFormat('size', props.tr?.font?.defaultSize, 'silent');
                textEditorFatory.setFormat('font', props.tr?.font?.defaultFamily, 'silent');
                textEditorFatory.setFormat('color', Fn.trans.rgbaToRgbaStr(props.tr?.font?.defaultColor), 'silent');
              }
            }
          }

          if (ref.current.quill?.getLength() != 1) {
            setWh(restWH());
          }
        }
      });
    }
  };
  const removeListener = () => {
    if (ref.current.quill) {
      ref.current.quill.removeEventListener('text-change');
    }
  };
  const fontStyle = {
    writingMode: props.tr?.font.writingMode,
    lineHeight: props.tr?.font.lineHeight || 1,
    letterSpacing: props.tr?.font.letterSpacing,
    textAlign: props.tr?.font.align == 'fullWidth' ? 'justify' : props.tr?.font.align,
    textAlignLast: props.tr?.font.align == 'fullWidth' ? 'justify' : 'auto',
  } as Record<string, string | number>;
  /* 翻转 */
  ref.current.trans.resetData();
  if (props?.flip?.h) {
    ref.current.trans.horizontal();
  }
  if (props?.flip?.v) {
    ref.current.trans.vertical();
  }
  return (
    <TranformBox
      isLocked={props.isLocked}
      tr={{ ...props.tr }}
      id={props.id}
      elRef={props.elRef}
      style={
        {
          zIndex: isEdit ? 9999 : 0,
          width: props.w || wh.w ? (props.w || wh.w) * zoom + 'px' : 'fit-content',
          height: props.h || wh.h ? (props.h || wh.h) * zoom + 'px' : 'fit-content',
        } as React.CSSProperties
      }
    >
      <div
        id={props.id}
        ref={(text) => {
          if (text) {
            ref.current.laydom = text;
          }
        }}
        className={classnames(style['text-layer-container'], DEFAULT_LAYER_CLASS)}
        style={
          {
            opacity: props.tr?.o,
            transform: ref.current.trans.getMatrixStr(),
          } as React.CSSProperties
        }
        onMouseDown={(e) => {
          if (isEdit) {
            e.stopPropagation();
          }
        }}
        onKeyDown={(e) => {
          /* 
            避免和设计区域的快捷键冲突
          */
          e.stopPropagation();
        }}
      >
        <div
          className={style['text-content-box']}
          style={{
            width: props.isFixedWH ? wh.w + 'px' : 'fit-content',
            height: props.isFixedWH ? wh.h + 'px' : 'fit-content',
          }}
        >
          <div
            id={quillId}
            className={classnames({
              [style['fill-color-box']]: !isEdit && props?.tr?.font?.isShowFillColor,
              [style['stroke-color-box']]: !isEdit && props?.tr?.font?.isShowStroke,
            })}
            style={
              {
                wordBreak: 'break-all',
                minWidth: isVertical ? wh.w + 'px' : 'inherit',
                minHeight: isVertical ? 'inherit' : wh.h + 'px',
                width: props.w || 'auto',
                height: props.h || 'auto',
                fontSize: props.tr.font.defaultSize,
                transformOrigin: 'top left',
                '--fill-color': props?.tr?.font?.isShowFillColor
                  ? Fn.trans.linearToLinearStr(props.tr.font.fillColor as LinearColor)
                  : '',
                '--stroke-color': props?.tr?.font?.isShowStroke
                  ? Fn.trans.linearToLinearStr(props.tr.font.strokeColor as LinearColor)
                  : '',
                '--stroke-width': (props?.tr?.font?.isShowStroke ? props.tr.font.strokeWidth || 0 : 0) + 'px',
                ...fontStyle,
              } as CSSProperties
            }
          ></div>
        </div>
      </div>
    </TranformBox>
  );
};

export default Text_Material;
