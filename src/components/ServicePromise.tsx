/**
 * ServicePromise — replaces the old "AI Concierge" promo block.
 *
 * The concierge section was explaining a chatbot. That sells the tool, not the
 * repair. This section sells the thing a customer actually worries about:
 * what happens between handing over a ₹40,000 phone and getting it back.
 *
 * Four concrete promises, each one something the shop can be held to.
 */

import Reveal from "./Reveal";
import { LineIcon, type IconName } from "./Icons";

type Promise_ = {
  icon: IconName;
  step: string;
  title: string;
  body: string;
};

const PROMISES: Promise_[] = [
  {
    icon: "clipboard",
    step: "01",
    title: "Free diagnosis, in writing",
    body:
      "We open the device, find the actual fault, and put a fixed figure in front of you before touching a screwdriver. If you walk away at that point, you pay nothing.",
  },
  {
    icon: "lock",
    step: "02",
    title: "Your data never leaves your phone",
    body:
      "We never ask for your passcode, Apple ID or any account password. Repairs are done on the hardware, not your data. If a repair needs a wipe, we tell you first and get your written permission.",
  },
  {
    icon: "eye",
    step: "03",
    title: "You watch the whole repair",
    body:
      "Photo and video on WhatsApp at every stage — board out, part fitted, tested. The workshop has glass walls for walk-ins. Nothing happens to your device that you cannot see.",
  },
  {
    icon: "shield",
    step: "04",
    title: "Tested, then warrantied",
    body:
      "Every device passes 32 checkpoints before hand-back — touch, True Tone, Face ID, cameras, sensors, charging, thermals. Then you get 90 days of cover, and 6 months on battery and display.",
  },
];

export default function ServicePromise() {
  return (
    <section id="promise" className="relative overflow-hidden py-20">
      <div className="fx-aurora" />
      <div className="relative mx-auto max-w-[1140px] px-6 lg:px-8">
        <Reveal className="mx-auto max-w-[680px] text-center">
          <span className="kicker">The Handover</span>
          <h2 className="head-gradient mt-3 font-apple text-[clamp(1.9rem,4vw,2.8rem)] font-extrabold leading-[1.08] tracking-tight">
            What happens after you hand it over
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-[var(--text-muted)]">
            Most people have never watched a phone get repaired. Here is exactly what
            we do, in order, so there are no surprises at collection.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {PROMISES.map((p, i) => (
            <Reveal key={p.step} delay={i * 70}>
              <article className="figma-card hv-lift hv-icon group h-full p-6 sm:p-7">
                <div className="mb-4 flex items-center justify-between">
                  <span className="grid h-11 w-11 place-items-center rounded-[14px] bg-[var(--orange)]/10">
                    <LineIcon
                      name={p.icon}
                      size={21}
                      color="var(--cosmic-deep)"
                      className="hv-icon-target"
                    />
                  </span>
                  <span className="fx-badge">{p.step}</span>
                </div>
                <h3 className="text-[16.5px] font-extrabold leading-snug tracking-tight text-[var(--text)]">
                  {p.title}
                </h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-[var(--text-muted)]">
                  {p.body}
                </p>
              </article>
            </Reveal>
          ))}
        </div>

        {/* what you should bring */}
        <Reveal delay={200}>
          <div className="figma-card-lg mt-5 grid gap-6 p-6 sm:grid-cols-3 sm:p-7">
            <div>
              <div className="footer-head" style={{ color: "var(--cosmic-deep)" }}>
                Bring with you
              </div>
              <ul className="mt-3 space-y-2 text-[13px] text-[var(--text-muted)]">
                <li className="flex gap-2"><span className="fx-tick mt-0.5">✓</span> The device, charged if it still turns on</li>
                <li className="flex gap-2"><span className="fx-tick mt-0.5">✓</span> Any old parts, if a shop already tried</li>
                <li className="flex gap-2"><span className="fx-tick mt-0.5">✓</span> Your purchase bill, if you have it</li>
              </ul>
            </div>
            <div>
              <div className="footer-head" style={{ color: "var(--cosmic-deep)" }}>
                Leave at home
              </div>
              <ul className="mt-3 space-y-2 text-[13px] text-[var(--text-muted)]">
                <li className="flex gap-2"><span className="fx-tick mt-0.5">✓</span> Your passcode — we never need it</li>
                <li className="flex gap-2"><span className="fx-tick mt-0.5">✓</span> The SIM and memory card</li>
                <li className="flex gap-2"><span className="fx-tick mt-0.5">✓</span> Any cash advance — you pay after diagnosis</li>
              </ul>
            </div>
            <div>
              <div className="footer-head" style={{ color: "var(--cosmic-deep)" }}>
                How long it takes
              </div>
              <ul className="mt-3 space-y-2 text-[13px] text-[var(--text-muted)]">
                <li className="flex gap-2"><span className="fx-tick mt-0.5">✓</span> Display or battery — about an hour</li>
                <li className="flex gap-2"><span className="fx-tick mt-0.5">✓</span> Back glass — about an hour</li>
                <li className="flex gap-2"><span className="fx-tick mt-0.5">✓</span> Board-level — 2 to 3 days, quoted first</li>
              </ul>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
