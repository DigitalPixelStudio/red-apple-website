"use client";
import Reveal from "./Reveal";
import { SITE, wa } from "@/lib/site";
import { track } from "@/lib/analytics";
import { LineIcon, type IconName } from "./Icons";

const INFO = [
  { icon: "pin" as IconName, label: "Address", value: SITE.address },
  { icon: "clock" as IconName, label: "Timings", value: SITE.hours },
  { icon: "metro" as IconName, label: "Metro", value: "Halasuru Metro — 1 min walk" },
  { icon: "car" as IconName, label: "Pickup & drop", value: "Free across Bengaluru" },
];

export default function LocationSection() {
  return (
    <section id="visit" className="section-apple bg-[var(--bg-alt)]">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-8">
        <Reveal className="text-center">
          <p className="font-apple text-[12.5px] font-bold uppercase tracking-[0.22em] text-[var(--accent)]">Visit us</p>
          <h2 className="section-title font-apple mt-3 text-[var(--text)]">Easy to reach. <span className="gradient-text">Right in Halasuru.</span></h2>
          <p className="section-subtitle mx-auto mt-5">One minute from Halasuru Metro, opposite Bhadra Landmark on Mahatma Gandhi Road. Walk in — or order a free pickup.</p>
        </Reveal>

        <div className="mt-14 grid gap-6 lg:grid-cols-5">
          <Reveal className="lg:col-span-2">
            <div className="flex h-full flex-col gap-4">
              {INFO.map((it) => (
                <div key={it.label} className="flex items-start gap-4 rounded-[22px] bg-white p-5 shadow-sm">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[var(--accent)]/10 to-[var(--accent2)]/10">
                    <LineIcon name={it.icon} size={20} className="text-[var(--accent)]" />
                  </span>
                  <div>
                    <div className="text-[12.5px] font-bold text-[var(--text)]">{it.label}</div>
                    <div className="mt-0.5 text-[13px] leading-relaxed text-[var(--text-light)]">{it.value}</div>
                  </div>
                </div>
              ))}
              <div className="mt-auto flex flex-wrap gap-2.5">
                <a href={SITE.mapsUrl} target="_blank" rel="noopener noreferrer"
                  onClick={() => track("map_click", { source: "location" })}
                  className="cta-dark flex-1 text-center text-[13px] press">
                  <LineIcon name="directions" size={16} />
                  Get Directions
                </a>
                <a href={wa("Hi! I'd like directions / free pickup.")} target="_blank" rel="noopener noreferrer"
                  onClick={() => track("whatsapp_click", { source: "location" })}
                  className="cta-primary flex-1 text-center text-[13px] press">
                  <LineIcon name="whatsapp" size={16} />
                  WhatsApp
                </a>
              </div>
            </div>
          </Reveal>

          <Reveal delay={100} className="lg:col-span-3">
            <div className="overflow-hidden rounded-[28px] border border-black/[0.06] bg-white shadow-lg">
              <iframe
                src={SITE.mapsEmbed}
                width="100%" height="460" style={{ border: 0 }} allowFullScreen loading="lazy"
                className="block w-full" title="Red Apple Mobile Repair Store location — Google Maps"
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
