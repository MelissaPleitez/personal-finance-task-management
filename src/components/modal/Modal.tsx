
interface ModalProps {
  title: string;
  content: string;
  onClose: () => void;
}

const Modal = ({title, content, onClose}: ModalProps) => {
  return (
    <div className="modal">
      <div className="modal-content">
        <h2>{title}</h2>
        <p>{content}</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default Modal;