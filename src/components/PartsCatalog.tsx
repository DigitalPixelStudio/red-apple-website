"use client";
import Reveal from "./Reveal";
import SmartImg from "./SmartImg";
import { LineIcon, type IconName } from "./Icons";

const PARTS: { name: string; device: string; quality: string; img: string; icon: IconName }[] = [
  { name: "OLED Display Panel", device: "iPhone 14 / 15 / 16 Series", quality: "OEM-grade True Tone", img: "/images/v5/display-panel.jpg", icon: "display" },
  { name: "Battery Cell", device: "iPhone, iPad, MacBook", quality: "Genuine capacity cells", img: "/images/v5/battery-cell.jpg", icon: "battery" },
  { name: "Back Glass Panel", device: "iPhone 13 / 14 / 15 / 16", quality: "MagSafe compatible", img: "/images/v5/back-glass.jpg", icon: "backglass" },
  { name: "Camera Module", device: "iPhone 14 Pro / 15 Pro / 16 Pro", quality: "OEM sensor assembly", img: "/images/v5/triple-camera.jpg", icon: "camera" },
  { name: "Charging Port Flex", device: "iPhone, iPad, AirPods", quality: "Precision connector", img: "/images/v5/charging-port-flex.jpg", icon: "charging" },
  { name: "Logic Board Components", device: "MacBook, iPhone, iPad", quality: "Micro-soldered IC chips", img: "/images/v5/motherboard-macro.jpg", icon: "board" },
];

export default function PartsCatalog() {
  return (
    <section className="section-apple bg-white">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-8">
        <Reveal className="text-center">
          <span className="kicker">Quality Parts</span>
          <h2 className="head-gradient breath-heading section-title font-apple mt-3 text-[var(--text)]">
            Only the Best Parts <span className="topic-gradient">for Your Device.</span>
          </h2>
          <p className="section-subtitle mx-auto mt-5">
            We use OEM-grade, genuine-quality components sourced from trusted suppliers.
            Every part is tested before installation.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PARTS.map((p, i) => (
            <Reveal key={p.name} delay={i * 60}>
              <div className="group spotlight-card hv-lift sweep-shine tile-wash overflow-hidden rounded-[22px] border border-white/90 transition duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className="relative h-44 overflow-hidden">
                  <div className="glass-image-shell h-full w-full">
                    <SmartImg
                      src={p.img}
                      alt={`${p.name} — ${p.quality}`}
                      width={800}
                      height={520}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                  <div className="absolute bottom-3 left-3 flex items-center gap-2">
                    <span className="icon-glow grid h-9 w-9 place-items-center rounded-xl">
                      <LineIcon name={p.icon} size={18} />
                    </span>
                    <span className="rounded-full bg-green-600 px-2.5 py-1 text-[10px] font-bold text-white">{p.quality}</span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="breath-heading text-[15px] font-extrabold tracking-tight text-[var(--text)]">{p.name}</h3>
                  <p className="mt-1 text-[12.5px] text-[var(--text-muted)]">{p.device}</p>
                  <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-[var(--accent)]">
                    <LineIcon name="shield" size={13} /> Tested &amp; certified before installation
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
