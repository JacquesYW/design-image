import { Button, Popover } from 'antd';
import { DownOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { AnimationSchema, LayerAnimation } from '@/pages/design/interface';
import { getAnimationSchema, getCommonSettings } from '@/pages/design/Animation';
import AnimationReplacer from './AnimationReplacer';
import AnimationItemSetting from './AnimationItemSetting';
import styles from './AnimationItem.module.less';

export interface AnimationItemProps {
  data: LayerAnimation;
  onChange?: (data: DeepPartial<LayerAnimation>, replace: boolean) => void;
  onRemove?: () => void;
  onPreview?: () => void;
}

const AnimationItem: React.FC<AnimationItemProps> = (props) => {
  const [animationReplacerOpen, setAnimationReplacerOpen] = useState(false);

  const currentAnimationSchema = useMemo(() => {
    if (props.data && props.data.ty) {
      return getAnimationSchema(props.data.ty);
    }
    return null;
  }, [props.data]);

  const handleAnimationReplacerOpenChange = useCallback((open: boolean) => {
    setAnimationReplacerOpen(open);
  }, []);

  const handleReplaceAnimation = useCallback(
    (animationSchema: AnimationSchema) => {
      setAnimationReplacerOpen(false);
      const newType = animationSchema.type;
      if (newType === currentAnimationSchema?.type) {
        return;
      }
      if (!props.onChange) {
        return;
      }
      const newData = { ...props.data.t } as unknown as DeepPartial<LayerAnimation['t']>;
      const reservedFields: string[] = getCommonSettings().map((i) => i.name);
      Object.keys(newData).forEach((k) => {
        if (!reservedFields.includes(k)) {
          delete newData[k];
        }
      });
      props.onChange(
        {
          ty: animationSchema.type,
          t: { ...animationSchema.defaults, ...newData },
        },
        true,
      );
    },
    [currentAnimationSchema, props.data, props.onChange],
  );

  const handleRemoveAnimation = useCallback(() => {
    setAnimationReplacerOpen(false);
    if (props.onRemove) {
      props.onRemove();
    }
  }, [props.onRemove]);

  const handleSettingChange = useCallback(
    (data: DeepPartial<LayerAnimation>) => {
      if (props.onChange) {
        props.onChange(
          {
            t: data,
          },
          false,
        );
      }
    },
    [props.onChange],
  );

  const handlePreview = useCallback(() => {
    if (props.onPreview) {
      props.onPreview();
    }
  }, [props.onPreview]);

  const renderAnimationReplacer = useCallback(() => {
    return (
      <AnimationReplacer
        selected={currentAnimationSchema?.name}
        onSelect={handleReplaceAnimation}
        onRemove={handleRemoveAnimation}
      />
    );
  }, [currentAnimationSchema, handleReplaceAnimation, handleRemoveAnimation]);

  if (!currentAnimationSchema) {
    return null;
  }

  return (
    <div className={styles.animItem}>
      <Popover
        placement="bottom"
        trigger={['click']}
        overlayClassName={styles.animItemReplacer}
        open={animationReplacerOpen}
        onOpenChange={handleAnimationReplacerOpenChange}
        content={renderAnimationReplacer}
      >
        <div className={styles.animItemAnim}>
          <img className={styles.animItemAnimPreview} src={currentAnimationSchema.previewImage} />
          <div className={styles.animItemAnimName}>{currentAnimationSchema.name}</div>
          <DownOutlined className={styles.animItemAnimMore} />
        </div>
      </Popover>
      <div className={styles.animItemSettings}>
        <AnimationItemSetting data={props.data.t} schema={currentAnimationSchema} onChange={handleSettingChange} />
      </div>
      <Button className={styles.animItemPreview} onClick={handlePreview} icon={<PlayCircleOutlined />}>
        预览动画
      </Button>
    </div>
  );
};

export default AnimationItem;
