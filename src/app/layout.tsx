import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { SITE, baseUrl, SERVICE_PAGES } from "@/lib/site";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const space = Space_Grotesk({ subsets: ["latin"], variable: "--font-space", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Red Apple Mobile Repair Store | iPhone, iPad, MacBook & Apple Watch Repair in Halasuru, Bengaluru",
    template: "%s | Red Apple Mobile Repair Store",
  },
  description: SITE.shortDescription,
  keywords: [
    "iPhone repair Bangalore", "iPhone screen replacement Halasuru", "iPhone back glass repair",
    "iPad repair Bangalore", "MacBook repair Halasuru", "Apple Watch repair Bengaluru",
    "AirPods repair", "iPhone battery replacement", "iPhone data recovery", "Mac repair store",
    "Apple repair specialist Bangalore", "Red Apple Mobile Repair Store",
  ],
  authors: [{ name: SITE.name }],
  openGraph: {
    title: "Red Apple Mobile Repair Store — Apple Repair Specialists, Halasuru Bengaluru",
    description: SITE.shortDescription,
    url: baseUrl,
    siteName: SITE.name,
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Red Apple Mobile Repair Store — Halasuru, Bengaluru",
    description: SITE.shortDescription,
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  alternates: { canonical: baseUrl },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": `${baseUrl}/#business`,
  name: SITE.legalName,
  image: `${baseUrl}/icon.svg`,
  url: baseUrl,
  telephone: SITE.phone,
  email: SITE.email,
  priceRange: "₹₹",
  address: {
    "@type": "PostalAddress",
    streetAddress: "No. 1, Mahatma Gandhi Rd, opp. Bhadra Landmark, Halasuru",
    addressLocality: "Bengaluru",
    addressRegion: "Karnataka",
    postalCode: SITE.pincode,
    addressCountry: SITE.country,
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: SITE.geo.lat,
    longitude: SITE.geo.lng,
  },
  openingHours: SITE.hoursSchema,
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: SITE.rating,
    reviewCount: SITE.ratingCount,
  },
  areaServed: "Bengaluru",
  hasMap: SITE.mapsUrl,
  sameAs: [SITE.gmbUrl],
};

const serviceListSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  itemListElement: SERVICE_PAGES.map((s, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: s.title,
    url: `${baseUrl}/services/${s.slug}`,
  })),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${space.variable} bg-white text-[var(--text)] antialiased`}>
        {children}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceListSchema) }} />
      </body>
    </html>
  );
}
