"use client";
import { motion } from "framer-motion";
import { Wrench, Battery, GlassWater, Camera, Volume2, Zap, Droplets, Brain, Scan, Signal, Stethoscope } from "lucide-react";

const services = [
  { icon: GlassWater, title: "Screen Repair", desc: "LCD, OLED, Retina display replacement. Original-grade panels.", time: "30 min", price: "₹999" },
  { icon: Battery, title: "Battery Replacement", desc: "Genuine Apple battery with 12-month warranty.", time: "20 min", price: "₹799" },
  { icon: GlassWater, title: "Back Glass Repair", desc: "Frame and back panel replacement for all models.", time: "1 hour", price: "₹1299" },
  { icon: Camera, title: "Camera Repair", desc: "Front/rear camera replacement, flash repair.", time: "45 min", price: "₹1499" },
  { icon: Volume2, title: "Speaker/Mic Repair", desc: "Speaker, microphone, earpiece replacement.", time: "30 min", price: "₹1099" },
  { icon: Zap, title: "Charging Port", desc: "Lightning/USB-C port repair, charging issues.", time: "1 hour", price: "₹1299" },
  { icon: Droplets, title: "Liquid Damage", desc: "Full diagnostic, component cleaning & repair.", time: "24-48h", price: "₹2499" },
  { icon: Brain, title: "Software Repair", desc: "iOS/iPadOS/macOS troubleshooting, data recovery.", time: "2-3 hours", price: "₹999" },
  { icon: Scan, title: "Face ID Diagnostics", desc: "Face ID sensor repair, calibration, replacement.", time: "1 hour", price: "₹1999" },
  { icon: Signal, title: "Connectivity", desc: "Wi-Fi, Bluetooth, cellular, antenna issues.", time: "2 hours", price: "₹1799" },
  { icon: Stethoscope, title: "General Diagnostics", desc: "Complete health check, free diagnostic report.", time: "15 min", price: "FREE" },
  { icon: Wrench, title: "Motherboard", desc: "Micro-soldering, IC-level repair, logic board.", time: "3-7 days", price: "₹3999" },
];

export default function ServicesSection() {
  return (
    <section id="services" className="py-24 px-4 bg-gradient-to-b from-black via-gray-950 to-black">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center mb-16">
          <span className="text-sm text-gray-500 uppercase tracking-widest">Repair Services</span>
          <h2 className="text-4xl md:text-5xl font-poppins font-light mt-4 text-white">Everything We Fix</h2>
          <p className="text-gray-500 mt-4">Comprehensive repair services for all Apple devices</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.03, y: -4 }}
              transition={{ duration: 0.3 }}
              className="glass glass-hover rounded-2xl p-6 hover:border-white/20 transition-all duration-300 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition">
                  <s.icon size={24} className="text-gray-300" />
                </div>
                <span className={`text-xs px-3 py-1 rounded-full ${s.price === "FREE" ? "bg-green-400/10 text-green-400" : "bg-white/5 text-gray-400"}`}>
                  {s.price}
                </span>
              </div>
              <h3 className="text-lg text-white font-medium mb-1">{s.title}</h3>
              <p className="text-gray-500 text-sm mb-3">{s.desc}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">{s.time}</span>
                <span className="text-xs text-purple-400 group-hover:text-purple-300 transition">Book →</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
