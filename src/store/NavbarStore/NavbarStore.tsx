import { ReactNode } from 'react';
import { create } from 'zustand';

type NavbarStore = {
  sticky: boolean;
  collapseColor?: string | null;
  collapsePx?: number | null;
  content?: {
    node: ReactNode | null;
    sticky: boolean;
  } | null;
  setSticky: (sticky: boolean) => void;
  setCollapseColor: (collapseColor: string | null) => void;
  setCollapsePx: (collapsePx: number | null) => void;
  setContent: (
    content: {
      node: ReactNode | null;
      sticky: boolean;
    } | null
  ) => void;
  reset: () => void;
};

export const useNavbarStore = create<NavbarStore>(set => ({
  sticky: false,
  collapseColor: null,
  collapsePx: null,
  content: null,
  setSticky: sticky => set({ sticky }),
  setCollapseColor: collapseColor => set({ collapseColor }),
  setCollapsePx: collapsePx => set({ collapsePx }),
  setContent: content => set({ content }),
  reset: () => {
    set({
      collapseColor: null,
      collapsePx: null,
      content: null,
    });
  },
}));
