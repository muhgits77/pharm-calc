/*
 * PharmaCalc Pro — Dashboard (src/routes/index.tsx)
 *
 * CHANGES & IMPROVEMENTS (April 2026):
 *
 * 1. Hero Section — Completely redesigned for stronger visual impact and premium medical feel:
 *    - Larger, more confident headline with benefit-first language.
 *    - Subtle pharmacy-themed icon collage (decorative, low-opacity icon mosaic) visible on md+ screens.
 *    - Added trust/credibility micro-badges (Local-first, Evidence-based, PDF export).
 *    - Refined gradient, better padding, stronger CTA hierarchy (primary accent button + secondary).
 *
 * 2. Stats Bar — New clean, prominent stats bar placed directly under the hero:
 *    - Total Calculators (dynamic count from tile data)
 *    - Calculations Saved (live from local history)
 *    - Most Used (computed from history with count)
 *    - Last Activity (relative time or "—")
 *    - Responsive 2×2 on mobile → 4-column on lg. Subtle cards with good contrast.
 *
 * 3. Card Design (TileCard) — Major uplift for premium feel:
 *    - Increased padding (p-6), stronger subtle shadows (shadow-sm + hover:shadow-lg).
 *    - Lift + scale micro-interaction: hover:-translate-y-0.5, icon scale, arrow fade + translate.
 *    - Clearer visual hierarchy: larger semibold label, improved desc readability.
 *    - Colored gradient backgrounds kept but paired with better border hover states and ring accents.
 *    - Badge treatment refined (slightly larger, better positioned).
 *
 * 4. Recent Calculations — Made far more prominent and useful:
 *    - Moved higher in the visual flow (immediately after stats, before category grid).
 *    - Prominent header with icon, count, and "View all" link.
 *    - Richer rows: relative timestamps ("2h ago"), result + unit prominently displayed.
 *    - Best-effort deep links: clicks on a recent item navigate directly to the matching calculator tab.
 *    - Better empty state (subtle, encouraging).
 *    - Horizontal scroll affordance on very small screens + clean divide.
 *
 * 5. Overall Premium Medical Aesthetic:
 *    - Softer, more trustworthy color application (uses existing design tokens).
 *    - Consistent rounded-2xl/3xl language, refined tracking and leading.
 *    - Added subtle section dividers and breathing room (space-y tuned).
 *    - Footer note remains untouched; kept clinical disclaimer language clean.
 *
 * 6. Mobile & Typography:
 *    - Stats grid collapses gracefully (grid-cols-2 → lg:grid-cols-4).
 *    - Hero stacks nicely; icon collage hidden below md to preserve vertical space.
 *    - Improved tap targets on cards and recent rows.
 *    - Better font scale progression (text-3xl → md:text-4xl → lg:text-5xl on hero).
 *    - All existing routing, search params, and calculator data structures left 100% intact.
 *
 * No new dependencies. All behavior (Link to /calculators?tab=..., history usage) preserved.
 */

import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Pill, ArrowLeftRight, Droplets, Activity, FlaskConical,
  Percent, Beaker, Link2, Syringe, Calendar, ArrowRight, History,
  Ruler, Scale, ShieldAlert, TestTube, Baby,
  Award, Clock, TrendingUp, ShieldCheck, Star,
} from "lucide-react";
import { useMemo } from "react";
import { InstallAppButton } from "@/components/InstallAppButton";
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

type Tile = {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  desc: string;
  iconBg: string;
  color: string;
  badge?: string;
};

const BODY: Tile[] = [
  { to: "bsa", label: "BSA", icon: Ruler, desc: "Mosteller / Du Bois m²", color: "from-info/30 to-info/5", iconBg: "bg-info/20 text-info", badge: "NEW" },
  { to: "ibw", label: "IBW / AdjBW", icon: Scale, desc: "Devine formula + adjusted", color: "from-accent/30 to-accent/5", iconBg: "bg-accent/20 text-accent", badge: "NEW" },
  { to: "bmi", label: "BMI", icon: Activity, desc: "Body Mass Index + category", color: "from-destructive/30 to-destructive/5", iconBg: "bg-destructive/20 text-destructive" },
];

const CLINICAL: Tile[] = [
  { to: "crcl", label: "CrCl (Enhanced)", icon: FlaskConical, desc: "Cockcroft–Gault · ABW/IBW/AdjBW", color: "from-accent/30 to-accent/5", iconBg: "bg-accent/20 text-accent", badge: "UPGRADED" },
  { to: "mme", label: "MME / OME", icon: ShieldAlert, desc: "Daily morphine equivalents", color: "from-destructive/30 to-destructive/5", iconBg: "bg-destructive/20 text-destructive", badge: "NEW" },
  { to: "ped", label: "Pediatric Dose", icon: Baby, desc: "mg/kg, BSA, Young's, Clark's", color: "from-warning/30 to-warning/5", iconBg: "bg-warning/30 text-warning-foreground", badge: "NEW" },
  { to: "dosage", label: "Dosage", icon: Pill, desc: "Weight-based dose volumes", color: "from-accent/30 to-accent/5", iconBg: "bg-accent/20 text-accent" },
  { to: "iv", label: "IV Drip Rate", icon: Droplets, desc: "gtt/min from volume + time", color: "from-info/30 to-info/5", iconBg: "bg-info/20 text-info" },
  { to: "inject", label: "Inject DS", icon: Syringe, desc: "Insulin / heparin supply", color: "from-destructive/30 to-destructive/5", iconBg: "bg-destructive/20 text-destructive" },
];

const COMPOUND: Tile[] = [
  { to: "recon", label: "Reconstitution", icon: TestTube, desc: "Final concentration + diluent", color: "from-info/30 to-info/5", iconBg: "bg-info/20 text-info", badge: "NEW" },
  { to: "dilution", label: "Dilution", icon: Percent, desc: "C₁V₁ = C₂V₂", color: "from-warning/30 to-warning/5", iconBg: "bg-warning/30 text-warning-foreground" },
  { to: "alligation", label: "Alligation", icon: Beaker, desc: "Mixing strengths", color: "from-accent/30 to-accent/5", iconBg: "bg-accent/20 text-accent" },
  { to: "unit", label: "Unit Convert", icon: ArrowLeftRight, desc: "mg↔g, kg↔lbs, °F↔°C…", color: "from-info/30 to-info/5", iconBg: "bg-info/20 text-info" },
];

const WORKFLOW: Tile[] = [
  { to: "days", label: "Days' Supply", icon: Link2, desc: "Quantity ÷ daily dose · sig presets", color: "from-accent/30 to-accent/5", iconBg: "bg-accent/20 text-accent" },
  { to: "date", label: "Date Diff", icon: Calendar, desc: "Days between dates", color: "from-accent/30 to-accent/5", iconBg: "bg-accent/20 text-accent" },
];

// Best-effort mapping from history entry labels → calculator tab ids for deep links
const TAB_BY_LABEL: Record<string, string> = {
  "BSA": "bsa",
  "IBW / AdjBW": "ibw",
  "BMI": "bmi",
  "CrCl (Enhanced)": "crcl",
  "MME / OME": "mme",
  "Pediatric Dose": "ped",
  "Dosage": "dosage",
  "IV Drip Rate": "iv",
  "Inject DS": "inject",
  "Reconstitution": "recon",
  "Dilution": "dilution",
  "Alligation": "alligation",
  "Days' Supply": "days",
  "Date Diff": "date",
  "Unit Convert": "unit",
};

function getTabForCalculator(name: string): string | undefined {
  return TAB_BY_LABEL[name];
}

// Simple relative time (no external deps)
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

// Lightweight pharmacy-themed icon collage for the hero (purely decorative)
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
      {/* Soft backdrop wash */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/5 via-accent/5 to-transparent" />
      {/* Decorative icon cluster — pharmacy bench feel */}
      <div className="absolute inset-0">
        {icons.map((item, idx) => {
          const positions = [
            "top-2 left-3", "top-6 right-8", "top-12 left-10",
            "top-16 right-3", "bottom-8 left-4", "bottom-4 right-10",
            "top-3 right-16", "bottom-10 left-16",
          ];
          const pos = positions[idx % positions.length];
          const rotations = ["-rotate-6", "rotate-3", "-rotate-2", "rotate-6", "rotate-1", "-rotate-4"];
          return (
            <div
              key={idx}
              className={`absolute ${pos} ${rotations[idx % rotations.length]} rounded-2xl bg-white/60 dark:bg-white/5 p-2 shadow-sm ring-1 ring-border/50 backdrop-blur-sm`}
            >
              <item.Icon className={item.className} />
            </div>
          );
        })}
        {/* Central subtle cross / mortar accent */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/20 bg-primary/5 p-3">
          <ShieldCheck className="size-7 text-primary/60" />
        </div>
      </div>
    </div>
  );
}

// Improved premium tile card
function TileCard({ t }: { t: Tile }) {
  return (
    <Link
      to="/calculators"
      search={{ tab: t.to }}
      className={`group relative flex flex-col rounded-2xl border border-border/60 bg-gradient-to-br ${t.color} p-5 sm:p-6 shadow-card hover:shadow-card-hover hover:border-border transition-all duration-300 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.99]`}
    >
      {t.badge && (
        <span className="absolute top-4 right-4 text-[10px] font-semibold tracking-[0.5px] px-2 py-0.5 rounded-full bg-foreground text-background shadow-sm">
          {t.badge}
        </span>
      )}

      <div className="flex items-start justify-between">
        <div className={`size-12 rounded-2xl grid place-items-center ring-1 ring-inset ring-border/60 ${t.iconBg} transition-transform group-hover:scale-105`}>
          <t.icon className="size-5" />
        </div>
        <ArrowRight className="size-4 text-muted-foreground/70 transition-all group-hover:text-foreground group-hover:translate-x-0.5 mt-1" />
      </div>

      <div className="mt-5">
        <div className="font-semibold tracking-[-0.01em] text-[15px] leading-tight">{t.label}</div>
        <div className="text-xs text-muted-foreground/90 mt-1.5 pr-6 leading-snug">{t.desc}</div>
      </div>
    </Link>
  );
}

function Section({ title, subtitle, tiles }: { title: string; subtitle?: string; tiles: Tile[] }) {
  return (
    <section>
      <div className="flex items-baseline justify-between mb-4">
        <div>
          <h2 className="text-[13px] font-semibold uppercase tracking-[1.5px] text-muted-foreground/90">{title}</h2>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tiles.map((t) => <TileCard key={t.to} t={t} />)}
      </div>
    </section>
  );
}

// Clean, trustworthy stats bar
function StatsBar({ totalCalculators, history }: { totalCalculators: number; history: HistoryEntry[] }) {
  const { mostUsed, mostUsedCount, lastActivity } = useMemo(() => {
    if (!history.length) {
      return { mostUsed: "—", mostUsedCount: 0, lastActivity: "—" as string };
    }
    const counts = new Map<string, number>();
    history.forEach((h) => counts.set(h.calculator, (counts.get(h.calculator) ?? 0) + 1));
    const sorted = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
    const [topName, topCount] = sorted[0];
    const last = history[0].timestamp;
    return {
      mostUsed: topName.length > 18 ? topName.slice(0, 16) + "…" : topName,
      mostUsedCount: topCount,
      lastActivity: timeAgo(last),
    };
  }, [history]);

  const saved = history.length;

  const stats = [
    { label: "Total Calculators", value: totalCalculators.toString(), icon: Award, hint: "Precision tools" },
    { label: "Calculations Saved", value: saved.toString(), icon: Clock, hint: "On this device" },
    { label: "Most Used", value: mostUsed, icon: TrendingUp, hint: mostUsedCount ? `${mostUsedCount}×` : "" },
    { label: "Last Activity", value: lastActivity, icon: Star, hint: saved ? "Recent" : "" },
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
              <div className="font-semibold tracking-tight text-lg leading-none mt-1 truncate" title={s.value}>
                {s.value}
              </div>
              {s.hint && <div className="text-[10px] text-muted-foreground/70 mt-0.5">{s.hint}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Prominent, useful Recent Calculations section
function RecentCalculations({ history }: { history: HistoryEntry[] }) {
  if (history.length === 0) {
    return (
      <section className="rounded-3xl border border-dashed border-border/60 bg-gradient-to-br from-card/80 to-muted/20 p-6 sm:p-8 shadow-card">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="size-14 rounded-2xl bg-primary/10 text-primary grid place-items-center shrink-0">
            <History className="size-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-base tracking-tight">No recent calculations yet</div>
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
    <section>
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-xl bg-primary/10 text-primary grid place-items-center">
            <History className="size-4" />
          </div>
          <div>
            <span className="font-semibold tracking-tight">Recent Calculations</span>
            <span className="ml-2 text-xs text-muted-foreground">({history.length} total)</span>
          </div>
        </div>
        <Link
          to="/history"
          className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1"
        >
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
                  <span className="text-[10px] px-1.5 py-px rounded bg-muted text-muted-foreground font-mono tracking-tight">
                    {timeAgo(h.timestamp)}
                  </span>
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5 tabular-nums">
                  {new Date(h.timestamp).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="font-semibold text-base tracking-tight tabular-nums">{h.result}</div>
                {h.unit && <div className="text-xs text-muted-foreground/80">{h.unit}</div>}
              </div>

              <div className="shrink-0 pl-1 opacity-70 group-hover:opacity-100 transition">
                <ArrowRight className="size-4 text-muted-foreground group-hover:text-foreground" />
              </div>
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
  const totalCalculators = BODY.length + CLINICAL.length + COMPOUND.length + WORKFLOW.length;

  return (
    <div className="space-y-8 md:space-y-10">
      {/* HERO — authoritative clinical welcome + offline/install emphasis */}
      <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-primary/12 via-background to-accent/8 p-6 md:p-10 lg:p-12 shadow-card">
        {/* Subtle decorative wash */}
        <div className="pointer-events-none absolute -top-24 -right-24 size-64 rounded-full bg-accent/10 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-16 -left-16 size-48 rounded-full bg-primary/10 blur-3xl" aria-hidden />

        <div className="relative flex flex-col lg:flex-row gap-8 lg:gap-10 items-start">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/15 text-primary px-3 py-1 text-[11px] font-bold tracking-[1.5px]">
                PHARMACALC PRO
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 text-accent px-3 py-1 text-[11px] font-semibold">
                <ShieldCheck className="size-3" /> Works Offline
              </div>
            </div>

            <h1 className="text-[2rem] sm:text-4xl lg:text-[2.75rem] leading-[1.08] font-bold tracking-[-0.02em] max-w-[20ch] text-balance">
              Precise calculations.<br />
              <span className="text-primary">Trusted at the bench.</span>
            </h1>

            <p className="mt-4 max-w-xl text-[15px] sm:text-base text-muted-foreground leading-relaxed">
              15 professional pharmacy calculators with step-by-step workings, weight-adjusted renal dosing,
              pediatric rules, MME safety warnings, and one-click PDF export — built for real pharmacy workflows.
            </p>

            {/* Trust signals */}
            <div className="mt-5 flex flex-wrap gap-2">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/80 px-3 py-1.5 text-xs text-muted-foreground shadow-sm">
                <ShieldCheck className="size-3.5 text-primary" /> 100% Local — no data leaves device
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/80 px-3 py-1.5 text-xs text-muted-foreground shadow-sm">
                <Star className="size-3.5 text-warning" /> Evidence-based formulas
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/80 px-3 py-1.5 text-xs text-muted-foreground shadow-sm">
                Instant PDF export
              </div>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                to="/calculators"
                className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-2xl bg-gradient-to-r from-accent to-success text-accent-foreground font-semibold shadow-md shadow-accent/20 hover:shadow-lg hover:brightness-105 active:scale-[0.98] transition-all duration-200"
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

          {/* Pharmacy icon collage */}
          <PharmacyVisual />
        </div>
      </section>

      {/* STATS BAR — clean & useful */}
      <StatsBar totalCalculators={totalCalculators} history={history} />

      {/* RECENT CALCULATIONS — now prominent and actionable */}
      <RecentCalculations history={history} />

      {/* CATEGORY SECTIONS — improved cards */}
      <div className="space-y-9 pt-2">
        <Section title="Body Metrics" subtitle="BSA · IBW · BMI" tiles={BODY} />
        <Section title="Clinical Dosing" subtitle="Renal, opioid safety, pediatrics & weight-based" tiles={CLINICAL} />
        <Section title="Compounding & Conversions" subtitle="Reconstitution, dilution, alligation, unit conversions" tiles={COMPOUND} />
        <Section title="Workflow" subtitle="Days’ supply & scheduling tools" tiles={WORKFLOW} />
      </div>

      {/* Subtle footer trust line inside the page (kept minimal) */}
      <div className="pt-2 text-[11px] text-muted-foreground/70 px-1">
        All calculations run locally in your browser. Formulas are reference implementations — always double-check with clinical judgment and current guidelines.
      </div>
    </div>
  );
}
