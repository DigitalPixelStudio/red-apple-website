"use client";
import Reveal from "./Reveal";
import { SITE } from "@/lib/site";
import { track } from "@/lib/analytics";
import { LineIcon } from "./Icons";

const RATINGS = [
  { label: "Quality of service", val: 5 },
  { label: "Expert knowledge", val: 5 },
  { label: "Transparent pricing", val: 5 },
  { label: "Speed of repair", val: 5 },
];

const REVIEWS = [
  {
    name: "Rajesh K.",
    role: "iPhone 16 Pro Max Owner",
    text: "Cracked my screen at Halasuru Metro. Walked in, got it fixed in 35 minutes. True Tone works perfectly. Best Apple repair in Bengaluru, hands down.",
    stars: 5,
    photo: "/images/v4/reviewer-1.jpg",
  },
  {
    name: "Priya M.",
    role: "MacBook Pro Owner",
    text: "Liquid damage on my MacBook Pro. Other shops said motherboard dead. Red Apple repaired the board-level issue and saved my data. Outstanding expertise.",
    stars: 5,
    photo: "/images/v4/reviewer-2.jpg",
  },
  {
    name: "Amit S.",
    role: "Apple Watch Ultra Owner",
    text: "Cracked Watch Ultra screen replaced in 20 minutes. Price was 35% less than Apple Store. Genuine parts, genuine service. Highly recommend.",
    stars: 5,
    photo: "/images/v4/reviewer-3.jpg",
  },
  {
    name: "Sneha R.",
    role: "iPad Pro Owner",
    text: "iPad Pro back glass replacement was seamless. They kept me updated throughout. Free pickup and drop made it even easier. Five stars across the board.",
    stars: 5,
    photo: "/images/v4/reviewer-4.jpg",
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
          <p className="font-apple text-[12.5px] font-bold uppercase tracking-[0.22em] text-[var(--accent)]">Reviews</p>
          <h2 className="section-title font-apple mt-3 text-[var(--text)]">Trusted by <span className="gradient-text">Halasuru &amp; Bengaluru.</span></h2>
          <p className="section-subtitle mx-auto mt-5">A 4.9 star rating on Google from hundreds of Apple device owners — read the real thing below.</p>
        </Reveal>

        {/* Main rating card */}
        <Reveal className="mx-auto mt-12 max-w-[720px]">
          <div className="rounded-[30px] glass p-8 text-center md:p-10">
            <div className="flex items-center justify-center gap-1">
              <SolidStars count={5} />
            </div>
            <div className="mt-3 font-apple text-[54px] font-extrabold leading-none tracking-tight">{SITE.rating}</div>
            <div className="mt-2 text-[14px] font-semibold text-[var(--text)]">Based on {SITE.ratingCount}+ Google reviews</div>
            <div className="mx-auto mt-6 max-w-[420px] space-y-3 text-left">
              {RATINGS.map((r) => (
                <div key={r.label} className="flex items-center gap-3">
                  <span className="w-40 shrink-0 text-[12.5px] font-semibold text-[var(--text-light)]">{r.label}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-black/[0.06]">
                    <div className="h-full rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent2)]" style={{ width: "100%" }} />
                  </div>
                  <span className="text-[12.5px] font-bold text-[var(--text)]">{r.val}.0</span>
                </div>
              ))}
            </div>
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

        {/* Individual reviews with profile photos */}
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {REVIEWS.map((r, i) => (
            <Reveal key={i} delay={i * 80}>
              <div className="rounded-[22px] bg-[var(--bg-alt)] p-6 border border-black/[0.04] hover:shadow-lg transition-all duration-300 hover-pop spotlight-card">
                <div className="flex items-center gap-3">
                  <img
                    src={r.photo}
                    alt={r.name}
                    className="h-12 w-12 rounded-full object-cover ring-2 ring-white shadow-sm"
                    loading="lazy"
                  />
                  <div>
                    <div className="text-[15px] font-bold text-[var(--text)]">{r.name}</div>
                    <div className="text-[12px] text-[var(--text-muted)]">{r.role}</div>
                  </div>
                </div>
                <SolidStars count={r.stars} />
                <p className="mt-3 text-[13px] leading-relaxed text-[var(--text-light)]">{r.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
