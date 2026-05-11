import { ReactElement, cloneElement, isValidElement } from 'react';
import TransformOperation from '@/utils/transform';
import { AnimationUpdateCallback, Layer, MainLayer } from '../../interface';
import { EditData } from '../../context';
import useAnimationItem from './useAnimationItem';

export interface AnimationDisplayItemProps {
  children?: ReactElement<Layer> | string | null;
}

const AnimationDisplayItem: React.FC<AnimationDisplayItemProps> = (props) => {
  const clonedChild = isValidElement(props.children) ? cloneElement(props.children) : null;

  const { zoom } = useContext(EditData);

  const elRef = useRef<HTMLElement>();

  const update = useCallback<AnimationUpdateCallback>(
    (state) => {
      if (!elRef.current || !clonedChild?.props) {
        return;
      }
      const { tr } = clonedChild.props;
      type NewTr = typeof tr & { sx: number; sy: number };
      const newTr = { ...tr, ...state } as NewTr;
      const scale = { x: newTr.sx ?? newTr.s ?? 1, y: newTr.sy ?? newTr.s ?? 1 };
      const trs = new TransformOperation({
        translate: {
          x: newTr.x * zoom,
          y: newTr.y * zoom,
        },
        skew: newTr.sk,
        scale,
        rotate: newTr.r,
      });
      elRef.current.style.transform = trs.getMatrixCssStr();
      elRef.current.style.opacity = String(newTr.o);
    },
    [clonedChild?.props, zoom],
  );

  const { available } = useAnimationItem(clonedChild?.props as unknown as MainLayer, update);

  if (!clonedChild || !available) {
    return props.children;
  }

  const ChildType = clonedChild.type;

  return <ChildType {...clonedChild.props} elRef={elRef} />;
};

export default AnimationDisplayItem;
