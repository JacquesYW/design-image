import { GroupLayer } from '@/pages/design/interface';
import { DEFAULT_LAYER_CLASS } from '@/common/config';
import TransformOperation from '@/utils/transform';
import classNames from 'classnames';
import TranformBoxShow from '../../tranformBox/show';
import MaterialRenderShow from '../show';

const Group_Material_Show = (props: GroupLayer & { zoom: number }) => {
  const trRef = useRef({
    // 公共变换对象
    commonTr: new TransformOperation(),
  });
  const { childrens, zoom } = props;

  /* 翻转 */
  trRef.current.commonTr.resetData({});
  if (props?.flip?.h) {
    trRef.current.commonTr.horizontal();
  }
  if (props?.flip?.v) {
    trRef.current.commonTr.vertical();
  }

  return (
    <TranformBoxShow
      zoom={zoom}
      tr={props.tr}
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
        <MaterialRenderShow layers={childrens} zoom={zoom} />
      </div>
    </TranformBoxShow>
  );
};

export default Group_Material_Show;
