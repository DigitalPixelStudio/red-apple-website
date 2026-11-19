"use client";
import Reveal from "./Reveal";
import { STATS } from "@/lib/site";
import { LineIcon, type IconName } from "./Icons";

/** The six stages our repair CRM posts to WhatsApp, in order. */
const STAGES: { label: string; icon: IconName }[] = [
  { label: "Received", icon: "box" },
  { label: "Diagnosis", icon: "scan" },
  { label: "Quote Approved", icon: "badge" },
  { label: "Repair", icon: "tool" },
  { label: "Quality Check", icon: "shield" },
  { label: "Ready For Handover", icon: "spark" },
];

export default function TrustBar() {
  return (
    <section className="relative z-10 mx-auto -mt-10 w-full max-w-[1240px] px-6 lg:px-8">
      <Reveal>
        {/* Four verified stats — one full-width, evenly aligned strip. */}
        <div className="tile-wash grid grid-cols-2 gap-y-8 rounded-[28px] border border-white/90 px-6 py-8 shadow-[0_18px_46px_-30px_rgba(124,45,18,0.35)] md:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="flex flex-col items-center text-center">
              <span className="icon-glow mb-3 grid h-11 w-11 place-items-center rounded-2xl">
                <LineIcon name={s.icon as IconName} size={20} />
              </span>
              <div className="font-apple text-[28px] font-extrabold tracking-tight text-[var(--text)]">
                {s.value}
              </div>
              <div className="mt-1 text-[12.5px] font-semibold text-[var(--text)]/80">
                {s.label}
              </div>
              <div className="mt-0.5 text-[11.5px] text-[var(--text-muted)]">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Wide "Paired" card — deliberately the exact same width as the strip. */}
        <div className="tile-wash-violet mt-5 w-full rounded-[28px] border border-white/90 p-6 shadow-[0_18px_46px_-30px_rgba(124,45,18,0.35)] md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:gap-8">
            <div className="connect-stage mx-auto shrink-0 md:mx-0" aria-hidden="true">
              <div className="connect-ring" />
              <div className="connect-ring" />
              <div className="connect-ring" />
              <div className="connect-device">
                <LineIcon name="wrench" size={24} color="#fff" />
              </div>
              <span className="connect-status">Paired</span>
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="stage-title breath-heading font-apple text-[18px] font-extrabold tracking-tight text-[var(--text)] md:text-[20px]">
                Paired — your device, tracked live
              </h3>
              <p className="mt-2 max-w-[800px] text-[12.5px] leading-relaxed text-[var(--text-muted)]">
                Red Apple sends live WhatsApp updates from our repair CRM at every
                repair stage, right through to final handover — for walk-in customers
                and for free doorstep pickup customers alike. You always know where
                your device is and what happens next, so you never need to call us
                for a status update.
              </p>

              {/* CRM progress rail: the exact stages a customer is told about. */}
              <div className="stage-rail mt-5" aria-label="Live repair stages">
                {STAGES.map((stage) => (
                  <div key={stage.label} className="stage-pill breathe-tile">
                    <span className="stage-icon icon-glow grid h-8 w-8 place-items-center">
                      <LineIcon name={stage.icon} size={16} />
                    </span>
                    <span className="stage-label font-apple">{stage.label}</span>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <span className="stage-live inline-flex items-center gap-1.5 rounded-full border border-[var(--orange)]/15 bg-white/90 px-3 py-1.5 text-[10.5px] font-bold text-[var(--cosmic-deep)]">
                  <LineIcon name="whatsapp" size={12} /> Live WhatsApp updates
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--orange)]/15 bg-white/90 px-3 py-1.5 text-[10.5px] font-bold text-[var(--cosmic-deep)]">
                  <LineIcon name="shield" size={12} /> Invoice = 6-month warranty record
                </span>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
