import { baseUrl, SITE } from "@/lib/site";

/** LLM discovery file (llms.txt convention) — single source of truth from SITE. */
export const dynamic = "force-static";

const body = `# ${SITE.legalName}

> Independent Apple repair studio in Halasuru, Bengaluru. iPhone, iPad, Apple Watch, AirPods, Mac and MacBook repair, including component-level micro-soldering, front-glass restoration with original OLED retained, and board-level storage IC work. Not affiliated with Apple Inc.

- Website: ${baseUrl}
- Phone / WhatsApp: ${SITE.phone}
- Services: ${baseUrl}/services/iphone-repair
- Quote: ${baseUrl}/quote
- Repair status: ${baseUrl}/repair-status
- Contact: ${baseUrl}/contact
- Sitemap: ${baseUrl}/sitemap.xml
- robots: ${baseUrl}/robots.txt

## Key facts
- Location: ${SITE.address}
- Hours: ${SITE.hours}
- Rating: ${SITE.rating} / 5 from ${SITE.ratingCount} verified Google reviews.
- Warranty: ${SITE.warrantyLabel} written warranty on repairs (motherboard work excluded).
- Turnaround: 30–45 minutes typical for display and battery work.
- Privacy: zero-passcode-first process; customer data is never stored by the studio.
`;

export function GET() {
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
