import { MdAdd, MdHome, MdSearch } from 'react-icons/md';

import { getServerSession } from '@/lib/auth';
import { SidebarLink, SidebarItemProps } from './SidebarLink';
import {
  createPlaylist,
  getCreatedPlaylists,
} from '@/actions/playlist/playlist';
import { SidebarItemList } from './SidebarItemList';
import { SidebarNewPlaylistButton } from './SidebarNewPlaylistButton';
import { prisma } from '@/lib/database';

const sidebarItems: SidebarItemProps[] = [
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

export const Sidebar = async () => {
  const session = await getServerSession();
  const playlists = session
    ? (await getCreatedPlaylists(session))
        .filter(item => !item.isFavoritePlaylist || item.items.length)
        .sort(
          (a, b) => Number(b.isFavoritePlaylist) - Number(a.isFavoritePlaylist)
        )
    : [];

  const playHistory = await Promise.all(
    playlists.map(async playlist => {
      const history = await prisma.playHistory.aggregate({
        where: {
          userId: session?.user?.id,
          playlistId: playlist.id,
        },
        _max: {
          createdAt: true,
        },
      });
      return {
        id: playlist.id,
        lastPlayedAt: history._max?.createdAt,
      };
    })
  );

  return (
    <aside className="w-1/4 gap-3 flex flex-col sticky top-3 bottom-3 max-h-[calc(100vh-7rem)]">
      <div className="flex flex-col bg-slate-800 rounded-md px-4 py-3 gap-3">
        {sidebarItems.map(sidebarItem => (
          <SidebarLink key={sidebarItem.name} {...sidebarItem} />
        ))}
      </div>
      <div className="flex-grow bg-slate-800 rounded-md max-h-[calc(100vh-7rem-112px)]">
        <div className="px-4 py-3 gap-3 flex flex-col max-h-full">
          <div className="flex justify-between items-center">
            <h2 className="text-lg text-slate-300 font-semibold">
              Your Library
            </h2>
            <SidebarNewPlaylistButton />
          </div>
          {session?.user ? (
            playlists.length === 0 ? (
              <p className="text-md text-slate-300/50 font-semibold">
                No playlists found
              </p>
            ) : (
              <div className="overflow-y-auto max-h-full no-scrollbar">
                <SidebarItemList playlists={playlists} session={session} history={playHistory} />
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
