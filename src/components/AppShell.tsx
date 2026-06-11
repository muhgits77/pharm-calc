import { Link, useRouterState, Outlet } from "@tanstack/react-router";
import { LayoutDashboard, Calculator, History, Moon, Sun, Pill, User2 } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { usePatient } from "@/lib/patient-context";
import { cn } from "@/lib/utils";

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
      <aside className="hidden md:flex flex-col w-60 border-r border-sidebar-border bg-sidebar">
        <div className="px-5 py-5 flex items-center gap-2.5 border-b border-sidebar-border">
          <div className="size-9 rounded-xl bg-gradient-to-br from-primary to-accent grid place-items-center shadow-sm">
            <Pill className="size-5 text-primary-foreground" />
          </div>
          <div>
            <div className="text-sm font-semibold tracking-tight text-sidebar-foreground">PharmaCalc</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Pro</div>
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
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                    : "text-sidebar-foreground hover:bg-sidebar-accent",
                )}
              >
                <n.icon className="size-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-sidebar-border text-[11px] text-muted-foreground">
          For educational use. Always verify with a licensed pharmacist.
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-border flex items-center justify-between px-4 md:px-6 bg-background/80 backdrop-blur sticky top-0 z-10">
          <div className="flex items-center gap-2 md:hidden">
            <Pill className="size-5 text-primary" />
            <span className="font-semibold">PharmaCalc Pro</span>
          </div>
          <div className="hidden md:block text-sm text-muted-foreground">
            Professional Pharmacy Calculations
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setOpen(true)}
              className={cn(
                "h-9 px-3 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors",
                hasPatient
                  ? "bg-primary/10 text-primary border-primary/30 hover:bg-primary/15"
                  : "border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
              aria-label="Patient context"
            >
              <User2 className="size-3.5" />
              <span className="hidden sm:inline max-w-[140px] truncate">{patientChip}</span>
            </button>
            <button
              onClick={toggle}
              aria-label="Toggle theme"
              className="size-9 rounded-lg border border-border hover:bg-accent hover:text-accent-foreground grid place-items-center transition-colors"
            >
              {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </button>
          </div>
        </header>

        <nav className="md:hidden flex gap-1 p-2 border-b border-border overflow-x-auto">
          {nav.map((n) => {
            const active = n.to === "/" ? path === "/" : path.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs whitespace-nowrap",
                  active ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground",
                )}
              >
                <n.icon className="size-3.5" />
                {n.label}
              </Link>
            );
          })}
        </nav>

        <main className="flex-1 p-4 md:p-8 max-w-6xl w-full mx-auto">
          <Outlet />
        </main>

        <footer className="px-6 py-4 text-xs text-muted-foreground border-t border-border">
          ⚠️ PharmaCalc Pro is for educational and reference use only. Always verify calculations
          with a licensed pharmacist before clinical use.
        </footer>
      </div>
    </div>
  );
}
