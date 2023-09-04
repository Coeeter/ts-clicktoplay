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

  if (!session || playlist.creator.id !== session.user.id) {
    return <>{children}</>;
  }

  return (
    <div
      className="flex flex-col justify-end"
      onClick={() => open(playlist, type)}
    >
      {children}
    </div>
  );
};
