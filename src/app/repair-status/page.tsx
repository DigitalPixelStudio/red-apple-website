"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollProgress from "@/components/ScrollProgress";
import Concierge from "@/components/Concierge";
import StickyCta from "@/components/StickyCta";
import { wa, SITE } from "@/lib/site";
import { track } from "@/lib/analytics";

const STATUS_STEPS = [
  { key: "intake", label: "Received", icon: "📥", desc: "Device handed over and logged in" },
  { key: "diagnosis", label: "Inspection", icon: "🔍", desc: "Diagnosis and fault isolation" },
  { key: "waiting-part", label: "Parts", icon: "🧩", desc: "Waiting for the required component" },
  { key: "repairing", label: "Repair in progress", icon: "🔧", desc: "Technician working on your device" },
  { key: "ready", label: "Ready for pickup", icon: "📦", desc: "Repair completed and quality checked" },
  { key: "delivered", label: "Completed", icon: "✓", desc: "Device handed back to customer" },
] as const;
type RepairStatusResult = { token: string; device: string; issue: string; status: string; created_at: string };

export default function RepairStatusPage() {
  const [ticket, setTicket] = useState("");
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState<RepairStatusResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (ticket.trim().length < 3 || phone.trim().length < 10) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const response = await fetch(`/api/repair-status?ticket=${encodeURIComponent(ticket)}&phone=${encodeURIComponent(phone)}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        setError(data.error || "We couldn't find that repair. Check your receipt number and phone.");
        track("repair_status_checked", { ticket, matched: false });
      } else {
        setResult(data.repair);
        track("repair_status_checked", { ticket, matched: true });
      }
    } catch {
      setError("Repair status is temporarily unavailable. Please contact the store.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white">
      <ScrollProgress />
      <Navbar />
      <section className="section-apple bg-[#f5f5f7]">
        <div className="mx-auto max-w-[760px] px-6 pt-24 text-center lg:px-8">
          <p className="font-apple text-[12.5px] font-bold uppercase tracking-[0.22em] text-[#ff2d55]">Repair tracking</p>
          <h1 className="section-title font-apple mt-3 text-[#1d1d1f]">Where is <span className="gradient-text">my device?</span></h1>
          <p className="section-subtitle mx-auto mt-5">Enter the ticket number from your repair receipt and your phone number to see the live status.</p>

          <form onSubmit={submit} className="glow mx-auto mt-10 max-w-[520px] rounded-[30px] glass p-6 text-left">
            <label className="text-[12.5px] font-bold text-[#1d1d1f]">Ticket / Receipt number</label>
            <input value={ticket} onChange={(e) => setTicket(e.target.value)} placeholder="e.g. RA-1042" required
              className="mt-2 w-full rounded-2xl border border-black/[0.08] bg-white px-5 py-3.5 text-[14px] outline-none focus:border-[#ff2d55]/50" />
            <label className="mt-4 block text-[12.5px] font-bold text-[#1d1d1f]">Registered phone number</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 …" inputMode="tel" required
              className="mt-2 w-full rounded-2xl border border-black/[0.08] bg-white px-5 py-3.5 text-[14px] outline-none focus:border-[#ff2d55]/50" />
            <button type="submit" disabled={loading} className="cta-primary mt-6 w-full">{loading ? "Checking…" : "Track My Repair"}</button>
          </form>
        </div>

        {error && <p role="alert" className="mx-auto mt-5 max-w-[520px] rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-left text-[13px] text-red-700">{error}</p>}
        {result && (
          <div className="mx-auto mt-14 max-w-[860px] px-6">
            <div className="rounded-[30px] bg-white p-8 shadow-lg ring-1 ring-black/[0.05]">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/[0.06] pb-5">
                <div>
                  <div className="text-[12px] font-semibold text-[#86868b]">Ticket <span className="font-black text-[#1d1d1f]">{result.token}</span></div>
                  <div className="mt-1 text-[13px] text-[#6e6e73]">{result.device} · {result.issue}</div>
                </div>
                <div className="rounded-full bg-[#ff2d55]/10 px-4 py-2 text-[12.5px] font-bold capitalize text-[#ff2d55]">{result.status.replace(/-/g, " ")}</div>
              </div>

              <div className="mt-8 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {STATUS_STEPS.map((s, i) => {
                  const currentIndex = Math.max(0, STATUS_STEPS.findIndex((step) => step.key === result.status));
                  const done = i < currentIndex;
                  const current = i === currentIndex;
                  return (
                    <div key={s.key} className={`rounded-[20px] p-5 ${
                      current ? "bg-[#1d1d1f] text-white shadow-xl" : done ? "bg-[#30d158]/[0.08]" : "bg-black/[0.03]"
                    }`}>
                      <div className="flex items-center gap-2.5">
                        <span className={`grid h-9 w-9 place-items-center rounded-full text-[16px] ${
                          current ? "bg-white/15" : done ? "bg-[#30d158]/15" : "bg-black/[0.05]"
                        }`}>{s.icon}</span>
                        <span className={`text-[13px] font-bold ${done && !current ? "text-[#1d1d1f]/70" : ""}`}>{s.label}</span>
                      </div>
                      <p className={`mt-2 text-[11.5px] leading-relaxed ${current ? "text-white/60" : "text-[#86868b]"}`}>{s.desc}</p>
                      {done && !current && <div className="mt-2 text-[11px] font-bold text-[#30d158]">Done</div>}
                      {current && <div className="mt-2 inline-flex rounded-full bg-[#ff2d55] px-3 py-1 text-[10.5px] font-bold text-white">● In progress</div>}
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 rounded-[20px] bg-[#f5f5f7] p-5 text-center">
                <p className="text-[13px] text-[#6e6e73]">Questions about your repair? Our team is one message away.</p>
                <a href={wa(`Hi! I want an update on repair ticket ${result.token}.`)} target="_blank" rel="noopener noreferrer"
                  className="cta-primary mt-4 text-[13px]">Ask on WhatsApp</a>
              </div>
            </div>
          </div>
        )}

        <div className="mx-auto mt-12 max-w-[620px] px-6 text-center text-[12.5px] text-[#86868b]">
          Lost your receipt? <a href={SITE.phoneHref} className="font-bold text-[#ff2d55]">Call {SITE.phone}</a> and we&rsquo;ll find it with your phone number.
        </div>
      </section>
      <Footer />
      <Concierge />
      <StickyCta />
    </main>
  );
}
