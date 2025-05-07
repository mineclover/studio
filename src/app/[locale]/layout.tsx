import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Toaster } from "@/components/ui/toaster";
import '../globals.css'; // Ensure globals are still applied

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'], // Geist supports Latin, Cyrillic, Greek, Vietnamese
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// Define a base URL for metadata (replace with your actual domain)
const siteBaseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://knight.example.com';

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const { locale } = params;
  
  const commonKeywords = ["Knight's Tour", "Chess", "Puzzle", "Algorithm", "Visualization", "Board Game", "Strategy Game", "Brain Teaser"];
  const devilPlanKeywords = ["The Devil's Plan", "Netflix", "넷플릭스 데블스 플랜"];

  let title, description, keywords, openGraphLocale;

  if (locale === 'ko') {
    title = "나이트 투어 네비게이터 | 체스 퍼즐 시각화 - 데블스 플랜";
    description = "가상 체스판에서 나이트 투어 문제를 탐색하고 시각화하세요. 직접 해결하거나 AI의 움직임을 관찰하세요. 넷플릭스 데블스 플랜과 같은 전략 게임에서 영감을 받았습니다.";
    keywords = [...commonKeywords, ...devilPlanKeywords, "나이트 투어", "체스 퍼즐", "알고리즘 시각화", "보드 게임", "전략 게임", "두뇌 게임"];
    openGraphLocale = 'ko_KR';
  } else { // Default to English
    title = "Knight's Tour Navigator | Chess Puzzle Visualization - The Devil's Plan";
    description = "Explore and visualize the Knight's Tour problem on a virtual chessboard. Solve it yourself or watch the AI. Inspired by strategic games like those in Netflix's The Devil's Plan.";
    keywords = [...commonKeywords, ...devilPlanKeywords];
    openGraphLocale = 'en_US';
  }

  return {
    metadataBase: new URL(siteBaseUrl),
    title: title,
    description: description,
    keywords: keywords,
    authors: [{ name: "Firebase Studio AI" }],
    creator: "Firebase Studio AI",
    publisher: "Firebase Studio AI",
    alternates: {
      canonical: `/${locale}`,
      languages: {
        'en': '/en',
        'ko': '/ko',
      },
    },
    openGraph: {
      title: title,
      description: description,
      url: `/${locale}`,
      siteName: "Knight's Tour Navigator",
      images: [
        {
          url: 'https://picsum.photos/seed/knightstour/1200/630', // Replace with a specific image URL
          width: 1200,
          height: 630,
          alt: "Knight's Tour Game Board",
        },
      ],
      locale: openGraphLocale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: description,
      // images: ['https://picsum.photos/seed/knightstour/1200/630'], // Replace with your Twitter image URL
    },
    icons: {
      // icon: '/favicon.ico', // Example, if you have one
      // apple: '/apple-touch-icon.png',
    },
    manifest: `/${locale}/manifest.json`, // Example for PWA, if you add manifest files per locale
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "hsl(var(--background))" },
    { media: "(prefers-color-scheme: dark)", color: "hsl(var(--background))" },
  ],
  colorScheme: "light dark",
}


export default function LocaleLayout({
  children,
  params: { locale },
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {
  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
