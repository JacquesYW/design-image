import MaterialRender from '@/pages/components/material';
import { GroupLayer, Layer } from '@/pages/design/interface';
import TranformBox from '../../tranformBox';
import { EditData, EditFn } from '@/pages/design/context';
import { omit } from 'lodash';
import manageFactory from '@/utils/manageFactory';
import { onResizeParam } from '../../editer/SelectToAndMoveableTool/interface';
import { DEFAULT_LAYER_CLASS, getTransformBoxSubId } from '@/common/config';
import TransformOperation from '@/utils/transform';
import classNames from 'classnames';
import Fn from '@/utils/utils';
import { merge } from '../../../../hocks';

const Group_Material = (props: GroupLayer & { path: string; elRef?: React.MutableRefObject<HTMLElement | null> }) => {
  const trRef = useRef({
    // 公共变换对象
    commonTr: new TransformOperation(),
  });
  const { childrens, path, elRef } = props;
  const { zoom } = useContext(EditData);
  const { updateLayer } = useContext(EditFn);
  const childrenIds = useMemo(() => {
    return childrens.map(({ id }) => id);
  }, [childrens]);
  useEffect(() => {
    return () => {
      manageFactory.removeById(props.id);
    };
  }, []);
  useEffect(() => {
    manageFactory.setPathById(props.id, props.path);
    manageFactory.setLayerDataById(props.id, omit(props, ['path', 'elRef']));
    manageFactory.setSubIdsById(props.id, childrenIds);
    manageFactory.register(props.id, 'onResize', (param) => {
      const { x, y, w, h } = param as onResizeParam;
      const dom = document.getElementById(getTransformBoxSubId(props.id)) as HTMLElement;
      trRef.current.commonTr.resetData({
        translate: {
          x,
          y,
        },
        skew: props.tr.sk,
        scale: props.tr.s,
        rotate: props.tr.r,
      });
      dom.style.width = w + 'px';
      dom.style.height = h + 'px';
      dom.style.transform = trRef.current.commonTr.getMatrixCssStr();
    });
    manageFactory.register(props.id, 'onResizeEnd', (param) => {
      const { x, y, w, h } = param as onResizeParam;
      updateLayer(props.id, {
        tr: {
          x: x / zoom,
          y: y / zoom,
        },
        w: w / zoom,
        h: h / zoom,
      });
    });
    /* TODO: 同步宽高, 修改子图层宽高后,同步下现有宽高,并传递给父图层 */
    manageFactory.register(props.id, 'syncWH', () => {
      const isSub = manageFactory.isSubId(props.id);
      // 这个计算不含组图层(只包括所有的子图层)
      const whs = Fn.calcByLayer.getGroupLayerNewWHSById(props.id);
      const newParam = Fn.calcByLayer.getNewResizeParamByScale(
        {
          ...props,
        },
        {
          w: whs.w,
          h: whs.h,
          s: whs.s,
          direction: [1, 1],
          /* 这边的dx,dy是变换之前的坐标差值, 需要在特殊处理 */
          offset: {
            x: whs.dx,
            y: whs.dy,
          },
        },
        zoom,
        false,
      );

      const newLayer = {
        tr: {
          x: newParam.x / zoom,
          y: newParam.y / zoom,
        },
        w: newParam.w / zoom,
        h: newParam.h / zoom,
        childrens: props.childrens.map((child) => {
          const layer = manageFactory.getLayerDataById(child.id)!;
          return {
            ...layer,
            tr: {
              ...layer.tr,
              x: layer.tr.x - whs.dx,
              y: layer.tr.y - whs.dy,
            },
          } as DeepPartial<Layer>;
        }),
      };

      // 存在父级,则继续通知
      if (isSub) {
        manageFactory.setLayerDataById(props.id, merge(manageFactory.getLayerDataById(props.id)!, newLayer));
        manageFactory.dispatchRegister(manageFactory.getIdBySubId(props.id), 'syncWH');
      } else {
        updateLayer(props.id, newLayer);
      }
    });
  }, [props, zoom]);
  /* 翻转 */
  trRef.current.commonTr.resetData({});
  if (props?.flip?.h) {
    trRef.current.commonTr.horizontal();
  }
  if (props?.flip?.v) {
    trRef.current.commonTr.vertical();
  }

  return (
    <TranformBox
      tr={props.tr}
      id={props.id}
      isLocked={props.isLocked}
      elRef={elRef}
      style={
        {
          width: props.w * zoom + 'px',
          height: props.h * zoom + 'px',
          '--transform-width': props.w + 'px',
          '--transform-height': props.h + 'px',
        } as React.CSSProperties
      }
    >
      <div
        className={classNames(/* style['group-layer-container'] */ DEFAULT_LAYER_CLASS)}
        style={{
          transform: trRef.current.commonTr.getMatrixStr(),
        }}
      >
        <MaterialRender layers={childrens} prePath={`${path}.childrens`} />
      </div>
    </TranformBox>
  );
};

export default Group_Material;
