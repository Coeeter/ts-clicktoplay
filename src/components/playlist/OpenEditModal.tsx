'use client';

import { Playlist } from '@/actions/playlist';
import { useEditPlaylistModalStore } from '@/store/EditPlaylistModalStore';
import { Session } from 'next-auth';

type OpenEditModalProps = {
  session: Session | null;
  playlist: Playlist;
  children: React.ReactNode;
};

export const OpenEditModal = ({
  session,
  playlist,
  children,
}: OpenEditModalProps) => {
  const open = useEditPlaylistModalStore(state => state.open);

  if (!session || playlist.creator.id !== session.user.id) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col justify-end" onClick={() => open(playlist)}>
      {children}
    </div>
  );
};
