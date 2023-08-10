import Link from 'next/link';
import { MdHome, MdSearch } from 'react-icons/md';

import { getServerSession } from '@/lib/auth';
import { SidebarItem, SidebarItemProps } from './SidebarItem';
import { getCreatedPlaylists } from '@/lib/playlist/playlist';

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
    <div className="w-1/3 gap-3 flex flex-col sticky top-0">
      <div className="flex flex-col bg-slate-800 rounded-md m-3 mb-0 px-4 py-3 gap-3">
        {sidebarItems.map(sidebarItem => (
          <SidebarItem key={sidebarItem.name} {...sidebarItem} />
        ))}
      </div>
      <div className="flex-grow bg-slate-800 rounded-md m-3 mt-0 ">
        <div className="px-4 py-3 gap-3 flex flex-col">
          <div className="text-lg text-slate-300 font-semibold">
            Your Playlists
          </div>
          {session?.user ? (
            playlists.length === 0 ? (
              <div className="text-md text-slate-300/50 font-semibold">
                No playlists found
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {playlists.map(({ id, title }) => (
                  <Link
                    key={id}
                    href={`/playlist/${id}`}
                    className={`text-md hover:text-slate-200 duration-150 font-semiboldtext-slate-300/50`}
                  >
                    {title}
                  </Link>
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
    </div>
  );
};
