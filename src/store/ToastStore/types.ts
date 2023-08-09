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
