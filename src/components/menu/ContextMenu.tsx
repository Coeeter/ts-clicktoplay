'use client';
import { NavigationLink } from '@/hooks/useNavigation';
import { useOutsideClick } from '@/hooks/useOutsideClick';
import { ContextMenuItem, useContextMenuStore } from '@/store/ContextMenuStore';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { MdNavigateNext } from 'react-icons/md';

export const ContextMenu = () => {
  const isOpen = useContextMenuStore(state => state.isOpen);
  const position = useContextMenuStore(state => state.position);
  const menuItems = useContextMenuStore(state => state.menuItems);
  const closeMenu = useContextMenuStore(state => state.closeContextMenu);
  const transformOrigin = useContextMenuStore(state => state.transformOrigin);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const onResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    onResize();

    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  if (isMobile && isOpen) {
    return (
      <AnimatePresence>
        <motion.div
          className="absolute top-0 left-0 right-0 bottom-0 bg-slate-700/80 z-[999]"
          initial={{ y: 10 }}
          animate={{ y: 0 }}
          exit={{ y: 10 }}
          layout
        >
          <button onClick={closeMenu}>Close</button>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <Menu
      isOpen={isOpen}
      position={position}
      menuItems={menuItems}
      closeMenu={closeMenu}
      transformOrigin={transformOrigin}
    />
  );
};

const Menu = ({
  isOpen,
  position,
  menuItems,
  closeMenu,
  transformOrigin,
  isSubMenu = false,
}: {
  isOpen: boolean;
  position: { x: number; y: number };
  menuItems: ContextMenuItem[];
  closeMenu: () => void;
  transformOrigin: { vertical: 'top' | 'bottom'; horizontal: 'left' | 'right' };
  isSubMenu?: boolean;
}) => {
  const transformOriginAsString = `${transformOrigin.vertical} ${transformOrigin.horizontal}`;
  const [hoveredItem, setHoveredItem] = useState('');

  const ref = useRef<HTMLDivElement>(null);

  useOutsideClick({
    ref,
    callback: closeMenu,
  });

  useEffect(() => {
    if (isOpen) return;
    setHoveredItem('');
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeMenu();
      }
    };
    document.getElementById('root')?.addEventListener('resize', closeMenu);
    document.getElementById('root')?.addEventListener('scroll', closeMenu);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.getElementById('root')?.removeEventListener('resize', closeMenu);
      document.getElementById('root')?.removeEventListener('scroll', closeMenu);
    };
  }, [closeMenu]);

  useEffect(() => {
    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      closeMenu();
    };
    window.addEventListener('contextmenu', onContextMenu);
    return () => {
      window.removeEventListener('contextmenu', onContextMenu);
    };
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={ref}
          className={`w-56 bg-slate-900 rounded-md shadow-lg shadow-slate-900/80 absolute z-50 p-1 ${
            isSubMenu ? 'overflow-y-auto max-h-72' : ''
          }`}
          style={{
            translateX: transformOrigin.horizontal === 'right' ? '-100%' : 0,
            translateY: transformOrigin.vertical === 'bottom' ? '-100%' : 0,
            top: position.y,
            left: position.x,
            transformOrigin: transformOriginAsString,
          }}
          initial={{
            scale: 0.5,
            opacity: 0,
            y: -10,
          }}
          animate={{
            scale: 1,
            opacity: 1,
            y: 0,
          }}
          exit={{
            scale: 0.5,
            opacity: 0,
            y: -10,
          }}
        >
          {menuItems.map((item, i) => {
            return (
              <MenuItem
                key={i}
                item={item}
                onMouseEnter={() => setHoveredItem(item.label)}
                showDropdown={item.label === hoveredItem}
              />
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const MenuItem = ({
  item,
  onMouseEnter,
  showDropdown = false,
}: {
  item: ContextMenuItem;
  onMouseEnter?: () => void;
  showDropdown?: boolean;
}) => {
  const className = `
    flex
    items-center
    relative
    justify-between
    w-full
    text-start
    text-slate-200
    p-3
    rounded-md
    group
    ${item.selectable != false && !item.title ? 'hover:bg-slate-800' : ''}
    ${
      item.subMenu || item.selectable == false || item.title
        ? 'cursor-default'
        : 'cursor-pointer'
    }
    ${showDropdown && item.subMenu ? 'bg-slate-800' : ''}
    ${item.title ? 'text-slate-300/75 font-bold text-xs' : 'text-sm'}
  `
    .split(/\s+/)
    .join(' ')
    .trim();
  const close = useContextMenuStore(state => state.closeContextMenu);
  const transformOrigin = useContextMenuStore(state => state.transformOrigin);
  const position = useContextMenuStore(state => state.position);

  const ref = useRef<HTMLDivElement>(null);

  const willHorizontalOverflow = (element: HTMLElement) => {
    const subMenuWidth = element.clientWidth * 2 + 100;
    return position.x + subMenuWidth > window.innerWidth;
  };

  const willVerticalOverflow = (element: HTMLElement) => {
    if (!item.subMenu) return false;
    const subMenuHeight = item.subMenu.length * 50 + 100;
    const menuHeight = element.clientHeight + subMenuHeight + 100;
    return position.y + menuHeight > window.innerHeight;
  };

  const subMenuTransformOrigin = useMemo(() => {
    if (!ref.current || !item.subMenu) return transformOrigin;
    return {
      horizontal:
        willHorizontalOverflow(ref.current) &&
        transformOrigin.horizontal === 'left'
          ? 'right'
          : transformOrigin.horizontal,
      vertical:
        willVerticalOverflow(ref.current) && transformOrigin.vertical === 'top'
          ? 'bottom'
          : transformOrigin.vertical,
    };
  }, [transformOrigin, ref.current]);

  const subMenuPosition = useMemo(() => {
    if (!ref.current || !item.subMenu) return position;
    return {
      x: willHorizontalOverflow(ref.current) ? 0 : ref.current.clientWidth,
      y: willVerticalOverflow(ref.current) ? ref.current.offsetHeight : 0,
    };
  }, [position, ref.current]);

  const children = (
    <>
      <div className="flex gap-2 items-center">
        {item.icon && <item.icon size={18} />}
        {item.label}
      </div>
      {item.subMenu && <MdNavigateNext className="text-lg" />}
      {item.subMenu && showDropdown && ref.current && (
        <Menu
          isOpen={true}
          position={subMenuPosition}
          menuItems={item.subMenu}
          closeMenu={close}
          transformOrigin={subMenuTransformOrigin}
          isSubMenu={true}
        />
      )}
    </>
  );

  return (
    <>
      {item.subMenu ? (
        <div
          ref={ref}
          className={className}
          onMouseEnter={() => onMouseEnter?.()}
        >
          {children}
        </div>
      ) : item.href ? (
        <NavigationLink
          href={item.href}
          onClick={close}
          className={className}
          onMouseEnter={() => onMouseEnter?.()}
        >
          {children}
        </NavigationLink>
      ) : (
        <button
          className={className}
          onClick={() => {
            item.onClick?.();
            close();
          }}
          onMouseEnter={() => onMouseEnter?.()}
        >
          {children}
        </button>
      )}
      {item.divider && (
        <div className="h-[2px] bg-slate-700 rounded-full w-full my-1" />
      )}
    </>
  );
};
