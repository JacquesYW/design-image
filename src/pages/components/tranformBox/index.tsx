import TransformOperation from '@/utils/transform';
import { EditData, EditFn } from '@/pages/design/context';
import { getTransformBoxSubId } from '@/common/config';
import manageFactory from '@/utils/manageFactory';
import { MainTransform } from '@/pages/design/interface';
import style from './index.module.less';
import { Tooltip } from 'antd';
import classnames from 'classnames';

export interface TranformBoxProps {
  children: React.ReactNode;
  tr: MainTransform;
  id: string;
  isLocked: boolean;
  style?: React.CSSProperties;
  elRef?: React.MutableRefObject<HTMLElement | null>;
}
const TranformBox = (props: TranformBoxProps) => {
  const { zoom, selectLayers, selectSubLayer } = useContext(EditData);
  const { lockOrUnLockLayer } = useContext(EditFn);
  const { tr, isLocked, id } = props;
  const isShowLocked = useMemo(
    () => isLocked && selectLayers.includes(id) && selectLayers.length == 1,
    [selectLayers, isLocked],
  );
  const isSelectedMultiple = useMemo(() => selectLayers.includes(id) && selectLayers.length > 1, [selectLayers]);
  const isSelectSubLayer = useMemo(() => selectSubLayer && selectSubLayer === id, [selectSubLayer]);
  const trs = new TransformOperation({
    translate: {
      x: tr.x * zoom,
      y: tr.y * zoom,
    },
    skew: tr.sk,
    scale: tr.s,
    rotate: tr.r,
  });
  const transRef = useRef<HTMLElement>();
  useEffect(() => {
    if (transRef.current) {
      manageFactory.setTransDomById(id, transRef.current);
    }
  }, [props]);
  return (
    <div
      ref={(ref) => {
        if (ref) {
          if (props.elRef) {
            if (!props.elRef.current) {
              props.elRef.current = ref;
            }
          }
          transRef.current = ref;
        }
      }}
      id={getTransformBoxSubId(id)}
      className={classnames({ [style['multiple-select-highlight']]: isSelectedMultiple || isSelectSubLayer })}
      // className={classnames({ 'multiple-select-highlight': isSelectedMultiple || isSelectSubLayer })}
      style={
        {
          ...(props.style || {}),
          position: 'absolute',
          // 使用变量的方式, 便于moveable工具获取对应的值
          transform: trs.getMatrixCssStr(),
        } as React.CSSProperties
      }
    >
      {props.children}
      {isShowLocked ? (
        <div className={style['image-edit-locked-box']}>
          <div
            className={style['image-edit-locked-icon-box']}
            onDoubleClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => {
              e.stopPropagation();
              if (e.button === 0) {
                lockOrUnLockLayer(id, false);
              }
            }}
          >
            <Tooltip title="点击解除锁定" placement="bottom">
              <i
                className={style['image-edit-locked-icon']}
                style={{
                  transform: `rotate(${-tr.r}deg)`,
                }}
              />
            </Tooltip>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default TranformBox;
