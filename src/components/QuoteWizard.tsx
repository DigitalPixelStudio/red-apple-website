"use client";
import { useMemo, useState } from "react";
import { z } from "zod";
import { QUOTE_DEVICES, REPAIR_TYPES, wa } from "@/lib/site";
import { getPrice, priceLabel, TURNAROUND, priceNote } from "@/lib/pricing";
import { track } from "@/lib/analytics";
import { LineIcon } from "./Icons";

const customerSchema = z.object({
  name: z.string().min(2, "Please enter your name"),
  phone: z.string().regex(/^[0-9+\-\s]{10,15}$/, "Enter a valid phone number"),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  condition: z.string().min(1, "Please select device condition"),
  urgency: z.string().optional(),
  pickup: z.string().optional(),
  preferredTime: z.string().optional(),
  description: z.string().min(5, "Briefly describe the issue"),
});

type Step = "device" | "model" | "repair" | "details";

const STEPS: { key: Step; label: string }[] = [
  { key: "device", label: "Device" },
  { key: "model", label: "Model" },
  { key: "repair", label: "Repair" },
  { key: "details", label: "Your details" },
];

const URGENCY_LEVELS = [
  "Urgent — Need it fixed today",
  "This week — Within 2-3 days",
  "Flexible — Whenever convenient",
  "Just exploring — No rush",
];

const PICKUP_OPTIONS = [
  "Walk-in at store",
  "Free pickup & drop",
  "Courier / delivery",
  "Online consultation first",
];

const CONDITIONS = [

  "Device powers on normally",
  "Device does not power on",
  "Screen is cracked but touch works",
  "Screen is cracked and touch not working",
  "Water damage / liquid exposure",
  "Battery drains very fast",
  "Camera not working",
  "Speaker / mic issue",
  "Charging problem",
  "Software / boot loop issue",
  "Other — I will describe below",
];

export default function QuoteWizard({ compact = false }: { compact?: boolean }) {
  const [step, setStep] = useState<Step>("device");
  const [device, setDevice] = useState("");
  const [model, setModel] = useState("");
  const [repair, setRepair] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [condition, setCondition] = useState("");
  const [description, setDescription] = useState("");
  const [urgency, setUrgency] = useState("");
  const [pickup, setPickup] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  const deviceDef = useMemo(() => QUOTE_DEVICES.find((d) => d.id === device), [device]);

  const goDevice = (id: string) => {
    setDevice(id); setModel(""); setRepair("");
    track("device_selected", { device: id });
    setStep("model");
  };
  const goModel = (m: string) => { setModel(m); track("model_selected", { device, model: m }); setStep("repair"); };
  const goRepair = (r: string) => { setRepair(r); track("quote_started", { device, model, repair: r }); setStep("details"); };

  const submit = () => {
    const res = customerSchema.safeParse({ name, phone, email, condition, urgency, pickup, preferredTime, description });
    if (!res.success) {
      const e: Record<string, string> = {};
      for (const issue of res.error.issues) e[issue.path[0] as string] = issue.message;
      setErrors(e);
      return;
    }
    setErrors({});
    track("quote_completed", { device, model, repair });
    track("lead_created", { device, model, repair, source: "quote_wizard" });
    const msg =
      `*RED APPLE MOBILE REPAIR*\n` +
      `_Where Repair Meets Connectivity_\n` +
      `\n` +
      `*NEW REPAIR REQUEST*\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `\n` +
      `*DEVICE*\n` +
      `• Type  :  ${deviceDef?.label ?? device}\n` +
      `• Model :  ${model}\n` +
      `• Repair:  ${repair}\n` +
      `• Condition:  ${condition}\n` +
      `\n` +
      `*WHAT IS WRONG*\n` +
      `${description || "Customer will explain on chat"}\n` +
      `\n` +
      `*SERVICE PREFERENCE*\n` +
      `• Mode :  ${pickup || "Walk-in at store"}\n` +
      `• When :  ${preferredTime || "Flexible"}\n` +
      `• Urgency :  ${urgency || "Normal"}\n` +
      `\n` +
      `*CUSTOMER*\n` +
      `• Name :  ${name}\n` +
      `• Phone :  ${phone}\n` +
      `• Email :  ${email || "—"}\n` +
      `\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `Please confirm the exact price and the earliest slot. Thank you.`;

    const url = wa(msg);
    // open synchronously inside the click handler — popup blockers allow this
    const win = window.open(url, "_blank", "noopener,noreferrer");
    if (!win) window.location.href = url;   // fallback if blocked
    setSent(true);
  };

  return (
    <div className={`mx-auto ${compact ? "max-w-[560px]" : "max-w-[720px]"}`}>
      {/* Step indicator */}
      <div className="mb-8 flex items-center justify-center gap-2 flex-wrap">
        {STEPS.map((s, i) => {
          const order: Step[] = ["device", "model", "repair", "details"];
          const activeIdx = order.indexOf(step);
          const active = i <= activeIdx;
          return (
            <div key={s.key} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 rounded-[var(--cta-radius)] px-3.5 py-1.5 text-[12px] font-bold transition duration-300 ${
                active ? "bg-[var(--cta-dark)] text-white" : "bg-black/[0.04] text-[var(--text-muted)]"
              }`}>
                <span className={`grid h-5 w-5 place-items-center rounded-full text-[10px] ${active ? "bg-white/20" : "bg-black/[0.05]"}`}>{i + 1}</span>
                <span className="hidden sm:inline">{s.label}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`w-6 h-px ${active ? "bg-[var(--cta-dark)]" : "bg-black/10"}`} />}
            </div>
          );
        })}
      </div>

      {sent ? (
        <div className="rounded-[26px] bg-green-50 border border-green-200 p-10 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-green-100">
            <LineIcon name="check" size={32} className="text-green-600" />
          </div>
          <h3 className="mt-4 font-apple text-[22px] font-bold text-green-800">Quotation Request Sent</h3>
          <p className="mt-2 text-[14px] text-green-700">We have received your details via WhatsApp. Our team will respond with an estimate within 15 minutes.</p>
          <button onClick={() => { setSent(false); setStep("device"); setDevice(""); setModel(""); setRepair(""); setName(""); setPhone(""); setEmail(""); setCondition(""); setDescription(""); setUrgency(""); setPickup(""); setPreferredTime(""); }}
            className="cta-dark mt-6 press">Submit Another Request</button>
        </div>
      ) : (
        <div className="rounded-[26px] bg-white border border-black/[0.06] p-6 md:p-8 shadow-sm">
          {/* Step: Device */}
          {step === "device" && (
            <div>
              <h3 className="font-apple text-[20px] font-bold text-[var(--text)] mb-1">Select your device</h3>
              <p className="text-[13px] text-[var(--text-muted)] mb-6">Choose the Apple device you need repaired.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {QUOTE_DEVICES.map((d) => (
                  <button key={d.id} onClick={() => goDevice(d.id)}
                    className={`rounded-[16px] border p-4 text-left transition duration-300 hover:-translate-y-0.5 hover:shadow-md ${
                      device === d.id ? "border-[var(--accent)] bg-[var(--accent)]/5 shadow-md" : "border-black/[0.06] hover:border-[var(--accent)]/40"
                    }`}>
                    <div className="text-[14px] font-bold text-[var(--text)]">{d.label}</div>
                    <div className="mt-1 text-[11px] text-[var(--text-muted)]">{d.models.length} models</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step: Model */}
          {step === "model" && (
            <div>
              <button onClick={() => setStep("device")} className="mb-4 flex items-center gap-1 text-[12px] font-semibold text-[var(--accent)] hover:underline">
                <LineIcon name="arrow-right" size={12} className="rotate-180" /> Back
              </button>
              <h3 className="font-apple text-[20px] font-bold text-[var(--text)] mb-1">Select your model</h3>
              <p className="text-[13px] text-[var(--text-muted)] mb-6">Which {deviceDef?.label} model do you have?</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[400px] overflow-y-auto pr-1">
                {deviceDef?.models.map((m) => (
                  <button key={m} onClick={() => goModel(m)}
                    className={`rounded-[12px] border px-3.5 py-2.5 text-left text-[13px] font-medium transition duration-300 hover:-translate-y-0.5 ${
                      model === m ? "border-[var(--accent)] bg-[var(--accent)]/5 shadow-sm" : "border-black/[0.06] hover:border-[var(--accent)]/40"
                    }`}>{m}</button>
                ))}
              </div>
            </div>
          )}

          {/* Step: Repair */}
          {step === "repair" && (
            <div>
              <button onClick={() => setStep("model")} className="mb-4 flex items-center gap-1 text-[12px] font-semibold text-[var(--accent)] hover:underline">
                <LineIcon name="arrow-right" size={12} className="rotate-180" /> Back
              </button>
              <h3 className="font-apple text-[20px] font-bold text-[var(--text)] mb-1">What needs fixing?</h3>
              <p className="text-[13px] text-[var(--text-muted)] mb-6">Select the repair or service you need.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[400px] overflow-y-auto pr-1">
                {REPAIR_TYPES.map((r) => {
                  const price = getPrice(model, r);
                  return (
                    <button key={r} onClick={() => goRepair(r)}
                      className={`group flex items-center justify-between gap-3 rounded-[12px] border px-4 py-3 text-left text-[13px] font-medium transition duration-300 hover:-translate-y-0.5 ${
                        repair === r ? "border-[var(--orange)] bg-[var(--orange)]/6 shadow-sm" : "border-black/[0.06] hover:border-[var(--orange)]/45"
                      }`}>
                      <span>{r}</span>
                      <span className={`shrink-0 text-[12px] font-extrabold ${price ? "text-[var(--orange-deep)]" : "text-[var(--text-muted)]"}`}>
                        {price ? priceLabel(price) : "Quote"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step: Details */}
          {step === "details" && (
            <div>
              <button onClick={() => setStep("repair")} className="mb-4 flex items-center gap-1 text-[12px] font-semibold text-[var(--accent)] hover:underline">
                <LineIcon name="arrow-right" size={12} className="rotate-180" /> Back
              </button>
              <h3 className="font-apple text-[20px] font-bold text-[var(--text)] mb-1">Your details</h3>
              <p className="text-[13px] text-[var(--text-muted)] mb-6">Share your info so we can prepare your estimate.</p>

              {/* Summary */}
              <div className="mb-6 rounded-[16px] border border-[var(--orange)]/25 bg-[var(--orange)]/6 p-4">
                <div className="text-[12px] font-bold uppercase tracking-[0.14em] text-[var(--orange-deep)]">{deviceDef?.label} — {model}</div>
                <div className="mt-1 text-[13.5px] font-semibold text-[var(--text)]">{repair}</div>
                <div className="mt-3 flex items-end justify-between border-t border-[var(--orange)]/20 pt-3">
                  <div>
                    <div className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                      {(() => { const pr = getPrice(model, repair); return pr ? "Your estimate" : "Exact quote"; })()}
                    </div>
                    <div className="font-apple text-[26px] font-extrabold leading-tight text-[var(--orange-deep)]">
                      {(() => { const pr = getPrice(model, repair); return pr ? priceLabel(pr) : "On WhatsApp"; })()}
                    </div>
                  </div>
                  <div className="text-right text-[11px] text-[var(--text-muted)]">
                    <div className="font-bold text-[var(--text)]">{TURNAROUND[repair] ?? "Same day"}</div>
                    <div>{priceNote(repair)}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-[12.5px] font-bold text-[var(--text)]">Full Name *</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name"
                    className="w-full rounded-[12px] border border-black/[0.1] px-4 py-3 text-[14px] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]/30" />
                  {errors.name && <p className="mt-1 text-[11px] text-red-500">{errors.name}</p>}
                </div>
                <div>
                  <label className="mb-1.5 block text-[12.5px] font-bold text-[var(--text)]">Phone Number *</label>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 XXXXX XXXXX"
                    className="w-full rounded-[12px] border border-black/[0.1] px-4 py-3 text-[14px] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]/30" />
                  {errors.phone && <p className="mt-1 text-[11px] text-red-500">{errors.phone}</p>}
                </div>
                <div>
                  <label className="mb-1.5 block text-[12.5px] font-bold text-[var(--text)]">Email (optional)</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com"
                    className="w-full rounded-[12px] border border-black/[0.1] px-4 py-3 text-[14px] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]/30" />
                  {errors.email && <p className="mt-1 text-[11px] text-red-500">{errors.email}</p>}
                </div>
                <div>
                  <label className="mb-1.5 block text-[12.5px] font-bold text-[var(--text)]">Device Condition *</label>
                  <select value={condition} onChange={(e) => setCondition(e.target.value)}
                    className="w-full rounded-[12px] border border-black/[0.1] px-4 py-3 text-[14px] bg-white focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]/30">
                    <option value="">Select condition...</option>
                    {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {errors.condition && <p className="mt-1 text-[11px] text-red-500">{errors.condition}</p>}
                </div>
                <div>
                  <label className="mb-1.5 block text-[12.5px] font-bold text-[var(--text)]">Describe the issue *</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
                    placeholder="E.g., Screen cracked after a fall, battery drains in 2 hours, back glass broken..."
                    className="w-full rounded-[12px] border border-black/[0.1] px-4 py-3 text-[14px] resize-none focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]/30" />
                  {errors.description && <p className="mt-1 text-[11px] text-red-500">{errors.description}</p>}
                </div>
              </div>

              <div>
                  <label className="mb-1.5 block text-[12.5px] font-bold text-[var(--text)]">Urgency *</label>
                  <div className="grid grid-cols-2 gap-2">
                    {URGENCY_LEVELS.map((u) => (
                      <button key={u} type="button" onClick={() => setUrgency(u)}
                        className={`rounded-[10px] border px-3 py-2 text-left text-[12px] font-medium transition duration-300 hover:-translate-y-0.5 ${
                          urgency === u ? "border-[var(--accent)] bg-[var(--accent)]/5 shadow-sm" : "border-black/[0.06] hover:border-[var(--accent)]/40"
                        }`}>{u}</button>
                    ))}
                  </div>
                  {errors.urgency && <p className="mt-1 text-[11px] text-red-500">{errors.urgency}</p>}
                </div>
                <div>
                  <label className="mb-1.5 block text-[12.5px] font-bold text-[var(--text)]">How would you like to get it serviced? *</label>
                  <div className="grid grid-cols-2 gap-2">
                    {PICKUP_OPTIONS.map((p) => (
                      <button key={p} type="button" onClick={() => setPickup(p)}
                        className={`rounded-[10px] border px-3 py-2 text-left text-[12px] font-medium transition duration-300 hover:-translate-y-0.5 ${
                          pickup === p ? "border-[var(--accent)] bg-[var(--accent)]/5 shadow-sm" : "border-black/[0.06] hover:border-[var(--accent)]/40"
                        }`}>{p}</button>
                    ))}
                  </div>
                  {errors.pickup && <p className="mt-1 text-[11px] text-red-500">{errors.pickup}</p>}
                </div>
                <div>
                  <label className="mb-1.5 block text-[12.5px] font-bold text-[var(--text)]">Preferred Visit Time</label>
                  <input type="text" value={preferredTime} onChange={(e) => setPreferredTime(e.target.value)} placeholder="e.g., Saturday morning, 11 AM"
                    className="w-full rounded-[12px] border border-black/[0.1] px-4 py-3 text-[14px] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]/30" />
                </div>
              <button onClick={submit} className="cta-dark mt-6 w-full justify-center text-[14px] press">
                <LineIcon name="whatsapp" size={16} />
                Send Quotation via WhatsApp
              </button>
              <p className="mt-3 text-center text-[11px] text-[var(--text-muted)]">Your details are sent directly to our WhatsApp. We respond within 15 minutes.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
