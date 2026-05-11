import Fn from '@/utils/utils';
import { AnimationSettingType } from '../../constants';
import { AnimationSchema } from '../../interface';
import { commonDefaults, commonSettings } from './common';

const DEFAULT_DIR = 'fl';

const schema: AnimationSchema = {
  type: 'slide-fade-in',
  name: '位移淡入',
  previewImage: 'https://cdn2.weimob.com/saas/saas-fe-sirius-orion-node/production/zh-CN/468/slide-fade-in.gif',
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
    ...commonSettings,
  ],
  tweens: [
    {
      ease: 'power1.in',
      from: 0,
      to: 1,
      repeat: 0,
      yoyo: false,
      init: (layerData, animationSetting) => {
        const dir = (animationSetting.t.dir as string) || DEFAULT_DIR;
        const from: { [k: string]: number } = {
          o: 0,
        };
        const to: { [k: string]: number } = {
          o: 1,
        };
        const setting: { [k: string]: number } = {};
        if (layerData) {
          dir.split('').forEach((part) => {
            switch (part) {
              case 'l':
                Fn.verify.isNotEmpty(layerData.w) && ((from.x = layerData.tr.x - layerData.w), (to.x = layerData.tr.x));
                break;
              case 'r':
                Fn.verify.isNotEmpty(layerData.w) && ((from.x = layerData.tr.x + layerData.w), (to.x = layerData.tr.x));
                break;
              case 't':
                Fn.verify.isNotEmpty(layerData.h) && ((from.y = layerData.tr.y - layerData.h), (to.y = layerData.tr.y));
                break;
              case 'b':
                Fn.verify.isNotEmpty(layerData.h) && ((from.y = layerData.tr.y + layerData.h), (to.y = layerData.tr.y));
                break;
              default:
            }
          });
        }

        return {
          from,
          to,
          setting,
        };
      },
      update: (animationState, layerState) => {
        Object.assign(layerState, animationState);
        return layerState;
      },
    },
  ],
};

export default schema;
