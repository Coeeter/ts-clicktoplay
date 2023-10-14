'use client';

import { Playlist } from '@/actions/playlist';
import { ContextMenuButton } from '@/components/menu/ContextMenuButton';
import { useContextMenuItems } from '@/hooks/useContextMenu';
import { Session } from 'next-auth';
import { MdMoreHoriz } from 'react-icons/md';

type MoreOptionsButtonProps = {
  session: Session | null;
  playlist: Playlist;
};

export const MoreOptionsButton = ({
  session,
  playlist,
}: MoreOptionsButtonProps) => {
  const contextMenuItems = useContextMenuItems({
    type: 'playlist',
    playlist,
    session,
  });

  return (
    <ContextMenuButton
      className="text-slate-300/50 hover:text-slate-300/75 mx-3 py-3 rounded-full transition"
      baseHorizontal="left"
      contextMenuItems={contextMenuItems}
    >
      <MdMoreHoriz className="w-8 h-8" />
    </ContextMenuButton>
  );
};
