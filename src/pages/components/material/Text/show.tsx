import TransformOperation from '@/utils/transform';
import style from './index.module.less';
import { LinearColor, TextLayer } from '@/pages/design/interface';
import { DEFAULT_LAYER_CLASS } from '@/common/config';
import classnames from 'classnames';
import Fn from '@/utils/utils';
import { CSSProperties } from 'react';
import TranformBoxShow from '../../tranformBox/show';

const Text_Material_Show = (props: TextLayer & { zoom: number }) => {
  const { zoom, w, h } = props;
  const ref = useRef({
    laydom: null as HTMLElement | null,
    trans: new TransformOperation(),
  });
  // 是否垂直
  const isVertical = props.tr.font.writingMode == 'vertical-rl';

  const fontStyle = {
    writingMode: props.tr?.font.writingMode,
    lineHeight: props.tr?.font.lineHeight || 1,
    letterSpacing: props.tr?.font.letterSpacing,
    textAlign: props.tr?.font.align == 'fullWidth' ? 'justify' : props.tr?.font.align,
    textAlignLast: props.tr?.font.align == 'fullWidth' ? 'justify' : 'auto',
  } as Record<string, string | number>;
  /* 翻转 */
  ref.current.trans.resetData();
  if (props?.flip?.h) {
    ref.current.trans.horizontal();
  }
  if (props?.flip?.v) {
    ref.current.trans.vertical();
  }
  // const text = useMemo(() => {
  //   let data = props.p;
  //   if (typeof props.p === 'string') {
  //     data = new Delta();
  //     data.insert(props.p);
  //   }
  //   return data;
  // }, [props.p]);
  return (
    <TranformBoxShow
      tr={{ ...props.tr }}
      zoom={zoom}
      style={
        {
          width: props.w * zoom + 'px',
          height: props.h * zoom + 'px',
        } as React.CSSProperties
      }
    >
      <div
        className={classnames(style['text-layer-container'], DEFAULT_LAYER_CLASS)}
        style={
          {
            opacity: props.tr?.o,
            transform: ref.current.trans.getMatrixStr(),
          } as React.CSSProperties
        }
      >
        <div
          className={style['text-content-box']}
          style={{
            width: props.isFixedWH ? w + 'px' : 'fit-content',
            height: props.isFixedWH ? h + 'px' : 'fit-content',
          }}
        >
          <div
            className={classnames({
              [style['fill-color-box']]: props?.tr?.font?.isShowFillColor,
              [style['stroke-color-box']]: props?.tr?.font?.isShowStroke,
            })}
            style={
              {
                wordBreak: 'break-all',
                minWidth: isVertical ? w + 'px' : 'inherit',
                minHeight: isVertical ? 'inherit' : h + 'px',
                width: props.w || 'auto',
                height: props.h || 'auto',
                fontSize: props.tr.font.defaultSize,
                transformOrigin: 'top left',
                '--fill-color': props?.tr?.font?.isShowFillColor
                  ? Fn.trans.linearToLinearStr(props.tr.font.fillColor as LinearColor)
                  : '',
                '--stroke-color': props?.tr?.font?.isShowStroke
                  ? Fn.trans.linearToLinearStr(props.tr.font.strokeColor as LinearColor)
                  : '',
                '--stroke-width': (props?.tr?.font?.isShowStroke ? props.tr.font.strokeWidth || 0 : 0) + 'px',
                ...fontStyle,
              } as CSSProperties
            }
          ></div>
        </div>
      </div>
    </TranformBoxShow>
  );
};

export default Text_Material_Show;
