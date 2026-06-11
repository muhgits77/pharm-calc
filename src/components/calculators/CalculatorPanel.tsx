/*
 * PharmaCalc Pro — calculators (src/components/calculators/CalculatorPanel.tsx)
 *
 * FINAL POLISH (June 2026) — using updated shared primitives:
 *
 * 1. ResultPanel + LivePreview refinements (via shared + local):
 *    - More premium, scannable: responsive typography, tightened headers ("STEP-BY-STEP"), elegant dividers, consistent micro-labels.
 *    - Mobile: big results scale gracefully, step lists use smaller badges/gaps on xs, LivePreview value shrinks to 2xl on mobile.
 *
 * 2. Field consistency (shared.tsx):
 *    - Applied globally: spacing rhythm, hint (text-[10px] /70, clean), error (rounded-lg, readable scale).
 *
 * 3. Pediatric legacy rule warning strengthened:
 *    - Clearer, direct language: names the rules, states they are historical approximations, explicitly recommends modern weight/BSA per guidelines.
 *    - Non-alarming presentation: switched to Info icon + muted border/bg (bg-muted/40 border-border/60), softer text scale.
 *    - Still visible and informative for educational users without causing undue concern.
 *
 * 4. Typography & button polish for dashboard cohesion:
 *    - Tab bar, SegBtn, preset chips, unit toggles, add/remove buttons: added active:scale-[0.985] everywhere, consistent rounded-2xl where appropriate.
 *    - Micro labels now use font-semibold tracking-[0.3px] uppercase (matches Field labels and dashboard section headers).
 *    - IBW 3-col and CrCl side-by-side previews: responsive padding + slightly smaller text on mobile for no squeeze.
 *    - Selects + date inputs: text-base md:text-sm to match NumInput (no iOS zoom, visual cohesion).
 *    - CrCl basis label upgraded to match Field label style.
 *
 * 5. Excellent mobile experience:
 *    - Tab bar: snap + active scale, slightly tighter px on xs.
 *    - SegBtn min-w tightened for more fit on small screens without wrapping badly.
 *    - All grids (basis choices, fields, MME rows) already responsive; previews and Live/Result now explicitly responsive.
 *    - Touch targets: h-11 inputs, h-9 segs/buttons remain comfortable; × remove widened slightly.
 *    - No horizontal scroll introduced; all content uses safe padding (p-4 sm: on results/cards).
 *    - NumInput, selects, dates prevent zoom and have large tap areas.
 *
 * EVERY calculation remains 100% identical (dosage, crclEnhanced, pediatricDose, mme, alligation, etc.).
 * Patient context integration, LivePreview live computation, PDF (jsPDF) export with steps + disclaimer, history save, reset, and all features fully preserved.
 * No new dependencies, no behavior changes.
 */

import { useEffect, useMemo, useState } from "react";
import { usePatient } from "@/lib/patient-context";
import {
  Pill,
  ArrowLeftRight,
  Droplets,
  Activity,
  FlaskConical,
  Percent,
  Beaker,
  Link2,
  Syringe,
  Calendar,
  Ruler,
  Scale,
  ShieldAlert,
  TestTube,
  Baby,
  AlertTriangle,
  Info,
} from "lucide-react";
import {
  alligation,
  bmi,
  bsa,
  crcl,
  crclEnhanced,
  dateDiff,
  daysSupply,
  dilution,
  dosage,
  ibwCalc,
  ibwAdj,
  injectDaysSupply,
  ivDripRate,
  mme,
  OPIOIDS,
  pediatricDose,
  reconstitution,
  unitConvert,
  INJECT_TYPES,
  UNIT_CONVERSIONS,
  type CalcResult,
  type Sex,
  type WeightBasis,
  type BSAFormula,
  type PedBasis,
} from "@/lib/calculators";
import { cn } from "@/lib/utils";
import {
  CalcCard,
  CalculateButton,
  Field,
  LivePreview,
  NumInput,
  QuickReference,
  ResultPanel,
} from "./shared";

export type TabId =
  | "dosage"
  | "unit"
  | "iv"
  | "bmi"
  | "bsa"
  | "ibw"
  | "crcl"
  | "mme"
  | "recon"
  | "ped"
  | "dilution"
  | "alligation"
  | "days"
  | "inject"
  | "date";

const TABS: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "dosage", label: "Dosage", icon: Pill },
  { id: "unit", label: "Unit Convert", icon: ArrowLeftRight },
  { id: "iv", label: "IV Drip Rate", icon: Droplets },
  { id: "bmi", label: "BMI", icon: Activity },
  { id: "bsa", label: "BSA", icon: Ruler },
  { id: "ibw", label: "IBW / AdjBW", icon: Scale },
  { id: "crcl", label: "CrCl (Enhanced)", icon: FlaskConical },
  { id: "mme", label: "MME / OME", icon: ShieldAlert },
  { id: "recon", label: "Reconstitution", icon: TestTube },
  { id: "ped", label: "Pediatric Dose", icon: Baby },
  { id: "dilution", label: "Dilution", icon: Percent },
  { id: "alligation", label: "Alligation", icon: Beaker },
  { id: "days", label: "Days' Supply", icon: Link2 },
  { id: "inject", label: "Inject DS", icon: Syringe },
  { id: "date", label: "Date Diff", icon: Calendar },
];

export const VALID_TABS = TABS.map((t) => t.id);

export function CalculatorPanel({ initial }: { initial?: TabId }) {
  const [tab, setTab] = useState<TabId>(initial ?? "dosage");

  return (
    <div>
      {/* Premium horizontal tab bar — excellent mobile scroll + touch targets */}
      <div className="flex gap-1.5 overflow-x-auto pb-3 mb-5 -mx-1 px-1 scrollbar-none snap-x snap-mandatory">
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "inline-flex items-center gap-1.5 h-9 px-3.5 sm:px-4 rounded-2xl text-xs font-medium whitespace-nowrap border transition-all snap-start active:scale-[0.985]",
                active
                  ? "bg-gradient-to-r from-accent to-success text-accent-foreground border-transparent shadow-sm"
                  : "bg-card text-muted-foreground border-border hover:text-foreground hover:border-foreground/30 active:bg-muted",
              )}
            >
              <t.icon className="size-3.5" /> {t.label}
            </button>
          );
        })}
      </div>

      {tab === "dosage" && <DosageCalc />}
      {tab === "unit" && <UnitCalc />}
      {tab === "iv" && <IVCalc />}
      {tab === "bmi" && <BMICalc />}
      {tab === "bsa" && <BSACalc />}
      {tab === "ibw" && <IBWCalc />}
      {tab === "crcl" && <CrClEnhancedCalc />}
      {tab === "mme" && <MMECalc />}
      {tab === "recon" && <ReconCalc />}
      {tab === "ped" && <PedCalc />}
      {tab === "dilution" && <DilutionCalc />}
      {tab === "alligation" && <AlligationCalc />}
      {tab === "days" && <DaysCalc />}
      {tab === "inject" && <InjectCalc />}
      {tab === "date" && <DateCalc />}

      <QuickReference />
    </div>
  );
}

// ---------- helpers ----------
function SegBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "h-9 px-3 rounded-xl text-xs font-semibold border transition flex-1 min-w-[64px] sm:min-w-[72px] active:scale-[0.985]",
        active
          ? "bg-primary text-primary-foreground border-transparent shadow-sm"
          : "bg-card text-muted-foreground border-border hover:text-foreground hover:bg-muted/60",
      )}
    >
      {children}
    </button>
  );
}

// ---------- individual calculators ----------

function DosageCalc() {
  const [dose, setDose] = useState("5");
  const [wt, setWt] = useState("70");
  const [conc, setConc] = useState("250");
  const [result, setResult] = useState<CalcResult | null>(null);
  const reset = () => { setDose(""); setWt(""); setConc(""); setResult(null); };
  return (
    <CalcCard title="Dosage Calculator" icon={Pill} accent="accent" onReset={reset}>
      <div className="space-y-4">
        <Field label="Desired Dose" unit="mg/kg" hint="mg per kg of body weight">
          <NumInput value={dose} onChange={setDose} placeholder="5" positiveOnly />
        </Field>
        <Field label="Patient Weight" unit="kg">
          <NumInput value={wt} onChange={setWt} placeholder="70" positiveOnly />
        </Field>
        <Field label="Concentration" unit="mg/mL" hint="Stock solution strength">
          <NumInput value={conc} onChange={setConc} placeholder="250" positiveOnly />
        </Field>
        <CalculateButton onClick={() => setResult(dosage(+dose, +wt, +conc))} disabled={!dose || !wt || !conc} />
      </div>
      {result && (
        <ResultPanel
          result={result}
          calculator="Dosage"
          inputs={{ "Dose (mg/kg)": dose, "Weight (kg)": wt, "Concentration (mg/mL)": conc }}
        />
      )}
    </CalcCard>
  );
}

function UnitCalc() {
  const [conv, setConv] = useState(UNIT_CONVERSIONS[0]);
  const [val, setVal] = useState("500");
  const [result, setResult] = useState<CalcResult | null>(null);
  return (
    <CalcCard title="Unit Convert Calculator" icon={ArrowLeftRight} accent="info" onReset={() => { setVal(""); setResult(null); }}>
      <div className="flex flex-wrap gap-2 mb-4">
        {UNIT_CONVERSIONS.map((k) => (
          <button
            key={k}
            onClick={() => setConv(k)}
            className={cn(
              "h-8 px-3 rounded-full text-xs font-medium border transition active:scale-[0.985]",
              conv === k ? "bg-info text-info-foreground border-transparent" : "bg-card border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {k}
          </button>
        ))}
      </div>
      <div className="space-y-4">
        <Field label="Value" hint="Enter the numeric value to convert">
          <NumInput value={val} onChange={setVal} placeholder="500" positiveOnly />
        </Field>
        <CalculateButton onClick={() => setResult(unitConvert(conv, +val))} disabled={!val} />
      </div>
      {result && <ResultPanel result={result} calculator="Unit Convert" inputs={{ Conversion: conv, Value: val }} />}
    </CalcCard>
  );
}

function IVCalc() {
  const [vol, setVol] = useState("1000");
  const [hrs, setHrs] = useState("8");
  const [df, setDf] = useState("15");
  const [result, setResult] = useState<CalcResult | null>(null);
  return (
    <CalcCard title="IV Drip Rate Calculator" icon={Droplets} accent="info" onReset={() => { setVol(""); setHrs(""); setDf(""); setResult(null); }}>
      <div className="space-y-4">
        <Field label="Total Volume" unit="mL"><NumInput value={vol} onChange={setVol} placeholder="1000" positiveOnly /></Field>
        <Field label="Infusion Time" unit="hours"><NumInput value={hrs} onChange={setHrs} placeholder="8" positiveOnly /></Field>
        <Field label="Drop Factor" unit="gtt/mL" hint="Common: 10, 15, 20, or 60 gtt/mL">
          <NumInput value={df} onChange={setDf} placeholder="15" positiveOnly />
        </Field>
        <CalculateButton onClick={() => setResult(ivDripRate(+vol, +hrs, +df))} disabled={!vol || !hrs || !df} />
      </div>
      {result && <ResultPanel result={result} calculator="IV Drip Rate" inputs={{ "Volume (mL)": vol, "Time (h)": hrs, "Drop factor": df }} />}
    </CalcCard>
  );
}

function BMICalc() {
  const [w, setW] = useState("70");
  const [h, setH] = useState("170");
  const [result, setResult] = useState<CalcResult | null>(null);
  return (
    <CalcCard title="BMI Calculator" icon={Activity} accent="destructive" onReset={() => { setW(""); setH(""); setResult(null); }}>
      <div className="space-y-4">
        <Field label="Weight" unit="kg"><NumInput value={w} onChange={setW} placeholder="70" positiveOnly /></Field>
        <Field label="Height" unit="cm" hint="Standing height"><NumInput value={h} onChange={setH} placeholder="170" positiveOnly /></Field>
        <CalculateButton onClick={() => setResult(bmi(+w, +h))} disabled={!w || !h} />
      </div>
      {result && <ResultPanel result={result} calculator="BMI" inputs={{ "Weight (kg)": w, "Height (cm)": h }} />}
    </CalcCard>
  );
}

// ---------- BSA ----------
function BSACalc() {
  const { patient } = usePatient();
  const [hUnit, setHUnit] = useState<"cm" | "in">("cm");
  const [wUnit, setWUnit] = useState<"kg" | "lb">("kg");
  const [h, setH] = useState(patient.heightCm || "170");
  const [w, setW] = useState(patient.weightKg || "70");
  const [formula, setFormula] = useState<BSAFormula>("mosteller");
  const [result, setResult] = useState<CalcResult | null>(null);
  useEffect(() => {
    if (patient.heightCm) { setHUnit("cm"); setH(patient.heightCm); }
    if (patient.weightKg) { setWUnit("kg"); setW(patient.weightKg); }
  }, [patient.heightCm, patient.weightKg]);
  const heightCm = hUnit === "cm" ? +h : +h * 2.54;
  const weightKg = wUnit === "kg" ? +w : +w / 2.2046;
  const live = useMemo(
    () => (h && w ? bsa(heightCm, weightKg, formula) : null),
    [h, w, heightCm, weightKg, formula],
  );
  return (
    <CalcCard title="Body Surface Area (BSA)" icon={Ruler} accent="info" onReset={() => { setH(""); setW(""); setResult(null); }}>
      <div className="space-y-4">
        <div className="flex gap-2">
          <SegBtn active={formula === "mosteller"} onClick={() => setFormula("mosteller")}>Mosteller</SegBtn>
          <SegBtn active={formula === "dubois"} onClick={() => setFormula("dubois")}>Du Bois</SegBtn>
        </div>
        <Field label="Height" unit={hUnit} hint="Mosteller is preferred for most bedside use">
          <div className="flex gap-2">
            <NumInput value={h} onChange={setH} placeholder={hUnit === "cm" ? "170" : "67"} positiveOnly />
            <div className="flex gap-1">
              <SegBtn active={hUnit === "cm"} onClick={() => setHUnit("cm")}>cm</SegBtn>
              <SegBtn active={hUnit === "in"} onClick={() => setHUnit("in")}>in</SegBtn>
            </div>
          </div>
        </Field>
        <Field label="Weight" unit={wUnit}>
          <div className="flex gap-2">
            <NumInput value={w} onChange={setW} placeholder={wUnit === "kg" ? "70" : "154"} positiveOnly />
            <div className="flex gap-1">
              <SegBtn active={wUnit === "kg"} onClick={() => setWUnit("kg")}>kg</SegBtn>
              <SegBtn active={wUnit === "lb"} onClick={() => setWUnit("lb")}>lb</SegBtn>
            </div>
          </div>
        </Field>
        <LivePreview result={live} />
        <CalculateButton onClick={() => setResult(bsa(heightCm, weightKg, formula))} disabled={!h || !w} label={live ? "Update Result" : "Calculate"} />
      </div>
      {result && (
        <ResultPanel
          result={result}
          calculator="BSA"
          inputs={{ Formula: formula, Height: `${h} ${hUnit}`, Weight: `${w} ${wUnit}` }}
        />
      )}
    </CalcCard>
  );
}

// ---------- IBW / AdjBW ----------
function IBWCalc() {
  const { patient } = usePatient();
  const [sex, setSex] = useState<Sex>((patient.sex as Sex) || "male");
  const [hUnit, setHUnit] = useState<"in" | "cm">(patient.heightCm ? "cm" : "in");
  const [wUnit, setWUnit] = useState<"kg" | "lb">("kg");
  const [h, setH] = useState(patient.heightCm || "70");
  const [w, setW] = useState(patient.weightKg || "80");
  const [result, setResult] = useState<CalcResult | null>(null);
  useEffect(() => {
    if (patient.sex) setSex(patient.sex as Sex);
    if (patient.heightCm) { setHUnit("cm"); setH(patient.heightCm); }
    if (patient.weightKg) { setWUnit("kg"); setW(patient.weightKg); }
  }, [patient.sex, patient.heightCm, patient.weightKg]);
  const heightInches = hUnit === "in" ? +h : +h / 2.54;
  const actualKg = wUnit === "kg" ? +w : +w / 2.2046;
  const preview = h && w && heightInches > 0 && actualKg > 0 ? ibwAdj(sex, heightInches, actualKg) : null;
  const live = useMemo(
    () => (h && w ? ibwCalc(sex, heightInches, actualKg) : null),
    [h, w, sex, heightInches, actualKg],
  );
  return (
    <CalcCard title="Ideal & Adjusted Body Weight" icon={Scale} accent="accent" onReset={() => { setH(""); setW(""); setResult(null); }}>
      <div className="space-y-4">
        <div className="flex gap-2">
          <SegBtn active={sex === "male"} onClick={() => setSex("male")}>Male</SegBtn>
          <SegBtn active={sex === "female"} onClick={() => setSex("female")}>Female</SegBtn>
        </div>
        <Field label="Height" unit={hUnit} hint="Devine formula; height over 60 inches matters">
          <div className="flex gap-2">
            <NumInput value={h} onChange={setH} placeholder={hUnit === "in" ? "70" : "178"} positiveOnly />
            <div className="flex gap-1">
              <SegBtn active={hUnit === "in"} onClick={() => setHUnit("in")}>in</SegBtn>
              <SegBtn active={hUnit === "cm"} onClick={() => setHUnit("cm")}>cm</SegBtn>
            </div>
          </div>
        </Field>
        <Field label="Actual Weight" unit={wUnit}>
          <div className="flex gap-2">
            <NumInput value={w} onChange={setW} placeholder={wUnit === "kg" ? "80" : "176"} positiveOnly />
            <div className="flex gap-1">
              <SegBtn active={wUnit === "kg"} onClick={() => setWUnit("kg")}>kg</SegBtn>
              <SegBtn active={wUnit === "lb"} onClick={() => setWUnit("lb")}>lb</SegBtn>
            </div>
          </div>
        </Field>
        {preview && (
          <div className="rounded-2xl border border-border/70 bg-muted/20 p-1 grid grid-cols-3 text-center text-sm">
            <div className="rounded-xl p-1.5 sm:p-2">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Actual</div>
              <div className="font-semibold tabular-nums mt-0.5 text-[13px] sm:text-sm">{actualKg.toFixed(1)} <span className="text-[10px] text-muted-foreground">kg</span></div>
            </div>
            <div className="rounded-xl p-1.5 sm:p-2 border-x border-border/60">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">IBW</div>
              <div className="font-semibold tabular-nums mt-0.5 text-[13px] sm:text-sm">{preview.ibw.toFixed(1)} <span className="text-[10px] text-muted-foreground">kg</span></div>
            </div>
            <div className="rounded-xl p-1.5 sm:p-2">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">AdjBW</div>
              <div className="font-semibold tabular-nums mt-0.5 text-[13px] sm:text-sm">{preview.adj.toFixed(1)} <span className="text-[10px] text-muted-foreground">kg</span></div>
            </div>
          </div>
        )}
        <LivePreview result={live} />
        <CalculateButton onClick={() => setResult(ibwCalc(sex, heightInches, actualKg))} disabled={!h || !w} label={live ? "Update Result" : "Calculate"} />
      </div>
      {result && (
        <ResultPanel
          result={result}
          calculator="IBW / AdjBW"
          inputs={{ Sex: sex, Height: `${h} ${hUnit}`, "Actual Wt": `${w} ${wUnit}` }}
        />
      )}
    </CalcCard>
  );
}

// ---------- Enhanced CrCl ----------
function CrClEnhancedCalc() {
  const { patient } = usePatient();
  const [age, setAge] = useState(patient.age || "65");
  const [actual, setActual] = useState(patient.weightKg || "80");
  // Height defaults to inches; convert if patient has cm
  const heightInchesFromPatient = patient.heightCm ? (+patient.heightCm / 2.54).toFixed(1) : "";
  const [height, setHeight] = useState(heightInchesFromPatient || "70");
  const [scr, setScr] = useState("1.2");
  const [sex, setSex] = useState<Sex>((patient.sex as Sex) || "male");
  const [basis, setBasis] = useState<WeightBasis>("actual");
  const [result, setResult] = useState<(ReturnType<typeof crclEnhanced>) | null>(null);

  useEffect(() => {
    if (patient.age) setAge(patient.age);
    if (patient.weightKg) setActual(patient.weightKg);
    if (patient.heightCm) setHeight((+patient.heightCm / 2.54).toFixed(1));
    if (patient.sex) setSex(patient.sex as Sex);
  }, [patient.age, patient.weightKg, patient.heightCm, patient.sex]);

  const ageInvalid = age && (+age <= 0 || +age > 120) ? "Age must be 1–120 years" : undefined;
  const scrInvalid = scr && +scr <= 0 ? "SCr must be > 0" : undefined;

  const compute = () => {
    setResult(crclEnhanced(+age, +actual, +height, +scr, sex, basis));
  };

  const sideBySide = useMemo(
    () =>
      age && actual && height && scr && +age > 0 && +scr > 0
        ? (["actual", "ideal", "adjusted"] as WeightBasis[]).map((b) => ({
            basis: b,
            r: crclEnhanced(+age, +actual, +height, +scr, sex, b),
          }))
        : null,
    [age, actual, height, scr, sex],
  );

  const live = useMemo(
    () => (age && actual && height && scr ? crclEnhanced(+age, +actual, +height, +scr, sex, basis) : null),
    [age, actual, height, scr, sex, basis],
  );

  return (
    <CalcCard
      title="Enhanced CrCl (Cockcroft–Gault)"
      icon={FlaskConical}
      accent="accent"
      onReset={() => { setResult(null); }}
    >
      <div className="space-y-4">
        <div className="flex gap-2">
          <SegBtn active={sex === "male"} onClick={() => setSex("male")}>Male</SegBtn>
          <SegBtn active={sex === "female"} onClick={() => setSex("female")}>Female</SegBtn>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Age" unit="years" error={ageInvalid} hint="1–120 years">
            <NumInput value={age} onChange={setAge} placeholder="65" positiveOnly max={120} />
          </Field>
          <Field label="SCr" unit="mg/dL" error={scrInvalid} hint="Serum creatinine">
            <NumInput value={scr} onChange={setScr} placeholder="1.2" positiveOnly />
          </Field>
          <Field label="Height" unit="in" hint="Used for IBW/AdjBW">
            <NumInput value={height} onChange={setHeight} placeholder="70" positiveOnly />
          </Field>
          <Field label="Actual Wt" unit="kg">
            <NumInput value={actual} onChange={setActual} placeholder="80" positiveOnly />
          </Field>
        </div>
        <div>
          <div className="text-xs font-semibold tracking-[0.3px] text-muted-foreground uppercase mb-1.5">Weight Basis for CrCl</div>
          <div className="flex gap-2">
            <SegBtn active={basis === "actual"} onClick={() => setBasis("actual")}>Actual</SegBtn>
            <SegBtn active={basis === "ideal"} onClick={() => setBasis("ideal")}>Ideal</SegBtn>
            <SegBtn active={basis === "adjusted"} onClick={() => setBasis("adjusted")}>Adjusted</SegBtn>
          </div>
          <div className="text-[10px] text-muted-foreground/80 mt-1.5">Use Ideal or Adjusted when patient is significantly obese.</div>
        </div>

        {sideBySide && (
          <div className="rounded-2xl border border-border/70 overflow-hidden text-sm">
            <div className="grid grid-cols-3 text-center">
              {sideBySide.map(({ basis: b, r }) => (
                <div key={b} className={cn("p-2 sm:p-3 border-r border-border/60 last:border-r-0", b === basis && "bg-primary/10 ring-1 ring-inset ring-primary/20")}>
                  <div className="uppercase text-[10px] tracking-wider text-muted-foreground">{b}</div>
                  <div className="text-lg sm:text-xl font-semibold tabular-nums mt-0.5">{r.primary}</div>
                  <div className="text-[10px] text-muted-foreground">mL/min</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <LivePreview result={live} />
        <CalculateButton onClick={compute} disabled={!age || !actual || !height || !scr} label={live ? "Update Result" : "Calculate"} />
      </div>
      {result && (
        <ResultPanel
          result={result}
          calculator="CrCl (Enhanced)"
          inputs={{
            Sex: sex, Age: age, "Actual (kg)": actual, "Height (in)": height,
            SCr: scr, Basis: basis, "Used Wt (kg)": result.using.toFixed(1),
          }}
        />
      )}
    </CalcCard>
  );
}

// ---------- MME / OME ----------
function MMECalc() {
  const [rows, setRows] = useState<{ id: string; dose: string }[]>([{ id: "morphine", dose: "30" }]);
  const [result, setResult] = useState<CalcResult | null>(null);
  const addRow = () => setRows([...rows, { id: "oxycodone", dose: "" }]);
  const remove = (i: number) => setRows(rows.filter((_, idx) => idx !== i));
  const update = (i: number, patch: Partial<{ id: string; dose: string }>) =>
    setRows(rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  const compute = () => {
    setResult(mme(rows.filter((r) => r.dose).map((r) => ({ id: r.id, dose: +r.dose }))));
  };

  const live = useMemo(
    () =>
      rows.some((r) => r.dose && +r.dose > 0)
        ? mme(rows.filter((r) => r.dose).map((r) => ({ id: r.id, dose: +r.dose })))
        : null,
    [rows],
  );

  return (
    <CalcCard title="MME / OME Converter" icon={ShieldAlert} accent="destructive" onReset={() => { setRows([{ id: "morphine", dose: "" }]); setResult(null); }}>
      <div className="space-y-3">
        {rows.map((r, i) => {
          const opi = OPIOIDS.find((o) => o.id === r.id);
          return (
            <div key={i} className="grid grid-cols-1 sm:grid-cols-[1fr_110px_40px] gap-2 items-end">
              <Field label={i === 0 ? "Opioid" : ""}>
                <select
                  value={r.id}
                  onChange={(e) => update(i, { id: e.target.value })}
                  className="w-full h-11 px-3 rounded-xl bg-input border border-border text-base md:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {OPIOIDS.map((o) => (
                    <option key={o.id} value={o.id}>{o.label}</option>
                  ))}
                </select>
              </Field>
              <Field label={i === 0 ? "Daily dose" : ""} unit={opi?.unit}>
                <NumInput value={r.dose} onChange={(v) => update(i, { dose: v })} placeholder="0" positiveOnly />
              </Field>
              <button
                onClick={() => remove(i)}
                disabled={rows.length === 1}
                aria-label="Remove opioid row"
                className="h-11 px-1.5 rounded-xl border border-border text-muted-foreground hover:text-destructive hover:bg-destructive/5 disabled:opacity-30 text-xl leading-none active:scale-[0.985] transition"
              >
                ×
              </button>
            </div>
          );
        })}
        <button
          onClick={addRow}
          className="w-full h-9 rounded-xl border border-dashed border-border text-sm text-muted-foreground hover:bg-secondary active:bg-muted active:scale-[0.985] transition"
        >
          + Add opioid
        </button>
        <LivePreview result={live} />
        <CalculateButton onClick={compute} disabled={!rows.some((r) => r.dose)} label={live ? "Update Result" : "Calculate"} />
      </div>
      {result && (
        <ResultPanel
          result={result}
          calculator="MME / OME"
          inputs={Object.fromEntries(
            rows.filter((r) => r.dose).map((r, i) => [
              `Opioid ${i + 1}`,
              `${OPIOIDS.find((o) => o.id === r.id)?.label} — ${r.dose}`,
            ]),
          )}
        />
      )}
    </CalcCard>
  );
}

// ---------- Reconstitution ----------
function ReconCalc() {
  const [drug, setDrug] = useState("1000");
  const [diluent, setDiluent] = useState("10");
  const [powder, setPowder] = useState("0.7");
  const [result, setResult] = useState<CalcResult | null>(null);
  return (
    <CalcCard title="Reconstitution Calculator" icon={TestTube} accent="info" onReset={() => { setDrug(""); setDiluent(""); setPowder(""); setResult(null); }}>
      <div className="space-y-4">
        <Field label="Drug in Vial" unit="mg"><NumInput value={drug} onChange={setDrug} placeholder="1000" positiveOnly /></Field>
        <Field label="Diluent Added" unit="mL" hint="Volume of diluent added to the vial"><NumInput value={diluent} onChange={setDiluent} placeholder="10" positiveOnly /></Field>
        <Field label="Powder Displacement Volume" unit="mL" hint="From manufacturer package insert (often ~0.5–1 mL)"><NumInput value={powder} onChange={setPowder} placeholder="0.7" positiveOnly /></Field>
        <CalculateButton
          onClick={() => setResult(reconstitution(+powder, +diluent, +drug))}
          disabled={!drug || !diluent || powder === ""}
        />
      </div>
      {result && (
        <ResultPanel
          result={result}
          calculator="Reconstitution"
          inputs={{ "Drug (mg)": drug, "Diluent (mL)": diluent, "Powder Vol (mL)": powder }}
        />
      )}
    </CalcCard>
  );
}

// ---------- Pediatric ----------
function PedCalc() {
  const { patient } = usePatient();
  const [basis, setBasis] = useState<PedBasis>("weight");
  const [wt, setWt] = useState(patient.weightKg || "15");
  const [ht, setHt] = useState(patient.heightCm || "100");
  const [age, setAge] = useState(patient.age || "6");
  const [dpk, setDpk] = useState("10");
  const [dpm, setDpm] = useState("250");
  const [adult, setAdult] = useState("500");
  const [result, setResult] = useState<CalcResult | null>(null);

  useEffect(() => {
    if (patient.weightKg) setWt(patient.weightKg);
    if (patient.heightCm) setHt(patient.heightCm);
    if (patient.age) setAge(patient.age);
  }, [patient.weightKg, patient.heightCm, patient.age]);

  const compute = () =>
    setResult(
      pediatricDose(basis, {
        weightKg: +wt, heightCm: +ht, ageYears: +age,
        dosePerKg: +dpk, dosePerM2: +dpm, adultDose: +adult,
      }),
    );

  const live = useMemo(
    () =>
      pediatricDose(basis, {
        weightKg: +wt, heightCm: +ht, ageYears: +age,
        dosePerKg: +dpk, dosePerM2: +dpm, adultDose: +adult,
      }),
    [basis, wt, ht, age, dpk, dpm, adult],
  );

  const isLegacy = basis === "youngs" || basis === "clarks";

  return (
    <CalcCard title="Pediatric Dose Estimator" icon={Baby} accent="warning" onReset={() => { setResult(null); }}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <SegBtn active={basis === "weight"} onClick={() => setBasis("weight")}>Weight (mg/kg)</SegBtn>
          <SegBtn active={basis === "bsa"} onClick={() => setBasis("bsa")}>BSA (mg/m²)</SegBtn>
          <SegBtn active={basis === "youngs"} onClick={() => setBasis("youngs")}>Young's Rule</SegBtn>
          <SegBtn active={basis === "clarks"} onClick={() => setBasis("clarks")}>Clark's Rule</SegBtn>
        </div>

        {/* Strengthened legacy rule notice — clearer explanation, informative but calm (educational tone) */}
        {isLegacy && (
          <div className="rounded-2xl border border-border/60 bg-muted/40 px-3.5 py-3 text-[11px] text-muted-foreground">
            <div className="font-medium flex items-center gap-1.5 mb-0.5 text-foreground/80">
              <Info className="size-3.5" /> Legacy formulas (Young’s Rule / Clark’s Rule)
            </div>
            These are historical approximations retained for reference and education only. Current pediatric guidelines recommend weight-based (mg/kg) or BSA (mg/m²) dosing for accuracy and safety.
          </div>
        )}

        {basis === "weight" && (
          <>
            <Field label="Child Weight" unit="kg" hint="Use actual body weight unless otherwise specified">
              <NumInput value={wt} onChange={setWt} placeholder="15" positiveOnly />
            </Field>
            <Field label="Dose" unit="mg/kg"><NumInput value={dpk} onChange={setDpk} placeholder="10" positiveOnly /></Field>
          </>
        )}
        {basis === "bsa" && (
          <>
            <Field label="Height" unit="cm"><NumInput value={ht} onChange={setHt} placeholder="100" positiveOnly /></Field>
            <Field label="Weight" unit="kg"><NumInput value={wt} onChange={setWt} placeholder="15" positiveOnly /></Field>
            <Field label="Dose" unit="mg/m²"><NumInput value={dpm} onChange={setDpm} placeholder="250" positiveOnly /></Field>
          </>
        )}
        {basis === "youngs" && (
          <>
            <Field label="Age" unit="years" hint="Young's Rule intended for ≤12 years">
              <NumInput value={age} onChange={setAge} placeholder="6" positiveOnly max={18} />
            </Field>
            <Field label="Adult Dose" unit="mg"><NumInput value={adult} onChange={setAdult} placeholder="500" positiveOnly /></Field>
          </>
        )}
        {basis === "clarks" && (
          <>
            <Field label="Weight" unit="kg"><NumInput value={wt} onChange={setWt} placeholder="15" positiveOnly /></Field>
            <Field label="Adult Dose" unit="mg"><NumInput value={adult} onChange={setAdult} placeholder="500" positiveOnly /></Field>
          </>
        )}
        <LivePreview result={live} />
        <CalculateButton onClick={compute} label={live && live.primary !== "—" ? "Update Result" : "Calculate"} />
      </div>
      {result && (
        <ResultPanel
          result={result}
          calculator="Pediatric Dose"
          inputs={{ Basis: basis, "Wt (kg)": wt, "Ht (cm)": ht, Age: age, "mg/kg": dpk, "mg/m²": dpm, "Adult (mg)": adult }}
        />
      )}
    </CalcCard>
  );
}

function DilutionCalc() {
  const [c1, setC1] = useState("10");
  const [v1, setV1] = useState("100");
  const [c2, setC2] = useState("2");
  const [result, setResult] = useState<CalcResult | null>(null);
  return (
    <CalcCard title="Dilution Calculator" icon={Percent} accent="warning" onReset={() => { setC1(""); setV1(""); setC2(""); setResult(null); }}>
      <div className="space-y-4">
        <Field label="Initial Conc. (C₁)" unit="%"><NumInput value={c1} onChange={setC1} placeholder="10" positiveOnly /></Field>
        <Field label="Initial Vol. (V₁)" unit="mL"><NumInput value={v1} onChange={setV1} placeholder="100" positiveOnly /></Field>
        <Field label="Final Conc. (C₂)" unit="%"><NumInput value={c2} onChange={setC2} placeholder="2" positiveOnly /></Field>
        <CalculateButton onClick={() => setResult(dilution(+c1, +v1, +c2))} disabled={!c1 || !v1 || !c2} />
      </div>
      {result && <ResultPanel result={result} calculator="Dilution" inputs={{ C1: c1, V1: v1, C2: c2 }} />}
    </CalcCard>
  );
}

function AlligationCalc() {
  const [hi, setHi] = useState("70");
  const [lo, setLo] = useState("10");
  const [des, setDes] = useState("30");
  const [result, setResult] = useState<CalcResult | null>(null);
  return (
    <CalcCard title="Alligation Calculator" icon={Beaker} accent="accent" onReset={() => { setHi(""); setLo(""); setDes(""); setResult(null); }}>
      <div className="space-y-4">
        <Field label="Higher Strength" unit="%"><NumInput value={hi} onChange={setHi} placeholder="70" positiveOnly /></Field>
        <Field label="Lower Strength" unit="%"><NumInput value={lo} onChange={setLo} placeholder="10" positiveOnly /></Field>
        <Field label="Desired Strength" unit="%"><NumInput value={des} onChange={setDes} placeholder="30" positiveOnly /></Field>
        <CalculateButton onClick={() => setResult(alligation(+hi, +lo, +des))} disabled={!hi || !lo || !des} />
      </div>
      {result && <ResultPanel result={result} calculator="Alligation" inputs={{ Higher: hi, Lower: lo, Desired: des }} />}
    </CalcCard>
  );
}

function DaysCalc() {
  const presets = [
    { label: "QD (1/day)", v: 1 },
    { label: "BID (2/day)", v: 2 },
    { label: "TID (3/day)", v: 3 },
    { label: "QID (4/day)", v: 4 },
    { label: "Q6H (4/day)", v: 4 },
    { label: "Q8H (3/day)", v: 3 },
    { label: "Q12H (2/day)", v: 2 },
    { label: "Q48H (0.5/day)", v: 0.5 },
    { label: "QOD (0.5/day)", v: 0.5 },
    { label: "Weekly (1/7)", v: 1 / 7 },
    { label: "PRN q4-6h (4/day)", v: 4 },
    { label: "HS (1/day)", v: 1 },
  ];
  const [qty, setQty] = useState("60");
  const [dpd, setDpd] = useState("2");
  const [result, setResult] = useState<CalcResult | null>(null);
  return (
    <CalcCard title="Days' Supply Calculator" icon={Link2} accent="accent" onReset={() => { setQty(""); setDpd(""); setResult(null); }}>
      <div className="mb-3">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Sig Presets</div>
        <div className="flex flex-wrap gap-1.5">
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => setDpd(String(p.v))}
              className="h-8 px-3 rounded-2xl text-xs border border-border bg-card hover:bg-muted active:bg-secondary active:scale-[0.985] transition"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <Field label="Quantity Dispensed" unit="units"><NumInput value={qty} onChange={setQty} placeholder="60" positiveOnly /></Field>
        <Field label="Doses Per Day" unit="/day"><NumInput value={dpd} onChange={setDpd} placeholder="2" positiveOnly /></Field>
        <CalculateButton onClick={() => setResult(daysSupply(+qty, +dpd))} disabled={!qty || !dpd} />
      </div>
      {result && <ResultPanel result={result} calculator="Days Supply" inputs={{ Quantity: qty, "Doses/day": dpd }} />}
    </CalcCard>
  );
}

function InjectCalc() {
  const [typeId, setTypeId] = useState("");
  const [vial, setVial] = useState("10");
  const [dose, setDose] = useState("40");
  const [result, setResult] = useState<CalcResult | null>(null);
  const selected = useMemo(() => INJECT_TYPES.find((t) => t.id === typeId), [typeId]);
  return (
    <CalcCard title="Inject DS Calculator" icon={Syringe} accent="destructive" onReset={() => { setTypeId(""); setVial(""); setDose(""); setResult(null); }}>
      <div className="space-y-4">
        <Field label="Medication Type">
          <select
            value={typeId}
            onChange={(e) => setTypeId(e.target.value)}
            className="w-full h-11 px-3.5 rounded-xl bg-input border border-border text-base md:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Select type...</option>
            {INJECT_TYPES.map((t) => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
        </Field>
        {typeId && (
          <>
            <Field label="Vial Volume" unit="mL"><NumInput value={vial} onChange={setVial} placeholder="10" positiveOnly /></Field>
            <Field label="Daily Dose" unit={selected?.unit ?? ""}><NumInput value={dose} onChange={setDose} placeholder="40" positiveOnly /></Field>
          </>
        )}
        <CalculateButton onClick={() => setResult(injectDaysSupply(typeId, +vial, +dose))} disabled={!typeId || !vial || !dose} />
      </div>
      {result && <ResultPanel result={result} calculator="Inject Days Supply" inputs={{ Type: selected?.label ?? "", "Vial (mL)": vial, "Daily dose": dose }} />}
    </CalcCard>
  );
}

function DateCalc() {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [biz, setBiz] = useState(false);
  const [result, setResult] = useState<CalcResult | null>(null);
  return (
    <CalcCard title="Date Diff Calculator" icon={Calendar} accent="accent" onReset={() => { setStart(""); setEnd(""); setBiz(false); setResult(null); }}>
      <div className="space-y-4">
        <Field label="Start Date">
          <input type="date" value={start} onChange={(e) => setStart(e.target.value)}
            className="w-full h-11 px-3.5 rounded-xl bg-input border border-border text-base md:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
        </Field>
        <Field label="End Date">
          <input type="date" value={end} onChange={(e) => setEnd(e.target.value)}
            className="w-full h-11 px-3.5 rounded-xl bg-input border border-border text-base md:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
        </Field>
        <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer py-0.5">
          <input type="checkbox" checked={biz} onChange={(e) => setBiz(e.target.checked)} className="size-4 rounded accent-primary" />
          Business days only (exclude weekends)
        </label>
        <CalculateButton onClick={() => setResult(dateDiff(start, end, biz))} disabled={!start || !end} />
      </div>
      {result && <ResultPanel result={result} calculator="Date Diff" inputs={{ Start: start, End: end, "Business only": biz }} />}
    </CalcCard>
  );
}

// silence unused warnings (crcl old API kept for compatibility)
void crcl;
