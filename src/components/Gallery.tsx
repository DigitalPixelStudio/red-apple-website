"use client";

/**
 * Gallery — the real shop, photographed.
 *
 * These are actual photos of the MG Road store and bench, not stock. That
 * matters: a repair shop's biggest objection is "is this a real place with a
 * real bench, or a guy with a laptop?" This section answers it visually.
 *
 * Interaction: click any tile to open a lightbox. Keyboard: arrows to move,
 * Escape to close. Everything is lazy-loaded and each image declares its size
 * so the grid never shifts while loading.
 */

import { useCallback, useEffect, useState } from "react";
import { LineIcon } from "./Icons";

type Shot = {
  src: string;
  alt: string;
  caption: string;
  tag: "Store" | "Bench" | "Repair";
  wide?: boolean;
  tall?: boolean;
};

const SHOTS: Shot[] = [
  {
    src: "/images/gallery/store-front.jpg",
    alt: "Red Apple Mobile Repair shop entrance on MG Road, Bengaluru",
    caption: "Walk in through the glass door on MG Road",
    tag: "Store",
    tall: true,
  },
  {
    src: "/images/gallery/workbench.jpg",
    alt: "Micro-soldering bench with laser and rework stations",
    caption: "The bench — laser, rework station, microscope",
    tag: "Bench",
    wide: true,
  },
  {
    src: "/images/gallery/ipad-board.jpg",
    alt: "iPad logic board being repaired at component level",
    caption: "iPad logic board, mid board-level repair",
    tag: "Repair",
    wide: true,
  },
  {
    src: "/images/gallery/before-after.jpg",
    alt: "iPhone before and after back glass repair",
    caption: "Back glass: before and after",
    tag: "Repair",
    wide: true,
  },
  {
    src: "/images/gallery/interior.jpg",
    alt: "Inside the workshop with iMac and MacBook diagnostics",
    caption: "Diagnostics desk",
    tag: "Store",
    wide: true,
  },
  {
    src: "/images/gallery/orange-wall.jpg",
    alt: "Orange iPhone-shaped mirror on the shop wall",
    caption: "The orange wall",
    tag: "Store",
    tall: true,
  },
  {
    src: "/images/gallery/logo-counter.jpg",
    alt: "Red Apple counter signage",
    caption: "The counter",
    tag: "Store",
    tall: true,
  },
  {
    src: "/images/gallery/signage.jpg",
    alt: "Red Apple Mobile Repair signage board",
    caption: "Where Repair Meets Connectivity",
    tag: "Store",
  },
  {
    src: "/images/gallery/waiting-area.jpg",
    alt: "Customer waiting area with a see-through workshop",
    caption: "Waiting area, see-through workshop",
    tag: "Store",
    wide: true,
  },
];

const TAG_COLOR: Record<Shot["tag"], string> = {
  Store: "bg-[var(--orange)]/12 text-[var(--cosmic-deep)]",
  Bench: "bg-black/[0.06] text-[var(--text)]",
  Repair: "bg-[var(--accent)]/10 text-[var(--accent)]",
};

export default function Gallery() {
  const [open, setOpen] = useState<number | null>(null);

  const close = useCallback(() => setOpen(null), []);
  const next = useCallback(() => setOpen((i) => (i === null ? null : (i + 1) % SHOTS.length)), []);
  const prev = useCallback(
    () => setOpen((i) => (i === null ? null : (i - 1 + SHOTS.length) % SHOTS.length)),
    []
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close, next, prev]);

  return (
    <section id="gallery" className="relative py-20">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-8">
        <div className="mx-auto max-w-[680px] text-center">
          <span className="kicker">Inside The Store</span>
          <h2 className="head-gradient mt-3 font-apple text-[clamp(1.9rem,4vw,2.8rem)] font-extrabold leading-[1.08] tracking-tight">
            The bench your phone actually goes on
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-[var(--text-muted)]">
            No stock photos. This is the shop on MG Road — the laser, the rework
            station, the microscope, and the people using them.
          </p>
        </div>

        {/* grid */}
        <div className="mt-11 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {SHOTS.map((s, i) => (
            <button
              key={s.src}
              onClick={() => setOpen(i)}
              aria-label={`Open photo: ${s.caption}`}
              className={`hv-zoom hv-lift group relative overflow-hidden rounded-[18px] border border-black/[0.06] bg-[var(--bg-alt)] text-left ${
                s.wide ? "sm:col-span-2" : ""
              } ${s.tall ? "row-span-2" : ""}`}
            >
              <img
                src={s.src}
                alt={s.alt}
                width={s.wide ? 1400 : 700}
                height={s.tall ? 1400 : 700}
                loading="lazy"
                decoding="async"
                className={`w-full object-cover ${s.tall ? "h-full min-h-[220px]" : "aspect-[4/3]"}`}
              />
              {/* caption veil — solid gradient, no backdrop blur */}
              <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/72 via-black/28 to-transparent px-3.5 pb-3 pt-10">
                <span className="block text-[11.5px] font-bold leading-snug text-white">
                  {s.caption}
                </span>
              </span>
              <span
                className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[9.5px] font-extrabold uppercase tracking-[0.12em] ${TAG_COLOR[s.tag]}`}
              >
                {s.tag}
              </span>
            </button>
          ))}
        </div>

        <p className="mt-7 text-center text-[12px] text-[var(--text-muted)]">
          Open 10:00 AM – 12:00 AM, all seven days · one minute from Halasuru Metro
        </p>
      </div>

      {/* lightbox */}
      {open !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={SHOTS[open].caption}
          onClick={close}
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/88 p-4"
        >
          <button
            onClick={close}
            aria-label="Close"
            className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/12 text-white transition-colors hover:bg-white/22"
          >
            <LineIcon name="close" size={18} color="#fff" />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            aria-label="Previous photo"
            className="absolute left-3 grid h-11 w-11 place-items-center rounded-full bg-white/12 text-white transition-colors hover:bg-white/22 sm:left-6"
          >
            <LineIcon name="arrow-right" size={18} color="#fff" className="rotate-180" />
          </button>

          <figure onClick={(e) => e.stopPropagation()} className="max-h-[86vh] max-w-[1100px]">
            <img
              src={SHOTS[open].src}
              alt={SHOTS[open].alt}
              className="max-h-[78vh] w-auto rounded-[14px] object-contain"
            />
            <figcaption className="mt-3 text-center text-[12.5px] font-semibold text-white/85">
              {SHOTS[open].caption}
              <span className="ml-2 text-white/45">
                {open + 1} / {SHOTS.length}
              </span>
            </figcaption>
          </figure>

          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            aria-label="Next photo"
            className="absolute right-3 grid h-11 w-11 place-items-center rounded-full bg-white/12 text-white transition-colors hover:bg-white/22 sm:right-6"
          >
            <LineIcon name="arrow-right" size={18} color="#fff" />
          </button>
        </div>
      )}
    </section>
  );
}
