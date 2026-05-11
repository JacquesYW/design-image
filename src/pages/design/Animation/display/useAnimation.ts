import { AnimationUpdateCallback } from '../../interface';
import { AnimationGroup, AnimationManager, createAnimationManager } from '../animationManager';
import AnimationContext from './AnimationContext';

const useAnimation = () => {
  const animationContext = useContext(AnimationContext);
  const stateRef = useRef<AnimationManager['state'] | null>(null);
  const callbacksRef = useRef<((state: AnimationManager['state']) => void)[]>([]);
  // const [, setResfresh] = useState(false);

  useEffect(() => {
    if (!animationContext) {
      return;
    }
    const callback = (state: AnimationManager['state']) => {
      animationContext.animationState = state;
      stateRef.current = state;
      callbacksRef.current.forEach((cb) => cb(state));
      // setResfresh((p) => !p);
    };
    const manager = createAnimationManager(callback);

    const ensureLayerAnimation: AnimationManager['ensure'] = (id: string, updateCallback: AnimationUpdateCallback) => {
      return manager.ensure(id, updateCallback);
    };

    const removeLayerAnimation: AnimationManager['remove'] = (group: AnimationGroup) => {
      return manager.remove(group);
    };

    const previewLayerAnimation = (id: string, idx: number) => {
      return manager.startPreviewItem(id, idx);
    };

    const previewLayerAnimationGroup = (id: string) => {
      return manager.startPreviewGroup(id);
    };

    const stopPreviewAnimation = () => {
      return manager.stopPreview();
    };

    const togglePreviewTimeline = () => {
      return manager.togglePreviewTimeline();
    };

    const addCallback = (callback: (state: AnimationManager['state']) => void, isRunAtRegister = true) => {
      if (!callbacksRef.current.includes(callback)) {
        callbacksRef.current.push(callback);
      }
      if (isRunAtRegister) {
        const state = getState();
        if (state) {
          callback(state);
        }
      }
    };

    const removeCallback = (callback: (state: AnimationManager['state']) => void) => {
      const index = callbacksRef.current.indexOf(callback);
      if (index !== -1) {
        callbacksRef.current.splice(index, 1);
      }
    };

    const getState = () => {
      return stateRef.current;
    };

    animationContext.manager = manager;
    animationContext.ensureLayerAnimation = ensureLayerAnimation;
    animationContext.removeLayerAnimation = removeLayerAnimation;
    animationContext.previewLayerAnimation = previewLayerAnimation;
    animationContext.previewLayerAnimationGroup = previewLayerAnimationGroup;
    animationContext.stopPreviewAnimation = stopPreviewAnimation;
    animationContext.togglePreviewTimeline = togglePreviewTimeline;
    animationContext.addCallback = addCallback;
    animationContext.removeCallback = removeCallback;
    animationContext.getState = getState;

    return () => {
      // manager.destroy();
    };
  }, [animationContext]);

  return null;
};

export default useAnimation;
