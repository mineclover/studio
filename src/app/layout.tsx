import type { ReactNode } from 'react';
import type { Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Toaster } from "@/components/ui/toaster";
import Script from 'next/script';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "hsl(var(--background))" },
    { media: "(prefers-color-scheme: dark)", color: "hsl(var(--background))" },
  ],
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params?: { locale?: string }; // params can be undefined for the root page
}>) {
  // Default to 'en' if locale is not present in params (e.g., for the root language selection page)
  const currentLocale = params?.locale || 'en';

  return (
    <html lang={currentLocale} suppressHydrationWarning>
      <head>
        <meta name="google-adsense-account" content="ca-pub-7620199123041284"/>
      </head>
  
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}>
        {children}
        <Toaster />
        <Script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7620199123041284" crossorigin="anonymous" strategy="lazyOnload"/>
      </body>
    </html>
  );
}
