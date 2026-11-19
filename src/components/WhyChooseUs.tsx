"use client";

import Reveal from "./Reveal";
import { LineIcon } from "./Icons";
import { SITE, WHY_VS_LOCAL } from "@/lib/site";

export default function WhyChooseUs() {
  return (
    <section className="section-apple bg-[var(--bg-alt)]">
      <div className="max-w-6xl mx-auto px-5">
        <Reveal className="text-center mb-14">
          <span className="kicker">The Honest Comparison</span>
          <h2 className="breath-heading section-title font-apple mt-3 text-[var(--text)]">
            Red Apple vs <span className="topic-gradient">Authorised Service Centres</span>
          </h2>
          <p className="section-subtitle mx-auto mt-4">
            We are not another repair shop. We are Apple specialists with OEM-grade
            parts, board-level skills and a 6-month written warranty — usually at a
            lower cost than an authorised centre.
          </p>
          <p className="mt-3 text-[13px] font-extrabold uppercase tracking-[0.18em] text-[var(--accent)]">
            {SITE.tagline}
          </p>
        </Reveal>

        {/* Desktop table */}
        <div className="hidden md:block">
          <div className="glass-premium overflow-hidden rounded-2xl">
            <div className="compare-grid bg-[var(--border)]">
              <div className="compare-head flex items-center">Feature</div>
              <div className="compare-head flex items-center gap-2">
                <LineIcon name="shield" size={16} className="shrink-0" />
                {SITE.name}
              </div>
              <div className="compare-head flex items-center">Authorised service centre</div>
            </div>
            {WHY_VS_LOCAL.map((row, i) => (
              <Reveal key={i} delay={i * 50}>
                <div className="compare-grid bg-[var(--border)]">
                  <div className="compare-cell compare-cell--feature flex min-h-[66px] items-center">
                    {row.feature}
                  </div>
                  <div className="compare-cell compare-cell--us flex min-h-[66px] items-center gap-2">
                    <LineIcon name="check" size={16} className="shrink-0 text-green-600" />
                    {row.us}
                  </div>
                  <div className="compare-cell compare-cell--other flex min-h-[66px] items-center">
                    {row.apple}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {WHY_VS_LOCAL.map((row, i) => (
            <Reveal key={i} delay={i * 50}>
              <div className="tile-wash glass-premium rounded-2xl p-5">
                <p className="font-extrabold text-[14px] tracking-tight text-[var(--text)]">
                  {row.feature}
                </p>
                <div className="mt-3 flex items-start gap-2 rounded-xl bg-white/85 px-3 py-2">
                  <LineIcon name="check" size={15} className="mt-0.5 shrink-0 text-green-600" />
                  <span className="text-[13px] font-semibold leading-snug text-[var(--text)]">{row.us}</span>
                </div>
                <div className="mt-2 flex items-start gap-2 rounded-xl bg-white/60 px-3 py-2">
                  <LineIcon name="cross" size={15} className="mt-0.5 shrink-0 text-red-400" />
                  <span className="text-[13px] leading-snug text-[var(--text-muted)]">{row.apple}</span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
