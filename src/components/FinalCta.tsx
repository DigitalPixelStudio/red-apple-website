"use client";
import Reveal from "./Reveal";
import { SITE } from "@/lib/site";
import { track } from "@/lib/analytics";
import { LineIcon } from "./Icons";

export default function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-[var(--cta-dark)] py-24 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="orb left-[15%] top-[-20%] h-[400px] w-[400px] bg-[var(--accent)] opacity-[0.18]" />
        <div className="orb orb-reverse bottom-[-20%] right-[10%] h-[400px] w-[400px] bg-[var(--accent2)] opacity-[0.15]" />
        <div className="chip-float left-[22%] top-[30%] h-3 w-3 bg-[var(--accent)]/50" />
        <div className="chip-float right-[20%] bottom-[25%] h-2 w-2 bg-[var(--accent2)]/50" />
        <div className="chip-float left-[40%] top-[15%] h-2 w-2 bg-white/20" />
      </div>
      <div className="relative mx-auto max-w-[820px] px-6 text-center lg:px-8">
        <Reveal>
          <div className="mx-auto mb-7 grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent2)] shadow-2xl shadow-[var(--accent)]/40">
            <LineIcon name="apple" size={28} color="#fff" />
          </div>
          <h2 className="font-apple text-[clamp(2rem,5vw,3.6rem)] font-extrabold leading-[1.05] tracking-tight">
            Your Apple device,<br /><span className="gradient-text">fixed right.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-[560px] text-[15px] leading-relaxed text-white/60">
            Tell us the device and the issue — we&rsquo;ll reply with an exact estimate and a slot, usually within minutes.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a href="#quote" onClick={() => track("quote_started", { source: "final_cta" })} className="cta-dark bg-white text-[var(--text)] hover:bg-white/90 press">
              Get Instant Estimate
              <LineIcon name="arrow-right" size={16} />
            </a>
            <a href={SITE.phoneHref} onClick={() => track("call_click", { source: "final_cta" })} className="inline-flex items-center gap-2 rounded-[var(--cta-radius)] border border-white/20 bg-white/10 px-7 py-3.5 text-[15px] font-bold backdrop-blur-xl transition-all hover:bg-white/20">
              <LineIcon name="call" size={16} />
              {SITE.phone}
            </a>
          </div>
          <p className="mt-6 text-[12.5px] text-white/40">Free diagnosis · No hidden charges · Pay only when it works</p>
        </Reveal>
      </div>
    </section>
  );
}
