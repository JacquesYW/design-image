import { LinearColor } from '@/pages/design/interface';
import style from './index.module.less';
import Fn from '@/utils/utils';
import classnames from 'classnames';
import moreColor from '@/assets/images/common/more-color.png';
type ColorPreVeiwIProps = {
  isFullline?: boolean;
  isLinear?: boolean;
  color: RgbaColor | LinearColor;
  isMore?: boolean;
  isBorder?: boolean; // 是否有border
};
const ColorPreView = (props: ColorPreVeiwIProps) => {
  const { isFullline, isLinear, color, isMore, isBorder } = props;
  return (
    <div
      className={classnames(style['colorpreview-item'], {
        [style['colorpreview-fullline']]: isFullline,
        [style['border-line']]: isBorder,
      })}
    >
      {isMore ? (
        <div
          className={style['colorpreview-frame']}
          style={{ background: `url(${moreColor}) center center / cover no-repeat` }}
        ></div>
      ) : isLinear ? (
        <div
          className={style['colorpreview-frame']}
          style={{
            backgroundImage: Fn.trans.linearToLinearStr(color as LinearColor),
          }}
        />
      ) : (
        <>
          <div
            className={style['colorpreview-frame-opacity']}
            style={{
              backgroundColor: Fn.trans.rgbaToRgbaStr({ ...color, a: 1 } as RgbaColor),
            }}
          />
          <div
            className={style['colorpreview-frame']}
            style={{
              backgroundColor: Fn.trans.rgbaToRgbaStr(color as RgbaColor),
            }}
          />
        </>
      )}
    </div>
  );
};

export default ColorPreView;
