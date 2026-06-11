import { useCallback, useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function detectInstalled(): boolean {
  if (typeof window === "undefined") return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    nav.standalone === true
  );
}

function detectIOS(): boolean {
  if (typeof window === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

/**
 * PWA install hook — surfaces the native install prompt (Chrome/Edge/Android)
 * and detects iOS Safari where manual "Add to Home Screen" is required.
 */
export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(detectInstalled);
  const [isIOS, setIsIOS] = useState(detectIOS);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    setIsIOS(detectIOS());
    setIsInstalled(detectInstalled());

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setCanInstall(true);
    };

    const onInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
      setDeferredPrompt(null);
    };

    const onDisplayMode = () => setIsInstalled(detectInstalled());

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    window.matchMedia("(display-mode: standalone)").addEventListener("change", onDisplayMode);

    // iOS never fires beforeinstallprompt — still offer guided install
    if (detectIOS() && !detectInstalled()) {
      setCanInstall(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
      window.matchMedia("(display-mode: standalone)").removeEventListener("change", onDisplayMode);
    };
  }, []);

  const promptInstall = useCallback(async (): Promise<"accepted" | "dismissed" | "ios-guide" | "unavailable"> => {
    if (isInstalled) return "unavailable";

    if (isIOS && !deferredPrompt) {
      return "ios-guide";
    }

    if (!deferredPrompt) return "unavailable";

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setCanInstall(false);
    if (outcome === "accepted") setIsInstalled(true);
    return outcome;
  }, [deferredPrompt, isIOS, isInstalled]);

  const showInstallUI = canInstall && !isInstalled;

  return { showInstallUI, isInstalled, isIOS, promptInstall };
}