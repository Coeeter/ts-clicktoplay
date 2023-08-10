'use client';
import { Song } from '@prisma/client';
import { SongItem } from './SongItem';
import { useQueueStore } from '@/store/QueueStore';
import { useToastStore } from '@/store/ToastStore';

export const SongList = ({ songs }: { songs: Song[] }) => {
  const playSong = useQueueStore(state => state.playSong);
  const createToast = useToastStore(state => state.createToast);

  return (
    <div className="flex flex-wrap gap-3 justify-center mb-3">
      {songs.map(song => (
        <SongItem
          key={song.id}
          song={song}
          playSong={() => {
            try {
              playSong(
                song.id,
                songs.map(s => s.id)
              );
            } catch (e) {
              createToast(
                (e as any).message ?? 'Unknown error has occurred',
                (e as any).message ? 'normal' : 'error'
              );
            }
          }}
        />
      ))}
    </div>
  );
};
