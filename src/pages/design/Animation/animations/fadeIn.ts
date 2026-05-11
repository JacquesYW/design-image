import { AnimationSettingType } from '../../constants';
import { AnimationSchema } from '../../interface';
import { getEaseFunction, getEaseList } from '../ease';
import linear from '../ease/linear';
import { commonDefaults, commonSettings } from './common';

const DEFAULT_OPACITY = 25;
const DEFAULT_EASE = linear.name;

const getEaseOptions = () => {
  return getEaseList().map((i) => ({
    label: i.title,
    value: i.name,
    icon: i.icon,
  }));
};

const schema: AnimationSchema = {
  type: 'fade-in',
  name: '淡入',
  previewImage: 'https://cdn2.weimob.com/saas/saas-fe-sirius-orion-node/production/zh-CN/468/fade-in.gif',
  defaults: {
    opacity: DEFAULT_OPACITY,
    ease: DEFAULT_EASE,
    ...commonDefaults,
  },
  settings: [
    {
      label: '初始透明',
      name: 'opacity',
      type: AnimationSettingType.Range,
      props: {
        min: 0,
        max: 100,
        step: 1,
        precision: 0,
        unit: '%',
      },
    },
    {
      label: '曲线',
      name: 'ease',
      type: AnimationSettingType.Select,
      props: {
        options: getEaseOptions,
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
      init: (_layerData, animationSetting) => {
        const opacity = (animationSetting.t.opacity as number) || DEFAULT_OPACITY;
        const easeName = (animationSetting.t.ease as string) || DEFAULT_EASE;
        const ease = getEaseFunction(easeName);
        return {
          from: { o: opacity / 100 },
          to: { o: 1 },
          setting: {
            ease,
          },
        };
      },
    },
  ],
};

export default schema;
