'use client';
import { Playlist } from '@/actions/playlist';
import { useClientSession } from '@/hooks/useSession';
import { useQueueStore } from '@/store/QueueStore';
import { useToastStore } from '@/store/ToastStore';
import { MdPause, MdPlayArrow } from 'react-icons/md';

type PlaylistPlayButtonProps = {
  playlist: Playlist;
  size?: 'normal' | 'small';
};

export const PlaylistPlayButton = ({
  playlist,
  size = 'normal',
}: PlaylistPlayButtonProps) => {
  const { session } = useClientSession();
  const playPlaylist = useQueueStore(state => state.playPlaylist);
  const setIsPlaying = useQueueStore(state => state.setIsPlaying);
  const isPlaying = useQueueStore(state => state.isPlaying);
  const shuffled = useQueueStore(state => state.shuffle);
  const currentlyPlayingSong = useQueueStore(state =>
    state.items.find(item => item.id === state.currentlyPlayingId)
  );
  const createToast = useToastStore(state => state.createToast);

  const padding = size === 'normal' ? 'p-3' : 'p-1';

  return (
    <button
      className={`bg-blue-700 text-white rounded-full transition hover:scale-[1.1] ${padding}`}
      onClick={() => {
        if (!session) return createToast('You must be logged in', 'normal');
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
