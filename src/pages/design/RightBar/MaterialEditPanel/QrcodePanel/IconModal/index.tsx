import qrIconList from '@/assets/images/qr-icons';
import clearImg from '@/assets/images/common/clear.png';
import style from './index.module.less';
import classnames from 'classnames';
import { EditFn } from '@/pages/design/context';
import PanelLine from '../../../PanelLine';
import { CloseOutlined } from '@ant-design/icons';

interface IconModalProps {
  id: string;
  icon: string | undefined | null;
  hide: () => void;
}

const IconModal = (props: IconModalProps) => {
  const { updateLayer } = useContext(EditFn);
  const { id, icon, hide } = props;
  const handleSelectIcon = (icon: string) => {
    updateLayer(id, {
      icon,
    });
  };
  return (
    <div className={style['qrcode-icon-modal']}>
      <PanelLine
        title="标志"
        titleClassName={style['content-title']}
        noLine
        extraRender={() => (
          <div onClick={hide} className={style['cursor-pointer']}>
            <CloseOutlined />
          </div>
        )}
      ></PanelLine>
      <div className={style['qrcode-icon-list']}>
        <div className={style['qrcode-icon-item']} onClick={() => handleSelectIcon('')}>
          <img src={clearImg} />
        </div>
        {Object.entries(qrIconList).map(([key, value]) => (
          <div
            className={classnames(style['qrcode-icon-item'], {
              [style['active']]: value === icon,
            })}
            key={key}
            onClick={() => handleSelectIcon(value)}
          >
            <img src={value} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default IconModal;
