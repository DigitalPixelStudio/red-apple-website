"use client";

import { useEffect, useState } from "react";

const KEY = "ramr-motion";

/**
 * Motion is on by default. This switch lets a visitor stop all decorative
 * animation without changing the layout or content.
 */
export default function MotionToggle() {
  const [on, setOn] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(KEY);
    } catch {
      /* storage blocked — keep the default */
    }
    const isOn = stored !== "off";
    const frame = window.requestAnimationFrame(() => {
      setOn(isOn);
      setReady(true);
    });
    document.documentElement.dataset.motion = isOn ? "on" : "off";
    return () => window.cancelAnimationFrame(frame);
  }, []);

  function toggle() {
    const next = !on;
    setOn(next);
    document.documentElement.dataset.motion = next ? "on" : "off";
    try {
      localStorage.setItem(KEY, next ? "on" : "off");
    } catch {
      /* ignore */
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={on}
      aria-label={on ? "Turn animations off" : "Turn animations on"}
      title={on ? "Turn animations off" : "Turn animations on"}
      className="footer-motion inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-white/75 transition-colors hover:border-[#ffb067]/50 hover:text-white"
    >
      <span
        aria-hidden="true"
        className={`footer-motion-dot ${on ? "is-on" : ""}`}
      />
      {ready ? (on ? "Motion on" : "Motion off") : "Motion"}
    </button>
  );
}
