'use client';

import { Playlist } from '@/actions/playlist';
import { useContextMenu } from '@/hooks/useContextMenu';
import { usePlaylistModalStore } from '@/store/PlaylistModalStore';
import { useQueueStore } from '@/store/QueueStore';
import { Session } from 'next-auth';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MdVolumeUp } from 'react-icons/md';

type SidebarPlaylistItemProps = {
  playlist: Playlist;
  session: Session | null;
};

export const SidebarPlaylistItem = ({
  playlist,
  session,
}: SidebarPlaylistItemProps) => {
  const { contextMenuHandler } = useContextMenu();
  const playPlaylist = useQueueStore(state => state.playPlaylist);
  const isPlaying = useQueueStore(state => state.isPlaying);
  const pathname = usePathname();
  const openPlaylistModal = usePlaylistModalStore(state => state.open);
  const currentlyPlayingSong = useQueueStore(state =>
    state.items.find(item => item.id === state.currentlyPlayingId)
  );

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
      ])}
      href={`/playlist/${playlist.id}`}
    >
      <div className="flex gap-2 items-center">
        <img
          src={
            playlist.isFavoritePlaylist
              ? '/favorites.png'
              : playlist.image ?? '/playlist-cover.png'
          }
          alt={playlist.title}
          className={`w-12 aspect-square rounded-md bg-slate-100 object-cover ${
            !playlist.isFavoritePlaylist && !playlist.image
              ? 'bg-slate-100'
              : ''
          }`}
        />
        <div className="flex flex-col justify-between whitespace-nowrap overflow-hidden">
          <div
            className={`text-md font-bold ${
              currentlyPlayingSong?.playlistId === playlist.id
                ? 'text-blue-500'
                : 'text-slate-300'
            }`}
          >
            {playlist.title}
          </div>
          <span className="text-xs truncate">
            {'Playlist' + ' • ' + playlist.creator.name}
          </span>
        </div>
      </div>
      {isPlaying && currentlyPlayingSong?.playlistId === playlist.id && (
        <MdVolumeUp className="text-blue-500 text-lg" />
      )}
    </Link>
  );
};
