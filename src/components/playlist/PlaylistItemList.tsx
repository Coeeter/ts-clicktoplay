'use client';
import { Playlist, moveSongsInPlaylist } from '@/actions/playlist';
import { useToastStore } from '@/store/ToastStore';
import { Song } from '@prisma/client';
import { Session } from 'next-auth';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { DraggableList } from '../draggable/DraggableList';
import { PlaylistItem } from './PlaylistItem';

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
  const showToast = useToastStore(state => state.createToast);
  const [sticky, setSticky] = useState(false);
  const headerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = document.getElementById('root')!;

    const handleScroll = () => {
      const rect = headerRef.current?.getBoundingClientRect();
      if (!rect) return setSticky(false);
      setSticky(rect?.top <= 76);
    };

    element.addEventListener('scroll', handleScroll);

    return () => element.removeEventListener('scroll', handleScroll);
  }, [headerRef]);

  useEffect(() => {
    setPlaylistItems(songs);
  }, [songs]);

  const onDragEnd = async (currentlyDragging: string) => {
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
  };

  return (
    <>
      <header
        ref={headerRef}
        className={`grid grid-cols-3 px-12 py-3 text-slate-300/50 transition text-sm font-semibold border-b-2 border-slate-300/20 sticky top-16 ${
          sticky ? 'bg-slate-800' : 'bg-transparent'
        }`}
      >
        <div className="flex gap-6">
          <div className="w-8 text-center">#</div>
          <div>Title</div>
        </div>
        <div className="text-start">Date added</div>
        <div className="text-end mr-8">Time</div>
      </header>
      <section className="px-6">
        <DraggableList
          enabled={session !== null}
          size={playlistItems.length}
          getId={index => playlistItems[index].id}
          itemBuilder={(index, isDragging) => (
            <PlaylistItem
              song={playlistItems[index]}
              session={session}
              key={playlistItems[index].id}
              playlist={playlist}
              playlists={createdPlaylists}
              isDragging={isDragging}
              listOrder={index + 1}
              isFavorite={favoriteSongs.some(
                favSong => favSong?.id === playlistItems[index].id
              )}
            />
          )}
          droppableId="playlist"
          onDragEnd={result => {
            if (!result.destination) return;
            const { source, destination } = result;
            if (source.index === destination.index) return;
            const [removed] = playlistItems.splice(source.index, 1);
            playlistItems.splice(destination.index, 0, removed);
            setPlaylistItems([...playlistItems]);
            onDragEnd(result.draggableId);
          }}
          emptyBuilder={() => {
            return (
              <span className="text-slate-300">{'This playlist is empty'}</span>
            );
          }}
        />
      </section>
    </>
  );
};
