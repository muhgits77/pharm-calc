import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { CALCULATOR_CATEGORIES, type CalculatorTile } from "@/lib/calculator-catalog";
import { cn } from "@/lib/utils";
import type { TabId } from "@/components/calculators/CalculatorPanel";

function TileCard({ tile, onSelect, active }: { tile: CalculatorTile; onSelect?: (id: TabId) => void; active?: boolean }) {
  const inner = (
    <>
      {tile.badge && (
        <span className="absolute top-3.5 right-3.5 text-[9px] font-bold tracking-[0.5px] px-2 py-0.5 rounded-full bg-gold/90 text-gold-foreground shadow-sm">
          {tile.badge}
        </span>
      )}
      <div className="flex items-start justify-between">
        <div className={cn(
          "size-11 rounded-2xl grid place-items-center ring-1 ring-inset ring-border/50 transition-transform duration-300 group-hover:scale-105",
          tile.iconBg,
        )}>
          <tile.icon className="size-5" />
        </div>
        <ArrowRight className="size-4 text-muted-foreground/60 transition-all duration-300 group-hover:text-gold group-hover:translate-x-0.5 mt-1" />
      </div>
      <div className="mt-4">
        <div className="font-semibold tracking-[-0.01em] text-[15px] leading-tight">{tile.label}</div>
        <div className="text-xs text-muted-foreground/90 mt-1.5 pr-5 leading-snug">{tile.desc}</div>
      </div>
    </>
  );

  const className = cn(
    "group relative flex flex-col rounded-2xl border p-5 sm:p-6 shadow-card transition-all duration-300",
    "hover:shadow-card-hover hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.99]",
    `bg-gradient-to-br ${tile.color}`,
    active
      ? "border-gold/50 ring-2 ring-gold/30 shadow-card-hover"
      : "border-border/60 hover:border-gold/30",
  );

  if (onSelect) {
    return (
      <button type="button" onClick={() => onSelect(tile.id)} className={cn(className, "text-left w-full")}>
        {inner}
      </button>
    );
  }

  return (
    <Link to="/calculators" search={{ tab: tile.id }} className={className}>
      {inner}
    </Link>
  );
}

export function CalculatorGrid({
  onSelect,
  activeTab,
  compact,
}: {
  onSelect?: (id: TabId) => void;
  activeTab?: TabId;
  compact?: boolean;
}) {
  return (
    <div className={cn("space-y-8", compact && "space-y-6")}>
      {CALCULATOR_CATEGORIES.map((cat) => (
        <section key={cat.id} className="animate-in fade-in slide-in-from-bottom-1 duration-500 fill-mode-both" style={{ animationDelay: `${CALCULATOR_CATEGORIES.indexOf(cat) * 80}ms` }}>
          <div className="flex items-baseline justify-between mb-4">
            <div>
              <h2 className="font-serif text-lg font-semibold tracking-tight text-foreground">{cat.title}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{cat.subtitle}</p>
            </div>
            <span className="text-[10px] font-medium uppercase tracking-wider text-gold/80 hidden sm:block">
              {cat.tiles.length} tools
            </span>
          </div>
          <div className={cn(
            "grid gap-4",
            compact ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
          )}>
            {cat.tiles.map((tile) => (
              <TileCard key={tile.id} tile={tile} onSelect={onSelect} active={activeTab === tile.id} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}