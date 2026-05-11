import { AnimationSchema } from '../../interface';
import { delayDefault, delaySetting } from './common';

// 暂时没用, 通过每个动画的delay属性来实现动画组合了
const schema: AnimationSchema = {
  type: 'pause',
  name: '停顿',
  previewImage: 'https://cdn2.weimob.com/saas/saas-fe-sirius-orion-node/production/zh-CN/468/pause.gif',
  defaults: {
    ...delayDefault,
  },
  settings: [delaySetting],
  tweens: [
    {
      ease: 'power1.in',
      from: 0,
      to: 1,
      repeat: 0,
      yoyo: false,
      init: () => {
        return {
          from: {},
          to: {},
        };
      },
    },
  ],
};

export default schema;
