import { AnimationSettingType } from '../../constants';
import { AnimationSchema } from '../../interface';
import { commonDefaults, commonSettings } from './common';

const DEFAULT_DIR = 'fl';
const DEFAULT_DISTANCE = 100;

const schema: AnimationSchema = {
  type: 'waggle',
  name: '摇摆',
  previewImage: 'https://cdn2.weimob.com/saas/saas-fe-sirius-orion-node/production/zh-CN/468/waggle.gif',
  defaults: {
    dir: DEFAULT_DIR,
    distance: DEFAULT_DISTANCE,
    ...commonDefaults,
  },
  settings: [
    {
      label: '方向',
      name: 'dir',
      type: AnimationSettingType.Select,
      props: {
        options: [
          { label: '从左', value: 'fl' },
          { label: '从右', value: 'fr' },
          { label: '从上', value: 'ft' },
          { label: '从下', value: 'fb' },
          { label: '从左上', value: 'ftl' },
          { label: '从左下', value: 'fbl' },
          { label: '从右上', value: 'ftr' },
          { label: '从右下', value: 'fbr' },
        ],
      },
    },
    {
      label: '初始距离',
      name: 'distance',
      type: AnimationSettingType.Number,
      props: {
        unit: 'PX',
        precision: 0,
        step: 1,
      },
    },
    ...commonSettings,
  ],
  tweens: [
    {
      ease: 'power1.out',
      from: 0,
      to: 0.25,
      repeat: 0,
      yoyo: false,
      init: (layerData, animationSetting) => {
        const dir = (animationSetting.t.dir as string) || DEFAULT_DIR;
        const distance = (animationSetting.t.distance as number) || DEFAULT_DISTANCE;
        const from: { [k: string]: number } = {};
        const to: { [k: string]: number } = {};
        const setting: { [k: string]: number } = {};
        dir.split('').forEach((part) => {
          switch (part) {
            case 'l':
              layerData?.tr.x && ((from.x = layerData.tr.x), (to.x = layerData.tr.x - distance));
              break;
            case 'r':
              layerData?.tr.x && ((from.x = layerData.tr.x), (to.x = layerData.tr.x + distance));
              break;
            case 't':
              layerData?.tr.x && ((from.y = layerData.tr.y), (to.y = layerData.tr.y - distance));
              break;
            case 'b':
              layerData?.tr.x && ((from.y = layerData.tr.y), (to.y = layerData.tr.y + distance));
              break;
            default:
          }
        });

        return {
          from,
          to,
          setting,
        };
      },
    },
    {
      ease: 'power1.out',
      from: 0.25,
      to: 0.75,
      repeat: 0,
      yoyo: false,
      init: (layerData, animationSetting) => {
        const dir = (animationSetting.t.dir as string) || DEFAULT_DIR;
        const distance = (animationSetting.t.distance as number) || DEFAULT_DISTANCE;
        const from: { [k: string]: number } = {};
        const to: { [k: string]: number } = {};
        const setting: { [k: string]: number } = {};
        dir.split('').forEach((part) => {
          switch (part) {
            case 'l':
              layerData?.tr.x && ((from.x = layerData.tr.x - distance), (to.x = layerData.tr.x + distance));
              break;
            case 'r':
              layerData?.tr.x && ((from.x = layerData.tr.x + distance), (to.x = layerData.tr.x - distance));
              break;
            case 't':
              layerData?.tr.x && ((from.y = layerData.tr.y - distance), (to.y = layerData.tr.y + distance));
              break;
            case 'b':
              layerData?.tr.x && ((from.y = layerData.tr.y + distance), (to.y = layerData.tr.y - distance));
              break;
            default:
          }
        });

        return {
          from,
          to,
          setting,
        };
      },
    },
    {
      ease: 'power1.out',
      from: 0.75,
      to: 1,
      repeat: 0,
      yoyo: false,
      init: (layerData, animationSetting) => {
        const dir = (animationSetting.t.dir as string) || DEFAULT_DIR;
        const distance = (animationSetting.t.distance as number) || DEFAULT_DISTANCE;
        const from: { [k: string]: number } = {};
        const to: { [k: string]: number } = {};
        const setting: { [k: string]: number } = {};
        dir.split('').forEach((part) => {
          switch (part) {
            case 'l':
              layerData?.tr.x && ((from.x = layerData.tr.x + distance), (to.x = layerData.tr.x));
              break;
            case 'r':
              layerData?.tr.x && ((from.x = layerData.tr.x - distance), (to.x = layerData.tr.x));
              break;
            case 't':
              layerData?.tr.x && ((from.y = layerData.tr.y + distance), (to.y = layerData.tr.y));
              break;
            case 'b':
              layerData?.tr.x && ((from.y = layerData.tr.y - distance), (to.y = layerData.tr.y));
              break;
            default:
          }
        });

        return {
          from,
          to,
          setting,
        };
      },
    },
  ],
};

export default schema;
