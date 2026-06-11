import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Trash2, Download, History as HistoryIcon, ArrowRight, Calculator } from "lucide-react";
import { clearHistory, deleteEntry, exportCSV, useHistory } from "@/lib/history";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "History — PharmaCalc Pro" },
      { name: "description", content: "Saved pharmacy calculations stored locally on your device." },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const list = useHistory();
  const [filter, setFilter] = useState<string>("all");
  const categories = useMemo(() => {
    const map = new Map<string, number>();
    list.forEach((e) => map.set(e.calculator, (map.get(e.calculator) ?? 0) + 1));
    return Array.from(map.entries()).sort();
  }, [list]);
  const filtered = filter === "all" ? list : list.filter((e) => e.calculator === filter);

  return (
    <div>
      <div className="flex items-start justify-between mb-6 gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Calculation History</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Stored locally in your browser ({list.length} {list.length === 1 ? "entry" : "entries"}).
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => exportCSV(list)}
            disabled={!list.length}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:brightness-110 transition disabled:opacity-40"
          >
            <Download className="size-3.5" /> Export CSV
          </button>
          <button
            onClick={() => confirm("Clear all history?") && clearHistory()}
            disabled={!list.length}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md border border-destructive/30 text-destructive text-sm font-medium hover:bg-destructive/10 transition disabled:opacity-40"
          >
            <Trash2 className="size-3.5" /> Clear All
          </button>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border/60 bg-gradient-to-br from-card to-muted/20 p-10 sm:p-14 text-center shadow-card">
          <div className="size-16 rounded-2xl bg-primary/10 text-primary grid place-items-center mx-auto mb-4">
            <HistoryIcon className="size-8" />
          </div>
          <div className="font-semibold text-lg tracking-tight">No saved calculations yet</div>
          <div className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto leading-relaxed">
            Run any calculator and tap <span className="font-medium text-foreground">Save to History</span> to build your personal record — stored only on this device.
          </div>
          <Link
            to="/calculators"
            className="inline-flex items-center gap-2 mt-6 h-11 px-6 rounded-2xl bg-gradient-to-r from-accent to-success text-accent-foreground font-semibold shadow-sm hover:brightness-105 active:scale-[0.98] transition"
          >
            <Calculator className="size-4" /> Open Calculators <ArrowRight className="size-4" />
          </Link>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setFilter("all")}
              className={cn(
                "h-8 px-3 rounded-full text-xs font-medium border transition",
                filter === "all"
                  ? "bg-primary text-primary-foreground border-transparent"
                  : "bg-card border-border text-muted-foreground hover:text-foreground",
              )}
            >
              All ({list.length})
            </button>
            {categories.map(([cat, n]) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={cn(
                  "h-8 px-3 rounded-full text-xs font-medium border transition",
                  filter === cat
                    ? "bg-primary text-primary-foreground border-transparent"
                    : "bg-card border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {cat} ({n})
              </button>
            ))}
          </div>
          <div className="space-y-2">
            {filtered.map((e) => (
            <div key={e.id} className="rounded-2xl border border-border/60 bg-card p-4 sm:p-5 flex items-start justify-between gap-4 shadow-card hover:shadow-card-hover transition-all duration-300">
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <div className="font-semibold">{e.calculator}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(e.timestamp).toLocaleString()}
                  </div>
                </div>
                <div className="mt-1 text-xs text-muted-foreground font-mono break-words">
                  {Object.entries(e.inputs).map(([k, v]) => `${k}: ${v}`).join("  •  ")}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-lg font-bold tracking-tight">{e.result}</div>
                <div className="text-xs text-muted-foreground">{e.unit}</div>
              </div>
              <button
                onClick={() => deleteEntry(e.id)}
                aria-label="Delete"
                className="size-8 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 grid place-items-center transition"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
          </div>
        </>
      )}

      <div className="mt-8 rounded-xl border border-warning/30 bg-warning/10 p-4 text-xs text-warning-foreground">
        ⚠️ All calculations are stored only on this device. Clearing your browser data will remove them.
      </div>
    </div>
  );
}
