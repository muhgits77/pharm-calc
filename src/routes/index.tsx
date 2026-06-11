import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Pill, FlaskConical, Syringe, Beaker, Droplets, Scale, ShieldAlert, TestTube,
  ArrowRight, History, Award, Clock, TrendingUp, ShieldCheck, Star, Zap, Target, Leaf,
} from "lucide-react";
import { useMemo } from "react";
import { InstallAppButton } from "@/components/InstallAppButton";
import { CalculatorGrid } from "@/components/CalculatorGrid";
import { DisclaimerModal } from "@/components/DisclaimerModal";
import {
  ALL_CALCULATOR_TILES,
  QUICK_LAUNCH_IDS,
  TAB_BY_LABEL,
} from "@/lib/calculator-catalog";
import { useHistory, type HistoryEntry } from "@/lib/history";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — PharmaCalc Pro" },
      { name: "description", content: "Professional pharmacy calculators: BSA, IBW, CrCl, MME, dosing, and more." },
    ],
  }),
  component: Dashboard,
});

function timeAgo(timestamp: number): string {
  const diffMs = Date.now() - timestamp;
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function getTabForCalculator(name: string): string | undefined {
  return TAB_BY_LABEL[name];
}

function PharmacyVisual() {
  const icons = [
    { Icon: Pill, className: "size-5 text-primary/40" },
    { Icon: FlaskConical, className: "size-6 text-accent/40" },
    { Icon: Syringe, className: "size-4 text-info/40" },
    { Icon: Beaker, className: "size-5 text-success/40" },
    { Icon: TestTube, className: "size-4 text-warning/40" },
    { Icon: Droplets, className: "size-5 text-info/30" },
    { Icon: Scale, className: "size-4 text-accent/35" },
    { Icon: ShieldAlert, className: "size-4 text-destructive/35" },
  ];
  return (
    <div className="relative hidden md:block w-full max-w-[220px] h-[180px] select-none" aria-hidden>
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/8 via-gold/5 to-accent/5 ring-1 ring-inset ring-gold/10" />
      <div className="absolute inset-0">
        {icons.map((item, idx) => {
          const positions = [
            "top-2 left-3", "top-6 right-8", "top-12 left-10",
            "top-16 right-3", "bottom-8 left-4", "bottom-4 right-10",
            "top-3 right-16", "bottom-10 left-16",
          ];
          const rotations = ["-rotate-6", "rotate-3", "-rotate-2", "rotate-6", "rotate-1", "-rotate-4"];
          return (
            <div
              key={idx}
              className={`absolute ${positions[idx % positions.length]} ${rotations[idx % rotations.length]} rounded-2xl bg-white/60 dark:bg-white/5 p-2 shadow-sm ring-1 ring-border/50 backdrop-blur-sm transition-transform duration-500 hover:scale-105`}
            >
              <item.Icon className={item.className} />
            </div>
          );
        })}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold/30 bg-gold/10 p-3 shadow-gold-glow">
          <Leaf className="size-7 text-primary/70" />
        </div>
      </div>
    </div>
  );
}

function QuickLaunchCards() {
  const tiles = QUICK_LAUNCH_IDS.map((id) => ALL_CALCULATOR_TILES.find((t) => t.id === id)!);

  return (
    <section className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-serif text-lg font-semibold tracking-tight">Quick Launch</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Bench-ready tools — one tap away</p>
        </div>
        <Link to="/calculators" className="text-xs font-medium text-gold hover:underline inline-flex items-center gap-1">
          All tools <ArrowRight className="size-3" />
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {tiles.map((t) => (
          <Link
            key={t.id}
            to="/calculators"
            search={{ tab: t.id }}
            className="group flex flex-col items-center gap-2.5 rounded-2xl border border-border/60 bg-card p-4 shadow-card hover:shadow-card-hover hover:border-gold/40 hover:-translate-y-0.5 transition-all duration-300 active:scale-[0.98] text-center"
          >
            <div className={`size-11 rounded-2xl grid place-items-center ring-1 ring-inset ring-border/40 transition-transform duration-300 group-hover:scale-110 ${t.iconBg}`}>
              <t.icon className="size-5" />
            </div>
            <span className="text-xs font-semibold tracking-tight leading-tight">{t.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function MotivationalStats({ history }: { history: HistoryEntry[] }) {
  const stats = useMemo(() => {
    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const thisWeek = history.filter((h) => h.timestamp >= weekAgo).length;

    const daySet = new Set<string>();
    history.forEach((h) => daySet.add(new Date(h.timestamp).toDateString()));
    const activeDays = daySet.size;

    let streak = 0;
    if (history.length) {
      const today = new Date();
      for (let i = 0; i < 30; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        if (daySet.has(d.toDateString())) streak++;
        else if (i > 0) break;
      }
    }

    const counts = new Map<string, number>();
    history.forEach((h) => counts.set(h.calculator, (counts.get(h.calculator) ?? 0) + 1));
    const sorted = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
    const [topName, topCount] = sorted[0] ?? ["—", 0];

    const message = history.length === 0
      ? "Your bench is ready — run your first calculation today."
      : streak >= 3
        ? `${streak}-day streak. Consistency builds confidence at the bench.`
        : thisWeek >= 5
          ? `${thisWeek} calculations this week. You're in the flow.`
          : "Every verified calculation strengthens patient safety.";

    return { thisWeek, activeDays, streak, mostUsed: topName, mostUsedCount: topCount, message, lastActivity: history[0] ? timeAgo(history[0].timestamp) : "—" };
  }, [history]);

  const items = [
    { label: "This Week", value: stats.thisWeek.toString(), icon: Zap, hint: "Calculations" },
    { label: "Active Days", value: stats.activeDays.toString(), icon: Target, hint: stats.streak ? `${stats.streak}d streak` : "All time" },
    { label: "Most Used", value: stats.mostUsed.length > 16 ? stats.mostUsed.slice(0, 14) + "…" : stats.mostUsed, icon: TrendingUp, hint: stats.mostUsedCount ? `${stats.mostUsedCount}×` : "" },
    { label: "Last Activity", value: stats.lastActivity, icon: Clock, hint: history.length ? "Recent" : "" },
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-gold/25 bg-gradient-to-r from-gold/10 via-gold/5 to-transparent px-4 py-3 flex items-center gap-3 animate-in fade-in duration-700">
        <div className="size-9 rounded-xl bg-gold/20 text-gold grid place-items-center shrink-0">
          <Star className="size-4" />
        </div>
        <p className="text-sm text-foreground/90 font-medium leading-snug">{stats.message}</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {items.map((s, i) => {
          const Icon = s.icon;
          return (
            <div
              key={i}
              className="rounded-2xl border border-border/60 bg-card px-4 py-3.5 flex items-center gap-3 shadow-card hover:shadow-card-hover hover:border-gold/20 transition-all duration-300"
            >
              <div className="size-9 rounded-xl bg-primary/10 text-primary grid place-items-center shrink-0">
                <Icon className="size-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80">{s.label}</div>
                <div className="font-semibold tracking-tight text-lg leading-none mt-1 truncate" title={s.value}>{s.value}</div>
                {s.hint && <div className="text-[10px] text-gold/80 mt-0.5 font-medium">{s.hint}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatsBar({ totalCalculators, history }: { totalCalculators: number; history: HistoryEntry[] }) {
  const saved = history.length;
  const stats = [
    { label: "Total Calculators", value: totalCalculators.toString(), icon: Award, hint: "Precision tools" },
    { label: "Calculations Saved", value: saved.toString(), icon: Clock, hint: "On this device" },
    { label: "Offline Ready", value: "100%", icon: ShieldCheck, hint: "Local PWA" },
    { label: "PDF Export", value: "All", icon: Star, hint: "Step-by-step" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((s, i) => {
        const Icon = s.icon;
        return (
          <div
            key={i}
            className="rounded-2xl border border-border/60 bg-card px-4 py-3.5 flex items-center gap-3 shadow-card hover:shadow-card-hover transition-shadow duration-300"
          >
            <div className="size-9 rounded-xl bg-muted grid place-items-center shrink-0">
              <Icon className="size-4 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80">{s.label}</div>
              <div className="font-semibold tracking-tight text-lg leading-none mt-1 truncate">{s.value}</div>
              {s.hint && <div className="text-[10px] text-muted-foreground/70 mt-0.5">{s.hint}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RecentCalculations({ history }: { history: HistoryEntry[] }) {
  if (history.length === 0) {
    return (
      <section className="rounded-3xl border border-dashed border-border/60 bg-gradient-to-br from-card/80 to-muted/20 p-6 sm:p-8 shadow-card animate-in fade-in duration-500">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="size-14 rounded-2xl bg-primary/10 text-primary grid place-items-center shrink-0">
            <History className="size-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-serif font-semibold text-base tracking-tight">No recent calculations yet</div>
            <div className="text-sm text-muted-foreground mt-1 leading-relaxed">
              Open any calculator, run your numbers, then tap <span className="font-medium text-foreground">Save to History</span> — results appear here instantly for quick recall at the bench.
            </div>
            <Link
              to="/calculators"
              className="inline-flex items-center gap-1.5 mt-3 h-9 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:brightness-105 active:scale-[0.98] transition"
            >
              Start calculating <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const visible = history.slice(0, 6);

  return (
    <section className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-xl bg-primary/10 text-primary grid place-items-center">
            <History className="size-4" />
          </div>
          <div>
            <span className="font-serif font-semibold tracking-tight">Recent Activity</span>
            <span className="ml-2 text-xs text-muted-foreground">({history.length} total)</span>
          </div>
        </div>
        <Link to="/history" className="text-xs font-medium text-gold hover:underline inline-flex items-center gap-1">
          View all <ArrowRight className="size-3" />
        </Link>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden divide-y divide-border/60 shadow-card">
        {visible.map((h) => {
          const tab = getTabForCalculator(h.calculator);
          const content = (
            <div className="px-4 py-3.5 flex items-center justify-between gap-4 group">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold tracking-[-0.1px] text-[14px]">{h.calculator}</span>
                  <span className="text-[10px] px-1.5 py-px rounded bg-gold/15 text-gold font-mono tracking-tight">
                    {timeAgo(h.timestamp)}
                  </span>
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5 tabular-nums">
                  {new Date(h.timestamp).toLocaleDateString(undefined, {
                    month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
                  })}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="font-semibold text-base tracking-tight tabular-nums">{h.result}</div>
                {h.unit && <div className="text-xs text-muted-foreground/80">{h.unit}</div>}
              </div>
              <ArrowRight className="size-4 text-muted-foreground group-hover:text-gold group-hover:translate-x-0.5 transition-all shrink-0" />
            </div>
          );

          return tab ? (
            <Link key={h.id} to="/calculators" search={{ tab }} className="block hover:bg-muted/40 active:bg-muted/60 transition-colors">
              {content}
            </Link>
          ) : (
            <Link key={h.id} to="/calculators" className="block hover:bg-muted/40 active:bg-muted/60 transition-colors">
              {content}
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function Dashboard() {
  const history = useHistory();
  const totalCalculators = ALL_CALCULATOR_TILES.length;

  return (
    <div className="space-y-8 md:space-y-10">
      <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-primary/12 via-background to-gold/8 p-6 md:p-10 lg:p-12 shadow-card">
        <div className="pointer-events-none absolute -top-24 -right-24 size-64 rounded-full bg-gold/10 blur-3xl animate-forge-shimmer" aria-hidden />
        <div className="pointer-events-none absolute -bottom-16 -left-16 size-48 rounded-full bg-primary/10 blur-3xl" aria-hidden />

        <div className="relative flex flex-col lg:flex-row gap-8 lg:gap-10 items-start">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/15 text-primary px-3 py-1 text-[11px] font-bold tracking-[1.5px]">
                <Leaf className="size-3" /> PHARMACALC PRO
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-gold/35 bg-gold/10 text-gold px-3 py-1 text-[11px] font-semibold">
                Kentucky Bluegrass Digital Forge
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 text-accent px-3 py-1 text-[11px] font-semibold">
                <ShieldCheck className="size-3" /> Works Offline
              </div>
            </div>

            <h1 className="font-serif text-[2rem] sm:text-4xl lg:text-[2.75rem] leading-[1.08] font-bold tracking-[-0.02em] max-w-[22ch] text-balance">
              Precise calculations.<br />
              <span className="text-primary">Trusted at the bench.</span>
            </h1>

            <p className="mt-4 max-w-xl text-[15px] sm:text-base text-muted-foreground leading-relaxed">
              15 professional pharmacy calculators with step-by-step workings, weight-adjusted renal dosing,
              pediatric rules, MME safety warnings, and one-click PDF export — built for real pharmacy workflows.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/80 px-3 py-1.5 text-xs text-muted-foreground shadow-sm">
                <ShieldCheck className="size-3.5 text-primary" /> 100% Local — no data leaves device
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/80 px-3 py-1.5 text-xs text-muted-foreground shadow-sm">
                <Star className="size-3.5 text-gold" /> Evidence-based formulas
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/80 px-3 py-1.5 text-xs text-muted-foreground shadow-sm">
                Instant PDF export
              </div>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                to="/calculators"
                className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-2xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold shadow-md shadow-primary/20 hover:shadow-lg hover:brightness-105 active:scale-[0.98] transition-all duration-200"
              >
                Open Calculators <ArrowRight className="size-4" />
              </Link>
              <InstallAppButton variant="hero" />
              <Link
                to="/history"
                className="inline-flex items-center justify-center gap-2 h-12 px-5 rounded-2xl border border-border/70 bg-card hover:bg-secondary font-medium transition-all duration-200 text-sm active:scale-[0.98]"
              >
                <History className="size-4" /> History {history.length > 0 && <span className="tabular-nums">({history.length})</span>}
              </Link>
            </div>
          </div>
          <PharmacyVisual />
        </div>
      </section>

      <StatsBar totalCalculators={totalCalculators} history={history} />
      <QuickLaunchCards />
      <MotivationalStats history={history} />
      <RecentCalculations history={history} />

      <div className="pt-2">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-serif text-xl font-semibold tracking-tight">All Calculators</h2>
            <p className="text-sm text-muted-foreground mt-1">Grouped by clinical workflow</p>
          </div>
        </div>
        <CalculatorGrid />
      </div>

      <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-[11px] text-muted-foreground/70 px-1">
        <span>
          All calculations run locally in your browser. Formulas are reference implementations — always double-check with clinical judgment and current guidelines.
        </span>
        <DisclaimerModal
          trigger={
            <button className="text-gold hover:underline font-medium whitespace-nowrap">
              Read full disclaimer →
            </button>
          }
        />
      </div>
    </div>
  );
}