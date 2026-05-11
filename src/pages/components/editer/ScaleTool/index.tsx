import { Divider, Slider, Tooltip } from 'antd';
import { MAXSCALE } from '@/common/config';
import style from './index.module.less';
import classnames from 'classnames';
import { CloseOutlined, CheckOutlined } from '@ant-design/icons';
import { IVector } from '@/utils/interface';
export interface ScaleToolProps {
  open: boolean;
  isDragging: boolean;
  scale: number;
  children: React.ReactNode;
  isEdit: boolean;
  // 用于实时更新
  onChange: (scale: number) => void;
  // 用于确认更新 (如矫正等功能)
  onAfterChange: (scale: number) => void;
  reset: () => void;
  onCancle: () => void;
  onOk: () => void;
}

const ScaleTool = (props: ScaleToolProps) => {
  const { isDragging, open, scale, isEdit, reset, onChange, onAfterChange, onCancle, onOk } = props;
  const ref = useRef({
    preScale: null as number | null,
    preTranslate: null as IVector | null,
    // 是否使用编辑数据
    isOk: false,
  });

  useEffect(() => {
    if (open) {
      // 开始编辑时,默认使用编辑数据
      ref.current.isOk = true;
    } else {
      // 取消操作时,不使用编辑数据
      if (ref.current.isOk) {
        onOk();
      }
      ref.current.isOk = false;
    }
  }, [open]);
  return (
    <Tooltip
      mouseLeaveDelay={0}
      open={isDragging ? false : open}
      color="#fff"
      // arrow={false}
      arrow={true}
      placement="topLeft"
      overlayClassName={style['scale-tool-tooltip']}
      getPopupContainer={() => document.getElementById('root') as HTMLElement}
      title={
        <div
          className={style['scale-tool-clip']}
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
        >
          <div style={{ marginRight: 12 }}>缩放</div>
          <div style={{ width: 120 }}>
            <Slider
              value={scale}
              step={0.01}
              min={1}
              max={Math.max(MAXSCALE, scale)}
              tooltip={{
                formatter: (value) => value?.toFixed(2),
              }}
              onChange={(value) => {
                onChange(value as number);
              }}
              onChangeComplete={(value) => {
                onAfterChange(value as number);
              }}
            />
          </div>
          <Divider type="vertical" />
          <div
            className={classnames(style['scale-tool-clip-btn'], {
              [style['disabled']]: !isEdit,
            })}
            onClick={reset}
          >
            重置
          </div>
          <Divider type="vertical" />
          <CloseOutlined
            className={classnames(style['scale-tool-clip-btn'])}
            onClick={() => {
              ref.current.isOk = false;
              /* 取消即做的修改不保存-做重置操作 */
              reset();
              onCancle();
            }}
          />
          <Divider type="vertical" />
          <CheckOutlined
            className={classnames(style['scale-tool-clip-btn'], style['highlight'])}
            onClick={() => {
              /* 保存修改的数据 */
              onOk();
              // 执行取消的关闭
              onCancle();
            }}
          />
        </div>
      }
    >
      {props.children}
    </Tooltip>
  );
};
export default ScaleTool;
