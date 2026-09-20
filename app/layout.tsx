import type { Metadata } from 'next';
import './globals.css';
import { Inter } from 'next/font/google';
import Providers from '@/components/providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font',
});

export const metadata: Metadata = {
  title: 'Japanese Portal',
  description: 'Midnight & Amber Japanese portal',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.variable}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
