import { createContext, useContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';

const ToastContext = createContext(null);

export const useToast = () => useContext(ToastContext);

const ToastContainer = ({ toasts, removeToast }) => {
  return createPortal(
    <div className="fixed inset-x-0 top-4 z-50 flex flex-col items-center gap-2 px-4">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`glass-panel rounded-2xl px-4 py-2 text-sm shadow-xl ${
              toast.type === 'error' ? 'border-red-300 text-red-700' : 'border-emerald-300 text-emerald-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <span>{toast.message}</span>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-xs text-slate-500 hover:text-slate-800"
              >
                ✕
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>,
    document.body
  );
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type: toast.type || 'info', message: toast.message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, toast.duration || 3500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};


