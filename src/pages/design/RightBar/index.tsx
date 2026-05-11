import _ from 'lodash';
import { EditData, SourceData } from '../context';
import style from './index.module.less';
import BgEditPanel from './BgEditPanel';
import LayerList from './LayerList';
import PanelTitle from './PanelTitle';
import MaterialEditPanel from './MaterialEditPanel';
import AnimationEditPanel from './AnimationEditPanel';

const useTab = (selectLayers: string[]) => {
  const [active, setActive] = useState<string>('design');
  useEffect(() => {
    if (selectLayers.length <= 0 && active == 'animation') {
      setActive('design');
    }
  }, [selectLayers]);
  const TitleList = [
    { label: '设计', value: 'design' },
    { label: '图层', value: 'layers' },
  ];
  if (selectLayers.length == 1) {
    TitleList.push({ label: '动画', value: 'animation' });
  }
  return {
    TitleList,
    active,
    setActive,
  };
};

const RightBar = () => {
  const sourceData = useContext(SourceData);
  const { selectLayers } = useContext(EditData);

  const { active, setActive, TitleList } = useTab(selectLayers);

  if (_.isEmpty(sourceData)) return null;
  const renderEditPanel = () => {
    if (selectLayers.length > 0) {
      return <MaterialEditPanel />;
    }
    return <BgEditPanel />;
  };

  return (
    <div className={style['right-bar']} onKeyDown={(e) => e.stopPropagation()}>
      <PanelTitle list={TitleList} active={active} onChange={setActive} />
      {active === 'design' ? renderEditPanel() : null}
      {active === 'layers' ? <LayerList /> : null}
      {active === 'animation' && selectLayers.length > 0 ? <AnimationEditPanel /> : null}
    </div>
  );
};
export default RightBar;
