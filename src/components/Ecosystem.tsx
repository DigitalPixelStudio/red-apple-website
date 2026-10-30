"use client";
import Reveal from "./Reveal";
import { wa } from "@/lib/site";
import { track } from "@/lib/analytics";
import { LineIcon, type IconName } from "./Icons";

const DEVICES = [
  { id: "iphone", name: "iPhone 17 Pro Max", icon: "phone", tag: "All models", desc: "Displays, batteries, cameras, back glass & full hardware service.", img: "/images/v4/iphone-17-pro-max.jpg" },
  { id: "ipad", name: "iPad", icon: "ipad", tag: "All models", desc: "iPad, iPad Pro, iPad Air & iPad mini — screens, battery & logic.", img: "/images/v4/repair-process.jpg" },
  { id: "watch", name: "Apple Watch Ultra 3", icon: "watch", tag: "All series", desc: "Screens, batteries, sensors & straps across all Watch series.", img: "/images/v4/apple-watch-ultra.jpg" },
  { id: "airpods", name: "AirPods", icon: "airpods", tag: "All generations", desc: "Battery, charging case, speaker & microphone repair.", img: "/images/v4/airpods-real.jpg" },
  { id: "macbook", name: "MacBook", icon: "macbook", tag: "Pro / Air / Mini", desc: "MacBook Pro, Air, Mac mini & iMac — display, battery, board.", img: "/images/v3/macbook-pro.jpg" },
  { id: "software", name: "Software & Recovery", icon: "wrench", tag: "iOS / macOS", desc: "OS install, firmware, boot loops, data recovery & unlocking.", img: "/images/v3/circuit-board.jpg" },
] as const;

export default function Ecosystem() {
  return (
    <section id="ecosystem" className="section-apple bg-white">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-8">
        <Reveal className="text-center">
          <p className="font-apple text-[12.5px] font-bold uppercase tracking-[0.22em] text-[var(--accent)]">The whole Apple ecosystem</p>
          <h2 className="section-title font-apple mt-3 text-[var(--text)]">One specialist store for <span className="gradient-text">every Apple device.</span></h2>
          <p className="section-subtitle mx-auto mt-5">From the latest iPhone 17 Pro Max to a classic MacBook — if Apple made it, we can fix it.</p>
        </Reveal>

        <div className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-3">
          {DEVICES.map((d, i) => (
            <Reveal key={d.id} delay={i * 60}>
              <a
                href={d.id === "software" ? "#software" : "#quote"}
                onClick={() => track("service_view", { service: d.name })}
                className="group block h-full rounded-[26px] overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-black/[0.07]"
              >
                <div className="relative h-44 overflow-hidden">
                  <img src={d.img} alt={d.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  <div className="absolute bottom-3 left-3 flex items-center gap-2">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/20 backdrop-blur-sm">
                      <LineIcon name={d.icon as IconName} size={20} color="#fff" />
                    </span>
                    <span className="rounded-full bg-white/20 backdrop-blur-sm px-2.5 py-1 text-[10.5px] font-semibold text-white">{d.tag}</span>
                  </div>
                </div>
                <div className="p-5 bg-white">
                  <h3 className="font-apple text-[17px] font-bold text-[var(--text)]">{d.name}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-[var(--text-muted)]">{d.desc}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-[12.5px] font-bold text-[var(--accent)] opacity-0 transition-opacity group-hover:opacity-100">
                    Get a quote <LineIcon name="arrow-right" size={12} />
                  </span>
                </div>
              </a>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-10 text-center" delay={120}>
          <a href={wa("Hi! Which Apple devices do you repair?")} target="_blank" rel="noopener noreferrer"
            onClick={() => track("whatsapp_click", { source: "ecosystem" })}
            className="cta-outline press">
            <LineIcon name="chat" size={16} />
            Not sure? Ask us on WhatsApp
          </a>
        </Reveal>
      </div>
    </section>
  );
}
