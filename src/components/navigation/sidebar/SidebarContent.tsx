'use client';
import { Playlist } from '@/actions/playlist';
import { useToolTip } from '@/hooks/useToolTip';
import { Session } from 'next-auth';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { FaFolder, FaFolderOpen } from 'react-icons/fa';
import { MdHome, MdSearch } from 'react-icons/md';
import { SidebarItemList } from './SidebarItemList';
import { SidebarNewPlaylistButton } from './SidebarNewPlaylistButton';
import { useDebounce } from '@/hooks/useDebounce';
import { setSideBarOpen } from '@/actions/settings/settings';

const sidebarItems = [
  {
    name: 'Home',
    href: '/',
    icon: <MdHome size={32} />,
  },
  {
    name: 'Search',
    href: '/search',
    icon: <MdSearch size={32} />,
  },
];

type SidebarContentProps = {
  session: Session | null;
  playlists: Playlist[];
  playHistory: { id: string; lastPlayedAt: Date | null }[];
  sideBarOpen: boolean;
};

export const SidebarContent = ({
  session,
  playlists,
  playHistory,
  sideBarOpen,
}: SidebarContentProps) => {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState<boolean>(sideBarOpen);

  useDebounce(expanded, 2000, async value => {
    await setSideBarOpen(value);
  });

  const { register: registerLibraryButton } = useToolTip({
    content: expanded ? 'Collapse Your Library' : 'Expand Your Library',
  });

  const { register: registerSearchBtn } = useToolTip({
    content: 'Search',
  });

  const { register: registerHomeBtn } = useToolTip({
    content: 'Home',
  });

  return (
    <aside
      className={`gap-3 flex flex-col sticky top-3 bottom-3 max-h-[calc(100vh-7rem)] transition ${
        expanded ? 'w-1/4' : ''
      }`}
    >
      <div className="flex flex-col bg-slate-800 rounded-md px-4 py-3 gap-3">
        {sidebarItems.map(({ href, icon, name }, index) => (
          <Link
            href={href}
            className={`text-md hover:text-slate-200 duration-150 font-semibold ${
              pathname === href ? 'text-slate-200' : 'text-slate-300/50'
            }`}
            {...(expanded
              ? {}
              : index === 0
              ? registerHomeBtn({
                  place: 'right',
                })
              : index === 1
              ? registerSearchBtn({
                  place: 'right',
                })
              : {})}
          >
            <div
              className={`flex items-center gap-4 ${
                expanded ? '' : 'justify-center'
              }`}
            >
              {icon}
              {expanded && name}
            </div>
          </Link>
        ))}
      </div>
      <div className="flex-grow bg-slate-800 rounded-md max-h-[calc(100vh-7rem-112px)]">
        <div
          className={`flex flex-col max-h-full py-3 ${
            expanded ? 'px-4 gap-3' : 'px-2 gap-6 items-center'
          }`}
        >
          <div className={`flex justify-between items-center`}>
            <button
              className="text-lg text-slate-300/50 transition hover:text-slate-300 font-semibold cursor-pointer flex items-center gap-2"
              onClick={() => setExpanded(exp => !exp)}
              {...registerLibraryButton({
                place: expanded ? 'top-center' : 'right',
              })}
            >
              <span className="rotate-90 scale-x-[-1]">
                {expanded ? (
                  <FaFolderOpen size={24} />
                ) : (
                  <FaFolder size={32} className="mx-3" />
                )}
              </span>
              {expanded && 'Your Library'}
            </button>
            {session && expanded && <SidebarNewPlaylistButton />}
          </div>
          {session?.user ? (
            playlists.length === 0 ? (
              <p className="text-md text-slate-300/50 font-semibold">
                No playlists found
              </p>
            ) : (
              <div className="overflow-y-auto max-h-full no-scrollbar">
                <SidebarItemList
                  playlists={playlists}
                  session={session}
                  history={playHistory}
                  expanded={expanded!}
                />
              </div>
            )
          ) : (
            <div className="text-md text-slate-300/50 font-semibold">
              Please login to view your playlists
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
