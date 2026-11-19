"use client";

import { useState } from "react";
import Reveal from "./Reveal";
import { LineIcon, type IconName } from "./Icons";
import { PRICING_GROUPS, SITE } from "@/lib/site";

export default function PricingSection() {
  const [active, setActive] = useState(0);
  const group = PRICING_GROUPS[active];

  return (
    <section className="section-apple gradient-border" id="pricing">
      <div className="max-w-6xl mx-auto px-5">
        <Reveal className="text-center mb-12">
          <p className="text-sm font-semibold tracking-widest uppercase text-[var(--accent)] mb-3">
            Transparent Pricing
          </p>
          <h2 className="section-title">Apple India vs Red Apple</h2>
          <p className="section-subtitle mx-auto mt-4">
            A like-for-like price comparison against authorised service centres, with
            OEM-grade parts and a 6-month warranty. All prices are indicative — confirm
            the final figure at the store before work begins.
          </p>
        </Reveal>

        <Reveal className="mb-9 flex justify-center">
          <a
            href="#glass"
            className="group inline-flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-[var(--border)] bg-white px-5 py-3 text-[13px] font-semibold text-[var(--text)] shadow-sm transition-transform hover:-translate-y-0.5 hover:border-[var(--orange)]/50"
          >
            <LineIcon name="display" size={16} color="var(--orange)" />
            Front glass restoration: ₹2,500 – ₹19,500 by model
            <span className="text-[var(--orange)] transition-transform group-hover:translate-x-0.5">See the glass price list →</span>
          </a>
        </Reveal>

        {/* Category tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {PRICING_GROUPS.map((g, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-[var(--cta-radius)] text-sm font-medium transition duration-300 press ${
                active === i
                  ? "bg-[var(--cta-dark)] text-white shadow-md"
                  : "bg-[var(--bg-alt)] text-[var(--text)] hover:bg-[var(--border)]"
              }`}
            >
              <LineIcon name={g.icon as IconName} size={16} />
              <span className="hidden sm:inline">{g.category}</span>
              <span className="sm:hidden">{g.category.split(" ")[0]}</span>
            </button>
          ))}
        </div>

        {/* Pricing table */}
        <Reveal key={active} className="glass-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="pricing-table smooth-120 min-w-[640px]">
              <colgroup>
                <col className="w-1/4" />
                <col className="w-1/4" />
                <col className="w-1/4" />
                <col className="w-1/4" />
              </colgroup>
              <thead>
                <tr>
                  <th scope="col">Model / Device</th>
                  <th scope="col">Apple India</th>
                  <th scope="col">Red Apple</th>
                  <th scope="col">You Save</th>
                </tr>
              </thead>
              <tbody>
                {group.items.map((item, j) => {
                  const appleNum = parseInt(item.apple.replace(/[₹,]/g, ""));
                  const ourNum = parseInt(item.ours.replace(/[₹,]/g, ""));
                  const saving = appleNum - ourNum;
                  return (
                    <tr key={j}>
                      <td className="font-medium text-[15px]">{item.model}</td>
                      <td className="price-apple text-[15px]">{item.apple}</td>
                      <td className="price-ours text-[15px] font-bold">{item.ours}</td>
                      <td className="font-bold text-green-600 text-[15px]">
                        {saving.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="border-t border-[var(--border)] bg-[var(--bg-alt)] px-6 py-4 text-xs leading-relaxed text-[var(--text-muted)]">
            All prices are indicative and subject to device condition. Comparative figures are
            published for guidance only — confirm the exact price at the store before work
            begins. Apple is a trademark of Apple Inc. Red Apple is an independent repair
            service and is not affiliated with, authorised by or endorsed by Apple Inc.
          </div>
          <p className="flex items-center justify-center gap-1.5 border-t border-[var(--border)] bg-[var(--bg-alt)] px-6 py-3 text-center text-[11.5px] font-semibold text-[var(--text-muted)]">
            <LineIcon name="shield" size={13} className="shrink-0 text-[var(--accent)]" />
            6-month repair warranty on all repairs, displays, batteries and glass. Motherboard
            repairs excluded — keep your invoice as the warranty record.
          </p>
        </Reveal>

        <div className="text-center mt-10">
          <a href={SITE.mapsUrl} target="_blank" rel="noopener noreferrer" className="cta-dark press">
            <LineIcon name="pin" size={18} />
            Visit Store for Exact Quote
          </a>
        </div>
      </div>
    </section>
  );
}
