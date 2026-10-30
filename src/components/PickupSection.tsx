"use client";
import React, { useState } from "react";
import { track } from "@/lib/analytics";

export function PickupSection() {
  const [pincode, setPincode] = useState("");
  const [area, setArea] = useState<{ area: string; hub: string } | null>(null);
  const [error, setError] = useState(false);

  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
    setPincode(val);
    setError(false);
    if (val === "560103") {
      setArea({ area: "Bellandur / HSR Layout", hub: "Express Hub 04" });
    } else if (val.length === 6) {
      setArea({ area: "Bangalore Urban Zone", hub: "Central Dispatch" });
    } else {
      setArea(null);
    }
  };

  const handleBook = () => {
    if (pincode.length !== 6) {
      setError(true);
      return;
    }
    track("pickup_request", { device: "iPhone", pincode, area: area?.area || "General" });
    const text = encodeURIComponent(`Hi Red Apple Team, I would like to book a free doorstep pickup for my Apple device. Pincode: ${pincode} (${area?.area || "Bangalore"}). Please schedule.`);
    window.open(`https://wa.me/919900000000?text=${text}`, "_blank");
  };

  return (
    <section className="py-20 bg-[var(--bg-alt)] border-t border-[var(--border)] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[var(--accent)]/10 text-[var(--accent)] mb-4 uppercase tracking-wider">
            Doorstep Convenience
          </span>
          <h2 className="section-title mb-4">Don't come to us. We'll come to you.</h2>
          <p className="section-subtitle mx-auto">
            Free insured doorstep pickup and drop across Bangalore. Zero password policy, live status tracking, and same-day diagnosis.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="p-8 rounded-2xl bg-[var(--bg)] border border-[var(--border)] shadow-sm hover:border-[var(--accent)]/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] font-bold text-xl mb-6">🛡️</div>
            <h3 className="text-xl font-bold mb-3">Zero Password Policy</h3>
            <p className="text-[var(--text-muted)] text-sm leading-relaxed">
              Your data privacy is sacred. Lock your device before handing it over. We repair component-level faults without touching your personal data.
            </p>
          </div>
          <div className="p-8 rounded-2xl bg-[var(--bg)] border border-[var(--border)] shadow-sm hover:border-[var(--accent)]/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] font-bold text-xl mb-6">💬</div>
            <h3 className="text-xl font-bold mb-3">Live Status on WhatsApp</h3>
            <p className="text-[var(--text-muted)] text-sm leading-relaxed">
              Get real-time photo and video updates directly on WhatsApp as our master technicians inspect and repair your Apple device.
            </p>
          </div>
          <div className="p-8 rounded-2xl bg-[var(--bg)] border border-[var(--border)] shadow-sm hover:border-[var(--accent)]/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] font-bold text-xl mb-6">🚚</div>
            <h3 className="text-xl font-bold mb-3">Same Address Return</h3>
            <p className="text-[var(--text-muted)] text-sm leading-relaxed">
              Once repaired and rigorously tested across 32 quality checkpoints, your device is securely handed back to you at your doorstep.
            </p>
          </div>
        </div>

        <div className="max-w-xl mx-auto p-6 sm:p-8 rounded-3xl bg-[var(--bg)] border border-[var(--border)] shadow-lg">
          <h4 className="text-lg font-bold mb-2 text-center">Check Doorstep Availability</h4>
          <p className="text-xs text-[var(--text-muted)] text-center mb-6">Enter your 6-digit pincode to check free pickup eligibility.</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Enter Pincode (e.g. 560103)"
              value={pincode}
              onChange={handlePincodeChange}
              className="flex-1 px-4 py-3 rounded-xl bg-[var(--bg-alt)] border border-[var(--border)] text-sm focus:outline-none focus:border-[var(--accent)]"
            />
            <button
              onClick={handleBook}
              className="px-6 py-3 rounded-xl bg-[var(--accent)] text-white font-medium text-sm hover:opacity-90 transition-all"
            >
              Book Pickup
            </button>
          </div>
          {error && <p className="text-xs text-red-500 mt-2 text-center">Please enter a valid 6-digit Bangalore pincode.</p>}
          {area && (
            <div className="mt-4 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-600 text-xs text-center font-medium animate-fadeIn">
              ✅ Free pickup available in <span className="font-bold">{area.area}</span> ({area.hub})! Click Book Pickup to connect on WhatsApp.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
