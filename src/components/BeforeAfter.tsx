"use client";
import Reveal from "./Reveal";
import { LineIcon } from "./Icons";

const TRANSFORMS = [
  { title: "iPhone 16 Pro Max — Cracked OLED", before: "/images/v4/before-crack.jpg", after: "/images/v4/after-fixed.jpg", desc: "Shattered OLED replaced with OEM-grade panel in 42 minutes. True Tone and 120Hz ProMotion fully preserved." },
  { title: "iPhone 15 Pro — Back Glass Shattered", before: "/images/v3/phone-broken.jpg", after: "/images/v4/iphone-17-pro.jpg", desc: "Laser-aligned back glass with camera lens protection. MagSafe wireless charging fully restored." },
  { title: "iPhone 14 Pro — Battery Degraded", before: "/images/v4/tech-battery.jpg", after: "/images/v4/quality-check.jpg", desc: "Genuine battery cell replacement. Device now holds 100% charge capacity — tested and certified." },
];

export default function BeforeAfter() {
  return (
    <section className="section-apple bg-[var(--bg-alt)]">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-8">
        <Reveal className="text-center">
          <p className="font-apple text-[12.5px] font-bold uppercase tracking-[0.22em] text-[var(--accent)]">Real results</p>
          <h2 className="section-title font-apple mt-3 text-[var(--text)]">See the <span className="gradient-text">transformation.</span></h2>
          <p className="section-subtitle mx-auto mt-5">Actual repairs from our Halasuru store. Every device restored to factory condition.</p>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {TRANSFORMS.map((t, i) => (
            <Reveal key={i} delay={i * 100}>
              <div className="rounded-[26px] bg-white overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group">
                <div className="grid grid-cols-2">
                  <div className="relative h-52 overflow-hidden">
                    <img src={t.before} alt="Before repair" className="h-full w-full object-cover" loading="lazy" />
                    <span className="absolute top-2 left-2 rounded-[var(--cta-radius)] bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white uppercase">Before</span>
                  </div>
                  <div className="relative h-52 overflow-hidden">
                    <img src={t.after} alt="After repair" className="h-full w-full object-cover" loading="lazy" />
                    <span className="absolute top-2 left-2 rounded-[var(--cta-radius)] bg-green-500 px-2 py-0.5 text-[10px] font-bold text-white uppercase">After</span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-[15px] font-bold text-[var(--text)]">{t.title}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-[var(--text-muted)]">{t.desc}</p>
                  <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-green-600">
                    <LineIcon name="check" size={14} /> Completed successfully
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
