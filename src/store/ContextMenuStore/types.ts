export type ContextMenuItem = {
  label: string;
  onClick?: () => void;
  href?: string;
  divider?: boolean;
  selectable?: boolean;
  subMenu?: ContextMenuItem[];
};

export type ContextMenuState = {
  isOpen: boolean;
  position: {
    x: number;
    y: number;
  };
  menuItems: ContextMenuItem[];
  transformOrigin: {
    vertical: 'top' | 'bottom';
    horizontal: 'left' | 'right';
  };
};

export type ContextMenuActions = {
  openContextMenu: (x: number, y: number, menuItems: ContextMenuItem[]) => void;
  closeContextMenu: () => void;
};

export type ContextMenuStore = ContextMenuState & ContextMenuActions;
