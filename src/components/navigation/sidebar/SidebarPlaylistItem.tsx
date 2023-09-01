'use client';

import { Playlist, deletePlaylist } from '@/actions/playlist';
import { useContextMenu } from '@/hooks/useContextMenu';
import { useQueueStore } from '@/store/QueueStore';
import { useToastStore } from '@/store/ToastStore';
import Link from 'next/link';

type SidebarPlaylistItemProps = {
  playlist: Playlist;
};

export const SidebarPlaylistItem = ({ playlist }: SidebarPlaylistItemProps) => {
  const { contextMenuHandler } = useContextMenu();
  const createToast = useToastStore(state => state.createToast);
  const playPlaylist = useQueueStore(state => state.playPlaylist);

  return (
    <Link
      className="flex gap-2 items-center p-2 rounded-md hover:bg-slate-700 w-full"
      onContextMenu={contextMenuHandler([
        {
          label: 'Play',
          onClick: () => {
            playPlaylist(playlist, null);
          },
        },
        {
          label: 'Edit Playlist',
          onClick: () => {},
        },
        {
          label: 'Delete',
          onClick: async () => {
            await deletePlaylist({
              playlistId: playlist.id,
            });
            createToast('Playlist deleted', 'success');
          },
        },
      ])}
      href={`/playlist/${playlist.id}`}
    >
      <img
        src={playlist.image ?? '/playlist-cover.png'}
        alt={playlist.title}
        className="w-14 aspect-square rounded-md bg-slate-100 object-cover"
      />
      <div className="flex flex-col justify-between whitespace-nowrap overflow-hidden">
        <div className="text-md text-slate-200 font-semibold">
          {playlist.title}
        </div>
        <span className="text-sm truncate">
          {'Playlist' + ' • ' + playlist.creator.name}
        </span>
      </div>
    </Link>
  );
};
