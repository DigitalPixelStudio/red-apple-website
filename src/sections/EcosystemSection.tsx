"use client";
import { motion } from "framer-motion";
import { Smartphone, Tablet, Monitor, Watch, Headphones } from "lucide-react";

const devices = [
  {
    name: "iPhone", icon: Smartphone,
    models: "16 Pro Max, 16 Pro, 16, 15 Pro, 15, 14, 13, 12, SE",
    color: "from-gray-300 to-gray-500",
    issues: ["Screen","Battery","Charging","Camera","Face ID","Water"],
  },
  {
    name: "iPad", icon: Tablet,
    models: "Pro, Air, Mini, 10th Gen, 9th Gen",
    color: "from-blue-300 to-blue-500",
    issues: ["Display","Battery","Home Button","Charging","Logic Board"],
  },
  {
    name: "Mac mini", icon: Monitor,
    models: "M4, M3, M2, M1 — All Models",
    color: "from-gray-400 to-gray-600",
    issues: ["Screen","Battery","Keyboard","Logic Board","Ports","Startup"],
  },
  {
    name: "Apple Watch", icon: Watch,
    models: "Ultra 2, Ultra, Series 10, 9, 8, SE",
    color: "from-purple-400 to-purple-600",
    issues: ["Screen","Band","Battery","Charging","Water Damage"],
  },
  {
    name: "AirPods", icon: Headphones,
    models: "Pro 2, Pro, Max, 3, 2, SE",
    color: "from-green-400 to-green-600",
    issues: ["Battery","Speaker","Case","Connectivity","Firmware"],
  },
];

export default function EcosystemSection() {
  return (
    <section id="ecosystem" className="py-24 px-4 relative">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center mb-16">
          <span className="text-sm text-gray-500 uppercase tracking-widest">Apple Ecosystem</span>
          <h2 className="text-4xl md:text-5xl font-poppins font-light mt-4 text-white">Every Device Covered</h2>
          <p className="text-gray-500 mt-4">Premium repair for the entire Apple lineup</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
          {devices.map((d, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              whileHover={{ scale: 1.03, y: -5 }}
              className="glass glass-hover rounded-3xl p-8 text-center cursor-pointer group"
            >
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${d.color} mx-auto flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <d.icon size={36} className="text-white" />
              </div>
              <h3 className="text-xl text-white font-medium mb-2">{d.name}</h3>
              <p className="text-gray-400 text-xs mb-4">{d.models}</p>
              <div className="flex flex-wrap gap-1 justify-center">
                {d.issues.slice(0, 3).map((issue, j) => (
                  <span key={j} className="text-[10px] bg-white/5 px-2 py-1 rounded-full text-gray-400">{issue}</span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
