import type { Metadata } from "next";
import { SITE, baseUrl } from "@/lib/site";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Refund & Warranty Policy | Red Apple Mobile Repair Store",
  description: "Our six-month repair warranty, how to claim it with your invoice, the exclusions, and our refund terms.",
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
          <h2>Six-month repair warranty</h2>
          <p>
            Every repair we carry out is covered for six months from the date you
            collect the device. That covers the repair work itself, the parts we
            fitted, and displays, batteries and glass work. Motherboard repairs
            are the only exclusion.
          </p>

          <h2>Your invoice is the warranty record</h2>
          <p>
            We keep the job card in our repair CRM, and the GST invoice issued
            after the repair is your warranty record. Keep it safe: it carries
            the repair date, the work done and the invoice number we use to find
            your job.
          </p>

          <h2>How to claim</h2>
          <p>
            Bring the invoice and the device to the store, or message us on
            WhatsApp at {SITE.phone} with your invoice number and clear photos of
            the problem. We re-diagnose the fault and, if it is covered, handle
            the diagnosis and the covered repair on that same invoice at no extra
            charge. Warranty claims are usually assessed the same day.
          </p>

          <h2>What the warranty does not cover</h2>
          <ul>
            <li>Physical or impact damage after hand-back — drops, cracks or bending.</li>
            <li>Liquid damage after hand-back.</li>
            <li>Repair or opening by another shop after our work.</li>
            <li>Accidental damage.</li>
            <li>Normal wear and tear.</li>
            <li>Misuse.</li>
            <li>Cosmetic issues.</li>
            <li>Unrelated software faults, including third-party apps or iOS updates.</li>
            <li>Motherboard repairs, which are excluded from the six-month warranty.</li>
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

          <h2>Refund timing</h2>
          <p>
            Approved refunds are returned to the original payment method within 5–7 working
            days.
          </p>

          <h2>Contact</h2>
          <p>
            {SITE.legalName}, {SITE.address} ({SITE.addressVerified}). Rated 4.9 from{" "}
            {SITE.ratingCount} Google reviews —{" "}
            <a href={SITE.gmbUrl} target="_blank" rel="noopener noreferrer">Google My Business &amp; Maps</a>. Email{" "}
            <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
