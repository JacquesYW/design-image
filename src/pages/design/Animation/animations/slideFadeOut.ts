import Fn from '@/utils/utils';
import { AnimationSettingType } from '../../constants';
import { AnimationSchema } from '../../interface';
import { commonDefaults, commonSettings } from './common';

const DEFAULT_DIR = 'tl';

const schema: AnimationSchema = {
  type: 'slide-fade-out',
  name: '位移淡出',
  previewImage: 'https://cdn2.weimob.com/saas/saas-fe-sirius-orion-node/production/zh-CN/468/slide-fade-out.gif',
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
          { label: '往左', value: 'tl' },
          { label: '往右', value: 'tr' },
          { label: '往上', value: 'tt' },
          { label: '往下', value: 'tb' },
          { label: '往左上', value: 'ttl' },
          { label: '往左下', value: 'tbl' },
          { label: '往右上', value: 'ttr' },
          { label: '往右下', value: 'tbr' },
        ],
      },
    },
    ...commonSettings,
  ],
  tweens: [
    {
      ease: 'power1.out',
      from: 0,
      to: 1,
      repeat: 0,
      yoyo: false,
      init: (layerData, animationSetting) => {
        const dir = (animationSetting.t.dir as string) || DEFAULT_DIR;
        const from: { [k: string]: number } = { o: 1 };
        const to: { [k: string]: number } = { o: 0 };
        if (layerData) {
          dir
            .split('')
            .slice(1)
            .forEach((part) => {
              switch (part) {
                case 'l':
                  Fn.verify.isNotEmpty(layerData.w) &&
                    ((to.x = layerData.tr.x - layerData.w), (from.x = layerData.tr.x));
                  break;
                case 'r':
                  Fn.verify.isNotEmpty(layerData.w) &&
                    ((to.x = layerData.tr.x + layerData.w), (from.x = layerData.tr.x));
                  break;
                case 't':
                  Fn.verify.isNotEmpty(layerData.h) &&
                    ((to.y = layerData.tr.y - layerData.h), (from.y = layerData.tr.y));
                  break;
                case 'b':
                  Fn.verify.isNotEmpty(layerData.h) &&
                    ((to.y = layerData.tr.y + layerData.h), (from.y = layerData.tr.y));
                  break;
                default:
              }
            });
        }

        return {
          from,
          to,
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
