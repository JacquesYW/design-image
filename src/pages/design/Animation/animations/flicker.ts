import { AnimationSchema } from '../../interface';
import { commonDefaults, commonSettings } from './common';

const schema: AnimationSchema = {
  type: 'flicker',
  name: '闪烁',
  previewImage: 'https://cdn2.weimob.com/saas/saas-fe-sirius-orion-node/production/zh-CN/468/flicker.gif',
  defaults: {
    ...commonDefaults,
  },
  settings: [...commonSettings],
  tweens: [
    {
      ease: 'power1.in',
      from: 0,
      to: 0.5,
      repeat: 0,
      yoyo: false,
      init: () => {
        return {
          from: {
            o: 1,
          },
          to: {
            o: 0,
          },
        };
      },
    },
    {
      ease: 'power1.out',
      from: 0.5,
      to: 1,
      repeat: 0,
      yoyo: false,
      init: () => {
        return {
          from: {
            o: 0,
          },
          to: {
            o: 1,
          },
        };
      },
    },
  ],
};

export default schema;
