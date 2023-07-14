'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MdHome, MdSearch } from 'react-icons/md';

import { Playlist } from '@prisma/client';

const sidebarItems = [
  {
    name: 'Home',
    href: '/',
    icon: <MdHome size={24} />,
  },
  {
    name: 'Search',
    href: '/search',
    icon: <MdSearch size={24} />,
  },
];

export const Sidebar = ({ playlists }: { playlists: Playlist[] }) => {
  const session = useSession();
  const pathName = usePathname();

  return (
    <div className="w-1/3 gap-3 flex flex-col h-full">
      <div className="flex flex-col bg-slate-800 rounded-md m-3 mb-0 px-4 py-3 gap-3">
        {sidebarItems.map(({ name, href, icon }) => (
          <Link
            key={name}
            href={href}
            className={`text-md hover:text-slate-200 duration-150 font-semibold ${
              pathName === href ? 'text-slate-200' : 'text-slate-300/50'
            }`}
          >
            <div className="flex items-center gap-5">
              {icon}
              {name}
            </div>
          </Link>
        ))}
      </div>
      <div className="flex-grow bg-slate-800 rounded-md m-3 mt-0 ">
        {session.status === 'loading' ? (
          <div className="animate-pulse w-full h-full">
            <div className="h-full w-full bg-slate-700 rounded-md"></div>
          </div>
        ) : session.status === 'authenticated' ? (
          <div className="px-4 py-3 gap-3 flex flex-col">
            <div className="text-lg text-slate-300 font-semibold">
              Your Playlists
            </div>
            {playlists.length === 0 ? (
              <div className="text-md text-slate-300/50 font-semibold">
                No playlists found
              </div>
            ) : null}
            <div className="flex flex-col gap-3">
              {playlists.map(({ id, title }) => (
                <Link
                  key={id}
                  href={`/playlist/${id}`}
                  className={`text-md hover:text-slate-200 duration-150 font-semibold ${
                    pathName === `/playlist/${id}`
                      ? 'text-slate-200'
                      : 'text-slate-300/50'
                  }`}
                >
                  {title}
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="px-4 py-3 gap-3 flex flex-col">
            <div className="text-lg text-slate-300 font-semibold">
              Your Playlists
            </div>
            <div className="text-md text-slate-300/50 font-semibold">
              Please login to view your playlists
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
