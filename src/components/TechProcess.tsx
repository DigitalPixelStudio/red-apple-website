"use client";
import Reveal from "./Reveal";
import { LineIcon } from "./Icons";

const STEPS = [
  { step: "01", title: "Walk-In Diagnosis", desc: "Bring your device. Our technician inspects it on the spot with photos and explains the exact issue.", img: "/images/v4/tech-analyze.jpg" },
  { step: "02", title: "Transparent Quote", desc: "You get a fixed price before any work begins. No surprises, no hidden charges.", img: "/images/v4/tech-battery.jpg" },
  { step: "03", title: "Expert Repair", desc: "OEM-grade parts, micro-soldering under microscope, and clean-room assembly.", img: "/images/v4/quality-testing.jpg" },
  { step: "04", title: "Quality Check", desc: "Every device goes through a 12-point quality inspection before handover.", img: "/images/v4/repair-process.jpg" },
];

export default function TechProcess() {
  return (
    <section className="section-apple bg-[var(--bg-alt)]">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-8">
        <Reveal className="text-center">
          <p className="font-apple text-[12.5px] font-bold uppercase tracking-[0.22em] text-[var(--accent)]">Our Process</p>
          <h2 className="section-title font-apple mt-3 text-[var(--text)]">Precision at <span className="gradient-text">every step.</span></h2>
          <p className="section-subtitle mx-auto mt-5">From diagnosis to delivery, every stage is handled with Apple-level precision and care.</p>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <Reveal key={i} delay={i * 80}>
              <div className="group sweep-shine rounded-[22px] overflow-hidden bg-white border border-black/[0.04] hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="relative h-44 overflow-hidden">
                  <img src={s.img} alt={s.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <span className="absolute top-3 left-3 font-apple text-[32px] font-extrabold text-white/30">{s.step}</span>
                </div>
                <div className="p-5">
                  <h3 className="text-[15px] font-bold text-[var(--text)]">{s.title}</h3>
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
