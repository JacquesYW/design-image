import CollapseClose from '@/assets/images/common/collapse-close.png';
import style from './index.module.less';
import classnames from 'classnames';
import ActionPanel, { panels } from './ActionPanel';
import { Tooltip } from 'antd';
import { LETFBARID } from '@/common/config';

const LeftBar = () => {
  const [active, setActive] = useState<string>(panels[0].type);
  const [show, setShow] = useState(true);
  return (
    <div className={style['left-bar']} id={LETFBARID}>
      <div className={style['left-bar-asign']}>
        <div className="flex flex-col flex-between" style={{ minHeight: '100%' }}>
          {/* 侧边tab栏 */}
          <div className={style['panel-container']}>
            {panels.map((item) => (
              <div
                key={item.type}
                className={classnames('flex-col flex-center', style['panel'], {
                  [style['active']]: item.type === active,
                })}
                onClick={() => {
                  setActive(item.type);
                  setShow(true);
                }}
              >
                <span style={{ color: 'var(--color-gray-1000, #070707)', fontSize: 20 }}>{item.icon()}</span>
                <span style={{ color: 'var(--color-gray-600, #070707)' }}>{item.name}</span>
              </div>
            ))}
          </div>
          {/* 后续功能占位 */}
          <div></div>
        </div>
      </div>
      <div
        className={classnames(style['left-bar-context'], {
          [style['hide']]: !show,
        })}
      >
        <ActionPanel type={active} />
        <Tooltip mouseLeaveDelay={0} placement="right" trigger="hover" title="关闭侧边栏">
          <div className={style['collapse-close']} onClick={() => setShow(false)}>
            <img src={CollapseClose} alt="" />
          </div>
        </Tooltip>
      </div>
    </div>
  );
};
export default LeftBar;
