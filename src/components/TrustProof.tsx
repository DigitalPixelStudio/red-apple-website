"use client";
import Reveal from "./Reveal";
import SmartImg from "./SmartImg";
import { SITE } from "@/lib/site";
import { LineIcon, type IconName } from "./Icons";

type Cert = {
  icon: IconName;
  title: string;
  desc: string;
  wash: "tile-wash" | "tile-wash-violet" | "tile-wash-mint";
};

const CERTS: Cert[] = [
  {
    icon: "spark",
    title: "Experienced Repair Technicians",
    desc: "9+ years of Apple-device repair experience, including component-level diagnostics.",
    wash: "tile-wash",
  },
  {
    icon: "shield",
    title: "6 Months Written Warranty",
    desc:
      "6 Months of cover on all repairs, displays, batteries and glass. Claim with your invoice — diagnosis and the covered repair are handled on the same record. Not covered: physical or accidental damage, liquid damage, a repair by another shop after us, or normal wear and tear. Motherboard repairs excluded.",
    wash: "tile-wash-violet",
  },
  {
    icon: "key",
    title: "Data Privacy Promise",
    desc: "Your passcode stays with you. We never access your data, photos or accounts.",
    wash: "tile-wash-mint",
  },
  {
    icon: "cpu",
    title: "OEM-Grade Parts",
    desc: "Genuine-quality panels, batteries, and components — with full disclosure on sourcing.",
    wash: "tile-wash-violet",
  },
  {
    icon: "zap",
    title: "Same-Day Repairs",
    desc: "Most screen, battery, and port repairs completed in 30–60 minutes while you wait.",
    wash: "tile-wash",
  },
  {
    icon: "care",
    title: "Doorstep Pickup & Drop",
    desc: "Pickup across Bengaluru; free for eligible repairs above ₹2,999. WhatsApp to confirm coverage.",
    wash: "tile-wash-mint",
  },
];

export default function TrustProof() {
  return (
    <section className="proof-section section-apple bg-white">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-8">
        <Reveal className="text-center">
          <p className="kicker">Why trust us</p>
          <h2 className="proof-heading breath-heading font-apple section-title mt-3 text-[var(--text)]">
            Built on <span className="topic-gradient">Trust &amp; Precision.</span>
          </h2>
          <p className="section-subtitle mx-auto mt-5">
            Rated {SITE.rating} from {SITE.ratingCount} Google reviews. Here is what
            our service is built on — no invented awards, no staged testimonials.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-stretch">
          {/* Premium 3 × 2 proof grid on varied light washes. */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CERTS.map((c, i) => (
              <Reveal key={c.title} delay={i * 50}>
                <article
                  className={`${c.wash} proof-card breathe-card hv-lift group flex h-full flex-col rounded-[22px] border border-white/90 p-5 shadow-[0_18px_46px_-32px_rgba(124,45,18,0.4)]`}
                >
                  <span className="proof-icon icon-glow mb-5 grid h-14 w-14 place-items-center">
                    <LineIcon name={c.icon} size={26} />
                  </span>
                  <h3 className="proof-card-title breath-heading font-apple text-[15.5px] font-extrabold leading-snug tracking-tight text-[var(--text)]">
                    {c.title}
                  </h3>
                  <p className="mt-2 text-[12.5px] leading-relaxed text-[var(--text-muted)]">
                    {c.desc}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>

          {/* Glass-motion image panel — a real technician at the Red Apple bench. */}
          <Reveal delay={100}>
            <div className="proof-image glass-image-shell relative h-full min-h-[340px] overflow-hidden rounded-[24px] border border-white/90 shadow-[0_18px_46px_-30px_rgba(124,45,18,0.4)]">
              <SmartImg
                src="/images/gallery/tech-under-red-apple-sign.webp"
                alt="Red Apple technician at the repair bench under the store sign"
                width={900}
                height={1200}
                className="h-full w-full object-cover"
              />
              <div className="proof-image-overlay absolute inset-x-0 bottom-0 bg-gradient-to-t from-white/95 via-white/75 to-transparent px-5 pb-5 pt-14">
                <span className="gmb-badge">
                  <LineIcon name="verified" size={13} /> {SITE.addressVerified}
                </span>
                <p className="mt-2 text-[12px] font-semibold text-[var(--text)]">
                  {SITE.rating} · {SITE.ratingCount} Google reviews
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-[var(--text-muted)]">
                  {SITE.address}
                </p>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Link to the original source instead of publishing unverified testimonials. */}
        <Reveal className="mt-12 flex flex-col items-center gap-4 text-center" delay={120}>
          <span className="gmb-badge">
            <LineIcon name="gmb" size={13} /> {SITE.addressVerified}
          </span>
          <p className="mx-auto max-w-xl text-sm leading-relaxed text-[var(--text-muted)]">
            See the original customer reviews and the current rating directly on our
            Google Business Profile. Reviews stay at their source — we never write or
            edit them here.
          </p>
          <a
            href={SITE.gmbUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="cta-outline press inline-flex items-center gap-2"
          >
            <LineIcon name="gmb" size={16} />
            Read Google reviews
          </a>
        </Reveal>
      </div>
    </section>
  );
}
