'use client';

import { createContext, useCallback, useContext, useState } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes, FaExclamationTriangle } from 'react-icons/fa';

const ToastContext = createContext();
export const useToast = () => useContext(ToastContext);

function Toast({ toast, onClose }) {
  const cfg = {
    success: { icon: <FaCheckCircle className="text-green-500 text-xl" />, bg: 'bg-green-50 border-green-200', text: 'text-green-900' },
    error:   { icon: <FaExclamationCircle className="text-red-500 text-xl" />, bg: 'bg-red-50 border-red-200', text: 'text-red-900' },
    warning: { icon: <FaExclamationTriangle className="text-yellow-600 text-xl" />, bg: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-900' },
    info:    { icon: <FaInfoCircle className="text-blue-500 text-xl" />, bg: 'bg-blue-50 border-blue-200', text: 'text-blue-900' },
  };
  const s = cfg[toast.type] || cfg.info;
  return (
    <div className={`${s.bg} border-2 rounded-lg shadow-lg p-4 min-w-[320px] max-w-md flex items-start gap-3 pointer-events-auto`}>
      <div className="flex-shrink-0 mt-0.5">{s.icon}</div>
      <p className={`flex-1 text-sm ${s.text}`}>{toast.message}</p>
      <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
        <FaTimes />
      </button>
    </div>
  );
}

export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((p) => [...p, { id, message, type }]);
    if (duration > 0) setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), duration);
    return id;
  }, []);

  const remove = useCallback((id) => setToasts((p) => p.filter((t) => t.id !== id)), []);

  const ctx = {
    success: (msg, dur) => addToast(msg, 'success', dur),
    error:   (msg, dur) => addToast(msg, 'error', dur),
    info:    (msg, dur) => addToast(msg, 'info', dur),
    warning: (msg, dur) => addToast(msg, 'warning', dur),
    addToast, remove,
  };

  return (
    <ToastContext.Provider value={ctx}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] space-y-2 pointer-events-none" aria-live="polite">
        {toasts.map((t) => (
          <Toast key={t.id} toast={t} onClose={() => remove(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}