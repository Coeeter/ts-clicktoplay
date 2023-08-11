'use client';

import { useToastStore, Toast as ToastType } from '@/store/ToastStore';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import { MdCheck, MdClose, MdError, MdWarning } from 'react-icons/md';

export const Toast = () => {
  const toasts = useToastStore(state => state.toasts);

  return (
    <div className="flex flex-col gap-3 absolute bottom-3 right-3">
      <AnimatePresence>
        {toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  );
};

const ToastItem = ({ toast }: { toast: ToastType }) => {
  const hideToast = useToastStore(state => state.removeToast);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      hideToast(toast);
    }, toast.duration ?? 5000);
    return () => {
      clearTimeout(timeoutId);
    };
  }, [toast]);

  const icon =
    toast.mode == 'error' ? (
      <div className="bg-red-700 rounded-xl p-2">
        <MdError className="text-white" />
      </div>
    ) : toast.mode == 'warning' ? (
      <div className="bg-yellow-700 rounded-xl p-2">
        <MdWarning className="text-white" />
      </div>
    ) : toast.mode == 'success' ? (
      <div className="bg-green-700 rounded-xl p-2">
        <MdCheck className="text-white" />
      </div>
    ) : null;

  return (
    <motion.div
      key={toast.id}
      layout
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.5 }}
      className={`text-slate-200 p-4 rounded-md shadow-md flex gap-4 w-64 items-center ${
        toast.mode == 'error'
          ? 'bg-red-600'
          : toast.mode == 'warning'
          ? 'bg-yellow-600'
          : toast.mode == 'success'
          ? 'bg-green-600'
          : 'bg-slate-800'
      }`}
    >
      {icon}
      <div className="flex-1">{toast.message}</div>
      <button className="flex-none" onClick={() => hideToast(toast)}>
        <MdClose className="text-slate-200" />
      </button>
    </motion.div>
  );
};
