"use client";
import Reveal from "./Reveal";
import { SITE } from "@/lib/site";
import { track } from "@/lib/analytics";
import { LineIcon, type IconName } from "./Icons";

/** Honest trust facts and invitations — never invented customer quotes. */
const REVIEW_FACTS: { topic: string; detail: string; icon: IconName }[] = [
  {
    topic: `Verified rating ${SITE.rating}`,
    detail: "Our public Google rating, shown exactly as Google displays it.",
    icon: "star",
  },
  {
    topic: `${SITE.ratingCount} Google reviews`,
    detail: "The review count on our Google Business Profile.",
    icon: "users",
  },
  {
    topic: "Read current reviews",
    detail: "See what customers actually wrote, straight from the source.",
    icon: "external",
  },
  {
    topic: "Verified Address",
    detail: "Google My Business & Maps Verified Address in Halasuru.",
    icon: "gmb",
  },
  {
    topic: "Reviews stay at source",
    detail: "We never edit, stage or publish testimonials on this site.",
    icon: "shield",
  },
  {
    topic: "Open the original",
    detail: "One tap takes you to our original Google profile.",
    icon: "link",
  },
  {
    topic: "Always current",
    detail: "Google shows the live rating and the newest reviews.",
    icon: "refresh",
  },
  {
    topic: "Honest by design",
    detail: "We link out instead of inventing a testimonial feed.",
    icon: "info",
  },
];

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
          <p className="kicker">Reviews</p>
          <h2 className="section-title font-apple mt-3 text-[var(--text)]">
            Trusted by <span className="topic-gradient">Halasuru &amp; Bengaluru.</span>
          </h2>
          <p className="section-subtitle mx-auto mt-5">
            Genuine, current reviews live on Google. Here is the verified rating — read
            the original feedback at its source.
          </p>
        </Reveal>

        {/* Large rating hero — numbers only, no invented quotes. */}
        <Reveal className="mt-12">
          <div className="glass-premium relative mx-auto max-w-[820px] overflow-hidden rounded-[32px] p-8 text-center md:p-12">
            <span className="gmb-badge">
              <LineIcon name="verified" size={13} /> {SITE.addressVerified}
            </span>
            <div className="mt-5 flex items-center justify-center gap-1">
              <SolidStars count={5} />
            </div>
            <div className="breath-heading mt-4 font-apple text-[clamp(3.5rem,9vw,5.5rem)] font-extrabold leading-none tracking-tight text-[var(--text)]">
              {SITE.rating}
            </div>
            <div className="mt-3 font-apple text-[18px] font-extrabold text-[var(--text)]">
              {SITE.ratingCount} Verified Google Reviews
            </div>
            <p className="mx-auto mt-3 max-w-[540px] text-[13.5px] leading-relaxed text-[var(--text-muted)]">
              We link straight to the original Google Business Profile. We never write,
              edit or stage testimonials on this site — the real reviews stay where
              customers left them.
            </p>
            <a
              href={SITE.gmbUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("map_click", { source: "reviews-hero" })}
              className="cta-outline press mt-7 inline-flex items-center gap-2"
            >
              <LineIcon name="gmb" size={16} />
              Read the original reviews on Google
              <LineIcon name="arrow-right" size={15} />
            </a>
          </div>
        </Reveal>

        {/* Continuous, pausable marquee of honest source cards (duplicated for a seamless loop). */}
        <div
          className="relative mt-12 overflow-hidden"
          style={{
            maskImage:
              "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
          }}
        >
          <div className="review-track">
            {[...REVIEW_FACTS, ...REVIEW_FACTS].map((fact, i) => {
              const isDuplicate = i >= REVIEW_FACTS.length;
              return (
                <a
                  key={i}
                  href={SITE.gmbUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-hidden={isDuplicate}
                  tabIndex={isDuplicate ? -1 : undefined}
                  onClick={() => track("map_click", { source: "reviews-marquee" })}
                  className="review-card group block p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="icon-glow grid h-10 w-10 place-items-center rounded-2xl">
                      <LineIcon name={fact.icon} size={19} />
                    </span>
                    <LineIcon
                      name="arrow-right"
                      size={16}
                      className="text-[var(--text-muted)] transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </div>
                  <h3 className="mt-5 font-apple text-[16px] font-extrabold leading-snug text-[var(--text)]">
                    <span className="topic-gradient">{fact.topic}</span>
                  </h3>
                  <p className="mt-2 text-[12.5px] leading-relaxed text-[var(--text-muted)]">
                    {fact.detail}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wide text-[var(--orange-deep)]">
                    <LineIcon name="gmb" size={12} /> Google reviews
                  </span>
                </a>
              );
            })}
          </div>
        </div>

        <Reveal className="mt-8 text-center" delay={100}>
          <p className="mx-auto max-w-[720px] text-[13px] leading-relaxed text-[var(--text-muted)]">
            Every genuine, current review lives on Google — visit our Google Business
            Profile to read them in full and see the rating as it stands today.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
