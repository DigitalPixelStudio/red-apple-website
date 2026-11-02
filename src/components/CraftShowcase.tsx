"use client";

/**
 * CraftShowcase — the proof section.
 *
 * Sequence is deliberate and follows the customer's own doubt order:
 *   1. Before / After  — "can you actually fix it?"  (the result, first)
 *   2. The equipment   — "with what?"                (why it is not a guess)
 *   3. Website + CRM   — "how am I kept informed?"   (the invoice, the record)
 *
 * Everything lazy-loads, every image declares its intrinsic size so the grid
 * never shifts, and nothing here animates on scroll beyond a single
 * transform+opacity reveal. No blur, no filter, no canvas.
 */

import { Reveal } from "./Reveal";
import { LineIcon } from "./Icons";

type Pair = {
  src: string;
  alt: string;
  label: string;
  before: string;
  after: string;
  note: string;
};

const PAIRS: Pair[] = [
  {
    src: "/images/craft/before-after-screen.webp",
    alt: "Two iPhones side by side: one with a shattered screen, one with a flawless display after repair",
    label: "Screen replacement",
    before: "Shattered",
    after: "Flawless",
    note: "OEM-grade display, True Tone preserved, fitted the same day.",
  },
  {
    src: "/images/craft/before-after-backglass.webp",
    alt: "Two iPhone Pro backs side by side: one with cracked back glass, one restored to factory finish",
    label: "Back glass",
    before: "Cracked",
    after: "Factory finish",
    note: "Laser-separated, not chiselled. Camera module untouched.",
  },
];

type Tool = {
  src: string;
  alt: string;
  title: string;
  body: string;
};

const TOOLS: Tool[] = [
  {
    src: "/images/craft/uv-laser-station.webp",
    alt: "UV laser back-glass separation machine and a vacuum autoclave on the Red Apple bench",
    title: "UV laser separation",
    body:
      "Back glass comes off with a laser, not a heat gun and a blade. The frame stays straight and the camera glass is never in the path.",
  },
  {
    src: "/images/craft/microsolder-setup.webp",
    alt: "Stereo microscope, hot air rework station and multimeter set up for board-level repair",
    title: "Micro-soldering station",
    body:
      "Microscope, hot air, and a bench multimeter reading to three decimals. This is what board-level repair actually looks like — and why most shops send it away.",
  },
  {
    src: "/images/craft/bench-overhead-tools.webp",
    alt: "Overhead view of the repair bench with parts drawers, precision tools and open iPhones",
    title: "Organised by part, not by habit",
    body:
      "Every drawer is a different screw, bracket and flex. Nothing is fished out of a pile, so nothing gets fitted twice.",
  },
];

export default function CraftShowcase() {
  return (
    <section id="craft" className="relative py-16 sm:py-20">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-8">
        {/* ---------------------------------------------------------- header */}
        <Reveal>
          <div className="mx-auto max-w-[700px] text-center">
            <span className="kicker">The Work, Shown Plainly</span>
            <h2 className="head-gradient mt-3 font-apple text-[clamp(1.9rem,4vw,2.8rem)] font-extrabold leading-[1.08] tracking-tight">
              Before, after, and the bench in between
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-[var(--text-muted)]">
              Anyone can promise a repair. These are the two we are asked for
              most, photographed on our own bench, followed by the machines that
              make them possible.
            </p>
          </div>
        </Reveal>

        {/* ------------------------------------------------- before / after */}
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {PAIRS.map((p) => (
            <Reveal key={p.src}>
              <figure className="hv-lift overflow-hidden rounded-[20px] border border-black/[0.07] bg-[var(--bg-alt)]">
                <div className="relative">
                  <img
                    src={p.src}
                    alt={p.alt}
                    width={1800}
                    height={1050}
                    loading="lazy"
                    decoding="async"
                    className="block w-full object-cover"
                  />
                  <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/72 px-2.5 py-1 text-[9.5px] font-extrabold uppercase tracking-[0.14em] text-white">
                    {p.label}
                  </span>
                  <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-white/92 px-2.5 py-1 text-[9.5px] font-extrabold uppercase tracking-[0.14em] text-[var(--accent)]">
                    Before · After
                  </span>
                </div>
                <figcaption className="px-4 py-4">
                  <div className="flex items-center gap-2 text-[13px] font-bold">
                    <span className="text-[var(--text-muted)] line-through decoration-[var(--accent)]/50">
                      {p.before}
                    </span>
                    <span className="text-[var(--accent)]">→</span>
                    <span className="text-[var(--text)]">{p.after}</span>
                  </div>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-[var(--text-muted)]">
                    {p.note}
                  </p>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>

        {/* ------------------------------------------------------- equipment */}
        <Reveal>
          <div className="mt-16 text-center">
            <span className="kicker">Inside The Bench</span>
            <h3 className="head-gradient mt-3 font-apple text-[clamp(1.5rem,3vw,2rem)] font-extrabold leading-tight tracking-tight">
              The machines most shops do not own
            </h3>
          </div>
        </Reveal>

        <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((t) => (
            <Reveal key={t.src}>
              <article className="hv-lift h-full overflow-hidden rounded-[20px] border border-black/[0.07] bg-[var(--bg-alt)]">
                <img
                  src={t.src}
                  alt={t.alt}
                  width={1200}
                  height={1500}
                  loading="lazy"
                  decoding="async"
                  className="block aspect-[4/3] w-full object-cover"
                />
                <div className="px-4 py-4">
                  <h4 className="text-[14px] font-bold leading-snug text-[var(--text)]">
                    {t.title}
                  </h4>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-[var(--text-muted)]">
                    {t.body}
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        {/* ------------------------------------------- website + crm, wide */}
        <Reveal>
          <div className="mt-16 overflow-hidden rounded-[24px] border border-black/[0.07] bg-[var(--bg-alt)]">
            <div className="grid items-center gap-0 lg:grid-cols-[1.15fr_1fr]">
              <img
                src="/images/craft/website-crm-desk.webp"
                alt="Technician holding a phone beside a monitor showing the Red Apple website and a laptop running the repair CRM dashboard"
                width={1800}
                height={1350}
                loading="lazy"
                decoding="async"
                className="block h-full w-full object-cover lg:aspect-auto"
              />

              <div className="px-6 py-8 sm:px-9 sm:py-10">
                <span className="kicker">Every Repair, On Record</span>
                <h3 className="head-gradient mt-3 font-apple text-[clamp(1.45rem,2.6vw,1.95rem)] font-extrabold leading-tight tracking-tight">
                  Your job card lives in our CRM — and the invoice comes from it
                </h3>
                <p className="mt-3.5 text-[13.5px] leading-relaxed text-[var(--text-muted)]">
                  The moment your device is booked in, it gets a job number in a
                  CRM built for this shop. Every part fitted, every technician
                  note, every status change is logged against that number — the
                  same number on your GST invoice.
                </p>

                <ul className="mt-5 grid gap-2.5">
                  {[
                    "GST invoice generated from the CRM, not written by hand",
                    "Serial-tracked parts, so the warranty claim is one lookup",
                    "Status updates sent to you on WhatsApp at each stage",
                    "Your repair history stays on file for the next visit",
                  ].map((line) => (
                    <li
                      key={line}
                      className="flex items-start gap-2.5 text-[12.5px] leading-relaxed text-[var(--text)]"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-[6px] inline-block h-[6px] w-[6px] flex-none rounded-full bg-[var(--accent)]"
                      />
                      {line}
                    </li>
                  ))}
                </ul>

                <a
                  href="#quote"
                  className="cta-orange mt-6 inline-flex items-center justify-center gap-2.5 rounded-2xl px-7 py-3.5 text-[14px] font-bold"
                >
                  <LineIcon name="zap" size={17} color="#fff" />
                  <span>Get an instant estimate</span>
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
