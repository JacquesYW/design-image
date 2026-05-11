import { EditData, EditFn, SourceData } from '@/pages/design/context';
import { QrCodeLayer } from '@/pages/design/interface';
import { QRCode } from 'antd';
import TranformBox from '../../tranformBox';
import manageFactory from '@/utils/manageFactory';
import _ from 'lodash';
import { isHit } from '../../editer/SelectToAndMoveableTool';
import style from './index.module.less';
import { DEFAULT_LAYER_CLASS, getTransformBoxSubId } from '@/common/config';
import classnames from 'classnames';
import { onResizeParam } from '../../editer/SelectToAndMoveableTool/interface';
import TransformOperation from '@/utils/transform';
// 二维码默认内容
export const defaultQrContent = 'https://www.weimob.com/';

const QRCode_Material = (props: QrCodeLayer & { path: string; elRef?: React.MutableRefObject<HTMLElement | null> }) => {
  const sourceData = useContext(SourceData);
  const { zoom } = useContext(EditData);
  const { updateLayer } = useContext(EditFn);
  const { p, bgc, fgc, icon, errorLevel } = props;
  const ref = useRef({
    laydom: null as HTMLElement | null,
    commonTr: new TransformOperation(),
  });
  useEffect(() => {
    return () => {
      manageFactory.removeById(props.id);
    };
  }, []);
  useEffect(() => {
    manageFactory.setPathById(props.id, props.path);
    manageFactory.setLayerDataById(props.id, _.omit(props, ['path', 'elRef']));
    manageFactory.setMoveableDriectionsById(props.id, ['nw', 'ne', 'sw', 'se']);
    if (ref.current.laydom) {
      manageFactory.setDomById(props.id, ref.current.laydom);
      manageFactory.setHintFnById(props.id, (point) => {
        return isHit(point, ref.current.laydom!) ? 1 : 0;
      });
      manageFactory.register(props.id, 'onResize', (param) => {
        const { x, y, w, h, s } = param as onResizeParam;
        const dom = document.getElementById(getTransformBoxSubId(props.id)) as HTMLElement;
        ref.current.commonTr.resetData({
          translate: {
            x,
            y,
          },
          skew: props.tr.sk,
          scale: props.tr.s,
          rotate: props.tr.r,
        });
        dom.style.width = w + 'px';
        dom.style.height = h + 'px';
        dom.style.transform = ref.current.commonTr.getMatrixCssStr();
        ref.current.laydom!.style.transform = 'scale(' + s[0] + ')';
      });
      manageFactory.register(props.id, 'onResizeEnd', (param) => {
        const { x, y, w, h } = param as onResizeParam;
        updateLayer(props.id, {
          tr: {
            x: x / zoom,
            y: y / zoom,
          },
          w: w / zoom,
          h: h / zoom,
        }).then(() => {
          ref.current.laydom!.style.transform = 'scale(1)';
        });
      });
    }
  }, [sourceData, zoom]);
  /* 翻转 */
  ref.current.commonTr.resetData({});
  if (props?.flip?.h) {
    ref.current.commonTr.horizontal();
  }
  if (props?.flip?.v) {
    ref.current.commonTr.vertical();
  }
  return (
    <TranformBox
      tr={props.tr}
      id={props.id}
      isLocked={props.isLocked}
      elRef={props.elRef}
      style={
        {
          width: props.w * zoom + 'px',
          height: props.h * zoom + 'px',
          '--transform-width': props.w + 'px',
          '--transform-height': props.h + 'px',
        } as React.CSSProperties
      }
    >
      <div
        id={props.id}
        ref={(text) => {
          if (text) {
            ref.current.laydom = text;
          }
        }}
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
    </TranformBox>
  );
};

export default QRCode_Material;
