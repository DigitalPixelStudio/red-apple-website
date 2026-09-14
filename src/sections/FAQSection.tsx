"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Phone } from "lucide-react";

const faqs = [
  { q: "How long does iPhone screen repair take?", a: "Most iPhone screen repairs are completed in 30-45 minutes. We use original-grade LCD/OLED panels with a 12-month warranty." },
  { q: "What is the cost of iPhone battery replacement?", a: "Battery replacement starts at ₹799. We use premium-grade batteries with a 12-month warranty. Free diagnostics before repair." },
  { q: "Do you use original or aftermarket parts?", a: "We use premium-grade parts that match original quality standards. They are 40-50% cheaper than authorized Apple centers while maintaining excellent performance." },
  { q: "Can you fix water-damaged devices?", a: "Yes! We perform full diagnostics on water-damaged devices. The process takes 24-48 hours depending on severity. We don&apos;t charge if we can&apos;t fix it." },
  { q: "Do you offer pickup and drop service?", a: "Yes! We offer free pickup and drop within Bengaluru for most repairs. Just call or WhatsApp to schedule." },
  { q: "What happens to my data during repair?", a: "Your data is completely safe. We never access personal data unless specifically requested. All repairs are done with full privacy protection." },
  { q: "Is there a warranty on repairs?", a: "Yes, all repairs come with a 12-month warranty on parts and labor. Original-grade components only." },
  { q: "Can you repair Mac mini and iMac?", a: "Yes! We specialize in Mac mini repairs including logic board, screen, battery, keyboard, and startup issues. All models supported." },
  { q: "How do I book a repair?", a: "You can book via WhatsApp at +91 8660 663 776, call us directly, or use the Device Selector on this website to generate a WhatsApp enquiry." },
];

export default function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 px-4 bg-gradient-to-b from-black via-gray-950 to-black">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center mb-16">
          <span className="text-sm text-gray-500 uppercase tracking-widest">FAQ</span>
          <h2 className="text-4xl md:text-5xl font-poppins font-light mt-4 text-white">Frequently Asked Questions</h2>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="glass rounded-xl overflow-hidden">
              <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between p-6 text-left">
                <span className="text-white text-sm font-medium pr-4">{f.q}</span>
                {open === i ? <ChevronUp size={20} className="text-gray-400 shrink-0" /> : <ChevronDown size={20} className="text-gray-400 shrink-0" />}
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} transition={{ duration: 0.3 }} className="px-6 pb-6">
                    <p className="text-gray-400 text-sm leading-relaxed">{f.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.8 }} className="text-center mt-12">
          <p className="text-gray-500 text-sm">Still have questions?</p>
          <a href="https://wa.me/918660663776" target="_blank" className="inline-flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-full font-medium mt-4 hover:bg-green-400 transition">
            💬 Ask on WhatsApp
          </a>
        </motion.div>
      </div>
    </section>
  );
}
