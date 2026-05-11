import { AnimationSchema } from '../interface';
import { commonDefaults, commonSettings } from './animations/common';

const animationSchemas: Map<string, AnimationSchema> = new Map();

export const registerAnimationSchema = (animationSchema: AnimationSchema) => {
  if (animationSchemas.has(animationSchema.type)) {
    return;
  }
  animationSchemas.set(animationSchema.type, animationSchema);
};

export const getAnimationSchema = (animationType: string) => {
  if (animationType) {
    return animationSchemas.get(animationType) || null;
  }
  return null;
};

export const getAnimationSchemaList = () => {
  return Array.from(animationSchemas.values());
};

export const getCommonDefaults = () => {
  return commonDefaults;
};

export const getCommonSettings = () => {
  return commonSettings;
};
