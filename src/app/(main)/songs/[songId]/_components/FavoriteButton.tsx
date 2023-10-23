'use client';

import {
  addFavoriteSongToLibrary,
  removeFavoriteSongFromLibrary,
} from '@/actions/library';
import { useToastStore } from '@/store/ToastStore';
import { Song } from '@prisma/client';
import { Session } from 'next-auth';
import { usePathname } from 'next/navigation';
import { MdFavorite, MdFavoriteBorder } from 'react-icons/md';

type FavoriteButtonProps = {
  isFavorite: boolean;
  song: Song;
  session: Session | null;
};

export const FavoriteButton = ({ isFavorite, song, session }: FavoriteButtonProps) => {
  const pathname = usePathname();
  const createToast = useToastStore(state => state.createToast);

  return (
    <button
      className="text-4xl cursor-pointer"
      onClick={async () => {
        if (!session) return createToast('You must be logged in', 'normal');
        if (isFavorite) {
          const [error] = await removeFavoriteSongFromLibrary({
            songId: song.id,
            path: pathname,
          });
          if (error) return createToast(error, 'error');
          createToast('Removed from Favorites', 'success');
          return;
        }
        const [error] = await addFavoriteSongToLibrary({
          songId: song.id,
          path: pathname,
        });
        if (error) return createToast(error, 'error');
        createToast('Added song to Favorites', 'success');
      }}
    >
      {isFavorite ? (
        <MdFavorite className="text-blue-700 hover:scale-110" />
      ) : (
        <MdFavoriteBorder className="text-slate-300/50 hover:scale-110" />
      )}
    </button>
  );
};
