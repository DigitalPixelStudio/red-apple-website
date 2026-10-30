"use client";
import { SITE, wa } from "@/lib/site";
import { track } from "@/lib/analytics";
import { LineIcon, type IconName } from "./Icons";

export default function Hero() {
  const devices = [
    { label: "iPhone", sub: "Display · Back glass · Battery", icon: "phone" as IconName, img: "/images/v4/iphone-product.jpg" },
    { label: "iPad", sub: "Screens & logic boards", icon: "ipad" as IconName, img: "/images/v3/ipad-repair.jpg" },
    { label: "Apple Watch", sub: "Screens · battery · sensors", icon: "watch" as IconName, img: "/images/v4/apple-watch.jpg" },
    { label: "AirPods", sub: "Battery & case repair", icon: "airpods" as IconName, img: "/images/v4/airpods-real.jpg" },
    { label: "MacBook & Mac", sub: "Display · battery · boards", icon: "macbook" as IconName, img: "/images/v3/macbook-pro.jpg" },
  ];

  return (
    <section id="top" className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-[var(--bg-alt)]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-[var(--bg-alt)] to-white" />
        <div className="orb left-[8%] top-[8%] h-[520px] w-[520px] bg-[var(--accent)]" />
        <div className="orb orb-reverse bottom-[6%] right-[6%] h-[460px] w-[460px] bg-[var(--accent2)]" />
        <div className="aurora-layer left-[20%] top-[15%] h-[300px] w-[300px] bg-[#ff2d55]/40" />
        <div className="aurora-layer right-[18%] bottom-[18%] h-[350px] w-[350px] bg-[#ff9500]/40" />
        <div className="absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-black/[0.03]" />
        <div className="chip-float left-[12%] top-[22%] h-3 w-3 bg-[#ff2d55]/40" />
        <div className="chip-float right-[15%] top-[18%] h-2 w-2 bg-[#ff9500]/50" />
        <div className="chip-float left-[30%] bottom-[22%] h-2.5 w-2.5 bg-[#ff2d55]/30" />
        <div className="chip-float right-[28%] bottom-[28%] h-4 w-4 bg-[#ff9500]/30" />
        <div className="chip-float left-[45%] top-[10%] h-2 w-2 bg-[var(--accent2)]/40" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1200px] px-6 pb-16 pt-32 text-center lg:px-8">
        <div className="mb-7 inline-flex items-center gap-2 rounded-full glass px-5 py-2 text-[13px] font-semibold text-[var(--text)]">
          <span className="flex h-2 w-2 rounded-full bg-green-500"><span className="h-full w-full animate-ping rounded-full bg-green-500 opacity-70" /></span>
          Open now · {SITE.area} · {SITE.hours.split("(")[0].trim()}
        </div>

        <h1 className="hero-apple font-apple text-[var(--text)]">
          Apple repairs,
          <br />
          <span className="gradient-text">mastered.</span>
        </h1>

        <p className="hero-sub mt-7 font-apple">
          iPhone · iPad · AirPods · Apple Watch · MacBook. Displays, back glass, batteries,
          water damage, firmware & data recovery — done right, done fast, with a 90-day warranty.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a href="#quote" onClick={() => track("quote_started", { source: "hero" })} className="cta-dark press">
            Get Instant Estimate
            <LineIcon name="arrow-right" size={16} />
          </a>
          <a
            href={wa("Hi Red Apple Mobile Repair Store! I need help with my Apple device.")}
            target="_blank" rel="noopener noreferrer"
            onClick={() => track("whatsapp_click", { source: "hero" })}
            className="cta-outline"
          >
            <LineIcon name="whatsapp" size={16} />
            WhatsApp Us
          </a>
        </div>

        <div className="mx-auto mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[12.5px] font-medium text-[var(--text-muted)]">
          <span className="flex items-center gap-1.5"><LineIcon name="check" size={14} className="text-green-500" /> 4.9★ Google rating</span>
          <span className="flex items-center gap-1.5"><LineIcon name="check" size={14} className="text-green-500" /> 90-day warranty</span>
          <span className="flex items-center gap-1.5"><LineIcon name="check" size={14} className="text-green-500" /> Free pickup &amp; drop</span>
          <span className="flex items-center gap-1.5"><LineIcon name="check" size={14} className="text-green-500" /> Most repairs in 30 min</span>
        </div>

        {/* Device showcase with images */}
        <div className="tilt-wrap mx-auto mt-16 max-w-[900px]">
          <div className="tilt-inner grid grid-cols-2 gap-4 md:grid-cols-5">
            {devices.map((d) => (
              <div key={d.label} className="glass-card rounded-3xl overflow-hidden text-left col-span-2 md:col-span-1 group">
                <div className="relative h-28 overflow-hidden">
                  <img src={d.img} alt={d.label} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" loading="eager" decoding="async" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute bottom-2 left-2 grid h-8 w-8 place-items-center rounded-lg bg-white/20">
                    <LineIcon name={d.icon} size={16} color="#fff" />
                  </div>
                </div>
                <div className="p-4">
                  <div className="text-[14px] font-bold text-[var(--text)]">{d.label}</div>
                  <div className="mt-1 text-[11px] leading-relaxed text-[var(--text-muted)]">{d.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
