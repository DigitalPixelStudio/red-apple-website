"use client";
import { motion } from "framer-motion";
import { Package, Search, CheckCircle, Wrench, FlaskConical, Truck, MapPin } from "lucide-react";

const steps = [
  { icon: Package, label: "Device Received", desc: "Your device is logged in" },
  { icon: Search, label: "Inspection", desc: "Detailed diagnostic begins" },
  { icon: FlaskConical, label: "Diagnostics", desc: "Root cause identified" },
  { icon: Wrench, label: "Repair", desc: "Expert technician working" },
  { icon: CheckCircle, label: "Quality Check", desc: "Full testing completed" },
  { icon: Truck, label: "Shipped/Collected", desc: "Ready for pickup or delivery" },
];

export default function TrackingSection() {
  return (
    <section id="tracking" className="py-24 px-4 bg-gradient-to-b from-black via-gray-950 to-black">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center mb-16">
          <span className="text-sm text-gray-500 uppercase tracking-widest">Repair Status</span>
          <h2 className="text-4xl md:text-5xl font-poppins font-light mt-4 text-white">Track Your Repair</h2>
          <p className="text-gray-500 mt-4">Real-time status updates every step of the way</p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          <div className="absolute top-12 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white/10 to-transparent hidden lg:block" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {steps.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="text-center relative">
                <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto relative z-10 hover:border-purple-400/50 hover:bg-white/10 transition">
                  <s.icon size={28} className="text-gray-400" />
                </div>
                <h4 className="text-sm text-white mt-4 font-medium">{s.label}</h4>
                <p className="text-xs text-gray-500 mt-1">{s.desc}</p>
                <div className="hidden lg:block absolute -bottom-2 left-1/2 -translate-x-1/2">
                  <div className="w-3 h-3 bg-white/20 rounded-full" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Track input (frontend architecture for backend) */}
        <motion.div className="mt-16 glass rounded-2xl p-8 max-w-md mx-auto text-center" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <p className="text-gray-400 text-sm mb-4">Enter your repair tracking ID</p>
          <div className="flex gap-2">
            <input type="text" placeholder="RA-XXXX-XXXX" className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-400 transition" />
            <button className="bg-white text-black px-6 py-3 rounded-xl font-medium text-sm hover:bg-gray-200 transition">Track</button>
          </div>
          <p className="text-xs text-gray-600 mt-3">Architecture ready for backend integration</p>
        </motion.div>
      </div>
    </section>
  );
}
