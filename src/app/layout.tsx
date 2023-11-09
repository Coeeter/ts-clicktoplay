import './globals.css';

import type { Metadata } from 'next';

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
  return (
    <html lang="en">
      <body className="bg-slate-900 antialiased text-slate-400 min-h-screen no-scrollbar overflow-hidden">
        {children}
      </body>
    </html>
  );
}
