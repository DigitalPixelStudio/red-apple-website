import { SITE, baseUrl } from "@/lib/site";

/**
 * Local entity node for answer engines / AI crawlers (v7 directive).
 *
 * Factual Apple-device repair data only. No affiliation claims and no shortened
 * warranty language anywhere in this node. The canonical warranty for this store
 * is 6 Months (motherboard repair excluded).
 *
 * Kept in its own module so it is a single, reusable source and can be merged
 * into the existing JSON-LD array in layout.tsx without duplicating nodes.
 */

/**
 * 17 Bengaluru zones served — single source, reused by the schema node.
 * Mirrored verbatim in public/llms.txt ("Service area" section); keep both in
 * sync to avoid the answer-engine vs. llms.txt drift flagged by audit BE-1.
 */
export const BENGALURU_ZONES = [
  "Halasuru",
  "Indiranagar",
  "MG Road",
  "Koramangala",
  "Lavelle Road",
  "Richmond Town",
  "Benson Town",
  "Sadashivanagar",
  "HSR Layout",
  "Whitefield",
  "Bellandur",
  "Sarjapur Road",
  "Jayanagar",
  "JP Nagar",
  "Domlur",
  "Hebbal",
  "Bengaluru",
] as const;

export const RED_APPLE_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "MobilePhoneRepair",
  "@id": `${baseUrl}/#mobile-phone-repair`,
  name: "Red Apple Mobile Repair",
  url: baseUrl,
  telephone: SITE.phone,
  address: {
    "@type": "PostalAddress",
    streetAddress:
      "Metro Pillar No 125, No. 38, opp. Bhadra Landmark, Halasuru, MG Road",
    addressLocality: "Bengaluru",
    addressRegion: "Karnataka",
    postalCode: "560008",
    addressCountry: "IN",
  },
  openingHours: "Mo-Su 10:00-23:59",
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: "10:00",
      closes: "23:59",
    },
  ],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    reviewCount: "1103",
    bestRating: "5",
    worstRating: "1",
  },
  areaServed: BENGALURU_ZONES.map((name) => ({ "@type": "Place", name })),
  knowsAbout: [
    "Apple display repair",
    "iPhone display replacement",
    "iPhone OLED screen repair",
    "iPhone front glass restoration",
    "iPhone back glass replacement",
    "iPad display repair",
    "Apple Watch screen repair",
    "MacBook display repair",
    "OEM-grade display fitting",
  ],
  geo: {
    "@type": "GeoCoordinates",
    latitude: SITE.geo.lat,
    longitude: SITE.geo.lng,
  },
  priceRange: "₹₹",
} as const;

export default RED_APPLE_JSON_LD;
