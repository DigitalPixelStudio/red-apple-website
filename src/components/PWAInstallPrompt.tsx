"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type InstallChoice = { outcome: "accepted" | "dismissed"; platform?: string };
type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<InstallChoice>;
};

const INSTALLED_KEY = "redapple-pwa-installed";
const DISMISSED_KEY = "redapple-pwa-dismissed-at";
const DISMISS_FOR = 7 * 24 * 60 * 60 * 1000;
const DELAY_MS = 60_000;

export default function PWAInstallPrompt() {
  const deferredPrompt = useRef<InstallPromptEvent | null>(null);
  const elapsed = useRef(false);
  const [visible, setVisible] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const [showSteps, setShowSteps] = useState(false);
  const isIOS = typeof navigator !== "undefined" && /iPad|iPhone|iPod/.test(navigator.userAgent);

  const hideAsInstalled = useCallback(() => {
    setVisible(false);
    deferredPrompt.current = null;
    try {
      window.localStorage.setItem(INSTALLED_KEY, "1");
    } catch {
      // Installed-mode detection remains authoritative when storage is unavailable.
    }
  }, []);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // The online site remains fully usable when service-worker registration fails.
      });
    }

    const standaloneQuery = window.matchMedia("(display-mode: standalone)");
    const isStandalone = () =>
      standaloneQuery.matches ||
      window.matchMedia("(display-mode: fullscreen)").matches ||
      Boolean((navigator as Navigator & { standalone?: boolean }).standalone);

    if (isStandalone()) {
      try { window.localStorage.setItem(INSTALLED_KEY, "1"); } catch { /* Storage is optional. */ }
      return;
    }

    try {
      if (window.localStorage.getItem(INSTALLED_KEY) === "1") return;
      const dismissedAt = Number(window.localStorage.getItem(DISMISSED_KEY) || "0");
      if (dismissedAt && Date.now() - dismissedAt < DISMISS_FOR) return;
    } catch {
      // Storage may be unavailable in private browsing.
    }
    const revealWhenReady = () => {
      if (elapsed.current) setVisible(true);
    };
    const delayTimer = window.setTimeout(() => {
      elapsed.current = true;
      setVisible(true);
    }, DELAY_MS);

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      deferredPrompt.current = event as InstallPromptEvent;
      setCanInstall(true);
      revealWhenReady();
    };
    const onInstalled = () => hideAsInstalled();
    const onDisplayModeChange = () => {
      if (isStandalone()) hideAsInstalled();
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    standaloneQuery.addEventListener?.("change", onDisplayModeChange);

    return () => {
      window.clearTimeout(delayTimer);
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
      standaloneQuery.removeEventListener?.("change", onDisplayModeChange);
    };
  }, [hideAsInstalled]);

  const dismiss = () => {
    setVisible(false);
    try {
      window.localStorage.setItem(DISMISSED_KEY, String(Date.now()));
    } catch {
      // Dismissal remains local to this view if storage is unavailable.
    }
  };

  const install = async () => {
    const promptEvent = deferredPrompt.current;
    if (promptEvent) {
      try {
        await promptEvent.prompt();
        const choice = await promptEvent.userChoice;
        if (choice.outcome === "accepted") hideAsInstalled();
      } catch {
        setShowSteps(true);
      } finally {
        deferredPrompt.current = null;
        setCanInstall(false);
      }
      return;
    }
    setShowSteps((current) => !current);
  };

  if (!visible) return null;

  return (
    <aside
      role="dialog"
      aria-modal="false"
      aria-label="Install Red Apple Mobile Repair app"
      className="fixed bottom-24 left-4 z-[90] w-[min(360px,calc(100vw-2rem))] rounded-2xl border border-black/10 bg-white p-4 shadow-[0_18px_55px_-18px_rgba(0,0,0,.32)] md:bottom-6 md:left-6"
    >
      <div className="flex items-start gap-3">
        <img
          src="/icon-192.png"
          width="44"
          height="44"
          alt=""
          className="h-11 w-11 shrink-0 rounded-xl border border-red-100 object-cover"
        />
        <div className="min-w-0 flex-1 pr-5">
          <p className="text-sm font-extrabold text-[var(--text)]">Keep Red Apple one tap away</p>
          <p className="mt-1 text-xs leading-relaxed text-[var(--text-muted)]">
            Install the app for quick access to repair estimates, live repair tracking and support.
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss install invitation"
          className="absolute right-3 top-3 rounded-full px-2 py-1 text-lg leading-none text-[var(--text-muted)] hover:bg-black/5"
        >
          ×
        </button>
      </div>

      {showSteps && (
        <p className="mt-3 rounded-xl bg-[var(--bg-alt)] p-3 text-xs leading-relaxed text-[var(--text)]">
          {isIOS
            ? "On iPhone or iPad, open this website in Safari, tap Share, then choose Add to Home Screen."
            : "In Chrome or Edge, open the browser menu and choose Install app or Add to Home screen. The browser controls the final installation step."}
        </p>
      )}

      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={install}
          className="flex-1 rounded-xl bg-[var(--cta-dark)] px-4 py-2.5 text-xs font-bold text-white transition-colors hover:opacity-90"
        >
          {canInstall ? "Install app" : showSteps ? "Got it" : "Install app"}
        </button>
        <button
          type="button"
          onClick={dismiss}
          className="rounded-xl border border-black/10 px-4 py-2.5 text-xs font-semibold text-[var(--text)] hover:bg-black/[0.03]"
        >
          Not now
        </button>
      </div>
    </aside>
  );
}

