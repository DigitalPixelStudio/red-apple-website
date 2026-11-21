"use client";

import { useMemo, useState } from "react";
import Reveal from "./Reveal";
import SmartImg from "./SmartImg";
import { LineIcon } from "./Icons";
import { SITE, wa } from "@/lib/site";
import { track } from "@/lib/analytics";
import {
  GLASS_PRICE_MIN,
  GLASS_PRICE_MAX,
  GLASS_WARRANTY_MONTHS,
  glassRowFor,
  glassRowsBySeries,
} from "@/lib/glass-pricing";

const inr = (n: number) => "₹" + n.toLocaleString("en-IN");

const SERIES = glassRowsBySeries();

const MACHINES = [
  {
    name: "TBK OCA Laminating Vacuum Compressed Hydraulic Press",
    short: "OCA vacuum lamination",
    img: "/images/machines/tbk-oca-press.webp",
    width: 610,
    height: 600,
    alt: "TBK OCA laminating vacuum compressed hydraulic press with pressure gauges on the Red Apple bench",
    desc: "Aligns and bonds the new front glass to your original OLED under vacuum and controlled hydraulic pressure — a factory-level optical lamination, not a hand-pressed repair.",
    specs: ["Vacuum + hydraulic pressure", "Optical-grade OCA bond", "Original OLED retained"],
    icon: "quality" as const,
  },
  {
    name: "TBK 90-Litre High-Pressure Bubble Remover Chamber",
    short: "Zero-bubble autoclave",
    img: "/images/machines/tbk-bubble-chamber.webp",
    width: 580,
    height: 960,
    alt: "TBK 90-litre high-pressure bubble remover chamber with round pressure door at the Halasuru lab",
    desc: "Cures the OCA under high pressure inside a 90-litre chamber, eliminating microscopic air bubbles for a crystal-clear, zero-defect finish with permanent adhesion.",
    specs: ["90-litre pressure chamber", "Zero-bubble finish", "Permanent adhesion"],
    icon: "shield" as const,
  },
  {
    name: "TBK-958 Cold UV Purple Laser",
    short: "Cold UV laser separation",
    img: "/images/machines/tbk-uv-laser.webp",
    width: 940,
    height: 1420,
    alt: "TBK-958 cold UV purple laser machine with illuminated work chamber at Red Apple Mobile Repair",
    desc: "Separates the front bezel and removes back glass with low-temperature UV laser precision, leaving the logic board and internal components completely untouched by heat.",
    specs: ["Cold UV purple laser", "Zero thermal stress", "Precision bezel separation"],
    icon: "lightning" as const,
  },
];

const BENEFITS = [
  { icon: "shield" as const, title: GLASS_WARRANTY_MONTHS + "-month hardware warranty", sub: "On every glass restoration" },
  { icon: "lock" as const, title: "Zero-password privacy", sub: "We never ask for your passcode" },
  { icon: "scan" as const, title: "Apple Diagnostic Mode", sub: "Post-repair testing, no account access" },
  { icon: "display" as const, title: "Original OLED retained", sub: "Touch and True Tone preserved" },
];

const HASHTAGS = [
  "#PremiumMobileRepair",
  "#iPhoneGlassReplacement",
  "#FactoryLevelRepair",
  "#OLEDRepair",
  "#TBK958",
  "#ColdUVLaser",
  "#OCALamination",
  "#BengaluruTech",
  "#Halasuru",
  "#DataPrivacy",
  "#AppleDiagnosticMode",
  "#ZeroPasswordPolicy",
];

export default function GlassRestoration() {
  const [selected, setSelected] = useState("iPhone 17 Pro Max");
  const [query, setQuery] = useState("");

  const row = glassRowFor(selected) ?? SERIES[0].rows[0];
  const priceLabel = inr(row.price);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SERIES;
    return SERIES.map((group) => ({
      series: group.series,
      rows: group.rows.filter((r) => r.model.toLowerCase().includes(q)),
    })).filter((group) => group.rows.length > 0);
  }, [query]);

  const quoteHref = wa(
    `Hi Red Apple, I'd like front glass restoration for my ${row.model}. The published price is ${priceLabel}. Please confirm eligibility and the next step.`
  );

  return (
    <section id="glass" className="section-apple glass-lab relative overflow-hidden bg-[var(--bg-alt)]">
      {/* composited-only ambience: two slow transforms + a static grid */}
      <div className="glass-lab-bg" aria-hidden="true">
        <span className="glass-lab-orb one" />
        <span className="glass-lab-orb two" />
        <span className="glass-lab-grid" />
      </div>

      <div className="relative mx-auto max-w-[1200px] px-6 lg:px-8">
        <Reveal className="text-center">
          <p className="font-apple text-[12.5px] font-bold uppercase tracking-[0.22em] text-[var(--accent)]">
            Front glass restoration · Halasuru lab
          </p>
          <h2 className="head-gradient section-title font-apple mt-3 text-[var(--text)]">
            Keep the Original OLED. <span className="gradient-text">Restore the Glass.</span>
          </h2>
          <p className="section-subtitle mx-auto mt-5">
            We do not just replace screens — we restore them. Using specialised TBK machinery, we bond new glass to your
            original display and preserve the OLED, touch sensitivity and True Tone. Factory-level finish, checked before
            hand-back.
          </p>
        </Reveal>

        {/* ---------------- price + result ---------------- */}
        <div className="mt-14 grid items-start gap-6 lg:grid-cols-[1.02fr_0.98fr]">
          <Reveal>
            <div className="glass-price-card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="glass-eyebrow">Select your iPhone</p>
                  <label className="sr-only" htmlFor="glass-model">Choose an iPhone model to see its front glass restoration price</label>
                  <select
                    id="glass-model"
                    className="glass-select"
                    value={row.model}
                    onChange={(e) => setSelected(e.target.value)}
                  >
                    {SERIES.map((group) => (
                      <optgroup key={group.series} label={group.series}>
                        {group.rows.map((r) => (
                          <option key={r.model} value={r.model}>{r.model}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
                <span className="glass-warranty-badge">
                  <LineIcon name="shield" size={13} />
                  {GLASS_WARRANTY_MONTHS}-month warranty
                </span>
              </div>

              <div className="glass-price-display" aria-live="polite">
                <span className="glass-price-currency">₹</span>
                <span key={row.model} className="glass-price-value">{row.price.toLocaleString("en-IN")}</span>
              </div>
              <p className="mt-2 text-[13px] font-semibold text-[var(--text-muted)]">
                {row.model} · front glass restoration only
              </p>

              <p className="glass-eligibility">
                <LineIcon name="info" size={15} />
                <span>
                  Eligibility is confirmed on inspection. If the OLED or touch layer itself is damaged, we recommend a
                  full display replacement instead.
                </span>
              </p>

              <a
                href={quoteHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track("whatsapp_click", { source: "glass_lab", model: row.model })}
                className="cta-orange mt-5 flex w-full items-center justify-center gap-2.5 rounded-2xl px-6 py-4 text-[14.5px] font-bold"
              >
                <LineIcon name="whatsapp" size={18} color="#fff" />
                Book {row.model} glass restoration
              </a>

              <div className="glass-price-foot">
                <span>Published range {inr(GLASS_PRICE_MIN)} – {inr(GLASS_PRICE_MAX)}</span>
                <span className="inline-flex items-center gap-1.5">
                  <LineIcon name="star" size={12} color="var(--orange)" />
                  {SITE.rating} · {SITE.ratingCount} Google reviews
                </span>
              </div>
            </div>
          </Reveal>

          <Reveal delay={90}>
            <div className="glass-result-card">
              <div className="glass-result-media">
                <SmartImg
                  src="/images/craft/before-after-screen.webp"
                  alt="Two iPhone displays side by side: one with shattered front glass and one restored with flawless glass"
                  width={1600}
                  height={900}
                />
                <span className="glass-result-tag before">Before</span>
                <span className="glass-result-tag after">After</span>
                <span className="glass-scanline" aria-hidden="true" />
              </div>
              <div className="p-6 sm:p-7">
                <h3 className="font-apple text-[20px] font-bold text-[var(--text)]">What Changes - and What Does Not</h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {BENEFITS.map((b) => (
                    <div key={b.title} className="glass-benefit">
                      <span className="glass-benefit-icon">
                        <LineIcon name={b.icon} size={16} color="var(--orange)" />
                      </span>
                      <span>
                        <span className="block text-[13px] font-bold text-[var(--text)]">{b.title}</span>
                        <span className="block text-[11.5px] text-[var(--text-muted)]">{b.sub}</span>
                      </span>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-[12.5px] leading-relaxed text-[var(--text-muted)]">
                  Modern OLED panels are bonded to the glass. A cheap “screen replacement” swaps the whole assembly and
                  often loses True Tone. Glass restoration keeps your original panel and replaces only the damaged outer
                  glass.
                </p>
              </div>
            </div>
          </Reveal>
        </div>

        {/* ---------------- full price board ---------------- */}
        <Reveal className="mt-8">
          <div className="glass-board">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="glass-eyebrow">Full price list</p>
                <h3 className="font-apple text-[22px] font-bold text-[var(--text)]">Every Listed iPhone, <span className="one-glance-red">One Glance</span></h3>
                <p className="mt-1.5 text-[13px] text-[var(--text-muted)]">
                  Tap any model to load its price above. Fixed glass-restoration price, parts and labour included.
                </p>
              </div>
              <div className="glass-search">
                <LineIcon name="search" size={15} color="var(--text-muted)" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Find your model…"
                  aria-label="Search iPhone models"
                  className="w-full bg-transparent text-[13px] text-[var(--text)] outline-none placeholder:text-[var(--text-muted)]"
                />
              </div>
            </div>

            <div className="glass-board-scroll mt-5">
              {filtered.length === 0 && (
                <p className="py-6 text-center text-[13px] text-[var(--text-muted)]">
                  No listed model matches “{query}”. Send us the model on WhatsApp and we will confirm the glass price.
                </p>
              )}
              {filtered.map((group) => (
                <div key={group.series} className="glass-series">
                  <p className="glass-series-title">{group.series}</p>
                  <div className="glass-series-grid">
                    {group.rows.map((r) => {
                      const active = r.model === row.model;
                      return (
                        <button
                          key={r.model}
                          type="button"
                          onClick={() => {
                            setSelected(r.model);
                            track("glass_price_select", { model: r.model });
                          }}
                          aria-pressed={active}
                          className={`glass-model-chip${active ? " is-active" : ""}`}
                        >
                          <span className="truncate">{r.model}</span>
                          <span className="glass-chip-price">{inr(r.price)}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* ---------------- machines ---------------- */}
        <div className="mt-20">
          <Reveal className="text-center">
            <p className="font-apple text-[12.5px] font-bold uppercase tracking-[0.22em] text-[var(--accent)]">
              The equipment behind the finish
            </p>
            <h2 className="head-gradient section-title font-apple mt-3 text-[var(--text)]">
              Three Machines. <span className="gradient-text">One Original Display.</span>
            </h2>
            <p className="section-subtitle mx-auto mt-5">
              This is not a heat-gun and a suction cup. Glass restoration runs through a calibrated TBK line, photographed
              here on our Halasuru bench.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {MACHINES.map((m, i) => (
              <Reveal key={m.name} delay={i * 90}>
                <article className="glass-machine ring-card">
                  <div className="glass-machine-media">
                    <SmartImg
                      src={m.img}
                      alt={m.alt}
                      width={m.width}
                      height={m.height}
                    />
                    <span className="glass-machine-scan" aria-hidden="true" />
                    <span className="glass-machine-index">0{i + 1}</span>
                    <span className="glass-machine-tag">
                      <LineIcon name={m.icon} size={12} color="var(--orange)" />
                      {m.short}
                    </span>
                  </div>
                  <div className="p-6">
                    <h3 className="font-apple text-[16.5px] font-bold leading-snug text-[var(--text)]">{m.name}</h3>
                    <p className="mt-3 text-[13px] leading-relaxed text-[var(--text-muted)]">{m.desc}</p>
                    <ul className="mt-4 flex flex-wrap gap-1.5">
                      {m.specs.map((s) => (
                        <li key={s} className="glass-spec">{s}</li>
                      ))}
                    </ul>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-6 text-center">
            <p className="text-[11.5px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
              Photographed in our Halasuru lab · TBK OCA press · 90-litre bubble chamber · TBK-958 cold UV laser
            </p>
          </Reveal>
        </div>

        {/* ---------------- hashtags + close ---------------- */}
        <Reveal className="mt-14">
          <div className="glass-close">
            <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1.5 text-[11.5px] font-semibold text-[var(--text-muted)]">
              {HASHTAGS.map((tag) => (
                <span key={tag} className="glass-hashtag">{tag}</span>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <a
                href={quoteHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track("whatsapp_click", { source: "glass_lab_footer", model: row.model })}
                className="cta-dark press"
              >
                <LineIcon name="whatsapp" size={16} />
                Get a glass-restoration quote
              </a>
              <a href={SITE.phoneHref} className="cta-outline press">
                <LineIcon name="call" size={15} />
                Call the lab
              </a>
            </div>
            <p className="mt-4 text-center text-[12px] text-[var(--text-muted)]">
              Store open 10 AM – 12 AM midnight, all 7 days. Customer assistance on WhatsApp 24/7. Walk-ins welcome.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
