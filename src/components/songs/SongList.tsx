'use client';

import { Song } from '@prisma/client';
import { SongItem } from './SongItem';
import { useQueueStore } from '@/store/QueueStore';

export const SongList = ({ songs }: { songs: Song[] }) => {
  const playSong = useQueueStore(state => state.playSong);

  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {songs.map(song => (
        <SongItem
          key={song.id}
          song={song}
          playSong={() => {
            playSong(
              song.id,
              songs.map(s => s.id)
            );
          }}
        />
      ))}
    </div>
  );
};
