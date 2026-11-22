import type { Metadata } from "next";
import { baseUrl } from "@/lib/site";

// page.tsx is a Client Component; Next.js only permits `metadata` exports in
// Server Components. A route-level Server layout supplies the per-page title
// and canonical so /contact no longer inherits the homepage's duplicate tags.
export const metadata: Metadata = {
  title: "Contact & Halasuru Map",
  description:
    "Contact Red Apple Mobile Repair in Halasuru, Bengaluru by phone or WhatsApp, or use the map to find our store. Address and opening hours included.",
  alternates: { canonical: `${baseUrl}/contact` },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
