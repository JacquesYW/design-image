import { getEaseFunction } from './ease';
import {
  registerAnimationSchema,
  getAnimationSchema,
  getAnimationSchemaList,
  getCommonDefaults,
  getCommonSettings,
} from './schemaManager';
import slideFadeIn from './animations/slideFadeIn';
import slideFadeOut from './animations/slideFadeOut';
import flicker from './animations/flicker';
import swing from './animations/swing';
import waggle from './animations/waggle';
import shake from './animations/shake';
import bounceInDown from './animations/bounceInDown';
import pulse from './animations/pulse';
import rubberBand from './animations/rubberBand';
import jello from './animations/jello';
import zoomOut from './animations/zoomOut';
import slideIn from './animations/slideIn';
import zoomIn from './animations/zoomIn';
import rotate from './animations/rotate';
import fadeIn from './animations/fadeIn';
import fadeOut from './animations/fadeOut';
// import pause from './animations/pause';
import hidden from './animations/hidden';

registerAnimationSchema(slideFadeIn);
registerAnimationSchema(slideFadeOut);
registerAnimationSchema(flicker);
registerAnimationSchema(swing);
registerAnimationSchema(waggle);
registerAnimationSchema(shake);
registerAnimationSchema(bounceInDown);
registerAnimationSchema(pulse);
registerAnimationSchema(rubberBand);
registerAnimationSchema(jello);
registerAnimationSchema(zoomOut);
registerAnimationSchema(slideIn);
registerAnimationSchema(zoomIn);
registerAnimationSchema(rotate);
registerAnimationSchema(fadeIn);
registerAnimationSchema(fadeOut);
// registerAnimationSchema(pause);
registerAnimationSchema(hidden);

export {
  registerAnimationSchema,
  getAnimationSchema,
  getAnimationSchemaList,
  getCommonDefaults,
  getCommonSettings,
  getEaseFunction,
};
