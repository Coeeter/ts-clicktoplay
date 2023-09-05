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
  const currentlyPlayingPlaylist = useQueueStore(state => state.playlistId);
  const currentlyPlayingSong = useQueueStore(state => state.currentlyPlayingId);
  const items = useQueueStore(state => state.items);
  const songsNotInPlaylist = items.filter(item => {
    const occurences = item.id.split('-')[1];
    return (
      occurences !== '1' ||
      !playlist.items.find(playlistItem => playlistItem.songId === item.songId)
    );
  });
  const isSongInPlaylist =
    songsNotInPlaylist.find(song => song.id === currentlyPlayingSong) ===
    undefined;

  return (
    <button
      className="bg-blue-700 text-white p-3 rounded-full transition hover:scale-[1.1]"
      onClick={() => {
        if (playlist.id === currentlyPlayingPlaylist && isSongInPlaylist) {
          return setIsPlaying(!isPlaying);
        }
        playPlaylist(playlist, null);
      }}
    >
      {isPlaying &&
      playlist.id === currentlyPlayingPlaylist &&
      isSongInPlaylist ? (
        <MdPause className="w-8 h-8" />
      ) : (
        <MdPlayArrow className="w-8 h-8" />
      )}
    </button>
  );
};
