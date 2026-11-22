import type { Metadata } from "next";
import { baseUrl } from "@/lib/site";

// page.tsx is a Client Component; Next.js only permits `metadata` exports in
// Server Components. A route-level Server layout supplies the per-page title
// and canonical so /repair-status no longer inherits the homepage's duplicate tags.
export const metadata: Metadata = {
  title: "Repair Status — Track Your Device",
  description:
    "Enter your repair receipt ticket number and registered phone number to see your Apple device repair status at Red Apple Mobile Repair.",
  alternates: { canonical: `${baseUrl}/repair-status` },
};

export default function RepairStatusLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
