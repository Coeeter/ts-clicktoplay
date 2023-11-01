'use client';
import {
  addFavoriteSongToLibrary,
  removeFavoriteSongFromLibrary,
} from '@/actions/library';
import {
  Playlist,
  addSongsToPlaylist,
  createPlaylist,
  removeSongFromPlaylist,
} from '@/actions/playlist';
import {
  addNextPlaylistToQueue,
  insertPlaylistToBackOfQueue,
} from '@/actions/queue';
import { ContextMenuItem, useContextMenuStore } from '@/store/ContextMenuStore';
import { usePlaylistModalStore } from '@/store/PlaylistModalStore';
import { useQueueStore } from '@/store/QueueStore';
import { useToastStore } from '@/store/ToastStore';
import { Song } from '@prisma/client';
import { Session } from 'next-auth';
import { usePathname } from 'next/navigation';
import { MouseEventHandler } from 'react';

export const useContextMenu = (
  menuItems: ContextMenuItem[] | (() => ContextMenuItem[])
) => {
  const showContextMenu = useContextMenuStore(state => state.openContextMenu);
  const hideContextMenu = useContextMenuStore(state => state.closeContextMenu);

  const contextMenuHandler: MouseEventHandler = e => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof menuItems === 'function') {
      return showContextMenu(e.pageX, e.pageY, menuItems());
    }
    showContextMenu(e.pageX, e.pageY, menuItems);
  };

  return { contextMenuHandler, showContextMenu, hideContextMenu };
};

export type ContextMenuItemProps = {
  session: Session | null;
} & (
  | ({
      type: 'song';
    } & Parameters<typeof getSongMenuItems>[0])
  | ({
      type: 'playlistsongitem';
    } & Parameters<typeof getPlaylistSongMenuItems>[0])
  | ({
      type: 'playlist';
    } & Parameters<typeof getPlaylistMenuItems>[0])
  | ({
      type: 'queue';
    } & Parameters<typeof getQueueMenuItems>[0])
);

export const useContextMenuItems = (
  props: ContextMenuItemProps
): ContextMenuItem[] => {
  if (!props.session) {
    return [
      {
        label: 'You must be logged in to perform this action.',
        href: '/login',
      },
    ];
  }
  if (props.type === 'song') {
    return getSongMenuItems(props);
  }
  if (props.type === 'playlistsongitem') {
    return getPlaylistSongMenuItems(props);
  }
  if (props.type === 'playlist') {
    return getPlaylistMenuItems(props);
  }
  return getQueueMenuItems(props);
};

const getSongMenuItems = ({
  session,
  song,
  isFavorite,
  playlists,
  playSong,
}: {
  session: Session | null;
  song: Song;
  isFavorite: boolean;
  playlists: Playlist[];
  playSong: () => void;
}): ContextMenuItem[] => {
  const isPlaying = useQueueStore(state => state.isPlaying);
  const setIsPlaying = useQueueStore(state => state.setIsPlaying);
  const currentlyPlayingQueueItem = useQueueStore(state =>
    state.items.find(item => item.id === state.currentlyPlayingId)
  );
  const isCurrentSong = song.id === currentlyPlayingQueueItem?.songId;
  const addToQueue = useQueueStore(state => state.addSongToQueue);
  const showToast = useToastStore(state => state.createToast);
  const setNextSong = useQueueStore(state => state.setNextSong);
  const pathname = usePathname();

  if (!session) return [];

  return [
    {
      label: isCurrentSong ? (isPlaying ? 'Pause' : 'Play') : 'Play',
      onClick: () => {
        if (isCurrentSong) {
          return setIsPlaying(!isPlaying);
        }
        playSong();
      },
      divider: true,
    },
    {
      label: 'Play Next',
      onClick: () => {
        setNextSong(song.id, pathname);
        showToast('Playing next', 'success');
      },
    },
    {
      label: 'Play Last',
      onClick: () => {
        addToQueue(song.id);
        showToast('Playing last', 'success');
      },
      divider: true,
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
            if (error) return showToast(error, 'error');
            showToast(`Added to playlist '${playlist.title}'`, 'success');
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
            if (error) return showToast(error, 'error');
            showToast(`Added to playlist '${playlist.title}'`, 'success');
          },
        })),
        ...(!playlists.length
          ? [{ label: 'No playlists found', selectable: false }]
          : []),
      ],
    },
    !isFavorite
      ? {
          label: 'Add to Favorites',
          divider: session.user.id === song.uploaderId,
          onClick: async () => {
            const [error] = await addFavoriteSongToLibrary({
              songId: song.id,
              path: pathname,
            });
            if (error) return showToast(error, 'error');
            showToast('Added song to Favorites', 'success');
          },
        }
      : {
          label: 'Remove from Favorites',
          divider: session.user.id === song.uploaderId,
          onClick: async () => {
            const [error] = await removeFavoriteSongFromLibrary({
              songId: song.id,
              path: pathname,
            });
            if (error) return showToast(error, 'error');
            showToast('Removed song from Favorites', 'success');
          },
        },
    ...(session.user.id === song.uploaderId
      ? [
          {
            label: 'Edit Song',
            href: `/songs/update/${song.id}`,
          },
        ]
      : []),
  ];
};

const getPlaylistSongMenuItems = ({
  playlist,
  ...songProps
}: { playlist: Playlist } & Parameters<
  typeof getSongMenuItems
>[0]): ContextMenuItem[] => {
  const pathname = usePathname();
  const createToast = useToastStore(state => state.createToast);
  const items = getSongMenuItems(songProps);

  if (playlist.isFavoritePlaylist) {
    if (
      items[items.length - 1].label === 'Add to Favorites' ||
      items[items.length - 1].label === 'Remove from Favorites'
    ) {
      items.pop();
    }

    if (
      items[items.length - 2].label === 'Add to Favorites' ||
      items[items.length - 2].label === 'Remove from Favorites'
    ) {
      items.splice(items.length - 2, 1);
      items[items.length - 2].divider = true;
    }
  }

  const favoriteItem = {
    label: playlist.isFavoritePlaylist
      ? 'Remove from Favorites'
      : 'Remove from Playlist',
    onClick: async () => {
      const [error] = await removeSongFromPlaylist({
        playlistId: playlist.id,
        songId: songProps.song.id,
        path: pathname,
      });
      if (error) return createToast(error, 'error');
      createToast('Song removed from playlist', 'success');
    },
  };

  const newItems: ContextMenuItem[] = [
    ...items.splice(0, 4),
    ...(songProps.session?.user.id === playlist.creatorId ? [favoriteItem] : []),
    ...items,
  ];
  if (newItems.at(-1)?.label.includes('Edit')) {
    newItems[newItems.length - 2].divider = true;
    newItems[newItems.length - 3].divider = false;
  }
  return newItems;
};

const getPlaylistMenuItems = ({
  session,
  playlist,
}: {
  session: Session | null;
  playlist: Playlist;
}): ContextMenuItem[] => {
  const isPlaying = useQueueStore(state => state.isPlaying);
  const setIsPlaying = useQueueStore(state => state.setIsPlaying);
  const currentlyPlayingSong = useQueueStore(state =>
    state.items.find(item => item.id === state.currentlyPlayingId)
  );
  const isCurrentPlaylist = playlist.id === currentlyPlayingSong?.playlistId;
  const openPlaylistModal = usePlaylistModalStore(state => state.open);
  const playPlaylist = useQueueStore(state => state.playPlaylist);
  const pathname = usePathname();
  const createToast = useToastStore(state => state.createToast);

  if (!session) return [];

  return [
    {
      label: isCurrentPlaylist ? (isPlaying ? 'Pause' : 'Play') : 'Play',
      onClick: () => {
        if (isCurrentPlaylist) {
          return setIsPlaying(!isPlaying);
        }
        playPlaylist(playlist, null);
      },
      divider: true,
    },
    {
      label: 'Play Next',
      onClick: async () => {
        const result = await addNextPlaylistToQueue(playlist.id, pathname);
        if (!result) {
          return createToast(
            'Something went wrong please try again later',
            'error'
          );
        }
        createToast('Playing next', 'success');
      },
    },
    {
      label: 'Play Last',
      onClick: async () => {
        const result = await insertPlaylistToBackOfQueue(playlist.id, pathname);
        if (!result) {
          return createToast(
            'Something went wrong please try again later',
            'error'
          );
        }
        createToast('Playing last', 'success');
      },
      divider:
        playlist.creatorId === session?.user?.id &&
        !playlist.isFavoritePlaylist,
    },
    ...(playlist.creatorId === session?.user?.id && !playlist.isFavoritePlaylist
      ? [
          {
            label: 'Edit Playlist',
            onClick: () => openPlaylistModal(playlist, 'edit'),
          },
          {
            label: 'Delete',
            onClick: async () => openPlaylistModal(playlist, 'delete'),
          },
        ]
      : []),
  ];
};

const getQueueMenuItems = ({
  queueItemId,
  song,
  playlists,
  isFavorite,
  session,
}: {
  queueItemId: string;
  song: Song;
  playlists: Playlist[];
  isFavorite: boolean;
  session: Session | null;
}): ContextMenuItem[] => {
  const pathname = usePathname();
  const setIsPlaying = useQueueStore(state => state.setIsPlaying);
  const removeFromQueue = useQueueStore(state => state.removeSongFromQueue);
  const setCurrentlyPlayingId = useQueueStore(
    state => state.setCurrentlyPlayingId
  );
  const createToast = useToastStore(state => state.createToast);
  const currentlyPlayingId = useQueueStore(state => state.currentlyPlayingId);
  const isCurrentItem = queueItemId === currentlyPlayingId;
  const isPlaying = useQueueStore(state => state.isPlaying && isCurrentItem);

  const items: ContextMenuItem[] = [
    {
      label: isCurrentItem && isPlaying ? 'Pause' : 'Play',
      onClick: () => {
        if (isCurrentItem) return setIsPlaying(!isPlaying);
        setCurrentlyPlayingId(queueItemId);
        setIsPlaying(true);
      },
      divider: true,
    },
    {
      label: 'Remove from Queue',
      onClick: () => removeFromQueue(queueItemId),
      divider: true,
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
  ];

  if (isFavorite) {
    items.push({
      label: 'Remove from Favorites',
      onClick: async () => {
        const [error] = await removeFavoriteSongFromLibrary({
          songId: song.id,
          path: pathname,
        });
        if (error) return createToast(error, 'error');
        createToast('Removed from Favorites', 'success');
      },
    });
  }

  if (!isFavorite) {
    items.push({
      label: 'Add to Favorites',
      onClick: async () => {
        const [error] = await addFavoriteSongToLibrary({
          songId: song.id,
          path: pathname,
        });
        if (error) return createToast(error, 'error');
        createToast('Added song to Favorites', 'success');
      },
    });
  }

  if (session?.user?.id === song.uploaderId) {
    items[items.length - 1].divider = true;
    items.push({
      label: 'Edit Song',
      href: `/songs/update/${song.id}`,
    });
  }

  return items;
};
