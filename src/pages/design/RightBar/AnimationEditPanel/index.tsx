import _ from 'lodash';
import { Popover } from 'antd';
import { PlayCircleOutlined, PlusOutlined } from '@ant-design/icons';
import manageFactory from '@/utils/manageFactory';
import { EditData, EditFn, SourceData } from '../../context';
import { AnimationSchema, Layer, LayerAnimation } from '../../interface';
import AnimationItem from './part/AnimationItem';
import AnimationSelector from './part/AnimationSelector';
import styles from './index.module.less';
import { getCommonDefaults } from '../../Animation';
import AnimationContext from '../../Animation/display/AnimationContext';
import { DeleteOutlined } from '@/pages/components/svgIcon';
import PanelLine from '../PanelLine';
import Fn from '@/utils/utils';

export interface AnimationEditPanelProps {}

const AnimationList: React.FC<AnimationEditPanelProps> = () => {
  const { previewLayerAnimation, previewLayerAnimationGroup } = useContext(AnimationContext);
  const sourceData = useContext(SourceData);
  const { updateLayerAnimations } = useContext(EditFn);
  const { selectLayers } = useContext(EditData);

  const multiple = selectLayers.length > 1;
  const currentLayerId = useMemo(() => {
    return multiple ? null : selectLayers[0];
  }, [multiple, selectLayers]);
  const currentLayerData = useMemo(() => {
    if (multiple || !currentLayerId) return null;
    return _.result(sourceData, manageFactory.getPathById(currentLayerId)) as Layer;
  }, [multiple, currentLayerId, sourceData]);

  const [prewviewAnimationIdx, setPrewviewAnimationIdx] = useState<null | number>(null);

  const animations = useMemo(() => {
    return currentLayerData?.anm || [];
  }, [currentLayerData]);

  const [animationSelectorOpen, setAnimationSelectorOpen] = useState(false);
  // idx 不传代表删除全部
  const removeAnimation = useCallback(
    (idx?: number) => {
      if (!currentLayerId) {
        return;
      }
      const path = manageFactory.getPathById(currentLayerId);
      const newAnimations = animations.filter((_animation, index) => Fn.verify.isNotEmpty(idx) && index !== idx);
      updateLayerAnimations(path, newAnimations as DeepPartial<LayerAnimation>[]);
    },
    [currentLayerId, animations, updateLayerAnimations],
  );

  const modifyAnimation = useCallback(
    (idx: number, data: DeepPartial<LayerAnimation>, replace: boolean) => {
      if (!currentLayerId) {
        return;
      }
      const path = manageFactory.getPathById(currentLayerId);
      const newAnimations = animations.map((animation, index) => {
        if (idx === index) {
          if (replace) {
            return data;
          }
          return {
            ...animation,
            ...data,
            t: {
              ...animation.t,
              ...data.t,
            },
          };
        }
        return animation;
      });
      updateLayerAnimations(path, newAnimations as DeepPartial<LayerAnimation>[]);
    },
    [currentLayerId, animations, updateLayerAnimations],
  );

  const addAnimation = useCallback(
    (animationSchema: AnimationSchema) => {
      if (!currentLayerId) {
        return;
      }
      const path = manageFactory.getPathById(currentLayerId);
      const newAnim: LayerAnimation = {
        ty: animationSchema.type,
        t: {
          ...getCommonDefaults(),
          ...animationSchema.defaults,
        },
      };
      updateLayerAnimations(path, [...animations, newAnim] as DeepPartial<LayerAnimation>[]);

      setPrewviewAnimationIdx(animations.length);
    },
    [currentLayerId, animations, updateLayerAnimations],
  );

  const handleAddAnimation = useCallback(
    (animationSchema: AnimationSchema) => {
      addAnimation(animationSchema);
      setAnimationSelectorOpen(false);
    },
    [addAnimation],
  );

  const handleModifyAnimation = useCallback(
    (idx: number, data: DeepPartial<LayerAnimation>, replace: boolean) => {
      modifyAnimation(idx, data, replace);
    },
    [modifyAnimation],
  );

  const handleRemoveAnimation = useCallback(
    (idx: number) => {
      removeAnimation(idx);
    },
    [removeAnimation],
  );

  const handleAnimationSelectorOpenChange = useCallback((open: boolean) => {
    setAnimationSelectorOpen(open);
  }, []);

  const handleAnimationPreview = useCallback(
    (idx: number) => {
      if (currentLayerId && previewLayerAnimation) {
        previewLayerAnimation(currentLayerId, idx);
      }
    },
    [previewLayerAnimation, currentLayerId],
  );

  const handleAnimationPreviewGroup = useCallback(() => {
    if (currentLayerId && previewLayerAnimationGroup) {
      previewLayerAnimationGroup(currentLayerId);
    }
  }, [previewLayerAnimationGroup, currentLayerId]);

  const renderAnimationSelector = useCallback(() => {
    return <AnimationSelector onSelect={handleAddAnimation} />;
  }, [handleAddAnimation]);

  useEffect(() => {
    setPrewviewAnimationIdx(null);
    if (!previewLayerAnimation || !currentLayerId || prewviewAnimationIdx === null) {
      return;
    }
    setTimeout(() => {
      previewLayerAnimation(currentLayerId, prewviewAnimationIdx);
    }, 60);
  }, [previewLayerAnimation, currentLayerId, prewviewAnimationIdx]);

  if (multiple) {
    return <>不支持同时修改多个图层动画</>;
  }

  return (
    <div className={styles.animEdit}>
      <PanelLine
        noLine
        title="动画效果"
        extraRender={() =>
          animations.length > 0 ? (
            <div className={styles.animEditHeadRight}>
              <PlayCircleOutlined size={16} className={styles.HeadRightAction} onClick={handleAnimationPreviewGroup} />
              <DeleteOutlined
                size={16}
                className={styles.HeadRightAction}
                onClick={() => {
                  removeAnimation();
                }}
              />
            </div>
          ) : null
        }
      ></PanelLine>
      <div className={styles.animEditBody}>
        <div className={styles.animEditList}>
          {animations.map((animation, animationIndex) => (
            <AnimationItem
              key={animationIndex}
              data={animation}
              onChange={(data, repalce) => handleModifyAnimation(animationIndex, data, repalce)}
              onRemove={() => handleRemoveAnimation(animationIndex)}
              onPreview={() => handleAnimationPreview(animationIndex)}
            />
          ))}
        </div>
        <Popover
          placement="bottom"
          trigger={['click']}
          open={animationSelectorOpen}
          onOpenChange={handleAnimationSelectorOpenChange}
          content={renderAnimationSelector}
        >
          <div className={styles.animEditAdd}>
            <PlusOutlined className={styles.animEditAddIcon}></PlusOutlined>
            <div className={styles.animEditAddLabel}>添加动画</div>
          </div>
        </Popover>
      </div>
      <div className={styles.animEditFoot}></div>
    </div>
  );
};

export default AnimationList;
