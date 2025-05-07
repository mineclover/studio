import type { ReactNode } from 'react';
import './globals.css'; // Keep globals.css import here for base styles

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // This root layout is minimal.
  // The main HTML structure (<html>, <body>, fonts, metadata)
  // will be handled by src/app/[locale]/layout.tsx for localized routes.
  // However, a basic <html> and <body> structure is still required here.
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
