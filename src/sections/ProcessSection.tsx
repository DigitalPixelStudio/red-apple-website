"use client";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

const steps = [
  { num: "01", title: "Book / Contact", desc: "Call, WhatsApp, or book online. Free consultation." },
  { num: "02", title: "Device Inspection", desc: "Detailed diagnostics. Honest assessment of issues." },
  { num: "03", title: "Price Quote", desc: "Transparent pricing before any repair work." },
  { num: "04", title: "Repair", desc: "Expert technicians fix with original-grade parts." },
  { num: "05", title: "Test & Return", desc: "Full quality check, 12-month warranty, collect." },
];

export default function ProcessSection() {
  return (
    <section id="process" className="py-24 px-4 bg-gradient-to-b from-black via-gray-950 to-black">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center mb-20">
          <span className="text-sm text-gray-500 uppercase tracking-widest">How It Works</span>
          <h2 className="text-4xl md:text-5xl font-poppins font-light mt-4 text-white">4 Simple Steps</h2>
          <p className="text-gray-500 mt-4">From contact to collection — seamless experience</p>
        </motion.div>

        <div className="relative">
          {/* Connecting line */}
          <div className="hidden lg:block absolute top-14 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {steps.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                className="text-center relative"
              >
                <div className="w-28 h-28 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-2xl font-poppins text-white font-light relative z-10 hover:border-purple-400/50 hover:bg-white/10 transition-all duration-300">
                  {s.num}
                </div>
                <h3 className="text-lg text-white mt-6 mb-2">{s.title}</h3>
                <p className="text-gray-500 text-xs max-w-[160px] mx-auto">{s.desc}</p>
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-14 left-full w-full -translate-x-1/2">
                    <Check className="text-white/20" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
