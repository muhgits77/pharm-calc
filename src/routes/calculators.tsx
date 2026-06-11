import { createFileRoute } from "@tanstack/react-router";
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
    <div>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Pharmacy Calculator</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Select a calculator below. Results include step-by-step working, save, and PDF export.
        </p>
      </div>
      <CalculatorPanel initial={initial} />
    </div>
  );
}
