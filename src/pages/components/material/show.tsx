import { Fragment } from 'react';
import { LayerType } from '@/common/config';
import { Layer } from '@/pages/design/interface';
import Group_Material_Show from './Group/show';
import QRCode_Material_Show from './QRCode/show';
import Text_Material_Show from './Text/show';
import Image_Material_Show from './Image/show';

interface MaterialRenderProps {
  layers: Layer[];
  zoom: number;
}

const MaterialRenderShow = (props: MaterialRenderProps) => {
  const { layers, zoom } = props;
  if (!layers || layers.length <= 0) return null;
  return layers.map((layer) => {
    let Material;
    switch (layer.ty) {
      case LayerType.GROUP:
        Material = <Group_Material_Show {...layer} zoom={zoom} />;
        break;
      case LayerType.TEXT:
        Material = <Text_Material_Show {...layer} zoom={zoom} />;
        break;
      case LayerType.IMAGE:
        Material = <Image_Material_Show {...layer} zoom={zoom} />;
        break;
      case LayerType.SHAPE:
        Material = 'shape';
        break;
      case LayerType.QRCODE:
        Material = <QRCode_Material_Show {...layer} zoom={zoom} />;
        break;
      default:
        Material = null;
        break;
    }
    return <Fragment key={layer.id}>{Material}</Fragment>;
  });
};

export default MaterialRenderShow;
