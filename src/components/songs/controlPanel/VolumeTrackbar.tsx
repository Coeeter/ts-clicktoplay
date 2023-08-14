'use client';

import { useMounted } from '@/hooks/useMounted';
import { useQueueStore } from '@/store/QueueStore';
import { useEffect, useRef } from 'react';
import { MdVolumeMute, MdVolumeDown, MdVolumeUp } from 'react-icons/md';
import { HiQueueList } from 'react-icons/hi2';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export const VolumeTrackbar = () => {
  const mounted = useMounted();
  const pathname = usePathname();
  const volume = useQueueStore(state => state.volume);
  const setVolume = useQueueStore(state => state.setVolume);
  const currentQueueItemId = useQueueStore(state => state.currentlyPlayingId);

  const volumeRef = useRef(volume);

  useEffect(() => {
    if (volumeRef.current === volume) return;
    volumeRef.current = volume;
  }, [volume]);

  useEffect(() => {
    const onKeyEvent = (event: KeyboardEvent) => {
      if (event.key === 'm') {
        return setVolume(volumeRef.current === 0 ? 50 : 0);
      }
      if (event.key === 'ArrowUp') {
        return setVolume(Math.min(volumeRef.current + 5, 100));
      }
      if (event.key === 'ArrowDown') {
        return setVolume(Math.max(volumeRef.current - 5, 0));
      }
    };
    window.addEventListener('keydown', onKeyEvent);
    return () => window.removeEventListener('keydown', onKeyEvent);
  }, []);

  if (!mounted || !currentQueueItemId) return <div className="flex-1" />;

  return (
    <div className="flex items-center justify-end flex-1 gap-3">
      <Link
        href={
          pathname !== '/queue'
            ? '/queue'
            : localStorage.getItem('queuePath') || '/'
        }
        className={`text-xl transition-colors disabled:text-slate-300/30 relative ${
          pathname !== '/queue'
            ? 'text-slate-300/70 hover:text-slate-100'
            : 'text-blue-500'
        }`}
        onClick={() => {
          localStorage.setItem('queuePath', pathname);
        }}
      >
        <HiQueueList />
        {pathname === '/queue' && (
          <div className="w-1 h-1 bg-blue-500 rounded-full absolute -bottom-2 left-1/2 -translate-x-1/2" />
        )}
      </Link>
      <div
        className="text-xl text-slate-300/70 hover:text-slate-100 -mr-1 cursor-pointer"
        onClick={() => {
          if (volume === 0) {
            setVolume(50);
          } else {
            setVolume(0);
          }
        }}
      >
        {volume === 0 ? (
          <MdVolumeMute />
        ) : volume < 50 ? (
          <MdVolumeDown />
        ) : (
          <MdVolumeUp />
        )}
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={volume}
        onChange={e => setVolume(parseInt(e.target.value))}
        className={`cursor-pointer appearance-none w-24 h-1 bg-gradient-to-r from-slate-600 to-slate-700 hover:accent-current rounded-lg focus:outline-none`}
        style={{
          background: `linear-gradient(to right, #1D4ED8 ${volume}%, #374047 ${volume}%)`,
        }}
      />
    </div>
  );
};
