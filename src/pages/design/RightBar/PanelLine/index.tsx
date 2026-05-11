import { Col, Row } from 'antd';
import style from './index.module.less';
import classnames from 'classnames';
import Fn from '@/utils/utils';
interface PanelLineProps {
  title?: React.ReactNode;
  titleClassName?: string;
  children?: React.ReactNode;
  extraBtn?: string;
  noLine?: boolean;
  extraBtnClick?: () => void;
  extraRender?: () => React.ReactNode;
}
const PanelLine = (props: PanelLineProps) => {
  return (
    <div
      className={classnames(style['line-item'], {
        [style['no-line']]: props.noLine,
      })}
    >
      {props.title ? (
        <div className={style['line-title-box']}>
          <span className={classnames(style['line-title-content'], props.titleClassName)}>{props.title}</span>
          <div className={style['line-extra-box']}>
            {props.extraRender
              ? props.extraRender()
              : props.extraBtn && (
                  <span
                    className={style['line-extra']}
                    onClick={() => {
                      props.extraBtnClick && props.extraBtnClick();
                    }}
                  >
                    {props.extraBtn}
                  </span>
                )}
          </div>
        </div>
      ) : null}
      {props.children ? <div className={style['line-content']}>{props.children}</div> : null}
    </div>
  );
};

export default PanelLine;

type PanelLineInLineItemProps = {
  title: React.ReactNode;
  children: React.ReactNode;
  extraRight?: React.ReactNode;
};
const PanelLineInLineItem = (props: PanelLineInLineItemProps) => {
  const { title, children, extraRight } = props;
  const hasExtraRight = useMemo(() => Fn.verify.isNotEmpty(extraRight, ''), [extraRight]);
  return (
    <Row align="middle" justify="space-between">
      <Col span={8}>{title}</Col>
      <Col span={hasExtraRight ? 12 : 16}>{children}</Col>
      {hasExtraRight ? (
        <Col span={4} style={{ textAlign: 'right' }}>
          {extraRight}
        </Col>
      ) : null}
    </Row>
  );
};

PanelLine.InLineItem = PanelLineInLineItem;
