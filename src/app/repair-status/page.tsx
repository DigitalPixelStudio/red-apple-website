"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollProgress from "@/components/ScrollProgress";
import Concierge from "@/components/Concierge";
import StickyCta from "@/components/StickyCta";
import { REPAIR_STATUS_FLOW, wa, SITE } from "@/lib/site";
import { track } from "@/lib/analytics";

type StatusStage = { key: string; label: string; icon: string; desc: string };
type StatusResponse = {
  ok: boolean;
  error?: string;
  ticket?: string;
  phoneMasked?: string;
  configured: boolean;
  jobNumber?: string | null;
  invoiceNumber?: string | null;
  deviceModel?: string | null;
  serviceType?: string | null;
  stageStep?: number | null;
  stages?: StatusStage[];
  currentStage: StatusStage | null;
  message: string;
  whatsapp?: string;
};

export default function RepairStatusPage() {
  const [ticket, setTicket] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<StatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Normalise common input formats so valid tickets/phones don't bounce as 400.
    const cleanTicket = ticket.trim().replace(/\s+/g, "");
    const cleanPhone = phone.trim().replace(/[\s()-]/g, "");
    if (cleanTicket.length < 3 || cleanPhone.replace(/\D/g, "").length < 10) return;
    track("repair_status_checked", { ticket });
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      // POST-only endpoint — never GET (GET returns 405). Body carries the form values.
      const res = await fetch("/api/crm-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticket: cleanTicket, phone: cleanPhone }),
      });
      const data = (await res.json()) as StatusResponse;
      if (!res.ok || data.ok === false) {
        setError("We couldn't check that ticket right now. Please confirm your stage on WhatsApp.");
        return;
      }
      setResult(data);
    } catch {
      setError("We couldn't check that ticket right now. Please confirm your stage on WhatsApp.");
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
            <button type="submit" disabled={loading} className="cta-primary mt-6 w-full disabled:opacity-60">{loading ? "Checking…" : "Track My Repair"}</button>
          </form>
        </div>

        {(result || error) && (
          <div className="mx-auto mt-14 max-w-[860px] px-6">
            <div className="rounded-[30px] bg-white p-8 shadow-lg ring-1 ring-black/[0.05]">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/[0.06] pb-5">
                <div>
                  <div className="text-[12px] font-semibold text-[#86868b]">Ticket <span className="font-black text-[#1d1d1f]">{result?.ticket ?? ticket.toUpperCase()}</span></div>
                  <div className="mt-1 text-[13px] text-[#6e6e73]">Registered to <strong>{result?.phoneMasked ?? phone}</strong></div>
                </div>
                <div className="rounded-full bg-[#ff2d55]/10 px-4 py-2 text-[12.5px] font-bold text-[#ff2d55]">
                  {result?.currentStage ? result.currentStage.label : "Awaiting WhatsApp confirmation"}
                </div>
              </div>

              {(result?.deviceModel || result?.serviceType || result?.invoiceNumber) && (
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {result.deviceModel && <div className="rounded-2xl bg-[#f5f5f7] p-4"><p className="text-[10px] font-bold uppercase tracking-wider text-[#86868b]">Device</p><p className="mt-1 text-[13px] font-semibold text-[#1d1d1f]">{result.deviceModel}</p></div>}
                  {result.serviceType && <div className="rounded-2xl bg-[#f5f5f7] p-4"><p className="text-[10px] font-bold uppercase tracking-wider text-[#86868b]">Repair</p><p className="mt-1 text-[13px] font-semibold text-[#1d1d1f]">{result.serviceType}</p></div>}
                  {result.invoiceNumber && <div className="rounded-2xl bg-[#f5f5f7] p-4"><p className="text-[10px] font-bold uppercase tracking-wider text-[#86868b]">Invoice</p><p className="mt-1 text-[13px] font-semibold text-[#1d1d1f]">{result.invoiceNumber}</p></div>}
                </div>
              )}

              <div className="mt-6 rounded-[20px] bg-[#fff5f6] p-5 text-center">
                <p className="text-[13.5px] font-semibold text-[#1d1d1f]">{result?.message ?? error}</p>
                {result && !result.configured && (
                  <p className="mt-1 text-[12.5px] text-[#6e6e73]">We don&rsquo;t publish live tracking stages online yet — our team confirms your exact stage personally on WhatsApp.</p>
                )}
              </div>

              {result && (
                <div className="mt-8">
                  <p className="mb-3 text-[12.5px] font-bold uppercase tracking-widest text-[#86868b]">The stages we record for every repair</p>
                  <div className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {(result.stages ?? REPAIR_STATUS_FLOW).map((s) => {
                      const isCurrent = result.currentStage?.key === s.key;
                      return (
                        <div key={s.key} className={`rounded-[20px] p-5 ${isCurrent ? "bg-[#1d1d1f] text-white shadow-xl" : "bg-black/[0.03]"}`}>
                          <div className="flex items-center gap-2.5">
                            <span className={`grid h-9 w-9 place-items-center rounded-full text-[16px] ${isCurrent ? "bg-white/15" : "bg-black/[0.05]"}`}>{s.icon}</span>
                            <span className={`text-[13px] font-bold ${isCurrent ? "text-white" : "text-[#1d1d1f]"}`}>{s.label}</span>
                          </div>
                          <p className={`mt-2 text-[11.5px] leading-relaxed ${isCurrent ? "text-white/60" : "text-[#86868b]"}`}>{s.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                  <p className="mt-3 text-[11.5px] text-[#86868b]">Your highlighted stage is read directly from the current repair record in our store CRM.</p>
                </div>
              )}

              <div className="mt-8 rounded-[20px] bg-[#f5f5f7] p-5 text-center">
                <p className="text-[13px] text-[#6e6e73]">Questions about your repair? Our team is one message away.</p>
                <a href={wa(`Hi! I want an update on repair ticket ${ticket.toUpperCase()} (${phone}).`)} target="_blank" rel="noopener noreferrer"
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
