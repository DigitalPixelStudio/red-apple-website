"use client";
import Reveal from "./Reveal";
import SmartImg from "./SmartImg";
import { wa } from "@/lib/site";
import { track } from "@/lib/analytics";
import { LineIcon, type IconName } from "./Icons";

const ITEMS = [
  { icon: "settings" as IconName, title: "System Diagnostics & Signed Firmware Restore", desc: "Signed iOS, iPadOS and macOS restore workflows with boot-loop and update-failure diagnosis." },
  { icon: "refresh" as IconName, title: "Firmware & Restore", desc: "DFU and Recovery-mode restores, firmware updates, boot loops and stuck-Apple fixes." },
  { icon: "data" as IconName, title: "Board-Level Storage IC Repair", desc: "Storage IC and board-level diagnosis for inaccessible photos, chats and files. Outcome is never promised before assessment." },
  { icon: "shield" as IconName, title: "Owner-Verified Factory Restore Assistance", desc: "Factory restore guidance for owner-verified devices, with proof of ownership and account-side help. No passcode or security bypass." },
  { icon: "cpu" as IconName, title: "Performance Repair", desc: "Slow devices, overheating and battery drain — diagnosed and tuned at OS level." },
  { icon: "shield" as IconName, title: "Setup & Troubleshoot", desc: "Device migration, sync and configuration help. No passcode is requested at any point." },
];

export default function SoftwareRecovery() {
  return (
    <section id="software" className="software-section section-apple relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="software-grid" />
        <div className="software-glow software-glow-1" />
        <div className="software-glow software-glow-2" />
      </div>

      <div className="relative mx-auto max-w-[1200px] px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <Reveal>
            <p className="font-apple text-[12.5px] font-bold uppercase tracking-[0.22em] text-[var(--accent)]">Software &amp; Signed Restore</p>
            <h2 className="head-gradient section-title font-apple mt-3">
              Not Just Hardware —{" "}
              <span className="gradient-text">Your Data &amp; OS Too.</span>
            </h2>
            <p className="section-subtitle mt-5">
              A dedicated desk for operating systems, firmware and board-level storage
              faults — handled with Precision TBK Lab Equipment &amp; Signed Restore
              Workflows under a zero-passcode-first process.
            </p>
            <div className="software-os-row">
              {["iOS", "iPadOS", "macOS", "watchOS", "tvOS", "Firmware"].map((os) => (
                <span key={os} className="software-os-chip">{os}</span>
              ))}
            </div>
          </Reveal>

          <Reveal delay={120} className="hidden sm:block">
            <div className="software-visual" aria-hidden="true">
              <SmartImg
                src="/images/v5/data-recovery-bench.jpg"
                alt=""
                width={900}
                height={640}
                className="software-visual-img"
              />
              <span className="software-scanline" />
              <span className="software-badge">
                <LineIcon name="shield" size={12} /> Data-Safe First
              </span>
            </div>
          </Reveal>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ITEMS.map((it, i) => (
            <Reveal key={it.title} delay={(i % 3) * 70}>
              <div className="software-card group h-full">
                <span className="software-icon">
                  <LineIcon name={it.icon} size={21} />
                </span>
                <div className="min-w-0">
                  <h3 className="font-apple text-[15.5px] font-bold text-[var(--text)]">{it.title}</h3>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-[var(--text-muted)]">{it.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-12 text-center" delay={120}>
          <a
            href={wa("Hi! I have an Apple software / recovery issue. Can you help?")}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("whatsapp_click", { source: "software" })}
            className="cta-dark press"
          >
            <LineIcon name="chat" size={16} />
            Describe Your Issue on WhatsApp
          </a>
        </Reveal>
      </div>
    </section>
  );
}
