import { QrCodeLayer } from '@/pages/design/interface';
import { QRCode } from 'antd';
import style from './index.module.less';
import { DEFAULT_LAYER_CLASS } from '@/common/config';
import classnames from 'classnames';
import TransformOperation from '@/utils/transform';
import TranformBoxShow from '../../tranformBox/show';
// 二维码默认内容
export const defaultQrContent = 'https://www.weimob.com/';

const QRCode_Material_Show = (props: QrCodeLayer & { zoom: number }) => {
  const { zoom, p, bgc, fgc, icon, errorLevel } = props;
  const ref = useRef({
    commonTr: new TransformOperation(),
  });
  /* 翻转 */
  ref.current.commonTr.resetData({});
  if (props?.flip?.h) {
    ref.current.commonTr.horizontal();
  }
  if (props?.flip?.v) {
    ref.current.commonTr.vertical();
  }
  return (
    <TranformBoxShow
      tr={props.tr}
      zoom={zoom}
      style={
        {
          width: props.w * zoom + 'px',
          height: props.h * zoom + 'px',
          '--transform-width': props.w * zoom + 'px',
          '--transform-height': props.h * zoom + 'px',
        } as React.CSSProperties
      }
    >
      <div
        className={classnames(style['qrcode-layer-container'], DEFAULT_LAYER_CLASS)}
        style={{
          transform: 'scale(1)',
          transformOrigin: 'top left',
          backgroundColor: bgc,
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            opacity: props.tr?.o ?? 1,
            transform: ref.current.commonTr.getMatrixStr(),
          }}
        >
          <QRCode
            size={props.w * 0.92 * zoom}
            iconSize={(props.h * 0.92 * zoom) / 4}
            bordered={false}
            value={p}
            color={fgc}
            bgColor={bgc}
            icon={icon}
            errorLevel={errorLevel}
          />
        </div>
      </div>
    </TranformBoxShow>
  );
};

export default QRCode_Material_Show;
