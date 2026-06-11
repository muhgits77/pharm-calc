import { Link, useRouterState, Outlet } from "@tanstack/react-router";
import { LayoutDashboard, Calculator, History, Moon, Sun, Pill, User2, Leaf } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { usePatient } from "@/lib/patient-context";
import { APP_VERSION } from "@/lib/version";
import { cn } from "@/lib/utils";
import { InstallAppButton } from "@/components/InstallAppButton";
import { DisclaimerModal } from "@/components/DisclaimerModal";

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
      <aside className="hidden md:flex flex-col w-64 border-r border-sidebar-border bg-sidebar/95 backdrop-blur-sm">
        <div className="px-5 py-5 flex items-center gap-3 border-b border-sidebar-border">
          <div className="size-10 rounded-2xl bg-gradient-to-br from-primary via-primary to-gold grid place-items-center shadow-md shadow-primary/20">
            <Pill className="size-5 text-primary-foreground" />
          </div>
          <div>
            <div className="font-serif text-[15px] font-semibold tracking-tight text-sidebar-foreground">PharmaCalc</div>
            <div className="text-[10px] uppercase tracking-[2px] text-gold font-medium">Pro · Kentucky</div>
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
        <div className="p-4 border-t border-sidebar-border space-y-3">
          <InstallAppButton variant="hero" />
          <DisclaimerModal
            trigger={
              <button className="w-full text-left text-[10px] leading-relaxed text-muted-foreground hover:text-gold transition-colors underline-offset-2 hover:underline">
                Educational use only — view full disclaimer
              </button>
            }
          />
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-border/80 flex items-center justify-between px-3 sm:px-4 md:px-6 bg-background/85 backdrop-blur-md sticky top-0 z-30 supports-[padding:max(0px)]:pt-[env(safe-area-inset-top)]">
          <div className="flex items-center gap-2 md:hidden min-w-0">
            <div className="size-8 rounded-xl bg-gradient-to-br from-primary to-gold grid place-items-center shadow-sm shrink-0">
              <Pill className="size-4 text-primary-foreground" />
            </div>
            <span className="font-serif font-semibold tracking-tight truncate">PharmaCalc Pro</span>
          </div>
          <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground font-medium tracking-tight">
            <Leaf className="size-3.5 text-gold" />
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

        <main className="flex-1 p-4 sm:p-5 md:p-8 max-w-6xl w-full mx-auto animate-in fade-in slide-in-from-bottom-2 duration-300 pb-24 md:pb-8">
          <Outlet />
        </main>

        <InstallAppButton variant="fab" />

        <footer className="px-4 sm:px-6 py-4 border-t border-border/80 bg-card/30 backdrop-blur-sm space-y-3 supports-[padding:max(0px)]:pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="rounded-xl border border-warning/25 bg-warning/8 px-4 py-3 space-y-2">
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              <span className="font-semibold text-foreground">Clinical Disclaimer:</span>{" "}
              PharmaCalc Pro is for educational and reference use only. All calculations run locally on your device.
              Always verify results with a licensed pharmacist and current clinical guidelines before patient use.
              Not a substitute for professional clinical judgment.
            </p>
            <DisclaimerModal
              trigger={
                <button className="text-[11px] font-medium text-gold hover:underline">
                  View complete disclaimer &amp; limitations →
                </button>
              }
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground/80">
            <span className="font-medium flex items-center gap-1.5">
              <Leaf className="size-3 text-gold" />
              Kentucky Bluegrass Digital Forge · Crafted for pharmacists
            </span>
            <span className="tabular-nums font-mono text-[10px] bg-muted/60 px-2 py-0.5 rounded-md">v{APP_VERSION}</span>
          </div>
        </footer>
      </div>
    </div>
  );
}