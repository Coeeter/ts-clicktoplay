'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { navigationBarItems } from './bottom-navbar';
import { AnimatePresence, motion } from 'framer-motion';

type NavigationLinkProps = {
  item: (typeof navigationBarItems)[number];
};

export const NavigationLink = ({ item }: NavigationLinkProps) => {
  const pathname = usePathname();

  return (
    <Link
      href={item.href}
      className={`${
        pathname === item.href
          ? 'text-slate-200 -translate-y-[10px]'
          : 'text-slate-400 hover:text-slate-300'
      } text-center flex flex-col items-center relative transition`}
    >
      {item.icon}
      <AnimatePresence>
        {pathname === item.href && (
          <motion.span
            layout={true}
            className="text-sm whitespace-nowrap absolute top-full"
          >
            {item.name}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  );
};
