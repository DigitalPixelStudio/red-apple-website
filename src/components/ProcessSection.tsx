"use client";
import Reveal from "./Reveal";
import { PROCESS_STEPS } from "@/lib/site";
import { LineIcon, type IconName } from "./Icons";

export default function ProcessSection() {
  return (
    <section id="process" className="section-apple bg-white">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-8">
        <Reveal className="text-center">
          <p className="font-apple text-[12.5px] font-bold uppercase tracking-[0.22em] text-[var(--accent)]">The Red Apple way</p>
          <h2 className="section-title font-apple mt-3 text-[var(--text)]">Simple, transparent, <span className="gradient-text">worry-free.</span></h2>
          <p className="section-subtitle mx-auto mt-5">You always know what&rsquo;s happening with your device — before, during and after the repair.</p>
        </Reveal>

        <div className="mt-16 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {PROCESS_STEPS.map((s, i) => (
            <Reveal key={s.step} delay={(i % 3) * 90}>
              <div className="group relative h-full overflow-hidden rounded-[26px] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className="relative h-36 overflow-hidden">
                  <img src={s.img} alt={s.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                  <span className="font-apple absolute left-3 top-3 text-[48px] font-black text-white/20">{s.step}</span>
                  <span className="absolute bottom-3 left-3 grid h-10 w-10 place-items-center rounded-xl bg-white/20 backdrop-blur-sm">
                    <LineIcon name={s.icon as IconName} size={18} color="#fff" />
                  </span>
                </div>
                <div className="p-5 bg-white">
                  <h3 className="font-apple text-[16px] font-bold text-[var(--text)]">{s.title}</h3>
                  <p className="mt-2 text-[12.5px] leading-relaxed text-[var(--text-muted)]">{s.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
