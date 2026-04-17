import type { Metadata } from 'next';
import { JetBrains_Mono, Newsreader } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  display: 'swap',
});

const newsreader = Newsreader({
  variable: '--font-newsreader',
  subsets: ['latin'],
  display: 'swap',
  style: ['normal', 'italic'],
});

export const metadata: Metadata = {
  title: 'The Agora — Consult The Dead',
  description: 'Run your decisions through cognitive frameworks extracted from history\'s greatest minds. Structured disagreement, not artificial consensus.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jetbrainsMono.variable} ${newsreader.variable}`}>
      <body
        className="h-screen w-screen overflow-hidden"
        style={{ fontFamily: 'var(--font-jetbrains-mono), monospace', background: '#0a0a0f', color: '#e4e4e7' }}
      >
        {children}
        <Analytics />
        <div className="noise-overlay" />
      </body>
    </html>
  );
}
