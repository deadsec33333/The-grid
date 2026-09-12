import type { Metadata } from 'next';
import { Nav } from '@/components/Nav';
import './globals.css';

export const metadata: Metadata = {
  title: 'The Grid',
  description: 'An on-chain motor racing career. 1,200 cars, six constructors, 349 seats.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full">
        <Nav />
        <main>{children}</main>
      </body>
    </html>
  );
}
