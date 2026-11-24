"use client";

import Reveal from "./Reveal";

const VIDEO_ID = "GIkJEVruhdU";

export default function StudioVideo() {
  return (
    <section
      id="studio-video"
      aria-labelledby="studio-video-title"
      className="section-apple relative overflow-hidden bg-[var(--bg-alt)]"
    >
      <div className="pointer-events-none absolute inset-0 red-blob opacity-70" aria-hidden="true" />
      <div className="relative mx-auto max-w-[1180px] px-6 lg:px-8">
        <Reveal className="mx-auto max-w-[760px] text-center">
          <p className="font-apple text-[12.5px] font-bold uppercase tracking-[0.22em] text-[var(--accent)]">
            A closer look at Red Apple
          </p>
          <h2
            id="studio-video-title"
            className="head-gradient section-title mt-3 font-apple text-[var(--text)]"
          >
            Inside Our <span className="gradient-text">Halasuru Repair Studio</span>
          </h2>
          <p className="section-subtitle mx-auto mt-5">
            Step inside our repair centre near MG Road Metro, Halasuru, Bengaluru.
            Meet the place where our technicians diagnose, restore and care for your devices.
          </p>
        </Reveal>

        <Reveal delay={100} className="mt-10 md:mt-14">
          <div className="relative isolate overflow-hidden rounded-[24px] border border-black/[0.08] bg-[#111113] shadow-[0_28px_80px_rgba(0,0,0,0.16)] md:rounded-[32px]">
            <div className="relative aspect-video w-full">
              <iframe
                className="absolute inset-0 h-full w-full"
                src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}?rel=0&modestbranding=1&playsinline=1`}
                title="Red Apple Mobile Repair — Halasuru repair studio, Bengaluru"
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
          <div className="mt-4 flex flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
            <p className="text-[12px] font-medium tracking-wide text-[var(--text-muted)]">
              RED APPLE MOBILE REPAIR · HALASURU, BENGALURU
            </p>
            <a
              href={`https://www.youtube.com/watch?v=${VIDEO_ID}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-4 py-2 text-[12px] font-semibold text-[var(--text)] transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
            >
              Watch on YouTube <span aria-hidden="true">↗</span>
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
