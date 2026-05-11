import { linears, pures } from './preset';
import { ColorPicker, InputNumber, Segmented, Tooltip } from 'antd';
import style from './index.module.less';
import Fn from '@/utils/utils';
import classnames from 'classnames';
import { Colorize } from '../svgIcon';
import { LinearColor, ColorBack } from '@/pages/design/interface';
import { TriggerPlacement } from 'antd/es/color-picker/interface';
import useEyeDropper from 'use-eye-dropper';
import ColorPreView from './ColorPreView';

// 自定义颜色选择器 - 支持渐变色
type changeParam = { isLinear: false | undefined; color: RgbaColor } | { isLinear: true; color: LinearColor };
type ColorPickerProps = {
  /* 
    0: 纯色 + 渐变
    1: 纯色
    2: 渐变
  */
  type: 0 | 1 | 2;
  children: (arg: changeParam) => React.ReactNode;
  data: ColorBack;
  // isEnd: 是否是最后一次change(用于撤销/重做功能是否记录数据的判断)
  onChangeComplete?: (arg: changeParam, isEnd?: boolean) => void;
};
const Colorful = (props: ColorPickerProps) => {
  const { c, isLinear, linear } = props.data || {};
  /* 
    isChange: 用于判断切换颜色类型是操作还是初始化
    isDown: 拖动渐变色节点起始状态
    focusEle: 用于聚焦失焦状态控制的element(input)
  */
  const ref = useRef({
    isChange: false,
    drag: {
      linearColor: null as LinearColor | null,
      index: null as number | null,
      isDown: false,
      isMove: false,
      x: 0,
    },
    linearLine: null as HTMLElement | null,
    focusEle: null as HTMLElement | null,
  });
  let newislinear = null;
  switch (props.type) {
    case 1:
      newislinear = false;
      break;
    case 2:
      newislinear = true;
      break;
    default:
      newislinear = isLinear;
  }
  const [islinear, setIsLinear] = useState<boolean | undefined>(newislinear);
  const [color, setColor] = useState<RgbaColor>();
  const [linearColor, setLinearColor] = useState<LinearColor>();
  const [linearColorIndex, setLinearColorIndex] = useState(0);
  // 用于判断是否聚焦到渐变色某个节点, 用于删除
  const [isChose, setIsChose] = useState(false);
  const { open, isSupported } = useEyeDropper();
  useEffect(() => {
    if (ref.current.isChange && props.onChangeComplete) {
      if (islinear) {
        props.onChangeComplete({ isLinear: islinear, color: linear || linears[0] }, ref.current.isChange);
      } else {
        props.onChangeComplete({ isLinear: islinear, color: c || pures[0] }, ref.current.isChange);
      }
      ref.current.isChange = false;
    }
  }, [islinear]);
  useEffect(() => {
    if (islinear || [2].includes(props.type)) {
      setLinearColor(linear || linears[0]);
    } else {
      setColor(c || pures[0]);
    }
  }, [c, linear]);
  useEffect(() => {
    /* 避免和图层的删除快捷操作冲突 */
    document.addEventListener('keyup', delLinearColor);
    return () => {
      document.removeEventListener('keyup', delLinearColor);
    };
  }, [linearColor, linearColorIndex, isChose]);
  /* 
    颜色透明度为0时, 修改颜色,将透明度改成1, 避免颜色操作后无交互反馈
  */
  const dealColorByOptimizeInteractions = useCallback(
    (col: RgbaColor) => {
      if (c) {
        if (c.r == col.r && c.g == col.g && c.b == col.b) {
          return col;
        } else {
          if (c.a == 0 && col.a == 0) {
            return {
              ...col,
              a: 1,
            };
          }
        }
      }
      return col;
    },
    [c],
  );
  // 更新颜色
  const changeColor = useCallback(
    (col: RgbaColor, isEnd?: boolean) => {
      if (islinear) {
        const newLinearColor = {
          ...linearColor,
          cs: (linearColor?.cs || []).map((item, index) => {
            if (index == linearColorIndex) {
              return {
                ...item,
                c: col,
              };
            } else {
              return item;
            }
          }),
        } as LinearColor;
        setLinearColor(newLinearColor);
        props.onChangeComplete?.(
          {
            isLinear: true,
            color: newLinearColor,
          },
          isEnd,
        );
      } else {
        const newCol = dealColorByOptimizeInteractions(col);
        setColor(newCol);
        props.onChangeComplete?.(
          {
            isLinear: false,
            color: newCol,
          },
          isEnd,
        );
      }
    },
    [linearColor, setLinearColor, setColor, props.onChangeComplete],
  );
  // 渐变色添加颜色
  const addLinearColor = useCallback(
    (e: React.MouseEvent) => {
      if (ref.current.drag.isDown) return;
      ref.current.focusEle && ref.current.focusEle.focus();
      const { left = 0, width = 0 } = ref.current.linearLine?.getBoundingClientRect() || {};
      // 所占百分比(颜色)
      const cent = (e.clientX - left) / width;
      /* 
      计算新加的渐变色
      对应的颜色(根据百分比选出现有渐变色相邻的2个渐变色)
      计算出新的渐变色位置和颜色值 (透明度默认 a = 1)
    */
      let i = 0;
      const newCsColor = {
        p: cent,
      } as { c: RgbaColor; p: number };
      if (linearColor?.cs) {
        const list = (linearColor.cs || []).filter((item, index) => {
          if (
            (item.p > cent && index == 0) ||
            (item.p < cent && index == linearColor.cs.length - 1) ||
            (item.p > cent && (linearColor.cs[index - 1].p || 0) < cent)
          ) {
            i = index;
            return true;
          }
          if (item.p < cent && (linearColor.cs[index + 1].p || 0) > cent) {
            i = index + 1;
            return true;
          }
          return false;
        });
        if (list.length == 1) {
          newCsColor.c = list[0].c;
        } else {
          newCsColor.c = {
            r: (list[0].c.r * (list[0].p + 1 - cent) + list[1].c.r * (list[1].p + 1 - cent)) / 2,
            g: (list[0].c.g * (list[0].p + 1 - cent) + list[1].c.g * (list[1].p + 1 - cent)) / 2,
            b: (list[0].c.b * (list[0].p + 1 - cent) + list[1].c.b * (list[1].p + 1 - cent)) / 2,
            a: 1,
          };
        }
      }
      const newCS = [...(linearColor?.cs || [])];
      newCS.splice(i, 0, newCsColor);
      newCsColor.c &&
        props.onChangeComplete?.({
          isLinear: true,
          color: {
            ...linearColor,
            cs: newCS,
          } as LinearColor,
        });
      setLinearColorIndex(i);
    },
    [linearColor, props.onChangeComplete, setLinearColorIndex],
  );
  // 渐变色删除颜色
  const delLinearColor = (e: KeyboardEvent) => {
    e.stopPropagation();
    // 删除键
    if (['Backspace', 'Delete'].includes(e.code)) {
      if (islinear && isChose && (linearColor?.cs.length || 0) > 2) {
        props.onChangeComplete?.({
          isLinear: true,
          color: {
            ...linearColor,
            cs: (linearColor?.cs || []).filter((item, index) => index != linearColorIndex),
          } as LinearColor,
        });
        // 删除后选中第一个
        setLinearColorIndex(0);
      }
    }
  };
  const dragLinearNode = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    ref.current.drag.x = e.clientX;
    ref.current.drag.index = index;
    ref.current.drag.isDown = true;
    ref.current.drag.linearColor = JSON.parse(JSON.stringify(linearColor));
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('mousemove', moveDrag);
  };
  const moveDrag = (e: MouseEvent) => {
    if (ref.current.drag.isDown && Math.abs(e.clientX - ref.current.drag.x) > 5) {
      ref.current.drag.isMove = true;
      dragLinearColor(e, false);
    }
  };
  const endDrag = (e: MouseEvent) => {
    if (ref.current.drag.isMove) {
      ref.current.drag.isMove = false;
      dragLinearColor(e, true);
      document.removeEventListener('mouseup', endDrag);
      document.removeEventListener('mousemove', moveDrag);
    }
    if (ref.current.drag.isDown) {
      ref.current.drag.isDown = false;
      ref.current.focusEle && ref.current.focusEle.focus();
      setLinearColorIndex(ref.current.drag.index as number);
      ref.current.drag.index = null;
      ref.current.drag.linearColor = null;
    }
  };
  // 渐变色节点拖动
  const dragLinearColor = (e: MouseEvent, isEnd: boolean) => {
    const { left = 0, width = 0 } = ref.current.linearLine?.getBoundingClientRect() || {};
    // 所占百分比(颜色)
    let cent = (e.clientX - left) / width;
    cent = cent < 0 ? 0 : cent > 1 ? 1 : cent;
    props.onChangeComplete?.(
      {
        isLinear: true,
        color: {
          ...ref.current.drag.linearColor,
          cs: (ref.current.drag.linearColor?.cs || []).map((item, index) => {
            if (index === ref.current.drag.index) {
              return {
                ...item,
                p: cent,
              };
            } else {
              return item;
            }
          }),
        } as LinearColor,
      },
      isEnd,
    );
  };
  return (
    /* colorPicker使用的 tooltip作为容器. 下面2个字段可以使用...但是ts没声明 */
    <ColorPicker
      getPopupContainer={() => document.getElementById('root') as HTMLElement}
      rootClassName="image-design-color-picker"
      placement={'left' as TriggerPlacement}
      destroyTooltipOnHide
      format="rgb"
      showText={false}
      value={Fn.trans.rgbaToRgbaStr((islinear ? linearColor?.cs[linearColorIndex]?.c : color) || ({} as RgbaColor))}
      // 实时变动
      onChange={(col) => {
        changeColor(col.toRgb(), false);
      }}
      // 完成变动后记录操作
      onChangeComplete={(col) => changeColor(col.toRgb())}
      panelRender={(panel, { components: { Picker } }) => {
        return (
          <div className={style['color-ful']}>
            <div className={style['title']}>颜色</div>
            {props.type == 0 ? (
              <Segmented
                block
                value={isLinear ? 1 : 0}
                className={style['segmented']}
                options={[
                  {
                    label: '纯色',
                    value: 0,
                  },
                  {
                    label: '渐变',
                    value: 1,
                  },
                ]}
                onChange={(value) => {
                  ref.current.isChange = true;
                  if (value == 0) {
                    setIsLinear(false);
                  } else {
                    setIsLinear(true);
                    setLinearColorIndex(0);
                  }
                }}
              />
            ) : null}
            {islinear && linear ? (
              <div className={style['linear-line-box']}>
                <div className={style['linear-line-container']}>
                  <div
                    className={style['linear-line']}
                    style={{
                      backgroundImage: Fn.trans.linearToLinearStr({ ...linear, angle: 90 }),
                    }}
                  />
                  <div
                    ref={(linearLine) => (ref.current.linearLine = linearLine)}
                    className={style['linear-line-node-box']}
                    onMouseUp={addLinearColor}
                  >
                    {linear.cs.map((item, index) => {
                      return (
                        <div
                          key={'linear-node' + index}
                          className={classnames(style['linear-line-node'], {
                            [style['active']]: index == linearColorIndex,
                            [style['can-del']]: isChose && (linear?.cs.length || 0) > 2,
                          })}
                          style={
                            {
                              '--line-left': `${item.p * 100}%`,
                            } as React.CSSProperties
                          }
                          onMouseDown={(e) => dragLinearNode(e, index)}
                        />
                      );
                    })}
                  </div>
                </div>
                <Degdisc
                  deg={90 - (linear.angle || 0)}
                  onChange={(deg, isEnd) => {
                    props.onChangeComplete?.(
                      {
                        isLinear: true,
                        color: {
                          ...linear,
                          angle: deg as number,
                        } as LinearColor,
                      },
                      isEnd,
                    );
                  }}
                >
                  <InputNumber
                    value={90 - (linear.angle || 0)}
                    max={180}
                    min={-180}
                    className={style['deg-input']}
                    formatter={(val) => {
                      return val + '°';
                    }}
                    onPressEnter={(e) => {
                      const val = Number((e.target as EventTarget & { value: string }).value?.replace(/["°"]/g, ''));
                      if (val > 180 || val < -180) return;
                      props.onChangeComplete?.({
                        isLinear: true,
                        color: {
                          ...linear,
                          angle: 90 - val,
                        } as LinearColor,
                      });
                    }}
                  />
                </Degdisc>
              </div>
            ) : null}
            <Picker />
            <div className={style['preset-box']}>
              <div className={style['preset-title']}>
                <div>{isLinear ? '渐变' : '颜色'}预设</div>
                {/* 颜色吸取功能-需要函数支持 */}
                {isSupported() ? (
                  <div
                    className={style['eyedropper']}
                    onClick={() => {
                      try {
                        open().then((res) => {
                          changeColor(Fn.trans.hexToRgba(res.sRGBHex).rgb);
                        });
                      } catch (error) {
                        console.log(error);
                      }
                    }}
                  >
                    <Colorize size={20} />
                  </div>
                ) : null}
              </div>
              <div className={style['preset-container']}>
                {isLinear
                  ? linears.map((item, index) => {
                      return (
                        <div
                          key={'linear' + index}
                          onClick={() => {
                            setLinearColorIndex(0);
                            props.onChangeComplete?.({ isLinear: true, color: item });
                          }}
                        >
                          <ColorPreView color={item} isLinear />
                        </div>
                      );
                    })
                  : pures.map((item, index) => {
                      return (
                        <div
                          key={'pure' + index}
                          onClick={() => {
                            props.onChangeComplete?.({ isLinear: false, color: item });
                          }}
                        >
                          <ColorPreView isBorder={index === 0} color={item} isLinear={false} />
                        </div>
                      );
                    })}
              </div>
            </div>
            {/* 用于触发渐变节点选中失焦状态 */}
            <div className={style['focus-ele']}>
              <input
                ref={(inp) => (ref.current.focusEle = inp)}
                onBlur={() => {
                  setIsChose(false);
                }}
                onFocus={() => {
                  setIsChose(true);
                }}
              />
            </div>
          </div>
        );
      }}
    >
      {islinear && linearColor ? props.children({ isLinear: true, color: linearColor }) : null}
      {!islinear && color ? props.children({ isLinear: false, color }) : null}
    </ColorPicker>
  );
};

export default Colorful;

interface DegdiscProps {
  children: React.ReactNode;
  // 0-360
  deg: number;
  onChange: (deg: number, isEnd: boolean) => void;
}
const Degdisc = (props: DegdiscProps) => {
  const DEGDISCBG = 'deg-disc-bg';
  const { deg } = props;
  const ref = useRef({
    isDown: false,
  });
  const [degVal, setDegVal] = useState(deg);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    setDegVal(deg);
  }, [deg]);
  const upEnd = (e: MouseEvent) => {
    calcDeg(e, true);
    document.removeEventListener('mousemove', calcDeg);
    document.removeEventListener('mouseup', upEnd);
    ref.current.isDown = false;
    document.body.style.userSelect = 'auto';
  };
  const calcDeg = (e: MouseEvent, isEnd = false) => {
    e.stopImmediatePropagation();
    e.stopPropagation();
    const ele = document.getElementById(DEGDISCBG);
    const { left = 0, top = 0, width = 48, height = 48 } = ele?.getBoundingClientRect() || {};
    if (!ref.current.isDown) {
      // 超出范围, 关闭弹框 (+8/-8,是包括了边框的宽高)
      if (e.clientX > left + width + 8 || e.clientX < left - 8 || e.clientY > top + height + 8 || e.clientY < top - 8) {
        setOpen(false);
      }
      return;
    }
    const x = e.clientX - left - width / 2;
    const y = e.clientY - top - height / 2;
    let newDeg = Math.atan2(Math.abs(y), Math.abs(x)) * (180 / Math.PI);
    // html的坐标系是右下为 + +
    if (x < 0) {
      newDeg = 180 - newDeg;
    }
    if (y > 0) {
      newDeg = -newDeg;
    }
    // 大于90为负数, 小于-90为正数(上正,下负)
    props.onChange && props.onChange(90 - Number(newDeg.toFixed(0)), isEnd);
  };
  const mouseDown = () => {
    ref.current.isDown = true;
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', calcDeg);
    document.addEventListener('mouseup', upEnd);
  };
  return (
    <Tooltip
      mouseLeaveDelay={0.05}
      placement="bottom"
      arrow={false}
      color="#fff"
      open={open}
      overlayInnerStyle={{ padding: 0 }}
      getPopupContainer={() => document.getElementById('root') as HTMLElement}
      onOpenChange={(open) => {
        if (!ref.current.isDown) {
          setOpen(open);
        }
      }}
      title={
        <div className={style['deg-disc']}>
          <div className={style['deg-disc-pan']} id={DEGDISCBG} onMouseDown={mouseDown}>
            <div
              className={style['deg-disc-pan-control']}
              style={{
                transform: `rotate(${-degVal}deg)`,
              }}
            >
              <div className={style['deg-disc-pan-pointer']}></div>
            </div>
          </div>
        </div>
      }
    >
      {props.children}
    </Tooltip>
  );
};
