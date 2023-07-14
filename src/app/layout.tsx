import './globals.css';

import { Navbar, Sidebar } from '@/components';
import { SessionProvider, ToastProvider } from '@/components/providers';
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
  const loggedInUser = (await getServerSession())?.user;
  const playlists = loggedInUser
    ? await prisma.playlist.findMany({
        where: {
          creatorId: loggedInUser?.id,
        },
      })
    : [];

  return (
    <html lang="en">
      <body className="bg-slate-900 antialiased text-slate-400 min-h-screen">
        <SessionProvider>
          <ToastProvider>
            <div className="flex h-screen">
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
