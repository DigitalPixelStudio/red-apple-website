import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollProgress from "@/components/ScrollProgress";
import QuoteWizard from "@/components/QuoteWizard";
import Concierge from "@/components/Concierge";
import GlassRestoration from "@/components/GlassRestoration";
import StickyCta from "@/components/StickyCta";
import { SERVICE_PAGES, SITE, wa, baseUrl } from "@/lib/site";
import { buildServiceJsonLd } from "@/lib/seo/serviceSchema";
import { PRICES } from "@/lib/pricing";
import { GLASS_PRICE_MIN } from "@/lib/glass-pricing";

export function generateStaticParams() {
  return SERVICE_PAGES.map((s) => ({ slug: s.slug }));
}

/**
 * Published starting price, always derived from the single-source pricing
 * modules — never hand-typed here. Display = cheapest published front-display
 * price; glass restoration = the published glass list minimum. Services that
 * are quoted after inspection return null so no Offer (and no fake price) is
 * emitted for them.
 */
function startingPriceFor(slug: string): number | null {
  if (slug === "front-glass-restoration") return GLASS_PRICE_MIN;
  if (slug === "iphone-display-repair") {
    const starts: number[] = [];
    for (const row of Object.values(PRICES)) {
      const price = row["Front Display Replacement"];
      if (Array.isArray(price) && typeof price[0] === "number") starts.push(price[0]);
    }
    return starts.length ? Math.min(...starts) : null;
  }
  return null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = SERVICE_PAGES.find((s) => s.slug === slug);
  if (!page) return {};
  return {
    title: page.title,
    description: page.desc,
    keywords: page.keywords,
    /* Next 16 replaces the whole `alternates` object from the nearest metadata
       export, so en-IN must be restated here or the root hreflang is lost. */
    alternates: {
      canonical: `${baseUrl}/services/${slug}`,
      languages: { "en-IN": `${baseUrl}/services/${slug}` },
    },
    openGraph: { title: `${page.title} — Halasuru, Bengaluru`, description: page.desc, url: `${baseUrl}/services/${slug}`, type: "website", images: [`${baseUrl}/og-image.png`] },
  };
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = SERVICE_PAGES.find((s) => s.slug === slug);
  if (!page) notFound();

  const related = SERVICE_PAGES.filter((s) => s.slug !== slug).slice(0, 4);

  /* v17: one SSR JSON-LD payload (BreadcrumbList + Service + optional Offer).
     No aggregateRating / FAQPage nodes here — layout.tsx owns those once. */
  const serviceJsonLd = buildServiceJsonLd(slug, page.title, page.desc, startingPriceFor(slug));

  return (
    <main className="min-h-screen bg-white">
      <ScrollProgress />
      <Navbar />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd).replace(/</g, "\\u003c") }}
      />

      <section className="section-apple bg-[#f5f5f7]">
        <div className="mx-auto max-w-[1000px] px-6 pt-24 text-center lg:px-8">
          <p className="font-apple text-[12.5px] font-bold uppercase tracking-[0.22em] text-[#ff2d55]">{page.short}</p>
          <h1 className="section-title font-apple mt-3 text-[#1d1d1f]">{page.title}</h1>
          <p className="section-subtitle mx-auto mt-5">{page.desc}</p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
            <span className="rounded-full bg-white px-4 py-1.5 text-[12px] font-bold text-[#1d1d1f] shadow-sm">4.9 · {SITE.ratingCount} Google reviews</span>
            <span className="rounded-full bg-white px-4 py-1.5 text-[12px] font-bold text-[#1d1d1f] shadow-sm">6 Months Warranty</span>
            <span className="rounded-full bg-white px-4 py-1.5 text-[12px] font-bold text-[#1d1d1f] shadow-sm">Free pickup &amp; drop</span>
          </div>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a href="#estimate" className="cta-primary">Get Estimate</a>
            <Link href="/repair-status" className="cta-outline">Track Repair</Link>
          </div>
        </div>
      </section>

      {slug === "front-glass-restoration" && <GlassRestoration />}

      <section id="estimate" className="section-apple bg-white">
        <div className="mx-auto max-w-[860px] px-6 lg:px-8">
          <h2 className="section-title font-apple text-center text-[1.8rem] text-[#1d1d1f]">Quick <span className="gradient-text">estimate</span></h2>
          <p className="section-subtitle mx-auto mt-4 text-center">Tell us your exact model and issue — we&rsquo;ll confirm the price on WhatsApp.</p>
          <div className="mt-10">
            <QuoteWizard />
          </div>
        </div>
      </section>

      <section className="section-apple bg-[#f5f5f7]">
        <div className="mx-auto max-w-[1100px] px-6 lg:px-8">
          <h2 className="font-apple text-center text-[22px] font-bold text-[#1d1d1f]">More services</h2>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((r) => (
              <Link key={r.slug} href={`/services/${r.slug}`} className="group rounded-[22px] glass p-6 transition duration-300 hover:-translate-y-1 hover:shadow-xl">
                <span className="text-[24px]">{r.icon}</span>
                <div className="mt-3 font-apple text-[14px] font-bold text-[#1d1d1f]">{r.title}</div>
                <div className="mt-1 text-[12px] text-[#86868b]">{r.short}</div>
              </Link>
            ))}
          </div>
          <div className="mt-12 rounded-[28px] bg-[#1d1d1f] p-8 text-center text-white">
            <h3 className="font-apple text-[20px] font-bold">Not sure what&rsquo;s wrong?</h3>
            <p className="mx-auto mt-2 max-w-[440px] text-[13px] text-white/60">Bring it in for a free diagnosis — or WhatsApp us a photo and we&rsquo;ll take a look.</p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a href={wa(`Hi! I need help with ${page.title}. `)} target="_blank" rel="noopener noreferrer" className="cta-primary">WhatsApp Diagnosis</a>
              <a href={SITE.mapsUrl} target="_blank" rel="noopener noreferrer" className="cta-outline !text-white" style={{ borderColor: "rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.08)" }}>Visit Store</a>
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
