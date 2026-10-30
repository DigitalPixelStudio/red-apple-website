"use client";
import { useState, useEffect } from "react";
import { SITE, wa } from "@/lib/site";
import { track } from "@/lib/analytics";
import { LineIcon, type IconName } from "./Icons";
import Phone3D from "./Phone3D";

export default function Hero() {
  const devices = [
    { label: "iPhone", sub: "Display · Back glass · Battery", icon: "phone" as IconName, img: "/images/v4/iphone-product.jpg" },
    { label: "iPad", sub: "Screens & logic boards", icon: "ipad" as IconName, img: "/images/v3/ipad-repair.jpg" },
    { label: "Apple Watch", sub: "Screens · battery · sensors", icon: "watch" as IconName, img: "/images/v4/apple-watch.jpg" },
    { label: "MacBook", sub: "Logic board · keyboard · screen", icon: "macbook" as IconName, img: "/images/v3/macbook-pro.jpg" },
  ];

  /* Store hours: 10:30 – 21:00, all 7 days (IST). Computed on the client so the
     badge never claims "Open now" at 2am. Falls back to the static label during
     SSR, then corrects itself on mount — no hydration mismatch. */
  const [status, setStatus] = useState<{ open: boolean; label: string }>({
    open: true,
    label: "Open now · Bangalore · 10:00 AM – 12:00 AM",
  });

  useEffect(() => {
    const compute = () => {
      // Convert to IST regardless of the visitor's timezone
      const now = new Date();
      const ist = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
      const mins = ist.getHours() * 60 + ist.getMinutes();
      const OPEN = 10 * 60;        // 10:00
      const CLOSE = 24 * 60;       // 24:00 (midnight)
      const isOpen = mins >= OPEN && mins < CLOSE;

      if (isOpen) {
        const left = CLOSE - mins;
        const h = Math.floor(left / 60);
        const m = left % 60;
        const eta = h > 0 ? `${h}h ${m}m` : `${m}m`;
        setStatus({ open: true, label: `Open now · closes in ${eta} · 10 AM – 12 AM` });
      } else {
        setStatus({ open: false, label: `Closed now · opens 10:00 AM · all 7 days` });
      }
    };
    compute();
    const id = setInterval(compute, 60_000);   // refresh every minute
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden bg-white pt-28 pb-20">
      <div className="absolute inset-0 bg-gradient-to-b from-white via-[var(--bg-alt)] to-white" />
      <div className="orb left-[-14%] top-[-10%] h-[560px] w-[560px] bg-[var(--accent)]" />
      <div className="orb orb-reverse right-[-16%] bottom-[-12%] h-[520px] w-[520px] bg-[var(--accent2)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_65%_55%_at_50%_46%,rgba(255,255,255,0.94)_0%,rgba(255,255,255,0.72)_42%,rgba(255,255,255,0)_78%)]" />

      {/* 3D depth layer — CSS only, no WebGL, no blur filter */}
      <div className="bg-3d">
        <div className="bg-grid" />
        <div className="bg-orb-3d one" />
        <div className="bg-orb-3d two" />
        <div className="bg-orb-3d three" />
      </div>
      <div className="absolute left-1/2 top-1/2 h-[680px] w-[680px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-black/[0.025]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-semibold mb-6 tracking-wide uppercase">
          <span className={`w-2 h-2 rounded-full ${status.open ? "bg-green-500" : "bg-[var(--text-muted)]"} ${status.open ? "animate-pulse" : ""}`} />
          <span>{status.label}</span>
        </div>

        <h1 className="hero-apple font-breathe mb-6 text-balance">
          Apple repairs, <span className="hero-mastered">mastered.</span>
        </h1>
        <p className="hero-sub mb-10 text-balance">
          Component-level micro-soldering, OEM displays, and 30-minute turnarounds right here in Bangalore. Backed by our rock-solid 90-day warranty.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
          <a
            href={wa("Hi Red Apple Team, I would like to book an Apple repair consultation.")}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("whatsapp_click", { location: "hero_primary" })}
            className="cta-orange px-8 py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-3"
          >
            <LineIcon name="whatsapp" size={19} color="#fff" />
            <span>Get Instant WhatsApp Quote</span>
          </a>
          <a
            href="#estimate"
            className="px-8 py-4 rounded-2xl bg-[var(--bg-alt)] border border-[var(--border)] font-bold text-base text-[var(--text)] hover:border-[var(--orange)]/60 transition duration-300 flex items-center justify-center gap-2.5"
          >
            <LineIcon name="zap" size={18} color="var(--orange)" />
            Check Smart Estimate
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {devices.map((d) => (
            <a
              key={d.label}
              href="#estimate"
              className="spotlight-card hover-pop p-4 rounded-2xl bg-[var(--bg)] border border-[var(--border)] hover:border-[var(--accent)]/40 text-left flex items-center gap-3 group shadow-sm"
            >
              <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] shrink-0 group-hover:scale-110 transition-transform">
                <LineIcon name={d.icon} className="w-5 h-5" />
              </div>
              <div className="overflow-hidden">
                <h3 className="font-bold text-sm truncate">{d.label}</h3>
                <p className="text-[11px] text-[var(--text-muted)] truncate">{d.sub}</p>
              </div>
            </a>
          ))}
        </div>

        {/* 3D iPhone — the centrepiece */}
        <div className="mt-14 hidden sm:block">
          <Phone3D />
          <p className="mt-8 text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--orange-deep)]">
            Built for every iPhone · 11 through 17 Pro Max
          </p>
        </div>
      </div>
    </section>
  );
}
