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
import SmartImg from "./SmartImg";
import { LineIcon, type IconName } from "./Icons";

type Promise_ = {
  icon: IconName;
  step: string;
  title: string;
  body: string;
  wash: "tile-wash" | "tile-wash-violet" | "tile-wash-mint";
};

const PROMISES: Promise_[] = [
  {
    icon: "clipboard",
    step: "01",
    title: "Free Diagnosis, in Writing",
    body:
      "We open the device, find the actual fault, and put a fixed figure in front of you before touching a screwdriver. If you walk away at that point, you pay nothing.",
    wash: "tile-wash",
  },
  {
    icon: "lock",
    step: "02",
    title: "Your Data Never Leaves Your Phone",
    body:
      "We never ask for your passcode, Apple ID or any account password. Repairs are done on the hardware, not your data. If a repair needs a wipe, we tell you first and get your written permission.",
    wash: "tile-wash-mint",
  },
  {
    icon: "eye",
    step: "03",
    title: "You Watch the Whole Repair",
    body:
      "You get CRM-driven WhatsApp updates at every stage — received, diagnosis, quote approved, repair, quality check and ready for handover — whether you walked in or booked free doorstep pickup. After the restore or repair, you get the final repair status and a professional handover. You never need to call us to ask where your device is.",
    wash: "tile-wash-violet",
  },
  {
    icon: "shield",
    step: "04",
    title: "Tested, Then Warrantied",
    body:
      "Every device is checked before hand-back — touch, True Tone, Face ID, cameras, sensors, charging and thermals. You get a 6-month repair warranty on all repairs, displays, batteries and glass. Claim it with your invoice; diagnosis and the covered repair are handled together. Motherboard repairs are excluded.",
    wash: "tile-wash",
  },
];

export default function ServicePromise() {
  return (
    <section id="promise" className="relative overflow-hidden py-20">
      <div className="fx-aurora" />
      <div className="relative mx-auto max-w-[1200px] px-6 lg:px-8">
        <Reveal className="mx-auto max-w-[720px] text-center">
          <span className="kicker">The Handover</span>
          <h2 className="breath-heading mt-3 font-apple text-[clamp(1.9rem,4vw,2.8rem)] font-extrabold leading-[1.08] tracking-tight text-[var(--text)]">
            What Happens After You Hand It Over
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-[var(--text-muted)]">
            Most people have never watched a phone get repaired. Here is exactly what
            we do, in order, so there are no surprises at collection.
          </p>
        </Reveal>

        {/* Two real workshop panels with a slow glass sweep. */}
        <div className="mt-12 grid gap-4 md:grid-cols-2">
          <Reveal>
            <div className="glass-image-shell relative h-full min-h-[230px] overflow-hidden rounded-[26px] border border-white/85 shadow-[0_18px_46px_-30px_rgba(124,45,18,0.35)]">
              <SmartImg
                src="/images/v5/ipad-handover.jpg"
                alt="A repaired iPad being handed back to a customer at Red Apple"
                width={1200}
                height={800}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-white/95 via-white/70 to-transparent px-5 pb-5 pt-14">
                <span className="gmb-badge">
                  <LineIcon name="verified" size={13} /> Professional handover
                </span>
              </div>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <div className="glass-image-shell relative h-full min-h-[230px] overflow-hidden rounded-[26px] border border-white/85 shadow-[0_18px_46px_-30px_rgba(124,45,18,0.35)]">
              <SmartImg
                src="/images/v5/macbook-pro-latest.jpg"
                alt="MacBook Pro on the repair bench at Red Apple"
                width={1200}
                height={800}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-white/95 via-white/70 to-transparent px-5 pb-5 pt-14">
                <span className="gmb-badge">
                  <LineIcon name="gmb" size={13} /> Apple devices, in-house
                </span>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Premium four-step flow. */}
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PROMISES.map((p, i) => (
            <Reveal key={p.step} delay={i * 70}>
              <article
                className={`${p.wash} hv-lift hv-icon group flex h-full flex-col rounded-[24px] border border-white/90 p-6 shadow-[0_18px_46px_-32px_rgba(124,45,18,0.4)]`}
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="icon-glow grid h-12 w-12 place-items-center rounded-[16px]">
                    <LineIcon name={p.icon} size={23} className="hv-icon-target" />
                  </span>
                  <span className="fx-badge">{p.step}</span>
                </div>
                <h3 className="breath-heading text-[16px] font-extrabold leading-snug tracking-tight text-[var(--text)]">
                  {p.title}
                </h3>
                <p className="mt-2 text-[13px] leading-relaxed text-[var(--text-muted)]">
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
              <div className="kicker">Bring with you</div>
              <ul className="mt-3 space-y-2 text-[13px] text-[var(--text-muted)]">
                <li className="flex gap-2"><span className="fx-tick mt-0.5">✓</span> The device, charged if it still turns on</li>
                <li className="flex gap-2"><span className="fx-tick mt-0.5">✓</span> Any old parts, if a shop already tried</li>
                <li className="flex gap-2"><span className="fx-tick mt-0.5">✓</span> Your purchase bill, if you have it</li>
              </ul>
            </div>
            <div>
              <div className="kicker">Leave at home</div>
              <ul className="mt-3 space-y-2 text-[13px] text-[var(--text-muted)]">
                <li className="flex gap-2"><span className="fx-tick mt-0.5">✓</span> Your passcode — we never need it</li>
                <li className="flex gap-2"><span className="fx-tick mt-0.5">✓</span> The SIM and memory card</li>
                <li className="flex gap-2"><span className="fx-tick mt-0.5">✓</span> Any cash advance — you pay after diagnosis</li>
              </ul>
            </div>
            <div>
              <div className="kicker">How long it takes</div>
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
