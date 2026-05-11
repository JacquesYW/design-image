import { AnimationSettingType } from '../../constants';
import { AnimationSchema } from '../../interface';
import { commonDefaults, commonSettings } from './common';

const DEFAULT_SCALE = 120;

const schema: AnimationSchema = {
  type: 'pulse',
  name: '脉冲',
  previewImage: 'https://cdn2.weimob.com/saas/saas-fe-sirius-orion-node/production/zh-CN/468/pulse.gif',
  defaults: {
    scale: DEFAULT_SCALE,
    ...commonDefaults,
  },
  settings: [
    {
      label: '幅度',
      name: 'scale',
      type: AnimationSettingType.Range,
      props: {
        min: 0,
        max: 300,
        step: 1,
        precision: 0,
        unit: '%',
      },
    },
    ...commonSettings,
  ],
  tweens: [
    {
      ease: 'power1.in',
      from: 0,
      to: 0.5,
      repeat: 0,
      yoyo: false,
      init: (_layerData, animationSetting) => {
        const scale = (animationSetting.t.scale as number) || DEFAULT_SCALE;
        return {
          from: { s: 1 },
          to: { s: scale / 100 },
        };
      },
    },
    {
      ease: 'power1.out',
      from: 0.5,
      to: 1,
      repeat: 0,
      yoyo: false,
      init: (_layerData, animationSetting) => {
        const scale = (animationSetting.t.scale as number) || DEFAULT_SCALE;
        return {
          from: { s: scale / 100 },
          to: { s: 1 },
        };
      },
    },
  ],
};

export default schema;
