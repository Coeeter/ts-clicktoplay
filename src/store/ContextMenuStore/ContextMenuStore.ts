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
  openContextMenu: (x, y, menuItems) => {
    const heightOfMenu = menuItems.length * 50 + 100;
    const widthOfMenu = 250;
    const rawY = y - window.scrollY;

    const transformOrigin = {
      vertical: rawY > window.innerHeight - heightOfMenu ? 'bottom' : 'top',
      horizontal: x > window.innerWidth - widthOfMenu ? 'right' : 'left',
    } as const;

    return set({
      isOpen: true,
      position: { x, y },
      transformOrigin: transformOrigin,
      menuItems,
    });
  },
  closeContextMenu: () =>
    set({
      isOpen: false,
      menuItems: [],
    }),
}));
