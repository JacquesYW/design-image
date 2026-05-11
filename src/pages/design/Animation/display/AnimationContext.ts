import React from 'react';
import { AnimationGroup, AnimationManager } from '../animationManager';

const Context = React.createContext<{
  manager?: AnimationManager;
  animationState?: AnimationManager['state'];
  ensureLayerAnimation?: (id: string, updateCallback: (state: object) => void) => AnimationGroup;
  removeLayerAnimation?: (group: AnimationGroup) => void;
  previewLayerAnimation?: (id: string, idx: number) => void;
  previewLayerAnimationGroup?: (id: string) => void;
  stopPreviewAnimation?: () => void;
  togglePreviewTimeline?: () => void;
  addCallback?: (callback: (state: AnimationManager['state']) => void, isRunAtRegister?: boolean) => void;
  removeCallback?: (callback: (state: AnimationManager['state']) => void) => void;
  getState?: () => AnimationManager['state'] | null;
}>({});

export default Context;
