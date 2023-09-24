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
  type?: "list" | "grid";
};

export const SongList = ({
  songs,
  playlists,
  session,
  favoriteSongs,
  type = "grid",
}: SongListProps) => {
  const playSong = useQueueStore(state => state.playSong);
  const createToast = useToastStore(state => state.createToast);

  return (
    <div className={type === 'grid' ? `flex flex-wrap gap-3 justify-center` : "flex flex-col gap-3"}>
      {songs.map(song => (
        <SongItem
          key={song.id}
          session={session}
          song={song}
          playlists={playlists}
          isFavorite={favoriteSongs.find(s => s.id === song.id) !== undefined}
          type={type}
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
