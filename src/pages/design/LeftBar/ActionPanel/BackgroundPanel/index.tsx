import photos from '@/assets/images/photos';
import style from './index.module.less';
import { EditData, EditFn, SourceData } from '@/pages/design/context';
import { BackgroundType } from '@/common/config';

const BackgroundPanel = () => {
  const sourceData = useContext(SourceData);
  const { updateBgImg, switchBgType } = useContext(EditFn);
  const { panelIndex } = useContext(EditData);
  const panelData = useMemo(() => sourceData.panels[panelIndex], [sourceData, panelIndex]);

  const ref = useRef(new Map());
  return (
    <div className={style['background-panel']}>
      <div className={style['background-panel-container']}>
        {photos.map((url, index) => {
          return (
            <div
              key={'photo' + index}
              className={style['background-panel-item']}
              onClick={() => {
                const { w = 0, h = 0 } = ref.current.get(index);
                const ms = Math.max(panelData.w / w, panelData.h / h);
                updateBgImg({
                  p: url,
                  w: w * ms,
                  h: h * ms,
                  imgW: w,
                  imgH: h,
                  tr: {
                    clip: {
                      x: -(w * ms - panelData.w) / 2,
                      y: -(h * ms - panelData.h) / 2,
                    },
                  },
                });
                if (panelData?.bg?.type == 'color') {
                  switchBgType(BackgroundType.IMAGE);
                }
              }}
            >
              <img
                src={url}
                alt=""
                onLoad={(e) => {
                  const img = e.target as HTMLImageElement;
                  ref.current.set(index, {
                    w: img.naturalWidth,
                    h: img.naturalHeight,
                  });
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BackgroundPanel;
