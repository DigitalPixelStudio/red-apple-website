"use client";
import Reveal from "./Reveal";
import { SITE } from "@/lib/site";
import { track } from "@/lib/analytics";
import { LineIcon } from "./Icons";

function SolidStars({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} className="text-[#FFB800]">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#FFB800" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </span>
      ))}
    </div>
  );
}

export default function ReviewsSection() {
  return (
    <section id="reviews" className="section-apple bg-white">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-8">
        <Reveal className="text-center">
          <p className="font-apple text-[12.5px] font-bold uppercase tracking-[0.22em] text-[var(--accent)]">Reviews</p>
          <h2 className="section-title font-apple mt-3 text-[var(--text)]">Trusted by <span className="gradient-text">Halasuru &amp; Bengaluru.</span></h2>
          <p className="section-subtitle mx-auto mt-5">A 4.9 Google rating from 1,099 reviews. Read the original customer feedback directly on Google.</p>
        </Reveal>

        {/* Main rating card */}
        <Reveal className="mx-auto mt-12 max-w-[720px]">
          <div className="rounded-[30px] glass p-8 text-center md:p-10">
            <div className="flex items-center justify-center gap-1">
              <SolidStars count={5} />
            </div>
            <div className="mt-3 font-apple text-[54px] font-extrabold leading-none tracking-tight">{SITE.rating}</div>
            <div className="mt-2 text-[14px] font-semibold text-[var(--text)]">Based on {SITE.ratingCount} Google reviews</div>
            <a
              href={SITE.mapsReviewUrl} target="_blank" rel="noopener noreferrer"
              onClick={() => track("map_click", { source: "reviews" })}
              className="cta-outline mt-8 press"
            >
              <LineIcon name="star" size={16} />
              Read Google Reviews
            </a>
          </div>
        </Reveal>

        <Reveal className="mx-auto mt-8 max-w-[720px] text-center" delay={100}>
          <p className="text-sm leading-relaxed text-[var(--text-muted)]">
            We link to the original Google Business Profile so visitors can read genuine, current customer feedback at its source.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
