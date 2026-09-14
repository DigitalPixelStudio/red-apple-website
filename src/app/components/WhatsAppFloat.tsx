"use client";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

export default function WhatsAppFloat() {
  const phone = "918660663776";
  const message = "Hi Red Apple Mobile Store, I need help with my Apple device.";
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  return (
    <a href={url} target="_blank" rel="noopener" className="fixed bottom-6 right-6 z-40">
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="bg-green-500 rounded-full w-14 h-14 flex items-center justify-center shadow-lg shadow-green-500/30"
      >
        <MessageCircle size={28} className="text-white" />
      </motion.div>
    </a>
  );
}
