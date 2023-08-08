'use client';

import { Queue } from '@/lib/queue';
import { SessionProvider } from 'next-auth/react';
import { SongProvider } from './SongProvider';
import { Session } from 'next-auth';

export const MainProvider = ({
  children,
  session,
  queue,
}: {
  children: React.ReactNode;
  session: Session | null;
  queue?: Queue | null;
}) => {
  return (
    <SessionProvider session={session}>
      {queue ? (
        <SongProvider queue={queue}>{children}</SongProvider>
      ) : (
        <>{children}</>
      )}
    </SessionProvider>
  );
};
