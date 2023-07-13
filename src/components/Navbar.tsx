'use client';

import { useOutsideClick } from '@/hooks/useOutsideClick';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRef, useState } from 'react';

export const Navbar = () => {
  const ref = useRef(null);
  const pathName = usePathname();
  const [showDropDown, setShowDropDown] = useState(false);
  const { data, status } = useSession();
  useOutsideClick(ref, () => setShowDropDown(false));

  const dropDownItems = [
    {
      name: 'Profile',
      href: '/profile',
    },
    {
      name: 'Settings',
      href: '/settings',
    },
    {
      name: 'Logout',
      href: `/logout`,
    },
  ];

  return (
    <nav className="bg-slate-800 text-slate-300">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/" className="text-2xl text-slate-200 font-bold">
            ClickToPlay
          </Link>
        </div>
        <div className="flex items-center">
          {status === 'loading' ? (
            <div className="animate-pulse">
              <div className="bg-slate-700 w-10 h-10 rounded-full mr-3"></div>
            </div>
          ) : status === 'authenticated' && data.user !== null ? (
            <>
              <img
                src={data.user!.image ?? '/default-user.png'}
                alt={data.user!.name ?? ''}
                className="w-10 h-10 rounded-full mr-3 cursor-pointer"
                onClick={() => setShowDropDown(!showDropDown)}
              />
              <div className="relative">
                {showDropDown && (
                  <div
                    ref={ref}
                    className="absolute right-0 top-10 w-48 bg-slate-800 rounded-md shadow-lg py-1 z-10"
                  >
                    {dropDownItems.map((item, i) => (
                      <Link
                        href={
                          item.name === 'Logout'
                            ? `${item.href}?callbackUrl=${encodeURIComponent(
                                window.location.href
                              )}`
                            : item.href
                        }
                        key={i}
                        onClick={() => setShowDropDown(false)}
                        className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-slate-100"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            pathName === '/login' || (
              <Link
                href={`/login?callbackUrl=${encodeURIComponent(
                  window.location.href
                )}`}
                className="text-slate-300 hover:bg-slate-700 px-3 py-2 rounded-md transition-all duration-150"
              >
                Login
              </Link>
            )
          )}
        </div>
      </div>
    </nav>
  );
};
