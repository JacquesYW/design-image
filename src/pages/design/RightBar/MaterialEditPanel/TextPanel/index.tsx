import { RIGHTPANELTEXTEDITORTOOL } from '@/common/config';
import manageFactory from '@/utils/manageFactory';
import PanelLine from '../../PanelLine';
import {
  AlignCenterOutlined,
  AlignLeftOutlined,
  AlignRightOutlined,
  BoldOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  ItalicOutlined,
  LineHeightOutlined,
  MinusOutlined,
  PlusOutlined,
  StrikethroughOutlined,
  UnderlineOutlined,
} from '@ant-design/icons';
import { FormatJustify, FormatFullWidth, LineHeight, LetterSpace } from '@/pages/components/svgIcon';
import style from './index.module.less';
import classnames from 'classnames';
import { Dropdown, Tooltip } from 'antd';
import textEditorFatory from '@/utils/textEditorFatory';
import { SinglePanel } from '../interface';
import { LinearColor, TextLayer, TextTransform } from '@/pages/design/interface';
import { fontList, sizeList } from './fonts';
import Fn from '@/utils/utils';
import Colorful from '@/pages/components/colorful';
import ColorPreView from '@/pages/components/colorful/ColorPreView';
import { linears } from '@/pages/components/colorful/preset';
import CustomInputNumber from '../../components/CustomInputNumber';
import LateralDrag from '../../components/LateralDrag';

const fontSize = 20;
const TextPanel = (props: SinglePanel<TextLayer>) => {
  const { id, layer } = props;
  const [format, setFormat] = useState<Record<string, unknown>>({});
  useEffect(() => {
    textEditorFatory.onChange = (format) => {
      const newFormat = { ...format };
      setFormat(newFormat);
    };
    textEditorFatory.useQuill(id);
  }, [id]);
  // 字体控制状态
  const fontStatus = useMemo(
    () => ({
      // 是否竖排
      isVertical: layer?.tr?.font?.writingMode == 'vertical-rl',
    }),
    [layer],
  );
  // 对齐方向控制状态
  const alignStatus = useMemo(
    () => ({
      // 是否左对齐
      isLeft: layer?.tr?.font?.align == 'left',
      // 是否居中对齐
      isCenter: layer?.tr?.font?.align == 'center',
      // 是否右对齐
      isRight: layer?.tr?.font?.align == 'right',
      // 是否两端对齐
      isJustify: layer?.tr?.font?.align == 'justify',
      // 是否分散对齐
      isFullWidth: layer?.tr?.font?.align == 'fullWidth',
    }),
    [layer],
  );
  const SelectionFont = useMemo(() => fontList.filter((font) => font.value == format.font), [format]);
  const updateLayerData = useCallback(
    (layerData: Partial<Pick<TextTransform, 'font'>['font']>, isEnd = true) => {
      manageFactory.dispatchRegister(id, 'sync', {
        data: {
          tr: {
            font: layerData,
          },
        },
        isEnd,
      });
    },
    [id],
  );
  const linkStrokeWidth = useCallback(
    (val: number) => {
      if (!textEditorFatory.isSelection() && typeof format.size == 'string' && layer?.tr?.font?.strokeWidth) {
        updateLayerData({
          strokeWidth: layer.tr?.font?.strokeWidth * (val ? val / Fn.calc.removeUnit(format.size) : 1),
        });
      }
    },
    [format, layer, updateLayerData],
  );
  return (
    <div id={RIGHTPANELTEXTEDITORTOOL}>
      <PanelLine title="文字">
        <div
          className={style['icon-btn-box']}
          style={
            {
              '--btn-box-bg': '#fff',
            } as React.CSSProperties
          }
        >
          <Dropdown
            overlayClassName={style['dropdown-box']}
            menu={{
              items: fontList.map((font) => ({
                key: font.value,
                label: <span style={{ fontFamily: font.value }}>{font.name}</span>,
              })),
              selectedKeys: [],
              onClick: ({ key }) => {
                textEditorFatory.setFormat('font', key);
              },
            }}
            trigger={['click']}
          >
            <div className={style['icon-btn-font-family']}>
              {SelectionFont.length == 1 ? (
                <span key={SelectionFont[0].value} style={{ fontFamily: SelectionFont[0].value }}>
                  {SelectionFont[0].name}
                </span>
              ) : (
                '多种字体'
              )}
            </div>
          </Dropdown>
          <Dropdown
            overlayClassName={style['dropdown-box']}
            mouseEnterDelay={0.5}
            menu={{
              items: sizeList.map((size) => ({
                key: size,
                label: size,
              })),
              selectedKeys: [],
              onClick: ({ key }) => {
                textEditorFatory.setFormat('size', Fn.calc.addUnit(key));
                linkStrokeWidth(key as unknown as number);
              },
            }}
            trigger={['hover']}
          >
            <div className={style['icon-btn-font-size']}>
              <CustomInputNumber
                variant="borderless"
                min={1}
                step={1}
                precision={2}
                value={typeof format.size == 'string' ? Fn.calc.removeUnit(format.size as string) : undefined}
                formatter={(value) => {
                  return value ? (value as number).toString() : '';
                }}
                placeholder="..."
                onBlur={(e) => {
                  const val = e.target.value as unknown as number;
                  if (val != Fn.calc.removeUnit((format.size as string) || '')) {
                    textEditorFatory.setFormat('size', Fn.calc.addUnit(val));
                    linkStrokeWidth(val);
                  }
                }}
              />
            </div>
          </Dropdown>
        </div>
        <div className={style['icon-btn-box']}>
          <div
            className={classnames(style['icon-btn'], {
              [style.selected]: format.bold,
            })}
            onClick={() => {
              textEditorFatory.setBold(!textEditorFatory.getBold());
            }}
          >
            <Tooltip mouseLeaveDelay={0} title="加粗">
              <span>
                <BoldOutlined style={{ fontSize: fontSize }} />
              </span>
            </Tooltip>
          </div>
          <div
            className={classnames(style['icon-btn'], {
              [style.selected]: format.italic,
            })}
            onClick={() => {
              textEditorFatory.setItalic(!textEditorFatory.getItalic());
            }}
          >
            <Tooltip mouseLeaveDelay={0} title="斜体">
              <span>
                <ItalicOutlined style={{ fontSize: fontSize }} />
              </span>
            </Tooltip>
          </div>
          <div
            className={classnames(style['icon-btn'], {
              [style.selected]: format.underline,
            })}
            onClick={() => {
              textEditorFatory.setUnderline(!textEditorFatory.getUnderline());
            }}
          >
            <Tooltip mouseLeaveDelay={0} title="下划线">
              <span>
                <UnderlineOutlined style={{ fontSize: fontSize }} />
              </span>
            </Tooltip>
          </div>
          <div
            className={classnames(style['icon-btn'], {
              [style.selected]: format.strike,
            })}
            onClick={() => {
              textEditorFatory.setStrike(!textEditorFatory.getStrike());
            }}
          >
            <Tooltip mouseLeaveDelay={0} title="删除线">
              <span>
                <StrikethroughOutlined style={{ fontSize: fontSize }} />
              </span>
            </Tooltip>
          </div>
          <div
            className={classnames(style['icon-btn'], {
              [style.selected]: fontStatus.isVertical,
            })}
            onClick={() => {
              // 切换横竖展示 - 需要互换w/h的值
              manageFactory.dispatchRegister(id, 'sync', {
                data: {
                  w: layer?.h,
                  h: layer?.w,
                  tr: {
                    font: {
                      writingMode: fontStatus.isVertical ? '' : 'vertical-rl',
                    },
                  },
                },
              });
            }}
          >
            <Tooltip mouseLeaveDelay={0} title="文字竖排">
              <span>
                <LineHeightOutlined style={{ fontSize: fontSize }} />
              </span>
            </Tooltip>
          </div>
        </div>
        <div className={style['icon-btn-box']}>
          <div
            className={classnames(style['icon-btn'], {
              [style.selected]: alignStatus.isLeft,
            })}
            onClick={() => {
              updateLayerData({
                align: 'left',
              });
            }}
          >
            <Tooltip mouseLeaveDelay={0} title="左对齐">
              <span>
                <AlignLeftOutlined style={{ fontSize: fontSize }} />
              </span>
            </Tooltip>
          </div>
          <div
            className={classnames(style['icon-btn'], {
              [style.selected]: alignStatus.isCenter,
            })}
            onClick={() => {
              updateLayerData({
                align: 'center',
              });
            }}
          >
            <Tooltip mouseLeaveDelay={0} title="居中对齐">
              <span>
                <AlignCenterOutlined style={{ fontSize: fontSize }} />
              </span>
            </Tooltip>
          </div>
          <div
            className={classnames(style['icon-btn'], {
              [style.selected]: alignStatus.isRight,
            })}
            onClick={() => {
              updateLayerData({
                align: 'right',
              });
            }}
          >
            <Tooltip mouseLeaveDelay={0} title="右对齐">
              <span>
                <AlignRightOutlined style={{ fontSize: fontSize }} />
              </span>
            </Tooltip>
          </div>
          <div
            className={classnames(style['icon-btn'], {
              [style.selected]: alignStatus.isJustify,
            })}
            onClick={() => {
              updateLayerData({
                align: 'justify',
              });
            }}
          >
            <Tooltip mouseLeaveDelay={0} title="两端对齐">
              <span>
                <FormatJustify size={fontSize} />
              </span>
            </Tooltip>
          </div>
          <div
            className={classnames(style['icon-btn'], {
              [style.selected]: alignStatus.isFullWidth,
            })}
            onClick={() => {
              updateLayerData({
                align: 'fullWidth',
              });
            }}
          >
            <Tooltip mouseLeaveDelay={0} title="分散对齐">
              <span>
                <FormatFullWidth size={fontSize} />
              </span>
            </Tooltip>
          </div>
        </div>
        <div className={style['icon-btn-box']}>
          <div className={classnames(style['icon-btn'], 'flex1')}>
            <LateralDrag
              title="行间距"
              icon={<LineHeight style={{ width: 30, height: 30 }} />}
              value={layer.tr?.font?.lineHeight}
              min={0.01}
              precision={2}
              onBeforeFocus={() => {
                if (textEditorFatory.quill) {
                  textEditorFatory.quill.setSelection(0, 0);
                }
              }}
              onChange={(val) => {
                if (textEditorFatory.quill) {
                  textEditorFatory.quill.container.style['lineHeight'] = `${val}`;
                  textEditorFatory.dispatchEvents('lineHeight');
                }
              }}
              onComplate={(num, isEnd) => {
                updateLayerData(
                  {
                    lineHeight: num,
                  },
                  isEnd,
                );
              }}
            />
          </div>
          <div className={classnames(style['icon-btn'], 'flex1')}>
            <LateralDrag
              title="字间距"
              icon={<LetterSpace style={{ width: 30, height: 30 }} />}
              value={layer.tr?.font?.letterSpacing}
              precision={0}
              min={-Fn.calc.removeUnit(layer.tr?.font?.defaultSize)}
              onBeforeFocus={() => {
                if (textEditorFatory.quill) {
                  textEditorFatory.quill.setSelection(0, 0);
                }
              }}
              onChange={(val) => {
                if (textEditorFatory.quill) {
                  textEditorFatory.quill.container.style['letterSpacing'] = `${val}px`;
                  textEditorFatory.dispatchEvents('letterSpacing');
                }
              }}
              onComplate={(num, isEnd) => {
                updateLayerData(
                  {
                    letterSpacing: num,
                  },
                  isEnd,
                );
              }}
            />
          </div>
        </div>
      </PanelLine>
      <PanelLine
        title="颜色"
        extraRender={() => (
          <Colorful
            type={1}
            data={{
              c: Array.isArray(format.color)
                ? layer.tr?.font?.defaultColor
                : Fn.trans.colorStrToRgba(format.color as string, layer?.tr?.font?.defaultColor),
              isLinear: false,
            }}
            onChangeComplete={({ color }, isEnd) => {
              // 保存最后一次值
              textEditorFatory.setColor(Fn.trans.rgbaToRgbaStr(color as RgbaColor));
              if (!textEditorFatory.isSelection()) {
                updateLayerData(
                  {
                    defaultColor: color as RgbaColor,
                  },
                  isEnd,
                );
              }
            }}
          >
            {({ isLinear, color }) => {
              return (
                <div>
                  <ColorPreView isLinear={isLinear} color={color} isMore={Array.isArray(format.color)} />
                </div>
              );
            }}
          </Colorful>
        )}
      >
        <PanelLine.InLineItem title="填充">
          <div className="flex flex-end gap-8">
            {layer?.tr?.font?.ishaveFillColor ? (
              <>
                <Colorful
                  type={2}
                  data={{
                    isLinear: true,
                    linear: layer.tr?.font?.fillColor,
                  }}
                  onChangeComplete={({ color }, isEnd = true) => {
                    updateLayerData(
                      {
                        fillColor: color as LinearColor,
                      },
                      isEnd,
                    );
                  }}
                >
                  {({ isLinear, color }) => (
                    <div>
                      <ColorPreView isLinear={isLinear} color={color} />
                    </div>
                  )}
                </Colorful>
                <Tooltip
                  mouseLeaveDelay={0}
                  mouseEnterDelay={1}
                  title={layer?.tr?.font?.isShowFillColor ? '隐藏' : '显示'}
                >
                  <div
                    className="cursor-pointer"
                    onClick={() => {
                      updateLayerData({
                        isShowFillColor: !layer?.tr?.font?.isShowFillColor,
                      });
                    }}
                  >
                    {layer?.tr?.font?.isShowFillColor ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                  </div>
                </Tooltip>
              </>
            ) : null}
            <Tooltip
              mouseLeaveDelay={0}
              mouseEnterDelay={1}
              title={layer?.tr?.font?.isShowFillColor ? '删除' : '添加填充'}
            >
              <div
                className="cursor-pointer"
                onClick={() => {
                  updateLayerData({
                    ishaveFillColor: !layer?.tr?.font?.ishaveFillColor,
                    isShowFillColor: !layer?.tr?.font?.ishaveFillColor,
                    fillColor: !layer?.tr?.font?.ishaveFillColor ? linears[27] : null,
                  });
                }}
              >
                {layer?.tr?.font?.ishaveFillColor ? <MinusOutlined /> : <PlusOutlined />}
              </div>
            </Tooltip>
          </div>
        </PanelLine.InLineItem>
        <PanelLine.InLineItem title="描边">
          <div className="flex flex-end gap-8">
            {layer?.tr?.font?.ishaveStroke ? (
              <>
                <div className={style['stroke-width-box']}>
                  <LateralDrag
                    title=""
                    value={layer?.tr?.font?.strokeWidth || 0}
                    min={0}
                    precision={0}
                    onChange={(num, isEnd) => {
                      updateLayerData(
                        {
                          strokeWidth: num,
                        },
                        isEnd,
                      );
                    }}
                    onComplate={(num, isEnd) => {
                      updateLayerData(
                        {
                          strokeWidth: num,
                        },
                        isEnd,
                      );
                    }}
                  />
                </div>
                <Colorful
                  type={2}
                  data={{
                    isLinear: true,
                    linear: layer.tr?.font?.strokeColor,
                  }}
                  onChangeComplete={({ color }, isEnd = true) => {
                    updateLayerData(
                      {
                        isShowStroke: true,
                        strokeWidth: layer?.tr?.font?.strokeWidth || 5,
                        strokeColor: color as LinearColor,
                      },
                      isEnd,
                    );
                  }}
                >
                  {({ isLinear, color }) => (
                    <div>
                      <ColorPreView isLinear={isLinear} color={color} />
                    </div>
                  )}
                </Colorful>
                <Tooltip
                  mouseLeaveDelay={0}
                  mouseEnterDelay={1}
                  title={layer?.tr?.font?.isShowStroke ? '隐藏' : '显示'}
                >
                  <div
                    className="cursor-pointer"
                    onClick={() => {
                      updateLayerData({
                        isShowStroke: !layer?.tr?.font?.isShowStroke,
                      });
                    }}
                  >
                    {layer?.tr?.font?.isShowStroke ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                  </div>
                </Tooltip>
              </>
            ) : null}
            <Tooltip
              mouseLeaveDelay={0}
              mouseEnterDelay={1}
              title={layer?.tr?.font?.ishaveStroke ? '删除' : '添加描边'}
            >
              <div
                className="cursor-pointer"
                onClick={() => {
                  updateLayerData({
                    ishaveStroke: !layer?.tr?.font?.ishaveStroke,
                    isShowStroke: !layer?.tr?.font?.ishaveStroke,
                    strokeColor: !layer?.tr?.font?.ishaveStroke ? linears[0] : null,
                    strokeWidth:
                      Math.max(...[].concat(format.size as never).map((num) => Fn.calc.removeUnit(num as string)), 50) /
                      10,
                  });
                }}
              >
                {layer?.tr?.font?.ishaveStroke ? <MinusOutlined /> : <PlusOutlined />}
              </div>
            </Tooltip>
          </div>
        </PanelLine.InLineItem>
      </PanelLine>
    </div>
  );
};
export default TextPanel;
