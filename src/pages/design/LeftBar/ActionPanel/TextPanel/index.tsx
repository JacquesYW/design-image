import style from './index.module.less';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { EditFn } from '@/pages/design/context';

const TextPanel = () => {
  const { addTextLayer } = useContext(EditFn);
  return (
    <div className={style['text-panel']}>
      <Button icon={<PlusOutlined />} block onClick={() => addTextLayer()}>
        添加文字
      </Button>
    </div>
  );
};

export default TextPanel;
