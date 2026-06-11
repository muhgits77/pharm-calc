/*
 * PharmaCalc Pro — shared UI primitives (src/components/calculators/shared.tsx)
 *
 * FINAL POLISH (June 2026):
 *
 * 1. ResultPanel — Premium scannable presentation:
 *    - Responsive big result (text-4xl sm:5xl md:52px) to avoid mobile overflow while remaining prominent.
 *    - "STEP-BY-STEP" header shortened + tightened tracking for dashboard cohesion; responsive step spacing + number badges.
 *    - Consistent px-4 sm:px-5 md:px-6 padding; softer gaps; disclaimer text scales down on mobile.
 *    - All action buttons: active:scale micro-interaction + consistent transition for tactile premium feel.
 *    - Patient context chip and warning block spacing refined.
 *
 * 2. LivePreview — Even more premium & scannable:
 *    - Softer border/accent, responsive primary value (text-2xl sm:text-3xl).
 *    - Warning pill now rounded-full, smaller text, better mobile placement.
 *    - Tighter responsive padding/gaps, no visual bulk on small screens.
 *
 * 3. Field — Improved consistency across all calculators:
 *    - Label mb tightened to 1 for better vertical rhythm.
 *    - Hints: smaller text-[10px], /70 opacity, mb-2, leading-snug, no negative margin hacks; Info icon aligned.
 *    - Errors: rounded-lg, text-[10px], py-1.5 for clearer presence without alarm.
 *    - All hints/errors now use consistent small text scale matching micro-labels in dashboard.
 *
 * 4. CalculateButton, CalcCard title, QuickReference — Small typography & button cohesion:
 *    - Added active:scale-[0.985] to main CTAs.
 *    - Title tracking refined to -0.25px.
 *    - QuickReference header UPPERCASE + tracking to match other section headers.
 *
 * 5. NumInput already provided excellent mobile (text-base on mobile prevents iOS zoom, h-11 touch target).
 *    Selects and native date inputs updated in caller to match (text-base md:text-sm).
 *
 * All calculations, Result shape, PDF export, history save, patient context auto-fill, and every existing behavior 100% untouched.
 */

import { type ReactNode } from "react";
import { AlertTriangle, Download, FileDown, Info, RotateCcw, Save, Sparkles } from "lucide-react";
import jsPDF from "jspdf";
import type { CalcResult } from "@/lib/calculators";
import { saveEntry } from "@/lib/history";
import { usePatient } from "@/lib/patient-context";
import { cn } from "@/lib/utils";

export function Field({
  label,
  unit,
  error,
  hint,
  children,
}: {
  label: string;
  unit?: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <div className="flex items-center justify-between mb-1 gap-2">
        <span className="text-xs font-semibold tracking-[0.3px] text-muted-foreground uppercase">{label}</span>
        {unit && (
          <span className="inline-flex items-center rounded-md bg-muted/70 px-1.5 py-px text-[10px] font-medium text-muted-foreground/90 tabular-nums">
            {unit}
          </span>
        )}
      </div>
      {hint && (
        <div className="flex items-start gap-1.5 text-[10px] text-muted-foreground/70 mb-2 leading-snug">
          <Info className="size-3 mt-[1px] shrink-0" />
          <span>{hint}</span>
        </div>
      )}
      {children}
      {error && (
        <div role="alert" className="mt-1.5 flex items-start gap-1.5 rounded-lg border border-destructive/30 bg-destructive/5 px-2.5 py-1.5 text-[10px] text-destructive">
          <AlertTriangle className="size-3.5 mt-0.5 shrink-0" />
          <span className="font-medium leading-snug">{error}</span>
        </div>
      )}
    </label>
  );
}

export function NumInput({
  value,
  onChange,
  placeholder,
  step = "any",
  min,
  max,
  positiveOnly,
  ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  step?: string;
  min?: number;
  max?: number;
  positiveOnly?: boolean;
  ariaLabel?: string;
}) {
  const handle = (v: string) => {
    if (positiveOnly && v.startsWith("-")) return;
    onChange(v);
  };
  return (
    <input
      type="number"
      step={step}
      min={positiveOnly ? 0 : min}
      max={max}
      inputMode="decimal"
      aria-label={ariaLabel ?? placeholder}
      value={value}
      placeholder={placeholder}
      onChange={(e) => handle(e.target.value)}
      className="w-full h-11 md:h-10 px-3.5 rounded-xl bg-input border border-border text-base md:text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring/60 transition shadow-sm"
    />
  );
}

export function CalcCard({
  title,
  icon: Icon,
  accent = "primary",
  onReset,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  accent?: "primary" | "accent" | "info" | "warning" | "destructive";
  onReset?: () => void;
  children: ReactNode;
}) {
  const accentBg = {
    primary: "bg-primary/15 text-primary ring-1 ring-inset ring-primary/20",
    accent: "bg-accent/15 text-accent ring-1 ring-inset ring-accent/20",
    info: "bg-info/15 text-info ring-1 ring-inset ring-info/20",
    warning: "bg-warning/15 text-warning-foreground ring-1 ring-inset ring-warning/20",
    destructive: "bg-destructive/15 text-destructive ring-1 ring-inset ring-destructive/20",
  }[accent];
  return (
    <div className="rounded-3xl border border-border/60 bg-card shadow-card overflow-hidden">
      <div className="flex items-center justify-between px-5 md:px-6 pt-5 pb-4 border-b border-border/60 bg-muted/30">
        <div className="flex items-center gap-3">
          <div className={cn("size-10 rounded-2xl grid place-items-center shadow-inner", accentBg)}>
            <Icon className="size-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-[-0.25px] text-foreground">{title}</h2>
          </div>
        </div>
        {onReset && (
          <button
            onClick={onReset}
            aria-label="Reset calculator"
            className="size-9 rounded-xl border border-border/70 hover:bg-background text-muted-foreground hover:text-foreground transition grid place-items-center active:scale-[0.985]"
          >
            <RotateCcw className="size-4" />
          </button>
        )}
      </div>
      <div className="p-5 md:p-6 space-y-5">
        {children}
      </div>
    </div>
  );
}

export function LivePreview({ result }: { result: CalcResult | null }) {
  if (!result || result.primary === "—") return null;
  return (
    <div
      aria-live="polite"
      className="rounded-2xl border border-accent/30 bg-gradient-to-br from-accent/8 via-accent/5 to-success/5 px-3.5 sm:px-4 py-3 sm:py-3.5 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 shadow-card ring-1 ring-inset ring-accent/10 transition-shadow duration-300"
    >
      <div className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 text-accent px-2 py-0.5 text-[10px] font-semibold tracking-[0.5px]">
        <Sparkles className="size-3" /> LIVE
      </div>
      <div className="flex items-baseline gap-1.5 min-w-0">
        <span className="text-2xl sm:text-3xl font-semibold tracking-[-0.3px] text-foreground tabular-nums">{result.primary}</span>
        {result.unit && <span className="text-sm text-muted-foreground font-medium">{result.unit}</span>}
      </div>
      {result.warning && (
        <div className="ml-auto flex items-center gap-1 text-[10px] font-medium text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">
          <AlertTriangle className="size-3" /> {result.warning}
        </div>
      )}
    </div>
  );
}

export function CalculateButton({
  onClick,
  disabled,
  label,
}: {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full h-11 mt-1 rounded-2xl bg-gradient-to-r from-accent to-success text-accent-foreground font-semibold tracking-[-0.1px] shadow-sm hover:shadow active:brightness-95 active:scale-[0.985] disabled:opacity-60 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 text-sm"
    >
      <span className="inline-block size-3.5 rounded-sm bg-accent-foreground/25" />
      {label ?? "Calculate"}
    </button>
  );
}

export function ResultPanel({
  result,
  calculator,
  inputs,
}: {
  result: CalcResult;
  calculator: string;
  inputs: Record<string, string | number | boolean>;
}) {
  const { patient, hasPatient } = usePatient();

  const patientLine = hasPatient
    ? [
        patient.name && `Pt: ${patient.name}`,
        patient.age && `${patient.age}y`,
        patient.sex && patient.sex,
        patient.weightKg && `${patient.weightKg} kg`,
        patient.heightCm && `${patient.heightCm} cm`,
      ]
        .filter(Boolean)
        .join(" • ")
    : "";

  const handleSave = () => {
    saveEntry({
      calculator,
      inputs,
      result: result.primary,
      unit: result.unit,
    });
  };
  const handleExport = () => {
    const txt =
      `PharmaCalc Pro — ${calculator}\n` +
      `Date: ${new Date().toLocaleString()}\n` +
      (patientLine ? `Patient: ${patientLine}\n` : "") +
      `\nInputs:\n${Object.entries(inputs)
        .map(([k, v]) => `  ${k}: ${v}`)
        .join("\n")}\n\n` +
      `Result: ${result.primary} ${result.unit ?? ""}\n\n` +
      `Steps:\n${result.steps.map((s) => `  • ${s.label}: ${s.value}`).join("\n")}\n` +
      (result.warning ? `\n⚠ Warning: ${result.warning}\n` : "") +
      (result.note ? `\nNote: ${result.note}\n` : "") +
      `\n⚠ For reference only — always verify clinically with a licensed pharmacist before patient use.\n`;
    const blob = new Blob([txt], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${calculator.replace(/\s+/g, "-")}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const handlePDF = () => {
    const doc = new jsPDF({ unit: "pt", format: "letter" });
    const M = 48;
    let y = M;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("PharmaCalc Pro", M, y); y += 22;
    doc.setFontSize(14);
    doc.text(calculator, M, y); y += 18;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(110);
    doc.text(new Date().toLocaleString(), M, y); y += 14;
    if (patientLine) {
      doc.text(patientLine, M, y); y += 14;
    }
    y += 6;
    doc.setTextColor(20);

    doc.setFont("helvetica", "bold"); doc.setFontSize(11);
    doc.text("Inputs", M, y); y += 14;
    doc.setFont("helvetica", "normal"); doc.setFontSize(10);
    Object.entries(inputs).forEach(([k, v]) => {
      doc.text(`• ${k}: ${String(v)}`, M + 8, y); y += 13;
    });
    y += 8;

    doc.setFont("helvetica", "bold"); doc.setFontSize(11);
    doc.text("Result", M, y); y += 16;
    doc.setFontSize(20);
    doc.text(`${result.primary} ${result.unit ?? ""}`, M, y); y += 22;

    if (result.warning) {
      doc.setFontSize(10); doc.setTextColor(180, 40, 40);
      const lines = doc.splitTextToSize(`! ${result.warning}`, 515);
      doc.text(lines, M, y); y += lines.length * 12 + 6;
      doc.setTextColor(20);
    }

    if (result.steps.length) {
      doc.setFont("helvetica", "bold"); doc.setFontSize(11);
      doc.text("Step-by-step", M, y); y += 14;
      doc.setFont("helvetica", "normal"); doc.setFontSize(10);
      result.steps.forEach((s, i) => {
        const lines = doc.splitTextToSize(`${i + 1}. ${s.label}: ${s.value}`, 515);
        if (y + lines.length * 13 > 740) { doc.addPage(); y = M; }
        doc.text(lines, M, y);
        y += lines.length * 13 + 2;
      });
    }
    if (result.note) {
      y += 6;
      doc.setFont("helvetica", "italic"); doc.setFontSize(9); doc.setTextColor(90);
      const lines = doc.splitTextToSize(`Note: ${result.note}`, 515);
      doc.text(lines, M, y); y += lines.length * 11 + 8;
    }
    doc.setFont("helvetica", "italic"); doc.setFontSize(9); doc.setTextColor(140);
    const disc = doc.splitTextToSize(
      "For reference only — always verify clinically with a licensed pharmacist before patient use. PharmaCalc Pro is not a substitute for professional clinical judgment.",
      515,
    );
    if (y + disc.length * 11 > 760) { doc.addPage(); y = M; }
    doc.text(disc, M, y);
    doc.save(`${calculator.replace(/\s+/g, "-")}-${Date.now()}.pdf`);
  };

  return (
    <div className="mt-4 rounded-3xl border border-border/60 bg-card overflow-hidden shadow-card animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Prominent result header */}
      <div className="p-4 sm:p-5 md:p-6 bg-gradient-to-br from-primary/8 via-background to-accent/5">
        <div className="flex items-center gap-2 text-[10px] font-semibold tracking-[1px] text-primary/80 mb-1">
          <div className="h-px w-4 bg-primary/40" /> FINAL RESULT
        </div>
        <div className="flex items-baseline gap-x-2 gap-y-1 flex-wrap">
          <div className="text-4xl sm:text-5xl md:text-[52px] font-semibold tracking-[-1px] sm:tracking-[-1.2px] text-foreground tabular-nums leading-none">
            {result.primary}
          </div>
          {result.unit && (
            <div className="text-base sm:text-lg text-muted-foreground font-medium tracking-tight">{result.unit}</div>
          )}
        </div>
        {patientLine && (
          <div className="mt-2 inline-flex items-center rounded-full bg-muted/60 px-2.5 py-0.5 text-xs text-muted-foreground">
            {patientLine}
          </div>
        )}
        {result.warning && (
          <div className="mt-3 flex items-start gap-2 rounded-2xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <AlertTriangle className="size-4 mt-0.5 shrink-0" />
            <span className="font-medium leading-snug">{result.warning}</span>
          </div>
        )}
      </div>

      {/* Step-by-step — elegant numbered layout */}
      {result.steps.length > 0 && (
        <div className="px-4 sm:px-5 md:px-6 py-4 border-t border-border/70 bg-card">
          <div className="text-[10px] font-semibold uppercase tracking-[1px] text-muted-foreground mb-2.5 flex items-center gap-2">
            <span>STEP-BY-STEP</span>
            <span className="flex-1 h-px bg-border/70" />
          </div>
          <ol className="space-y-2.5 sm:space-y-3">
            {result.steps.map((s, i) => (
              <li key={i} className="flex gap-3 text-sm group">
                <span className="mt-0.5 shrink-0 size-5 sm:size-6 rounded-lg sm:rounded-xl bg-primary/10 text-primary grid place-items-center text-[10px] sm:text-xs font-bold ring-1 ring-inset ring-primary/15">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1 pt-0.5">
                  <div className="font-medium text-foreground tracking-tight">{s.label}</div>
                  <div className="text-muted-foreground/90 font-mono text-[12px] sm:text-[13px] mt-0.5 leading-snug break-words">{s.value}</div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Clinical note (improved) */}
      {result.note && (
        <div className="px-4 sm:px-5 md:px-6 py-2.5 border-t border-border/70 bg-muted/30 text-xs text-muted-foreground flex gap-2">
          <Info className="size-3.5 mt-0.5 shrink-0 text-muted-foreground/70" />
          <span className="leading-snug">{result.note}</span>
        </div>
      )}

      {/* Strong clinical disclaimer — consistent across all calculators */}
      <div className="px-4 sm:px-5 md:px-6 py-3 border-t border-warning/20 bg-gradient-to-r from-warning/10 to-warning/5 text-[10px] sm:text-[11px] text-warning-foreground flex gap-2.5">
        <AlertTriangle className="size-4 mt-px shrink-0 text-warning" />
        <div>
          <div className="font-semibold uppercase tracking-wide text-[9px] sm:text-[10px] mb-0.5 opacity-80">Clinical Disclaimer</div>
          <span className="leading-relaxed">For reference and educational use only. Always verify with a licensed pharmacist and current clinical guidelines before patient use. Not a substitute for professional judgment.</span>
        </div>
      </div>

      {/* Actions — clean premium buttons (cohesive with dashboard) */}
      <div className="px-4 sm:px-5 md:px-6 py-3 border-t border-border/70 bg-card flex flex-wrap gap-2">
        <button
          onClick={handleSave}
          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:brightness-105 active:brightness-95 active:scale-[0.985] transition shadow-sm"
        >
          <Save className="size-3.5" /> Save to History
        </button>
        <button
          onClick={handlePDF}
          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-accent text-accent-foreground text-sm font-medium hover:brightness-105 active:brightness-95 active:scale-[0.985] transition"
        >
          <FileDown className="size-3.5" /> Export PDF
        </button>
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl border border-border text-sm font-medium hover:bg-secondary active:bg-muted transition ml-auto active:scale-[0.985]"
        >
          <Download className="size-3.5" /> TXT
        </button>
      </div>
    </div>
  );
}

export function QuickReference() {
  const items = [
    "1 tsp = 5 mL",
    "1 tbsp = 15 mL",
    "1 oz = 30 mL",
    "1 cup = 240 mL",
    "1 kg = 2.2 lbs",
    "1 gr = 65 mg",
    "1 L = 1000 mL",
    "1 g = 1000 mg",
  ];
  return (
    <div className="mt-6 rounded-2xl border border-border/70 bg-card/50 p-4 md:p-5">
      <div className="text-[10px] font-semibold uppercase tracking-[1px] text-muted-foreground mb-2">
        QUICK REFERENCE
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-1 text-xs text-muted-foreground">
        {items.map((i) => (
          <div key={i} className="tabular-nums">{i}</div>
        ))}
      </div>
    </div>
  );
}
