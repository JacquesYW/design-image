import { getAnimationSchemaList } from '@/pages/design/Animation';
import styles from './AnimationSelector.module.less';
import { AnimationSchema } from '@/pages/design/interface';
import classNames from 'classnames';

export interface AnimationSelectorProps {
  selected?: string;
  onSelect: (animation: AnimationSchema) => void;
}

const AnimationSelector: React.FC<AnimationSelectorProps> = (props) => {
  const animations = useMemo(() => {
    return getAnimationSchemaList();
  }, []);

  const handleSelect = (animation: AnimationSchema) => {
    if (props.selected && animation.name === props.selected) {
      return;
    }
    if (props.onSelect) {
      props.onSelect(animation);
    }
  };

  return (
    <div className={styles.animSelector}>
      {animations.map((animation) => (
        <div
          className={classNames(styles.animSelectorItem, props.selected === animation.name ? styles.isSelected : '')}
          key={animation.type}
          onClick={() => handleSelect(animation)}
        >
          <img className={styles.animSelectorItemPreview} src={animation.previewImage} />
          <div className={styles.animSelectorItemLabel}>{animation.name}</div>
        </div>
      ))}
    </div>
  );
};

export default AnimationSelector;
