import { useContextMenuStore } from '@/store/ContextMenuStore';
import { useQueueStore } from '@/store/QueueStore';
import { QueueItem as QueueItemType, Song } from '@prisma/client';
import { HiPause, HiPlay } from 'react-icons/hi2';

type QueuItemProps = {
  queueItem: QueueItemType;
  song: Song;
  isCurrentItem: boolean;
  listOrder: number;
  isDragging: boolean;
};

export const QueueItem = ({
  queueItem,
  isCurrentItem,
  song,
  listOrder,
  isDragging,
}: QueuItemProps) => {
  const isPlaying = useQueueStore(state => state.isPlaying && isCurrentItem);
  const setIsPlaying = useQueueStore(state => state.setIsPlaying);
  const removeFromQueue = useQueueStore(state => state.removeSongFromQueue);
  const setCurrentlyPlayingId = useQueueStore(
    state => state.setCurrentlyPlayingId
  );

  const showContextMenu = useContextMenuStore(state => state.openContextMenu);

  return (
    <button
      key={queueItem.id}
      className={`w-full cursor-pointer flex items-center justify-between py-2 px-6 rounded-md transition-colors bg-slate-900 hover:bg-slate-700 group `}
      onClick={() => {
        if (isDragging) return;
        if (isCurrentItem) return setIsPlaying(!isPlaying);
        setCurrentlyPlayingId(queueItem.id);
        setIsPlaying(true);
      }}
      onContextMenu={e => {
        e.preventDefault();
        e.stopPropagation();
        showContextMenu(e.pageX, e.pageY, [
          {
            label: 'Play',
            onClick: () => {
              setCurrentlyPlayingId(queueItem.id);
              setIsPlaying(true);
            },
          },
          {
            label: 'Remove from Queue',
            onClick: () => removeFromQueue(queueItem.id),
          },
          {
            label: 'Play Next',
            onClick: () => {},
          },
          {
            label: 'Play Last',
            onClick: () => {},
          },
          {
            label: 'Add to Playlist',
            onClick: () => {},
          },
          {
            label: 'Add to Favorites',
            onClick: () => {},
          },
        ]);
      }}
    >
      <div className="flex items-center gap-6">
        <div className="w-8 flex justify-center items-center">
          {isPlaying ? (
            <>
              <span className="text-lg font-bold text-blue-500 hidden group-hover:inline">
                <HiPause />
              </span>
              <img
                src="/playing.gif"
                alt="playing"
                className="w-full h-full rounded-md group-hover:hidden bg-blue-500 p-1"
              />
            </>
          ) : (
            <>
              <span
                className={`text-lg font-bold group-hover:hidden ${
                  isCurrentItem ? 'text-blue-500' : 'text-slate-300/50'
                }`}
              >
                {listOrder}
              </span>
              <span
                className={`text-lg font-bold group-hover:inline hidden transition-all ${
                  isCurrentItem ? 'text-blue-500' : 'text-slate-300'
                }`}
              >
                <HiPlay />
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="w-12 h-12 bg-slate-600 rounded-md">
            <img
              src={song.albumCover ?? '/album-cover.png'}
              alt="album cover"
              className="w-full h-full rounded-md"
            />
          </div>
          <div className="flex flex-col items-start">
            <span
              className={`text-md font-bold ${
                isCurrentItem ? 'text-blue-500' : 'text-slate-300'
              }`}
            >
              {song.title}
            </span>
            <span className="text-sm text-slate-300/50">
              {song.artist?.length ? song.artist : 'Unknown'}
            </span>
          </div>
        </div>
      </div>
      <span className="text-slate-300">
        {new Date(song.duration * 1000).toISOString().substring(14, 19)}
      </span>
    </button>
  );
};
