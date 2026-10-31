import type { Metadata } from "next";
import { SITE, baseUrl } from "@/lib/site";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Refund & Warranty Policy | Red Apple Mobile Repair Store",
  description: "Our 90-day service warranty, 6 months of battery and display health cover, and refund terms.",
  alternates: { canonical: `${baseUrl}/refund-policy` },
};

const UPDATED = "30 October 2026";

export default function RefundPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 pb-24 pt-32">
        <h1 className="mb-2 font-apple text-4xl font-extrabold tracking-tight text-[var(--text)]">Refund &amp; Warranty Policy</h1>
        <p className="mb-10 text-sm text-[var(--text-muted)]">Last updated: {UPDATED}</p>

        <div className="legal">
          <h2>90-day service warranty</h2>
          <p>
            Every repair we carry out is covered for 90 days from the date you collect the
            device. If the same fault returns within that window, we repair it again at no
            charge.
          </p>

          <h2>6 months of health cover</h2>
          <p>
            Battery replacements and display replacements additionally carry a 6-month
            health cover. If battery health drops below 80% or the display develops a
            defect that is not impact damage, we replace it once free of charge.
          </p>

          <h2>What the warranty does not cover</h2>
          <ul>
            <li>New damage — drops, cracks, liquid contact, or bending.</li>
            <li>Repairs carried out by anyone else after our work.</li>
            <li>Faults in parts of the device we did not touch.</li>
            <li>Software problems caused by apps or iOS updates.</li>
          </ul>

          <h2>Refunds before work begins</h2>
          <p>
            Work starts after payment and part procurement. If you cancel before the part
            is fitted, you receive a full refund. If the part has already been ordered and
            cannot be returned to the supplier, a restocking cost may apply — this is
            always told to you before you pay.
          </p>

          <h2>Refunds after work is done</h2>
          <p>
            Once a repair is completed and the device is working, the service is not
            refundable. If the repair did not solve the problem, we will keep working on it
            under the warranty at no extra cost, or refund you in full if we cannot fix it.
          </p>

          <h2>How to claim</h2>
          <p>
            Bring the device in, or message us on WhatsApp at {SITE.phone} with your repair
            date and the issue. Warranty claims are usually assessed the same day.
          </p>

          <h2>Refund timing</h2>
          <p>
            Approved refunds are returned to the original payment method within 5–7 working
            days.
          </p>

          <h2>Contact</h2>
          <p>
            {SITE.legalName}, {SITE.address}. Email{" "}
            <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
