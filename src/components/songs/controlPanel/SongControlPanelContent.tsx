'use client';

import { Song } from '@prisma/client';
import { SongDetail } from './SongDetail';
import { SongPlayer } from './SongPlayer';
import { VolumeTrackbar } from './VolumeTrackbar';
import { extractMainColor } from '@/utils/extractMainColor';
import { AuthSession } from '@/lib/auth';
import { useEffect, useState } from 'react';
import { useMounted } from '@/hooks/useMounted';
import { useQueueStore } from '@/store/QueueStore';

type SongControlPanelContentProps = {
  songs: Song[];
  favorites: Song[];
  session: AuthSession | null;
  primaryColor: Awaited<ReturnType<typeof extractMainColor>>;
};

export const SongControlPanelContent = ({
  songs,
  favorites,
  session,
  primaryColor,
}: SongControlPanelContentProps) => {
  const [mainColor, setMainColor] = useState(primaryColor);
  const currentlyPlayingQueueItem = useQueueStore(state => {
    return state.items.find(item => item.id === state.currentlyPlayingId);
  });
  const isMounted = useMounted();

  useEffect(() => {
    if (!currentlyPlayingQueueItem) return;
    const song = songs.find(
      song => song.id === currentlyPlayingQueueItem.songId
    );
    if (!song) return;
    extractMainColor(song.albumCover).then(color => {
      setMainColor(color);
    });
  }, [currentlyPlayingQueueItem]);

  if (!isMounted) return null;

  return (
    <div
      className="m-1 rounded-md md:m-0 md:rounded-none md:!bg-slate-900 text-slate-300 p-3 flex md:justify-between absolute bottom-[4.25rem] md:bottom-0 left-0 right-0"
      style={{
        backgroundColor: mainColor.darkVibrant ?? 'transparent',
        display: session ? undefined : 'none',
      }}
    >
      <SongDetail songs={songs} favoriteSongs={[...(favorites ?? [])]} />
      <SongPlayer songs={songs} />
      <VolumeTrackbar />
    </div>
  );
};
