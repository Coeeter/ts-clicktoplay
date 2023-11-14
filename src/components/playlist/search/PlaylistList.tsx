'use client';
import { Playlist } from '@/actions/playlist';
import { useContextMenu, useContextMenuItems } from '@/hooks/useContextMenu';
import { NavigationLink } from '@/hooks/useNavigation';
import { useQueueStore } from '@/store/QueueStore';
import { Session } from 'next-auth';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FaPause, FaPlay } from 'react-icons/fa';

type PlaylistItemProps = {
  playlists: Playlist[];
  session: Session | null;
  justify?: 'start' | 'between';
};

export const PlaylistList = ({
  playlists,
  session,
  justify = 'between',
}: PlaylistItemProps) => {
  const [cols, setCols] = useState(3);

  useEffect(() => {
    const element = document.querySelector('#root')!;
    const onResize = () => {
      setCols(Math.floor(element.clientWidth / 216));
    };
    const observer = new ResizeObserver(onResize);
    observer.observe(element);
    onResize();
    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      className={`flex ${
        justify === 'start' ? 'justify-start gap-6' : 'justify-between'
      }`}
    >
      {playlists.slice(0, cols).map(playlist => (
        <PlaylistCard key={playlist.id} playlist={playlist} session={session} />
      ))}
    </div>
  );
};

type PlaylistCardProps = {
  playlist: Playlist;
  session: Session | null;
};

const PlaylistCard = ({ playlist, session }: PlaylistCardProps) => {
  const currentlyPlayingSong = useQueueStore(state => state.currentlyPlayingId);
  const queueItems = useQueueStore(state => state.items);
  const isPlaying = useQueueStore(state => state.isPlaying);
  const setPlaying = useQueueStore(state => state.setIsPlaying);
  const playPlaylist = useQueueStore(state => state.playPlaylist);
  const currentlyPlayingPlaylist = useMemo(() => {
    return queueItems.find(item => item.id === currentlyPlayingSong)
      ?.playlistId;
  }, [queueItems, currentlyPlayingSong]);

  const ref = useRef<HTMLButtonElement | null>(null);
  const items = useContextMenuItems({
    type: 'playlist',
    playlist,
    session: session,
  });
  const { contextMenuHandler } = useContextMenu(items);

  return (
    <NavigationLink
      className="w-48 flex flex-col gap-2 my-2 transition rounded-md p-2 bg-slate-100/5 hover:bg-slate-600 group"
      href={`/playlist/${playlist.id}`}
      onClick={e => {
        const isBtnClicked =
          e.target === ref.current ||
          ref.current?.contains(e.target as Node) === true;
        return !isBtnClicked;
      }}
      onContextMenu={contextMenuHandler}
    >
      <div className="relative w-full aspect-square">
        <img
          src={playlist.image ?? '/playlist-cover.png'}
          alt={playlist.title}
          className={`w-full aspect-square object-cover rounded-md group-hover:shadow-xl group-hover:shadow-slate-800 transition ${
            playlist.image ? '' : 'bg-slate-200'
          }`}
        />
        <button
          ref={ref}
          className={`absolute right-0 bottom-0 m-3 p-4 rounded-full hover:scale-110 bg-blue-700 duration-300 transition-all ${
            isPlaying && currentlyPlayingPlaylist === playlist.id
              ? 'opacity-100'
              : 'opacity-0 translate-y-5 group-hover:translate-y-0 group-hover:opacity-100'
          }`}
          onClick={() => {
            if (currentlyPlayingPlaylist === playlist.id) {
              setPlaying(!isPlaying);
              return;
            }
            playPlaylist(
              playlist,
              playlist.items.find(item => !item.prevId)!.songId
            );
          }}
        >
          {isPlaying && currentlyPlayingPlaylist === playlist.id ? (
            <FaPause className="text-white" size={16} />
          ) : (
            <FaPlay className="text-white" size={16} />
          )}
        </button>
      </div>
      <div className="flex flex-col">
        <h3 className="text-lg font-bold text-slate-200 truncate">
          {playlist.title}
        </h3>
        <p className="text-sm text-slate-300/75 truncate">
          By {playlist.creator.name ?? 'Unknown'}
        </p>
      </div>
    </NavigationLink>
  );
};
