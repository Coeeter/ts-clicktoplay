import { MdHome, MdSearch } from 'react-icons/md';

import { getServerSession } from '@/lib/auth';
import { SidebarLink, SidebarItemProps } from './SidebarLink';
import { getCreatedPlaylists } from '@/actions/playlist/playlist';
import { SidebarItem } from './SidebarItem';
import { getLibrary } from '@/actions/library';
import { SidebarItemList } from './SidebarItemList';

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
  const library = session
    ? (await getLibrary(session)).filter(
        item => !item.playlist.isFavoritePlaylist || item.playlist.items.length
      )
    : [];

  return (
    <aside className="w-1/4 gap-3 flex flex-col sticky top-3 bottom-3 max-h-[calc(100vh-7rem)]">
      <div className="flex flex-col bg-slate-800 rounded-md px-4 py-3 gap-3">
        {sidebarItems.map(sidebarItem => (
          <SidebarLink key={sidebarItem.name} {...sidebarItem} />
        ))}
      </div>
      <div className="flex-grow bg-slate-800 rounded-md">
        <div className="px-4 py-3 gap-3 flex flex-col">
          <h2 className="text-lg text-slate-300 font-semibold">Your Library</h2>
          {session?.user ? (
            library.length === 0 ? (
              <p className="text-md text-slate-300/50 font-semibold">
                No playlists found
              </p>
            ) : (
              <SidebarItemList items={library} session={session} />
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
