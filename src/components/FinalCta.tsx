"use client";
import SmartImg from "@/components/SmartImg";
import Reveal from "./Reveal";
import { SITE } from "@/lib/site";
import { track } from "@/lib/analytics";
import { LineIcon } from "./Icons";

export default function FinalCta() {
  return (
    <section className="final-cta-section cta-light relative overflow-hidden py-24">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="orb left-[12%] top-[-26%] h-[380px] w-[380px] bg-[var(--accent)] opacity-[0.13]" />
        <div className="orb orb-reverse bottom-[-26%] right-[8%] h-[380px] w-[380px] bg-[var(--accent2)] opacity-[0.12]" />
        <div className="chip-float left-[20%] top-[28%] h-3 w-3 bg-[var(--accent)]/40" />
        <div className="chip-float right-[18%] bottom-[24%] h-2 w-2 bg-[var(--accent2)]/45" />
        <div className="chip-float left-[42%] top-[14%] h-2 w-2 bg-[var(--accent)]/30" />
      </div>

      <div className="relative mx-auto max-w-[900px] px-6 text-center lg:px-8">
        <Reveal>
          <div className="relative mx-auto mb-7 w-fit">
            <div className="glass-premium grid h-20 w-20 place-items-center rounded-[26px] shadow-xl shadow-[var(--accent)]/15">
              <SmartImg
                src="/logo.png"
                alt={`${SITE.name} logo`}
                width={60}
                height={60}
                priority
                className="h-[60px] w-[60px] rounded-[20%] object-contain"
              />
            </div>
            <span className="absolute -right-3 -top-2 grid h-9 w-9 place-items-center rounded-full bg-white text-[var(--accent)] shadow-md">
              <LineIcon name="spark" size={17} />
            </span>
          </div>

          <span className="final-cta-kicker kicker">Apple repair · Halasuru, Bengaluru</span>
          <h2 className="final-cta-heading breath-heading font-apple text-[clamp(2rem,5vw,3.6rem)] font-extrabold leading-[1.14] tracking-tight text-[var(--text)]">
            Your Apple Device,<br /><span className="topic-gradient">Fixed Right.</span>
          </h2>
          <p className="final-cta-copy font-apple mx-auto mt-6 max-w-[560px] text-[15px] font-medium leading-relaxed text-[var(--text-muted)]">
            Tell us the device and the fault. We&rsquo;ll send a fixed estimate and a
            convenient slot — usually within minutes.
          </p>
          <p className="final-cta-signature mt-4 font-apple text-[13px] font-extrabold tracking-[0.16em] text-[var(--text)]">
            Apple Device Repairs, <span>Perfected.</span>
          </p>
          <div className="mt-5 flex justify-center">
            <span className="gmb-badge">
              <LineIcon name="star" size={13} />
              {SITE.rating} from {SITE.ratingCount} Google reviews
            </span>
          </div>

          <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="#quote"
              onClick={() => track("quote_started", { source: "final_cta" })}
              className="cta-primary press"
            >
              Get Instant Estimate
              <LineIcon name="arrow-right" size={16} />
            </a>
            <a
              href={SITE.phoneHref}
              onClick={() => track("call_click", { source: "final_cta" })}
              className="cta-outline press"
            >
              <LineIcon name="call" size={16} />
              {SITE.phone}
            </a>
          </div>

          <p className="mt-7 text-[12.5px] font-semibold text-[var(--text-muted)]">
            Free diagnosis · No hidden charges · 6 Months repair warranty
          </p>
        </Reveal>
      </div>
    </section>
  );
}
