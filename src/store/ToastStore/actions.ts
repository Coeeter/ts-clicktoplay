import { ToastMode, ToastState, Toast } from '../ToastStore';

const createToast = (
  message: string,
  mode: ToastMode,
  duration: number = 2000
): ((state: ToastState) => Partial<ToastState>) => {
  return state => ({
    toasts: [
      ...state.toasts,
      {
        id: Math.random().toString(36).substring(2, 9),
        message,
        mode,
        duration,
      },
    ],
  });
};

const removeToast = (
  toast: string | Toast
): ((state: ToastState) => Partial<ToastState>) => {
  return state => ({
    toasts: state.toasts.filter(
      t => t.id !== (typeof toast === 'string' ? toast : toast.id)
    ),
  });
};

const removeAllToasts = (): Partial<ToastState> => {
  return {
    toasts: [],
  };
};

export { createToast, removeToast, removeAllToasts };
