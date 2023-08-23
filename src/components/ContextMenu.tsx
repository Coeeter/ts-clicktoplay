'use client';

import { useOutsideClick } from '@/hooks/useOutsideClick';
import { ContextMenuItem, useContextMenuStore } from '@/store/ContextMenuStore';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { MdNavigateNext } from 'react-icons/md';

export const ContextMenu = () => {
  const isOpen = useContextMenuStore(state => state.isOpen);
  const position = useContextMenuStore(state => state.position);
  const menuItems = useContextMenuStore(state => state.menuItems);
  const closeMenu = useContextMenuStore(state => state.closeContextMenu);
  const transformOrigin = useContextMenuStore(state => state.transformOrigin);
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
          className={`w-52 bg-slate-600 rounded-md shadow-2xl absolute z-50 p-1`}
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
    block
    relative
    w-full
    text-start
    text-sm
    text-slate-200
    p-3
    rounded-md
    group
    hover:bg-slate-700
    ${item.subMenu ? 'cursor-default' : 'cursor-pointer'}
    ${showDropdown && item.subMenu ? 'bg-slate-700' : ''}
  `
    .split(/\s+/)
    .join(' ')
    .trim();
  const close = useContextMenuStore(state => state.closeContextMenu);
  const transformOrigin = useContextMenuStore(state => state.transformOrigin);

  const children = (
    <>
      {item.label}
      {item.subMenu && (
        <MdNavigateNext className="text-lg absolute right-2 top-1/2 -translate-y-1/2" />
      )}
      {item.subMenu && showDropdown && (
        <motion.div
          key={'sub-menu'}
          className="absolute z-50 w-52 bg-slate-600 rounded-md shadow-2xl p-1"
          style={{
            top: 0,
            left: transformOrigin.horizontal === 'left' ? '100%' : 'auto',
            right: transformOrigin.horizontal === 'right' ? '100%' : 'auto',
            transformOrigin: `${transformOrigin.vertical} ${transformOrigin.horizontal}`,
          }}
          initial={{
            opacity: 0,
            x: 10,
            scale: 0.5,
            y: -10,
          }}
          animate={{
            opacity: 1,
            x: 0,
            scale: 1,
            y: 0,
          }}
          exit={{
            opacity: 0,
            x: 10,
            scale: 0.5,
            y: -10,
          }}
        >
          {item.subMenu.map((item, i) => {
            return <MenuItem key={i} item={item} />;
          })}
        </motion.div>
      )}
    </>
  );

  return item.href ? (
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
  );
};
