import { Button } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { AnimationSchema } from '@/pages/design/interface';
import AnimationSelector from './AnimationSelector';
import styles from './AnimationReplacer.module.less';

export interface AnimationReplacerProps {
  selected?: string;
  onSelect: (animation: AnimationSchema) => void;
  onRemove: () => void;
}

const AnimationReplacer: React.FC<AnimationReplacerProps> = (props) => {
  const handleSelect = (animation: AnimationSchema) => {
    if (props.onSelect) {
      props.onSelect(animation);
    }
  };

  const handleRemove = () => {
    if (props.onRemove) {
      props.onRemove();
    }
  };

  return (
    <div className={styles.animReplacer}>
      <AnimationSelector selected={props.selected} onSelect={handleSelect} />
      <Button className={styles.animReplacerRemove} icon={<DeleteOutlined />} onClick={handleRemove}>
        删除动画
      </Button>
    </div>
  );
};

export default AnimationReplacer;
