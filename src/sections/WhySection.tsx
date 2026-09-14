"use client";
import { motion } from "framer-motion";
import { Check, Clock, Shield, Package, User, Star, MapPin, Award } from "lucide-react";

const reasons = [
  { icon: Star, title: "700+ 5-Star Reviews", desc: "Trusted by thousands of customers across Bengaluru" },
  { icon: Award, title: "10+ Years Experience", desc: "Expert technicians with deep Apple knowledge" },
  { icon: Shield, title: "Original Parts", desc: "Premium-grade components with 12-month warranty" },
  { icon: Clock, title: "30-Minute Turnaround", desc: "Screen and battery repairs often done same-day" },
  { icon: Package, title: "Free Diagnostics", desc: "Honest assessment before any repair work begins" },
  { icon: User, title: "Certified Technicians", desc: "Trained in micro-soldering and IC-level repair" },
];

const trustItems = [
  "🍎 Apple-specialized since 2014",
  "📍 Located near Halasuru Metro, Indiranagar",
  "💰 40-50% cheaper than authorized centers",
  "🔍 Detailed diagnostics before any charge",
  "📋 Transparent pricing — no hidden fees",
  "📦 Free pickup & drop available",
];

export default function WhySection() {
  return (
    <section id="why" className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center mb-16">
          <span className="text-sm text-gray-500 uppercase tracking-widest">Why Red Apple</span>
          <h2 className="text-4xl md:text-5xl font-poppins font-light mt-4 text-white">Trusted by <span className="text-purple-400">700+</span> Customers</h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {reasons.map((r, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass rounded-2xl p-8 hover:bg-white/10 transition group">
              <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:bg-white/10 transition">
                <r.icon size={28} className="text-purple-400" />
              </div>
              <h3 className="text-xl text-white font-medium mb-2">{r.title}</h3>
              <p className="text-gray-400 text-sm">{r.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Trust badges */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.5 }} className="glass rounded-3xl p-8">
          <h3 className="text-2xl text-white font-poppins font-light mb-6 text-center">What Makes Us Different</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {trustItems.map((item, i) => (
              <motion.div key={i} className="flex items-center gap-3 text-gray-300 text-sm" initial={{ x: -20, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.1 }}>
                <span className="text-green-400">✓</span> {item}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
