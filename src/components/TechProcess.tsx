"use client";
import Reveal from "./Reveal";
import SmartImg from "./SmartImg";
import { LineIcon, type IconName } from "./Icons";

const STEPS: { step: string; title: string; desc: string; img: string; icon: IconName }[] = [
  { step: "01", title: "Walk-In Diagnosis", desc: "Bring your device. Our technician inspects it on the spot with photos and explains the exact issue.", img: "/images/v5/tech-walkin.jpg", icon: "search" },
  { step: "02", title: "Transparent Quote", desc: "You get a fixed price before any work begins. No surprises, no hidden charges.", img: "/images/v5/battery-cell.jpg", icon: "price" },
  { step: "03", title: "Expert Repair", desc: "OEM-grade parts, micro-soldering under microscope, and clean-room assembly.", img: "/images/v5/service-iphone.jpg", icon: "wrench" },
  { step: "04", title: "Quality Check", desc: "Every device goes through a 32-point quality inspection before handover.", img: "/images/v5/quality-bench.jpg", icon: "check" },
];

export default function TechProcess() {
  return (
    <section className="section-apple bg-[var(--bg-alt)]">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-8">
        <Reveal className="text-center">
          <span className="kicker">Our Process</span>
          <h2 className="breath-heading section-title font-apple mt-3 text-[var(--text)]">
            Precision at <span className="topic-gradient">Every Step.</span>
          </h2>
          <p className="section-subtitle mx-auto mt-5">
            From diagnosis to delivery, every stage is handled with Apple-level precision and care.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <Reveal key={i} delay={i * 80}>
              <div className="group sweep-shine hv-lift tile-wash overflow-hidden rounded-[22px] border border-white/90 transition duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className="relative h-44 overflow-hidden">
                  <div className="glass-image-shell h-full w-full">
                    <SmartImg
                      src={s.img}
                      alt={s.title}
                      width={900}
                      height={600}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <span className="absolute top-3 left-3 font-apple text-[32px] font-extrabold text-white/30">{s.step}</span>
                </div>
                <div className="p-5">
                  <span className="icon-glow mb-3 grid h-10 w-10 place-items-center rounded-[14px]">
                    <LineIcon name={s.icon} size={19} />
                  </span>
                  <h3 className="breath-heading text-[15px] font-extrabold tracking-tight text-[var(--text)]">{s.title}</h3>
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
