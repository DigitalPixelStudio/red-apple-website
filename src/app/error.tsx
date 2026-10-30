"use client";
import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <div className="text-[60px]">😵</div>
      <h1 className="font-apple mt-4 text-[32px] font-extrabold text-[#1d1d1f]">Something slipped.</h1>
      <p className="mt-3 max-w-[420px] text-[14px] text-[#86868b]">A tiny glitch — not your device&rsquo;s fault. Try again or WhatsApp us.</p>
      <div className="mt-7 flex gap-3">
        <button onClick={reset} className="cta-primary">Try again</button>
      </div>
    </div>
  );
}
