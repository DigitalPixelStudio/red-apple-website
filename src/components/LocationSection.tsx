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
    <section id="visit" className="section-apple relative overflow-hidden cta-light">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="orb left-[8%] top-[-22%] h-[360px] w-[360px] bg-[var(--accent)] opacity-[0.10]" />
        <div className="orb orb-reverse bottom-[-24%] right-[6%] h-[380px] w-[380px] bg-[var(--accent2)] opacity-[0.10]" />
      </div>

      <div className="relative mx-auto max-w-[1200px] px-6 lg:px-8">
        <Reveal className="text-center">
          <span className="kicker">Visit us</span>
          <h2 className="head-gradient breath-heading section-title font-apple mt-3 text-[var(--text)]">
            Easy to Reach. <span className="topic-gradient">Right in Halasuru.</span>
          </h2>
          <p className="section-subtitle mx-auto mt-5">
            Metro Pillar No 125, No.38 — next to Vignesh Dresses, opposite Bhadra
            Landmark, Halasuru, Bengaluru 560008. One minute from Halasuru Metro.
            Walk in, or book a free pickup.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
            <a
              href={SITE.gmbUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("map_click", { source: "location_verified_badge" })}
              className="gmb-badge press"
            >
              <LineIcon name="verified" size={13} />
              {SITE.addressVerified}
            </a>
            <span className="gmb-badge">
              <LineIcon name="star" size={13} />
              {SITE.rating} · {SITE.ratingCount} Google reviews
            </span>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-6 lg:grid-cols-5">
          <Reveal className="lg:col-span-2">
            <div className="flex h-full flex-col gap-4">
              {INFO.map((it) => (
                <div
                  key={it.label}
                  className="tile-wash glass-premium flex items-start gap-4 rounded-[22px] p-5"
                >
                  <span className="icon-glow grid h-11 w-11 shrink-0 place-items-center rounded-2xl">
                    <LineIcon name={it.icon} size={20} />
                  </span>
                  <div className="min-w-0">
                    <div className="text-[12.5px] font-extrabold uppercase tracking-wide text-[var(--text)]">
                      {it.label}
                    </div>
                    <div className="mt-0.5 text-[13px] leading-relaxed text-[var(--text-light)]">
                      {it.value}
                    </div>
                    {it.label === "Address" && (
                      <span className="gmb-badge mt-2">
                        <LineIcon name="verified" size={12} />
                        {SITE.addressVerified}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              <div className="mt-auto flex flex-wrap gap-2.5">
                <a
                  href={SITE.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track("map_click", { source: "location" })}
                  className="cta-dark flex-1 text-center text-[13px] press"
                >
                  <LineIcon name="directions" size={16} />
                  Get Directions
                </a>
                <a
                  href={wa("Hi! I'd like directions / free pickup.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track("whatsapp_click", { source: "location" })}
                  className="cta-primary flex-1 text-center text-[13px] press"
                >
                  <LineIcon name="whatsapp" size={16} />
                  WhatsApp
                </a>
              </div>
            </div>
          </Reveal>

          <Reveal delay={100} className="lg:col-span-3">
            <div className="glass-premium h-full overflow-hidden rounded-[28px]">
              <iframe
                src={SITE.mapsEmbed}
                width="100%" height="460" style={{ border: 0 }} allowFullScreen loading="lazy"
                className="block h-full w-full" title="Red Apple Mobile Repair Store location — Google Maps"
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
