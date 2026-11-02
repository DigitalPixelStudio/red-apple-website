"use client";

import { useEffect, useRef, useState } from "react";

type InstallChoice = { outcome: "accepted" | "dismissed"; platform?: string };
type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<InstallChoice>;
};

const DISMISS_KEY = "redapple-pwa-dismissed-at";
const DISMISS_FOR = 7 * 24 * 60 * 60 * 1000;

export default function PWAInstallPrompt() {
  const promptRef = useRef<InstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showSteps, setShowSteps] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
    if (standalone) return;

    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(ios);

    try {
      const dismissedAt = Number(window.localStorage.getItem(DISMISS_KEY) || "0");
      if (dismissedAt && Date.now() - dismissedAt < DISMISS_FOR) return;
    } catch {
      // Storage can be unavailable in private browsing.
    }

    const showTimer = window.setTimeout(() => setVisible(true), 1600);
    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      promptRef.current = event as InstallPromptEvent;
      setCanInstall(true);
      setVisible(true);
    };
    const onInstalled = () => {
      setVisible(false);
      promptRef.current = null;
      try { window.localStorage.setItem("redapple-pwa-installed", "1"); } catch {}
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Install guidance remains available if service-worker registration is blocked.
      });
    }

    return () => {
      window.clearTimeout(showTimer);
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const dismiss = () => {
    setVisible(false);
    try { window.localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch {}
  };

  const install = async () => {
    const deferred = promptRef.current;
    if (deferred) {
      try {
        await deferred.prompt();
        const choice = await deferred.userChoice;
        if (choice.outcome === "accepted") setVisible(false);
      } catch {
        setShowSteps(true);
      } finally {
        promptRef.current = null;
        setCanInstall(false);
      }
      return;
    }
    setShowSteps((value) => !value);
  };

  if (!visible) return null;

  return (
    <aside
      role="dialog"
      aria-label="Install Red Apple Repair app"
      aria-live="polite"
      className="fixed bottom-24 left-4 z-[90] w-[min(360px,calc(100vw-2rem))] rounded-2xl border border-black/10 bg-white p-4 shadow-[0_18px_55px_-18px_rgba(0,0,0,.32)] md:bottom-6 md:left-6"
    >
      <div className="flex items-start gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
          <span aria-hidden="true" className="text-xl">⌂</span>
        </div>
        <div className="min-w-0 flex-1 pr-5">
          <p className="text-sm font-extrabold text-[var(--text)]">Keep Red Apple one tap away</p>
          <p className="mt-1 text-xs leading-relaxed text-[var(--text-muted)]">
            Install our app shortcut for faster access to repair estimates, pickup and support.
          </p>
        </div>
        <button type="button" onClick={dismiss} aria-label="Dismiss install invitation" className="absolute right-3 top-3 rounded-full px-2 py-1 text-lg leading-none text-[var(--text-muted)] hover:bg-black/5">×</button>
      </div>

      {showSteps && (
        <p className="mt-3 rounded-xl bg-[var(--bg-alt)] p-3 text-xs leading-relaxed text-[var(--text)]">
          {isIOS
            ? "On iPhone or iPad: open this page in Safari, tap Share, then choose “Add to Home Screen”."
            : "In Chrome or Edge: open the browser menu (⋮), then choose “Install app” or “Add to Home screen”. If the option is not shown yet, keep browsing for a little while and check again."}
        </p>
      )}

      <div className="mt-3 flex items-center gap-2">
        <button type="button" onClick={install} className="flex-1 rounded-xl bg-[var(--cta-dark)] px-4 py-2.5 text-xs font-bold text-white transition-transform hover:-translate-y-0.5">
          {canInstall ? "Install app" : showSteps ? "Got it" : "How to install"}
        </button>
        <button type="button" onClick={dismiss} className="rounded-xl border border-black/10 px-4 py-2.5 text-xs font-semibold text-[var(--text)] hover:bg-black/[0.03]">
          Not now
        </button>
      </div>
    </aside>
  );
}
