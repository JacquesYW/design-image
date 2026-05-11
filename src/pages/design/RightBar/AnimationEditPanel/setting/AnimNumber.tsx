import { InputNumber } from 'antd';
import { AnimationSettingNumberProps, AnimationSettingNumberValue } from '@/pages/design/interface';
import styles from './AnimNumber.module.less';

export interface AnimNumberProps extends AnimationSettingNumberProps {
  value?: AnimationSettingNumberValue;
  onChange?: (value: AnimationSettingNumberValue | null) => void;
}

const AnimNumber: React.FC<AnimNumberProps> = (props) => {
  return (
    <div className={styles.numberInput}>
      <InputNumber
        min={props.min}
        max={props.max}
        step={props.step}
        suffix={props.unit}
        precision={props.precision}
        value={props.value}
        controls={false}
        onChange={props.onChange}
      />
    </div>
  );
};

export default AnimNumber;
