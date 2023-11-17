'use client';
import {
  addFavoriteSongToLibrary,
  removeFavoriteSongFromLibrary,
} from '@/actions/library';
import { useMounted } from '@/hooks/useMounted';
import { NavigationLink } from '@/hooks/useNavigation';
import { useToolTip } from '@/hooks/useToolTip';
import { useQueueStore } from '@/store/QueueStore';
import { useToastStore } from '@/store/ToastStore';
import { Song } from '@prisma/client';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { MdFavorite, MdFavoriteBorder } from 'react-icons/md';

type SongDetailProps = {
  songs: Song[];
  favoriteSongs: Song[];
};

export const SongDetail = ({ songs, favoriteSongs }: SongDetailProps) => {
  const pathname = usePathname();
  const mounted = useMounted();
  const createToast = useToastStore(state => state.createToast);
  const currentlyPlayingQueueId = useQueueStore(
    state => state.currentlyPlayingId
  );
  const currentlyPlayingQueueItem = useQueueStore(state =>
    state.items.find(item => item.id === currentlyPlayingQueueId)
  );
  const currentSong = songs.find(
    song => song.id === currentlyPlayingQueueItem?.songId
  );

  const isFavorite = useMemo(() => {
    if (!currentSong) return false;
    return favoriteSongs.some(song => song.id === currentSong.id);
  }, [currentSong, favoriteSongs, songs]);

  const { register: registerFavBtn, removeTooltip } = useToolTip({
    content: isFavorite ? 'Unfavorite' : 'Favorite',
  });

  if (!mounted || !currentSong) return <div className="h-16 flex-1" />;

  const { id, title, artist, albumCover } = currentSong;

  return (
    <div className="flex gap-3 flex-1 items-center">
      <div className="w-16 aspect-square rounded-md overflow-hidden">
        <img
          src={albumCover ?? '/album-cover.png'}
          className="w-full h-full box-border object-cover"
          alt="album cover"
        />
      </div>
      <div className="flex flex-col justify-center">
        <NavigationLink
          className="text-md font-bold hover:underline"
          href={`/songs/${id}`}
        >
          {title}
        </NavigationLink>
        <NavigationLink
          className="text-sm text-slate-300/50 hover:underline"
          href={`/artist/${currentSong.artistIds[0]}`}
        >
          {artist === '' ? 'Unknown' : artist ?? 'Unknown'}
        </NavigationLink>
      </div>
      <button
        className={'text-2xl cursor-pointer'}
        onClick={async () => {
          removeTooltip();
          if (isFavorite) {
            const [error] = await removeFavoriteSongFromLibrary({
              songId: currentSong.id,
              path: pathname,
            });
            if (error) return createToast(error, 'error');
            createToast('Removed from Favorites', 'success');
            return;
          }
          const [error] = await addFavoriteSongToLibrary({
            songId: currentSong.id,
            path: pathname,
          });
          if (error) return createToast(error, 'error');
          createToast('Added song to Favorites', 'success');
        }}
        {...registerFavBtn({
          place: 'top-center',
        })}
      >
        {isFavorite ? (
          <MdFavorite className="text-blue-700 hover:text-blue-600" />
        ) : (
          <MdFavoriteBorder className="text-slate-300/50 hover:text-slate-300" />
        )}
      </button>
    </div>
  );
};
