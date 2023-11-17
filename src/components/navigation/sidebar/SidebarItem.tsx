'use client';

import { Playlist } from '@/actions/playlist';
import { useContextMenu, useContextMenuItems } from '@/hooks/useContextMenu';
import { NavigationLink } from '@/hooks/useNavigation';
import { useToolTip } from '@/hooks/useToolTip';
import { AuthSession } from '@/lib/auth';
import { useQueueStore } from '@/store/QueueStore';
import { format, formatDistanceToNow, isThisMonth } from 'date-fns';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { MdVolumeUp } from 'react-icons/md';

type SidebarPlaylistItemProps = {
  playlist: Playlist;
  session: AuthSession | null;
  expanded: boolean;
  showMoreDetails: boolean;
  lastPlayed?: Date | null;
};

export const SidebarItem = ({
  playlist,
  session,
  expanded,
  showMoreDetails,
  lastPlayed,
}: SidebarPlaylistItemProps) => {
  const pathname = usePathname();
  const isPlaying = useQueueStore(state => state.isPlaying);
  const currentlyPlayingSong = useQueueStore(state =>
    state.items.find(item => item.id === state.currentlyPlayingId)
  );
  const contextMenuItems = useContextMenuItems({
    type: 'playlist',
    playlist,
    session,
  });
  const { contextMenuHandler } = useContextMenu(contextMenuItems);

  const timeAdded = useMemo(() => {
    const addedAt = playlist.createdAt;
    const isLongerThanAMonth = !isThisMonth(new Date(addedAt));
    return isLongerThanAMonth
      ? format(new Date(addedAt), 'MMM dd, yyyy')
      : formatDistanceToNow(new Date(addedAt), {
          addSuffix: true,
        });
  }, [playlist]);

  const formattedLastPlayed = useMemo(() => {
    if (!lastPlayed) return null;
    const isLongerThanAMonth = !isThisMonth(new Date(lastPlayed));
    return isLongerThanAMonth
      ? format(new Date(lastPlayed), 'MMM dd, yyyy')
      : formatDistanceToNow(new Date(lastPlayed), {
          addSuffix: true,
        });
  }, [lastPlayed]);

  const { register } = useToolTip({
    content: (
      <>
        <div
          className={`text-sm font-bold flex gap-1 items-center ${
            currentlyPlayingSong?.playlistId === playlist.id
              ? 'text-blue-500'
              : 'text-slate-300'
          }`}
        >
          {playlist.title}
          {isPlaying && currentlyPlayingSong?.playlistId === playlist.id && (
            <MdVolumeUp className="text-blue-500 text-lg" />
          )}
        </div>
        <div className="text-xs truncate text-slate-300/50">
          {'Playlist' + ' • ' + playlist.creator.name}
        </div>
      </>
    ),
  });

  if (!expanded) {
    return (
      <NavigationLink
        href={`/playlist/${playlist.id}`}
        onContextMenu={contextMenuHandler}
      >
        <img
          src={
            playlist.isFavoritePlaylist
              ? '/favorites.png'
              : playlist.image ?? '/playlist-cover.png'
          }
          alt={playlist.title}
          className={`w-14 aspect-square rounded-md object-cover ${
            !playlist.isFavoritePlaylist && !playlist.image
              ? 'bg-slate-100'
              : ''
          }`}
          {...register({
            place: 'right',
          })}
        />
      </NavigationLink>
    );
  }

  return (
    <NavigationLink
      className={`p-2 rounded-md hover:bg-slate-700 w-full flex relative ${
        pathname.startsWith(`/playlist/${playlist.id}`)
          ? 'bg-slate-700'
          : 'bg-slate-800'
      }`}
      onContextMenu={contextMenuHandler}
      href={`/playlist/${playlist.id}`}
    >
      <div className="grid grid-cols-4 w-full items-center">
        <div
          className={`flex gap-2 items-center ${
            showMoreDetails ? 'col-span-2' : 'col-span-4'
          }`}
        >
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
              className={`text-md font-bold flex items-center gap-2 truncate ${
                currentlyPlayingSong?.playlistId === playlist.id
                  ? 'text-blue-500'
                  : 'text-slate-300'
              }`}
            >
              {playlist.title}
              {isPlaying &&
                expanded &&
                showMoreDetails &&
                currentlyPlayingSong?.playlistId === playlist.id && (
                  <MdVolumeUp className="text-blue-500 text-lg" />
                )}
            </div>
            <span className="text-xs truncate">
              {'Playlist' + ' • ' + playlist.creator.name}
            </span>
          </div>
        </div>
        {showMoreDetails && (
          <>
            <div className="text-sm">
              {playlist.isFavoritePlaylist ? '' : timeAdded}
            </div>
            <div className="text-end text-sm">{formattedLastPlayed}</div>
          </>
        )}
      </div>
      {isPlaying &&
        expanded &&
        !showMoreDetails &&
        currentlyPlayingSong?.playlistId === playlist.id && (
          <MdVolumeUp className="text-blue-500 text-lg absolute top-1/2 right-3 -translate-y-1/2" />
        )}
    </NavigationLink>
  );
};
