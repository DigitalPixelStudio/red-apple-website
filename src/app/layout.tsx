import "./globals.css";
import { Inter } from "next/font/google";
import { Poppins } from "next/font/google";
import GoogleAdsTag from "@/components/GoogleAdsTag";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", weight: ["200","300","400","500","600"] });
const poppins = Poppins({ subsets: ["latin"], variable: "--font-poppins", weight: ["300","400","500","600","700"] });

export const metadata = {
  title: { default: "Red Apple Mobile Repair | Bengaluru — iPhone, iPad, Mac, Apple Watch & AirPods", template: "%s | Red Apple Mobile Repair" },
  description: "Certified Apple repair specialists in Bengaluru since 2014. 700+ five-star reviews. Same-day iPhone, iPad, Mac mini, Apple Watch & AirPods repair. Original-grade parts. 12-month warranty.",
  keywords: ["iPhone repair Bengaluru", "iPad repair Bangalore", "Apple Watch repair", "AirPods repair", "Mac mini repair", "Apple repair Bangalore", "iPhone screen replacement", "back glass repair"],
  authors: [{ name: "Red Apple Mobile Repair" }],
  creator: "Red Apple Mobile Repair",
  publisher: "Red Apple Mobile Repair",
  openGraph: {
    title: "Red Apple Mobile Repair | Bengaluru",
    description: "Certified Apple repair specialists. 700+ five-star reviews. Same-day service.",
    type: "website",
    url: "https://redappplemobilerepair.vercel.app",
    siteName: "Red Apple Mobile Repair",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Red Apple Mobile Repair | Bengaluru",
    description: "Certified Apple repair specialists. 700+ five-star reviews.",
  },
  alternates: { canonical: "https://redappplemobilerepair.vercel.app" },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`} suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Red Apple" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-black text-white antialiased">
        <GoogleAdsTag />
        {children}
      </body>
    </html>
  );
}
