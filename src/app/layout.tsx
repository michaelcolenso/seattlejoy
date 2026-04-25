import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Seattle $1M+ Sales',
  description:
    'Interactive map of King County homes sold for $1M or more in the last 12 months.',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="h-screen overflow-hidden bg-white dark:bg-gray-900 font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
