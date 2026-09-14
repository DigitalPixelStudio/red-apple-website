"use client";
import { useScroll, useTransform } from "framer-motion";
import HeroSection from "@/sections/HeroSection";
import EcosystemSection from "@/sections/EcosystemSection";
import ServicesSection from "@/sections/ServicesSection";
import WhySection from "@/sections/WhySection";
import ProcessSection from "@/sections/ProcessSection";
import DeviceSelector from "@/sections/DeviceSelector";
import TrackingSection from "@/sections/TrackingSection";
import ReviewsSection from "@/sections/ReviewsSection";
import FAQSection from "@/sections/FAQSection";
import ContactSection from "@/sections/ContactSection";
import DynamicIsland from "@/components/DynamicIsland";
import RepairAssistant from "@/components/RepairAssistant";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Home() {
  const { scrollYProgress } = useScroll();
  const navOpacity = useTransform(scrollYProgress, [0, 0.05], [0, 1]);

  return (
    <main className="relative overflow-x-hidden bg-black">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="gradient-orb w-96 h-96 bg-purple-600 top-[-10%] left-[-10%]" />
        <div className="gradient-orb w-80 h-80 bg-blue-600 top-[50%] right-[-5%]" style={{ animationDelay: "-7s" }} />
        <div className="gradient-orb w-72 h-72 bg-indigo-900 bottom-[-10%] left-[20%]" style={{ animationDelay: "-14s" }} />
      </div>

      <Header />
      <Footer />
      <HeroSection />
      <EcosystemSection />
      <ServicesSection />
      <WhySection />
      <ProcessSection />
      <DeviceSelector />
      <TrackingSection />
      <ReviewsSection />
      <FAQSection />
      <ContactSection />
      <DynamicIsland />
      <RepairAssistant />
      <WhatsAppFloat />
    </main>
  );
}
