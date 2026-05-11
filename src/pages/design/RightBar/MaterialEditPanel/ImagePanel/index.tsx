import { EditData, EditFn } from '@/pages/design/context';
import style from '../../index.module.less';
import { EditTypeEnum } from '@/common/config';
import manageFactory from '@/utils/manageFactory';
import PanelLine from '../../PanelLine';
import ImageListModal from '@/pages/components/imageListModal';
import { SinglePanel } from '../interface';
import { ImageLayer } from '@/pages/design/interface';
import Fn from '@/utils/utils';

const ImagePanel = (props: SinglePanel<ImageLayer>) => {
  const { editParam, setEditParam } = useContext(EditData);
  const { updateLayer } = useContext(EditFn);
  const { id /* layer */ } = props;

  return (
    <>
      <PanelLine title="图片">
        <div
          className={style['panel-action-btn']}
          onClick={() => {
            ImageListModal({
              onSelect: (img) => {
                const layerData = manageFactory.getLayerDataById(id);
                const w = layerData?.w as number;
                const h = layerData?.h as number;
                /* 
                根据图片实际宽高比,和展示框宽高比
                计算偏移量,使用裁剪值承载
              */
                const { maxw, maxh } = Fn.calc.whScaleOnly(img.w, img.h, w, h);
                updateLayer(id, {
                  p: img.url,
                  imgW: maxw,
                  imgH: maxh,
                  clip: {
                    x: -(maxw - w) / 2,
                    y: -(maxh - h) / 2,
                  },
                });
              },
            });
          }}
        >
          替换图片
        </div>
        <div
          className={style['panel-action-btn']}
          onClick={() => {
            // 只有选中单个图层时,才会展示图片裁剪,这边不做判断,取第一个(当前选中的图层)
            setEditParam({
              id: editParam.id ? undefined : id,
              type: editParam.type ? undefined : EditTypeEnum.MATERIALIMAGECLIP,
            });
          }}
        >
          裁剪
        </div>
      </PanelLine>
    </>
  );
};

export default ImagePanel;
