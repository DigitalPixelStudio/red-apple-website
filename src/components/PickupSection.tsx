"use client";
import React, { useState } from "react";
import { track } from "@/lib/analytics";
import { LineIcon } from "./Icons";

export function PickupSection() {
  const [device, setDevice] = useState("iPhone");
  const [pincode, setPincode] = useState("");
  const [area, setArea] = useState<{ area: string; city: string; state: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [address, setAddress] = useState("");
  const [building, setBuilding] = useState("");
  const [flat, setFlat] = useState("");

  const handlePincodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
    setPincode(val);
    setError("");
    setArea(null);

    if (val.length === 6) {
      setLoading(true);
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${val}`);
        const data = await res.json();
        if (data && data[0]?.Status === "Success") {
          const po = data[0].PostOffice[0];
          setArea({ area: po.Name, city: po.District || "Bangalore", state: po.State || "Karnataka" });
        } else {
          setError("Invalid pincode or service not available in this region.");
        }
      } catch (err) {
        // Fallback for Bangalore general
        if (val.startsWith("56")) {
          setArea({ area: "Bangalore Urban", city: "Bangalore", state: "Karnataka" });
        } else {
          setError("Could not verify pincode. Please check.");
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBook = () => {
    if (pincode.length !== 6 || !area) {
      setError("Please enter a valid 6-digit verified pincode.");
      return;
    }
    if (!address.trim()) {
      setError("Please enter your street address for pickup.");
      return;
    }

    track("pickup_request", { device, pincode, area: area.area });

    const message = encodeURIComponent(
      `*RED APPLE MOBILE REPAIR*\n` +
      `_Where Repair Meets Connectivity_\n` +
      `\n` +
      `*DOORSTEP PICKUP REQUEST*\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `\n` +
      `*DEVICE*\n` +
      `• ${device}\n` +
      `\n` +
      `*PICKUP ADDRESS*\n` +
      `${flat ? `• Flat / Floor :  ${flat}\n` : ""}` +
      `${building ? `• Building :  ${building}\n` : ""}` +
      `• Street :  ${address}\n` +
      `• Area :  ${area.area}\n` +
      `• City :  ${area.city} — ${pincode}\n` +
      `\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `Please confirm the rider and a pickup window. Thank you.`
    );

    window.open(`https://wa.me/918660663776?text=${message}`, "_blank");
  };

  return (
    <section className="py-20 bg-[var(--bg-alt)] border-t border-[var(--border)] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[var(--accent)]/10 text-[var(--accent)] mb-4 uppercase tracking-wider">
            Doorstep Convenience
          </span>
          <h2 className="head-gradient section-title mb-4">Don't come to us. We'll come to you.</h2>
          <p className="section-subtitle mx-auto">
            Free insured doorstep pickup and drop across Bangalore. Zero password policy, live status tracking, and expert diagnosis.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="p-8 rounded-2xl bg-[var(--bg)] border border-[var(--border)] shadow-sm hover:border-[var(--accent)]/30 transition duration-300">
            <div className="w-12 h-12 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] font-bold text-xl mb-6"><LineIcon name="lock" size={22} color="var(--accent)" /></div>
            <h3 className="text-xl font-bold mb-3">Zero Password Policy</h3>
            <p className="text-[var(--text-muted)] text-sm leading-relaxed">
              Your data privacy is sacred. Lock your device before handing it over. We repair component-level faults without touching your personal data.
            </p>
          </div>
          <div className="p-8 rounded-2xl bg-[var(--bg)] border border-[var(--border)] shadow-sm hover:border-[var(--accent)]/30 transition duration-300">
            <div className="w-12 h-12 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] font-bold text-xl mb-6"><LineIcon name="whatsapp" size={22} color="var(--accent)" /></div>
            <h3 className="text-xl font-bold mb-3">Live Status on WhatsApp</h3>
            <p className="text-[var(--text-muted)] text-sm leading-relaxed">
              Get real-time photo and video updates directly on WhatsApp as our master technicians inspect and repair your Apple device.
            </p>
          </div>
          <div className="p-8 rounded-2xl bg-[var(--bg)] border border-[var(--border)] shadow-sm hover:border-[var(--accent)]/30 transition duration-300">
            <div className="w-12 h-12 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] font-bold text-xl mb-6"><LineIcon name="box" size={22} color="var(--accent)" /></div>
            <h3 className="text-xl font-bold mb-3">Same Address Return</h3>
            <p className="text-[var(--text-muted)] text-sm leading-relaxed">
              Once repaired and rigorously tested across 32 quality checkpoints, your device is securely handed back to you at your doorstep.
            </p>
          </div>
        </div>

        <div className="max-w-xl mx-auto p-6 sm:p-8 rounded-3xl bg-[var(--bg)] border border-[var(--border)] shadow-lg">
          <h4 className="text-lg font-bold mb-2 text-center">Book Free Doorstep Pickup</h4>
          <p className="text-xs text-[var(--text-muted)] text-center mb-6">Select your device and provide pickup address details.</p>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1 uppercase tracking-wider">Select Apple Device</label>
              <div className="grid grid-cols-3 gap-2">
                {["iPhone", "iPad", "MacBook"].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDevice(d)}
                    className={`py-2 rounded-xl text-xs font-semibold border transition duration-300 ${
                      device === d
                        ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                        : "bg-[var(--bg-alt)] text-[var(--text)] border-[var(--border)] hover:border-[var(--accent)]/50"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1 uppercase tracking-wider">Flat / Floor / Apt (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Flat 402, B-Wing"
                  value={flat}
                  onChange={(e) => setFlat(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[var(--bg-alt)] border border-[var(--border)] text-sm focus:outline-none focus:border-[var(--accent)]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1 uppercase tracking-wider">Building Name (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Prestige Heights"
                  value={building}
                  onChange={(e) => setBuilding(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[var(--bg-alt)] border border-[var(--border)] text-sm focus:outline-none focus:border-[var(--accent)]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1 uppercase tracking-wider">Street Address *</label>
              <input
                type="text"
                placeholder="e.g. 12th Main Road, Indiranagar"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[var(--bg-alt)] border border-[var(--border)] text-sm focus:outline-none focus:border-[var(--accent)]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1 uppercase tracking-wider">Pincode (6 digits) *</label>
                <input
                  type="text"
                  placeholder="e.g. 560103"
                  value={pincode}
                  onChange={handlePincodeChange}
                  className="w-full px-4 py-3 rounded-xl bg-[var(--bg-alt)] border border-[var(--border)] text-sm focus:outline-none focus:border-[var(--accent)]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1 uppercase tracking-wider">City / State</label>
                <input
                  type="text"
                  disabled
                  value={area ? `${area.city}` : "Bangalore"}
                  className="w-full px-4 py-3 rounded-xl bg-[var(--bg-alt)]/50 border border-[var(--border)] text-sm text-[var(--text-muted)] cursor-not-allowed"
                />
              </div>
            </div>

            {loading && <p className="text-xs text-[var(--accent)] text-center animate-pulse">Verifying pincode...</p>}
            {error && <p className="text-xs text-red-500 text-center font-medium">{error}</p>}
            {area && (
              <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-600 text-xs text-center font-medium">
                Service verified in <span className="font-bold">{area.area}</span>, {area.city}.
              </div>
            )}

            <button
              onClick={handleBook}
              className="w-full py-4 rounded-xl bg-[var(--accent)] text-white font-bold text-sm hover:opacity-90 transition duration-300 shadow-lg shadow-[var(--accent)]/20 mt-2"
            >
              Book Pickup via WhatsApp 
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PickupSection;
