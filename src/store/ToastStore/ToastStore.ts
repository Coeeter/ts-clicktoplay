import { create } from 'zustand';
import { ToastActions, ToastState } from './types';
import { createToast, removeAllToasts, removeToast } from './actions';

export const useToastStore = create<ToastState & ToastActions>(set => ({
  toasts: [],
  createToast: (...args) => set(createToast(...args)),
  removeToast: toast => set(removeToast(toast)),
  removeAllToasts: () => set(removeAllToasts),
}));
