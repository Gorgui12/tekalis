import { useState, useEffect, createContext, useContext } from "react";
import { 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaInfoCircle, 
  FaTimes,
  FaExclamationCircle
} from "react-icons/fa";

// Context pour gérer les toasts globalement
const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
};

// Provider
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = "info", duration = 3000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type, duration }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const toast = {
    success: (message, duration) => addToast(message, "success", duration),
    error: (message, duration) => addToast(message, "error", duration),
    warning: (message, duration) => addToast(message, "warning", duration),
    info: (message, duration) => addToast(message, "info", duration)
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

// Container des toasts
const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-20 right-4 z-50 space-y-3 max-w-sm w-full">
      {toasts.map(toast => (
        <ToastItem 
          key={toast.id} 
          {...toast} 
          onClose={() => removeToast(toast.id)} 
        />
      ))}
    </div>
  );
};

// Item de toast
const ToastItem = ({ id, message, type, duration, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 300);
  };

  const configs = {
    success: {
      bg: "bg-green-500",
      icon: <FaCheckCircle />,
      title: "Succès"
    },
    error: {
      bg: "bg-red-500",
      icon: <FaExclamationCircle />,
      title: "Erreur"
    },
    warning: {
      bg: "bg-yellow-500",
      icon: <FaExclamationTriangle />,
      title: "Attention"
    },
    info: {
      bg: "bg-blue-500",
      icon: <FaInfoCircle />,
      title: "Information"
    }
  };

  const config = configs[type] || configs.info;

  return (
    <div 
      className={`${config.bg} text-white rounded-lg shadow-lg overflow-hidden transform transition-all duration-300 ${
        isExiting ? "translate-x-full opacity-0" : "translate-x-0 opacity-100"
      }`}
    >
      <div className="p-4 flex items-start gap-3">
        <div className="text-2xl flex-shrink-0">
          {config.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold mb-1">{config.title}</p>
          <p className="text-sm opacity-90">{message}</p>
        </div>
        <button
          onClick={handleClose}
          className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition flex-shrink-0"
        >
          <FaTimes />
        </button>
      </div>
      
      {/* Progress bar */}
      {duration && (
        <div className="h-1 bg-white bg-opacity-30">
          <div 
            className="h-full bg-white transition-all ease-linear"
            style={{ 
              animation: `shrink ${duration}ms linear`,
              width: "100%"
            }}
          />
        </div>
      )}

      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

// Composant Toast standalone (sans provider)
export const Toast = ({ message, type = "info", onClose, duration = 3000 }) => {
  return <ToastItem message={message} type={type} onClose={onClose} duration={duration} />;
};

export default Toast;