import './globals.css';

import {
  Navbar,
  SessionProvider,
  Sidebar,
  SongProvider,
  ToastProvider,
} from '@/components';
import { getServerSession } from '@/lib/auth';
import { prisma } from '@/lib/database';
import { getQueue } from '@/lib/queue';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ClickToPlay',
  icons: {
    icon: './favicon.ico',
  },
  description: 'Listen to music easily, anywhere',
  keywords: ['music', 'streaming', 'listen', 'songs', 'albums', 'artists'],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();
  const playlists = session?.user
    ? await prisma.playlist.findMany({
        where: {
          creatorId: session.user.id,
        },
      })
    : [];
  const queue = session ? await getQueue(session) : null;

  return (
    <html lang="en">
      <body className="bg-slate-900 antialiased text-slate-400 min-h-screen">
        <SessionProvider session={session}>
          <ToastProvider>
            <SongProvider queue={queue}>
              <div className="flex min-h-screen relative">
                <Sidebar playlists={playlists} />
                <div className="flex flex-col w-full">
                  <Navbar />
                  <main>{children}</main>
                </div>
              </div>
            </SongProvider>
          </ToastProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
