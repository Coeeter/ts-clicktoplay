'use client';

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { MdCheck, MdClose, MdError, MdWarning } from 'react-icons/md';

type ToastMode = 'error' | 'warning' | 'normal' | 'success';

type Toast = {
  id: string;
  message: string;
  mode: ToastMode;
  duration: number;
};

type UseToast = {
  createToast: (message: string, mode: ToastMode, duration?: number) => string;
  hideToast: (id: string) => void;
  hideLatest: () => void;
  hideAll: () => void;
} | null;

const ToastContext = createContext<UseToast>(null);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [toastsToAnimateOut, setToastsToAnimateOut] = useState<Toast[]>([]);

  const createToast = (
    message: string,
    mode: ToastMode,
    duration: number = 2000
  ) => {
    const id = Math.random().toString();

    setToasts(toasts => [
      ...toasts,
      {
        id,
        duration,
        message,
        mode,
      },
    ]);

    return id;
  };

  const hideAll = () => {
    setToastsToAnimateOut(toastsToAnimateOut => [
      ...toasts.map(toast => ({
        ...toast,
        animating: true,
      })),
      ...toastsToAnimateOut,
    ]);
  };

  const hideLatest = () => {
    setToastsToAnimateOut(toastsToAnimateOut => [
      ...toastsToAnimateOut,
      {
        ...toasts[toasts.length - 1],
        animating: true,
      },
    ]);
  };

  const hideToast = (id: string) => {
    setToastsToAnimateOut(toastsToAnimateOut => {
      const toast = toasts.find(toast => toast.id == id);
      if (!toast) return toastsToAnimateOut;
      return [
        ...toastsToAnimateOut,
        {
          ...toast,
          animating: true,
        },
      ];
    });
  };

  const toastHandler = {
    createToast: createToast,
    hideToast: hideToast,
    hideAll: hideAll,
    hideLatest: hideLatest,
  };

  useEffect(() => {
    const timeouts = toasts.map(toast => {
      return setTimeout(() => {
        setToastsToAnimateOut(toastsToAnimateOut => [
          ...toastsToAnimateOut,
          {
            ...toast,
            animating: true,
          },
        ]);
      }, toast.duration);
    });

    return () => timeouts.forEach(timeout => clearTimeout(timeout));
  }, [toasts]);

  useEffect(() => {
    const timeouts = toastsToAnimateOut.map(toast => {
      return setTimeout(() => {
        setToasts(toasts => {
          return toasts.filter(t => t.id != toast.id);
        });
        setToastsToAnimateOut(toastsToAnimateOut => {
          return toastsToAnimateOut.filter(t => t.id != toast.id);
        });
      }, 300);
    });

    return () => timeouts.forEach(timeout => clearTimeout(timeout));
  }, [toastsToAnimateOut]);

  const icon = (toast: Toast) => {
    switch (toast.mode) {
      case 'error':
        return (
          <div className="bg-red-700 rounded-xl p-2">
            <MdError className="text-white" />
          </div>
        );
      case 'warning':
        return (
          <div className="bg-yellow-700 rounded-xl p-2">
            <MdWarning className="text-white" />
          </div>
        );
      case 'success':
        return (
          <div className="bg-green-700 rounded-xl p-2">
            <MdCheck className="text-white" />
          </div>
        );
      default:
        return null;
    }
  };

  const backgroundColor = (toast: Toast) => {
    switch (toast.mode) {
      case 'error':
        return 'bg-red-600';
      case 'warning':
        return 'bg-yellow-600';
      case 'success':
        return 'bg-green-600';
      default:
        return 'bg-slate-800';
    }
  };

  const animation = (toast: Toast) => {
    if (toastsToAnimateOut.find(t => t.id == toast.id)) {
      return 'animate-slide-out';
    }
    return 'animate-slide-in';
  };

  return (
    <ToastContext.Provider value={toastHandler}>
      {children}
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`absolute bottom-10 right-10 text-slate-200 p-4 rounded-md shadow-md flex gap-4 transition-all duration-50 w-64 items-center ${backgroundColor(
            toast
          )} ${animation(toast)}`}
        >
          <div className="flex-none">{icon(toast)}</div>
          <div className="flex-1">{toast.message}</div>
          <button className="flex-none" onClick={() => hideToast(toast.id)}>
            <MdClose className="text-slate-200" size={18} />
          </button>
        </div>
      ))}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const toast = useContext(ToastContext);

  if (!toast) {
    throw new Error('Must use in ToastProvider context');
  }

  return toast!;
};
