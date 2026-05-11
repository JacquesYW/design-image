import { Modal } from 'antd';
// import style from "./index.module.less";

interface SizeModalProps {
  viseble: boolean;
  onCancel: () => void;
  onOk: () => void;
}
const SizeModal = (props: SizeModalProps) => {
  const { viseble, onCancel, onOk } = props;
  return (
    <Modal
      open={viseble}
      title="画布尺寸"
      onCancel={onCancel}
      onOk={() => {
        onOk();
      }}
    >
      <div className="">
        <div></div>
        <div></div>
      </div>
    </Modal>
  );
};

export default SizeModal;
