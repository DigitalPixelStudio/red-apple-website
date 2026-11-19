"use client";

/**
 * WhyUs — the strategic section.
 *
 * This is the only section on the site written to answer the question a
 * customer actually asks before spending money: "why should I trust this shop
 * with a ₹1,00,000 phone instead of the kiosk in the mall?"
 *
 * Every claim is one the shop can defend. No invented awards, no fake badges.
 */

import Reveal from "./Reveal";
import SmartImg from "./SmartImg";
import { LineIcon, type IconName } from "./Icons";

type Pillar = {
  icon: IconName;
  title: string;
  body: string;
  proof: string;
};

const PILLARS: Pillar[] = [
  {
    icon: "board",
    title: "Board-Level, Not Part-Swapping",
    body:
      "Most shops replace whole assemblies. We micro-solder at component level, which is why we can fix a water-damaged logic board others write off — and why a repair often costs a third of the replacement.",
    proof: "Micro-soldering bench · hot-air + BGA rework",
  },
  {
    icon: "shield",
    title: "One Price, Quoted Before We Open It",
    body:
      "You get a fixed figure before any screw comes out. If we find something else, we call you and re-quote. Nothing is added to the bill after the work is done.",
    proof: "Written estimate · no surprise line items",
  },
  {
    icon: "clock",
    title: "Same-Day, Because You Need the Phone",
    body:
      "A phone in a drawer for three days is a business losing money. Display and battery work is done in 30–45 minutes while you wait, and 24/7 doorstep pickup means you never have to close your shop to come to ours.",
    proof: "~45 min display · 24/7 pickup",
  },
  {
    icon: "eye",
    title: "You Watch the Whole Repair",
    body:
      "Our repair CRM sends WhatsApp updates at every stage — whether you walked in or used free doorstep pickup — and you never need to call for a status update. We do not ask for your passcode and we never will.",
    proof: "CRM WhatsApp updates · zero password policy",
  },
];

/** Slow colour washes, rotated across the four pillars. */
const PILLAR_WASHES = ["tile-wash", "tile-wash-violet", "tile-wash-mint", "tile-wash"];

const PROOF_POINTS = [
  { k: "4.9", v: "Google Rating", s: "Verified Google reviews" },
  { k: "9+", v: "Years on MG Road", s: "Same location" },
  { k: "6 Months", v: "Repair Warranty", s: "Claim with invoice" },
  { k: "32", v: "Quality Checks", s: "Before hand-back" },
];

export default function WhyUs() {
  return (
    <section id="why-us" className="relative overflow-hidden py-20">
      {/* soft orange wash, no blur filter */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 42% at 50% 0%, rgba(255,122,26,0.055), transparent 72%)",
        }}
      />

      <div className="relative mx-auto max-w-[1140px] px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <Reveal>
            <span className="kicker">The Standard</span>
            <h2 className="whyus-heading breath-heading mt-3 font-apple text-[clamp(1.9rem,4vw,2.9rem)] font-extrabold leading-[1.16] tracking-tight text-[var(--text)]">
              <span className="why-head-red">Four Reasons</span> People Hand Us a Phone Worth <span className="why-rupee">₹</span><span className="why-burgundy">1,00,000</span>
            </h2>
            <p className="mt-4 max-w-[560px] text-[15px] leading-relaxed text-[var(--text-muted)]">
              Every repair shop says they are careful. These are the four things we can
              actually prove, and the reason our competitors quietly send us their
              board-level work.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {["Free diagnosis", "Written quote", "Photo updates", "6-Month Warranty"].map((tag) => (
                <span key={tag} className="whyus-tag">
                  <LineIcon name="check" size={11} /> {tag}
                </span>
              ))}
            </div>
          </Reveal>

          <Reveal delay={120} className="hidden sm:block">
            <div className="whyus-visual" aria-hidden="true">
              <div className="whyus-visual-glow" />
              {/* Glass-shell sweep over the real burgundy iPhone photo; the glow behind breathes. */}
              <div className="elite-media glass-image-shell w-full max-w-[420px] rounded-[26px] border border-white/85 shadow-[0_24px_48px_-26px_rgba(120,52,8,0.42)]">
                <SmartImg
                  src="/images/v5/iphone-pro-max-burgundy.jpg"
                  alt=""
                  width={1200}
                  height={800}
                  className="whyus-phone"
                />
                <span className="elite-media-scan" aria-hidden="true" />
              </div>
              <span className="whyus-float whyus-float-1">
                <LineIcon name="shield" size={12} /> 6-Month Warranty
              </span>
              <span className="whyus-float whyus-float-2">
                <LineIcon name="clock" size={12} /> ~45 Min Display
              </span>
            </div>
          </Reveal>
        </div>

        {/* pillars */}
        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {PILLARS.map((p, i) => (
            <Reveal key={p.title} delay={(i % 2) * 70}>
              <article
                className={`${PILLAR_WASHES[i % PILLAR_WASHES.length]} hv-lift hv-icon group relative flex h-full flex-col rounded-[26px] border border-white/90 p-6 shadow-[0_18px_46px_-32px_rgba(124,45,18,0.4)] sm:p-7`}
              >
                <div className="mb-4 flex items-start justify-between">
                  <span className="icon-glow grid h-12 w-12 place-items-center rounded-[16px]">
                    <LineIcon
                      name={p.icon}
                      size={23}
                      className="hv-icon-target"
                    />
                  </span>
                  <span className="font-apple text-[13px] font-extrabold text-black/[0.12]">
                    0{i + 1}
                  </span>
                </div>

                <h3 className="breath-heading text-[16.5px] font-extrabold leading-snug tracking-tight text-[var(--text)]">
                  {p.title}
                </h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-[var(--text-muted)]">
                  {p.body}
                </p>
                <p className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white/85 px-3 py-1.5 text-[11px] font-bold text-[var(--cosmic-deep)] ring-1 ring-[var(--orange)]/10">
                  <LineIcon name="check" size={12} />
                  {p.proof}
                </p>
              </article>
            </Reveal>
          ))}
        </div>

        {/* proof strip */}
        <div className="figma-card-lg mt-5 grid grid-cols-2 divide-black/[0.06] overflow-hidden sm:grid-cols-4 sm:divide-x">
          {PROOF_POINTS.map((s) => (
            <div key={s.v} className="hv-price px-6 py-7 text-center">
              <div className="font-apple text-[30px] font-extrabold leading-none tracking-tight text-[var(--text)]">
                {s.k}
              </div>
              <div className="mt-1.5 text-[12px] font-bold text-[var(--text)]/80">{s.v}</div>
              <div className="mt-0.5 text-[11px] text-[var(--text-muted)]">{s.s}</div>
            </div>
          ))}
        </div>

        {/* the honest close */}
        <p className="mx-auto mt-8 max-w-[620px] text-center text-[13px] leading-relaxed text-[var(--text-muted)]">
          If your repair is not something we can do well, we will say so and point you
          somewhere better. A wasted trip costs you more than an honest no.
        </p>
      </div>
    </section>
  );
}
