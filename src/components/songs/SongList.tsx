'use client';
import { Song } from '@prisma/client';
import { SongItem } from './SongItem';
import { useQueueStore } from '@/store/QueueStore';
import { useToastStore } from '@/store/ToastStore';
import { Playlist } from '@/actions/playlist';
import { useEffect, useState } from 'react';

type SongListProps = {
  songs: Song[];
  playlists: Playlist[];
  favoriteSongs: Song[];
  type?: 'list' | 'grid';
  highlight?: boolean;
  title?: string;
};

export const SongList = ({
  songs,
  playlists,
  favoriteSongs,
  type = 'grid',
  highlight = false,
  title = 'Top Songs',
}: SongListProps) => {
  const playSong = useQueueStore(state => state.playSong);
  const createToast = useToastStore(state => state.createToast);
  const displayedSongs = highlight ? songs.slice(1) : songs;
  const [row, setRow] = useState(true);

  useEffect(() => {
    const element = document.querySelector('#root')!;
    const onResize = () => {
      setRow(element.clientWidth > window.innerWidth * 0.6);
    };
    const observer = new ResizeObserver(onResize);
    observer.observe(element);
    onResize();
    return () => {
      observer.disconnect();
    };
  }, []);

  const content = (
    <div
      className={
        type === 'grid'
          ? `flex flex-wrap gap-3 justify-center`
          : 'flex flex-col gap-3 w-full'
      }
    >
      {displayedSongs.map(song => (
        <SongItem
          key={song.id}
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

  if (highlight && songs.length > 0) {
    const song = songs[0];
    return (
      <div
        className={`flex gap-3 items-center ${
          row ? 'flex-row' : 'flex-col w-full'
        }`}
      >
        <div className={`flex flex-col ${row ? '' : 'w-full'}`}>
          <h2 className="text-2xl font-bold text-slate-200 mb-5">{title}</h2>
          <SongItem
            key={song.id}
            song={song}
            playlists={playlists}
            isFavorite={favoriteSongs.find(s => s.id === song.id) !== undefined}
            type={'grid'}
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
            highlight={highlight}
          />
        </div>
        <div className="min-w-[512px] w-full">{content}</div>
      </div>
    );
  }

  return content;
};
