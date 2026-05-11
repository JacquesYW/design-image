import { Select } from 'antd';
import {
  AnimationSettingSelectOption,
  AnimationSettingSelectProps,
  AnimationSettingSelectValue,
} from '@/pages/design/interface';
import styles from './AnimSelect.module.less';

export interface AnimSelectProps extends AnimationSettingSelectProps {
  value?: AnimationSettingSelectValue;
  onChange?: (value: AnimationSettingSelectValue | null) => void;
}

const AnimSelect: React.FC<AnimSelectProps> = (props) => {
  const options = useMemo(() => {
    let options: AnimationSettingSelectOption[];
    if (Array.isArray(props.options)) {
      options = props.options;
    } else {
      options = props.options();
    }

    return options.map((option) => {
      if (!option.icon) {
        return {
          label: option.label,
          value: option.value,
        };
      }
      return {
        label: (
          <div className={styles.option}>
            <div className={styles.optionIcon} dangerouslySetInnerHTML={{ __html: option.icon }}></div>
            {option.label}
          </div>
        ),
        value: option.value,
      };
    });
  }, [props.options]);

  return (
    <div className={styles.selectInput}>
      <Select options={options} value={props.value} onChange={props.onChange} />
    </div>
  );
};

export default AnimSelect;
