'use client';

import { Playlist, deletePlaylist } from '@/actions/playlist';
import { useContextMenu } from '@/hooks/useContextMenu';
import { useQueueStore } from '@/store/QueueStore';
import { useToastStore } from '@/store/ToastStore';
import { MdVolumeUp } from 'react-icons/md';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEditPlaylistModalStore } from '@/store/EditPlaylistModalStore';
import { Session } from 'next-auth';

type SidebarPlaylistItemProps = {
  playlist: Playlist;
  session: Session | null;
};

export const SidebarPlaylistItem = ({
  playlist,
  session,
}: SidebarPlaylistItemProps) => {
  const { contextMenuHandler } = useContextMenu();
  const createToast = useToastStore(state => state.createToast);
  const playPlaylist = useQueueStore(state => state.playPlaylist);
  const isPlaylistPlaying = useQueueStore(
    state => state.playlistId === playlist.id
  );
  const isPlaying = useQueueStore(state => state.isPlaying);
  const pathname = usePathname();
  const router = useRouter();
  const openEditPlaylistModal = useEditPlaylistModalStore(state => state.open);

  return (
    <Link
      className={`p-2 rounded-md hover:bg-slate-700 w-full flex justify-between items-center ${
        pathname.startsWith(`/playlist/${playlist.id}`) ? 'bg-slate-700' : ''
      }`}
      onContextMenu={contextMenuHandler([
        {
          label: 'Play',
          onClick: () => playPlaylist(playlist, null),
        },
        ...(playlist.creatorId === session?.user?.id
          ? [
              {
                label: 'Edit Playlist',
                onClick: () => openEditPlaylistModal(playlist),
              },
              {
                label: 'Delete',
                onClick: async () => {
                  await deletePlaylist({
                    playlistId: playlist.id,
                  });
                  router.replace('/');
                  createToast('Playlist deleted', 'success');
                },
              },
            ]
          : []),
      ])}
      href={`/playlist/${playlist.id}`}
    >
      <div className="flex gap-2 items-center">
        <img
          src={playlist.image ?? '/playlist-cover.png'}
          alt={playlist.title}
          className="w-12 aspect-square rounded-md bg-slate-100 object-cover"
        />
        <div className="flex flex-col justify-between whitespace-nowrap overflow-hidden">
          <div
            className={`text-md font-bold ${
              isPlaylistPlaying ? 'text-blue-500' : 'text-slate-300'
            }`}
          >
            {playlist.title}
          </div>
          <span className="text-xs truncate">
            {'Playlist' + ' • ' + playlist.creator.name}
          </span>
        </div>
      </div>
      {isPlaylistPlaying && isPlaying && (
        <MdVolumeUp className="text-blue-500 text-lg" />
      )}
    </Link>
  );
};
