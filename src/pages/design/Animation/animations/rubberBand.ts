import { AnimationSchema } from '../../interface';
import { commonDefaults, commonSettings } from './common';

const ease = 'power1.out';

const schema: AnimationSchema = {
  type: 'rubber-band',
  name: '橡皮筋',
  previewImage: 'https://cdn2.weimob.com/saas/saas-fe-sirius-orion-node/production/zh-CN/468/rubber-band.gif',
  defaults: {
    ...commonDefaults,
  },
  settings: [...commonSettings],
  tweens: [
    {
      ease,
      from: 0,
      to: 0.3,
      repeat: 0,
      yoyo: false,
      init: () => {
        return {
          from: { sx: 1, sy: 1 },
          to: { sx: 1.25, sy: 0.75 },
        };
      },
    },
    {
      ease,
      from: 0.3,
      to: 0.4,
      repeat: 0,
      yoyo: false,
      init: () => {
        return {
          from: { sx: 1.25, sy: 0.75 },
          to: { sx: 0.75, sy: 1.25 },
        };
      },
    },
    {
      ease,
      from: 0.4,
      to: 0.5,
      repeat: 0,
      yoyo: false,
      init: () => {
        return {
          from: { sx: 0.75, sy: 1.25 },
          to: { sx: 1.15, sy: 0.85 },
        };
      },
    },
    {
      ease,
      from: 0.5,
      to: 0.65,
      repeat: 0,
      yoyo: false,
      init: () => {
        return {
          from: { sx: 1.15, sy: 0.85 },
          to: { sx: 0.95, sy: 1.05 },
        };
      },
    },
    {
      ease,
      from: 0.65,
      to: 0.75,
      repeat: 0,
      yoyo: false,
      init: () => {
        return {
          from: { sx: 0.95, sy: 1.05 },
          to: { sx: 1.05, sy: 0.95 },
        };
      },
    },
    {
      ease,
      from: 0.75,
      to: 1,
      repeat: 0,
      yoyo: false,
      init: () => {
        return {
          from: { sx: 1, sy: 1 },
          to: { sx: 1, sy: 1 },
        };
      },
    },
  ],
};

export default schema;
