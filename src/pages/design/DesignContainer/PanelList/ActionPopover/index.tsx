import { Divider, Input, Popover } from 'antd';
import style from './index.module.less';
import classnames from 'classnames';
import { EditFn } from '@/pages/design/context';
import { EditOutlined } from '@ant-design/icons';
interface ActionPopoverProps {
  children: React.ReactNode;
  // 画板下标(按钮对应的下标)
  index: number;
  // 画板名称
  nm: string;
}
const ActionPopover = (props: ActionPopoverProps) => {
  const { addNewPanelByIndex, deletePanelByIndex, duplicatePanelByIndex, updatePanel } = useContext(EditFn);
  const { index, nm } = props;
  const [name, setName] = useState(nm);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (open && nm !== name) {
      setName(nm);
    }
  }, [nm, open]);
  return (
    <Popover
      title={null}
      zIndex={10002}
      open={open}
      onOpenChange={(open) => {
        setOpen(open);
      }}
      arrow={false}
      placement="topLeft"
      trigger={'click'}
      overlayClassName={style['panel-list-item-popover']}
      content={
        <>
          <div className={style['popover-nm-input']} onKeyDown={(e) => e.stopPropagation()}>
            <Input.TextArea
              placeholder="添加画板名称"
              variant="borderless"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={(e) => {
                updatePanel(index, { nm: e.target.value });
              }}
              maxLength={32}
              autoSize={{ minRows: 1, maxRows: 2 }}
            />
            <div className={style['popover-nm-input-text-show']}>
              {name || '添加画板名称'}
              <EditOutlined />
            </div>
          </div>
          <Divider style={{ margin: '8px 0px' }} />
          <div onClick={() => setOpen(false)}>
            <div className={classnames(style['popover-list-item'])} onClick={() => addNewPanelByIndex(index)}>
              添加画板
            </div>
            <div className={classnames(style['popover-list-item'])} onClick={() => duplicatePanelByIndex(index)}>
              <span>创建副本</span>
              <span className={style['hint']}>Ctrl + D</span>
            </div>
            <div className={classnames(style['popover-list-item'])} onClick={() => deletePanelByIndex(index)}>
              <span>删除画板</span>
              <span className={style['hint']}>DEL</span>
            </div>
          </div>
        </>
      }
    >
      {/* <div
        className={style['panel-popover-position']}
        style={{
          top: clientXY.y,
          left: clientXY.x,
        }}
      ></div> */}
      {props.children}
    </Popover>
  );
};

export default ActionPopover;
