"use client";
import Reveal from "./Reveal";
import { SITE } from "@/lib/site";
import { LineIcon, type IconName } from "./Icons";

const CERTS = [
  { icon: "verified" as IconName, title: "Certified Technicians", desc: "9+ years of Apple-specific repair experience with board-level certification." },
  { icon: "shield" as IconName, title: "90-Day Written Warranty", desc: "Every repair backed by a documented warranty. No verbal promises — written proof." },
  { icon: "lock" as IconName, title: "Data Privacy Guarantee", desc: "Your passcode stays with you. We never access your data, photos, or accounts." },
  { icon: "badge" as IconName, title: "OEM-Grade Parts", desc: "Genuine-quality panels, batteries, and components — with full disclosure on sourcing." },
  { icon: "clock" as IconName, title: "Same-Day Repairs", desc: "Most screen, battery, and port repairs completed in 30–60 minutes while you wait." },
  { icon: "heart" as IconName, title: "Free Pickup & Drop", desc: "Doorstep service across Bengaluru. WhatsApp your location and we handle the rest." },
];

const TESTIMONIALS = [
  { name: "Rahul M.", device: "iPhone 15 Pro Max", text: "Screen replacement in 35 minutes. True Tone works perfectly. Way cheaper than Apple Store.", rating: 5 },
  { name: "Priya S.", device: "MacBook Pro 14\"", text: "Water damage repair saved my entire business data. These guys are miracle workers.", rating: 5 },
  { name: "Arjun K.", device: "iPad Pro 12.9\"", text: "Back glass replacement looks factory-original. MagSafe works fine. Highly recommend.", rating: 5 },
  { name: "Sneha R.", device: "AirPods Pro 2", text: "Battery replacement done in 20 minutes. Sound quality is back to brand new.", rating: 5 },
];

export default function TrustProof() {
  return (
    <section className="section-apple bg-white">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-8">
        <Reveal className="text-center">
          <p className="font-apple text-[12.5px] font-bold uppercase tracking-[0.22em] text-[var(--accent)]">Why trust us</p>
          <h2 className="section-title font-apple mt-3 text-[var(--text)]">Built on <span className="gradient-text">trust & precision.</span></h2>
          <p className="section-subtitle mx-auto mt-5">905+ five-star reviews can't be wrong. Here's what makes us Bengaluru's most trusted Apple repair store.</p>
        </Reveal>

        {/* Certifications grid */}
        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CERTS.map((c, i) => (
            <Reveal key={i} delay={i * 60}>
              <div className="flex h-full gap-4 rounded-[22px] bg-[var(--bg-alt)] p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
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

        {/* Testimonials */}
        <Reveal className="mt-16" delay={100}>
          <h3 className="text-center font-apple text-[22px] font-bold text-[var(--text)] mb-8">What our customers say</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="rounded-[20px] bg-[var(--bg-alt)] p-5">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <LineIcon key={j} name="star" size={14} className="text-[var(--accent2)]" />
                  ))}
                </div>
                <p className="text-[13px] leading-relaxed text-[var(--text)] italic">&ldquo;{t.text}&rdquo;</p>
                <div className="mt-3 border-t border-[var(--border)] pt-3">
                  <div className="text-[12.5px] font-bold text-[var(--text)]">{t.name}</div>
                  <div className="text-[11px] text-[var(--text-muted)]">{t.device}</div>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
