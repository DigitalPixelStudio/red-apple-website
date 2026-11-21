"use client";
import React, { useState } from "react";
import { track } from "@/lib/analytics";
import { LineIcon } from "./Icons";
import SmartImg from "./SmartImg";

const PERKS = [
  {
    icon: "lock" as const,
    title: "Zero Password Policy",
    body: "Lock your device before handing it over. We repair hardware, not your data.",
  },
  {
    icon: "whatsapp" as const,
    title: "Live WhatsApp Updates",
    body: "Photo and video from our in-house technician team at every stage of the repair.",
  },
  {
    icon: "shield" as const,
    title: "Insured Handling",
    body: "Sealed, tracked and insured from your door to the bench and back again.",
  },
  {
    icon: "pin" as const,
    title: "Same-Address Return",
    body: "Tested across every checkpoint, then handed back at your doorstep.",
  },
];

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
    <section id="pickup" className="relative overflow-hidden border-t border-[var(--border)] bg-[var(--bg-alt)] py-20">
      <div className="pickup-aura" aria-hidden="true" />
      <div className="relative z-10 mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <span className="inline-block rounded-full bg-[var(--accent)]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">
            Doorstep Convenience
          </span>
          <h2 className="head-gradient section-title mt-4">Free Doorstep Pickup, 24/7.</h2>
          <p className="section-subtitle mx-auto mt-4">
            Free insured pickup and drop across Bengaluru — <strong>24 hours a day, 7 days a week</strong>.
            Zero password policy, live status tracking and an expert diagnosis before we touch a screw.
          </p>
        </div>

        <div className="grid items-center gap-6 lg:grid-cols-[1fr_1.25fr_0.85fr]">
          {/* ---- left: what you get ---- */}
          <div className="order-2 space-y-3 lg:order-1">
            {PERKS.map((p, i) => (
              <div key={p.title} className="pickup-perk group" style={{ transitionDelay: `${i * 40}ms` }}>
                <span className="pickup-perk-icon">
                  <LineIcon name={p.icon} size={17} />
                </span>
                <div>
                  <h3 className="text-[13.5px] font-extrabold text-[var(--text)]">{p.title}</h3>
                  <p className="mt-0.5 text-[11.5px] leading-relaxed text-[var(--text-muted)]">{p.body}</p>
                </div>
              </div>
            ))}
            <div className="pickup-note">
              <LineIcon name="clock" size={14} />
              Pickup runs 24/7. Store bench hours: 10 AM – 12 AM midnight.
            </div>
          </div>

          {/* ---- centre: the booking form (fields unchanged) ---- */}
          <div className="order-1 rounded-3xl border border-[var(--border)] bg-[var(--bg)] p-6 shadow-lg sm:p-8 lg:order-2">
            <h3 className="mb-2 text-center text-lg font-bold">Book Free Doorstep Pickup</h3>
            <p className="mb-6 text-center text-xs text-[var(--text-muted)]">
              Select your device and provide pickup address details.
            </p>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Select Apple Device</label>
                <div className="grid grid-cols-3 gap-2">
                  {["iPhone", "iPad", "MacBook"].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDevice(d)}
                      className={`rounded-xl border py-2 text-xs font-semibold transition duration-300 ${
                        device === d
                          ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                          : "border-[var(--border)] bg-[var(--bg-alt)] text-[var(--text)] hover:border-[var(--accent)]/50"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Flat / Floor / Apt (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Flat 402, B-Wing"
                    value={flat}
                    onChange={(e) => setFlat(e.target.value)}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-alt)] px-4 py-3 text-sm focus:border-[var(--accent)] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Building Name (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Prestige Heights"
                    value={building}
                    onChange={(e) => setBuilding(e.target.value)}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-alt)] px-4 py-3 text-sm focus:border-[var(--accent)] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Street Address *</label>
                <input
                  type="text"
                  placeholder="e.g. 12th Main Road, Indiranagar"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-alt)] px-4 py-3 text-sm focus:border-[var(--accent)] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Pincode (6 Digits) *</label>
                  <input
                    type="text"
                    placeholder="e.g. 560103"
                    value={pincode}
                    onChange={handlePincodeChange}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-alt)] px-4 py-3 text-sm focus:border-[var(--accent)] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">City / State</label>
                  <input
                    type="text"
                    disabled
                    value={area ? `${area.city}` : "Bangalore"}
                    className="w-full cursor-not-allowed rounded-xl border border-[var(--border)] bg-[var(--bg-alt)]/50 px-4 py-3 text-sm text-[var(--text-muted)]"
                  />
                </div>
              </div>

              {loading && <p className="text-center text-xs text-[var(--accent)] animate-pulse">Verifying pincode...</p>}
              {error && <p className="text-center text-xs font-medium text-red-500">{error}</p>}
              {area && (
                <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-3 text-center text-xs font-medium text-green-600">
                  Service verified in <span className="font-bold">{area.area}</span>, {area.city}.
                </div>
              )}

              <button
                onClick={handleBook}
                className="mt-2 w-full rounded-xl bg-[var(--accent)] py-4 text-sm font-bold text-white shadow-lg shadow-[var(--accent)]/20 transition duration-300 hover:opacity-90"
              >
                Book Pickup via WhatsApp
              </button>
            </div>
          </div>

          {/* ---- right: related imagery ---- */}
          <div className="order-3 hidden lg:block">
            <div className="pickup-visual">
              <SmartImg
                src="/images/cards/live-whatsapp.jpg"
                alt="A technician sharing live photo updates on WhatsApp during a repair"
                width={800}
                height={1000}
                className="pickup-visual-img"
              />
              <span className="pickup-badge pickup-badge-1">
                <LineIcon name="clock" size={12} /> 24/7 Pickup
              </span>
              <span className="pickup-badge pickup-badge-2">
                <LineIcon name="shield" size={12} /> Insured &amp; Tracked
              </span>
              <p className="pickup-visual-caption">
                Your device never travels unaccounted for.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PickupSection;
