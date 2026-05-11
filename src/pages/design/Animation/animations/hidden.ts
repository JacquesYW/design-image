import { AnimationSchema } from '../../interface';
import { durationDefault, durationSetting } from './common';

const schema: AnimationSchema = {
  type: 'hidden',
  name: '隐藏',
  previewImage: 'https://cdn2.weimob.com/saas/saas-fe-sirius-orion-node/production/zh-CN/468/hidden.gif',
  defaults: {
    ...durationDefault,
  },
  settings: [durationSetting],
  tweens: [
    {
      ease: 'power1.in',
      from: 0,
      to: 1,
      repeat: 0,
      yoyo: false,
      init: () => {
        return {
          from: { o: 0 },
          to: { o: 0 },
        };
      },
    },
  ],
};

export default schema;
