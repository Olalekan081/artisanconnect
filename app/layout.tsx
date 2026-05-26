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
{/* PWA Support */}
<link rel="manifest" href="/manifest.json" />
<meta name="theme-color" content="#14B8A6" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
</head>
<body className={`${inter.className} ${geist.variable}`}>
{children}
</body>
</html>
);
}