'use client';
import { Playlist } from '@/actions/playlist';
import { ContextMenuButton } from '@/components/menu/ContextMenuButton';
import { useContextMenuItems } from '@/hooks/useContextMenu';
import { useClientSession } from '@/hooks/useSession';
import { useToolTip } from '@/hooks/useToolTip';
import { MdMoreHoriz } from 'react-icons/md';

type MoreOptionsButtonProps = {
  playlist: Playlist;
};

export const MoreOptionsButton = ({ playlist }: MoreOptionsButtonProps) => {
  const { session } = useClientSession();
  const contextMenuItems = useContextMenuItems({
    type: 'playlist',
    playlist,
    session,
  });
  const { register, removeTooltip } = useToolTip({
    content: `More options for ${playlist.title}`,
  });

  return (
    <div
      onClick={removeTooltip}
      {...register({
        place: 'top-center',
      })}
    >
      <ContextMenuButton
        className="text-slate-300/50 hover:text-slate-300/75 mx-3 py-3 rounded-full transition"
        baseHorizontal="left"
        contextMenuItems={contextMenuItems}
      >
        <MdMoreHoriz className="w-8 h-8" />
      </ContextMenuButton>
    </div>
  );
};
