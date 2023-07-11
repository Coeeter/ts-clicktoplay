import SessionProvider from '@/components/SessionProvider';
import './globals.css';
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';

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

  return (
    <html lang="en">
      <body>
        <SessionProvider session={session}>{children}</SessionProvider>
      </body>
    </html>
  );
}
