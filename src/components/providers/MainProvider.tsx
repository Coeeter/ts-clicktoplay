'use client';

import { Queue } from '@/actions/queue';
import { AuthSession } from '@/lib/auth';
import { useQueueStore } from '@/store/QueueStore';
import { SessionProvider } from 'next-auth/react';
import { ReactNode, useEffect } from 'react';

type Props = {
  session: AuthSession | null;
  children: ReactNode;
  queue: Queue | null;
};

export const MainProvider = ({ children, queue, session }: Props) => {
  const setQueue = useQueueStore(state => state.setQueue);

  useEffect(() => {
    if (!queue) return;
    setQueue(queue);
  }, [queue]);

  return <SessionProvider session={session}>{children}</SessionProvider>;
};
