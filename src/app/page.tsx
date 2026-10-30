import { PickupSection } from "@/components/PickupSection";
import ScrollProgress from "@/components/ScrollProgress";
import Navbar from "@/components/Navbar";
import DynamicIsland from "@/components/DynamicIsland";
import Hero from "@/components/Hero";
import TrustBar from "@/components/TrustBar";
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
import Gallery from "@/components/Gallery";
import StickyCta from "@/components/StickyCta";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-white">
      <ScrollProgress />
      <Navbar />
      <DynamicIsland />
      <div className="relative z-10">
        <Hero />
        <TrustBar />
      <QuoteSection />
      <PickupSection />
      <Gallery />
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
