import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import QuoteWizard from "@/components/QuoteWizard";
import StickyCta from "@/components/StickyCta";
import Concierge from "@/components/Concierge";
import ScrollProgress from "@/components/ScrollProgress";
import { SITE, wa, baseUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Get an Instant Repair Estimate",
  description: "Select your Apple device and issue — get a transparent repair estimate on WhatsApp within minutes. iPhone, iPad, Watch, AirPods, MacBook & Mac.",
  alternates: { canonical: `${baseUrl}/quote` },
  openGraph: { title: "Instant Apple Repair Estimate — Red Apple Mobile Repair", description: "Get an exact repair estimate for your Apple device in 30 seconds.", url: `${baseUrl}/quote` },
};

export default function QuotePage() {
  return (
    <main className="min-h-screen bg-white">
      <ScrollProgress />
      <Navbar />
      <section className="section-apple bg-[#f5f5f7]">
        <div className="mx-auto max-w-[860px] px-6 pt-24 text-center lg:px-8">
          <p className="font-apple text-[12.5px] font-bold uppercase tracking-[0.22em] text-[#ff2d55]">Smart quotation</p>
          <h1 className="section-title font-apple mt-3 text-[#1d1d1f]">Instant <span className="gradient-text">estimate.</span></h1>
          <p className="section-subtitle mx-auto mt-5">Pick your device, model and issue. We&rsquo;ll confirm the exact price and repair slot on WhatsApp — no hidden charges.</p>
        </div>
        <div className="mx-auto mt-12 max-w-[860px] px-6">
          <QuoteWizard />
        </div>
        <div className="mx-auto mt-10 max-w-[520px] px-6 text-center text-[12.5px] text-[#86868b]">
          Prefer talking directly? <a href={SITE.phoneHref} className="font-bold text-[#ff2d55]">Call {SITE.phone}</a> or{" "}
          <a href={wa("Hi! I need a repair quote. 🍎")} target="_blank" rel="noopener noreferrer" className="font-bold text-[#25D366]">WhatsApp us</a>.
        </div>
      </section>
      <Footer />
      <Concierge />
      <StickyCta />
    </main>
  );
}
