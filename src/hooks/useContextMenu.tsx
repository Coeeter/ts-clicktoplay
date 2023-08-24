import { ContextMenuItem, useContextMenuStore } from '@/store/ContextMenuStore';
import { MouseEventHandler } from 'react';

export const useContextMenu = () => {
  const showContextMenu = useContextMenuStore(state => state.openContextMenu);
  const hideContextMenu = useContextMenuStore(state => state.closeContextMenu);

  const contextMenuHandler = <T,>(
    menuItems: ContextMenuItem[] | (() => ContextMenuItem[])
  ): MouseEventHandler<T> => {
    return e => {
      e.preventDefault();
      e.stopPropagation();
      if (typeof menuItems === 'function') {
        return showContextMenu(e.pageX, e.pageY, menuItems());
      }
      showContextMenu(e.pageX, e.pageY, menuItems);
    };
  };

  return { contextMenuHandler, showContextMenu, hideContextMenu };
};
