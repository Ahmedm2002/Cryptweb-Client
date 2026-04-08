import { Popup } from "../Popup";

export const Modal = ({ isOpen, onClose, title, children }) => {
  return (
    <Popup isOpen={isOpen} onClose={onClose}>
      {title && (
        <h3 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">
          {title}
        </h3>
      )}
      <div>{children}</div>
    </Popup>
  );
};
