import { baseUrl, SITE } from "@/lib/site";

/** Lightweight LLM discovery file (llms.txt convention). */
export const dynamic = "force-static";

const body = `# ${SITE.legalName}

> Independent Apple repair studio in Halasuru, Bengaluru. iPhone, iPad, Apple Watch, AirPods, Mac and MacBook repair, including component-level micro-soldering, front-glass restoration with original OLED retained, and board-level storage IC work.

- Website: ${baseUrl}
- Services: ${baseUrl}/services/iphone-repair
- Quote: ${baseUrl}/quote
- Repair status: ${baseUrl}/repair-status
- Contact: ${baseUrl}/contact
- Sitemap: ${baseUrl}/sitemap.xml
- robots: ${baseUrl}/robots.txt

## Key facts
- Location: Metro Pillar No 125, No.38, next to Vignesh Dresses, opposite Bhadra Landmark, Halasuru, Bengaluru 560008, India.
- Hours: 10 AM – 12 AM midnight, all 7 days.
- Rating: 4.9 / 5 from 1,103 verified Google reviews.
- Warranty: 6 months written warranty on repairs.
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
