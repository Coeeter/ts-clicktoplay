'use client';

import { useMounted } from '@/hooks/useMounted';
import { useQueueStore } from '@/store/QueueStore';
import { Song } from '@prisma/client';
import { Reorder } from 'framer-motion';
import { QueueItem } from './QueueItem';
import { useEffect, useState } from 'react';
import { sortLinkedList } from '@/utils/linkedList';
import { QueueItemId } from '@/lib/queue';

type QueueListProps = {
  songs: Song[];
};

export const QueueList = ({ songs }: QueueListProps) => {
  const [currentlyDragging, setCurrentlyDragging] = useState<null | string>(
    null
  );
  const [isDragging, setIsDragging] = useState(false);
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

  const onDragStart = (queueItemId: QueueItemId) => {
    return () => {
      setCurrentlyDragging(queueItemId);
      setIsDragging(true);
    };
  };

  const onDragEnd = () => {
    try {
      setIsDragging(false);
      if (!currentlyDragging) return;
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
    } finally {
      setCurrentlyDragging(null);
    }
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
            />
          ) : (
            <span className="text-slate-300">Nothing is playing</span>
          )}
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-2 text-slate-300/50">
            Playing Next:
          </h2>
          <Reorder.Group
            className="flex flex-col gap-2"
            values={nextPlayingItems}
            onReorder={setNextPlayingItems}
          >
            {nextPlayingItems.map((queueItem, index) => {
              const song = songs.find(song => song.id === queueItem.songId);
              if (!song) return null;
              return (
                <Reorder.Item
                  value={queueItem}
                  key={queueItem.id}
                  className="flex"
                  onDragStart={onDragStart(queueItem.id)}
                  onDragEnd={onDragEnd}
                >
                  <QueueItem
                    queueItem={queueItem}
                    isCurrentItem={false}
                    song={song}
                    listOrder={index + 2}
                    isDragging={isDragging}
                  />
                </Reorder.Item>
              );
            })}
            {nextPlayingItems.length === 0 && (
              <span className="text-slate-300">Nothing is playing next</span>
            )}
          </Reorder.Group>
        </div>
      </div>
    </>
  );
};
