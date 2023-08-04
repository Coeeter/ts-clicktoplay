'use client';

import { useCallbackUrl } from '@/hooks/useCallbackUrl';
import { useOutsideClick } from '@/hooks/useOutsideClick';
import { AnimatePresence, motion } from 'framer-motion';
import { Session } from 'next-auth';
import Link from 'next/link';
import { useRef, useState } from 'react';

type ProfileButtonProps = {
  session: Session;
};

export const ProfileButton = ({ session }: ProfileButtonProps) => {
  const ref = useRef(null);
  const imgRef = useRef(null);
  const [showDropDown, setShowDropDown] = useState(false);
  const callbackUrl = useCallbackUrl({ checkForPathname: '/logout' });
  const dropDownItems = [
    {
      name: 'Profile',
      href: `/profile/${session.user!.id}`,
    },
    {
      name: 'Settings',
      href: '/settings',
    },
    {
      name: 'Logout',
      href: `/logout?callbackUrl=${callbackUrl}`,
    },
  ];

  useOutsideClick({
    ref,
    callback: () => setShowDropDown(false),
    ignoreRef: imgRef,
  });

  return (
    <div className="relative">
      <div className="animate-pulse absolute right-0">
        <div className="bg-slate-700 w-10 h-10 rounded-full mr-3"></div>
      </div>
      <div className="relative">
        <motion.img
          src={session.user!.image ?? '/default-user.png'}
          alt={session.user!.name ?? ''}
          ref={imgRef}
          referrerPolicy="no-referrer"
          className="w-10 h-10 rounded-full mr-3 cursor-pointer"
          onClick={() => setShowDropDown(prev => !prev)}
          whileHover={{ scale: 1.1 }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
        />
        <AnimatePresence>
          {showDropDown && (
            <motion.div
              ref={ref}
              initial={{
                scale: 0.5,
                opacity: 0,
                y: -10,
                transformOrigin: 'top right',
              }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.5, opacity: 0, y: -10 }}
              className="absolute right-0 mt-2 w-48 bg-slate-700 rounded-md shadow-lg py-1 z-10"
            >
              {dropDownItems.map((item, i) => (
                <Link
                  href={item.href}
                  key={i}
                  onClick={() => setShowDropDown(false)}
                  className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
                >
                  {item.name}
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
