import { EditFn } from '@/pages/design/context';
import style from './index.module.less';
import { QrcodeOutlined } from '@ant-design/icons';

const ToolPanel = () => {
  const { addQRCodeLayer } = useContext(EditFn);
  const toolList = [
    {
      title: '二维码',
      desc: '生成二维码在设计中使用',
      icon: () => <QrcodeOutlined />,
      onclick: () => {
        addQRCodeLayer();
      },
    },
  ];
  return (
    <div className={style['tool-panel']}>
      <div className={style['tool-container']}>
        {toolList.map((item, index) => {
          return (
            <div className={style['tool-item']} key={index} onClick={item.onclick}>
              <div className={style['item-icon']}>{item.icon()}</div>
              <div>
                <div className={style['item-title']}>{item.title}</div>
                <div className={style['item-desc']}>{item.desc}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ToolPanel;
