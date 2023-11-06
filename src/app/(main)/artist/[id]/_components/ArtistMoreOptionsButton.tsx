'use client';

import { ContextMenuButton } from '@/components/menu/ContextMenuButton';
import { useContextMenuItems } from '@/hooks/useContextMenu';
import { Artist, Song } from '@prisma/client';
import { Session } from 'next-auth';
import { MdMoreHoriz } from 'react-icons/md';

type ArtistMoreOptionsButtonProps = {
  session: Session | null;
  artist: Artist & {
    songs: Song[];
  };
};

export const ArtistMoreOptionsButton = ({
  session,
  artist,
}: ArtistMoreOptionsButtonProps) => {
  const contextMenuItems = useContextMenuItems({
    type: 'artist',
    artist,
    session,
  });

  return (
    <ContextMenuButton
      className="text-slate-300/50 hover:text-slate-300/75 py-3 rounded-full transition"
      baseHorizontal="left"
      contextMenuItems={contextMenuItems}
    >
      <MdMoreHoriz className="w-8 h-8" />
    </ContextMenuButton>
  );
};
