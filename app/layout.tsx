import type { Metadata } from 'next';
import { Inter, Geist } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });
const geist = Geist({ subsets: ['latin'], variable: '--font-geist' });

export const metadata: Metadata = {
  title: 'ArtisanConnect - Hire Trusted Artisans',
  description: 'Connect with verified local artisans in Osun State, Nigeria',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* IMPORTANT: Viewport meta for mobile responsiveness */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />

        {/* PWA Support */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#14B8A6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />

        {/* ===== GOOGLE ANALYTICS 4 ===== */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-N3G8FBCENM" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-N3G8FBCENM');
            `,
          }}
        />
        {/* ===== END GOOGLE ANALYTICS ===== */}
      </head>
      <body className={`${inter.className} ${geist.variable}`}>
        {children}
      </body>
    </html>
  );
}