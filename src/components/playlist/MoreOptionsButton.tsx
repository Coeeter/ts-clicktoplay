'use client';

import { Playlist } from '@/actions/playlist';
import { useContextMenu } from '@/hooks/useContextMenu';
import { usePlaylistModalStore } from '@/store/PlaylistModalStore';
import { useQueueStore } from '@/store/QueueStore';
import { Session } from 'next-auth';
import { useRef } from 'react';
import { MdMoreHoriz } from 'react-icons/md';

type MoreOptionsButtonProps = {
  session: Session | null;
  playlist: Playlist;
};

export const MoreOptionsButton = ({
  session,
  playlist,
}: MoreOptionsButtonProps) => {
  const ref = useRef<HTMLButtonElement>(null);
  const playPlaylist = useQueueStore(state => state.playPlaylist);
  const openPlaylistModal = usePlaylistModalStore(state => state.open);
  const { showContextMenu } = useContextMenu();

  return (
    <button
      ref={ref}
      className="text-slate-300/50 hover:text-slate-300/75 mx-3 py-3 rounded-full transition"
      onClick={() => {
        showContextMenu(
          ref.current?.getBoundingClientRect().left ?? 0,
          ref.current?.getBoundingClientRect().bottom ?? 0,
          [
            {
              label: 'Play',
              onClick: () => playPlaylist(playlist, null),
            },
            ...(playlist.creatorId === session?.user?.id
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
          ]
        );
      }}
    >
      <MdMoreHoriz className="w-8 h-8" />
    </button>
  );
};
