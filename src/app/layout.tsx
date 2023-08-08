import './globals.css';

import type { Metadata } from 'next';
import { Sidebar } from '@/components/navigation/sidebar/Sidebar';
import { Navbar } from '@/components/navigation/navbar/Navbar';
import { MainProvider } from '@/components/providers/MainProvider';
import { getServerSession } from '@/lib/auth';
import { getQueue } from '@/lib/queue';
import { Toast } from '@/components/Toast';

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
  const queue = session ? await getQueue(session) : null;

  return (
    <html lang="en">
      <body className="bg-slate-900 antialiased text-slate-400 min-h-screen">
        <MainProvider session={session} queue={queue}>
          <div className="flex min-h-screen relative">
            <Sidebar />
            <div className="flex flex-col w-full">
              <Navbar />
              <main>{children}</main>
            </div>
          </div>
          <Toast />
        </MainProvider>
      </body>
    </html>
  );
}
