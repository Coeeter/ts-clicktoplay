'use client';

import { Playlist } from '@/actions/playlist';
import { useQueueStore } from '@/store/QueueStore';
import { MdPause, MdPlayArrow } from 'react-icons/md';

type PlaylistPlayButtonProps = {
  playlist: Playlist;
};

export const PlaylistPlayButton = ({ playlist }: PlaylistPlayButtonProps) => {
  const playPlaylist = useQueueStore(state => state.playPlaylist);
  const setIsPlaying = useQueueStore(state => state.setIsPlaying);
  const isPlaying = useQueueStore(state => state.isPlaying);
  const shuffled = useQueueStore(state => state.shuffle);
  const currentlyPlayingSong = useQueueStore(state =>
    state.items.find(item => item.id === state.currentlyPlayingId)
  );

  return (
    <button
      className="bg-blue-700 text-white p-3 rounded-full transition hover:scale-[1.1]"
      onClick={() => {
        if (playlist.id === currentlyPlayingSong?.playlistId) {
          return setIsPlaying(!isPlaying);
        }
        playPlaylist(
          playlist,
          (shuffled
            ? playlist.items.at(
                Math.floor(Math.random() * playlist.items.length)
              )?.songId
            : playlist.items.at(0)?.songId) ?? null
        );
      }}
    >
      {isPlaying && currentlyPlayingSong?.playlistId === playlist.id ? (
        <MdPause className="w-8 h-8" />
      ) : (
        <MdPlayArrow className="w-8 h-8" />
      )}
    </button>
  );
};
