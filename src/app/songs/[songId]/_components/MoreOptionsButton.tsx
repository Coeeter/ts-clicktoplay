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
import { ContextMenuButton } from '@/components/menu/ContextMenuButton';
import { useQueueStore } from '@/store/QueueStore';
import { useToastStore } from '@/store/ToastStore';
import { Song, User } from '@prisma/client';
import { Session } from 'next-auth';
import { usePathname } from 'next/navigation';
import { MdMoreHoriz } from 'react-icons/md';

type MoreOptionsButtonProps = {
  session: Session | null;
  song: Song & {
    uploader: User;
  };
  songs: Song[];
  playlists: Playlist[];
  isFavorite: boolean;
};

export const MoreOptionsButton = ({
  session,
  song,
  songs,
  playlists,
  isFavorite,
}: MoreOptionsButtonProps) => {
  const isPlaying = useQueueStore(state => state.isPlaying);
  const setIsPlaying = useQueueStore(state => state.setIsPlaying);
  const playSong = useQueueStore(state => state.playSong);
  const addToQueue = useQueueStore(state => state.addSongToQueue);
  const showToast = useToastStore(state => state.createToast);
  const currentlyPlayingQueueItem = useQueueStore(state =>
    state.items.find(item => item.id === state.currentlyPlayingId)
  );
  const isCurrentSong = song.id === currentlyPlayingQueueItem?.songId;
  const pathname = usePathname();

  return (
    <ContextMenuButton
      className="text-slate-300/50 hover:text-slate-300/75 py-3 rounded-full transition"
      baseHorizontal="left"
      contextMenuItems={
        session
          ? [
              {
                label: isCurrentSong ? (isPlaying ? 'Pause' : 'Play') : 'Play',
                onClick: () => {
                  if (isCurrentSong) {
                    return setIsPlaying(!isPlaying);
                  }
                  playSong(
                    song.id,
                    songs.map(s => s.id)
                  );
                },
              },
              {
                label: 'Add to Queue',
                onClick: () => {
                  addToQueue(song.id);
                  showToast('Added to Queue', 'success');
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
                      if (error) return showToast(error, 'error');
                      showToast(
                        `Added to playlist '${playlist.title}'`,
                        'success'
                      );
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
                      showToast(
                        `Added to playlist '${playlist.title}'`,
                        'success'
                      );
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
            ]
          : [
              {
                label: 'You must be logged in to perform this action.',
                href: '/login',
              },
            ]
      }
    >
      <MdMoreHoriz className="w-8 h-8" />
    </ContextMenuButton>
  );
};
