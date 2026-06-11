import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Calculator, LayoutGrid, List, ShieldCheck } from "lucide-react";
import { CalculatorPanel, VALID_TABS, type TabId } from "@/components/calculators/CalculatorPanel";
import { CalculatorGrid } from "@/components/CalculatorGrid";
import { DisclaimerModal } from "@/components/DisclaimerModal";
import { cn } from "@/lib/utils";

type Search = { tab?: string };

export const Route = createFileRoute("/calculators")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    tab: typeof s.tab === "string" ? s.tab : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Calculators — PharmaCalc Pro" },
      { name: "description", content: "BSA, IBW, CrCl, MME, reconstitution, pediatric dose, dilution, alligation, and more." },
    ],
  }),
  component: CalculatorsPage,
});

function CalculatorsPage() {
  const { tab } = Route.useSearch();
  const initial = (VALID_TABS.includes(tab as TabId) ? tab : "dosage") as TabId;
  const [activeTab, setActiveTab] = useState<TabId>(initial);
  const [view, setView] = useState<"grid" | "active">(tab && VALID_TABS.includes(tab as TabId) ? "active" : "grid");

  const handleSelect = (id: TabId) => {
    setActiveTab(id);
    setView("active");
    window.history.replaceState(null, "", `/calculators?tab=${id}`);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-card via-card to-gold/5 p-5 sm:p-6 shadow-card">
        <div className="flex items-start gap-4">
          <div className="size-12 rounded-2xl bg-gradient-to-br from-primary to-gold text-primary-foreground grid place-items-center shadow-md shadow-primary/15 shrink-0">
            <Calculator className="size-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight">Pharmacy Calculators</h1>
            <p className="text-sm sm:text-[15px] text-muted-foreground mt-1.5 leading-relaxed max-w-2xl">
              Select a calculator below. Every result includes step-by-step working, clinical notes,
              save-to-history, and polished PDF export.
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-accent font-medium">
              <ShieldCheck className="size-3.5" />
              All math runs locally — works offline after install
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setView("grid")}
            className={cn(
              "inline-flex items-center gap-1.5 h-9 px-4 rounded-xl text-xs font-semibold border transition-all active:scale-[0.98]",
              view === "grid"
                ? "bg-primary text-primary-foreground border-transparent shadow-sm"
                : "bg-card border-border text-muted-foreground hover:text-foreground",
            )}
          >
            <LayoutGrid className="size-3.5" /> Browse All
          </button>
          <button
            onClick={() => setView("active")}
            className={cn(
              "inline-flex items-center gap-1.5 h-9 px-4 rounded-xl text-xs font-semibold border transition-all active:scale-[0.98]",
              view === "active"
                ? "bg-primary text-primary-foreground border-transparent shadow-sm"
                : "bg-card border-border text-muted-foreground hover:text-foreground",
            )}
          >
            <List className="size-3.5" /> Active Calculator
          </button>
        </div>
      </div>

      {view === "grid" ? (
        <CalculatorGrid onSelect={handleSelect} activeTab={activeTab} />
      ) : (
        <CalculatorPanel initial={activeTab} onTabChange={setActiveTab} />
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <Link
          to="/history"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-gold transition-colors"
        >
          View saved calculations <ArrowRight className="size-3" />
        </Link>
        <DisclaimerModal
          trigger={
            <button className="text-xs text-gold hover:underline font-medium">
              Clinical disclaimer →
            </button>
          }
        />
      </div>
    </div>
  );
}