import { AnimationSchema } from '../../interface';
import { commonDefaults, commonSettings } from './common';

const schema: AnimationSchema = {
  type: 'jello',
  name: '果冻',
  previewImage: 'https://cdn2.weimob.com/saas/saas-fe-sirius-orion-node/production/zh-CN/468/jello.gif',
  defaults: {
    ...commonDefaults,
  },
  settings: [...commonSettings],
  tweens: [
    {
      from: 0,
      to: 0.111,
      init: () => {
        return {
          from: { sk: 0 },
          to: { sk: 0 },
        };
      },
    },
    {
      from: 0.111,
      to: 0.222,
      init: () => {
        return {
          from: { sk: 0 },
          to: { sk: -12.5 },
        };
      },
    },
    {
      from: 0.222,
      to: 0.333,
      init: () => {
        return {
          from: { sk: -12.5 },
          to: { sk: 6.25 },
        };
      },
    },
    {
      from: 0.333,
      to: 0.444,
      init: () => {
        return {
          from: { sk: 6.25 },
          to: { sk: -3.125 },
        };
      },
    },
    {
      from: 0.444,
      to: 0.555,
      init: () => {
        return {
          from: { sk: -3.125 },
          to: { sk: 1.5625 },
        };
      },
    },
    {
      from: 0.555,
      to: 0.666,
      init: () => {
        return {
          from: { sk: 1.5625 },
          to: { sk: -0.78125 },
        };
      },
    },
    {
      from: 0.666,
      to: 0.777,
      init: () => {
        return {
          from: { sk: -0.78125 },
          to: { sk: 0.390625 },
        };
      },
    },
    {
      from: 0.777,
      to: 0.888,
      init: () => {
        return {
          from: { sk: 0.390625 },
          to: { sk: -0.1953125 },
        };
      },
    },
    {
      from: 0.888,
      to: 1,
      init: () => {
        return {
          from: { sk: -0.1953125 },
          to: { sk: 0 },
        };
      },
    },
  ],
};

export default schema;
