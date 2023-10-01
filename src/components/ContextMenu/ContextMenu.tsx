'use client';

import { useOutsideClick } from '@/hooks/useOutsideClick';
import { ContextMenuItem, useContextMenuStore } from '@/store/ContextMenuStore';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useRef, useState, useMemo } from 'react';
import { MdNavigateNext } from 'react-icons/md';

export const ContextMenu = () => {
  const isOpen = useContextMenuStore(state => state.isOpen);
  const position = useContextMenuStore(state => state.position);
  const menuItems = useContextMenuStore(state => state.menuItems);
  const closeMenu = useContextMenuStore(state => state.closeContextMenu);
  const transformOrigin = useContextMenuStore(state => state.transformOrigin);

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
    window.addEventListener('resize', closeMenu);
    window.addEventListener('scroll', closeMenu);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', closeMenu);
      window.removeEventListener('scroll', closeMenu);
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
          className={`w-52 bg-slate-600 rounded-md shadow-2xl absolute z-50 p-1 max-h-72 ${isSubMenu ? 'overflow-y-auto' : ''}`}
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
    text-sm
    text-slate-200
    p-3
    rounded-md
    group
    ${item.selectable != false ? 'hover:bg-slate-700' : ''}
    ${
      item.subMenu || item.selectable == false
        ? 'cursor-default'
        : 'cursor-pointer'
    }
    ${showDropdown && item.subMenu ? 'bg-slate-700' : ''}
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
      {item.label}
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
        <Link
          href={item.href}
          onClick={close}
          className={className}
          onMouseEnter={() => onMouseEnter?.()}
        >
          {children}
        </Link>
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
        <div className="h-[2px] bg-slate-500 rounded-full w-full my-1" />
      )}
    </>
  );
};
