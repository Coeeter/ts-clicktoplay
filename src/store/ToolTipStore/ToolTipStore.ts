import { ReactNode, RefObject } from 'react';
import { create } from 'zustand';

export type ToolTipPlace =
  | 'left'
  | 'right'
  | `top-${'left' | 'center' | 'right'}`
  | `bottom-${'left' | 'center' | 'right'}`;

export type ToolTipStore<T extends HTMLElement> = {
  ref: React.RefObject<T | null> | null;
  content: ReactNode | null;
  place?: ToolTipPlace | null;
  addTooltop: (
    ref: RefObject<T | null>,
    content: ReactNode,
    place?: ToolTipPlace
  ) => void;
  removeTooltip: () => void;
};

export const useToolTipStore = create<ToolTipStore<HTMLElement>>(set => ({
  ref: null,
  content: null,
  place: null,
  addTooltop: (ref, content, place) => {
    set({ ref, content, place });
  },
  removeTooltip: () => {
    set({ ref: null, content: null, place: null });
  },
}));
