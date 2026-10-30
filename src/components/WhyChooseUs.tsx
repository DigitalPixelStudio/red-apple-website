"use client";

import Reveal from "./Reveal";
import { LineIcon } from "./Icons";
import { SITE, WHY_VS_LOCAL } from "@/lib/site";

export default function WhyChooseUs() {
  return (
    <section className="section-apple bg-[var(--bg-alt)]">
      <div className="max-w-6xl mx-auto px-5">
        <Reveal className="text-center mb-16">
          <p className="text-sm font-semibold tracking-widest uppercase text-[var(--accent)] mb-3">
            Why {SITE.name}
          </p>
          <h2 className="section-title">Red Apple vs Apple Authorized</h2>
          <p className="section-subtitle mx-auto mt-4">
            We are not another repair shop. We are Apple specialists with OEM parts,
            board-level skills, and a 90-day written warranty — at 35% lower cost.
          </p>
        </Reveal>

        {/* Desktop table */}
        <div className="hidden md:block">
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="grid grid-cols-[2fr_3fr_3fr] gap-px bg-[var(--border)]">
              <div className="bg-[var(--bg-alt)] px-6 py-4 text-sm font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Feature
              </div>
              <div className="bg-[var(--bg-alt)] px-6 py-4 text-sm font-bold uppercase tracking-wider text-[var(--accent)]">
                <div className="flex items-center gap-2">
                  <LineIcon name="shield" size={16} />
                  {SITE.name}
                </div>
              </div>
              <div className="bg-[var(--bg-alt)] px-6 py-4 text-sm font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Apple Authorized
              </div>
            </div>
            {WHY_VS_LOCAL.map((row, i) => (
              <Reveal key={i} delay={i * 50}>
                <div className="grid grid-cols-[2fr_3fr_3fr] gap-px bg-[var(--border)]">
                  <div className="bg-white px-6 py-4 font-semibold text-sm text-[var(--text)]">
                    {row.feature}
                  </div>
                  <div className="bg-white px-6 py-4 text-sm text-[var(--text)] flex items-center gap-2">
                    <LineIcon name="check" size={16} className="text-green-500 shrink-0" />
                    {row.us}
                  </div>
                  <div className="bg-white px-6 py-4 text-sm text-[var(--text-muted)]">
                    {row.apple}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-4">
          {WHY_VS_LOCAL.map((row, i) => (
            <Reveal key={i} delay={i * 50}>
              <div className="glass-card rounded-xl p-5">
                <p className="font-semibold text-sm mb-3 text-[var(--text)]">{row.feature}</p>
                <div className="flex items-start gap-2 mb-2">
                  <LineIcon name="check" size={14} className="text-green-500 mt-0.5 shrink-0" />
                  <span className="text-sm font-medium">{row.us}</span>
                </div>
                <div className="flex items-start gap-2 opacity-60">
                  <LineIcon name="cross" size={14} className="text-red-400 mt-0.5 shrink-0" />
                  <span className="text-sm">{row.apple}</span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
