"use client";
import Reveal from "./Reveal";
import QuoteWizard from "./QuoteWizard";

export default function QuoteSection() {
  return (
    <section id="quote" className="section-apple relative overflow-hidden bg-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[400px] w-[700px] -translate-x-1/2 rounded-full bg-[var(--accent)]/[0.05] blur-[150px]" />
      </div>
      <div className="relative mx-auto max-w-[1200px] px-6 lg:px-8">
        <Reveal className="text-center">
          <p className="font-apple text-[12.5px] font-bold uppercase tracking-[0.22em] text-[var(--accent)]">Smart estimate</p>
          <h2 className="section-title font-apple mt-3 text-[var(--text)]">Get your estimate in <span className="gradient-text">30 seconds.</span></h2>
          <p className="section-subtitle mx-auto mt-5">No forms to fill from memory — just tap your device, model and issue. We reply on WhatsApp with the price and a repair slot.</p>
        </Reveal>
        <Reveal className="mt-12" delay={100}>
          <QuoteWizard />
        </Reveal>
      </div>
    </section>
  );
}
