'use client';

import { Playlist } from '@/actions/playlist';
import { useContextMenuStore } from '@/store/ContextMenuStore';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { AiOutlineSearch } from 'react-icons/ai';
import { MdArrowDropDown } from 'react-icons/md';
import { SidebarItem } from './SidebarItem';
import { SidebarNewPlaylistButton } from './SidebarNewPlaylistButton';

type SidebarItemListProps = {
  playlists: Playlist[];
  history: { id: string; lastPlayedAt: Date | null }[];
  expanded: boolean;
  showMoreDetails: boolean;
  isResizing: boolean;
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
  history,
  expanded,
  showMoreDetails,
  isResizing,
}: SidebarItemListProps) => {
  const [sortType, setSortType] = useState<PlaylistSortType>('Creator');
  const [query, setQuery] = useState('');
  const [isContextMenuShowing, setIsContextMenuShowing] = useState(false);

  const showContextMenu = useContextMenuStore(state => state.openContextMenu);
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

  if (!expanded)
    return (
      <div
        className={`flex flex-col overflow-x-auto ${
          expanded ? 'gap-1' : 'gap-3'
        }`}
      >
        <AnimatePresence>
          {searchedPlaylists.map(playlist => (
            <motion.div key={playlist.id} layout={'position'}>
              <SidebarItem
                playlist={playlist}
                expanded={expanded}
                showMoreDetails={false}
              />
            </motion.div>
          ))}
          <SidebarNewPlaylistButton expanded={false} />
        </AnimatePresence>
      </div>
    );

  return (
    <>
      <div className="h-[40px] relative mb-2">
        <div className=" p-[6px] transition ml-2 mb-2 absolute top-1/2 -translate-y-1/2">
          <AiOutlineSearch size={22} />
        </div>
        <input
          key="input"
          className="bg-slate-700 rounded-full p-2 outline-none pl-[45px] w-full"
          placeholder="Search playlists"
          type="text"
          onChange={e => setQuery(e.target.value)}
        />
      </div>
      <div className="flex items-center ml-2">
        <span className="text-slate-300/50">Sorted by</span>
        <button
          className={`transition hover:text-slate-200 rounded-md p-2 pl-1 outline-none flex items-center ${
            isContextMenuShowing ? 'text-slate-200' : ''
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
      <div className="flex flex-col gap-1">
        {showMoreDetails && (
          <div className="px-2 grid grid-cols-4 text-slate-300/50 border-b pb-2 border-slate-300/30 text-sm">
            <span className="col-span-2">Title</span>
            <span>Date Added</span>
            <span className="text-end">Last Played</span>
          </div>
        )}
        <AnimatePresence>
          {searchedPlaylists.map(playlist => (
            <motion.div
              key={playlist.id}
              layout={isResizing ? false : 'position'}
            >
              <SidebarItem
                playlist={playlist}
                expanded={expanded}
                showMoreDetails={showMoreDetails}
                lastPlayed={
                  history.find(item => item.id == playlist.id)?.lastPlayedAt
                }
              />
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
