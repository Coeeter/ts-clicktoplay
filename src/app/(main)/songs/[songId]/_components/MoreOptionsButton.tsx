'use client';
import { Playlist } from '@/actions/playlist';
import { ContextMenuButton } from '@/components/menu/ContextMenuButton';
import { useContextMenuItems } from '@/hooks/useContextMenu';
import { useClientSession } from '@/hooks/useSession';
import { useQueueStore } from '@/store/QueueStore';
import { Song, User } from '@prisma/client';
import { MdMoreHoriz } from 'react-icons/md';

type MoreOptionsButtonProps = {
  song: Song & {
    uploader: User;
  };
  songs: Song[];
  playlists: Playlist[];
  isFavorite: boolean;
};

export const MoreOptionsButton = ({
  song,
  songs,
  playlists,
  isFavorite,
}: MoreOptionsButtonProps) => {
  const { session } = useClientSession();
  const playSong = useQueueStore(state => state.playSong);
  const contextMenuItems = useContextMenuItems({
    type: 'song',
    isFavorite,
    playlists,
    playSong: () => {
      playSong(
        song.id,
        songs.map(song => song.id)
      );
    },
    song,
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
