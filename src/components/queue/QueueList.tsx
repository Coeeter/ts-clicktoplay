'use client';

import { useMounted } from '@/hooks/useMounted';
import { useQueueStore } from '@/store/QueueStore';
import { sortLinkedList } from '@/utils/linkedList';
import { Song } from '@prisma/client';
import { AnimatePresence, motion } from 'framer-motion';
import { QueueItem } from './QueueItem';

type QueueListProps = {
  songs: Song[];
};

export const QueueList = ({ songs }: QueueListProps) => {
  const isMounted = useMounted();
  const items = useQueueStore(state =>
    sortLinkedList(state.items, null, state.shuffle)
  );
  const currentlyPlayingId = useQueueStore(state => state.currentlyPlayingId);

  const currentlyPlayingQueueItem = items.find(
    item => item.id === currentlyPlayingId
  );
  const currentlyPlayingSong = songs.find(
    song => song.id === currentlyPlayingQueueItem?.songId
  );
  const nextPlayingItems = items.splice(
    items.findIndex(item => item.id === currentlyPlayingId) + 1
  );

  if (!isMounted) return null;

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
            />
          ) : (
            <span className="text-slate-300">Nothing is playing</span>
          )}
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-2 text-slate-300/50">
            Playing Next:
          </h2>
          <AnimatePresence>
            <ul className="flex flex-col gap-2">
              {nextPlayingItems.map((queueItem, index) => {
                const song = songs.find(song => song.id === queueItem.songId);
                if (!song) return null;
                return (
                  <motion.li key={queueItem.id} layout className="flex">
                    <QueueItem
                      queueItem={queueItem}
                      isCurrentItem={false}
                      song={song}
                      listOrder={index + 2}
                    />
                  </motion.li>
                );
              })}
              {nextPlayingItems.length === 0 && (
                <span className="text-slate-300">Nothing is playing next</span>
              )}
            </ul>
          </AnimatePresence>
        </div>
      </div>
    </>
  );
};
