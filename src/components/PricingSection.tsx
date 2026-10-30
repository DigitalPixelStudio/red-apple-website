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
            Save up to 35% compared to Apple Authorized Service Centres — with OEM-grade parts
            and a 90-day warranty. All prices are indicative; confirm at store.
          </p>
        </Reveal>

        {/* Category tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {PRICING_GROUPS.map((g, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-[var(--cta-radius)] text-sm font-medium transition-all press ${
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
            <table className="pricing-table smooth-120">
              <thead>
                <tr>
                  <th className="min-w-[200px]">Model / Device</th>
                  <th className="text-right min-w-[140px]">Apple India</th>
                  <th className="text-right min-w-[140px]">{SITE.name}</th>
                  <th className="text-right min-w-[120px]">You Save</th>
                </tr>
              </thead>
              <tbody>
                {group.items.map((item, j) => {
                  const appleNum = parseInt(item.apple.replace(/[₹,]/g, ""));
                  const ourNum = parseInt(item.ours.replace(/[₹,]/g, ""));
                  const saving = appleNum - ourNum;
                  return (
                    <tr key={j} className="hover:bg-[var(--bg-alt)] transition-colors">
                      <td className="font-medium text-[15px]">{item.model}</td>
                      <td className="text-right price-apple text-[15px]">{item.apple}</td>
                      <td className="text-right price-ours text-[15px] font-bold">{item.ours}</td>
                      <td className="text-right font-bold text-green-600 text-[15px]">
                        {saving.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 bg-[var(--bg-alt)] text-xs text-[var(--text-muted)] border-t border-[var(--border)]">
            All prices are indicative and subject to device condition. Red Apple pricing is approximately 35% lower than Apple Authorized Service Centre rates. Confirm exact pricing at store.
          </div>
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
