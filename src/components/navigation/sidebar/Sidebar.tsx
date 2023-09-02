import { MdHome, MdSearch } from 'react-icons/md';

import { getServerSession } from '@/lib/auth';
import { SidebarItem, SidebarItemProps } from './SidebarItem';
import { getCreatedPlaylists } from '@/actions/playlist/playlist';
import { SidebarPlaylistItem } from './SidebarPlaylistItem';

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
  const playlists = session ? await getCreatedPlaylists(session) : [];

  return (
    <aside className="w-1/4 gap-3 flex flex-col sticky top-3 bottom-3 max-h-[calc(100vh-7rem)]">
      <div className="flex flex-col bg-slate-800 rounded-md px-4 py-3 gap-3">
        {sidebarItems.map(sidebarItem => (
          <SidebarItem key={sidebarItem.name} {...sidebarItem} />
        ))}
      </div>
      <div className="flex-grow bg-slate-800 rounded-md">
        <div className="px-4 py-3 gap-3 flex flex-col">
          <h2 className="text-lg text-slate-300 font-semibold">Your Library</h2>
          {session?.user ? (
            playlists.length === 0 ? (
              <p className="text-md text-slate-300/50 font-semibold">
                No playlists found
              </p>
            ) : (
              <div className="flex flex-col gap-1">
                {playlists.map(playlist => (
                  <SidebarPlaylistItem key={playlist.id} playlist={playlist} />
                ))}
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
