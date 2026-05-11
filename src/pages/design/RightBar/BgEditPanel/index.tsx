import { Col, ColorPicker, Row, Segmented, Slider, Tooltip } from 'antd';
import { SourceData, EditData, EditFn } from '../../context';
import style from './index.module.less';
import PanelLine from '../PanelLine';
import Fn from '@/utils/utils';
import Colorful from '@/pages/components/colorful';
import ImageListModal from '@/pages/components/imageListModal';
import { Duplicate, ShrinkHorizontal, ShrinkVertical, DeleteOutlined } from '@/pages/components/svgIcon';
import { BackgroundType, EditTypeEnum } from '@/common/config';
import { Palette, Background } from '@/pages/design/interface';
import ColorPreView from '@/pages/components/colorful/ColorPreView';
import { BlurInputNumber } from '../components/CustomInputNumber';
import classnames from 'classnames';
import BgShow from '@/pages/components/material/BgRender/show';

const imgMapshowWidth = 280 - 24 * 2;
const imgMapshowHeight = 150 - 16 * 2;

const BgEditPanel = () => {
  const sourceData = useContext(SourceData);
  const { editParam, panelIndex, setEditParam } = useContext(EditData);
  const panelData = useMemo(() => sourceData.panels[panelIndex], [sourceData, panelIndex]);
  const {
    updateWH,
    switchBgType,
    updateBgColor,
    updateBgImg,
    replaceBgImg,
    deletePanelByIndex,
    duplicatePanelByIndex,
  } = useContext(EditFn);
  const hasBgImg = useMemo(() => panelData.bg.type == BackgroundType.IMAGE && panelData.bg.img?.p, [panelData.bg]);
  const updatePalette = useCallback(
    ({ col, o }: { col?: { toRgb: () => RgbaColor }; o: number | null }, isEnd = true) => {
      updateBgImg(
        {
          tr: {
            palette: {
              o: o,
              c: col ? Fn.trans.rgbaToHex(col.toRgb()) : panelData.bg.img?.tr?.palette?.c,
            } as Palette,
          },
        },
        isEnd,
      );
    },
    [panelData.bg, updateBgImg],
  );
  /* 删除背景图片 */
  const deleteBgImg = useCallback(() => {
    updateBgImg({
      p: '',
      w: 0,
      h: 0,
      imgW: 0,
      imgH: 0,
      tr: {},
    });
  }, [updateBgImg]);
  const changeWH = useCallback(
    (wh: { w: number; h: number }) => {
      updateWH(wh);
    },
    [updateWH, updateBgImg],
  );
  return (
    <div className={style['panel-container']}>
      <div className={style['tool-panel']}>
        <div
          className={classnames(style['tool-panel-item'])}
          onClick={() => {
            duplicatePanelByIndex(panelIndex);
          }}
        >
          <Tooltip mouseLeaveDelay={0} title="创建副本">
            <span>
              <Duplicate size={20} />
            </span>
          </Tooltip>
        </div>
        <div
          className={classnames(style['tool-panel-item'])}
          onClick={() => {
            deletePanelByIndex(panelIndex);
          }}
        >
          <Tooltip mouseLeaveDelay={0} title="删除">
            <span>
              <DeleteOutlined size={20} />
            </span>
          </Tooltip>
        </div>
      </div>
      <PanelLine title="画布尺寸" /* extraBtn="调整" */>
        <div>
          <div className={style['pane-hint-box']}>
            <div className={style['panel-hint']} data-hint="宽">
              <BlurInputNumber
                value={panelData.w}
                style={{ width: '100%' }}
                variant="borderless"
                min={1}
                step={1}
                precision={0}
                placeholder="自动"
                onBlur={(e) => {
                  const val = e.target.value;
                  if (val) {
                    changeWH({ w: Fn.calc.toFixed(+val, 0), h: panelData.h });
                  }
                }}
              />
            </div>
            <div className={style['panel-hint']} data-hint="高">
              <BlurInputNumber
                value={panelData.h}
                style={{ width: '100%' }}
                variant="borderless"
                min={1}
                step={1}
                precision={0}
                placeholder="自动"
                onBlur={(e) => {
                  const val = e.target.value;
                  if (val) {
                    changeWH({ w: panelData.w, h: Fn.calc.toFixed(+val, 0) });
                  }
                }}
              />
            </div>
          </div>
        </div>
      </PanelLine>
      <PanelLine title="画布背景">
        <Segmented
          block
          size="large"
          options={[
            {
              label: '颜色',
              value: 'color',
            },
            {
              label: '图片',
              value: 'image',
            },
          ]}
          value={panelData.bg.type}
          onChange={(value) => {
            switchBgType(value as Background['type']);
          }}
        />
        {/* 背景-颜色 */}
        {panelData.bg.type == BackgroundType.COLOR ? (
          <div className={style['bg-color-box']}>
            <Colorful
              type={0}
              data={panelData.bg.color}
              onChangeComplete={({ isLinear, color }, isEnd = true) => {
                updateBgColor(
                  {
                    ...panelData.bg.color,
                    isLinear,
                    [isLinear ? 'linear' : 'c']: color,
                  },
                  isEnd,
                );
              }}
            >
              {({ isLinear, color }) => {
                return (
                  <div>
                    <ColorPreView isFullline color={color} isLinear={isLinear} />
                  </div>
                );
              }}
            </Colorful>
          </div>
        ) : null}
        {/* 背景图的缩略图 */}
        {panelData.bg.type == BackgroundType.IMAGE ? (
          <>
            {panelData.bg.img?.p ? (
              <div
                className={style['bg-img-map']}
                style={
                  {
                    '--show-width': imgMapshowWidth + 'px',
                    '--show-height': imgMapshowHeight + 'px',
                  } as React.CSSProperties
                }
              >
                <div
                  className={style['bg-img-box']}
                  style={
                    {
                      '--bg-show-width': panelData.w + 'px',
                      '--bg-show-height': panelData.h + 'px',
                      '--bg-show-scale': Math.min(
                        (imgMapshowWidth - 20) / panelData.w,
                        (imgMapshowHeight - 20) / panelData.h,
                      ),
                    } as React.CSSProperties
                  }
                >
                  <BgShow
                    panelData={panelData}
                    zoom={Math.min((imgMapshowWidth - 20) / panelData.w, (imgMapshowHeight - 20) / panelData.h)}
                  />
                </div>
                <div className={style['bg-img-map-action-box']}>
                  <Tooltip mouseLeaveDelay={0} title="水平翻转">
                    <div
                      className={style['bg-img-map-aciton-item']}
                      onClick={() => {
                        updateBgImg({
                          tr: {
                            flip: {
                              h: !panelData.bg.img?.tr?.flip?.h,
                            },
                          },
                        });
                      }}
                    >
                      <ShrinkHorizontal size={14} />
                    </div>
                  </Tooltip>
                  <Tooltip mouseLeaveDelay={0} title="垂直翻转">
                    <div
                      className={style['bg-img-map-aciton-item']}
                      onClick={() => {
                        updateBgImg({
                          tr: {
                            flip: {
                              v: !panelData.bg.img?.tr?.flip?.v,
                            },
                          },
                        });
                      }}
                    >
                      <ShrinkVertical size={14} />
                    </div>
                  </Tooltip>
                  <Tooltip mouseLeaveDelay={0} title="删除">
                    <div className={style['bg-img-map-aciton-item']} onClick={deleteBgImg}>
                      <DeleteOutlined style={{ fontSize: 12, color: '#333' }} />
                    </div>
                  </Tooltip>
                </div>
              </div>
            ) : null}
            <div
              className={style['panel-action-btn']}
              onClick={() => {
                ImageListModal({
                  onSelect: (image) => {
                    replaceBgImg(image);
                  },
                });
              }}
            >
              {panelData.bg.img?.p ? '替换背景图片' : '上传背景图片'}
            </div>
            <div className={style['panel-action-btn-box']}>
              <div
                className={classnames(style['panel-action-btn'], {
                  [style['disabled']]: hasBgImg ? false : true,
                })}
                onClick={() => {
                  if (hasBgImg) {
                    if (editParam.type != EditTypeEnum.BGIMAGECLIP) {
                      setEditParam({ type: EditTypeEnum.BGIMAGECLIP });
                    } else {
                      setEditParam({ type: '' });
                    }
                  }
                }}
              >
                裁剪
              </div>
              <ColorPicker
                disabled={!hasBgImg}
                disabledAlpha
                allowClear
                placement="topLeft"
                trigger="click"
                rootClassName="image-design-color-picker"
                value={panelData.bg.img?.tr?.palette?.c || '#fff'}
                panelRender={(_, { components: { Picker } }) => {
                  return (
                    <div>
                      <Picker />
                      <Row align="middle">
                        <Col span={4}>强度</Col>
                        <Col span={18}>
                          <Slider
                            step={1}
                            min={0}
                            max={100}
                            onChange={(val) => {
                              updatePalette({ o: Fn.calc.toFixed(val / 100) }, false);
                            }}
                            onChangeComplete={(val) => {
                              updatePalette({ o: Fn.calc.toFixed(val / 100) });
                            }}
                            value={(panelData.bg.img?.tr?.palette?.o ?? 0) * 100}
                          />
                        </Col>
                        <Col span={2}>
                          <div style={{ textAlign: 'right' }}>
                            {Fn.calc.toFixed((panelData.bg.img?.tr?.palette?.o ?? 0) * 100, 0)}
                          </div>
                        </Col>
                      </Row>
                    </div>
                  );
                }}
                onClear={() => {
                  updatePalette({ col: { toRgb: () => ({ r: 0, g: 0, b: 0, a: 0 }) }, o: null });
                }}
                onChange={(col) => {
                  updatePalette({ col, o: panelData.bg.img?.tr?.palette?.o || 0.31 }, false);
                }}
                onChangeComplete={(col) => updatePalette({ col, o: panelData.bg.img?.tr?.palette?.o || 0.31 })}
              >
                <div
                  className={classnames(style['panel-action-btn'], {
                    [style['disabled']]: hasBgImg ? false : true,
                  })}
                >
                  调色
                </div>
              </ColorPicker>
            </div>
          </>
        ) : null}
      </PanelLine>
    </div>
  );
};

export default BgEditPanel;
