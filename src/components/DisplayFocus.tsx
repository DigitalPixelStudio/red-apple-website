"use client";
import Reveal from "./Reveal";
import SmartImg from "./SmartImg";
import { wa } from "@/lib/site";
import { track } from "@/lib/analytics";
import { LineIcon, type IconName } from "./Icons";

const REPAIRS: {
  title: string; time: string; desc: string; tag: string; img: string;
  icon: IconName; wash: string;
}[] = [
  {
    title: "Front Display", time: "~45 min",
    desc: "OEM-grade OLED with True Tone, fitted and calibrated for a clean, factory-like finish.",
    tag: "Most popular", img: "/images/v5/display-panel.jpg",
    icon: "display", wash: "tile-wash",
  },
  {
    title: "Back Glass", time: "~60 min",
    desc: "Laser-aligned factory-grade back glass, MagSafe-compatible with a seamless finish.",
    tag: "Pro Max specialist", img: "/images/v3/iphone-backglass.jpg",
    icon: "spark", wash: "tile-wash-violet",
  },
  {
    title: "Screen + Back Combo", time: "Same day",
    desc: "Both sides restored in one careful visit, with priority handling for Pro and Pro Max models.",
    tag: "Best value", img: "/images/v3/smartphone-repair.jpg",
    icon: "shield", wash: "tile-wash-mint",
  },
];

export default function DisplayFocus() {
  return (
    <section id="display" className="display-section section-apple relative overflow-hidden bg-[var(--bg-alt)]">
      <div className="red-blob pointer-events-none absolute inset-0" />
      <div className="relative mx-auto max-w-[1200px] px-6 lg:px-8">
        <Reveal className="text-center">
          <span className="kicker kicker-red">Where we excel</span>
          <h2 className="display-heading breath-heading section-title font-apple mt-3 text-[var(--text)]">
            iPhone Display &amp; Back Glass <span className="topic-gradient">Restored Right.</span>
          </h2>
          <p className="display-subtitle section-subtitle mx-auto mt-5">
            Cracked glass is our daily work. Every iPhone — from 6 to 18 Pro Max —
            restored with precision tools and genuine-grade panels.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {REPAIRS.map((r, i) => (
            <Reveal key={r.title} delay={i * 90}>
              <div className={`display-card ring-card ${r.wash} breathe-card hv-lift relative h-full overflow-hidden rounded-[26px] border border-white/90 shadow-sm transition duration-300 hover:shadow-xl`}>
                <div className="relative h-48 overflow-hidden">
                  <div className="display-image elite-media glass-image-shell h-full w-full">
                    <SmartImg
                      src={r.img}
                      alt={r.title}
                      width={900}
                      height={600}
                      className="h-full w-full object-cover"
                    />
                    <span className="elite-media-scan" aria-hidden="true" />
                  </div>
                  <span className="absolute right-3 top-3 rounded-[10px] bg-[var(--cta-dark)] px-3 py-1 text-[10.5px] font-bold uppercase tracking-wide text-white">
                    {r.tag}
                  </span>
                </div>
                <div className="p-8">
                  <span className="display-icon icon-glow grid h-12 w-12 place-items-center">
                    <LineIcon name={r.icon} size={22} />
                  </span>
                  <h3 className="display-card-title breath-heading mt-5 font-apple text-[20px] font-extrabold leading-tight tracking-tight">
                    <span className="topic-gradient">{r.title}</span>
                  </h3>
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
          <a
            href={wa("Hi! I need an iPhone display / back glass replacement. What's the estimate?")}
            target="_blank" rel="noopener noreferrer"
            onClick={() => track("whatsapp_click", { source: "display_focus" })}
            className="cta-dark press"
          >
            <LineIcon name="whatsapp" size={16} />
            Get a Display Quote on WhatsApp
          </a>
        </Reveal>
      </div>
    </section>
  );
}
