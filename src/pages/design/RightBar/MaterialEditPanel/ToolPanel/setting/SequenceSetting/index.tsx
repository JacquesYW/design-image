import { isOverlapByIds } from '@/pages/components/editer/SelectToAndMoveableTool';
import SequenceIcon from '@/pages/components/svgIcon/SequenceIcon';
import PanelLine from '@/pages/design/RightBar/PanelLine';
import { EditData, EditFn, SourceData } from '@/pages/design/context';
import { Slider } from 'antd';
import classnames from 'classnames';
import style from './index.module.less';
import { ReactNode } from 'react';
import { Layer } from '@/pages/design/interface';
interface SequenceSettingProps {
  data: {
    ids: string[];
  };
}
const getMarks = (num: number) => {
  if (num == 0) return {};
  const res: Record<number, ReactNode> = {};
  for (let i = 0; i <= num; i++) {
    res[i] = <div className={style['vertical-divider']} />;
  }
  return res;
};
let sortIds: string[] = [];
const allIdIndexMap = new Map<string, number>();

export const getOverIds = ({ ids, layers, isMore }: { ids: string[]; layers: Layer[]; isMore: boolean }) => {
  /* 
      单选: ids.length == 1
        检测选中图层碰撞到的图层位置(切换时,做位置对调)
      多选: ids.length > 1
        检测所有选中图层, 以最底层的位置为初始值
    */
  /* 
      多选时: otherIds 代表除ids外的其他layer.id
      单选时: otherIds 代表和ids[0]有碰撞的layer.id
     */
  let otherIds: string[] = [];
  /* 
        多选时: nid 代表ids中zindex最小的id
        单选时: nid 就带ids的第一个ids[0]
      */
  let nid = ids[0];
  layers.forEach((layer, i) => {
    allIdIndexMap.set(layer.id, i);
    if (!ids.includes(layer.id)) {
      otherIds.push(layer.id);
    }
  });
  /* 
        layers未做 toReversed, 所以下标index大的展示越靠上
      */
  if (isMore) {
    // 所有选中图层,取最底层的位置为初始值
    sortIds = ids.toSorted((a, b) => {
      return (allIdIndexMap.get(a) || 0) - (allIdIndexMap.get(b) || 0);
    });
    nid = sortIds[0];
    // 和未选中的id合并,再做排序
    otherIds.push(nid);
    otherIds.sort((a, b) => {
      return (allIdIndexMap.get(a) || 0) - (allIdIndexMap.get(b) || 0);
    });
  } else {
    otherIds = isOverlapByIds([...allIdIndexMap.keys()], ids[0]);
    otherIds.sort((a, b) => {
      return (allIdIndexMap.get(a) || 0) - (allIdIndexMap.get(b) || 0);
    });
  }
  return {
    overIds: otherIds,
    value: otherIds.indexOf(nid),
    max: otherIds.length - 1,
    min: 0,
  };
};

export const getNewLayers = ({
  overIds,
  ids,
  layers,
  isMore,
  index,
  preIndex,
}: {
  overIds: string[];
  ids: string[];
  layers: Layer[];
  isMore: boolean;
  preIndex: number;
  index: number;
}) => {
  let newLayers = [] as Layer[];
  if (isMore) {
    const newOverIds = overIds.toSpliced(preIndex, 1);
    newOverIds.splice(index, 0, ...sortIds);
    newOverIds.map((id) => {
      newLayers.push(layers.find((layer) => layer.id == id) as Layer);
    });
  } else {
    const startIndex = allIdIndexMap.get(ids[0]) || 0;
    const endIndex = allIdIndexMap.get(overIds[index]) || 0;
    newLayers = layers.toSpliced(startIndex, 1);
    newLayers.splice(endIndex, 0, layers[startIndex]);
  }
  return newLayers;
};
const SequenceSetting = ({ data }: SequenceSettingProps) => {
  const sourceData = useContext(SourceData);
  const { replaceLayer } = useContext(EditFn);
  const { panelIndex } = useContext(EditData);
  const panelData = useMemo(() => sourceData.panels[panelIndex], [sourceData, panelIndex]);

  const { ids } = data;
  const [overIds, setOverIds] = useState<string[]>([]);
  const [value, setValue] = useState(0);
  const [min, setMin] = useState(0);
  const [max, setMax] = useState(0);
  const isMore = useMemo(() => ids.length > 1, [ids]);
  useEffect(() => {
    const { overIds, value, max } = getOverIds({ ids, layers: panelData.layers, isMore });
    setOverIds(overIds);
    setValue(value);
    setMax(max);
    setMin(0);
  }, [ids, panelData.layers]);

  const chanageIndex = (index: number, isEnd = true) => {
    const newLayers = getNewLayers({
      overIds,
      ids,
      layers: panelData.layers,
      isMore,
      index,
      preIndex: value,
    });
    replaceLayer('layers', newLayers, isEnd);
    setValue(index);
  };
  const canDown = useMemo(() => value > min, [value, min]),
    canUp = useMemo(() => value < max, [value, max]);
  const renderMarks = useMemo(() => getMarks(max), [max]);

  return (
    <div className={style['sequence-setting-content']}>
      <PanelLine title="图层顺序" titleClassName={style['content-title']} noLine></PanelLine>
      <div className={style['content-box']}>
        <div
          className={classnames(style['action-btn'], { [style['disabled']]: !canDown })}
          onClick={() => {
            if (canDown) {
              chanageIndex(Math.max(min, value - 1));
            }
          }}
        >
          <SequenceIcon action="down" size={20} />
        </div>
        <div className={style['content-slider']}>
          <Slider
            tooltip={{ open: false }}
            min={min}
            max={useDeferredValue(max)}
            value={value}
            disabled={max == min}
            marks={renderMarks}
            onChange={(v) => {
              chanageIndex(v, false);
            }}
            onChangeComplete={(v) => {
              chanageIndex(v);
            }}
          />
        </div>
        <div
          className={classnames(style['action-btn'], { [style['disabled']]: !canUp })}
          onClick={() => {
            if (canUp) {
              chanageIndex(Math.min(max, value + 1));
            }
          }}
        >
          <SequenceIcon action="up" size={20} />
        </div>
      </div>
    </div>
  );
};

export default SequenceSetting;
