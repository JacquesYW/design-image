import { QrCodeLayer } from '@/pages/design/interface';
import { SinglePanel } from '../interface';
import PanelLine from '../../PanelLine';
import Colorful from '@/pages/components/colorful';
import ColorPreView from '@/pages/components/colorful/ColorPreView';
import Fn from '@/utils/utils';
import { EditFn } from '@/pages/design/context';
import clearImg from '@/assets/images/common/clear.png';
import style from './index.module.less';
import { Popover, Radio, Tooltip } from 'antd';
import IconModal from './IconModal';
import { QRCodeErrorLevel } from '@/common/config';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { BlurInput } from '../../components/CustomInput';

const QrcodePanel = (props: SinglePanel<QrCodeLayer>) => {
  const { updateLayer } = useContext(EditFn);
  const { id, layer } = props;
  const [iconPopoverOpen, setIconPopoverOpen] = useState(false);
  return (
    <div className={style['qrcode-panel']}>
      <PanelLine title="二维码">
        <PanelLine.InLineItem title="颜色">
          <div className="flex flex-end gap-8">
            {layer.fgc ? (
              <Colorful
                type={1}
                data={{
                  isLinear: false,
                  c: Fn.trans.colorStrToRgba(layer.fgc),
                }}
                onChangeComplete={({ color }, isEnd = true) => {
                  updateLayer(
                    id,
                    {
                      fgc: Fn.trans.rgbaToRgbaStr(color as RgbaColor),
                    },
                    isEnd,
                  );
                }}
              >
                {({ isLinear, color }) => (
                  <div>
                    <ColorPreView isBorder isLinear={isLinear} color={color} />
                  </div>
                )}
              </Colorful>
            ) : null}
            {layer.bgc ? (
              <Colorful
                type={1}
                data={{
                  isLinear: false,
                  c: Fn.trans.colorStrToRgba(layer.bgc),
                }}
                onChangeComplete={({ color }, isEnd = true) => {
                  updateLayer(
                    id,
                    {
                      bgc: Fn.trans.rgbaToRgbaStr(color as RgbaColor),
                    },
                    isEnd,
                  );
                }}
              >
                {({ isLinear, color }) => (
                  <div>
                    <ColorPreView isBorder isLinear={isLinear} color={color} />
                  </div>
                )}
              </Colorful>
            ) : null}
          </div>
        </PanelLine.InLineItem>
        <PanelLine.InLineItem title="标志">
          <div className="flex flex-end gap-8">
            <Popover
              placement="bottomRight"
              trigger="click"
              arrow={false}
              open={iconPopoverOpen}
              onOpenChange={() => {
                setIconPopoverOpen(!iconPopoverOpen);
              }}
              title={null}
              content={<IconModal id={id} icon={layer.icon} hide={() => setIconPopoverOpen(false)} />}
            >
              <div className={style['qrcode-icon-box']}>
                {layer.icon ? <img src={layer.icon} /> : <img src={clearImg} />}
              </div>
            </Popover>
          </div>
        </PanelLine.InLineItem>
        <PanelLine.InLineItem
          title={
            <>
              <span>容错级别</span>
              <Tooltip title="容错级别越高，二维码的纠错能力越强，但同时也会增加二维码的大小。">
                <QuestionCircleOutlined className="icon-question right" />
              </Tooltip>
            </>
          }
        >
          <div className="flex flex-end gap-8">
            <Radio.Group
              buttonStyle="solid"
              size="small"
              value={layer.errorLevel}
              onChange={(e) => {
                updateLayer(id, { errorLevel: e.target.value });
              }}
            >
              {Object.keys(QRCodeErrorLevel).map((item) => (
                <Radio.Button value={item} key={item}>
                  {item}
                </Radio.Button>
              ))}
            </Radio.Group>
          </div>
        </PanelLine.InLineItem>
      </PanelLine>
      <PanelLine
        title={
          <>
            <span>内容</span>
            <Tooltip title="输入内容,生成二维码,空内容则不生效">
              <QuestionCircleOutlined className="icon-question right" />
            </Tooltip>
          </>
        }
      >
        <BlurInput
          placeholder="图层别名"
          cacheData={{ id }}
          value={layer.p || ''}
          onBlur={(e, cacheData) => {
            const val = e.target.value;
            if (val.trim() !== '') {
              updateLayer(cacheData!.id, {
                p: val,
              });
            }
          }}
        />
      </PanelLine>
    </div>
  );
};

export default QrcodePanel;
