'use client';

import { formatDistance, isToday, format } from 'date-fns';
import {
  Playlist,
  PlaylistId,
  addSongsToPlaylist,
  createPlaylist,
  removeSongsFromPlaylist,
} from '@/actions/playlist';
import { useQueueStore } from '@/store/QueueStore';
import { Song } from '@prisma/client';
import { HiPause, HiPlay } from 'react-icons/hi2';
import { useContextMenu } from '@/hooks/useContextMenu';
import { useToastStore } from '@/store/ToastStore';

type PlaylistItemProps = {
  song: Song;
  playlist: Playlist;
  playlists: Playlist[];
  isDragging: boolean;
  listOrder: number;
};

export const PlaylistItem = ({
  song,
  playlist,
  playlists,
  isDragging,
  listOrder,
}: PlaylistItemProps) => {
  const playlistId = playlist.id as PlaylistId;
  const currentlyPlayingPlaylist = useQueueStore(state => state.playlistId);
  const isPlaying = useQueueStore(state => state.isPlaying);
  const currentlyPlayingItem = useQueueStore(state =>
    state.items.find(item => item.id === state.currentlyPlayingId)
  );
  const setCurrentlyPlayingId = useQueueStore(
    state => state.setCurrentlyPlayingId
  );
  const playPlaylist = useQueueStore(state => state.playPlaylist);
  const addSongToQueue = useQueueStore(state => state.addSongToQueue);
  const setIsPlaying = useQueueStore(state => state.setIsPlaying);
  const queueItem = useQueueStore(state =>
    state.items.find(item => item.songId === song.id)
  );
  const shuffle = useQueueStore(state => state.shuffle);
  const setShuffle = useQueueStore(state => state.setShuffle);
  const isCurrentItem = currentlyPlayingItem?.id === queueItem?.id;
  const isCurrentPlaylist = currentlyPlayingPlaylist === playlistId;
  const { contextMenuHandler } = useContextMenu();
  const createToast = useToastStore(state => state.createToast);

  const addedAt = playlist.items.find(item => item.songId === song.id)?.addedAt;
  if (!addedAt) return null;
  const sameDay =
    isToday(new Date(addedAt)) &&
    !(
      new Date(addedAt).getHours() === 0 &&
      new Date(addedAt).getMinutes() === 0 &&
      new Date(addedAt).getSeconds() === 0
    );
  const timeAdded = !sameDay
    ? format(new Date(addedAt), 'MMM dd, yyyy')
    : formatDistance(new Date(addedAt), new Date(), { addSuffix: true });

  const playSong = () => {
    if (isDragging) return;
    if (currentlyPlayingPlaylist === playlistId && isCurrentItem) {
      return setIsPlaying(!isPlaying);
    }
    playPlaylist(playlist, song.id);
    if (shuffle) setShuffle(true);
  };

  return (
    <div
      onClick={playSong}
      onContextMenu={contextMenuHandler(
        getPlaylistContextMenuItems({
          song,
          playlists,
          isCurrentItem,
          isPlaying,
          playSong,
          playlistId,
          addSongToQueue,
          createToast,
        })
      )}
      className="w-full cursor-pointer grid grid-cols-3 items-center py-2 px-6 rounded-md transition-colors bg-slate-900 hover:bg-slate-700 group"
    >
      <div className="flex items-center gap-6">
        <div className="w-8 flex justify-center items-center">
          {isPlaying && isCurrentItem && isCurrentPlaylist ? (
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
                  isCurrentItem && isCurrentPlaylist
                    ? 'text-blue-500'
                    : 'text-slate-300/50'
                }`}
              >
                {listOrder}
              </span>
              <span
                className={`text-lg font-bold group-hover:inline hidden transition-all ${
                  isCurrentItem && isCurrentPlaylist
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
            <span
              className={`text-md font-bold ${
                isCurrentItem && isCurrentPlaylist
                  ? 'text-blue-500'
                  : 'text-slate-300'
              }`}
            >
              {song.title}
            </span>
            <span className="text-sm text-slate-300/50">
              {song.artist?.length ? song.artist : 'Unknown'}
            </span>
          </div>
        </div>
      </div>
      <span className="text-slate-300/50">{timeAdded}</span>
      <span className="text-slate-300/50 text-end">
        {new Date(song.duration * 1000).toISOString().substring(14, 19)}
      </span>
    </div>
  );
};

const getPlaylistContextMenuItems = ({
  song,
  playlists,
  isCurrentItem,
  isPlaying,
  playSong,
  playlistId,
  addSongToQueue,
  createToast,
}: {
  song: Song;
  playlists: Playlist[];
  isCurrentItem: boolean;
  isPlaying: boolean;
  playSong: () => void;
  playlistId: PlaylistId;
  addSongToQueue: (songId: string) => void;
  createToast: (message: string, type: 'success' | 'error') => void;
}) => {
  return [
    {
      label: isCurrentItem && isPlaying ? 'Pause' : 'Play',
      onClick: playSong,
    },
    {
      label: 'Remove from Playlist',
      onClick: async () => {
        await removeSongsFromPlaylist({
          playlistId,
          songIds: [song.id],
        });
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
            });
            await addSongsToPlaylist({
              playlistId: playlist.id,
              songIds: [song.id],
            });
            createToast(`Added to playlist '${playlist.title}'`, 'success');
          },
          divider: true,
        },
        ...playlists.map(playlist => ({
          label: playlist.title,
          onClick: async () => {
            try {
              await addSongsToPlaylist({
                playlistId: playlist.id,
                songIds: [song.id],
              });
              createToast(`Added to playlist '${playlist.title}'`, 'success');
            } catch (e) {
              if (e instanceof Error) createToast(e.message, 'error');
            }
          },
        })),
        ...(!playlists.length
          ? [{ label: 'No playlists found', selectable: false }]
          : []),
      ],
    },
    {
      label: 'Add to Favorites',
      onClick: () => {},
    },
  ];
};
