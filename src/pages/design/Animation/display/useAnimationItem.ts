import { useRef } from 'react';
import { AnimationUpdateCallback, LayerAnimation, MainLayer } from '../../interface';
import AnimationContext from './AnimationContext';
import { AnimationGroup } from '../animationManager';

const isAnimationAvailable = (animationData?: LayerAnimation[]) => {
  if (!animationData || animationData.length === 0) {
    return false;
  }
  return true;
};

const useAnimationItem = (layerData: MainLayer | null | undefined, updateHandler: AnimationUpdateCallback) => {
  const { ensureLayerAnimation, removeLayerAnimation } = useContext(AnimationContext);
  const id = useMemo(() => layerData?.id, [layerData]);
  const animationData = useMemo(() => layerData?.anm, [layerData]);
  const animationAvailable = useMemo(() => isAnimationAvailable(animationData), [animationData]);
  const animationGroup = useRef<AnimationGroup | null>(null);
  const targetRef = useRef<HTMLDivElement>(null);
  const updateHandlerRef = useRef<AnimationUpdateCallback>();
  const removeAnimationRef = useRef<(group: AnimationGroup) => void>();

  const callback = useCallback((state: object) => {
    if (updateHandlerRef.current) {
      updateHandlerRef.current(state);
    }
  }, []);

  useEffect(() => {
    updateHandlerRef.current = updateHandler;
    removeAnimationRef.current = removeLayerAnimation;
  }, [updateHandler, removeLayerAnimation]);

  useEffect(() => {
    if (!id || !isAnimationAvailable(animationData)) {
      if (animationGroup.current && removeAnimationRef.current) {
        removeAnimationRef.current(animationGroup.current);
        animationGroup.current = null;
      }
      return;
    }

    if (!ensureLayerAnimation) {
      return;
    }
    if (!animationGroup.current) {
      animationGroup.current = ensureLayerAnimation(id, callback);
    }
    if (layerData) {
      animationGroup.current!.update(layerData);
    }
  }, [ensureLayerAnimation, callback, id, layerData, animationData]);

  useEffect(() => {
    return () => {
      if (animationGroup.current && removeAnimationRef.current) {
        removeAnimationRef.current(animationGroup.current);
        animationGroup.current = null;
      }
    };
  }, []);

  return {
    ref: targetRef,
    available: animationAvailable,
  };
};

export default useAnimationItem;
