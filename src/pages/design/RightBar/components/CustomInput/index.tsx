import { Input, InputProps, InputRef } from 'antd';

const CustomInput = (props: InputProps & { ref?: React.Ref<InputRef> }) => {
  return (
    <Input
      {...props}
      ref={props.ref}
      onCopy={(e) => e.stopPropagation()}
      onCut={(e) => e.stopPropagation()}
      onPaste={(e) => e.stopPropagation()}
    />
  );
};

export default CustomInput;

export const BlurInput = <T,>(
  props: Omit<InputProps, 'onBlur'> & {
    cacheData?: T;
    onBlur: (e: React.FocusEvent<HTMLInputElement, Element>, cacheData?: T) => void;
  } & {
    ref?: React.Ref<InputRef>;
  },
) => {
  const { cacheData, onBlur, ...rest } = props;
  const cacheRef = useRef<T>();
  const [val, setVal] = useState(props.value);
  useEffect(() => {
    setVal(props.value);
  }, [props]);
  return (
    <CustomInput
      {...rest}
      value={val}
      onFocus={(e) => {
        if (cacheData) {
          cacheRef.current = cacheData;
        }
        props.onFocus && props.onFocus(e);
      }}
      onChange={(e) => {
        if (props.onChange) {
          props.onChange(e);
        } else {
          setVal(e.target.value);
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
