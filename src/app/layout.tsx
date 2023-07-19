import './globals.css';

import { Navbar, SessionProvider, Sidebar, ToastProvider } from '@/components';
import { getServerSession } from '@/lib/auth';
import { prisma } from '@/lib/database';

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

  return (
    <html lang="en">
      <body className="bg-slate-900 antialiased text-slate-400 min-h-screen">
        <SessionProvider session={session}>
          <ToastProvider>
            <div className="flex min-h-screen relative">
              <Sidebar playlists={playlists} />
              <div className="flex flex-col w-full">
                <Navbar />
                <main>{children}</main>
              </div>
            </div>
          </ToastProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
