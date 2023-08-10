import './globals.css';

import type { Metadata } from 'next';
import { Sidebar } from '@/components/navigation/sidebar/Sidebar';
import { Navbar } from '@/components/navigation/navbar/Navbar';
import { getServerSession } from '@/lib/auth';
import { getQueue } from '@/lib/queue';
import { Toast } from '@/components/Toast';
import { MainProvider } from '@/components/providers/MainProvider';
import { SongControlPanel } from '@/components/songs/controlPanel/SongControlPanel';

export const metadata: Metadata = {
  title: 'ClickToPlay',
  icons: {
    icon: './favicon.ico',
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
      <body className="bg-slate-900 antialiased text-slate-400 min-h-screen">
        <MainProvider session={session} queue={queue}>
          <div className="flex flex-col min-h-screen">
            <div className="flex relative flex-1 p-3 gap-3">
              <Sidebar />
              <div className="flex flex-col w-full gap-3">
                <Navbar />
                <main>{children}</main>
              </div>
              <Toast />
            </div>
            <SongControlPanel />
          </div>
        </MainProvider>
      </body>
    </html>
  );
}
