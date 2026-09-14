"use client";
import { motion, useScroll, useTransform } from "framer-motion";

export default function Header() {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.05], [0, 1]);

  return (
    <motion.nav style={{ opacity }} className="fixed top-0 left-0 right-0 z-50 glass px-6 py-4 flex items-center justify-between backdrop-blur-xl">
      <a href="/" className="text-2xl font-poppins font-light text-white flex items-center gap-2">
        <span className="text-2xl">🍎</span> <span className="text-white">Red Apple</span>
      </a>
      <div className="hidden md:flex gap-8 text-sm text-gray-400">
        {["Services", "Ecosystem", "Process", "Reviews", "Contact"].map((l) => (
          <a key={l} href={`#${l.toLowerCase()}`} className="hover:text-white transition">{l}</a>
        ))}
      </div>
      <a href="#contact" className="bg-white text-black px-5 py-2.5 rounded-full text-sm font-medium hover:bg-gray-200 transition">Book Repair</a>
    </motion.nav>
  );
}
