'use client';

import { useMounted } from '@/hooks/useMounted';
import { useQueueStore } from '@/store/QueueStore';
import { Song } from '@prisma/client';
import Link from 'next/link';

type SongDetailProps = {
  songs: Song[];
};

export const SongDetail = ({ songs }: SongDetailProps) => {
  const mounted = useMounted();
  const currentlyPlayingQueueId = useQueueStore(
    state => state.currentlyPlayingId
  );
  const currentlyPlayingQueueItem = useQueueStore(state =>
    state.items.find(item => item.id === currentlyPlayingQueueId)
  );
  const currentSong = songs.find(
    song => song.id === currentlyPlayingQueueItem?.songId
  );

  if (!mounted || !currentSong) return <div className="w-16 aspect-square" />;

  const { id, title, artist, albumCover } = currentSong;

  return (
    <div className="flex gap-3 flex-1">
      <div className="w-16 aspect-square rounded-md overflow-hidden">
        <img
          src={albumCover ?? '/album-cover.png'}
          className="w-full h-full box-border object-cover"
        />
      </div>
      <div className="flex flex-col justify-center">
        <Link
          className="text-md font-bold hover:underline"
          href={`/songs/${id}`}
        >
          {title}
        </Link>
        <div className="text-sm text-slate-300/50">
          {artist === '' ? 'Unknown' : artist ?? 'Unknown'}
        </div>
      </div>
    </div>
  );
};
