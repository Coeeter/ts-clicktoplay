'use client';

import {
  addFavoriteSongToLibrary,
  removeFavoriteSongFromLibrary,
} from '@/actions/library';
import {
  Playlist,
  addSongsToPlaylist,
  createPlaylist,
} from '@/actions/playlist';
import { useContextMenu, useContextMenuItems } from '@/hooks/useContextMenu';
import { useQueueStore } from '@/store/QueueStore';
import { ToastActions, useToastStore } from '@/store/ToastStore';
import { QueueItem as QueueItemType, Song } from '@prisma/client';
import { usePathname } from 'next/navigation';
import { HiPause, HiPlay } from 'react-icons/hi2';
import { MdFavorite, MdFavoriteBorder, MdMoreHoriz } from 'react-icons/md';
import { useEffect, useState } from 'react';
import { ContextMenuItem, useContextMenuStore } from '@/store/ContextMenuStore';
import { ContextMenuButton } from '@/components/menu/ContextMenuButton';
import { NavigationLink } from '@/hooks/useNavigation';
import { useClientSession } from '@/hooks/useSession';

type QueuItemProps = {
  queueItem: QueueItemType;
  song: Song;
  isCurrentItem: boolean;
  listOrder: number;
  isFavorite: boolean;
  playlists: Playlist[];
  isDragging: boolean;
};

export const QueueItem = ({
  queueItem,
  isCurrentItem,
  song,
  listOrder,
  isFavorite,
  playlists,
  isDragging,
}: QueuItemProps) => {
  const { session } = useClientSession();
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);
  const pathname = usePathname();
  const isPlaying = useQueueStore(state => state.isPlaying && isCurrentItem);
  const setIsPlaying = useQueueStore(state => state.setIsPlaying);
  const setCurrentlyPlayingId = useQueueStore(
    state => state.setCurrentlyPlayingId
  );
  const createToast = useToastStore(state => state.createToast);
  const isContextMenuShowing = useContextMenuStore(state => state.isOpen);

  const contextMenuItems = useContextMenuItems({
    type: 'queue',
    isFavorite,
    playlists,
    queueItemId: queueItem.id,
    session,
    song,
  });
  const { contextMenuHandler } = useContextMenu(contextMenuItems);

  useEffect(() => {
    if (!isContextMenuShowing) setIsContextMenuOpen(false);
  }, [isContextMenuShowing]);

  const onClick = () => {
    if (isCurrentItem) return setIsPlaying(!isPlaying);
    setCurrentlyPlayingId(queueItem.id);
    setIsPlaying(true);
  };

  return (
    <div
      key={queueItem.id}
      className={`w-full flex items-center justify-between py-2 px-6 mb-2 rounded-md transition-colors group ${
        isContextMenuOpen || isDragging
          ? 'bg-slate-700/50'
          : 'hover:bg-slate-700/50'
      }`}
      onContextMenu={e => {
        setIsContextMenuOpen(true);
        contextMenuHandler(e);
      }}
    >
      <div className="flex items-center gap-6">
        <button
          className="w-8 flex justify-center items-center"
          onClick={onClick}
        >
          {isPlaying ? (
            <>
              <span className="text-xl font-bold text-blue-500 hover:text-blue-600 hidden group-hover:inline">
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
                  isCurrentItem ? 'text-blue-500' : 'text-slate-300/50'
                }`}
              >
                {listOrder}
              </span>
              <span
                className={`text-xl font-bold group-hover:inline hidden transition-all ${
                  isCurrentItem
                    ? 'text-blue-500 hover:text-blue-600'
                    : 'text-slate-300/50 hover:text-slate-300'
                }`}
              >
                <HiPlay />
              </span>
            </>
          )}
        </button>
        <div className="flex items-center gap-2">
          <div className="w-12 h-12 bg-slate-600 rounded-md">
            <img
              src={song.albumCover ?? '/album-cover.png'}
              alt="album cover"
              className="w-full h-full rounded-md object-cover"
            />
          </div>
          <div className="flex flex-col items-start">
            <NavigationLink
              href={`/songs/${song.id}`}
              className={`text-md font-bold hover:underline ${
                isCurrentItem ? 'text-blue-500' : 'text-slate-300'
              }`}
            >
              {song.title}
            </NavigationLink>
            <NavigationLink
              href={`/artist/${song.artistIds[0]}`}
              className="text-sm text-slate-300/50 hover:underline"
            >
              {song.artist?.length ? song.artist : 'Unknown'}
            </NavigationLink>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button
          className="text-2xl text-slate-300/50 cursor-pointer"
          onClick={async () => {
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
        <span className="text-slate-300/50">
          {new Date(song.duration * 1000).toISOString().substring(14, 19)}
        </span>
        <ContextMenuButton
          className="h-6 w-6"
          contextMenuItems={contextMenuItems}
          onContextMenuOpen={() => setIsContextMenuOpen(true)}
        >
          <MdMoreHoriz
            className={`text-slate-300/50 hover:text-slate-300 text-2xl cursor-pointer ${
              isContextMenuOpen ? '' : 'opacity-0 group-hover:opacity-100'
            }`}
          />
        </ContextMenuButton>
      </div>
    </div>
  );
};

function getContextMenuItems(
  isCurrentItem: boolean,
  isPlaying: boolean,
  setIsPlaying: (isPlaying: boolean) => void,
  setCurrentlyPlayingId: (currentlyPlayingId: string) => void,
  queueItem: QueueItemType,
  removeFromQueue: (queueItemId: string) => void,
  song: Song,
  pathname: string,
  createToast: ToastActions['createToast'],
  playlists: Playlist[],
  isFavorite: boolean
): ContextMenuItem[] {
  return [
    {
      label: isCurrentItem && isPlaying ? 'Pause' : 'Play',
      onClick: () => {
        if (isCurrentItem) return setIsPlaying(!isPlaying);
        setCurrentlyPlayingId(queueItem.id);
        setIsPlaying(true);
      },
    },
    {
      label: 'Remove from Queue',
      onClick: () => removeFromQueue(queueItem.id),
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
            createToast('Added song to playlist', 'success');
          },
        })),
      ],
    },
    isFavorite
      ? {
          label: 'Unfavorite',
          onClick: async () => {
            const [error] = await removeFavoriteSongFromLibrary({
              songId: song.id,
              path: pathname,
            });
            if (error) return createToast(error, 'error');
            createToast('Removed from Favorites', 'success');
          },
        }
      : {
          label: 'Favorite',
          onClick: async () => {
            const [error] = await addFavoriteSongToLibrary({
              songId: song.id,
              path: pathname,
            });
            if (error) return createToast(error, 'error');
            createToast('Added song to Favorites', 'success');
          },
        },
  ];
}
