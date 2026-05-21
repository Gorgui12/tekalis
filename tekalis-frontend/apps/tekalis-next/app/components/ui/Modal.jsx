import { useEffect } from "react";
import { FaTimes } from "react-icons/fa";

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer,
  size = "medium", // small, medium, large, full
  closeOnOverlayClick = true,
  showCloseButton = true,
  preventClose = false
}) => {
  // Empêcher le scroll du body quand le modal est ouvert
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Gestion de la touche Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen && !preventClose) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose, preventClose]);

  if (!isOpen) return null;

  // Tailles du modal
  const sizeClasses = {
    small: "max-w-md",
    medium: "max-w-2xl",
    large: "max-w-4xl",
    full: "max-w-7xl"
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && closeOnOverlayClick && !preventClose) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleOverlayClick}
      ></div>

      {/* Modal Container */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div 
          className={`relative bg-white rounded-lg shadow-xl ${sizeClasses[size]} w-full transform transition-all`}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between px-6 py-4 border-b">
              {title && (
                <h3 className="text-xl font-bold text-gray-900" id="modal-title">
                  {title}
                </h3>
              )}
              {showCloseButton && !preventClose && (
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition p-2 rounded-full hover:bg-gray-100"
                  aria-label="Fermer"
                >
                  <FaTimes size={20} />
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="px-6 py-4 border-t bg-gray-50">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Composants pré-configurés
export const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirmation", 
  message, 
  confirmText = "Confirmer",
  cancelText = "Annuler",
  confirmColor = "blue"
}) => {
  const colorClasses = {
    blue: "bg-blue-600 hover:bg-blue-700",
    red: "bg-red-600 hover:bg-red-700",
    green: "bg-green-600 hover:bg-green-700"
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="small"
      footer={
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 ${colorClasses[confirmColor]} text-white rounded-lg font-semibold transition`}
          >
            {confirmText}
          </button>
        </div>
      }
    >
      <p className="text-gray-700">{message}</p>
    </Modal>
  );
};

export default Modal;