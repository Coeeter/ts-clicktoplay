import { create } from 'zustand';
import { ContextMenuStore } from './types';

export const useContextMenuStore = create<ContextMenuStore>(set => ({
  isOpen: false,
  menuItems: [],
  position: { x: 0, y: 0 },
  transformOrigin: {
    vertical: 'top',
    horizontal: 'left',
  },
  openContextMenu: (x, y, menuItems) =>
    set({
      isOpen: true,
      position: { x, y },
      transformOrigin: {
        vertical: y > window.innerHeight - 420 ? 'bottom' : 'top',
        horizontal: x > window.innerWidth - 420 ? 'right' : 'left',
      },
      menuItems,
    }),
  closeContextMenu: () =>
    set({
      isOpen: false,
      menuItems: [],
    }),
}));
