"use client";
import { useState } from "react";
import Reveal from "./Reveal";
import { FAQS, SITE } from "@/lib/site";
import { LineIcon } from "./Icons";

export default function FaqSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section id="faq" className="section-apple bg-[var(--bg-alt)]">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14 lg:px-8">
        {/* Sticky intro panel */}
        <Reveal className="lg:sticky lg:top-24 lg:self-start">
          <div className="tile-wash rounded-[28px] border border-white/90 p-7 shadow-[0_18px_46px_-32px_rgba(124,45,18,0.4)]">
            <span className="kicker">FAQ</span>
            <h2 className="breath-heading mt-3 font-apple text-[clamp(2rem,4vw,2.8rem)] font-extrabold leading-[1.08] tracking-tight text-[var(--text)]">
              Questions? <span className="topic-gradient">Answered.</span>
            </h2>
            <p className="mt-4 text-[13.5px] leading-relaxed text-[var(--text-muted)]">
              Straight answers on warranty, claims, WhatsApp updates and pickup. Every
              answer here comes from our written policy — nothing is improvised.
            </p>
            <div className="mt-5">
              <span className="gmb-badge">
                <LineIcon name="verified" size={13} /> {SITE.addressVerified}
              </span>
            </div>
            <a
              href={SITE.gmbUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="press mt-5 inline-flex items-center gap-2 text-[12.5px] font-bold text-[var(--orange-deep)]"
            >
              <LineIcon name="gmb" size={15} />
              Verify us on Google
              <LineIcon name="arrow-right" size={14} />
            </a>
          </div>
        </Reveal>

        {/* Accordion — answers always come straight from FAQS in site.ts. */}
        <div className="space-y-3">
          {FAQS.map((f, i) => (
            <Reveal key={f.q} delay={Math.min(i, 8) * 25}>
              <div
                className={`overflow-hidden rounded-[22px] border transition-[transform,background-color] duration-300 ${
                  openIdx === i
                    ? "glass-premium shadow-lg"
                    : "glass border-white/70"
                }`}
              >
                <button
                  onClick={() => setOpenIdx(openIdx === i ? null : i)}
                  aria-expanded={openIdx === i}
                  className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left press sm:px-6"
                >
                  <span className="topic-gradient font-apple text-[14.5px] font-extrabold leading-snug">
                    {f.q}
                  </span>
                  <span
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-full transition-transform duration-300 ${
                      openIdx === i ? "icon-glow rotate-45" : "bg-black/[0.04]"
                    }`}
                  >
                    <LineIcon name="plus" size={14} />
                  </span>
                </button>
                {openIdx === i && (
                  <div className="px-5 pb-5 sm:px-6">
                    <p className="text-[13.5px] leading-relaxed text-[var(--text-light)]">{f.a}</p>
                  </div>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
