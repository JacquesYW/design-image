import ImagePanel from './ImagePanel';
import TextPanel from './TextPanel';

import {
  LayoutOutlined,
  BuildOutlined,
  FontSizeOutlined,
  PictureOutlined,
  BorderOutlined,
  AppstoreOutlined,
  CloudUploadOutlined,
} from '@ant-design/icons';
import ToolPanel from './ToolPanel';
import BackgroundPanel from './BackgroundPanel';
import TemplatePanel from './TemplatePanel';

export const panels = [
  {
    name: '模板',
    icon: () => <LayoutOutlined />,
    type: 'TemplatePanel',
  },
  {
    name: '素材',
    icon: () => <BuildOutlined />,
    type: 'MaterialPanel',
  },
  {
    name: '文字',
    icon: () => <FontSizeOutlined />,
    type: 'TextPanel',
  },
  {
    name: '照片',
    icon: () => <PictureOutlined />,
    type: 'ImagePanel',
  },
  {
    name: '背景',
    icon: () => <BorderOutlined />,
    type: 'BackgroundPanel',
  },
  {
    name: '工具',
    icon: () => <AppstoreOutlined />,
    type: 'ToolPanel',
  },
  {
    name: '我的',
    icon: () => <CloudUploadOutlined />,
    type: 'MinePanel',
  },
];

interface IActionPanelProps {
  type: string;
}

const ActionPanel = (props: IActionPanelProps) => {
  switch (props.type) {
    case 'TemplatePanel':
      return <TemplatePanel />;
    case 'TextPanel':
      return <TextPanel />;
    case 'ImagePanel':
      return <ImagePanel />;
    case 'BackgroundPanel':
      return <BackgroundPanel />;
    case 'ToolPanel':
      return <ToolPanel />;
    default:
      return <div>{props.type}</div>;
  }
};

export default ActionPanel;
