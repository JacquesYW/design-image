import { ShapeLayer } from '@/pages/design/interface';
import { SinglePanel } from '../interface';

const ShapePanel = (props: SinglePanel<ShapeLayer>) => {
  const { id } = props;
  console.log(id);
  return <></>;
};

export default ShapePanel;
