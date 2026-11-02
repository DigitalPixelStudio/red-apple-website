"use client";
import Reveal from "./Reveal";
import { SITE } from "@/lib/site";
import { LineIcon, type IconName } from "./Icons";

const CERTS = [
  { icon: "verified" as IconName, title: "Experienced Repair Technicians", desc: "9+ years of Apple-device repair experience, including component-level diagnostics." },
  { icon: "shield" as IconName, title: "90-Day Written Warranty", desc: "Every repair backed by a documented warranty. No verbal promises — written proof." },
  { icon: "lock" as IconName, title: "Data Privacy Guarantee", desc: "Your passcode stays with you. We never access your data, photos, or accounts." },
  { icon: "badge" as IconName, title: "OEM-Grade Parts", desc: "Genuine-quality panels, batteries, and components — with full disclosure on sourcing." },
  { icon: "clock" as IconName, title: "Same-Day Repairs", desc: "Most screen, battery, and port repairs completed in 30–60 minutes while you wait." },
  { icon: "heart" as IconName, title: "Doorstep Pickup & Drop", desc: "Pickup across Bengaluru; free for eligible repairs above ₹2,999. WhatsApp to confirm coverage." },
];

export default function TrustProof() {
  return (
    <section className="section-apple bg-white">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-8">
        <Reveal className="text-center">
          <p className="font-apple text-[12.5px] font-bold uppercase tracking-[0.22em] text-[var(--accent)]">Why trust us</p>
          <h2 className="section-title font-apple mt-3 text-[var(--text)]">Built on <span className="gradient-text">trust & precision.</span></h2>
          <p className="section-subtitle mx-auto mt-5">More than 1,000 Google reviews and a 4.9 rating. Here&apos;s what customers value about our repair service.</p>
        </Reveal>

        {/* Certifications grid */}
        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CERTS.map((c, i) => (
            <Reveal key={i} delay={i * 60}>
              <div className="flex h-full gap-4 rounded-[22px] bg-[var(--bg-alt)] p-6 transition duration-300 duration-300 hover:-translate-y-1 hover:shadow-lg">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[var(--accent)]/10 to-[var(--accent2)]/10">
                  <LineIcon name={c.icon} size={22} className="text-[var(--accent)]" />
                </span>
                <div>
                  <h3 className="text-[15px] font-bold text-[var(--text)]">{c.title}</h3>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-[var(--text-muted)]">{c.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Link visitors to the original source instead of publishing unverified testimonials. */}
        <Reveal className="mt-16 text-center" delay={100}>
          <h3 className="mb-3 font-apple text-[22px] font-bold text-[var(--text)]">Read real customer feedback</h3>
          <p className="mx-auto mb-5 max-w-xl text-sm leading-relaxed text-[var(--text-muted)]">
            See the original customer reviews and current rating directly on our Google Business Profile.
          </p>
          <a
            href={SITE.mapsReviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--cta-dark)] px-5 py-3 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
          >
            <LineIcon name="star" size={16} />
            Read Google reviews
          </a>
        </Reveal>
      </div>
    </section>
  );
}
