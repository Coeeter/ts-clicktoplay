'use client';
import { Playlist } from '@/actions/playlist';
import { usePlaylistModalStore } from '@/store/PlaylistModalStore';
import { useQueueStore } from '@/store/QueueStore';
import { Session } from 'next-auth';
import { MdMoreHoriz } from 'react-icons/md';
import { ContextMenuButton } from '../ContextMenu/ContextMenuButton';

type MoreOptionsButtonProps = {
  session: Session | null;
  playlist: Playlist;
};

export const MoreOptionsButton = ({
  session,
  playlist,
}: MoreOptionsButtonProps) => {
  const playPlaylist = useQueueStore(state => state.playPlaylist);
  const openPlaylistModal = usePlaylistModalStore(state => state.open);

  return (
    <ContextMenuButton
      className="text-slate-300/50 hover:text-slate-300/75 mx-3 py-3 rounded-full transition"
      baseHorizontal='left'
      contextMenuItems={[
        {
          label: 'Play',
          onClick: () => playPlaylist(playlist, null),
        },
        ...(playlist.creatorId === session?.user?.id &&
        !playlist.isFavoritePlaylist
          ? [
              {
                label: 'Edit Playlist',
                onClick: () => openPlaylistModal(playlist, 'edit'),
              },
              {
                label: 'Delete',
                onClick: async () => openPlaylistModal(playlist, 'delete'),
              },
            ]
          : []),
      ]}
    >
      <MdMoreHoriz className="w-8 h-8" />
    </ContextMenuButton>
  );
};
