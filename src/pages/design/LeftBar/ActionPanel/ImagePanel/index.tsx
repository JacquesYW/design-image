import { EditFn } from '@/pages/design/context';
import style from './index.module.less';
import photos from '@/assets/images/photos';
// 测试透明穿透使用
import circle from '@/assets/images/tempImg/one/circle.png';

const ImagePanel = () => {
  const { addImageLayers } = useContext(EditFn);
  return (
    <div className={style['image-panel']}>
      <div className={style['image-panel-container']}>
        {[circle, ...photos].map((url, index) => {
          return (
            <div
              key={'photo' + index}
              className={style['image-panel-item']}
              onClick={(e) => {
                const imgDom = e.currentTarget.querySelector('img') as HTMLImageElement;
                addImageLayers([{ url, w: imgDom.naturalWidth, h: imgDom.naturalHeight }]);
              }}
            >
              <img src={url} alt="" />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ImagePanel;
