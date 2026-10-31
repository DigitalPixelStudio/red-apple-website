import type { Metadata } from "next";
import { SITE, baseUrl } from "@/lib/site";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Terms of Service | Red Apple Mobile Repair Store",
  description: "The terms that apply when you use Red Apple Mobile Repair Store's website and repair services.",
  alternates: { canonical: `${baseUrl}/terms` },
};

const UPDATED = "30 October 2026";

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 pb-24 pt-32">
        <h1 className="mb-2 font-apple text-4xl font-extrabold tracking-tight text-[var(--text)]">Terms of Service</h1>
        <p className="mb-10 text-sm text-[var(--text-muted)]">Last updated: {UPDATED}</p>

        <div className="legal">
          <h2>These terms</h2>
          <p>
            By using this website or leaving a device with {SITE.legalName}, you agree to
            these terms. If you do not agree, please do not use the service.
          </p>

          <h2>Estimates</h2>
          <p>
            Prices shown on this website are indicative and depend on your exact model and
            the part required. A binding price is confirmed in writing before any work
            begins. We do not start a repair without your approval of the final amount.
          </p>

          <h2>Payment</h2>
          <p>
            Repair work begins after payment is made and the part is procured. We collect
            the agreed amount in full at that point. If a part turns out to be unavailable,
            you are refunded in full.
          </p>

          <h2>Your device</h2>
          <ul>
            <li>Back up your data before handing over any device. We are not responsible for data loss.</li>
            <li>We never ask for your passcode, Apple ID, or account password.</li>
            <li>If a device is not collected within 90 days of completion, we may dispose of it after written notice.</li>
          </ul>

          <h2>What we do not cover</h2>
          <ul>
            <li>Damage from liquid, impact, or unauthorised repair after our work.</li>
            <li>Pre-existing faults unrelated to the repair you paid for.</li>
            <li>Software issues caused by third-party apps or iOS updates.</li>
          </ul>

          <h2>Warranty</h2>
          <p>
            Every repair carries a 90-day service warranty. Displays and batteries also
            carry 6 months of health cover. Full details are on our{" "}
            <a href="/refund-policy">Refund &amp; Warranty Policy</a>.
          </p>

          <h2>Liability</h2>
          <p>
            Our liability for any repair is limited to the amount you paid for that repair.
            We are not liable for indirect losses such as lost income or lost data.
          </p>

          <h2>Governing law</h2>
          <p>
            These terms are governed by the laws of India. Any dispute is subject to the
            exclusive jurisdiction of the courts of Bengaluru, Karnataka.
          </p>

          <h2>Contact</h2>
          <p>
            {SITE.legalName}, {SITE.address}. Email{" "}
            <a href={`mailto:${SITE.email}`}>{SITE.email}</a> or call {SITE.phone}.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
