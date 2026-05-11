import { InputNumber, Slider } from 'antd';
import { AnimationSettingRangeProps, AnimationSettingRangeValue } from '@/pages/design/interface';
import styles from './AnimRange.module.less';

export interface AnimRangeProps extends AnimationSettingRangeProps {
  value?: AnimationSettingRangeValue;
  onChange?: (value: AnimationSettingRangeValue | null) => void;
}

const AnimRange: React.FC<AnimRangeProps> = (props) => {
  return (
    <div className={styles.rangeInput}>
      <div className={styles.rangeInputSlider}>
        <Slider min={props.min} max={props.max} step={props.step} value={props.value} onChange={props.onChange} />
      </div>
      <div className={styles.rangeInputNumber}>
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
    </div>
  );
};

export default AnimRange;
