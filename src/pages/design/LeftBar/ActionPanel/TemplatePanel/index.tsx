import { EditFn } from '@/pages/design/context';
import templates from './templist';
import style from './index.module.less';
const TemplatePanel = () => {
  const { changeTemplate } = useContext(EditFn);
  return (
    <div className={style['template-panel']}>
      {templates.map((item, index) => {
        return (
          <div
            key={index}
            onClick={() => {
              changeTemplate(item.mainData);
            }}
            className={style['template-panel-item']}
          >
            <img src={item.mainUrl} alt="" />
          </div>
        );
      })}
    </div>
  );
};

export default TemplatePanel;
