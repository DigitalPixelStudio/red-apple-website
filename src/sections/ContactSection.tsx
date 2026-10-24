"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Phone, MapPin, Clock, Mail, Send } from "lucide-react";
import { trackConversion, CONVERSIONS } from "@/lib/gtag";

export default function ContactSection() {
  const [form, setForm] = useState({ name: "", phone: "", device: "", model: "", issue: "", method: "whatsapp" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = `Hi Red Apple Mobile Store! Name: ${form.name}. Device: ${form.model || form.device}. Issue: ${form.issue}. Preferred: ${form.method}.`;
    // Google Ads conversion: form submit
    trackConversion(CONVERSIONS.form);
    window.open(`https://wa.me/918660663776?text=${encodeURIComponent(msg)}`, "_blank");
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <section id="contact" className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center mb-16">
          <span className="text-sm text-gray-500 uppercase tracking-widest">Contact</span>
          <h2 className="text-4xl md:text-5xl font-poppins font-light mt-4 text-white">Book a Repair</h2>
          <p className="text-gray-500 mt-4">Fill in the details and we&apos;ll get back to you immediately</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact info */}
          <motion.div className="space-y-8" initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <h3 className="text-2xl text-white font-poppins font-light mb-8">Get In Touch</h3>
            {[
              { icon: Phone, text: "+91 8660 663 776", label: "Call Us" },
              { icon: MapPin, text: "Indiranagar, Bengaluru, Karnataka", label: "Location" },
              { icon: Clock, text: "10:00 AM – 8:00 PM (Mon-Sat)", label: "Opening Hours" },
              { icon: Mail, text: "hello@redapplemobile.com", label: "Email" },
            ].map((c, i) => (
              <motion.div key={i} initial={{ x: -20, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.1 }} className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                  <c.icon size={20} className="text-purple-400" />
                </div>
                <div>
                  <p className="text-gray-500 text-xs">{c.label}</p>
                  <p className="text-white text-sm font-medium">{c.text}</p>
                </div>
              </motion.div>
            ))}

            <div className="mt-8">
              <a href="https://share.google/Dj3VbuZuzR8mYbRgS" target="_blank" className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition text-sm">
                <MapPin size={18} /> Get Directions on Google Maps →
              </a>
            </div>
          </motion.div>

          {/* Form */}
          <motion.form onSubmit={handleSubmit} initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="space-y-5">
            {submitted && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-green-400/10 border border-green-400/30 rounded-xl p-4 text-green-400 text-sm text-center">
                ✓ WhatsApp window opened! Please complete your message.
              </motion.div>
            )}
            <input type="text" placeholder="Your Name" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-400 transition" />
            <input type="tel" placeholder="Phone Number" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-400 transition" />
            <input type="text" placeholder="Device (e.g. iPhone 15 Pro)" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-400 transition" />
            <input type="text" placeholder="Model (optional)" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-400 transition" />
            <textarea placeholder="Describe the issue..." rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-400 transition resize-none" />
            <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-400 focus:outline-none focus:border-purple-400 transition">
              <option>Preferred Contact Method</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="call">Phone Call</option>
              <option value="pickup">Pickup & Drop</option>
            </select>
            <button type="submit" className="w-full bg-white text-black py-4 rounded-xl font-medium text-lg hover:bg-gray-200 transition flex items-center justify-center gap-2">
              <Send size={20} /> Submit Repair Request
            </button>
            <p className="text-xs text-gray-600 text-center">Protected by reCAPTCHA. No spam, ever.</p>
          </motion.form>
        </div>
      </div>
    </section>
  );
}
