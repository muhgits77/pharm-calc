/*
 * Calculators page — June 2026 polish
 * Stronger page header with clinical authority + offline reminder
 */

import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Calculator, ShieldCheck } from "lucide-react";
import { CalculatorPanel, VALID_TABS, type TabId } from "@/components/calculators/CalculatorPanel";

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
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-card to-muted/20 p-5 sm:p-6 shadow-card">
        <div className="flex items-start gap-4">
          <div className="size-12 rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground grid place-items-center shadow-md shadow-primary/15 shrink-0">
            <Calculator className="size-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Pharmacy Calculators</h1>
            <p className="text-sm sm:text-[15px] text-muted-foreground mt-1.5 leading-relaxed max-w-2xl">
              Select a calculator below. Every result includes step-by-step working, clinical notes,
              save-to-history, and PDF export.
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-accent font-medium">
              <ShieldCheck className="size-3.5" />
              All math runs locally — works offline after install
            </div>
          </div>
        </div>
      </div>
      <CalculatorPanel initial={initial} />
      <div className="text-center">
        <Link
          to="/history"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          View saved calculations <ArrowRight className="size-3" />
        </Link>
      </div>
    </div>
  );
}