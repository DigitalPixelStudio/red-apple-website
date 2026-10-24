"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, MessageCircle, MapPin, Clock, Package, type LucideIcon } from "lucide-react";
import { trackConversion, CONVERSIONS } from "@/lib/gtag";

type IslandItem = {
  icon: LucideIcon;
  label: string;
  color: string;
  href: string;
  external?: boolean;
  onClick?: () => void;
};

const PHONE = "918660663776";
const WA_MSG = "Hi Red Apple Mobile Store, I need help with my Apple device.";
const MAPS = "https://share.google/Dj3VbuZuzR8mYbRgS";

export default function DynamicIsland() {
  const [expanded, setExpanded] = useState(false);

  const items: IslandItem[] = [
    {
      icon: Phone,
      label: "Call",
      color: "text-green-400",
      href: `tel:+${PHONE}`,
      onClick: () => trackConversion(CONVERSIONS.phone),
    },
    {
      icon: MessageCircle,
      label: "WhatsApp",
      color: "text-green-500",
      href: `https://wa.me/${PHONE}?text=${encodeURIComponent(WA_MSG)}`,
      onClick: () => trackConversion(CONVERSIONS.whatsapp),
    },
    { icon: Package, label: "Status", color: "text-blue-400", href: "#tracking" },
    { icon: MapPin, label: "Location", color: "text-orange-400", href: MAPS, external: true },
    { icon: Clock, label: "Hours", color: "text-purple-400", href: "#contact" },
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
                <motion.a
                  key={i}
                  href={item.href}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noopener" : undefined}
                  aria-label={item.label}
                  onClick={item.onClick}
                  className={`${item.color} hover:scale-110 transition`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <item.icon size={18} />
                </motion.a>
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
