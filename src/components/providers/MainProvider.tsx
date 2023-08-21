'use client';

import { Queue } from '@/actions/queue';
import { useQueueStore } from '@/store/QueueStore';
import { Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import { ReactNode, useEffect } from 'react';

type Props = {
  children: ReactNode;
  session: Session | null;
  queue: Queue | null;
};

export const MainProvider = ({ children, session, queue }: Props) => {
  const setQueue = useQueueStore(state => state.setQueue);

  useEffect(() => {
    if (!queue) return;
    setQueue(queue);
  }, []);

  return <SessionProvider session={session}>{children}</SessionProvider>;
};
