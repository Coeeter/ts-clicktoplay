'use client';

import { useMounted } from '@/hooks/useMounted';
import { useQueueStore } from '@/store/QueueStore';
import { MdVolumeMute, MdVolumeDown, MdVolumeUp } from 'react-icons/md';

export const VolumeTrackbar = () => {
  const mounted = useMounted();
  const volume = useQueueStore(state => state.volume);
  const setVolume = useQueueStore(state => state.setVolume);
  const currentQueueItemId = useQueueStore(state => state.currentlyPlayingId);

  if (!mounted || !currentQueueItemId) return null;

  return (
    <div className="flex items-center justify-between">
      <div
        className="text-slate-300 mr-2"
        onClick={() => {
          if (volume === 0) {
            setVolume(50);
          } else {
            setVolume(0);
          }
        }}
      >
        {volume === 0 ? (
          <MdVolumeMute size={18} />
        ) : volume < 50 ? (
          <MdVolumeDown size={18} />
        ) : (
          <MdVolumeUp size={18} />
        )}
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={volume}
        onChange={e => setVolume(parseInt(e.target.value))}
        className={`appearance-none w-24 h-1 bg-gradient-to-r from-slate-600 to-slate-700 hover:accent-current rounded-lg focus:outline-none`}
        style={{
          background: `linear-gradient(to right, #1D4ED8 ${volume}%, #374047 ${volume}%)`,
        }}
      />
    </div>
  );
};
