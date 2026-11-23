import { SITE, baseUrl } from "@/lib/site";

/**
 * v17 — per-service structured data (BreadcrumbList + Service + Offer).
 *
 * Design rules:
 *  · Pure and SSR-safe: returns plain JSON-LD nodes; the caller renders one
 *    <script type="application/ld+json"> with the result.
 *  · Facts only. The caller passes a published price taken from the single-source
 *    pricing modules; when there is no published price the Offer node is omitted
 *    instead of inventing one ("quoted after inspection" services).
 *  · No aggregateRating, review or FAQPage nodes — those live exactly once in
 *    layout.tsx, so a service page can never duplicate them.
 *  · The provider reuses the root business @id so all schema nodes describe the
 *    same entity (NAP parity) rather than creating a second, conflicting one.
 */

export type ServiceJsonLdNode = Record<string, unknown>;

export function buildServiceJsonLd(
  slug: string,
  name: string,
  description: string,
  startingPriceInr?: number | null
): ServiceJsonLdNode[] {
  const url = `${baseUrl}/services/${slug}`;

  const breadcrumbList: ServiceJsonLdNode = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${url}#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: baseUrl },
      {
        "@type": "ListItem",
        position: 2,
        name: "Repair Services",
        // Real in-page anchor on the home route (services-grid); no invented URL.
        item: `${baseUrl}/#services-grid`,
      },
      { "@type": "ListItem", position: 3, name, item: url },
    ],
  };

  const publishedPrice =
    typeof startingPriceInr === "number" &&
    Number.isFinite(startingPriceInr) &&
    startingPriceInr > 0
      ? Math.round(startingPriceInr)
      : null;

  const service: ServiceJsonLdNode = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${url}#service`,
    name,
    description,
    url,
    provider: {
      "@type": "LocalBusiness",
      "@id": `${baseUrl}/#business`,
      name: SITE.legalName,
      alternateName: SITE.name,
      url: baseUrl,
      telephone: SITE.phone,
    },
    areaServed: { "@type": "City", name: "Bengaluru" },
    ...(publishedPrice !== null
      ? {
          offers: {
            "@type": "Offer",
            "@id": `${url}#offer`,
            priceCurrency: "INR",
            price: publishedPrice,
            url,
            itemOffered: { "@type": "Service", "@id": `${url}#service`, name },
          },
        }
      : {}),
  };

  return [breadcrumbList, service];
}

export default buildServiceJsonLd;
