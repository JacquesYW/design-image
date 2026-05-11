import style from '../index.module.less';
import MoreLayerPanel from './MoreLayerPanel';
import TextPanel from './TextPanel';
import ImagePanel from './ImagePanel';
import ShapePanel from './ShapePanel';
import QrcodePanel from './QrcodePanel';
import ToolPanel from './ToolPanel';
import BasicPanel from './BasicPanel';
import { EditData, SourceData } from '../../context';
import manageFactory from '@/utils/manageFactory';
import { LayerType } from '@/common/config';
import _ from 'lodash';
import { ImageLayer, Layer, QrCodeLayer, ShapeLayer, TextLayer } from '../../interface';
import CommonPanel from './CommonPanel';
import GroupPanel from './GroupPanel';

const MaterialEditPanel = () => {
  const sourceData = useContext(SourceData);
  const { selectLayers, selectSubLayer, panelIndex } = useContext(EditData);
  const panelData = useMemo(() => sourceData.panels[panelIndex], [sourceData, panelIndex]);

  const ref = useRef({
    id: null as unknown as string,
    layer: null as null | Layer,
  });
  const layers = useMemo(() => {
    ref.current.id = null as unknown as string;
    ref.current.layer = null;
    return selectLayers.map((selectId, index) => {
      const selectLayer = _.result(sourceData, manageFactory.getPathById(selectId));
      if (index == 0) {
        ref.current.id = selectId;
        ref.current.layer = selectLayer as Layer;
      }
      return selectLayer as Layer;
    });
  }, [sourceData, selectLayers]);
  /* 
    在只选中组图层时,selectSubLayer子图层才会有值,
    所以这里需要判断一下,如果selectSubLayer有值,则使用selectSubLayer,否则使用selectLayers[0]
  */
  ref.current.id = useMemo(() => (selectSubLayer ? selectSubLayer : ref.current.id), [selectSubLayer, layers]);
  ref.current.layer = useMemo(
    () => (selectSubLayer ? _.result(sourceData, manageFactory.getPathById(selectSubLayer)) : ref.current.layer),
    [selectSubLayer, layers],
  );
  const layerType = manageFactory.getLayerTypeById(ref.current.id);
  if (selectLayers.length === 0 || !ref.current.layer) {
    return null;
  }
  return (
    <div className={style['panel-container']}>
      <ToolPanel ids={selectLayers} layers={layers} sw={panelData.w} sh={panelData.h} />
      <GroupPanel ids={selectLayers} />
      {selectLayers.length > 1 ? <MoreLayerPanel ids={selectLayers} layers={layers} /> : null}
      {selectLayers.length == 1 ? (
        <>
          {layerType == LayerType.TEXT ? (
            <TextPanel id={ref.current.id} layer={ref.current.layer as TextLayer} />
          ) : null}
          {layerType == LayerType.IMAGE ? (
            <ImagePanel id={ref.current.id} layer={ref.current.layer as ImageLayer} />
          ) : null}
          {layerType == LayerType.SHAPE ? (
            <ShapePanel id={ref.current.id} layer={ref.current.layer as ShapeLayer} />
          ) : null}
          {layerType == LayerType.QRCODE ? (
            <QrcodePanel id={ref.current.id} layer={ref.current.layer as QrCodeLayer} />
          ) : null}
        </>
      ) : null}
      {/* 只选中组图层,并且未选中对应子图层时,不显示基本属性 */}
      {selectLayers.length == 1 && layerType == LayerType.GROUP ? null : selectSubLayer ? (
        <BasicPanel ids={[ref.current.id]} layers={[ref.current.layer]} />
      ) : (
        <BasicPanel ids={selectLayers} layers={layers} />
      )}
      {selectLayers.length == 1 ? <CommonPanel id={selectLayers[0]} layer={layers[0]} /> : null}
    </div>
  );
};

export default MaterialEditPanel;
