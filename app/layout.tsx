import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ClickToPlay',
  icons: {
    icon: './favicon.ico'
  },
  description: 'Listen to music easily, anywhere',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
