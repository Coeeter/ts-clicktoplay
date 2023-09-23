'use client';

import { Song } from '@prisma/client';
import { SongItem } from './SongItem';
import { useQueueStore } from '@/store/QueueStore';
import { useToastStore } from '@/store/ToastStore';
import { Playlist } from '@/actions/playlist';
import { Session } from 'next-auth';

type SongListProps = {
  songs: Song[];
  playlists: Playlist[];
  session: Session | null;
  favoriteSongs: Song[];
};

export const SongList = ({
  songs,
  playlists,
  session,
  favoriteSongs,
}: SongListProps) => {
  const playSong = useQueueStore(state => state.playSong);
  const shuffle = useQueueStore(state => state.shuffle);
  const setShuffle = useQueueStore(state => state.setShuffle);
  const createToast = useToastStore(state => state.createToast);

  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {songs.map(song => (
        <SongItem
          key={song.id}
          session={session}
          song={song}
          playlists={playlists}
          isFavorite={favoriteSongs.find(s => s.id === song.id) !== undefined}
          playSong={() => {
            try {
              playSong(
                song.id,
                songs.map(s => s.id)
              );
              if (shuffle) setShuffle(true);
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
