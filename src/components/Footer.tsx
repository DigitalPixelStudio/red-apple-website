"use client";
import Link from "next/link";
import { SITE, wa, SERVICE_PAGES } from "@/lib/site";
import { track } from "@/lib/analytics";
import { LineIcon, type IconName } from "./Icons";

const SOCIALS = [
  { label: "Instagram", icon: "instagram" as IconName, href: SITE.instagramUrl || "#" },
  { label: "Facebook", icon: "facebook" as IconName, href: SITE.facebookUrl || "#" },
  { label: "YouTube", icon: "youtube" as IconName, href: SITE.youtubeUrl || "#" },
  { label: "Telegram", icon: "telegram" as IconName, href: SITE.telegramUrl || "#" },
  { label: "Google Business", icon: "gmb" as IconName, href: SITE.gmbUrl },
];

export default function Footer() {
  return (
    <footer className="bg-[#161617] text-white">
      <div className="mx-auto max-w-[1200px] px-6 py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-[var(--cta-dark)] shadow-lg animate-float">
                <LineIcon name="apple" size={24} color="#fff" />
              </span>
              <div>
                <div className="font-apple text-[18px] font-extrabold tracking-tight animate-brand-breathe">Red Apple</div>
                <div className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[var(--accent2)]">Mobile Repair Store</div>
              </div>
            </div>
            <p className="mt-4 text-[13px] leading-relaxed text-white/50">The Apple repair specialist of Halasuru, Bengaluru. iPhone, iPad, Watch, AirPods, Mac &amp; MacBook — hardware, software and data recovery.</p>
          </div>

          {/* Services */}
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">Services</div>
            <ul className="mt-5 space-y-2.5">
              {SERVICE_PAGES.slice(0, 7).map((s) => (
                <li key={s.slug}>
                  <Link href={`/services/${s.slug}`} className="text-[13px] text-white/60 transition-colors hover:text-white">{s.title}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">Company</div>
            <ul className="mt-5 space-y-2.5">
              <li><Link href="/quote" className="text-[13px] text-white/60 hover:text-white">Get a Quote</Link></li>
              <li><Link href="/repair-status" className="text-[13px] text-white/60 hover:text-white">Repair Status</Link></li>
              <li><Link href="/contact" className="text-[13px] text-white/60 hover:text-white">Contact</Link></li>
              <li><a href="#faq" className="text-[13px] text-white/60 hover:text-white">FAQ</a></li>
              <li><a href={SITE.justdialUrl || "#"} target="_blank" rel="noopener noreferrer" className="text-[13px] text-white/60 hover:text-white">JustDial</a></li>
              <li><Link href="/sitemap.xml" className="text-[13px] text-white/60 hover:text-white">Sitemap</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">Contact</div>
            <ul className="mt-5 space-y-3 text-[13px] text-white/60">
              <li className="flex items-start gap-2"><LineIcon name="pin" size={14} className="mt-0.5 shrink-0" /> {SITE.address}</li>
              <li className="flex items-center gap-2"><LineIcon name="clock" size={14} className="shrink-0" /> {SITE.hours}</li>
              <li><a href={SITE.phoneHref} className="hover:text-white flex items-center gap-2"><LineIcon name="call" size={14} /> {SITE.phone}</a></li>
              <li><a href={wa("Hi Red Apple Mobile Repair Store!")} target="_blank" rel="noopener noreferrer" className="font-semibold text-white/80 hover:text-white flex items-center gap-2"><LineIcon name="whatsapp" size={14} /> WhatsApp</a></li>
            </ul>
            <div className="mt-5 flex flex-wrap gap-2">
              {SOCIALS.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" title={s.label}
                  className="grid h-10 w-10 place-items-center rounded-full bg-white/[0.08] transition-all hover:-translate-y-0.5 hover:bg-white/20">
                  <LineIcon name={s.icon} size={18} />
                </a>
              ))}
              {/* JustDial icon */}
              <a href={SITE.justdialUrl || "#"} target="_blank" rel="noopener noreferrer" title="JustDial"
                className="grid h-10 w-10 place-items-center rounded-full bg-white/[0.08] transition-all hover:-translate-y-0.5 hover:bg-white/20">
                <span className="text-[10px] font-bold text-white">JD</span>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-14 border-t border-white/[0.08] pt-7">
          <div className="flex flex-col items-center justify-between gap-3 text-[12px] text-white/40 sm:flex-row">
            <div>&copy; {new Date().getFullYear()} Red Apple Mobile Repair Store &middot; Halasuru, Bengaluru 560008</div>
            <div className="text-[11px]">Apple is a trademark of Apple Inc. We are an independent repair service — not affiliated with Apple Inc.</div>
          </div>
          <div className="mt-4 text-center text-[11px] text-white/25">
            Built with care by <span className="font-semibold text-white/40">Pixel Forge</span> &mdash; DigitalPixelStudio
          </div>
        </div>
      </div>
    </footer>
  );
}
