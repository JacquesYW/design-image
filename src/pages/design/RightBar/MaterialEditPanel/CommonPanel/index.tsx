import { Layer } from '@/pages/design/interface';
import PanelLine from '../../PanelLine';
import { SinglePanel } from '../interface';
import style from './index.module.less';
import classnames from 'classnames';
import { EditData, EditFn } from '@/pages/design/context';
import Fn from '@/utils/utils';
import { BlurInputNumber } from '../../components/CustomInputNumber';
import { BlurInput } from '../../components/CustomInput';
import { LayerType } from '@/common/config';
import manageFactory from '@/utils/manageFactory';
import { Tooltip } from 'antd';
import { LinkIcon, UnLinkIcon } from '@/pages/components/svgIcon/';

type ChanageWHType = 'w' | 'h';
const CommonPanel = (props: SinglePanel<Layer>) => {
  const { id, layer } = props;
  const { updateLayer } = useContext(EditFn);
  const { zoom } = useContext(EditData);
  const [isLink, setIsLink] = useState(true);
  /* 
    统一处理宽高变换后,对应xy等值的变换计算
    @return { x, y, w, h, direction, s }
  */
  type ChangeWHData = { s: number; w?: number; h?: number };

  const changeLayerWH = useCallback(
    (layerData: Layer, type: ChanageWHType, data: ChangeWHData) => {
      const result = Fn.calcByLayer.getNewResizeParamByScale(
        layerData,
        {
          ...data,
          s: isLink ? [data.s, data.s] : type === 'w' ? [data.s, 1] : [1, data.s],
          direction: isLink ? [1, 1] : type === 'w' ? [1, 0] : [0, 1],
        },
        zoom,
      );
      manageFactory.dispatchRegister(layerData.id, 'onResizeEnd', result);
    },
    [layer, isLink],
  );
  // 文字图层修改宽高时, 关联宽高,就需要修改fontSize,不关联就单独修改w,h
  const changeTextLayerWH = useCallback(
    (layerData: Layer, type: ChanageWHType, data: ChangeWHData) => {
      const result = Fn.calcByLayer.getNewResizeParamByScale(
        layerData,
        {
          ...data,
          s: isLink ? [data.s, data.s] : type === 'w' ? [data.s, 1] : [1, data.s],
          direction: isLink ? [1, 1] : type === 'w' ? [1, 0] : [0, 1],
        },
        zoom,
      );
      manageFactory.dispatchRegister(layerData.id, isLink ? 'onResizeEnd' : 'onWhChange', result);
    },
    [layer, isLink],
  );
  /* 
    子图层宽高修改会影响xy的值,子原生宽高比全都按unkeepratio处理,
  */
  const changeSubLayerWH = useCallback(
    (layerData: Layer, type: ChanageWHType, data: ChangeWHData) => {
      const result = Fn.calcByLayer.getNewResizeParamByScale(
        layerData,
        {
          ...data,
          s: isLink ? [data.s, data.s] : type === 'w' ? [data.s, 1] : [1, data.s],
          direction: isLink ? [1, 1] : type === 'w' ? [1, 0] : [0, 1],
        },
        zoom,
        true,
      );
      manageFactory.dispatchRegister(layerData.id, 'onResizeEnd', result);
    },
    [layer, isLink],
  );
  /* 设置宽高, 按比例处理,方便统一逻辑 */
  const setWh = (uid: string, type: ChanageWHType, s: number, wh: number) => {
    const layer = manageFactory.getLayerDataById(uid)!;
    if (layer.ty === LayerType.GROUP) {
      changeLayerWH(layer, type, { s, [type]: wh });

      const allSubIds = manageFactory.getAllSubIdsById(id, true);
      allSubIds.forEach((subId) => {
        const layerData = manageFactory.getLayerDataById(subId);
        if (layerData) {
          changeSubLayerWH(layerData, type, { s });
        }
      });
    } else if (layer.ty === LayerType.TEXT) {
      changeTextLayerWH(layer, type, { s, [type]: wh });
    } else {
      let data = { s, [type]: wh };
      if (layer.ty === LayerType.QRCODE) {
        /* 二维码的宽高,永远一致 */
        data = { s, w: wh, h: wh };
      }
      changeLayerWH(layer, type, data);
    }
  };
  const renderSizePanel = () => {
    let disabledW = layer?.isLocked,
      disabledH = layer?.isLocked,
      allwaysLink = false;
    switch (layer.ty) {
      case LayerType.TEXT: {
        const isVertical = layer?.tr?.font?.writingMode == 'vertical-rl';
        disabledW ||= isVertical;
        disabledH ||= !isVertical;
        break;
      }
      case LayerType.QRCODE: {
        allwaysLink = true;
      }
    }
    return (
      <PanelLine
        title="尺寸"
        extraRender={() => {
          return (
            <Tooltip title={isLink ? '自定义宽高比' : '锁定宽高比'} placement="top">
              <span
                className={classnames(style['cursor-pointer'], {
                  [style['disabled-link']]: allwaysLink,
                })}
                style={{ lineHeight: 1 }}
                onClick={() => {
                  setIsLink(allwaysLink || !isLink);
                }}
              >
                {isLink ? <LinkIcon size={18} /> : <UnLinkIcon size={18} />}
              </span>
            </Tooltip>
          );
        }}
      >
        <div className={style['pane-hint-box']}>
          <div className={classnames(style['panel-hint'], style['edit-hint'])} data-hint="宽">
            <BlurInputNumber
              value={layer?.w}
              disabled={disabledW}
              style={{ width: '100%' }}
              variant="borderless"
              min={1}
              step={1}
              precision={0}
              placeholder="自动"
              cacheData={{ id }}
              onBlur={(e, cacheData) => {
                const val = e.target.value;
                if (val) {
                  setWh(cacheData!.id, 'w', +val / layer.w, +val);
                }
              }}
            />
          </div>
          <div className={classnames(style['panel-hint'], style['edit-hint'])} data-hint="高">
            <BlurInputNumber
              value={layer?.h}
              disabled={disabledH}
              style={{ width: '100%' }}
              variant="borderless"
              min={1}
              step={1}
              precision={0}
              placeholder="自动"
              cacheData={{ id }}
              onBlur={(e, cacheData) => {
                const val = e.target.value;
                if (val) {
                  setWh(cacheData!.id, 'h', +val / layer.h, +val);
                }
              }}
            />
          </div>
        </div>
      </PanelLine>
    );
  };
  return (
    <div className={style['position-panel']}>
      <PanelLine title="位置">
        <div className={style['pane-hint-box']}>
          <div className={classnames(style['panel-hint'], style['edit-hint'])} data-hint="左">
            <BlurInputNumber
              style={{ width: '100%' }}
              variant="borderless"
              disabled={layer?.isLocked}
              step={1}
              precision={0}
              value={layer.tr?.x}
              placeholder="..."
              cacheData={{ id }}
              onBlur={(e, cacheData) => {
                const val = e.target.value;
                updateLayer(cacheData!.id, {
                  tr: { x: +val },
                });
              }}
            />
          </div>
          <div className={classnames(style['panel-hint'], style['edit-hint'])} data-hint="上">
            <BlurInputNumber
              style={{ width: '100%' }}
              variant="borderless"
              disabled={layer?.isLocked}
              step={1}
              precision={0}
              value={layer.tr?.y}
              cacheData={{ id }}
              placeholder="..."
              onBlur={(e, cacheData) => {
                const val = e.target.value;
                updateLayer(cacheData!.id, {
                  tr: { y: +val },
                });
              }}
            />
          </div>
        </div>
      </PanelLine>
      {renderSizePanel()}
      <PanelLine title="别名">
        <BlurInput
          placeholder="图层别名"
          cacheData={{ id }}
          value={layer.nm || ''}
          onBlur={(e, cacheData) => {
            updateLayer(cacheData!.id, {
              nm: e.target.value,
            });
          }}
        />
      </PanelLine>
    </div>
  );
};

export default CommonPanel;
