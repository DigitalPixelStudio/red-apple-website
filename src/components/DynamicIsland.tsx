"use client";
import { useEffect, useState } from "react";
import { track } from "@/lib/analytics";
import { LineIcon, type IconName } from "./Icons";

const STATES = [
  { icon: "display" as IconName, text: "iPhone display replaced in ~45 min", sub: "True Tone preserved · 90-day warranty" },
  { icon: "backglass" as IconName, text: "Back glass repair, MagSafe-compatible", sub: "Laser-aligned · seamless finish" },
  { icon: "watch" as IconName, text: "Apple Watch battery swap", sub: "All Series · fast turnaround" },
  { icon: "data" as IconName, text: "Data recovery before repair", sub: "Photos, chats & files saved first" },
  { icon: "car" as IconName, text: "Free pickup & drop in Bengaluru", sub: "WhatsApp us your location" },
];

export default function DynamicIsland() {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % STATES.length), 3200);
    const show = setTimeout(() => setVisible(true), 600);
    return () => { clearInterval(t); clearTimeout(show); };
  }, []);

  const s = STATES[idx];

  return (
    <div
      className={`fixed left-1/2 top-[70px] z-40 -translate-x-1/2 transition-all duration-700 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
      }`}
    >
      <a
        href="#quote"
        onClick={() => track("quote_started", { source: "dynamic_island" })}
        className="dynamic-island hidden items-center gap-3 rounded-full px-5 py-2.5 text-white md:flex"
      >
        <span className="grid h-8 w-8 place-items-center rounded-full bg-white/10">
          <LineIcon name={s.icon} size={16} />
        </span>
        <span className="leading-tight">
          <span className="block text-[12.5px] font-semibold">{s.text}</span>
          <span className="block text-[10.5px] text-white/60">{s.sub}</span>
        </span>
        <span className="relative ml-1 flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-60" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-400" />
        </span>
      </a>
    </div>
  );
}
