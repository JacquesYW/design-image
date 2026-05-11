import BgShow from '@/pages/components/material/BgRender/show';
import { Panel } from '../interface';
import style from './index.module.less';
import MaterialRenderShow from '@/pages/components/material/show';

interface ShowPanelProps {
  panel: Panel;
  // 这里不用 design区域的zoom, 因为这里只需要展示panel的效果(由外部盒子宽高决定)
  zoom: number;
}

const ShowPanel = ({ panel, zoom }: ShowPanelProps) => {
  return (
    <div
      className={style['show-panel-container']}
      style={
        {
          width: panel.w * zoom,
          height: panel.h * zoom,
          '--zoom': zoom,
        } as React.CSSProperties
      }
    >
      <BgShow panelData={panel} zoom={zoom} />
      {/* 这里可以添加其他组件 */}
      <MaterialRenderShow layers={panel.layers} zoom={zoom} />
    </div>
  );
};

export default ShowPanel;
