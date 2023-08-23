'use client';

import { useOutsideClick } from '@/hooks/useOutsideClick';
import { ContextMenuItem, useContextMenuStore } from '@/store/ContextMenuStore';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { ReactNode, useEffect, useRef } from 'react';

export const ContextMenu = () => {
  const isOpen = useContextMenuStore(state => state.isOpen);
  const position = useContextMenuStore(state => state.position);
  const menuItems = useContextMenuStore(state => state.menuItems);
  const closeMenu = useContextMenuStore(state => state.closeContextMenu);
  const transformOrigin = useContextMenuStore(state => state.transformOrigin);
  const transformOriginAsString = `${transformOrigin.vertical} ${transformOrigin.horizontal}`;

  const ref = useRef<HTMLDivElement>(null);

  useOutsideClick({
    ref,
    callback: closeMenu,
  });

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
    }
    window.addEventListener('contextmenu', onContextMenu);
    return () => {
      window.removeEventListener('contextmenu', onContextMenu);
    }
  }, [])

  return (
    <div
      ref={ref}
      className={`absolute z-50 ${
        transformOrigin.horizontal === 'right' ? '-translate-x-[100%]' : null
      } ${
        transformOrigin.vertical === 'bottom' ? '-translate-y-[100%]' : null
      }`}
      style={{ top: position.y, left: position.x }}
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{
              scale: 0.5,
              opacity: 0,
              y: -10,
              transformOrigin: transformOriginAsString,
            }}
            animate={{
              scale: 1,
              opacity: 1,
              y: 0,
              transformOrigin: transformOriginAsString,
            }}
            exit={{
              scale: 0.5,
              opacity: 0,
              y: -10,
              transformOrigin: transformOriginAsString,
            }}
            className="w-48 bg-slate-600 rounded-md shadow-lg py-1"
          >
            {menuItems.map((item, i) => {
              return (
                <Parent
                  key={i}
                  className="block w-full text-start px-4 py-2 text-sm text-slate-300 hover:bg-slate-700"
                  item={item}
                >
                  {item.label}
                </Parent>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Parent = ({
  children,
  className,
  item,
}: {
  children: ReactNode;
  className: string;
  item: ContextMenuItem;
}) => {
  const close = useContextMenuStore(state => state.closeContextMenu);

  return item.href ? (
    <Link href={item.href} onClick={close} className={className}>
      {children}
    </Link>
  ) : (
    <button
      className={className}
      onClick={() => {
        item.onClick?.();
        close();
      }}
    >
      {children}
    </button>
  );
};
