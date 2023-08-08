import { create } from 'zustand';

export type ToastMode = 'error' | 'warning' | 'normal' | 'success';

export type Toast = {
  id: string;
  message: string;
  mode: ToastMode;
  duration?: number;
};

export type ToastState = {
  toasts: Toast[];
};

export type ToastActions = {
  createToast: (message: string, mode: ToastMode, duration?: number) => void;
  removeToast: (toast: string | Toast) => void;
  removeAllToasts: () => void;
};

export const useToastStore = create<ToastState & ToastActions>(set => ({
  toasts: [],
  createToast: (message, mode, duration = 2000) => {
    set(state => ({
      toasts: [
        ...state.toasts,
        {
          id: Math.random().toString(36).substring(2, 9),
          message,
          mode,
          duration,
        },
      ],
    }));
  },
  removeToast: toast => {
    set(state => ({
      toasts: state.toasts.filter(
        t => t.id !== (typeof toast === 'string' ? toast : toast.id)
      ),
    }));
  },
  removeAllToasts: () => {
    set({ toasts: [] });
  },
}));
