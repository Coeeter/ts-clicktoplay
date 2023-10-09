'use client';

import { Playlist } from '@/actions/playlist';
import { useContextMenu, useContextMenuItems } from '@/hooks/useContextMenu';
import { useQueueStore } from '@/store/QueueStore';
import { Session } from 'next-auth';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MdVolumeUp } from 'react-icons/md';

type SidebarPlaylistItemProps = {
  playlist: Playlist;
  session: Session | null;
};

export const SidebarItem = ({
  playlist,
  session,
}: SidebarPlaylistItemProps) => {
  const isPlaying = useQueueStore(state => state.isPlaying);
  const pathname = usePathname();
  const currentlyPlayingSong = useQueueStore(state =>
    state.items.find(item => item.id === state.currentlyPlayingId)
  );
  const contextMenuItems = useContextMenuItems({
    type: 'playlist',
    playlist,
    session,
  });
  const { contextMenuHandler } = useContextMenu(contextMenuItems);

  return (
    <Link
      className={`p-2 rounded-md hover:bg-slate-700 w-full flex justify-between items-center ${
        pathname.startsWith(`/playlist/${playlist.id}`)
          ? 'bg-slate-700'
          : 'bg-slate-800'
      }`}
      onContextMenu={contextMenuHandler}
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
          className={`w-12 aspect-square rounded-md object-cover ${
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
