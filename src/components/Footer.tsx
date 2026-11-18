"use client";
import BrandMark from "@/components/BrandMark";
import MotionToggle from "@/components/MotionToggle";
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
    <footer className="site-footer text-white">
      <div className="footer-topline" />
      <span className="footer-beam" aria-hidden="true" />
      <span className="footer-aurora" aria-hidden="true" />
      <div className="mx-auto max-w-[1200px] px-6 py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-12 xl:gap-x-10">
          {/* Brand */}
          <div className="lg:col-span-3">
            <div className="flex items-center gap-2.5">
              <span className="footer-brand-live grid h-12 w-12 place-items-center rounded-xl bg-white shadow-lg">
                <BrandMark size={34} />
              </span>
              <div>
                <div className="font-apple text-[18px] font-extrabold tracking-tight animate-brand-breathe">Red Apple</div>
                <div className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[var(--accent2)]">Mobile Repair Store</div>
              </div>
            </div>
            <p className="mt-4 text-[13.5px] leading-relaxed text-white/70">Apple repairs, perfected. The Apple repair specialist of Halasuru, Bengaluru — iPhone, iPad, Watch, AirPods, Mac &amp; MacBook, hardware, software and data recovery.</p>
          </div>

          {/* Services */}
          <div className="lg:col-span-2">
            <div className="footer-head">Services</div>
            <ul className="mt-5 space-y-2.5">
              {SERVICE_PAGES.slice(0, 7).map((s) => (
                <li key={s.slug}>
                  <Link href={`/services/${s.slug}`} className="text-[13px] text-white/75 transition-colors hover:text-white">{s.title}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="lg:col-span-2">
            <div className="footer-head">Company</div>
            <ul className="mt-5 space-y-2.5">
              <li><Link href="/quote" className="text-[13px] text-white/75 hover:text-white">Get a Quote</Link></li>
              <li><Link href="/repair-status" className="text-[13px] text-white/75 hover:text-white">Repair Status</Link></li>
              <li><Link href="/contact" className="text-[13px] text-white/75 hover:text-white">Contact</Link></li>
              <li><a href="#faq" className="text-[13px] text-white/75 hover:text-white">FAQ</a></li>
              <li><a href={SITE.justdialUrl || "#"} target="_blank" rel="noopener noreferrer" className="text-[13px] text-white/75 hover:text-white">JustDial</a></li>
              <li><Link href="/sitemap.xml" className="text-[13px] text-white/75 hover:text-white">Sitemap</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="lg:col-span-2">
            <div className="footer-head">Legal</div>
            <ul className="mt-5 space-y-2.5">
              <li><Link href="/privacy" className="text-[13px] text-white/75 hover:text-white">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-[13px] text-white/75 hover:text-white">Terms of Service</Link></li>
              <li><Link href="/refund-policy" className="text-[13px] text-white/75 hover:text-white">Refund &amp; Warranty</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-3">
            <div className="footer-head">Contact</div>
            <ul className="mt-5 space-y-3 text-[13px] text-white/75">
              <li className="flex items-start gap-2"><LineIcon name="pin" size={14} className="mt-0.5 shrink-0" /> {SITE.address}</li>
              <li className="flex items-center gap-2"><LineIcon name="clock" size={14} className="shrink-0" /> {SITE.hours}</li>
              <li><a href={SITE.phoneHref} className="hover:text-white flex items-center gap-2"><LineIcon name="call" size={14} /> {SITE.phone}</a></li>
              <li><a href={wa("Hi Red Apple Mobile Repair Store!")} target="_blank" rel="noopener noreferrer" className="font-semibold text-white/80 hover:text-white flex items-center gap-2"><LineIcon name="whatsapp" size={14} /> WhatsApp</a></li>
            </ul>
            <div className="mt-5 flex flex-wrap gap-2">
              {SOCIALS.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" title={s.label}
                  className="footer-chip h-10 w-10 text-white/75">
                  <LineIcon name={s.icon} size={18} />
                </a>
              ))}
              {/* JustDial icon */}
              <a href={SITE.justdialUrl || "#"} target="_blank" rel="noopener noreferrer" title="JustDial"
                className="footer-chip h-10 w-10 text-white/75">
                <span className="text-[10px] font-bold text-white">JD</span>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-14 border-t border-white/[0.08] pt-7">
          <div className="flex flex-col items-center justify-between gap-4 text-[12px] text-white/60 sm:flex-row">
            <div>&copy; {new Date().getFullYear()} Red Apple Mobile Repair Store &middot; Halasuru, Bengaluru 560008</div>
            <MotionToggle />
          </div>
          <div className="mt-4 text-center text-[11.5px] leading-relaxed text-white/45">Apple is a trademark of Apple Inc. We are an independent repair service — not affiliated with Apple Inc.</div>
          <div className="mt-4 text-center text-[11px] text-white/45">
            Built with care by{" "}
            <a
              href="https://wa.me/919620024812?text=Hi%20Pixel%20Forge%20Studio%2C%20I%27d%20like%20a%20website%20like%20this%20one."
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("whatsapp_click", { location: "footer_credit" })}
              className="font-semibold text-white/70 hover:text-[var(--cosmic-hi)]"
            >
              Pixel Forge Studio
            </a>
            {" "}&middot;{" "}
            <a
              href="https://wa.me/919620024812?text=Hi%20Pixel%20Forge%20Studio%2C%20I%27d%20like%20a%20website%20like%20this%20one."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-semibold text-white/70 hover:text-[var(--cosmic-hi)]"
            >
              <span className="footer-chip h-5 w-5 rounded-[6px] text-[#25D366]">
                <LineIcon name="whatsapp" size={11} color="#25D366" />
              </span>
              96200 24812
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
