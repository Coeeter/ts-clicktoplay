import { ContextMenuItem, useContextMenuStore } from '@/store/ContextMenuStore';
import React from 'react';

type ContextMenuButtonProps = {
  children: React.ReactNode;
  contextMenuItems: ContextMenuItem[];
  className?: string;
  onContextMenuOpen?: () => void;
  baseHorizontal?: 'left' | 'right';
  baseVertical?: 'top' | 'bottom';
};

export const ContextMenuButton = ({
  children,
  contextMenuItems,
  className,
  onContextMenuOpen,
  baseHorizontal = 'right',
  baseVertical = 'bottom',
}: ContextMenuButtonProps) => {
  const showContextMenu = useContextMenuStore(state => state.openContextMenu);

  return (
    <button
      className={className}
      onClick={e => {
        onContextMenuOpen?.();
        const rect = e.currentTarget.getBoundingClientRect();
        const scrollX = window.scrollX;
        const scrollY = window.scrollY;
        const menuX = rect[baseHorizontal] + scrollX;
        const menuY = rect[baseVertical] + scrollY;
        const heightOfMenu = 50 * contextMenuItems.length + 100;
        if (menuY + heightOfMenu - scrollY > window.innerHeight) {
          showContextMenu(menuX, rect.top + scrollY, contextMenuItems);
          useContextMenuStore.setState({
            transformOrigin: {
              horizontal: baseHorizontal,
              vertical: baseVertical,
            },
          });
          return;
        }
        showContextMenu(menuX, menuY, contextMenuItems);
      }}
    >
      {children}
    </button>
  );
};
