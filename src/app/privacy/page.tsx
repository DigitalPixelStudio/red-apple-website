import type { Metadata } from "next";
import { SITE, baseUrl } from "@/lib/site";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy | Red Apple Mobile Repair Store",
  description: "How Red Apple Mobile Repair Store collects, uses and protects your personal information.",
  alternates: { canonical: `${baseUrl}/privacy` },
};

const UPDATED = "30 October 2026";

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 pb-24 pt-32">
        <h1 className="mb-2 font-apple text-4xl font-extrabold tracking-tight text-[var(--text)]">Privacy Policy</h1>
        <p className="mb-10 text-sm text-[var(--text-muted)]">Last updated: {UPDATED}</p>

        <div className="legal">
          <h2>Who we are</h2>
          <p>
            {SITE.legalName}, {SITE.address}. You can reach us at{" "}
            <a href={`mailto:${SITE.email}`}>{SITE.email}</a> or {SITE.phone}.
          </p>

          <h2>What we collect</h2>
          <ul>
            <li>Contact details you give us — name, phone number, email.</li>
            <li>Device details you share — model, the fault, and any photos you send.</li>
            <li>Basic usage data — pages viewed and buttons clicked, in aggregate.</li>
          </ul>

          <h2>Why we collect it</h2>
          <ul>
            <li>To prepare an accurate repair estimate.</li>
            <li>To contact you about your repair.</li>
            <li>To honour the warranty on work we have done.</li>
            <li>To improve the website and understand which services people need.</li>
          </ul>

          <h2>Who we share it with</h2>
          <p>
            We do not sell your data. We share it only with the services that run this
            website — hosting (Vercel), advertising measurement (Google Ads, Meta), and
            messaging (WhatsApp) — and only to the extent needed for them to work.
          </p>

          <h2>How long we keep it</h2>
          <p>
            Repair records are kept for the length of the warranty plus one year, so we
            can honour a claim. Enquiries that never became a repair are deleted after
            12 months.
          </p>

          <h2>Your rights</h2>
          <p>
            Under India&apos;s Digital Personal Data Protection Act, 2023 you can ask us
            to show you what we hold, correct it, or delete it. Email{" "}
            <a href={`mailto:${SITE.email}`}>{SITE.email}</a> and we will respond within
            30 days.
          </p>

          <h2>Cookies</h2>
          <p>
            We use cookies for advertising measurement and basic analytics. You can block
            them in your browser settings — the site still works, you will just see less
            relevant ads elsewhere.
          </p>

          <h2>Security</h2>
          <p>
            Your device is never accessed without your permission, and we never ask for
            your passcode, Apple ID password, or any account credentials. If anyone
            claiming to be us asks for those, it is not us.
          </p>

          <h2>Changes</h2>
          <p>
            If this policy changes we will update the date at the top of this page.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
