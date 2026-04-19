import './globals.css';
import { Inter } from 'next/font/google';
import type { ReactNode } from 'react';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'SyncPlay – Listen Together',
  description: 'SyncPlay - YouTube Music clone with real-time sync.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-ytDark text-white h-screen flex flex-col overflow-hidden select-none`}>
        {children}
      </body>
    </html>
  );
}
