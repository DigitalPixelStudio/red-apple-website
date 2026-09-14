"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, MessageCircle, MapPin, Clock, Package } from "lucide-react";

export default function DynamicIsland() {
  const [expanded, setExpanded] = useState(false);

  const items = [
    { icon: Phone, label: "Call", color: "text-green-400" },
    { icon: MessageCircle, label: "WhatsApp", color: "text-green-500" },
    { icon: Package, label: "Status", color: "text-blue-400" },
    { icon: MapPin, label: "Location", color: "text-orange-400" },
    { icon: Clock, label: "Hours", color: "text-purple-400" },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
      <motion.div
        className="dynamic-island"
        onClick={() => setExpanded(!expanded)}
        animate={expanded ? { width: 300 } : { width: 120 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <AnimatePresence mode="wait">
          {expanded ? (
            <motion.div key="expanded" className="flex gap-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {items.map((item, i) => (
                <motion.button key={i} className={`${item.color} hover:scale-110 transition`} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.1 }}>
                  <item.icon size={18} />
                </motion.button>
              ))}
            </motion.div>
          ) : (
            <span className="text-xs text-gray-400">🍎 Red Apple</span>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
