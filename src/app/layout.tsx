import './globals.css';

import type { Metadata } from 'next';
import { Sidebar } from '@/components/navigation/sidebar/Sidebar';
import { Navbar } from '@/components/navigation/navbar/Navbar';
import { getServerSession } from '@/lib/auth';
import { getQueue } from '@/actions/queue';
import { Toast } from '@/components/Toast';
import { MainProvider } from '@/components/providers/MainProvider';
import { SongControlPanel } from '@/components/songs/controlPanel/SongControlPanel';
import { ContextMenu } from '@/components/menu/ContextMenu';
import { EditPlaylistModal } from '@/components/modals/PlaylistModal/EditPlaylistModal';
import { DeletePlaylistModal } from '@/components/modals/PlaylistModal/DeletePlaylistModal';
import { Tooltip } from '@/components/tooltip/ToolTip';

export const metadata: Metadata = {
  title: 'ClickToPlay',
  icons: {
    icon: '/brand/favicon.ico',
    apple: '/brand/favicon.ico',
  },
  description: 'Listen to music easily, anywhere',
  keywords: ['music', 'streaming', 'listen', 'songs', 'albums', 'artists'],
  colorScheme: 'dark',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();
  const queue = session ? await getQueue(session) : null;

  return (
    <html lang="en">
      <body className="bg-slate-900 antialiased text-slate-400 min-h-screen no-scrollbar overflow-hidden">
        <MainProvider session={session} queue={queue}>
          <div className="min-h-screen flex flex-col">
            <div className="flex relative p-3 pb-0 gap-3 flex-1">
              <Sidebar />
              <div
                id="root"
                className="flex flex-col w-full bg-slate-800 min-h-[calc(100vh-6.25rem)] max-h-[calc(100vh-6.25rem)] rounded-md pb-3 no-scrollbar overflow-y-scroll relative"
              >
                <Navbar />
                <main className="h-full">{children}</main>
              </div>
            </div>
            <ContextMenu />
            <Toast />
            <SongControlPanel />
          </div>
          <EditPlaylistModal />
          <DeletePlaylistModal />
          <Tooltip />
        </MainProvider>
      </body>
    </html>
  );
}
