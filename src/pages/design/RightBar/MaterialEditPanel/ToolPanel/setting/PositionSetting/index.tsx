import { AlignPosition, getPositionXY } from '@/pages/components/editer/SelectToAndMoveableTool';
import style from './index.module.less';
import PanelLine from '@/pages/design/RightBar/PanelLine';
import { CloseOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import PositionIcon, { DirectionType } from '@/pages/components/svgIcon/PositionIcon';
import { Focus } from '@/pages/components/svgIcon';
import classnames from 'classnames';
import { EditData, EditFn } from '@/pages/design/context';
import { Layer } from '@/pages/design/interface';

export interface PositionSetContentProps {
  // changePosition: (direction: keyof AlignPosition) => void;
  data: {
    sw: number;
    sh: number;
    ids: string[];
  };
  hide: () => void;
}

const PositionList: Array<{
  direction: keyof AlignPosition;
  icon: DirectionType | 'center';
  tip: string;
}> = [
  {
    direction: 'top',
    icon: 'top',
    tip: '贴顶部',
  },
  {
    direction: 'bottom',
    icon: 'bottom',
    tip: '贴底部',
  },
  {
    direction: 'left',
    icon: 'left',
    tip: '贴左侧',
  },
  {
    direction: 'right',
    icon: 'right',
    tip: '贴右侧',
  },
  {
    direction: 'center',
    icon: 'center',
    tip: '画布中心',
  },
];
const PositionSetting = ({ data, hide }: PositionSetContentProps) => {
  const { zoom } = useContext(EditData);
  const { updateLayer } = useContext(EditFn);

  const { ids, sw, sh } = data;
  const changePosition: (direction: keyof AlignPosition) => void = useCallback(
    (direction) => {
      const positon = getPositionXY(ids, { w: sw, h: sh }, zoom);
      if (ids) {
        ids.forEach((id) => {
          updateLayer(
            id,
            {
              tr: {
                ...positon.get(id)?.[direction],
              },
            } as DeepPartial<Layer>,
            true,
            true,
          );
        });
      }
    },
    [ids, zoom, sw, sh, updateLayer],
  );
  return (
    <div className={style['position-setting-content']}>
      <PanelLine
        title="图层位置"
        titleClassName={style['content-title']}
        noLine
        extraRender={() => (
          <div onClick={hide} className={style['cursor-pointer']}>
            <CloseOutlined />
          </div>
        )}
      ></PanelLine>
      <div className={style['panel-action-btn-box']}>
        <div
          className={style['panel-action-btn']}
          onClick={() => {
            changePosition('horizontalCenter');
          }}
        >
          水平居中
        </div>
        <div
          className={style['panel-action-btn']}
          onClick={() => {
            changePosition('verticalCenter');
          }}
        >
          垂直居中
        </div>
      </div>
      <div className={style['content-box']}>
        {PositionList.map((item) => (
          <Tooltip key={item.direction} title={item.tip} mouseEnterDelay={1}>
            <div
              className={classnames(style['setting-item'], style[item.direction])}
              onClick={() => {
                changePosition(item.direction);
              }}
            >
              {item.icon != 'center' ? (
                <PositionIcon direction={item.icon} className={style['setting-icon']} />
              ) : (
                <Focus className={style['setting-icon']} />
              )}
            </div>
          </Tooltip>
        ))}
      </div>
    </div>
  );
};

export default PositionSetting;
