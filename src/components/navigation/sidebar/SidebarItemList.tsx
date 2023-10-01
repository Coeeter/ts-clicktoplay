'use client';

import { Session } from 'next-auth';
import { SidebarItem } from './SidebarItem';
import { Playlist } from '@/actions/playlist';
import { AnimatePresence, motion } from 'framer-motion';
import { AiOutlineSearch } from 'react-icons/ai';
import { useMemo, useState } from 'react';

type SidebarItemListProps = {
  playlists: Playlist[];
  session: Session;
};

export const SidebarItemList = ({
  playlists,
  session,
}: SidebarItemListProps) => {
  const [isSearching, setIsSearching] = useState(false);
  const [query, setQuery] = useState('');

  const searchedPlaylists = useMemo(() => {
    if (!query) return playlists;
    return playlists.filter(playlist =>
      playlist.title.toLowerCase().includes(query.toLowerCase())
    );
  }, [playlists, query]);

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
