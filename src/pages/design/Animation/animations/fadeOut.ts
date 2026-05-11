import { AnimationSettingType } from '../../constants';
import { AnimationSchema } from '../../interface';
import { getEaseFunction, getEaseList } from '../ease';
import linear from '../ease/linear';
import { commonDefaults, commonSettings } from './common';

const DEFAULT_EASE = linear.name;

const getEaseOptions = () => {
  return getEaseList().map((i) => ({
    label: i.title,
    value: i.name,
    icon: i.icon,
  }));
};

const schema: AnimationSchema = {
  type: 'fade-out',
  name: '淡出',
  previewImage: 'https://cdn2.weimob.com/saas/saas-fe-sirius-orion-node/production/zh-CN/468/fade-out.gif',
  defaults: {
    ease: DEFAULT_EASE,
    ...commonDefaults,
  },
  settings: [
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
      ease: 'power1.out',
      from: 0,
      to: 1,
      repeat: 0,
      yoyo: false,
      init: (_layerData, animationSetting) => {
        const easeName = (animationSetting.t.ease as string) || DEFAULT_EASE;
        const ease = getEaseFunction(easeName);
        return {
          from: { o: 1 },
          to: { o: 0 },
          setting: {
            ease,
          },
        };
      },
    },
  ],
};

export default schema;
