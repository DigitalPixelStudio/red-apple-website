"use client";
import { motion } from "framer-motion";
import { ArrowRight, Phone, Smartphone, Monitor } from "lucide-react";
import { trackConversion, CONVERSIONS } from "@/lib/gtag";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-950 to-black" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(120,80,255,0.1),transparent_50%)]" />

      <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 glass rounded-full px-5 py-2 mb-8"
        >
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-sm text-gray-400">Same-Day Repair • 30 Min • Free Diagnostics</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl md:text-7xl lg:text-8xl font-light tracking-tight mb-6 leading-none"
        >
          <span className="text-white">Your Apple</span><br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-white to-purple-400">
            Repaired Right
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Certified repair specialists for iPhone, iPad, Mac mini, Apple Watch &amp; AirPods.<br />
          Original-grade parts • 12-month warranty • 700+ five-star reviews
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <a href="#contact" className="bg-white text-black px-8 py-4 rounded-full font-medium hover:bg-gray-200 transition-all duration-300 text-lg flex items-center justify-center gap-2">
            Book a Repair <ArrowRight size={20} />
          </a>
          <a href="https://wa.me/918660663776" target="_blank" onClick={() => trackConversion(CONVERSIONS.whatsapp)} className="border border-white/20 text-white px-8 py-4 rounded-full hover:bg-white/5 transition text-lg flex items-center justify-center gap-2">
            💬 WhatsApp Us
          </a>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-20 grid grid-cols-3 gap-8 max-w-md mx-auto"
        >
          {[
            { num: "700+", label: "5-Star Reviews" },
            { num: "30 min", label: "Avg. Repair" },
            { num: "5000+", label: "Devices Fixed" },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl md:text-4xl font-poppins text-white font-light">{s.num}</div>
              <div className="text-xs md:text-sm text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-white/20 rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-white/50 rounded-full" />
        </div>
      </motion.div>
    </section>
  );
}
