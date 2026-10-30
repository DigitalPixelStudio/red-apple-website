"use client";
import Reveal from "./Reveal";
import { SERVICES, wa } from "@/lib/site";
import { track } from "@/lib/analytics";
import { LineIcon, type IconName } from "./Icons";

export default function ServicesGrid() {
  return (
    <section id="repairs" className="section-apple bg-white">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-8">
        <Reveal className="text-center">
          <p className="font-apple text-[12.5px] font-bold uppercase tracking-[0.22em] text-[var(--accent)]">Repair services</p>
          <h2 className="section-title font-apple mt-3 text-[var(--text)]">Every repair. <span className="gradient-text">One expert team.</span></h2>
          <p className="section-subtitle mx-auto mt-5">Hardware and software — handled by technicians who work on Apple devices every single day.</p>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s, i) => (
            <Reveal key={s.id} delay={(i % 3) * 80}>
              <div className={`group relative flex h-full flex-col rounded-[26px] overflow-hidden transition-all duration-300 hover:-translate-y-1.5 ${
                s.featured ? "shadow-xl" : ""
              }`}>
                <div className="relative h-40 overflow-hidden">
                  <img src={s.img} alt={s.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/20 backdrop-blur-sm">
                          <LineIcon name={s.icon as IconName} size={18} color="#fff" />
                        </span>
                        <span className="text-[13px] font-bold text-white">{s.title}</span>
                      </div>
                      <span className="text-[11px] font-semibold text-white/70">{s.time}</span>
                    </div>
                  </div>
                </div>
                <div className={`p-6 ${s.featured ? "bg-[var(--cta-dark)] text-white" : "bg-white"}`}>
                  <p className={`text-[13px] leading-relaxed ${s.featured ? "text-white/70" : "text-[var(--text-muted)]"}`}>{s.desc}</p>
                  <p className={`mt-2 text-[11.5px] font-semibold ${s.featured ? "text-[var(--accent2)]" : "text-[var(--accent)]"}`}>{s.devices}</p>
                  <ul className={`mt-3 space-y-1.5 text-[12px] ${s.featured ? "text-white/70" : "text-[var(--text-light)]"}`}>
                    {s.points.map((p) => (
                      <li key={p} className="flex items-center gap-1.5"><LineIcon name="check" size={14} className="text-green-500 shrink-0" />{p}</li>
                    ))}
                  </ul>
                  <a
                    href={wa(`Hi! I need ${s.title}. Please share an estimate.`)}
                    target="_blank" rel="noopener noreferrer"
                    onClick={() => track("whatsapp_click", { source: "services", service: s.title })}
                    className={`mt-4 inline-flex items-center justify-center gap-1.5 rounded-[var(--cta-radius)] px-5 py-2.5 text-[12.5px] font-bold transition-all press ${
                      s.featured ? "bg-white text-[var(--text)] hover:bg-white/90" : "bg-[var(--cta-dark)] text-white hover:opacity-90"
                    }`}
                  >
                    <LineIcon name="chat" size={14} />
                    Get estimate
                  </a>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
