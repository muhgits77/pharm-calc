/*
 * AppShell — layout shell (June 2026 polish)
 *
 * - PWA install button in header + mobile FAB (hidden when already installed)
 * - Refined sidebar/header typography, nav hover transitions, card-like footer
 * - Footer: clinical disclaimer + "Made with ❤️ for pharmacists" + version
 * - Main content fade-in for perceived performance
 * - Safe-area padding for notched phones
 */

import { Link, useRouterState, Outlet } from "@tanstack/react-router";
import { LayoutDashboard, Calculator, History, Moon, Sun, Pill, User2 } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { usePatient } from "@/lib/patient-context";
import { APP_VERSION } from "@/lib/version";
import { cn } from "@/lib/utils";
import { InstallAppButton } from "@/components/InstallAppButton";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/calculators", label: "Calculators", icon: Calculator },
  { to: "/history", label: "History", icon: History },
];

export function AppShell() {
  const { theme, toggle } = useTheme();
  const { patient, hasPatient, setOpen } = usePatient();
  const path = useRouterState({ select: (s) => s.location.pathname });

  const patientChip = hasPatient
    ? [patient.name || "Patient", patient.age && `${patient.age}y`, patient.sex && patient.sex[0].toUpperCase()]
        .filter(Boolean)
        .join(" · ")
    : "Add Patient";

  return (
    <div className="min-h-screen flex w-full bg-background text-foreground">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-sidebar-border bg-sidebar/95 backdrop-blur-sm">
        <div className="px-5 py-5 flex items-center gap-3 border-b border-sidebar-border">
          <div className="size-10 rounded-2xl bg-gradient-to-br from-primary via-primary to-accent grid place-items-center shadow-md shadow-primary/20">
            <Pill className="size-5 text-primary-foreground" />
          </div>
          <div>
            <div className="text-[15px] font-semibold tracking-tight text-sidebar-foreground">PharmaCalc</div>
            <div className="text-[10px] uppercase tracking-[2px] text-muted-foreground font-medium">Pro</div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {nav.map((n) => {
            const active = n.to === "/" ? path === "/" : path.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm shadow-primary/15"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:translate-x-0.5",
                )}
              >
                <n.icon className="size-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-sidebar-border space-y-2">
          <InstallAppButton variant="hero" />
          <p className="text-[10px] leading-relaxed text-muted-foreground">
            For educational use. Always verify with a licensed pharmacist.
          </p>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky header */}
        <header className="h-14 border-b border-border/80 flex items-center justify-between px-3 sm:px-4 md:px-6 bg-background/85 backdrop-blur-md sticky top-0 z-30 supports-[padding:max(0px)]:pt-[env(safe-area-inset-top)]">
          <div className="flex items-center gap-2 md:hidden min-w-0">
            <div className="size-8 rounded-xl bg-gradient-to-br from-primary to-accent grid place-items-center shadow-sm shrink-0">
              <Pill className="size-4 text-primary-foreground" />
            </div>
            <span className="font-semibold tracking-tight truncate">PharmaCalc Pro</span>
          </div>
          <div className="hidden md:block text-sm text-muted-foreground font-medium tracking-tight">
            Professional Pharmacy Calculations
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <InstallAppButton variant="header" />
            <button
              onClick={() => setOpen(true)}
              className={cn(
                "h-9 px-2.5 sm:px-3 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all duration-200 active:scale-[0.97]",
                hasPatient
                  ? "bg-primary/10 text-primary border-primary/30 hover:bg-primary/15 shadow-sm"
                  : "border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
              aria-label="Patient context"
            >
              <User2 className="size-3.5" />
              <span className="hidden sm:inline max-w-[120px] truncate">{patientChip}</span>
            </button>
            <button
              onClick={toggle}
              aria-label="Toggle theme"
              className="size-9 rounded-xl border border-border hover:bg-accent hover:text-accent-foreground grid place-items-center transition-all duration-200 active:scale-[0.95]"
            >
              {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </button>
          </div>
        </header>

        {/* Mobile tab nav */}
        <nav className="md:hidden flex gap-1.5 p-2 border-b border-border/80 overflow-x-auto scrollbar-none bg-background/60 backdrop-blur-sm">
          {nav.map((n) => {
            const active = n.to === "/" ? path === "/" : path.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-all duration-200 active:scale-[0.97]",
                  active
                    ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-sm"
                    : "bg-secondary/80 text-secondary-foreground hover:bg-secondary",
                )}
              >
                <n.icon className="size-3.5" />
                {n.label}
              </Link>
            );
          })}
        </nav>

        {/* Page content with subtle entrance animation */}
        <main className="flex-1 p-4 sm:p-5 md:p-8 max-w-6xl w-full mx-auto animate-in fade-in slide-in-from-bottom-2 duration-300 pb-24 md:pb-8">
          <Outlet />
        </main>

        {/* Mobile FAB install prompt */}
        <InstallAppButton variant="fab" />

        {/* Footer */}
        <footer className="px-4 sm:px-6 py-4 border-t border-border/80 bg-card/30 backdrop-blur-sm space-y-2 supports-[padding:max(0px)]:pb-[max(1rem,env(safe-area-inset-bottom))]">
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            ⚠️ PharmaCalc Pro is for educational and reference use only. Always verify calculations
            with a licensed pharmacist before clinical use.
          </p>
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground/80">
            <span className="font-medium">Made with <span className="text-destructive/90">❤️</span> for pharmacists</span>
            <span className="tabular-nums font-mono text-[10px] bg-muted/60 px-2 py-0.5 rounded-md">v{APP_VERSION}</span>
          </div>
        </footer>
      </div>
    </div>
  );
}