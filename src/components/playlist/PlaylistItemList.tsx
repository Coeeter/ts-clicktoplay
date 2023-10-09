'use client';

import { Song } from '@prisma/client';
import { PlaylistItem } from './PlaylistItem';
import { Playlist, moveSongsInPlaylist } from '@/actions/playlist';
import { Reorder } from 'framer-motion';
import { useState } from 'react';
import { useToastStore } from '@/store/ToastStore';
import { usePathname } from 'next/navigation';
import { Session } from 'next-auth';

type PlaylistItemListProps = {
  songs: Song[];
  playlist: Playlist;
  createdPlaylists: Playlist[];
  favoriteSongs: (Song | undefined)[];
  session: Session | null;
};

export const PlaylistItemList = ({
  songs,
  playlist,
  createdPlaylists,
  favoriteSongs,
  session,
}: PlaylistItemListProps) => {
  const pathname = usePathname();
  const [playlistItems, setPlaylistItems] = useState(songs);
  const [currentlyDragging, setCurrentlyDragging] = useState<string | null>(
    null
  );
  const [isDragging, setIsDragging] = useState(false);
  const showToast = useToastStore(state => state.createToast);

  const onDragStart = (songId: string) => {
    return () => {
      setCurrentlyDragging(songId);
      setIsDragging(true);
    };
  };

  const onDragEnd = async () => {
    try {
      setIsDragging(false);
      if (!currentlyDragging) return;
      const index = playlistItems.findIndex(
        item => item.id === currentlyDragging
      );
      const nextId =
        index === playlistItems.length - 1 ? null : playlistItems[index + 1].id;
      const prevId = index === 0 ? null : playlistItems[index - 1].id;
      const [error] = await moveSongsInPlaylist({
        playlistId: playlist.id,
        songIds: [currentlyDragging],
        nextId: playlist.items.find(item => item.songId === nextId)?.id ?? null,
        prevId: playlist.items.find(item => item.songId === prevId)?.id ?? null,
        path: pathname,
      });
      if (error) showToast(error, 'error');
    } finally {
      setCurrentlyDragging(null);
    }
  };

  if (!session) {
    return (
      <div className="flex flex-col gap-2">
        {playlistItems.map((song, index) => {
          return (
            <PlaylistItem
              song={song}
              session={session}
              key={song.id}
              playlist={playlist}
              playlists={createdPlaylists}
              isDragging={isDragging}
              listOrder={index + 1}
              isFavorite={favoriteSongs.some(
                favSong => favSong?.id === song.id
              )}
            />
          );
        })}
      </div>
    );
  }

  return (
    <Reorder.Group
      className="flex flex-col gap-2"
      values={playlistItems}
      onReorder={setPlaylistItems}
    >
      {playlistItems.map((song, index) => {
        return (
          <Reorder.Item
            value={song}
            key={song.id}
            className="flex"
            onDragStart={session ? onDragStart(song.id) : undefined}
            onDragEnd={session ? onDragEnd : undefined}
            whileDrag={{ scale: 1.05 }}
          >
            <PlaylistItem
              song={song}
              key={song.id}
              session={session}
              playlist={playlist}
              playlists={createdPlaylists}
              isDragging={isDragging}
              listOrder={index + 1}
              isFavorite={favoriteSongs.some(
                favSong => favSong?.id === song.id
              )}
            />
          </Reorder.Item>
        );
      })}
    </Reorder.Group>
  );
};
