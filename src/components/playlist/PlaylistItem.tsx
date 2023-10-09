'use client';

import {
  addFavoriteSongToLibrary,
  removeFavoriteSongFromLibrary,
} from '@/actions/library';
import {
  Playlist,
  PlaylistId,
  addSongsToPlaylist,
  createPlaylist,
  removeSongFromPlaylist,
} from '@/actions/playlist';
import { ContextMenuButton } from '@/components/menu/ContextMenuButton';
import { useContextMenu, useContextMenuItems } from '@/hooks/useContextMenu';
import { useMounted } from '@/hooks/useMounted';
import { useContextMenuStore } from '@/store/ContextMenuStore';
import { useQueueStore } from '@/store/QueueStore';
import { useToastStore } from '@/store/ToastStore';
import { Song } from '@prisma/client';
import { format, formatDistanceToNow, isThisWeek } from 'date-fns';
import { Session } from 'next-auth';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { HiPause, HiPlay } from 'react-icons/hi2';
import { MdFavorite, MdFavoriteBorder, MdMoreHoriz } from 'react-icons/md';

type PlaylistItemProps = {
  song: Song;
  playlist: Playlist;
  playlists: Playlist[];
  isDragging: boolean;
  listOrder: number;
  isFavorite: boolean;
  session: Session | null;
};

export const PlaylistItem = ({
  song,
  playlist,
  playlists,
  isDragging,
  listOrder,
  isFavorite,
  session,
}: PlaylistItemProps) => {
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);
  const isPlaying = useQueueStore(state => state.isPlaying);
  const currentlyPlayingItem = useQueueStore(state =>
    state.items.find(item => item.id === state.currentlyPlayingId)
  );
  const playPlaylist = useQueueStore(state => state.playPlaylist);
  const setIsPlaying = useQueueStore(state => state.setIsPlaying);
  const queueItem = useQueueStore(state =>
    state.items.find(item => item.songId === song.id)
  );
  const shuffle = useQueueStore(state => state.shuffle);
  const setShuffle = useQueueStore(state => state.setShuffle);
  const isCurrentItem = currentlyPlayingItem?.id === queueItem?.id;
  const isMenuOpen = useContextMenuStore(state => state.isOpen);
  const createToast = useToastStore(state => state.createToast);

  const isMounted = useMounted();

  const pathname = usePathname();

  const playSong = () => {
    if (!session) return createToast('You must be logged in', 'normal');
    if (isDragging) return;
    if (isCurrentItem && playlist.id === currentlyPlayingItem?.playlistId) {
      return setIsPlaying(!isPlaying);
    }
    playPlaylist(playlist, song.id);
    if (shuffle) setShuffle(true);
  };

  const contextMenuItems = useContextMenuItems({
    type: 'playlistsongitem',
    isFavorite,
    playlists,
    song,
    playSong,
    session,
    playlist,
  });
  
  const { contextMenuHandler } = useContextMenu(contextMenuItems);

  useEffect(() => {
    if (!isMenuOpen) setIsContextMenuOpen(false);
  }, [isMenuOpen]);

  const addedAt = playlist.items.find(item => item.songId === song.id)?.addedAt;
  if (!addedAt) return null;
  const isLongerThanAWeek = !isThisWeek(new Date(addedAt));
  const timeAdded = isMounted
    ? isLongerThanAWeek
      ? format(new Date(addedAt), 'MMM dd, yyyy')
      : formatDistanceToNow(new Date(addedAt), {
          addSuffix: true,
        })
    : '';

  return (
    <div
      onContextMenu={e => {
        setIsContextMenuOpen(true);
        contextMenuHandler(e);
      }}
      className={`w-full grid grid-cols-3 items-center py-2 px-6 rounded-md transition-colors group ${
        isContextMenuOpen ? 'bg-slate-700' : 'bg-slate-900 hover:bg-slate-700'
      }`}
    >
      <div className="flex items-center gap-6">
        <div
          className="w-8 flex justify-center items-center cursor-pointer"
          onClick={playSong}
        >
          {isPlaying &&
          isCurrentItem &&
          playlist.id === currentlyPlayingItem?.playlistId ? (
            <>
              <span className="text-lg font-bold text-blue-500 hidden group-hover:inline">
                <HiPause />
              </span>
              <img
                src="/playing.gif"
                alt="playing"
                className="w-full h-full rounded-md group-hover:hidden bg-blue-500 p-1"
              />
            </>
          ) : (
            <>
              <span
                className={`text-lg font-bold group-hover:hidden ${
                  isCurrentItem &&
                  playlist.id === currentlyPlayingItem?.playlistId
                    ? 'text-blue-500'
                    : 'text-slate-300/50'
                }`}
              >
                {listOrder}
              </span>
              <span
                className={`text-lg font-bold group-hover:inline hidden transition-all ${
                  isCurrentItem &&
                  playlist.id === currentlyPlayingItem?.playlistId
                    ? 'text-blue-500'
                    : 'text-slate-300'
                }`}
              >
                <HiPlay />
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="w-12 h-12 bg-slate-600 rounded-md">
            <img
              src={song.albumCover ?? '/album-cover.png'}
              alt="album cover"
              className="w-full h-full rounded-md object-cover"
            />
          </div>
          <div className="flex flex-col items-start">
            <Link
              className={`text-md font-bold hover:underline ${
                isCurrentItem &&
                playlist.id === currentlyPlayingItem?.playlistId
                  ? 'text-blue-500'
                  : 'text-slate-300'
              }`}
              href={`/songs/${song.id}`}
            >
              {song.title}
            </Link>
            <span className="text-sm text-slate-300/50">
              {song.artist?.length ? song.artist : 'Unknown'}
            </span>
          </div>
        </div>
      </div>
      <span className="text-slate-300/50">{timeAdded}</span>
      <div className="text-slate-300/50 flex items-center justify-end">
        <button
          className={
            'text-2xl cursor-pointer' +
            (!session ? ' opacity-0 pointer-events-none' : '')
          }
          onClick={async () => {
            if (!session) return;
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
            isContextMenuOpen
              ? 'opacity-100'
              : 'opacity-0 group-hover:opacity-100'
          } ${session ? '' : 'pointer-events-none !opacity-0'}`}
          contextMenuItems={contextMenuItems}
          onContextMenuOpen={() => setIsContextMenuOpen(true)}
        >
          <MdMoreHoriz />
        </ContextMenuButton>
      </div>
    </div>
  );
};

const getPlaylistContextMenuItems = ({
  song,
  playlists,
  isCurrentItem,
  isPlaying,
  playSong,
  playlist,
  addSongToQueue,
  createToast,
  pathname,
  isFavorite,
}: {
  song: Song;
  playlists: Playlist[];
  isCurrentItem: boolean;
  isPlaying: boolean;
  playSong: () => void;
  playlist: Playlist;
  addSongToQueue: (songId: string) => void;
  createToast: (message: string, type: 'success' | 'error') => void;
  pathname: string;
  isFavorite: boolean;
}) => {
  const playlistId = playlist.id as PlaylistId;
  return [
    {
      label: isCurrentItem && isPlaying ? 'Pause' : 'Play',
      onClick: playSong,
    },
    {
      label: playlist.isFavoritePlaylist
        ? 'Remove from Favorites'
        : 'Remove from Playlist',
      onClick: async () => {
        const [error] = await removeSongFromPlaylist({
          playlistId,
          songId: song.id,
          path: pathname,
        });
        if (error) return createToast(error, 'error');
        createToast('Song removed from playlist', 'success');
      },
    },
    {
      label: 'Add to Queue',
      onClick: () => {
        addSongToQueue(song.id);
        createToast('Added to queue', 'success');
      },
    },
    {
      label: 'Add to Playlist',
      subMenu: [
        {
          label: 'New Playlist',
          onClick: async () => {
            const playlist = await createPlaylist({
              title: song.title,
              image: song.albumCover,
              path: pathname,
            });
            const [error] = await addSongsToPlaylist({
              playlistId: playlist.id,
              songIds: [song.id],
              path: pathname,
            });
            if (error) return createToast(error, 'error');
            createToast(`Added to playlist '${playlist.title}'`, 'success');
          },
          divider: true,
        },
        ...playlists.map(playlist => ({
          label: playlist.title,
          onClick: async () => {
            const [error] = await addSongsToPlaylist({
              playlistId: playlist.id,
              songIds: [song.id],
              path: pathname,
            });
            if (error) return createToast(error, 'error');
            createToast(`Added to playlist '${playlist.title}'`, 'success');
          },
        })),
        ...(!playlists.length
          ? [{ label: 'No playlists found', selectable: false }]
          : []),
      ],
    },
    ...(playlist.isFavoritePlaylist
      ? []
      : [
          {
            label: isFavorite ? 'Remove from favorites' : 'Add to Favorites',
            onClick: async () => {
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
            },
          },
        ]),
  ];
};
