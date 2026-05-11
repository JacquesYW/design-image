import Fn from '@/utils/utils';
import { AnimationSettingType } from '../../constants';
import { AnimationSchema } from '../../interface';
import { commonDefaults, commonSettings } from './common';

const DEFAULT_DIR = 'v';

const schema: AnimationSchema = {
  type: 'shake',
  name: '抖动',
  previewImage: 'https://cdn2.weimob.com/saas/saas-fe-sirius-orion-node/production/zh-CN/468/shake.gif',
  defaults: {
    dir: DEFAULT_DIR,
    ...commonDefaults,
  },
  settings: [
    {
      label: '方向',
      name: 'dir',
      type: AnimationSettingType.Select,
      props: {
        options: [
          { label: '水平', value: 'h' },
          { label: '垂直', value: 'v' },
        ],
      },
    },
    ...commonSettings,
  ],
  tweens: [
    {
      ease: 'power1.out',
      from: 0,
      to: 0.1,
      repeat: 0,
      yoyo: false,
      init: (layerData, animationSetting) => {
        const dir = (animationSetting.t.dir as string) || DEFAULT_DIR;
        const from: { [k: string]: number } = {};
        const to: { [k: string]: number } = {};
        if (layerData) {
          if (dir === 'h') {
            Fn.verify.isNotEmpty(layerData.tr.x) && ((from.x = layerData.tr.x), (to.x = layerData.tr.x - 10));
          } else if (dir === 'v') {
            layerData.tr.y && ((from.y = layerData.tr.y), (to.y = layerData.tr.y - 10));
          }
        }
        return { from, to };
      },
    },
    {
      ease: 'power1.out',
      from: 0.1,
      to: 0.2,
      repeat: 0,
      yoyo: false,
      init: (layerData, animationSetting) => {
        const dir = (animationSetting.t.dir as string) || DEFAULT_DIR;
        const from: { [k: string]: number } = {};
        const to: { [k: string]: number } = {};
        if (layerData) {
          if (dir === 'h') {
            Fn.verify.isNotEmpty(layerData.tr.x) && ((from.x = layerData.tr.x - 10), (to.x = layerData.tr.x + 10));
          } else if (dir === 'v') {
            Fn.verify.isNotEmpty(layerData.tr.y) && ((from.y = layerData.tr.y - 10), (to.y = layerData.tr.y + 10));
          }
        }
        return { from, to };
      },
    },
    {
      ease: 'power1.out',
      from: 0.2,
      to: 0.3,
      repeat: 0,
      yoyo: false,
      init: (layerData, animationSetting) => {
        const dir = (animationSetting.t.dir as string) || DEFAULT_DIR;
        const from: { [k: string]: number } = {};
        const to: { [k: string]: number } = {};
        if (layerData) {
          if (dir === 'h') {
            Fn.verify.isNotEmpty(layerData.tr.x) && ((from.x = layerData.tr.x + 10), (to.x = layerData.tr.x - 10));
          } else if (dir === 'v') {
            Fn.verify.isNotEmpty(layerData.tr.y) && ((from.y = layerData.tr.y + 10), (to.y = layerData.tr.y - 10));
          }
        }
        return { from, to };
      },
    },
    {
      ease: 'power1.out',
      from: 0.3,
      to: 0.4,
      repeat: 0,
      yoyo: false,
      init: (layerData, animationSetting) => {
        const dir = (animationSetting.t.dir as string) || DEFAULT_DIR;
        const from: { [k: string]: number } = {};
        const to: { [k: string]: number } = {};
        if (layerData) {
          if (dir === 'h') {
            Fn.verify.isNotEmpty(layerData.tr.x) && ((from.x = layerData.tr.x - 10), (to.x = layerData.tr.x + 10));
          } else if (dir === 'v') {
            Fn.verify.isNotEmpty(layerData.tr.y) && ((from.y = layerData.tr.y - 10), (to.y = layerData.tr.y + 10));
          }
        }
        return { from, to };
      },
    },
    {
      ease: 'power1.out',
      from: 0.4,
      to: 0.5,
      repeat: 0,
      yoyo: false,
      init: (layerData, animationSetting) => {
        const dir = (animationSetting.t.dir as string) || DEFAULT_DIR;
        const from: { [k: string]: number } = {};
        const to: { [k: string]: number } = {};
        if (layerData) {
          if (dir === 'h') {
            Fn.verify.isNotEmpty(layerData.tr.x) && ((from.x = layerData.tr.x + 10), (to.x = layerData.tr.x - 10));
          } else if (dir === 'v') {
            Fn.verify.isNotEmpty(layerData.tr.y) && ((from.y = layerData.tr.y + 10), (to.y = layerData.tr.y - 10));
          }
        }
        return { from, to };
      },
    },
    {
      ease: 'power1.out',
      from: 0.5,
      to: 0.6,
      repeat: 0,
      yoyo: false,
      init: (layerData, animationSetting) => {
        const dir = (animationSetting.t.dir as string) || DEFAULT_DIR;
        const from: { [k: string]: number } = {};
        const to: { [k: string]: number } = {};
        if (layerData) {
          if (dir === 'h') {
            Fn.verify.isNotEmpty(layerData.tr.x) && ((from.x = layerData.tr.x - 10), (to.x = layerData.tr.x + 10));
          } else if (dir === 'v') {
            Fn.verify.isNotEmpty(layerData.tr.y) && ((from.y = layerData.tr.y - 10), (to.y = layerData.tr.y + 10));
          }
        }
        return { from, to };
      },
    },
    {
      ease: 'power1.out',
      from: 0.6,
      to: 0.7,
      repeat: 0,
      yoyo: false,
      init: (layerData, animationSetting) => {
        const dir = (animationSetting.t.dir as string) || DEFAULT_DIR;
        const from: { [k: string]: number } = {};
        const to: { [k: string]: number } = {};
        if (layerData) {
          if (dir === 'h') {
            Fn.verify.isNotEmpty(layerData.tr.x) && ((from.x = layerData.tr.x + 10), (to.x = layerData.tr.x - 10));
          } else if (dir === 'v') {
            Fn.verify.isNotEmpty(layerData.tr.y) && ((from.y = layerData.tr.y + 10), (to.y = layerData.tr.y - 10));
          }
        }
        return { from, to };
      },
    },
    {
      ease: 'power1.out',
      from: 0.7,
      to: 0.8,
      repeat: 0,
      yoyo: false,
      init: (layerData, animationSetting) => {
        const dir = (animationSetting.t.dir as string) || DEFAULT_DIR;
        const from: { [k: string]: number } = {};
        const to: { [k: string]: number } = {};
        if (layerData) {
          if (dir === 'h') {
            Fn.verify.isNotEmpty(layerData.tr.x) && ((from.x = layerData.tr.x - 10), (to.x = layerData.tr.x + 10));
          } else if (dir === 'v') {
            Fn.verify.isNotEmpty(layerData.tr.y) && ((from.y = layerData.tr.y - 10), (to.y = layerData.tr.y + 10));
          }
        }
        return { from, to };
      },
    },
    {
      ease: 'power1.out',
      from: 0.8,
      to: 0.9,
      repeat: 0,
      yoyo: false,
      init: (layerData, animationSetting) => {
        const dir = (animationSetting.t.dir as string) || DEFAULT_DIR;
        const from: { [k: string]: number } = {};
        const to: { [k: string]: number } = {};
        if (layerData) {
          if (dir === 'h') {
            Fn.verify.isNotEmpty(layerData.tr.x) && ((from.x = layerData.tr.x + 10), (to.x = layerData.tr.x - 10));
          } else if (dir === 'v') {
            Fn.verify.isNotEmpty(layerData.tr.y) && ((from.y = layerData.tr.y + 10), (to.y = layerData.tr.y - 10));
          }
        }
        return { from, to };
      },
    },
    {
      ease: 'power1.out',
      from: 0.9,
      to: 1,
      repeat: 0,
      yoyo: false,
      init: (layerData, animationSetting) => {
        const dir = (animationSetting.t.dir as string) || DEFAULT_DIR;
        const from: { [k: string]: number } = {};
        const to: { [k: string]: number } = {};
        if (layerData) {
          if (dir === 'h') {
            Fn.verify.isNotEmpty(layerData.tr.x) && ((from.x = layerData.tr.x - 10), (to.x = layerData.tr.x));
          } else if (dir === 'v') {
            Fn.verify.isNotEmpty(layerData.tr.y) && ((from.y = layerData.tr.y - 10), (to.y = layerData.tr.y));
          }
        }
        return { from, to };
      },
    },
  ],
};

export default schema;
