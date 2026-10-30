"use client";
import Reveal from "./Reveal";
import { LineIcon } from "./Icons";

const PARTS = [
  { name: "OLED Display Panel", device: "iPhone 14 / 15 / 16 Series", quality: "OEM-Grade True Tone", img: "/images/v4/oled-display-panel.jpg", icon: "display" },
  { name: "Battery Cell", device: "iPhone, iPad, MacBook", quality: "Genuine Capacity Cells", img: "/images/v4/iphone-battery.jpg", icon: "battery" },
  { name: "Back Glass Panel", device: "iPhone 13 / 14 / 15 / 16", quality: "MagSafe Compatible", img: "/images/v3/iphone-backglass.jpg", icon: "backglass" },
  { name: "Camera Module", device: "iPhone 14 Pro / 15 Pro / 16 Pro", quality: "OEM Sensor Assembly", img: "/images/v4/camera-repair.jpg", icon: "camera" },
  { name: "Charging Port Flex", device: "iPhone, iPad, AirPods", quality: "Precision Connector", img: "/images/v3/charging-port.jpg", icon: "charging" },
  { name: "Logic Board Components", device: "MacBook, iPhone, iPad", quality: "Micro-soldered IC Chips", img: "/images/v4/logic-board-real.jpg", icon: "board" },
];

export default function PartsCatalog() {
  return (
    <section className="section-apple bg-white">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-8">
        <Reveal className="text-center">
          <p className="font-apple text-[12.5px] font-bold uppercase tracking-[0.22em] text-[var(--accent)]">Quality Parts</p>
          <h2 className="section-title font-apple mt-3 text-[var(--text)]">Only the best parts <span className="gradient-text">for your device.</span></h2>
          <p className="section-subtitle mx-auto mt-5">We use OEM-grade, genuine-quality components sourced from trusted suppliers. Every part is tested before installation.</p>
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PARTS.map((p, i) => (
            <Reveal key={i} delay={i * 60}>
              <div className="group spotlight-card sweep-shine rounded-[22px] overflow-hidden bg-[var(--bg-alt)] border border-black/[0.04] hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="relative h-44 overflow-hidden">
                  <img src={p.img} alt={p.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-3 left-3 flex items-center gap-2">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/20 backdrop-blur-sm">
                      <LineIcon name={p.icon as any} size={18} color="#fff" />
                    </span>
                    <span className="rounded-full bg-green-500/90 backdrop-blur-sm px-2.5 py-1 text-[10px] font-bold text-white">{p.quality}</span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-[15px] font-bold text-[var(--text)]">{p.name}</h3>
                  <p className="mt-1 text-[12.5px] text-[var(--text-muted)]">{p.device}</p>
                  <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-[var(--accent)]">
                    <LineIcon name="shield" size={13} /> Tested & certified before installation
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
