"use client";

/**
 * Phone3D — a realistic, slowly rotating iPhone 17 Pro in pure CSS 3D.
 *
 * Why CSS and not Three.js: Three.js is ~600 KB and needs a WebGL context, which
 * stutters on mid-range Android. This is ~4 KB, runs on the compositor, and holds
 * 60–120fps because it only ever animates `transform`.
 *
 * It also degrades cleanly: with `prefers-reduced-motion` the phone simply sits
 * still at a three-quarter angle instead of spinning.
 */

export default function Phone3D({ className = "" }: { className?: string }) {
  return (
    <div className={`phone-stage ${className}`} aria-hidden="true">
      <div className="phone-float">
        <div className="phone-spin">
          {/* ---- back shell ---- */}
          <div className="phone-face phone-back">
            <div className="phone-back-plate" />
            <div className="phone-camera-island">
              <span className="phone-lens" />
              <span className="phone-lens" />
              <span className="phone-lens" />
              <span className="phone-flash" />
            </div>
            <div className="phone-logo-chip" />
          </div>

          {/* ---- front glass ---- */}
          <div className="phone-face phone-front">
            <div className="phone-island" />
            <div className="phone-screen">
              <div className="phone-screen-glow" />
              <div className="phone-notch-arc" />
              <div className="phone-widget">
                <span className="phone-widget-time">9:41</span>
                <span className="phone-widget-sub">Red Apple</span>
              </div>
              <div className="phone-app-grid">
                {Array.from({ length: 12 }).map((_, i) => (
                  <span key={i} className="phone-app" style={{ animationDelay: `${i * 0.14}s` }} />
                ))}
              </div>
              <div className="phone-dock" />
            </div>
          </div>

          {/* ---- edges give the body its thickness ---- */}
          <div className="phone-edge phone-edge-left" />
          <div className="phone-edge phone-edge-right" />
          <div className="phone-edge phone-edge-top" />
          <div className="phone-edge phone-edge-bottom" />

          {/* ---- titanium highlight sweeping across ---- */}
          <div className="phone-sheen" />
        </div>
      </div>

      {/* ---- orbit rings, echoing the "device connected" language ---- */}
      <div className="phone-orbit phone-orbit-1" />
      <div className="phone-orbit phone-orbit-2" />
      <div className="phone-shadow" />
    </div>
  );
}
