'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { useOutsideClick } from '@/hooks/useOutsideClick';

type NavItem = {
  name: string;
  href: string;
};

export const Navbar = () => {
  const ref = useRef(null);
  const imgRef = useRef(null);
  const pathName = usePathname();
  const [showDropDown, setShowDropDown] = useState(false);
  const [dropDownItems, setDropDownItems] = useState<NavItem[]>([]);
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const { data, status } = useSession();

  useOutsideClick({
    ref,
    callback: () => setShowDropDown(false),
    ignoreRef: imgRef,
  });

  useEffect(() => {
    if (status === 'authenticated' && data.user !== null) {
      setNavItems([
        {
          name: 'Upload Songs',
          href: '/songs/upload',
        },
      ]);
      const isUserLoggingOut = pathName === '/logout';
      const callbackUrl = isUserLoggingOut
        ? new URLSearchParams(window.location.search)
            .get('callbackUrl')!
            .toString()
        : window.location.href;
      setDropDownItems([
        {
          name: 'Profile',
          href: `/profile/${data.user.id}`,
        },
        {
          name: 'Settings',
          href: '/settings',
        },
        {
          name: 'Logout',
          href: `/logout?callbackUrl=${encodeURIComponent(callbackUrl)}`,
        },
      ]);
      return;
    }
    const isUserLoggingIn = pathName === '/login';
    const callbackUrl = isUserLoggingIn
      ? new URLSearchParams(window.location.search)
          .get('callbackUrl')!
          .toString()
      : window.location.href;
    setNavItems([
      {
        name: 'Login',
        href: `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`,
      },
    ]);
    setDropDownItems([]);
  }, [status, data, pathName]);

  return (
    <nav className="bg-slate-800 text-slate-300 m-3 ml-0 rounded-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/" className="text-3xl text-slate-200 font-bold">
            ClickToPlay
          </Link>
        </div>
        <div className="flex items-center gap-6">
          {navItems.map((item, i) => (
            <Link
              href={item.href}
              key={i}
              className={`hover:text-slate-200 px-3 py-2 rounded-md transition-all duration-150 ${
                pathName === item.href.split('?')[0]
                  ? 'text-slate-200 font-bold'
                  : 'text-slate-300/50'
              }`}
            >
              {item.name}
            </Link>
          ))}
          {status === 'authenticated' && data.user !== null ? (
            <div className="relative">
              <div className="animate-pulse absolute right-0">
                <div className="bg-slate-700 w-10 h-10 rounded-full mr-3"></div>
              </div>
              <div className="relative">
                <motion.img
                  src={data.user!.image ?? '/default-user.png'}
                  alt={data.user!.name ?? ''}
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
          ) : null}
        </div>
      </div>
    </nav>
  );
};
