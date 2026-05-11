import Fn from '@/utils/utils';
import { InputNumber, InputNumberProps } from 'antd';

const CustomInputNumber = forwardRef((props: InputNumberProps, ref: React.Ref<HTMLInputElement>) => {
  const value = Fn.verify.isEmpty(props.precision)
    ? props.value
    : Fn.calc.toFixed((props.value as number) || 0, props.precision);
  return (
    <InputNumber
      {...props}
      value={value}
      ref={ref}
      onCopy={(e) => e.stopPropagation()}
      onCut={(e) => e.stopPropagation()}
      onPaste={(e) => e.stopPropagation()}
    />
  );
});

export default CustomInputNumber;

export const BlurInputNumber = <T,>(
  props: Omit<InputNumberProps, 'onBlur'> & {
    cacheData?: T;
    onBlur: (e: React.FocusEvent<HTMLInputElement, Element>, cacheData?: T) => void;
  } & { ref?: React.Ref<HTMLInputElement> },
) => {
  const { cacheData, onBlur, ...rest } = props;
  const cacheRef = useRef<T>();
  const [val, setVal] = useState(props.value);
  useEffect(() => {
    setVal(props.value);
  }, [props]);
  return (
    <CustomInputNumber
      {...rest}
      ref={props.ref}
      value={val}
      onFocus={(e) => {
        if (cacheData) {
          cacheRef.current = cacheData;
        }
        props.onFocus && props.onFocus(e);
      }}
      onChange={(val) => {
        if (props.onChange) {
          props.onChange(val);
        } else {
          setVal(val);
        }
      }}
      onBlur={(e) => {
        if (onBlur) {
          onBlur(e, cacheRef.current);
        }
      }}
    />
  );
};
