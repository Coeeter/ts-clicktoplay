'use client';
import {
  addFavoriteSongToLibrary,
  removeFavoriteSongFromLibrary,
} from '@/actions/library';
import { Playlist } from '@/actions/playlist';
import { useContextMenu, useContextMenuItems } from '@/hooks/useContextMenu';
import { useMounted } from '@/hooks/useMounted';
import { useQueueStore } from '@/store/QueueStore';
import { useToastStore } from '@/store/ToastStore';
import { Song } from '@prisma/client';
import { format, formatDistanceToNow, isThisWeek } from 'date-fns';
import { Session } from 'next-auth';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { FaPause, FaPlay } from 'react-icons/fa';
import { MdFavorite, MdFavoriteBorder, MdMoreHoriz } from 'react-icons/md';
import { ContextMenuButton } from '@/components/menu/ContextMenuButton';
import { ContextMenuItem, useContextMenuStore } from '@/store/ContextMenuStore';
import { NavigationLink } from '@/hooks/useNavigation';
import { HiPause, HiPlay } from 'react-icons/hi2';

type SongItemProps = {
  song: Song;
  playlists: Playlist[];
  playSong: () => void;
  session: Session | null;
  isFavorite: boolean;
  type: 'list' | 'grid';
  highlight?: boolean;
};

export const SongItem = ({
  song,
  playlists,
  playSong,
  session,
  isFavorite,
  type = 'grid',
  highlight = false,
}: SongItemProps) => {
  const isPlaying = useQueueStore(state => state.isPlaying);
  const setIsPlaying = useQueueStore(state => state.setIsPlaying);
  const currentlyPlayingQueueItem = useQueueStore(state =>
    state.items.find(item => item.id === state.currentlyPlayingId)
  );
  const isCurrentSong = song.id === currentlyPlayingQueueItem?.songId;

  const minutes = Math.floor(song.duration / 60);
  const seconds = Math.floor(song.duration % 60);
  const duration = `${minutes < 10 ? '0' : ''}${minutes}:${
    seconds < 10 ? '0' : ''
  }${seconds}`;
  const albumCover = song.albumCover ?? '/album-cover.png';
  const artist = song.artist?.length ? song.artist : 'Unknown';

  const contextMenuItems = useContextMenuItems({
    type: 'song',
    session,
    song,
    isFavorite,
    playlists,
    playSong,
  });

  if (type === 'list') {
    return (
      <SongListItem
        song={song}
        playSong={playSong}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        isCurrentSong={isCurrentSong}
        isFavorite={isFavorite}
        contextMenuItems={contextMenuItems}
        session={session}
      />
    );
  }

  return (
    <SongGridItem
      song={song}
      playSong={playSong}
      isPlaying={isPlaying}
      setIsPlaying={setIsPlaying}
      isCurrentSong={isCurrentSong}
      contextMenuItems={contextMenuItems}
      albumCover={albumCover}
      artist={artist}
      duration={duration}
      highlight={highlight}
    />
  );
};

const SongListItem = ({
  song,
  playSong,
  isPlaying,
  setIsPlaying,
  isCurrentSong,
  isFavorite,
  contextMenuItems,
  session,
}: {
  song: Song;
  playSong: () => void;
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
  isCurrentSong: boolean;
  isFavorite: boolean;
  contextMenuItems: ContextMenuItem[];
  session: Session | null;
}) => {
  const [isContextMenuShowing, setIsContextMenuShowing] = useState(false);
  const createToast = useToastStore(state => state.createToast);
  const pathname = usePathname();
  const isShowing = useContextMenuStore(state => state.isOpen);
  const { contextMenuHandler } = useContextMenu(contextMenuItems);

  const createdAt = new Date(song.createdAt);
  const isMounted = useMounted();
  const isLongerThanAWeek = !isThisWeek(createdAt);
  const timeAdded = isMounted
    ? isLongerThanAWeek
      ? format(createdAt, 'MMM dd, yyyy')
      : formatDistanceToNow(createdAt, {
          addSuffix: true,
        })
    : '';

  useEffect(() => {
    if (!isShowing) setIsContextMenuShowing(false);
  }, [isShowing]);

  return (
    <div
      className={`w-full grid grid-cols-3 items-center py-2 px-6 rounded-md transition-colors group ${
        isContextMenuShowing ? 'bg-slate-700' : 'hover:bg-slate-700'
      }`}
      onContextMenu={e => {
        setIsContextMenuShowing(true);
        contextMenuHandler(e);
      }}
    >
      <div className="flex items-center gap-2 w-full">
        <div className="w-12 h-12 bg-slate-600 rounded-md shrink-0 group relative">
          <img
            src={song.albumCover ?? '/album-cover.png'}
            alt="album cover"
            className="w-full h-full rounded-md object-cover"
          />
          <div
            className={`flex justify-center items-center cursor-pointer absolute top-0 left-0 w-full h-full bg-slate-800/50 z-[1] group-hover:opacity-100 opacity-0 ${
              isPlaying && isCurrentSong ? 'opacity-100' : ''
            }`}
            onClick={() => {
              if (isCurrentSong) {
                return setIsPlaying(!isPlaying);
              }
              playSong();
            }}
          >
            {isPlaying && isCurrentSong ? (
              <>
                <span className="text-4xl font-bold text-blue-500">
                  <HiPause />
                </span>
              </>
            ) : (
              <>
                <span
                  className={`text-4xl font-bold transition-all ${
                    isCurrentSong
                      ? 'text-blue-500'
                      : 'text-slate-200'
                  }`}
                >
                  <HiPlay />
                </span>
              </>
            )}
          </div>
        </div>
        <div className="flex flex-col items-start flex-1 overflow-hidden">
          <NavigationLink
            className={`text-md font-bold hover:underline truncate overflow-hidden max-w-full ${
              isCurrentSong ? 'text-blue-500' : 'text-slate-300'
            }`}
            href={`/songs/${song.id}`}
          >
            {song.title}
          </NavigationLink>
          <span className="text-sm text-slate-300/50 truncate overflow-hidden max-w-full">
            {song.artist?.length ? song.artist : 'Unknown'}
          </span>
        </div>
      </div>
      <span className="text-slate-300/50">{timeAdded}</span>
      <div className="text-slate-300/50 flex items-center justify-end">
        <button
          className={
            'text-2xl cursor-pointer' +
            (session ? '' : ' !opacity-0 pointer-events-none')
          }
          onClick={async () => {
            if (!session) return createToast('You must be logged in', 'normal');
            if (isFavorite) {
              const [error] = await removeFavoriteSongFromLibrary({
                songId: song.id,
                path: pathname,
              });
              if (error) return createToast(error, 'error');
              createToast('Removed from Favorites', 'success');
              return;
            }
            const [error] = await addFavoriteSongToLibrary({
              songId: song.id,
              path: pathname,
            });
            if (error) return createToast(error, 'error');
            createToast('Added song to Favorites', 'success');
          }}
        >
          {isFavorite ? (
            <MdFavorite className="text-blue-700 hover:text-blue-600" />
          ) : (
            <MdFavoriteBorder className="opacity-0 group-hover:opacity-100 hover:text-slate-200" />
          )}
        </button>
        <span className="ml-4 mr-2">
          {new Date(song.duration * 1000).toISOString().substring(14, 19)}
        </span>
        <ContextMenuButton
          className={`w-6 h-6 text-2xl text-slate-300/50 hover:text-slate-300 cursor-pointer ${
            isContextMenuShowing
              ? 'opacity-100'
              : 'opacity-0 group-hover:opacity-100'
          } ${session ? '' : '!opacity-0 pointer-events-none'}`}
          contextMenuItems={contextMenuItems}
          onContextMenuOpen={() => setIsContextMenuShowing(true)}
        >
          <MdMoreHoriz />
        </ContextMenuButton>
      </div>
    </div>
  );
};

const SongGridItem = ({
  song,
  playSong,
  isPlaying,
  setIsPlaying,
  isCurrentSong,
  contextMenuItems,
  albumCover,
  artist,
  duration,
  highlight,
}: {
  song: Song;
  playSong: () => void;
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
  isCurrentSong: boolean;
  contextMenuItems: ContextMenuItem[];
  albumCover: string;
  artist: string;
  duration: string;
  highlight: boolean;
}) => {
  const ref = useRef<HTMLButtonElement>(null);
  const { contextMenuHandler } = useContextMenu(contextMenuItems);

  return (
    <NavigationLink
      href={`/songs/${song.id}`}
      onContextMenu={contextMenuHandler}
      onClick={e => {
        const isBtnClicked =
          e.target === ref.current ||
          ref.current?.contains(e.target as Node) === true;
        return !isBtnClicked;
      }}
    >
      <div
        className={`flex flex-col gap-2 p-3 rounded-md group cursor-pointer transition-colors duration-300 ${
          highlight
            ? 'w-full min-w-[24rem] bg-slate-100/5 hover:bg-slate-600 relative'
            : 'w-48 bg-gradient-to-b from-slate-800 to-slate-100/5 hover:bg-slate-600'
        }`}
      >
        <div className={highlight ? '' : 'relative'}>
          <img
            src={albumCover}
            alt="Album Cover"
            className={`aspect-square rounded-md box-border object-cover group-hover:shadow-xl transition-shadow duration-300 group-hover:shadow-slate-800 ${
              highlight ? 'w-48' : 'w-full'
            }`}
          />
          <button
            ref={ref}
            className={`absolute p-4 rounded-full hover:scale-110 bg-blue-700 duration-300 transition-all ${
              isPlaying && isCurrentSong
                ? 'opacity-100'
                : 'opacity-0 translate-y-5 group-hover:translate-y-0 group-hover:opacity-100'
            } ${
              highlight
                ? 'right-0 bottom-0 m-4 !opacity-100 !translate-y-0'
                : 'right-0 bottom-0 m-3'
            }`}
            onClick={() => {
              if (isCurrentSong) {
                return setIsPlaying(!isPlaying);
              }
              playSong();
            }}
          >
            {isPlaying && isCurrentSong ? (
              <FaPause className="text-white" size={highlight ? 24 : 16} />
            ) : (
              <FaPlay
                className="text-white translate-x-[1px]"
                size={highlight ? 24 : 16}
              />
            )}
          </button>
        </div>
        <div className="flex flex-col gap-1">
          <span
            className={`text-white font-bold truncate ${
              highlight ? 'text-3xl mt-3' : ''
            }`}
          >
            {song.title}
          </span>
          <div className="flex justify-between gap-2 w-full max-w-full">
            <span className="text-gray-400 truncate">{artist}</span>
            {!highlight && <span className="text-gray-400">{duration}</span>}
          </div>
        </div>
      </div>
    </NavigationLink>
  );
};
