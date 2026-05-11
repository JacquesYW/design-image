import classnames from "classnames";
import style from "./index.module.less";
interface PanelTitleProps {
  list: Array<{
    label: string;
    value: string;
  }>;
  active: string;
  onChange: (value: string) => void;
}
const PanelTitle = (props: PanelTitleProps) => {
  return (
    <div className={style["panel-title"]}>
      {props.list.map((item) => {
        return (
          <div
            key={item.value}
            className={classnames(style["title-tab"], { [style["active"]]: props.active === item.value })}
            onClick={() => {
              if (props.active !== item.value) {
                props.onChange(item.value);
              }
            }}
          >
            {item.label}
          </div>
        );
      })}
    </div>
  );
};

export default PanelTitle;
