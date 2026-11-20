import type { Metadata, Viewport } from "next";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { SITE, SOCIAL_LINKS, baseUrl, SERVICE_PAGES, FAQS } from "@/lib/site";
import Script from "next/script";

/* GA4 — dormant until NEXT_PUBLIC_GA_ID is set in Vercel.
   No env var -> nothing is rendered, zero bytes shipped. */
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
/* Plus Jakarta Sans gives headings a premium, modern 2026 voice while the
   `--font-space` variable name keeps every existing heading style intact. */
const space = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-space",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/favicon.ico"],
  },
  title: {
    default: "Red Apple Mobile Repair Store | iPhone, iPad, MacBook & Apple Watch Repair in Halasuru, Bengaluru",
    template: "%s | Red Apple Mobile Repair Store",
  },
  description: SITE.shortDescription,
  keywords: [
    "iPhone repair Bangalore", "iPhone screen replacement Halasuru", "iPhone back glass repair",
    "iPad repair Bangalore", "MacBook repair Halasuru", "Apple Watch repair Bengaluru",
    "AirPods repair", "iPhone battery replacement", "board-level storage IC repair", "Mac repair store",
    "Apple repair specialist Bangalore", "Red Apple Mobile Repair Store",
  ],
  authors: [{ name: SITE.name }],
  creator: SITE.name,
  publisher: SITE.name,
  applicationName: SITE.name,
  category: "Electronics Repair",
  /* Legacy but still read by some local-search crawlers. */
  other: {
    "geo.region": "IN-KA",
    "geo.placename": "Halasuru, Bengaluru",
    "geo.position": `${SITE.geo.lat};${SITE.geo.lng}`,
    ICBM: `${SITE.geo.lat}, ${SITE.geo.lng}`,
  },
  openGraph: {
    title: "Red Apple Mobile Repair Store — Apple Repair Specialists, Halasuru Bengaluru",
    description: SITE.shortDescription,
    url: baseUrl,
    siteName: SITE.name,
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: `${baseUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Red Apple Mobile Repair Store — Halasuru, Bengaluru",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Red Apple Mobile Repair Store — Halasuru, Bengaluru",
    description: SITE.shortDescription,
    images: [`${baseUrl}/og-image.png`],
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

/* FAQPage describes the visible FAQ content. Google currently limits FAQ rich results
   primarily to authoritative government and health sites; no display is promised. */
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.slice(0, 12).map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

/* Service schema — one entry per repair we publish, so each shows as a service. */
const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "Apple device repair",
  provider: { "@type": "LocalBusiness", name: SITE.legalName, url: baseUrl },
  areaServed: { "@type": "City", name: "Bengaluru" },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Repair services",
    itemListElement: SERVICE_PAGES.map((s) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Service", name: s.title },
      url: `${baseUrl}/services/${s.slug}`,
    })),
  },
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "Store", "Organization", "MobilePhoneRepair"],
  "@id": `${baseUrl}/#business`,
  name: SITE.legalName,
  alternateName: SITE.shortName,
  // Google reads `logo` from the Organization/Company entity to build the
  // logo it can show beside a search result. Absolute URL, >=112px square.
  logo: {
    "@type": "ImageObject",
    url: `${baseUrl}/icon-512.png`,
    width: 512,
    height: 512,
    caption: SITE.legalName,
  },
  image: [`${baseUrl}/logo.png`, `${baseUrl}/og-image.png`],
  url: baseUrl,
  telephone: SITE.phone,
  email: SITE.email,
  priceRange: "₹₹",
  address: {
    "@type": "PostalAddress",
    streetAddress: SITE.address,
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
  areaServed: [
    { "@type": "City", name: "Bengaluru" },
    { "@type": "Place", name: "Halasuru" },
    { "@type": "Place", name: "Indiranagar" },
    { "@type": "Place", name: "MG Road" },
  ],
  hasMap: SITE.mapsUrl,
  sameAs: SOCIAL_LINKS.map((s) => s.href).filter(Boolean),
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: SITE.rating,
    reviewCount: SITE.ratingCount.replace(",", ""),
    bestRating: "5",
    worstRating: "1",
  },
  currenciesAccepted: "INR",
  paymentAccepted: "Cash, UPI, Credit Card, Debit Card",
  knowsAbout: [
    "iPhone screen replacement",
    "iPhone battery replacement",
    "iPhone back glass repair",
    "iPad repair",
    "MacBook logic board repair",
    "Apple Watch repair",
    "AirPods repair",
    "Front glass restoration",
    "Board-level storage IC repair",
    "Signed firmware restore",
    "Owner-verified factory restore assistance",
  ],
};

/* Organization is a separate entity so Google can attach the brand logo,
   contact point and social profiles to the business in search results. */
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${baseUrl}/#organization`,
  name: SITE.legalName,
  alternateName: SITE.shortName,
  url: baseUrl,
  logo: {
    "@type": "ImageObject",
    url: `${baseUrl}/icon-512.png`,
    width: 512,
    height: 512,
  },
  image: `${baseUrl}/og-image.png`,
  description: SITE.shortDescription,
  email: SITE.email,
  telephone: SITE.phone,
  address: {
    "@type": "PostalAddress",
    streetAddress: SITE.address,
    addressLocality: "Bengaluru",
    addressRegion: "Karnataka",
    postalCode: SITE.pincode,
    addressCountry: SITE.country,
  },
  contactPoint: {
    "@type": "ContactPoint",
    telephone: SITE.phone,
    contactType: "customer service",
    areaServed: "IN",
    availableLanguage: ["en", "hi", "kn"],
  },
  sameAs: SOCIAL_LINKS.map((s) => s.href).filter(Boolean),
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
        {/* Apply a saved "motion off" choice before the page paints. */}
        <script
          dangerouslySetInnerHTML={{
            __html: "try{if(localStorage.getItem('ramr-motion')==='off'){document.documentElement.setAttribute('data-motion','off');}}catch(e){}",
          }}
        />
        {/* 3D light layer — three spotlights on a perspective plane plus one
            travelling hairline. Every one of them animates transform only, and
            the whole layer is contain:strict, so it can never trigger layout or
            invalidate the content above it. Decorative: hidden from AT. */}
        <div className="light-3d" aria-hidden="true">
          <i className="l1" />
          <i className="l2" />
          <i className="l3" />
        </div>
        <div className="light-beam" aria-hidden="true" />
        {children}
        <PWAInstallPrompt />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([localBusinessSchema, organizationSchema, faqSchema, serviceSchema]) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceListSchema) }} />
        {GA_ID ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}',{send_page_view:true});`}
            </Script>
          </>
        ) : null}
      </body>
    </html>
  );
}
