import { Form, FormProps } from 'antd';
import { AnimationSchema, LayerAnimation } from '@/pages/design/interface';
import styles from './AnimationItemSetting.module.less';
import { renderControl } from '../setting';

export interface AnimationItemSettingProps {
  data: LayerAnimation['t'];
  schema: AnimationSchema;
  onChange?: (data: DeepPartial<LayerAnimation>) => void;
}

const AnimationItemSetting: React.FC<AnimationItemSettingProps> = (props) => {
  const [form] = Form.useForm();
  const type = useMemo(() => props.schema.type, [props.schema.type]);

  const settings = useMemo(() => {
    return [...props.schema.settings];
  }, [props.schema.settings]);

  const handleChange = useCallback<Exclude<FormProps['onValuesChange'], undefined>>(
    (_changed, values) => {
      if (props.onChange) {
        props.onChange(values);
      }
    },
    [props.onChange],
  );

  const FormItems = useMemo(() => {
    return settings.map((setting, index) => {
      const key = [type, index, setting.type].join('-');
      return (
        <Form.Item className={styles.animSettingItem} key={key} label={setting.label} name={setting.name}>
          {renderControl(setting.type, setting.props || {})}
        </Form.Item>
      );
    });
  }, [type, settings]);

  useEffect(() => {
    const values = { ...form.getFieldsValue() };
    Object.keys(values).forEach((k) => (values[k] = undefined));
    form.setFieldsValue(values);
  }, [type]);

  useEffect(() => {
    form.setFieldsValue(props.data);
  }, [props.data]);

  return (
    <Form className={styles.animSetting} form={form} onValuesChange={handleChange}>
      {FormItems}
    </Form>
  );
};

export default AnimationItemSetting;
