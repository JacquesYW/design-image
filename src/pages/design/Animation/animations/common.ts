import { getEaseList } from '../ease';
import linear from '../ease/linear';
import { AnimationSettingType } from '../../constants';
import { AnimationSchemaSetting } from '../../interface';

export const durationDefault = {
  duration: 1,
};

export const durationSetting: AnimationSchemaSetting = {
  label: '时长',
  name: 'duration',
  type: AnimationSettingType.Number,
  default: 1,
  props: {
    min: 0,
    max: 5,
    step: 1,
    precision: 2,
    unit: '秒',
  },
};

export const delayDefault = {
  delay: 0,
};

export const delaySetting: AnimationSchemaSetting = {
  label: '延迟',
  name: 'delay',
  type: AnimationSettingType.Delay,
  default: 1,
  props: {
    min: 0,
    max: 10,
    step: 1,
    precision: 2,
    unit: '秒',
  },
};

export const loopDefault = {
  loop: false,
};

export const loopSetting: AnimationSchemaSetting = {
  label: '循环',
  name: 'loop',
  type: AnimationSettingType.Switch,
  default: false,
};

const getEaseOptions = () => {
  return getEaseList().map((i) => ({
    label: i.title,
    value: i.name,
    icon: i.icon,
  }));
};

export const easeSetting: AnimationSchemaSetting = {
  label: '曲线',
  name: 'ease',
  type: AnimationSettingType.Select,
  props: {
    options: getEaseOptions,
  },
};

export const easeDefault = {
  ease: linear.name,
};

export const commonDefaults = {
  ...durationDefault,
  ...delayDefault,
  ...loopDefault,
};

export const commonSettings: AnimationSchemaSetting[] = [durationSetting, delaySetting, loopSetting];
