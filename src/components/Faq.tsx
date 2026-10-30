"use client";
import { useState } from "react";
import { FAQS } from "@/lib/site";
import Reveal from "./Reveal";

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="section-apple">
      <div className="mx-auto max-w-[820px] px-6 lg:px-8">
        <Reveal className="text-center">
          <p className="font-apple text-[13px] font-semibold uppercase tracking-[0.2em] text-[#86868b]">Questions</p>
          <h2 className="section-title font-apple text-[#1d1d1f] mt-3">Everything you<br/>need to know.</h2>
        </Reveal>
        <div className="mt-14 space-y-3">
          {FAQS.map((f, i) => (
            <Reveal key={f.q} delay={i * 40}>
              <div className="overflow-hidden rounded-[20px] border border-black/[0.06] bg-[#f5f5f7] transition-colors hover:border-black/[0.08]">
                <button onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center justify-between gap-6 px-7 py-6 text-left">
                  <span className="font-apple text-[15px] font-semibold text-[#1d1d1f] lg:text-[17px]">{f.q}</span>
                  <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#f5f5f7] transition-transform duration-300 ${open === i ? "rotate-45" : ""}`}>
                    <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#1d1d1f]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                  </span>
                </button>
                <div className={`grid transition-all duration-400 ease-out ${open === i ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                  <div className="overflow-hidden">
                    <p className="px-7 pb-6 font-apple text-[15px] leading-relaxed text-[#86868b]">{f.a}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
