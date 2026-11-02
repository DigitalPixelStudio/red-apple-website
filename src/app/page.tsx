import { PickupSection } from "@/components/PickupSection";
import ScrollProgress from "@/components/ScrollProgress";
import MotionGovernor from "@/components/MotionGovernor";
import Navbar from "@/components/Navbar";
import DynamicIsland from "@/components/DynamicIsland";
import Hero from "@/components/Hero";
import TrustBar from "@/components/TrustBar";
import Gallery from "@/components/Gallery";
import CraftShowcase from "@/components/CraftShowcase";
import Ecosystem from "@/components/Ecosystem";
import DisplayFocus from "@/components/DisplayFocus";
import ServicesGrid from "@/components/ServicesGrid";
import TechProcess from "@/components/TechProcess";
import PartsCatalog from "@/components/PartsCatalog";
import SoftwareRecovery from "@/components/SoftwareRecovery";
import ProcessSection from "@/components/ProcessSection";
import WhyChooseUs from "@/components/WhyChooseUs";
import TrustProof from "@/components/TrustProof";
import PricingSection from "@/components/PricingSection";
import QuoteSection from "@/components/QuoteSection";
import ServicePromise from "@/components/ServicePromise";
import ReviewsSection from "@/components/ReviewsSection";
import FaqSection from "@/components/FaqSection";
import LocationSection from "@/components/LocationSection";
import FinalCta from "@/components/FinalCta";
import Footer from "@/components/Footer";
import Concierge from "@/components/Concierge";
import SmartNudge from "@/components/SmartNudge";
import Gifts from "@/components/Gifts";
import WhyUs from "@/components/WhyUs";
import StickyCta from "@/components/StickyCta";

/**
 * Section order is a conversion decision, not a design one.
 *
 *   1. Hero        — the promise, and the animated device
 *   2. TrustBar    — the numbers that remove the first doubt
 *   3. Gallery     — THE STORE, second. The owner's call, and the right one:
 *                    a repair shop's biggest objection is "is this a real
 *                    place?" Photographs answer it before anything is asked.
 *   4. Quote       — now that trust exists, let them price it
 *   5. Pickup      — and let them not come at all
 *   6. Craft       — before/after, the machines, and the CRM that invoices
 *   7. …everything else, deep detail for the reader who is still deciding
 */
export default function Home() {
  return (
    <main id="top" className="relative min-h-screen bg-white">
      <ScrollProgress />
      <MotionGovernor />
      <Navbar />
      <DynamicIsland />
      <div className="relative z-10">
        <Hero />
        <TrustBar />

        {/* ---- the store, up front, because trust is the first job ---- */}
        <Gallery />

        <QuoteSection />
        <PickupSection />

        {/* ---- the proof: results, the bench, the record ---- */}
        <CraftShowcase />

        <Ecosystem />
        <DisplayFocus />
        <TechProcess />
        <ServicesGrid />
        <PartsCatalog />
        <SoftwareRecovery />
        <ProcessSection />
        <WhyChooseUs />
        <WhyUs />
        <TrustProof />
        <PricingSection />
        <ServicePromise />
        <ReviewsSection />
        <FaqSection />
        <LocationSection />
        <FinalCta />
      </div>
      <Footer />
      <Concierge />
      <SmartNudge />
      <Gifts />
      <StickyCta />
    </main>
  );
}
