/*
 * InstallAppButton — prominent PWA install CTA
 *
 * - Header variant: compact gradient pill for the top bar
 * - FAB variant: fixed floating button on mobile (above bottom nav)
 * - Hidden automatically when app is already installed (standalone mode)
 * - iOS: shows guided toast (Share → Add to Home Screen)
 * - Android/Desktop Chrome: triggers native beforeinstallprompt
 */

import { Download, Smartphone, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePwaInstall } from "@/hooks/use-pwa-install";
import { cn } from "@/lib/utils";

type Variant = "header" | "fab" | "hero";

function showIOSGuide() {
  toast("Add PharmaCalc Pro to your home screen", {
    description: "Tap the Share button (↑) in Safari, then choose “Add to Home Screen”.",
    duration: 8000,
    icon: <Smartphone className="size-4 text-primary" />,
  });
}

function showInstallSuccess() {
  toast.success("PharmaCalc Pro installed!", {
    description: "All calculators now work offline — perfect for the pharmacy bench.",
    duration: 5000,
    icon: <Sparkles className="size-4 text-accent" />,
  });
}

export function InstallAppButton({ variant = "header" }: { variant?: Variant }) {
  const { showInstallUI, isIOS, promptInstall } = usePwaInstall();
  const isMobile = useIsMobile();
  const [fabDismissed, setFabDismissed] = useState(false);

  if (!showInstallUI) return null;
  if (variant === "fab" && fabDismissed) return null;

  const handleInstall = async () => {
    const outcome = await promptInstall();
    if (outcome === "accepted") showInstallSuccess();
    else if (outcome === "ios-guide" || (isIOS && outcome === "unavailable")) showIOSGuide();
    else if (outcome === "unavailable") {
      toast("Install from your browser menu", {
        description: "Look for “Install app” or “Add to Home Screen” in the browser menu.",
        duration: 6000,
      });
    }
  };

  // Mobile-friendly label — easy for kids/parents to understand (like portfolio sites)
  const label = isIOS
    ? "Add to Home Screen"
    : isMobile
      ? "Download to Phone"
      : "Install App";

  if (variant === "fab") {
    return (
      <div className="md:hidden fixed bottom-[4.75rem] right-4 z-40 flex items-end gap-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <button
          onClick={() => setFabDismissed(true)}
          aria-label="Dismiss install prompt"
          className="size-7 rounded-full bg-card/90 border border-border shadow-md grid place-items-center text-muted-foreground hover:text-foreground backdrop-blur-sm"
        >
          <X className="size-3.5" />
        </button>
        <button
          onClick={handleInstall}
          className="group relative flex items-center gap-2.5 h-12 pl-4 pr-5 rounded-2xl bg-gradient-to-r from-primary via-accent to-success text-primary-foreground font-semibold text-sm shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:brightness-105 active:scale-[0.97] transition-all duration-200 overflow-hidden"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          <span className="relative flex size-8 items-center justify-center rounded-xl bg-white/20">
            <Download className="size-4" />
          </span>
          <span className="relative">{label}</span>
        </button>
      </div>
    );
  }

  if (variant === "hero") {
    return (
      <button
        onClick={handleInstall}
        className="group relative inline-flex items-center justify-center gap-2.5 h-12 px-6 rounded-2xl bg-gradient-to-r from-primary via-accent to-success text-primary-foreground font-semibold shadow-md shadow-primary/20 hover:shadow-lg hover:brightness-105 active:scale-[0.98] transition-all duration-200 overflow-hidden"
      >
        <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/25 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        <Smartphone className="relative size-4" />
        <span className="relative">{label}</span>
      </button>
    );
  }

  // header — compact but unmistakable
  return (
    <button
      onClick={handleInstall}
      className="group relative inline-flex items-center gap-1.5 h-9 pl-2.5 pr-3.5 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground text-xs font-semibold shadow-sm shadow-primary/20 hover:shadow-md hover:brightness-105 active:scale-[0.97] transition-all duration-200 overflow-hidden"
      aria-label={label}
    >
      <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity" />
      <span className="relative grid place-items-center size-6 rounded-lg bg-white/20">
        <Download className="size-3.5" />
      </span>
      <span className="relative hidden min-[400px]:inline">{label}</span>
      <span className="relative min-[400px]:hidden">Install</span>
    </button>
  );
}