import { ReactNode } from 'react';
import { create } from 'zustand';

type NavbarStore = {
  collapseColor?: string | null;
  collapsePx?: number | null;
  content?: ReactNode | null;
  setCollapseColor: (collapseColor: string | null) => void;
  setCollapsePx: (collapsePx: number | null) => void;
  setContent: (content: ReactNode | null) => void;
  reset: () => void;
};

export const useNavbarStore = create<NavbarStore>(set => ({
  collapseColor: null,
  collapsePx: null,
  content: null,
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
