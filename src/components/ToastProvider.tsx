'use client';

import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

type ToastMode = 'error' | 'warning' | 'normal';

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
    setToasts([]);
  };

  const hideLatest = () => {
    setToasts(toasts => toasts.slice(0, -1));
  };

  const hideToast = (id: string) => {
    setToasts(toasts => toasts.filter(toast => toast.id != id));
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
      }, 500);
    });

    return () => timeouts.forEach(timeout => clearTimeout(timeout));
  }, [toastsToAnimateOut]);

  return (
    <ToastContext.Provider value={toastHandler}>
      {children}
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`${
            toastsToAnimateOut.find(t => t.id == toast.id)
              ? 'animate-slide-out'
              : 'animate-slide-in'
          } absolute bottom-10 right-10 ${
            toast.mode == 'error'
              ? 'bg-red-600'
              : toast.mode == 'warning'
              ? 'bg-yellow-600'
              : 'bg-slate-800'
          } text-slate-200 p-4 rounded-md shadow-md flex gap-4 transition-all duration-500`}
        >
          <div className="flex-1">{toast.message}</div>
          <button className="flex-none" onClick={() => hideToast(toast.id)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-slate-200 hover:text-slate-100 transition-all duration-150"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
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
