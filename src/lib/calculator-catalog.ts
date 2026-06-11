import type { ComponentType } from "react";
import {
  Pill, ArrowLeftRight, Droplets, Activity, FlaskConical,
  Percent, Beaker, Link2, Syringe, Calendar,
  Ruler, Scale, ShieldAlert, TestTube, Baby,
} from "lucide-react";
import type { TabId } from "@/components/calculators/CalculatorPanel";

export type CalculatorTile = {
  id: TabId;
  label: string;
  icon: ComponentType<{ className?: string }>;
  desc: string;
  iconBg: string;
  color: string;
  badge?: string;
};

export type CalculatorCategory = {
  id: string;
  title: string;
  subtitle: string;
  tiles: CalculatorTile[];
};

export const CALCULATOR_CATEGORIES: CalculatorCategory[] = [
  {
    id: "body",
    title: "Body Metrics",
    subtitle: "BSA · IBW · BMI",
    tiles: [
      { id: "bsa", label: "BSA", icon: Ruler, desc: "Mosteller / Du Bois m²", color: "from-info/30 to-info/5", iconBg: "bg-info/20 text-info", badge: "NEW" },
      { id: "ibw", label: "IBW / AdjBW", icon: Scale, desc: "Devine formula + adjusted", color: "from-accent/30 to-accent/5", iconBg: "bg-accent/20 text-accent", badge: "NEW" },
      { id: "bmi", label: "BMI", icon: Activity, desc: "Body Mass Index + category", color: "from-destructive/30 to-destructive/5", iconBg: "bg-destructive/20 text-destructive" },
    ],
  },
  {
    id: "clinical",
    title: "Clinical Dosing",
    subtitle: "Renal, opioid safety, pediatrics & weight-based",
    tiles: [
      { id: "crcl", label: "CrCl (Enhanced)", icon: FlaskConical, desc: "Cockcroft–Gault · ABW/IBW/AdjBW", color: "from-accent/30 to-accent/5", iconBg: "bg-accent/20 text-accent", badge: "UPGRADED" },
      { id: "mme", label: "MME / OME", icon: ShieldAlert, desc: "Daily morphine equivalents", color: "from-destructive/30 to-destructive/5", iconBg: "bg-destructive/20 text-destructive", badge: "NEW" },
      { id: "ped", label: "Pediatric Dose", icon: Baby, desc: "mg/kg, BSA, Young's, Clark's", color: "from-warning/30 to-warning/5", iconBg: "bg-warning/30 text-warning-foreground", badge: "NEW" },
      { id: "dosage", label: "Dosage", icon: Pill, desc: "Weight-based dose volumes", color: "from-accent/30 to-accent/5", iconBg: "bg-accent/20 text-accent" },
      { id: "iv", label: "IV Drip Rate", icon: Droplets, desc: "gtt/min from volume + time", color: "from-info/30 to-info/5", iconBg: "bg-info/20 text-info" },
      { id: "inject", label: "Inject DS", icon: Syringe, desc: "Insulin / heparin supply", color: "from-destructive/30 to-destructive/5", iconBg: "bg-destructive/20 text-destructive" },
    ],
  },
  {
    id: "compound",
    title: "Compounding & Conversions",
    subtitle: "Reconstitution, dilution, alligation, unit conversions",
    tiles: [
      { id: "recon", label: "Reconstitution", icon: TestTube, desc: "Final concentration + diluent", color: "from-info/30 to-info/5", iconBg: "bg-info/20 text-info", badge: "NEW" },
      { id: "dilution", label: "Dilution", icon: Percent, desc: "C₁V₁ = C₂V₂", color: "from-warning/30 to-warning/5", iconBg: "bg-warning/30 text-warning-foreground" },
      { id: "alligation", label: "Alligation", icon: Beaker, desc: "Mixing strengths", color: "from-accent/30 to-accent/5", iconBg: "bg-accent/20 text-accent" },
      { id: "unit", label: "Unit Convert", icon: ArrowLeftRight, desc: "mg↔g, kg↔lbs, °F↔°C…", color: "from-info/30 to-info/5", iconBg: "bg-info/20 text-info" },
    ],
  },
  {
    id: "workflow",
    title: "Workflow",
    subtitle: "Days' supply & scheduling tools",
    tiles: [
      { id: "days", label: "Days' Supply", icon: Link2, desc: "Quantity ÷ daily dose · sig presets", color: "from-accent/30 to-accent/5", iconBg: "bg-accent/20 text-accent" },
      { id: "date", label: "Date Diff", icon: Calendar, desc: "Days between dates", color: "from-accent/30 to-accent/5", iconBg: "bg-accent/20 text-accent" },
    ],
  },
];

export const ALL_CALCULATOR_TILES = CALCULATOR_CATEGORIES.flatMap((c) => c.tiles);

export const QUICK_LAUNCH_IDS: TabId[] = ["crcl", "dosage", "mme", "bsa", "days", "iv"];

export const TAB_BY_LABEL: Record<string, TabId> = Object.fromEntries(
  ALL_CALCULATOR_TILES.map((t) => [t.label, t.id]),
) as Record<string, TabId>;