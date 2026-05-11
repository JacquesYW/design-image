import { Fragment } from 'react';
import { LayerType } from '@/common/config';
import { Layer } from '@/pages/design/interface';
import Text_Material from '@/pages/components/material/Text';
import Image_Material from '@/pages/components/material/Image';
import Group_Material from '@/pages/components/material/Group';
import AnimationDisplayItem from '@/pages/design/Animation/display/DisplayItem';
import QRCode_Material from './QRCode';

interface MaterialRenderProps {
  layers: Layer[];
  prePath: string;
  hasAnimation?: boolean;
}

const MaterialRender = (props: MaterialRenderProps) => {
  const { layers, prePath, hasAnimation } = props;
  if (!layers || layers.length <= 0) return null;
  return layers.map((layer, index) => {
    let Material;
    switch (layer.ty) {
      case LayerType.GROUP:
        Material = <Group_Material path={`${prePath}[${index}]`} {...layer} />;
        break;
      case LayerType.TEXT:
        Material = <Text_Material path={`${prePath}[${index}]`} {...layer} />;
        break;
      case LayerType.IMAGE:
        Material = <Image_Material path={`${prePath}[${index}]`} {...layer} />;
        break;
      case LayerType.SHAPE:
        Material = 'shape';
        break;
      case LayerType.QRCODE:
        Material = <QRCode_Material path={`${prePath}[${index}]`} {...layer} />;
        break;
      default:
        Material = null;
        break;
    }
    return hasAnimation ? (
      <AnimationDisplayItem key={layer.id}>{Material}</AnimationDisplayItem>
    ) : (
      <Fragment key={layer.id}>{Material}</Fragment>
    );
  });
};

export default MaterialRender;
