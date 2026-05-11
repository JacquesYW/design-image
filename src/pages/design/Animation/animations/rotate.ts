import { AnimationSettingType } from '../../constants';
import { AnimationSchema } from '../../interface';
import { getEaseFunction, getEaseList } from '../ease';
import linear from '../ease/linear';
import { commonDefaults, commonSettings } from './common';

const DEFAULT_EASE = linear.name;
const DEFAULT_SENSE = 'clockwise';
const DEFAULT_ANGLE = 45;

const getEaseOptions = () => {
  return getEaseList().map((i) => ({
    label: i.title,
    value: i.name,
    icon: i.icon,
  }));
};

const schema: AnimationSchema = {
  type: 'rotate',
  name: '旋转',
  previewImage: 'https://cdn2.weimob.com/saas/saas-fe-sirius-orion-node/production/zh-CN/468/rotate.gif',
  defaults: {
    sense: DEFAULT_SENSE,
    angle: DEFAULT_ANGLE,
    ease: DEFAULT_EASE,
    ...commonDefaults,
  },
  settings: [
    {
      label: '方向',
      name: 'sense',
      type: AnimationSettingType.Select,
      props: {
        options: [
          { label: '顺时针', value: 'clockwise' },
          { label: '逆时针', value: 'anticlockwise' },
        ],
      },
    },
    {
      label: '初始角度',
      name: 'angle',
      type: AnimationSettingType.Number,
      props: {
        min: 1,
        max: 359,
        step: 1,
        precision: 0,
        unit: '°',
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
        const sense = (animationSetting.t.sense as string) || DEFAULT_SENSE;
        const angle = (animationSetting.t.angle as number) || DEFAULT_ANGLE;
        const easeName = (animationSetting.t.ease as string) || DEFAULT_EASE;
        const ease = getEaseFunction(easeName || linear.name);
        let startAngle;
        if (sense === 'clockwise') {
          startAngle = -angle;
        } else {
          startAngle = angle;
        }

        return {
          from: { r: startAngle },
          to: { r: 0 },
          setting: {
            ease,
          },
        };
      },
    },
  ],
};

export default schema;
