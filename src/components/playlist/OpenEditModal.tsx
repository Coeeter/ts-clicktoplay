'use client';

import { Playlist } from '@/actions/playlist';
import { usePlaylistModalStore } from '@/store/PlaylistModalStore';
import { Session } from 'next-auth';

type OpenEditModalProps = {
  session: Session | null;
  playlist: Playlist;
  type: 'edit' | 'delete';
  children: React.ReactNode;
};

export const OpenPlaylistModal = ({
  session,
  playlist,
  type,
  children,
}: OpenEditModalProps) => {
  const open = usePlaylistModalStore(state => state.open);

  if (
    !session ||
    playlist.creator.id !== session.user.id ||
    playlist.isFavoritePlaylist
  ) {
    return <div className='cursor-default'>{children}</div>;
  }

  return (
    <div
      className="flex flex-col justify-end cursor-pointer"
      onClick={() => open(playlist, type)}
    >
      {children}
    </div>
  );
};
