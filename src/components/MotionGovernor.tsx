"use client";

/**
 * MotionGovernor — pauses animation work for everything you cannot see.
 *
 * WHY THIS EXISTS
 * ---------------
 * The page carries around forty infinite animations. Most belong to sections
 * far below the fold, and the browser keeps compositing every one of them
 * whether or not it is on screen. On a mid-range phone that is a permanent
 * background load competing with the scroll itself — which is exactly what
 * makes a header feel like it is dropping frames even when the header itself
 * is doing nothing.
 *
 * WHAT IT DOES
 * ------------
 * Watches each top-level section. When a section leaves the viewport it gets
 * `.motion-paused`, and CSS freezes every animation inside it. When it comes
 * back the animation resumes where it left off — `animation-play-state` is a
 * pause, not a reset, so nothing jumps.
 *
 * Fixed chrome (header, floating buttons, the light layer) lives outside the
 * sections and is deliberately left running.
 *
 * COST
 * ----
 * One IntersectionObserver, no scroll listener, no measurement, no state.
 * The class is written straight to the node.
 */

import { useEffect } from "react";

export default function MotionGovernor() {
  useEffect(() => {
    // a browser without IO simply keeps everything animating — no breakage
    if (typeof IntersectionObserver === "undefined") return;

    const sections = Array.from(document.querySelectorAll("main section"));
    if (!sections.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target as HTMLElement;
          if (entry.isIntersecting) el.classList.remove("motion-paused");
          else el.classList.add("motion-paused");
        }
      },
      // a generous margin so an animation is already running by the time the
      // section is actually visible; pausing is never perceptible
      { rootMargin: "220px 0px 220px 0px", threshold: 0 }
    );

    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  return null;
}
