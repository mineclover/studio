import type { Metadata } from 'next';
// Removed Toaster, Geist, Geist_Mono, Viewport imports as they are in root layout
// Removed globals.css import as it's in root layout

// Define a base URL for metadata (replace with your actual domain)
const siteBaseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://knight.example.com';

// Function to generate static paths for locales
export async function generateStaticParams() {
  const locales = ['en', 'ko'];
  return locales.map((locale) => ({
    locale,
  }));
}

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const { locale } = params;
  
  const commonKeywords = ["Knight's Tour", "Chess", "Puzzle", "Algorithm", "Visualization", "Board Game", "Strategy Game", "Brain Teaser"];
  const devilPlanKeywords = ["The Devil's Plan", "Netflix", "넷플릭스 데블스 플랜"];

  let title, description, keywords, openGraphLocale;

  if (locale === 'ko') {
    title = "기사의 여행";
    description = "가상 체스판에서의 기사의 여행. 플레이 가능";
    keywords = [...commonKeywords, ...devilPlanKeywords, "기사의 여행" , "나이트 투어", "체스 퍼즐", "보드 게임", "전략 게임", "두뇌 게임"];
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

// Viewport is now defined in src/app/layout.tsx

export default function LocaleLayout({
  children,
  // params is kept for generateMetadata and generateStaticParams, even if not used in JSX
  params: { locale },
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {
  // Removed <html> and <body> tags. These are now handled by src/app/layout.tsx.
  // Font classes and Toaster are also handled by src/app/layout.tsx.
  return <>{children}</>;
}
