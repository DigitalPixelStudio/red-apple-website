"use client";
import Reveal from "./Reveal";
import { track } from "@/lib/analytics";
import { LineIcon, type IconName } from "./Icons";

const CAPS = [
  { icon: "lightning" as IconName, title: "Instant answers", desc: "Repair times, what's fixable, what to do next." },
  { icon: "directions" as IconName, title: "Guided journey", desc: "Device → model → issue → right solution, step by step." },
  { icon: "chat" as IconName, title: "Human handoff", desc: "One tap connects you to a real technician on WhatsApp." },
];

export default function ConciergeLaunch() {
  const openChat = () => {
    track("ai_chat_started", { source: "section" });
    document.getElementById("concierge-open")?.click();
  };

  return (
    <section id="ai" className="section-apple bg-[var(--bg-alt)]">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-8">
        <Reveal className="text-center">
          <p className="font-apple text-[12.5px] font-bold uppercase tracking-[0.22em] text-[var(--accent)]">AI repair concierge</p>
          <h2 className="section-title font-apple mt-3 text-[var(--text)]">Meet your <span className="gradient-text">repair concierge.</span></h2>
          <p className="section-subtitle mx-auto mt-5">A smart assistant trained on how Red Apple repairs Apple devices — it guides you to the right fix and connects you to our team.</p>
        </Reveal>

        <div className="mt-12 flex flex-col items-center gap-8 lg:flex-row lg:justify-center">
          <div className="grid w-full max-w-[560px] gap-4">
            {CAPS.map((c, i) => (
              <Reveal key={c.title} delay={i * 80}>
                <div className="flex items-center gap-4 rounded-[22px] bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[var(--accent)]/10 to-[var(--accent2)]/10">
                    <LineIcon name={c.icon} size={22} className="text-[var(--accent)]" />
                  </span>
                  <div>
                    <div className="text-[14.5px] font-bold text-[var(--text)]">{c.title}</div>
                    <div className="mt-0.5 text-[12.5px] text-[var(--text-muted)]">{c.desc}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={120}>
            <div className="rounded-[30px] glass p-8 text-center">
              <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-[var(--cta-dark)] shadow-xl">
                <LineIcon name="bot" size={38} color="#fff" />
              </div>
              <h3 className="mt-6 font-apple text-[19px] font-bold text-[var(--text)]">Ask anything about your Apple device</h3>
              <p className="mx-auto mt-2 max-w-[280px] text-[13px] text-[var(--text-muted)]">Prices, parts, timing, walk-in slots — get honest answers and a human when you need one.</p>
              <button id="concierge-open" onClick={openChat} className="cta-dark mt-7 w-full press">
                <LineIcon name="bot" size={18} />
                Start AI Concierge
              </button>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
