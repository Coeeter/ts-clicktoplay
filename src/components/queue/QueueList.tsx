'use client';
import { Playlist } from '@/actions/playlist';
import { useMounted } from '@/hooks/useMounted';
import { useQueueStore } from '@/store/QueueStore';
import { sortLinkedList } from '@/utils/linkedList';
import { Song } from '@prisma/client';
import { Session } from 'next-auth';
import { useEffect, useState } from 'react';
import { DraggableList } from '../draggable/DraggableList';
import { QueueItem } from './QueueItem';

type QueueListProps = {
  songs: Song[];
  favoriteSongs: (Song | undefined)[];
  playlists: Playlist[];
  session: Session | null;
};

export const QueueList = ({
  songs,
  favoriteSongs,
  playlists,
  session,
}: QueueListProps) => {
  const isMounted = useMounted();
  const items = useQueueStore(state => state.items);
  const currentlyPlayingId = useQueueStore(state => state.currentlyPlayingId);
  const reorderItems = useQueueStore(state => state.reorderItems);
  const shuffle = useQueueStore(state => state.shuffle);

  const currentlyPlayingQueueItem = items.find(
    item => item.id === currentlyPlayingId
  );
  const currentlyPlayingSong = songs.find(
    song => song.id === currentlyPlayingQueueItem?.songId
  );

  const [nextPlayingItems, setNextPlayingItems] = useState(items);

  useEffect(() => {
    const sortedItems = sortLinkedList(items, null, shuffle);
    const currentlyPlayingIndex = sortedItems.findIndex(
      item => item.id === currentlyPlayingId
    );
    setNextPlayingItems(sortedItems.splice(currentlyPlayingIndex + 1));
  }, [items, currentlyPlayingId, shuffle]);

  if (!isMounted) return null;

  const onDragEnd = (currentlyDragging: string) => {
    if (nextPlayingItems.length <= 1) return;
    const currentlyDraggingItem = items.find(
      item => item.id === currentlyDragging
    );
    if (!currentlyDraggingItem) return;
    const index = nextPlayingItems.findIndex(
      item => item.id === currentlyDragging
    );
    const prevId =
      index === 0
        ? currentlyPlayingQueueItem?.id ?? null
        : nextPlayingItems[index - 1].id;
    const nextId =
      index === nextPlayingItems.length - 1
        ? null
        : nextPlayingItems[index + 1].id;
    const indexOfCurrentlyPlayingItem = items.findIndex(
      item => item.id === currentlyPlayingId
    );
    reorderItems([currentlyDraggingItem], prevId, nextId, [
      ...items.splice(0, indexOfCurrentlyPlayingItem + 1),
      ...nextPlayingItems,
    ]);
  };

  return (
    <>
      <h1 className="text-2xl font-bold text-slate-200 mb-6">Queue</h1>
      <div className="flex flex-col gap-8">
        <div>
          <h2 className="text-lg font-semibold mb-2 text-slate-300/50">
            Currently Playing
          </h2>
          {currentlyPlayingQueueItem && currentlyPlayingSong ? (
            <QueueItem
              queueItem={currentlyPlayingQueueItem}
              isCurrentItem={true}
              song={currentlyPlayingSong}
              listOrder={1}
              isDragging={false}
              playlists={playlists}
              session={session}
              isFavorite={favoriteSongs.some(
                favSong => favSong?.id === currentlyPlayingSong.id
              )}
            />
          ) : (
            <span className="text-slate-300">Nothing is playing</span>
          )}
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-2 text-slate-300/50">
            Playing Next:
          </h2>
          <DraggableList
            droppableId="queueList"
            getId={index => nextPlayingItems[index].id}
            size={nextPlayingItems.length}
            itemBuilder={(index, isDragging) => {
              const queueItem = nextPlayingItems[index];
              const song = songs.find(song => song.id === queueItem.songId);
              if (!song) return <></>;
              return (
                <QueueItem
                  queueItem={queueItem}
                  isCurrentItem={false}
                  song={song}
                  isDragging={isDragging}
                  listOrder={index + 2}
                  session={session}
                  isFavorite={favoriteSongs.some(
                    favSong => favSong?.id === song.id
                  )}
                  playlists={playlists}
                />
              );
            }}
            onDragEnd={result => {
              if (!result.destination) return;
              const { source, destination } = result;
              if (source.index === destination.index) return;
              const [removed] = nextPlayingItems.splice(source.index, 1);
              nextPlayingItems.splice(destination.index, 0, removed);
              setNextPlayingItems([...nextPlayingItems]);
              onDragEnd(result.draggableId);
            }}
            emptyBuilder={() => (
              <span className="text-slate-300">Nothing is playing next</span>
            )}
          />
        </div>
      </div>
    </>
  );
};
