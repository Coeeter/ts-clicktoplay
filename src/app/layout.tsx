import './globals.css';

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

export const metadata: Metadata = {
  title: 'ClickToPlay',
  icons: {
    icon: '/brand/favicon.ico',
    apple: '/brand/favicon.ico',
  },
  description: 'Listen to music easily, anywhere',
  keywords: ['music', 'streaming', 'listen', 'songs', 'albums', 'artists'],
  colorScheme: 'dark',
  themeColor: '#0f172a',
};

const inter = Inter({
  subsets: ['latin'],
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`bg-slate-900 antialiased text-slate-400 no-scrollbar overflow-hidden ${inter.className}`}
      >
        {children}
      </body>
    </html>
  );
}
