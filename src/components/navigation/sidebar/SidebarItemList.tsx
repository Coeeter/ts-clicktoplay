'use client';
import { Session } from 'next-auth';
import { SidebarItem } from './SidebarItem';
import { Playlist } from '@/actions/playlist';
import { AnimatePresence, motion } from 'framer-motion';
import { AiOutlineSearch } from 'react-icons/ai';
import { useEffect, useMemo, useState } from 'react';
import { MdArrowDropDown } from 'react-icons/md';
import { useContextMenu } from '@/hooks/useContextMenu';
import { useContextMenuStore } from '@/store/ContextMenuStore';

type SidebarItemListProps = {
  playlists: Playlist[];
  session: Session;
  history: { id: string; lastPlayedAt: Date | null }[];
};

type PlaylistSortType =
  | 'Last Played'
  | 'Alphabetical'
  | 'Creator'
  | 'Date Added';

const playlistSorts = [
  'Last Played',
  'Alphabetical',
  'Creator',
  'Date Added',
] as const;

export const SidebarItemList = ({
  playlists,
  session,
  history,
}: SidebarItemListProps) => {
  const [sortType, setSortType] = useState<PlaylistSortType>('Creator');
  const [isSearching, setIsSearching] = useState(false);
  const [query, setQuery] = useState('');
  const [isContextMenuShowing, setIsContextMenuShowing] = useState(false);

  const { showContextMenu } = useContextMenu();
  const isContextMenuOpen = useContextMenuStore(state => state.isOpen);

  useEffect(() => {
    if (!isContextMenuOpen) setIsContextMenuShowing(false);
  }, [isContextMenuOpen]);

  const searchedPlaylists = useMemo(() => {
    return playlists
      .filter(playlist =>
        playlist.title.toLowerCase().includes(query.toLowerCase())
      )
      .sort((a, b) => {
        if (a.isFavoritePlaylist && !b.isFavoritePlaylist) return -1;
        if (!a.isFavoritePlaylist && b.isFavoritePlaylist) return 1;
        if (sortType === 'Alphabetical') {
          return a.title.localeCompare(b.title);
        }
        if (sortType === 'Creator') {
          return a.creator!.name!.localeCompare(b.creator!.name!);
        }
        if (sortType === 'Last Played') {
          return (
            new Date(
              history.find(item => item.id == b.id)?.lastPlayedAt || 0
            ).getTime() -
            new Date(
              history.find(item => item.id == a.id)?.lastPlayedAt || 0
            ).getTime()
          );
        }
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
  }, [playlists, query, sortType]);

  return (
    <>
      <div className="h-[40px] relative mb-2">
        <AnimatePresence>
          <button
            disabled={isSearching}
            className="hover:bg-slate-300/20 focus:bg-slate-300/20 p-[6px] transition ml-2 mb-2 rounded-full absolute top-1/2 -translate-y-1/2 disabled:hover:bg-transparent disabled:cursor-default"
            onClick={() => setIsSearching(true)}
          >
            <AiOutlineSearch size={22} />
          </button>
          {isSearching && (
            <motion.input
              key="input"
              className="bg-slate-700 rounded-full p-2 outline-none"
              placeholder="Search playlists"
              type="text"
              autoFocus
              layout={true}
              style={{ transformOrigin: 'left', paddingLeft: '45px' }}
              initial={{ width: 0 }}
              animate={{ width: '50%' }}
              exit={{ width: 0 }}
              onBlur={() => setIsSearching(query.length > 0)}
              onChange={e => setQuery(e.target.value)}
            />
          )}
        </AnimatePresence>
        <button
          className={`absolute right-0 top-1/2 -translate-y-1/2 transition hover:bg-slate-700 rounded-md p-2 outline-none flex items-center gap-2 ${
            isContextMenuShowing ? 'bg-slate-700' : ''
          }`}
          onClick={e => {
            setIsContextMenuShowing(true);
            const rect = e.currentTarget.getBoundingClientRect();
            showContextMenu(rect.left, rect.bottom, [
              {
                label: 'Sort by',
                title: true,
              },
              ...playlistSorts.map(sort => ({
                label: sort,
                onClick: () => {
                  setSortType(sort);
                  setIsContextMenuShowing(false);
                },
              })),
            ]);
          }}
        >
          {sortType}
          <motion.span animate={{ rotate: isContextMenuShowing ? 180 : 0 }}>
            <MdArrowDropDown size={22} />
          </motion.span>
        </button>
      </div>
      <div className="flex flex-col gap-1 ">
        <AnimatePresence>
          {searchedPlaylists.map(playlist => (
            <motion.div key={playlist.id} layout={true}>
              <SidebarItem playlist={playlist} session={session} />
            </motion.div>
          ))}
          {searchedPlaylists.length === 0 && (
            <div className="text-md text-slate-300/50 font-semibold text-center">
              No playlists found
            </div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};
