import { AnimationSettingType } from '../../constants';
import { AnimationSchema } from '../../interface';
import { getEaseFunction } from '../ease';
import { commonDefaults, commonSettings, easeDefault, easeSetting } from './common';

const DEFAULT_SCALE = 50;

const schema: AnimationSchema = {
  type: 'zoom-in',
  name: '缩放',
  previewImage: 'https://cdn2.weimob.com/saas/saas-fe-sirius-orion-node/production/zh-CN/468/zoom-in.gif',
  defaults: {
    scale: DEFAULT_SCALE,
    ...easeDefault,
    ...commonDefaults,
  },
  settings: [
    {
      label: '初始缩放',
      name: 'scale',
      type: AnimationSettingType.Range,
      props: {
        min: 0,
        max: 200,
        step: 1,
        precision: 0,
        unit: '%',
      },
    },
    easeSetting,
    ...commonSettings,
  ],
  tweens: [
    {
      ease: 'power1.in',
      from: 0,
      to: 1,
      repeat: 0,
      yoyo: false,
      init: (_layerData, animationSetting) => {
        const scale = (animationSetting.t.scale as number) || DEFAULT_SCALE;
        const easeName = (animationSetting.t.ease as string) || easeDefault.ease;
        const ease = getEaseFunction(easeName);
        return {
          from: { s: scale / 100, o: 0 },
          to: { s: 1, o: 1 },
          setting: {
            ease,
          },
        };
      },
    },
  ],
};

export default schema;
