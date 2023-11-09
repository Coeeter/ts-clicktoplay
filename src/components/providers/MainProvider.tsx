'use client';
import { Queue } from '@/actions/queue';
import { useQueueStore } from '@/store/QueueStore';
import { ReactNode, useEffect } from 'react';

type Props = {
  children: ReactNode;
  queue: Queue | null;
};

export const MainProvider = ({ children, queue }: Props) => {
  const setQueue = useQueueStore(state => state.setQueue);

  useEffect(() => {
    if (!queue) return;
    setQueue(queue);
  }, [queue]);

  return <>{children}</>;
};
