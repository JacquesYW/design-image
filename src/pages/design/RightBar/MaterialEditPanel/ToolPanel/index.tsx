import { ShrinkHorizontal, Lock, Unlock, LayerPosition, Duplicate, DeleteOutlined } from '@/pages/components/svgIcon';
import { Dropdown, Popover, Tooltip } from 'antd';
import style from './index.module.less';
import { MorePanel } from '../interface';
import { Flip, Layer } from '@/pages/design/interface';
import { EditFn } from '@/pages/design/context';
import classnames from 'classnames';
import PositionSetting from './setting/PositionSetting';
import SequenceSetting from './setting/SequenceSetting';
/* 
  @description: 工具栏
  选择图层后,一直存在 
  复制/翻转/删除/锁/分层等能力
  可视化位置和宽高信息
*/
const ToolPanel = (props: MorePanel<Layer> & { sw: number; sh: number }) => {
  const { updateLayer, duplicateLayers, deleteLayer, lockOrUnLockLayer } = useContext(EditFn);
  const { sw, sh, ids, layers } = props;
  const [positionPopoverOpen, setPositionPopoverOpen] = useState(false);

  const isLocked = useMemo(() => layers?.every((layer) => layer.isLocked), [layers]);
  return (
    <div className={style['tool-panel']}>
      <Popover
        placement="bottom"
        trigger="click"
        arrow={false}
        open={positionPopoverOpen}
        onOpenChange={() => {
          if (!isLocked) {
            setPositionPopoverOpen(!positionPopoverOpen);
          }
        }}
        title={null}
        content={
          <>
            <PositionSetting data={{ ids, sw, sh }} hide={() => setPositionPopoverOpen(false)} />
            <SequenceSetting data={{ ids }} />
          </>
        }
      >
        <div className={classnames(style['tool-panel-item'], { [style['disabled']]: isLocked })}>
          <Tooltip mouseLeaveDelay={0} mouseEnterDelay={1} title="图层位置">
            <span>
              <LayerPosition size={20} />
            </span>
          </Tooltip>
        </div>
      </Popover>
      <Dropdown
        overlayClassName={style['dropdown-box']}
        disabled={isLocked}
        menu={{
          items: [
            {
              label: '垂直翻转',
              key: 'vertical',
            },
            {
              label: '水平翻转',
              key: 'horizontal',
            },
          ],
          onClick: ({ key }) => {
            ids.forEach((id, index) => {
              const flip = {} as Flip;
              switch (key) {
                case 'vertical':
                  flip.v = !layers[index]?.flip?.v;
                  break;
                case 'horizontal':
                  flip.h = !layers[index]?.flip?.h;
                  break;
                default:
                  break;
              }
              updateLayer(id, {
                flip,
              });
            });
          },
        }}
        trigger={['click']}
      >
        <div className={classnames(style['tool-panel-item'], { [style['disabled']]: isLocked })}>
          <Tooltip mouseLeaveDelay={0} title="翻转">
            <span>
              <ShrinkHorizontal size={20} />
            </span>
          </Tooltip>
        </div>
      </Dropdown>
      {/* 
        锁定后功能限制: 
          1. 位置/大小(文字可以修改size)/旋转
          2. 复制/删除/翻转
          3. 图层层级调整
          4. 只能单个选中锁定的图层,无法和其他图层一起选中 (做互斥操作)
          5. 框选需要过滤掉锁定图层
      */}
      <div
        className={style['tool-panel-item']}
        onClick={() => {
          lockOrUnLockLayer(layers?.map((layer) => layer.id) || [], !isLocked);
        }}
      >
        <Tooltip mouseLeaveDelay={0} title={isLocked ? '解锁' : '锁定'}>
          <span>{isLocked ? <Lock size={20} color="var(--color-red-600)" /> : <Unlock size={20} />}</span>
        </Tooltip>
      </div>
      <div
        className={classnames(style['tool-panel-item'], { [style['disabled']]: isLocked })}
        onClick={() => {
          if (!isLocked) {
            duplicateLayers(ids);
          }
        }}
      >
        <Tooltip mouseLeaveDelay={0} title="创建副本">
          <span>
            <Duplicate size={20} />
          </span>
        </Tooltip>
      </div>
      <div
        className={classnames(style['tool-panel-item'], { [style['disabled']]: isLocked })}
        onClick={() => {
          if (!isLocked) {
            deleteLayer(ids);
          }
        }}
      >
        <Tooltip mouseLeaveDelay={0} title="删除">
          <span>
            <DeleteOutlined size={20} />
          </span>
        </Tooltip>
      </div>
    </div>
  );
};

export default ToolPanel;
