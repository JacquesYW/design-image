import Fn from '@/utils/utils';
import CustomInputNumber from '../CustomInputNumber';
import { Tooltip } from 'antd';
import style from './index.module.less';
import classnames from 'classnames';

type LateralDragProps = {
  icon?: React.ReactNode;
  disabled?: boolean;
  title: string;
  value: number | undefined | null;
  placeholder?: string;
  min?: number;
  max?: number;
  precision: number;
  onBeforeFocus?: () => void;
  onChange?: (num: number, isEnd: boolean) => void;
  onComplate?: (num: number, isEnd: boolean) => void;
};

const LateralDrag = (props: LateralDragProps) => {
  const { precision, min, max, disabled, placeholder, onBeforeFocus, onChange, onComplate } = props;
  const [focus, setFocus] = useState(false);
  const [value, setValue] = useState(props.value);
  const ref = useRef({
    input: null as HTMLInputElement | null,
    isMove: false,
    x: 0,
  });
  useEffect(() => {
    setValue(props.value);
  }, [props.value]);
  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    ref.current.x = e.clientX;
    document.body.style.cursor = 'ew-resize';
  };
  const onMouseMove = (e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const moveX = e.clientX - ref.current.x;
    if (Math.abs(moveX) > 2) {
      ref.current.isMove = true;
      let val = (value || 0) + moveX / Math.pow(10, precision);
      val = Fn.verify.isNotEmpty(min) ? Math.max(val, min as number) : val;
      val = Fn.verify.isNotEmpty(max) ? Math.min(val, max as number) : val;
      onChange && onChange(val, false);
      setValue(val);
    }
  };
  const onMouseUp = (e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (ref.current.isMove) {
      const moveX = e.clientX - ref.current.x;
      ref.current.isMove = false;
      let val = (value || 0) + moveX / Math.pow(10, precision);
      val = Fn.verify.isNotEmpty(min) ? Math.max(val, min as number) : val;
      val = Fn.verify.isNotEmpty(max) ? Math.min(val, max as number) : val;
      onComplate && onComplate(val, true);
    } else {
      /* focus时,有range文本, 浏览器就不会真实触发focus事件, 所以这里需要回调下函数, 由外部控制 */
      onBeforeFocus && onBeforeFocus();
      ref.current.input?.focus();
      setFocus(true);
    }
    document.body.style.cursor = 'auto';
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  };
  return (
    <Tooltip mouseLeaveDelay={0} title={props.title}>
      <div
        className={classnames(style['lateral-drag-container'], {
          [style['no-padding']]: !('icon' in props),
        })}
      >
        {props.icon ? (() => props.icon)() : null}
        <CustomInputNumber
          ref={(dom) => {
            if (dom) {
              ref.current.input = dom;
            }
          }}
          disabled={disabled}
          value={value}
          min={min}
          max={max}
          variant="borderless"
          controls={false}
          precision={precision}
          placeholder={placeholder}
          onBlur={() => {
            setFocus(false);
          }}
          onChange={(val) => {
            setValue((val as number) || 0);
            onComplate && onComplate((val as number) || 0, true);
          }}
        />
        <div
          style={{
            pointerEvents: focus ? 'none' : 'auto',
          }}
          className={classnames(style['lateral-drag-bar'], {
            [style['diabled']]: disabled,
          })}
          onMouseDown={(e) => {
            if (!disabled) {
              onMouseDown(e);
            }
          }}
        ></div>
      </div>
    </Tooltip>
  );
};

export default LateralDrag;
