'use client';

import { useQueueStore } from '@/store/QueueStore';
import { useToastStore } from '@/store/ToastStore';
import { Song } from '@prisma/client';
import { Session } from 'next-auth';
import { MdPause, MdPlayArrow } from 'react-icons/md';

type PlayButtonProps = {
  song: Song;
  songs: Song[];
  session: Session | null;
};

export const PlayButton = ({ song, songs, session }: PlayButtonProps) => {
  const isPlaying = useQueueStore(state => state.isPlaying);
  const setIsPlaying = useQueueStore(state => state.setIsPlaying);
  const playSong = useQueueStore(state => state.playSong);
  const currentlyPlayingQueueItem = useQueueStore(state =>
    state.items.find(item => item.id === state.currentlyPlayingId)
  );
  const isCurrentSong = song.id === currentlyPlayingQueueItem?.songId;
  const createToast = useToastStore(state => state.createToast);

  return (
    <button
      className="bg-blue-700 text-white p-3 rounded-full transition hover:scale-[1.1]"
      onClick={() => {
        if (!session) return createToast('You must be logged in', 'normal');
        if (isCurrentSong) {
          return setIsPlaying(!isPlaying);
        }
        playSong(song.id, songs.map(s => s.id));
      }}
    >
      {isPlaying && isCurrentSong ? (
        <MdPause className="w-8 h-8" />
      ) : (
        <MdPlayArrow className="w-8 h-8" />
      )}
    </button>
  );
};
