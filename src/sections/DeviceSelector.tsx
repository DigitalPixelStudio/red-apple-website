"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Smartphone, Tablet, Monitor, Watch, Headphones, ChevronRight, Search } from "lucide-react";
import { trackConversion, CONVERSIONS } from "@/lib/gtag";

const deviceData = {
  iPhone: { models: ["16 Pro Max", "16 Pro", "16", "15 Pro", "15", "14", "13", "12", "SE"], problems: ["Screen cracked", "Battery draining", "Not charging", "Camera issue", "Face ID not working", "Water damage", "Speaker issue"] },
  iPad: { models: ["Pro 12.9\"", "Pro 11\"", "Air", "Mini", "10th Gen", "9th Gen"], problems: ["Display flickering", "Battery", "Home button", "Charging port", "Slow performance"] },
  "Mac mini": { models: ["M4", "M3", "M2", "M1"], problems: ["Won't start", "Screen issue", "Keyboard", "Overheating", "Ports not working"] },
  "Apple Watch": { models: ["Ultra 2", "Ultra", "Series 10", "9", "8", "SE"], problems: ["Screen damage", "Band issue", "Battery", "Charging", "Water ingress"] },
  AirPods: { models: ["Pro 2", "Pro", "Max", "3", "2", "SE"], problems: ["One side dead", "Case issue", "Connection drops", "Battery", "Sound quality"] },
};

export default function DeviceSelector() {
  const [device, setDevice] = useState("");
  const [model, setModel] = useState("");
  const [problem, setProblem] = useState("");

  const devices = Object.keys(deviceData);
  const models = device ? deviceData[device as keyof typeof deviceData].models : [];
  const problems = device ? deviceData[device as keyof typeof deviceData].problems : [];

  const phone = "918660663776";
  const msg = `Hi Red Apple, I need help with my ${model || device}. ${problem || ""}`;
  const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;

  return (
    <section id="selector" className="py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center mb-12">
          <span className="text-sm text-gray-500 uppercase tracking-widest">Quick Identify</span>
          <h2 className="text-4xl md:text-5xl font-poppins font-light mt-4 text-white">Find Your Repair</h2>
          <p className="text-gray-500 mt-4">Select your device, model, and problem</p>
        </motion.div>

        <motion.div className="glass rounded-3xl p-8 space-y-6" initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }}>
          {/* Step 1: Device */}
          <div>
            <label className="text-sm text-gray-500 mb-2 block">Choose Device</label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {devices.map((d) => (
                <button key={d} onClick={() => { setDevice(d); setModel(""); setProblem(""); }}
                  className={`py-3 rounded-xl text-sm font-medium transition ${device === d ? "bg-white text-black" : "bg-white/5 text-gray-400 hover:bg-white/10"}`}>
                  {d === "iPhone" ? "📱" : d === "iPad" ? "📱" : d === "Mac mini" ? "💻" : d === "Apple Watch" ? "⌚" : "🎧"} {d}
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Model */}
          <AnimatePresence mode="wait">
            {models.length > 0 && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                <label className="text-sm text-gray-500 mb-2 block">Select Model</label>
                <div className="flex flex-wrap gap-2">
                  {models.map((m) => (
                    <button key={m} onClick={() => setModel(m)}
                      className={`px-4 py-2 rounded-full text-sm transition ${model === m ? "bg-purple-500 text-white" : "bg-white/5 text-gray-400 hover:bg-white/10"}`}>
                      {m}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step 3: Problem */}
          <AnimatePresence mode="wait">
            {problems.length > 0 && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                <label className="text-sm text-gray-500 mb-2 block">What&apos;s the issue?</label>
                <div className="flex flex-wrap gap-2">
                  {problems.map((p) => (
                    <button key={p} onClick={() => setProblem(p)}
                      className={`px-4 py-2 rounded-full text-sm transition ${problem === p ? "bg-blue-500 text-white" : "bg-white/5 text-gray-400 hover:bg-white/10"}`}>
                      {p}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* CTA */}
          <AnimatePresence>
            {device && (
              <motion.a href={waUrl} target="_blank" rel="noopener"
                onClick={() => trackConversion(CONVERSIONS.whatsapp)}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="bg-green-500 text-white px-8 py-4 rounded-full font-medium text-center block hover:bg-green-400 transition flex items-center justify-center gap-2">
                💬 Get Repair Quote on WhatsApp <ChevronRight size={20} />
              </motion.a>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
