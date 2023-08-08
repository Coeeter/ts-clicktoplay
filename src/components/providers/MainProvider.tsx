'use client';

import { Queue } from '@/lib/queue';
import { useQueueStore } from '@/store/QueueStore';
import { Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import React from 'react';

type Props = {
  children: React.ReactNode;
  session: Session | null;
  queue: Queue | null;
};

export const MainProvider = ({ children, session, queue }: Props) => {
  const setQueue = useQueueStore(state => state.setQueue);

  if (queue) {
    setQueue(queue);
  }

  return <SessionProvider session={session}>{children}</SessionProvider>;
};
