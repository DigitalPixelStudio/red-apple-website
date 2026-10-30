"use client";
import Reveal from "./Reveal";
import { wa } from "@/lib/site";
import { track } from "@/lib/analytics";
import { LineIcon } from "./Icons";

const REPAIRS = [
  { title: "Front Display", time: "~45 min", desc: "OEM-grade OLED with True Tone. Clear, bright, exact-fit panels for every iPhone model.", tag: "Most popular", img: "/images/iphone-screen-repair.jpg" },
  { title: "Back Glass", time: "~60 min", desc: "Laser-aligned factory-grade back glass. MagSafe-compatible with a seamless finish.", tag: "Pro Max specialist", img: "/images/iphone-repair-02.jpg" },
  { title: "Screen + Back Combo", time: "Same day", desc: "Both sides of your iPhone restored in one visit — with a priority lane for Pro & Pro Max.", tag: "Best value", img: "/images/workshop-repair-01.jpg" },
];

export default function DisplayFocus() {
  return (
    <section id="display" className="section-apple relative overflow-hidden bg-[var(--bg-alt)]">
      <div className="red-blob pointer-events-none absolute inset-0" />
      <div className="relative mx-auto max-w-[1200px] px-6 lg:px-8">
        <Reveal className="text-center">
          <p className="font-apple text-[12.5px] font-bold uppercase tracking-[0.22em] text-[var(--accent)]">Where we excel</p>
          <h2 className="section-title font-apple mt-3 text-[var(--text)]">iPhone display &amp; back glass <span className="gradient-text">specialists.</span></h2>
          <p className="section-subtitle mx-auto mt-5">Cracked glass is our daily bread. Every iPhone — from 6 to 16 Pro Max — restored to like-new with precision tools and genuine-grade panels.</p>
        </Reveal>

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {REPAIRS.map((r, i) => (
            <Reveal key={r.title} delay={i * 90}>
              <div className="ring-card relative h-full overflow-hidden rounded-[30px] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-black/[0.08]">
                <div className="relative h-48 overflow-hidden">
                  <img src={r.img} alt={r.title} className="h-full w-full object-cover" loading="lazy" />
                  <span className="absolute right-3 top-3 rounded-[var(--cta-radius)] bg-[var(--cta-dark)] px-3 py-1 text-[10.5px] font-bold uppercase tracking-wide text-white">{r.tag}</span>
                </div>
                <div className="p-8">
                  <div className="grid h-12 w-12 place-items-center rounded-[16px] bg-gradient-to-br from-[var(--accent)] to-[var(--accent2)] shadow-lg shadow-[var(--accent)]/25">
                    <LineIcon name="display" size={22} color="#fff" />
                  </div>
                  <h3 className="mt-5 font-apple text-[20px] font-bold text-[var(--text)]">{r.title}</h3>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-[var(--text-muted)]">{r.desc}</p>
                  <div className="mt-5 flex items-center gap-2 text-[12.5px] font-semibold text-[var(--text-muted)]">
                    <span className="flex h-1.5 w-1.5 rounded-full bg-green-500" /> {r.time} while you wait
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-12 text-center" delay={120}>
          <a href={wa("Hi! I need an iPhone display / back glass replacement. What's the estimate?")}
            target="_blank" rel="noopener noreferrer" onClick={() => track("whatsapp_click", { source: "display_focus" })}
            className="cta-dark press">
            <LineIcon name="whatsapp" size={16} />
            Get a Display Quote on WhatsApp
          </a>
        </Reveal>
      </div>
    </section>
  );
}
