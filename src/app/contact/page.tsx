"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollProgress from "@/components/ScrollProgress";
import Concierge from "@/components/Concierge";
import StickyCta from "@/components/StickyCta";
import { SITE, wa } from "@/lib/site";
import { track } from "@/lib/analytics";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [msg, setMsg] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2 || phone.trim().length < 10 || msg.trim().length < 5) return;
    track("lead_created", { source: "contact_page" });
    window.open(
      wa(`📋 *New Contact Enquiry*\n\n👤 Name: ${name}\n📞 Phone: ${phone}\n💬 Message: ${msg}`),
      "_blank", "noopener,noreferrer"
    );
  };

  return (
    <main className="min-h-screen bg-white">
      <ScrollProgress />
      <Navbar />
      <section className="section-apple bg-[#f5f5f7]">
        <div className="mx-auto max-w-[1100px] px-6 pt-24 lg:px-8">
          <div className="text-center">
            <p className="font-apple text-[12.5px] font-bold uppercase tracking-[0.22em] text-[#ff2d55]">Contact</p>
            <h1 className="section-title font-apple mt-3 text-[#1d1d1f]">Talk to the <span className="gradient-text">experts.</span></h1>
            <p className="section-subtitle mx-auto mt-5">Call, WhatsApp or walk in — we reply fast and fix right.</p>
          </div>

          <div className="mt-14 grid gap-6 lg:grid-cols-2">
            <div className="rounded-[30px] glass p-8">
              <h2 className="font-apple text-[19px] font-bold">Send an enquiry</h2>
              <p className="mt-1 text-[13px] text-[#86868b]">Submits straight to our WhatsApp — no storage, no spam.</p>
              <form onSubmit={submit} className="mt-6 space-y-4">
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required
                  className="w-full rounded-2xl border border-black/[0.08] bg-white px-5 py-3.5 text-[14px] outline-none focus:border-[#ff2d55]/50" />
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone / WhatsApp" inputMode="tel" required
                  className="w-full rounded-2xl border border-black/[0.08] bg-white px-5 py-3.5 text-[14px] outline-none focus:border-[#ff2d55]/50" />
                <textarea value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="What's wrong with your Apple device?" rows={4} required
                  className="w-full resize-none rounded-2xl border border-black/[0.08] bg-white px-5 py-3.5 text-[14px] outline-none focus:border-[#ff2d55]/50" />
                <button type="submit" className="cta-primary w-full">Send via WhatsApp →</button>
              </form>
            </div>

            <div className="flex flex-col gap-4">
              {[
                { icon: "📞", t: "Call us", v: SITE.phone, href: SITE.phoneHref },
                { icon: "💬", t: "WhatsApp", v: "Chat with a technician", href: wa("Hi Red Apple Mobile Repair! 🍎") },
                { icon: "📍", t: "Address", v: SITE.address, href: SITE.mapsUrl },
                { icon: "🕙", t: "Hours", v: SITE.hours, href: undefined },
              ].map((c) => (
                <a key={c.t} href={c.href} target={c.href?.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer"
                  onClick={() => c.href?.includes("wa.me") ? track("whatsapp_click", { source: "contact" }) : c.href?.startsWith("tel") ? track("call_click", { source: "contact" }) : undefined}
                  className="flex items-center gap-4 rounded-[24px] bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg">
                  <span className="grid h-13 w-13 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#ff2d55]/10 to-[#ff9500]/10 p-3 text-[22px]">{c.icon}</span>
                  <div>
                    <div className="text-[12.5px] font-bold text-[#1d1d1f]">{c.t}</div>
                    <div className="mt-0.5 text-[13px] text-[#6e6e73]">{c.v}</div>
                  </div>
                </a>
              ))}
              <div className="mt-auto overflow-hidden rounded-[24px] border border-black/[0.06] shadow-sm">
                <iframe src={SITE.mapsEmbed} width="100%" height="220" style={{ border: 0 }} loading="lazy" title="Map" className="block w-full" />
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
      <Concierge />
      <StickyCta />
    </main>
  );
}
