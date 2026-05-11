import { Modal } from 'antd';
import photos from '@/assets/images/photos';
import style from './index.module.less';
import circle from '@/assets/images/tempImg/one/circle.png';

type Image = {
  url: string;
  w: number;
  h: number;
};
interface ImageListModalProps {
  onSelect: (image: Image) => void;
}
const ImageListModal = (props: ImageListModalProps) => {
  const modal = Modal.info({
    title: '选择图片',
    icon: <div></div>,
    width: '60vw',
    maskClosable: true,
    wrapClassName: style['image-list-modal'],
    footer: null,
    content: (
      <div className={style['image-list-container']}>
        {[circle, ...photos].map((url, index) => (
          <div
            key={index}
            className={style['image-list-item']}
            onClick={(e) => {
              const imgDom = e.currentTarget.querySelector('img') as HTMLImageElement;
              modal.destroy();
              props.onSelect({
                url,
                w: imgDom.naturalWidth || 0,
                h: imgDom.naturalHeight || 0,
              });
            }}
          >
            <img src={url} alt="" />
          </div>
        ))}
      </div>
    ),
  });
};

export default ImageListModal;
