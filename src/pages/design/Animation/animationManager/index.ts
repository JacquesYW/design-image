import AnimationGroup from './AnimationGroup';
import AnimationManager from './AnimationManager';

export const createAnimationManager = (callback: (state: AnimationManager['state']) => void) => {
  return new AnimationManager(callback);
};

export { AnimationManager, AnimationGroup };
