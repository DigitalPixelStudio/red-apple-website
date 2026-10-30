"use client";
import { useState } from "react";
import Reveal from "./Reveal";
import { FAQS } from "@/lib/site";
import { LineIcon } from "./Icons";

export default function FaqSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section id="faq" className="section-apple bg-[var(--bg-alt)]">
      <div className="mx-auto max-w-[860px] px-6 lg:px-8">
        <Reveal className="text-center">
          <p className="font-apple text-[12.5px] font-bold uppercase tracking-[0.22em] text-[var(--accent)]">FAQ</p>
          <h2 className="section-title font-apple mt-3 text-[var(--text)]">Questions? <span className="gradient-text">Answered.</span></h2>
        </Reveal>

        <div className="mt-12 space-y-3">
          {FAQS.map((f, i) => (
            <Reveal key={f.q} delay={i * 30}>
              <div className={`overflow-hidden rounded-[22px] transition-all duration-300 ${openIdx === i ? "bg-white shadow-lg ring-1 ring-black/[0.05]" : "glass"}`}>
                <button
                  onClick={() => setOpenIdx(openIdx === i ? null : i)}
                  aria-expanded={openIdx === i}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left press"
                >
                  <span className="font-apple text-[15px] font-bold text-[var(--text)]">{f.q}</span>
                  <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full bg-black/[0.04] transition-transform duration-300 ${openIdx === i ? "rotate-45" : ""}`}>
                    <LineIcon name="plus" size={14} />
                  </span>
                </button>
                {openIdx === i && (
                  <div className="px-6 pb-6">
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
