"use client";
import Reveal from "./Reveal";
import QuoteWizard from "./QuoteWizard";
import SmartImg from "./SmartImg";
import { LineIcon } from "./Icons";
import { SITE } from "@/lib/site";

export default function QuoteSection() {
  return (
    <section id="quote" className="section-apple relative overflow-hidden bg-white">
      <div className="pointer-events-none absolute inset-0">
        {/* soft wash via gradient, not filter:blur â€” same look, no per-frame cost */}
        <div
          className="absolute left-1/2 top-0 h-[400px] w-[700px] -translate-x-1/2"
          style={{ background: "radial-gradient(closest-side, rgba(255,45,85,0.05), transparent)" }}
        />
      </div>
      <div className="relative mx-auto max-w-[1240px] px-6 lg:px-8">
        <Reveal className="text-center">
          <p className="font-apple text-[12.5px] font-bold uppercase tracking-[0.22em] text-[var(--accent)]">Smart Estimate</p>
          <h2 className="section-title font-apple mt-3 text-[var(--text)]">
            Get Your Estimate in <span className="gradient-text">30 Seconds.</span>
          </h2>
          <p className="section-subtitle mx-auto mt-5">
            No forms to fill from memory â€” just tap your device, model and issue.
            We reply on WhatsApp with the price and a repair slot.
          </p>
        </Reveal>

        <div className="mt-12 grid items-start gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)]">
          <Reveal delay={90}>
            <QuoteWizard />
          </Reveal>

          {/* animated device + live price chips, desktop only */}
          <Reveal delay={180} className="hidden lg:block">
            <aside className="estimate-visual" aria-hidden="true">
              <div className="estimate-visual-glow" />
              {/* the stage crops the photo to fill the card, so the column never
                  ends in a band of empty cream below the caption */}
              <div className="estimate-stage">
                <SmartImg
                  src="/images/v5/iphone-pro-max-burgundy.jpg"
                  alt=""
                  width={640}
                  height={900}
                  className="estimate-phone"
                />
                <span className="estimate-tag estimate-tag-1">
                  <LineIcon name="display" size={12} /> Front Glass â‚¹16,500
                </span>
                <span className="estimate-tag estimate-tag-2">
                  <LineIcon name="clock" size={12} /> Display ~45 min
                </span>
                <span className="estimate-tag estimate-tag-3">
                  <LineIcon name="shield" size={12} /> 6-Month Warranty
                </span>
              </div>
              <div className="estimate-visual-foot">
                <strong>Real prices, no surprises.</strong>
                <span>{SITE.hours}</span>
              </div>
            </aside>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
