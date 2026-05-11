import style from './index.module.less';
import { EditData, EditFn, SourceData } from '../context';
import { UndoOutlined, RedoOutlined } from '@ant-design/icons';
import classnames from 'classnames';
import { Button, Tooltip, message } from 'antd';
import { DESIGNCANVASCONTENT } from '@/common/config';
import { toPng, toCanvas } from 'html-to-image';
import download from 'downloadjs';
import AnimationContext from '../Animation/display/AnimationContext';
import { AnimationManager } from '../Animation/animationManager';
import UPNG from 'upng-js';

/* 
    TODO:
    优化方案 - 思路:
    1. 编写纯预览页面(组件 - 编辑时也需要使用) - 按原比例渲染
    2. 使用侧通过transform: scale() 缩放尺寸
    3. 导出png/jpg/apng - 可以在服务端-执行预览页面, 然后执行截图并返回图片数据
*/

const TopBar = () => {
  const sourceData = useContext(SourceData);
  const { zoom, panelIndex } = useContext(EditData);
  const panelData = useMemo(() => sourceData.panels[panelIndex], [sourceData, panelIndex]);

  const { canRedo, canUndo, redo, undo, setGuide, updateWH } = useContext(EditFn);
  const { manager, addCallback, removeCallback, togglePreviewTimeline } = useContext(AnimationContext);
  const ref = useRef({ isGetApng: false });
  function getApng() {
    if (ref.current.isGetApng) {
      return;
    }
    if (manager && addCallback && removeCallback && togglePreviewTimeline) {
      const timeline = manager.getTimeline();
      const totalDuration = timeline?.totalDuration();
      if (!totalDuration) {
        message.warning('请先设置动画');
        return;
      }
      ref.current.isGetApng = true;
      const fr = 15;
      const fre = 1 / fr;
      let step = 1;
      let pngAry: ArrayBufferLike[] = [];
      let dels: number[] = [];
      let w = panelData.w,
        h = panelData.h;
      const callback = (state: AnimationManager['state']) => {
        if (state.previewingTimeline) {
          timeline!.pause();
          let dom = document.getElementById(DESIGNCANVASCONTENT);
          toCanvas(dom as HTMLElement, { pixelRatio: 1 || 1 / zoom }).then((data) => {
            dom = null;
            let ctx = data.getContext('2d');
            (w = data.width % 2 ? data.width - 1 : data.width), (h = data.height % 2 ? data.height - 1 : data.height);
            pngAry.push(new Uint8Array(ctx!.getImageData(0, 0, w, h).data).buffer);
            ctx = null;
            data.remove();
            dels.push(fre * 1000);
            step++;
            const nextT = fre * step;
            if (nextT <= totalDuration) {
              timeline!.seek(fre * step, false);
            } else {
              manager.stopPreviewTimelineBySelf();
            }
          });
        } else {
          ref.current.isGetApng = false;
          // let apng = UPNG.encode(pngAry, panelData.w, panelData.h, 0, dels);
          let apng = UPNG.encode(pngAry, w, h, 0, dels) as Uint8Array | null;
          download(apng!, 'test.png');
          apng = null;
          pngAry = [];
          dels = [];
          timeline!.pause();
          removeCallback(callback);
        }
      };

      addCallback(callback, false);
      manager.togglePreviewTimeline();
    } else {
      message.warning('请先设置动画');
    }
  }
  function setA4() {
    updateWH({ w: 2479, h: 3508 });
  }
  return (
    <div className={style['top-bar']} style={{ display: 'flex', gap: 20 }}>
      <div>TopBar</div>
      <div
        onClick={() => {
          setGuide(
            {
              show: !sourceData.guide?.show,
              vLines: sourceData.guide?.vLines || [],
              hLines: sourceData.guide?.hLines || [],
            },
            false,
          );
        }}
      >
        卡尺
      </div>
      <div className={style['unredo-box']}>
        <Tooltip mouseLeaveDelay={0} title="撤销(ctrl+z)">
          <div
            className={classnames(style['undo'], {
              [style['disabled']]: !canUndo,
            })}
            onClick={() => {
              if (canUndo) {
                undo();
              }
            }}
          >
            <UndoOutlined />
          </div>
        </Tooltip>
        <Tooltip mouseLeaveDelay={0} title="重做(ctrl+y)">
          <div
            className={classnames(style['redo'], {
              [style['disabled']]: !canRedo,
            })}
            onClick={() => {
              if (canRedo) {
                redo();
              }
            }}
          >
            <RedoOutlined />
          </div>
        </Tooltip>
      </div>
      <Button
        onClick={async () => {
          const dom = document.getElementById(DESIGNCANVASCONTENT) as HTMLElement;
          toPng(dom, { pixelRatio: 1 / zoom }).then((dataUrl) => {
            download(dataUrl, 'my-node.png');
          });
        }}
      >
        下载png
      </Button>
      <Button onClick={getApng}>生成apng</Button>
      <Button onClick={setA4}>A4</Button>
    </div>
  );
};
export default TopBar;
