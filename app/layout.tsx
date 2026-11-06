import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { StoreProvider } from '@/lib/redux/StoreProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Canvas exercise',
  description: 'A small canvas interaction exercise',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body><StoreProvider>{children}</StoreProvider></body>
    </html>
  );
}
