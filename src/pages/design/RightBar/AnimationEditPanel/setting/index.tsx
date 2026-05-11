import { AnimationSettingType } from '@/pages/design/constants';
import AnimNumber from './AnimNumber';
import AnimSwitch from './AnimSwitch';
import AnimSelect from './AnimSelect';
import AnimRange from './AnimRange';

const controls: Map<string, React.ElementType> = new Map();

controls.set(AnimationSettingType.Number, AnimNumber);
controls.set(AnimationSettingType.Switch, AnimSwitch);
controls.set(AnimationSettingType.Select, AnimSelect);
controls.set(AnimationSettingType.Range, AnimRange);
controls.set(AnimationSettingType.Delay, AnimNumber);

export const renderControl = (type: string, props: object) => {
  const Control = controls.get(type);
  if (Control) {
    return <Control {...props} />;
  }
  return null;
};
