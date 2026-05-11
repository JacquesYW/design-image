import { Slider } from 'antd';
import PanelLine from '../../PanelLine';
import { MorePanel } from '../interface';
import { EditFn } from '@/pages/design/context';
/* 
  基础能力
  当前只有 - 透明度修改能力
*/
const BasicPanel = (props: MorePanel) => {
  const { ids, layers } = props;
  const { updateLayer } = useContext(EditFn);
  const value = useMemo(
    () =>
      Math.max(
        ...layers.map((layer) => {
          return Math.floor((layer?.tr?.o || 0) * 100);
        }),
      ),
    [layers],
  );
  const changeValue = useCallback(
    (val: number, isEnd: boolean) => {
      ids.forEach((id) => {
        updateLayer(
          id,
          {
            tr: {
              o: Number((val / 100).toFixed(2)),
            },
          },
          isEnd,
        );
      });
    },
    [ids, updateLayer],
  );
  return (
    <PanelLine title="基础">
      <PanelLine.InLineItem title="不透明度" extraRight={value}>
        <Slider
          max={100}
          min={0}
          step={1}
          value={value}
          onChange={(val) => {
            changeValue(val, false);
          }}
          onChangeComplete={(val) => {
            changeValue(val, true);
          }}
        />
      </PanelLine.InLineItem>
    </PanelLine>
  );
};

export default BasicPanel;
