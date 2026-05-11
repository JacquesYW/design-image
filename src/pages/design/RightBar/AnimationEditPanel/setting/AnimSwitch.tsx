import { Switch } from 'antd';
import { AnimationSettingSwitchProps, AnimationSettingSwitchValue } from '@/pages/design/interface';
import styles from './AnimSwitch.module.less';

export interface AnimSwitchProps extends AnimationSettingSwitchProps {
  value?: AnimationSettingSwitchValue;
  onChange?: (value: AnimationSettingSwitchValue | null) => void;
}

const AnimSwitch: React.FC<AnimSwitchProps> = (props) => {
  return (
    <div className={styles.switchInput}>
      <Switch checked={props.value} onChange={props.onChange} />
    </div>
  );
};

export default AnimSwitch;
