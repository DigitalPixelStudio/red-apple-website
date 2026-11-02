"use client";

/**
 * ScrollProgress — the 3px bar under the header.
 *
 * WHAT WAS WRONG
 * --------------
 * The old version called setState on every scroll event and drove the bar with
 * `width: X%` plus `transition: width`. Both are fatal for smoothness:
 *
 *   · setState per scroll event → a React render per scroll event, unthrottled
 *   · width → the browser must re-run layout for the whole document
 *   · transition: width → that layout happens again on every animation frame
 *
 * A fixed, full-width element sitting directly under the header doing a
 * document-wide layout 60–120 times a second is exactly the stutter that was
 * being felt while scrolling.
 *
 * WHAT IT DOES NOW
 * ----------------
 *   · one scroll listener, coalesced into one rAF per frame
 *   · no React state at all — the value is written straight to a CSS variable
 *   · the bar is driven by `transform: scaleX()`, which the compositor handles
 *     on its own thread. No layout, no paint, no render.
 *
 * The visual result is identical. The cost is one composited transform.
 */

import { useEffect, useRef } from "react";

export default function ScrollProgress() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let ticking = false;
    let last = -1;

    const paint = () => {
      ticking = false;
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, doc.scrollTop / max)) : 0;
      // skip sub-pixel changes; they are invisible and cost a style write
      if (Math.abs(p - last) < 0.0008) return;
      last = p;
      el.style.setProperty("--p", p.toFixed(4));
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(paint);
    };

    paint();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return <div ref={ref} className="scroll-progress" aria-hidden />;
}
