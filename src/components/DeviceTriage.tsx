"use client";

/**
 * DeviceTriage — the three gifts, in one place.
 *
 *  1. Instant triage   — pick a device and a symptom, get the likely service,
 *                        the *published* price and the honest turnaround,
 *                        without opening a chat or waiting for a reply.
 *  2. Repair passport  — the last lookup is remembered on this device only,
 *                        so a returning visitor resumes where they stopped.
 *                        No account, no server, no tracking beyond analytics.
 *  3. Shareable estimate — one tap copies a WhatsApp-ready summary the customer
 *                        can send to a partner, an insurer or their own phone.
 *
 * Every number comes from pricing.ts / glass-pricing.ts, the same matrix the
 * quote wizard and the bot use. Nothing here invents a price.
 */

import { useEffect, useMemo, useState } from "react";
import Reveal from "./Reveal";
import { LineIcon, type IconName } from "./Icons";
import { PRICES, TURNAROUND, getPrice, inr, priceLabel } from "@/lib/pricing";
import { glassPriceFor } from "@/lib/glass-pricing";
import { wa } from "@/lib/site";
import { track } from "@/lib/analytics";

type Symptom = {
  id: string;
  label: string;
  icon: IconName;
  repair: string;
  hint?: string;
};

const SYMPTOMS: Symptom[] = [
  { id: "screen", label: "Cracked Screen", icon: "display", repair: "Front Display Replacement", hint: "Glass-only restoration may cost less if the OLED is intact." },
  { id: "battery", label: "Battery Drains Fast", icon: "battery", repair: "Battery Replacement" },
  { id: "charging", label: "Won't Charge", icon: "charging", repair: "Charging Port / Flex" },
  { id: "back", label: "Cracked Back Glass", icon: "backglass", repair: "Back Glass Replacement" },
  { id: "camera", label: "Blurry Camera", icon: "camera", repair: "Camera Repair" },
  { id: "dead", label: "Dead / Won't Turn On", icon: "board", repair: "Motherboard / IC Repair" },
  { id: "water", label: "Water Damage", icon: "water", repair: "Water Damage Revival" },
  { id: "software", label: "Stuck on Apple Logo", icon: "settings", repair: "Software / iOS Issue" },
  { id: "data", label: "Lost Photos / Data", icon: "data", repair: "Data Recovery" },
  { id: "sound", label: "No Sound or Mic", icon: "speaker", repair: "Speaker / Mic / Haptics" },
];

const MAC_MODELS = ["MacBook Air", "MacBook Pro", "Mac mini", "iMac"];
const PASSPORT_KEY = "ramr-repair-passport";

const genOf = (model: string) => {
  const match = model.match(/(\d{1,2})/);
  return match ? Number(match[1]) : 0;
};
const rankOf = (model: string) => {
  if (/pro max/i.test(model)) return 5;
  if (/pro/i.test(model)) return 4;
  if (/plus|max/i.test(model)) return 3;
  if (/air|mini|slim/i.test(model)) return 2;
  return 1;
};
const byNewest = (a: string, b: string) => genOf(b) - genOf(a) || rankOf(b) - rankOf(a) || a.localeCompare(b);

function groupModels() {
  const keys = Object.keys(PRICES);
  return {
    iPhone: keys.filter((m) => m.startsWith("iPhone")).sort(byNewest),
    iPad: keys.filter((m) => m.startsWith("iPad")),
    Watch: keys.filter((m) => m.startsWith("Apple Watch")),
    iPod: keys.filter((m) => m.startsWith("iPod")),
    Mac: MAC_MODELS,
  };
}

type Passport = { model: string; symptom: string; at: number };

export default function DeviceTriage() {
  const groups = useMemo(groupModels, []);
  const [model, setModel] = useState("iPhone 14");
  const [symptomId, setSymptomId] = useState("screen");
  const [passport, setPassport] = useState<Passport | null>(null);
  const [copied, setCopied] = useState(false);
  /* Only persist a lookup the visitor actually made. Writing the defaults on
     mount would claim we "saved" a device they never chose. */
  const [touched, setTouched] = useState(false);

  const symptom = SYMPTOMS.find((s) => s.id === symptomId) ?? SYMPTOMS[0];
  const price = getPrice(model, symptom.repair);
  const glass = symptom.id === "screen" ? glassPriceFor(model) : null;
  const isMac = MAC_MODELS.includes(model);
  const turnaround = TURNAROUND[symptom.repair] ?? "Confirmed after diagnosis";

  /* Restore the last lookup. Read only after mount so SSR and client agree. */
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(PASSPORT_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Passport;
      if (
        parsed &&
        typeof parsed.model === "string" &&
        typeof parsed.symptom === "string" &&
        Date.now() - Number(parsed.at) < 90 * 24 * 60 * 60 * 1000
      ) {
        setPassport(parsed);
      }
    } catch {
      /* storage is optional */
    }
  }, []);

  /* Save each lookup, but not on the first render before restoration and not
     before the visitor has touched a control. */
  useEffect(() => {
    if (!touched) return;
    const next: Passport = { model, symptom: symptomId, at: Date.now() };
    try {
      window.localStorage.setItem(PASSPORT_KEY, JSON.stringify(next));
    } catch {
      /* private mode */
    }
  }, [model, symptomId, touched]);

  const priceText = isMac
    ? "Quoted after a free diagnosis"
    : price
      ? priceLabel(price)
      : symptom.repair === "Data Recovery"
        ? "From ₹2,999"
        : symptom.repair === "Water Damage Revival"
          ? "Free assessment first"
          : "Quoted after a free diagnosis";

  const shareText =
    `Red Apple Mobile Repair — my estimate\n` +
    `Device: ${model}\n` +
    `Issue: ${symptom.label} (${symptom.repair})\n` +
    `Published price: ${priceText}\n` +
    `Typical turnaround: ${turnaround}\n` +
    `90-day repair warranty · 6 months on battery & front glass\n` +
    `No. 1 Mahatma Gandhi Rd, Halasuru, Bengaluru 560008 · +91 86606 63776`;

  const copyEstimate = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      track("triage_share", { model, symptom: symptom.id });
      window.setTimeout(() => setCopied(false), 2400);
    } catch {
      setCopied(false);
    }
  };

  const resume = () => {
    if (!passport) return;
    setModel(passport.model);
    setSymptomId(passport.symptom);
  };

  return (
    <section id="triage" className="section-apple relative overflow-hidden bg-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(58% 40% at 20% 0%, rgba(255,122,26,0.06), transparent 68%), radial-gradient(48% 36% at 92% 100%, rgba(255,45,85,0.045), transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-[1160px] px-6 lg:px-8">
        <Reveal className="mx-auto max-w-[720px] text-center">
          <span className="kicker">Repair Triage</span>
          <h2 className="head-gradient font-apple mt-3 text-[clamp(1.9rem,4vw,2.9rem)] font-extrabold leading-[1.08] tracking-tight">
            Not Sure What&rsquo;s Wrong? Start Here.
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-[var(--text-muted)]">
            Pick your device and the symptom. You&rsquo;ll see the likely service, a
            published price and an honest turnaround — before you message anyone.
          </p>
        </Reveal>

        {passport && (
          <Reveal className="mt-6">
            <div className="mx-auto flex max-w-[720px] flex-wrap items-center justify-center gap-2 rounded-full border border-[var(--orange)]/20 bg-[var(--orange)]/[0.06] px-3 py-2 text-[11.5px]">
              <LineIcon name="box" size={13} color="var(--cosmic-deep)" />
              <span className="font-semibold text-[var(--cosmic-deep)]">
                Saved on this device:
              </span>
              <span className="text-[var(--text)]/75">
                {passport.model} · {SYMPTOMS.find((s) => s.id === passport.symptom)?.label ?? "Repair"}
              </span>
              <button
                type="button"
                onClick={resume}
                className="rounded-full bg-white px-2.5 py-1 font-bold text-[var(--cosmic-deep)] ring-1 ring-[var(--orange)]/25 transition-transform hover:-translate-y-px"
              >
                Resume
              </button>
            </div>
          </Reveal>
        )}

        <div className="mt-10 grid items-start gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          {/* ---------- controls ---------- */}
          <Reveal>
            <div className="figma-card-lg p-5 sm:p-6">
              <label className="block text-[11px] font-extrabold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                Your Device
              </label>
              <div className="relative mt-2">
                <select
                  value={model}
                  onChange={(e) => {
                    setModel(e.target.value);
                    setTouched(true);
                    track("triage_model", { model: e.target.value });
                  }}
                  className="triage-select w-full appearance-none rounded-xl border border-black/[0.1] bg-white px-4 py-3 pr-10 text-[13.5px] font-semibold text-[var(--text)] outline-none transition-colors focus:border-[var(--orange)]"
                >
                  <optgroup label="iPhone">
                    {groups.iPhone.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </optgroup>
                  <optgroup label="iPad">
                    {groups.iPad.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Apple Watch">
                    {groups.Watch.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Mac">
                    {groups.Mac.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </optgroup>
                  <optgroup label="iPod">
                    {groups.iPod.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </optgroup>
                </select>
                <LineIcon
                  name="chevron-down"
                  size={16}
                  className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                />
              </div>

              <span className="mt-5 block text-[11px] font-extrabold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                What&rsquo;s Happening?
              </span>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {SYMPTOMS.map((s) => {
                  const active = s.id === symptomId;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => {
                        setSymptomId(s.id);
                        setTouched(true);
                        track("triage_symptom", { symptom: s.id });
                      }}
                      className={`triage-chip group ${active ? "is-active" : ""}`}
                    >
                      <span className="triage-chip-icon">
                        <LineIcon name={s.icon} size={16} />
                      </span>
                      <span className="min-w-0 text-left text-[11.5px] font-bold leading-tight">
                        {s.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              <p className="mt-4 flex items-start gap-1.5 text-[11px] leading-relaxed text-[var(--text-muted)]">
                <LineIcon name="info" size={12} className="mt-0.5 shrink-0" />
                Final price is confirmed in writing after a free diagnosis. No work
                starts without your approval.
              </p>
            </div>
          </Reveal>

          {/* ---------- result ---------- */}
          <Reveal delay={110}>
            <aside className="triage-result">
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-[var(--orange)]/12 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[var(--cosmic-deep)]">
                  Likely Service
                </span>
                <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-[var(--text-muted)]">
                  <LineIcon name="clock" size={12} /> {turnaround}
                </span>
              </div>

              <h3 className="mt-3 font-apple text-[21px] font-extrabold leading-tight tracking-tight text-[var(--text)]">
                {symptom.repair}
              </h3>
              <p className="mt-1 text-[12px] font-semibold text-[var(--text-muted)]">{model}</p>

              <div className="triage-price">
                <span className="triage-price-label">Published price</span>
                <span className="triage-price-value">{priceText}</span>
              </div>

              {glass !== null && (
                <div className="mt-2.5 flex items-center justify-between gap-2 rounded-xl border border-[var(--orange)]/22 bg-[var(--orange)]/[0.06] px-3 py-2">
                  <span className="text-[11px] font-bold text-[var(--cosmic-deep)]">
                    Front Glass Restoration
                  </span>
                  <span className="text-[12px] font-extrabold text-[var(--cosmic-deep)]">
                    {inr(glass)}
                  </span>
                </div>
              )}

              {symptom.hint && (
                <p className="mt-3 text-[11.5px] leading-relaxed text-[var(--text-muted)]">
                  {symptom.hint}
                </p>
              )}

              <ul className="mt-4 space-y-1.5 text-[11.5px] text-[var(--text)]/75">
                <li className="flex items-center gap-1.5">
                  <LineIcon name="check" size={12} color="var(--cosmic-deep)" /> Free diagnosis before any charge
                </li>
                <li className="flex items-center gap-1.5">
                  <LineIcon name="check" size={12} color="var(--cosmic-deep)" /> 90-day repair warranty
                </li>
                <li className="flex items-center gap-1.5">
                  <LineIcon name="check" size={12} color="var(--cosmic-deep)" /> Zero-password policy
                </li>
              </ul>

              {symptom.id === "water" && (
                <p className="mt-3 rounded-xl border border-red-500/20 bg-red-50 px-3 py-2 text-[11px] font-semibold leading-relaxed text-red-700">
                  Do not charge the device and do not apply heat. Bring it in for a free
                  assessment as soon as you can.
                </p>
              )}

              <div className="mt-5 flex flex-col gap-2">
                <a
                  href={wa(
                    `Hi Red Apple! My ${model} has: ${symptom.label}. The site shows ${priceText}. Please confirm the exact price and a repair slot.`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track("whatsapp_click", { source: "triage", model, symptom: symptom.id })}
                  className="cta-orange flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-[13px] font-bold text-white"
                >
                  <LineIcon name="whatsapp" size={16} color="#fff" />
                  Confirm on WhatsApp
                </a>
                <button
                  type="button"
                  onClick={copyEstimate}
                  className="flex items-center justify-center gap-2 rounded-xl border border-black/[0.1] bg-white px-4 py-2.5 text-[12.5px] font-bold text-[var(--text)] transition-colors hover:border-[var(--orange)]/45"
                >
                  <LineIcon name={copied ? "check" : "copy"} size={14} />
                  {copied ? "Estimate copied" : "Copy / Share Estimate"}
                </button>
              </div>

              <p className="mt-3 text-center text-[10px] text-[var(--text-muted)]">
                Saved on this device only. No account needed.
              </p>
            </aside>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
