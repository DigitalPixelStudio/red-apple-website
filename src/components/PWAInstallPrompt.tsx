"use client";

import { useEffect } from "react";

type InstallChoice = { outcome: "accepted" | "dismissed"; platform?: string };
type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<InstallChoice>;
};

/**
 * A permanent, non-modal install action in the site header.
 * Android/Chromium opens its native prompt only after the visitor taps.
 * iOS displays the native Share -> Add to Home Screen instructions inline.
 */
export default function PWAInstallPrompt() {
  useEffect(() => {
    const button = document.getElementById("pwa-install-button") as HTMLButtonElement | null;
    if (!button) return;

    let deferredPrompt: InstallPromptEvent | null = null;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const standaloneQuery = window.matchMedia("(display-mode: standalone)");
    const isStandalone = () =>
      standaloneQuery.matches ||
      window.matchMedia("(display-mode: fullscreen)").matches ||
      Boolean((navigator as Navigator & { standalone?: boolean }).standalone);

    if (isStandalone()) {
      button.hidden = true;
      return;
    }

    button.hidden = false;
    button.textContent = "↓ Install";

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      deferredPrompt = event as InstallPromptEvent;
      button.textContent = "↓ Install";
      button.dataset.nativeInstallReady = "true";
    };

    const onInstalled = () => {
      button.hidden = true;
      deferredPrompt = null;
    };

    const onClick = async () => {
      if (deferredPrompt) {
        const promptEvent = deferredPrompt;
        deferredPrompt = null;
        try {
          await promptEvent.prompt();
          const choice = await promptEvent.userChoice;
          if (choice.outcome === "accepted") button.hidden = true;
          else button.textContent = "↓ Install";
        } catch {
          button.textContent = isIOS ? "Share → Add to Home Screen" : "Browser menu → Install app";
        }
        return;
      }

      // No website popup: show the platform's native/manual path in the button itself.
      button.textContent = isIOS
        ? "Share → Add to Home Screen"
        : "Browser menu → Install app";
      button.setAttribute("aria-label", button.textContent);
    };

    button.addEventListener("click", onClick);
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // The website remains fully usable if offline support is unavailable.
      });
    }

    return () => {
      button.removeEventListener("click", onClick);
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  return null;
}
