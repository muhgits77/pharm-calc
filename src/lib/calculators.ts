export type Step = { label: string; value: string };
export type CalcResult = {
  primary: string;
  unit?: string;
  steps: Step[];
  note?: string;
  warning?: string;
};

const fmt = (n: number, d = 2) =>
  Number.isFinite(n) ? n.toLocaleString(undefined, { maximumFractionDigits: d }) : "—";

const isPos = (n: number) => Number.isFinite(n) && n > 0;
const isNonNeg = (n: number) => Number.isFinite(n) && n >= 0;
const invalid = (msg: string): CalcResult => ({ primary: "—", steps: [], warning: msg });

export const isValidPositive = isPos;

export function dosage(dose: number, weight: number, conc: number): CalcResult {
  if (!isPos(dose) || !isPos(weight) || !isPos(conc))
    return invalid("Enter positive values for dose, weight, and concentration.");
  if (weight > 500) return invalid("Weight seems unrealistic (>500 kg). Please verify.");
  const totalMg = dose * weight;
  const volume = totalMg / conc;
  return {
    primary: fmt(volume, 3),
    unit: "mL",
    steps: [
      { label: "Total dose", value: `${dose} mg/kg × ${weight} kg = ${fmt(totalMg)} mg` },
      { label: "Volume needed", value: `${fmt(totalMg)} mg ÷ ${conc} mg/mL = ${fmt(volume, 3)} mL` },
    ],
    note: "Always verify with prescriber; round to nearest measurable volume.",
  };
}

const CONV: Record<string, (v: number) => { out: number; unit: string; formula: string }> = {
  "mg→g": (v) => ({ out: v / 1000, unit: "g", formula: `${v} ÷ 1000` }),
  "g→mg": (v) => ({ out: v * 1000, unit: "mg", formula: `${v} × 1000` }),
  "kg→lbs": (v) => ({ out: v * 2.2046, unit: "lbs", formula: `${v} × 2.2046` }),
  "lbs→kg": (v) => ({ out: v / 2.2046, unit: "kg", formula: `${v} ÷ 2.2046` }),
  "mL→tsp": (v) => ({ out: v / 5, unit: "tsp", formula: `${v} ÷ 5` }),
  "tsp→mL": (v) => ({ out: v * 5, unit: "mL", formula: `${v} × 5` }),
  "oz→mL": (v) => ({ out: v * 29.5735, unit: "mL", formula: `${v} × 29.5735` }),
  "mL→oz": (v) => ({ out: v / 29.5735, unit: "oz", formula: `${v} ÷ 29.5735` }),
  "°F→°C": (v) => ({ out: ((v - 32) * 5) / 9, unit: "°C", formula: `(${v} − 32) × 5/9` }),
  "°C→°F": (v) => ({ out: (v * 9) / 5 + 32, unit: "°F", formula: `${v} × 9/5 + 32` }),
};
export const UNIT_CONVERSIONS = Object.keys(CONV);
export function unitConvert(key: string, value: number): CalcResult {
  if (!Number.isFinite(value)) return invalid("Enter a numeric value.");
  const fn = CONV[key];
  if (!fn) return invalid("Select a conversion.");
  const { out, unit, formula } = fn(value);
  return {
    primary: fmt(out, 4),
    unit,
    steps: [{ label: "Conversion", value: `${formula} = ${fmt(out, 4)} ${unit}` }],
  };
}

export function ivDripRate(volume: number, hours: number, dropFactor: number): CalcResult {
  if (!isPos(volume) || !isPos(hours) || !isPos(dropFactor))
    return invalid("Enter positive values for volume, time, and drop factor.");
  const mlPerHr = volume / hours;
  const gttPerMin = (volume * dropFactor) / (hours * 60);
  return {
    primary: fmt(gttPerMin, 1),
    unit: "gtt/min",
    steps: [
      { label: "Flow rate", value: `${volume} mL ÷ ${hours} h = ${fmt(mlPerHr)} mL/h` },
      {
        label: "Drip rate",
        value: `(${volume} × ${dropFactor}) ÷ (${hours} × 60) = ${fmt(gttPerMin, 1)} gtt/min`,
      },
    ],
    note: "Round to nearest whole drop.",
  };
}

export function bmi(weightKg: number, heightCm: number): CalcResult {
  if (!isPos(weightKg) || !isPos(heightCm))
    return invalid("Enter positive weight and height.");
  if (heightCm < 50 || heightCm > 260) return invalid("Height out of plausible range (50–260 cm).");
  const m = heightCm / 100;
  const v = weightKg / (m * m);
  let cat = "—";
  if (v < 18.5) cat = "Underweight";
  else if (v < 25) cat = "Normal";
  else if (v < 30) cat = "Overweight";
  else cat = "Obese";
  return {
    primary: fmt(v, 1),
    unit: "kg/m²",
    steps: [
      { label: "Height in meters", value: `${heightCm} ÷ 100 = ${fmt(m, 2)} m` },
      { label: "BMI", value: `${weightKg} ÷ (${fmt(m, 2)})² = ${fmt(v, 1)}` },
      { label: "Category", value: cat },
    ],
  };
}

export function crcl(age: number, weight: number, scr: number, sex: 0 | 1): CalcResult {
  if (!isPos(age) || !isPos(weight) || !isPos(scr))
    return invalid("Enter positive age, weight, and SCr.");
  if (age > 120) return invalid("Age out of plausible range (>120).");
  const base = ((140 - age) * weight) / (72 * scr);
  const v = sex === 1 ? base : base * 0.85;
  return {
    primary: fmt(v, 1),
    unit: "mL/min",
    steps: [
      { label: "Formula", value: "[(140 − age) × wt] ÷ (72 × SCr) × (0.85 if female)" },
      {
        label: "Compute",
        value: `[(140 − ${age}) × ${weight}] ÷ (72 × ${scr})${sex === 0 ? " × 0.85" : ""} = ${fmt(v, 1)} mL/min`,
      },
    ],
    note: "Cockcroft–Gault. Use ideal body weight if obese; consider rounding SCr in elderly.",
  };
}

export function dilution(c1: number, v1: number, c2: number): CalcResult {
  if (!isPos(c1) || !isPos(v1) || !isPos(c2))
    return invalid("Enter positive C₁, V₁, and C₂.");
  if (c2 > c1)
    return { primary: "—", steps: [], warning: "Desired concentration exceeds stock — cannot dilute." };
  const v2 = (c1 * v1) / c2;
  const diluentAdd = v2 - v1;
  return {
    primary: fmt(v2, 2),
    unit: "mL final volume",
    steps: [
      { label: "Formula", value: "C₁V₁ = C₂V₂" },
      { label: "Solve V₂", value: `(${c1} × ${v1}) ÷ ${c2} = ${fmt(v2, 2)} mL` },
      { label: "Diluent to add", value: `${fmt(v2, 2)} − ${v1} = ${fmt(diluentAdd, 2)} mL` },
    ],
  };
}

export function alligation(high: number, low: number, desired: number): CalcResult {
  if (!isNonNeg(high) || !isNonNeg(low) || !isNonNeg(desired))
    return invalid("Enter non-negative strengths.");
  if (high <= low) return invalid("Higher strength must be greater than lower.");
  if (desired > high || desired < low)
    return invalid("Desired must lie between low and high strengths.");
  const partsHigh = desired - low;
  const partsLow = high - desired;
  const total = partsHigh + partsLow;
  return {
    primary: `${fmt(partsHigh)} : ${fmt(partsLow)}`,
    unit: "parts (high : low)",
    steps: [
      { label: "Parts of higher", value: `${desired} − ${low} = ${fmt(partsHigh)}` },
      { label: "Parts of lower", value: `${high} − ${desired} = ${fmt(partsLow)}` },
      { label: "Total parts", value: `${fmt(total)}` },
      {
        label: "Per 100 mL",
        value: `${fmt((partsHigh / total) * 100, 1)} mL high + ${fmt((partsLow / total) * 100, 1)} mL low`,
      },
    ],
  };
}

export function daysSupply(qty: number, dosesPerDay: number): CalcResult {
  if (!isPos(qty) || !isPos(dosesPerDay))
    return invalid("Enter positive quantity and doses/day.");
  const days = qty / dosesPerDay;
  return {
    primary: fmt(Math.floor(days)),
    unit: "days",
    steps: [
      { label: "Formula", value: "Quantity ÷ Doses per day" },
      { label: "Compute", value: `${qty} ÷ ${dosesPerDay} = ${fmt(days, 2)} days` },
      { label: "Rounded down", value: `${Math.floor(days)} days` },
    ],
  };
}

export const INJECT_TYPES = [
  { id: "insulin-u100", label: "Insulin U-100 (100 units/mL)", unitsPerMl: 100, unit: "units" },
  { id: "insulin-u500", label: "Insulin U-500 (500 units/mL)", unitsPerMl: 500, unit: "units" },
  { id: "heparin-5000", label: "Heparin (5000 units/mL)", unitsPerMl: 5000, unit: "units" },
  { id: "enoxaparin-100", label: "Enoxaparin (100 mg/mL)", unitsPerMl: 100, unit: "mg" },
];
export function injectDaysSupply(
  typeId: string,
  vialMl: number,
  dosePerDay: number,
): CalcResult {
  const t = INJECT_TYPES.find((x) => x.id === typeId);
  if (!t) return invalid("Select a medication type.");
  if (!isPos(vialMl) || !isPos(dosePerDay))
    return invalid("Enter positive vial volume and daily dose.");
  const totalUnits = vialMl * t.unitsPerMl;
  const days = totalUnits / dosePerDay;
  return {
    primary: fmt(Math.floor(days)),
    unit: "days",
    steps: [
      { label: "Medication", value: t.label },
      { label: "Total in vial", value: `${vialMl} mL × ${t.unitsPerMl} ${t.unit}/mL = ${fmt(totalUnits)} ${t.unit}` },
      { label: "Days supply", value: `${fmt(totalUnits)} ÷ ${dosePerDay} ${t.unit}/day = ${fmt(days, 2)} days` },
    ],
    note: "Account for priming/wasted doses where applicable.",
  };
}

export function dateDiff(start: string, end: string, businessOnly: boolean): CalcResult {
  if (!start || !end) return invalid("Select both start and end dates.");
  const s = new Date(start);
  const e = new Date(end);
  if (isNaN(+s) || isNaN(+e)) return invalid("Invalid date.");
  if (+e < +s) return invalid("End date must be on or after start date.");
  let days = 0;
  if (businessOnly) {
    const cur = new Date(s);
    while (cur <= e) {
      const d = cur.getDay();
      if (d !== 0 && d !== 6) days++;
      cur.setDate(cur.getDate() + 1);
    }
  } else {
    days = Math.round((+e - +s) / 86400000);
  }
  return {
    primary: fmt(days),
    unit: businessOnly ? "business days" : "days",
    steps: [
      { label: "Start", value: s.toDateString() },
      { label: "End", value: e.toDateString() },
      { label: "Difference", value: `${fmt(days)} ${businessOnly ? "business " : ""}days` },
    ],
  };
}

// ---------- Body Surface Area ----------
export type BSAFormula = "mosteller" | "dubois";
export function bsa(heightCm: number, weightKg: number, formula: BSAFormula = "mosteller"): CalcResult {
  if (!isPos(heightCm) || !isPos(weightKg))
    return invalid("Enter positive height and weight.");
  if (heightCm < 30 || heightCm > 260) return invalid("Height out of plausible range.");
  let v = 0;
  let steps: Step[] = [];
  if (formula === "mosteller") {
    v = Math.sqrt((heightCm * weightKg) / 3600);
    steps = [
      { label: "Formula (Mosteller)", value: "√[(Height(cm) × Weight(kg)) / 3600]" },
      { label: "Compute", value: `√[(${heightCm} × ${weightKg}) / 3600] = √${fmt((heightCm * weightKg) / 3600, 4)}` },
      { label: "BSA", value: `${fmt(v, 2)} m²` },
    ];
  } else {
    v = 0.007184 * Math.pow(weightKg, 0.425) * Math.pow(heightCm, 0.725);
    steps = [
      { label: "Formula (Du Bois)", value: "0.007184 × W^0.425 × H^0.725" },
      { label: "Compute", value: `0.007184 × ${weightKg}^0.425 × ${heightCm}^0.725 = ${fmt(v, 2)} m²` },
    ];
  }
  return {
    primary: fmt(v, 2),
    unit: "m²",
    steps,
    note: "Used for chemotherapy and cardiac index dosing (mg/m²). Mosteller is the most common bedside formula.",
  };
}

// ---------- Ideal & Adjusted Body Weight ----------
export type Sex = "male" | "female";
export function ibwAdj(sex: Sex, heightInches: number, actualKg: number) {
  const base = sex === "male" ? 50 : 45.5;
  const over = Math.max(0, heightInches - 60);
  const ibw = base + 2.3 * over;
  const adj = ibw + 0.4 * (actualKg - ibw);
  return { ibw, adj, over, base };
}
export function ibwCalc(sex: Sex, heightInches: number, actualKg: number): CalcResult {
  if (!isPos(heightInches) || !isPos(actualKg))
    return invalid("Enter positive height and weight.");
  if (heightInches < 24 || heightInches > 100)
    return invalid("Height out of plausible range.");
  const { ibw, adj, over, base } = ibwAdj(sex, heightInches, actualKg);
  const pctOver = ((actualKg - ibw) / ibw) * 100;
  return {
    primary: fmt(ibw, 1),
    unit: "kg (IBW)",
    steps: [
      { label: "Formula (Devine)", value: `${sex === "male" ? "50" : "45.5"} kg + 2.3 kg × (in over 5 ft)` },
      { label: "Inches over 5 ft", value: `${fmt(heightInches, 1)} − 60 = ${fmt(over, 1)} in` },
      { label: "IBW", value: `${base} + 2.3 × ${fmt(over, 1)} = ${fmt(ibw, 1)} kg` },
      { label: "Adjusted BW", value: `IBW + 0.4 × (Actual − IBW) = ${fmt(ibw, 1)} + 0.4 × (${actualKg} − ${fmt(ibw, 1)}) = ${fmt(adj, 1)} kg` },
      { label: "Actual vs IBW", value: `${fmt(pctOver, 0)}% ${pctOver >= 0 ? "over" : "under"} IBW` },
    ],
    note: "Use AdjBW when actual weight is ≥30% above IBW (often for aminoglycosides and CrCl).",
  };
}

// ---------- Enhanced CrCl with weight selector ----------
export type WeightBasis = "actual" | "ideal" | "adjusted";
export function crclEnhanced(
  age: number, actualKg: number, heightInches: number, scr: number, sex: Sex,
  basis: WeightBasis,
): CalcResult & { weights: { actual: number; ibw: number; adj: number }; using: number } {
  const empty = { weights: { actual: 0, ibw: 0, adj: 0 }, using: 0 };
  if (!isPos(age) || !isPos(actualKg) || !isPos(heightInches) || !isPos(scr))
    return { ...invalid("Enter positive age, weight, height, and SCr."), ...empty };
  if (age > 120) return { ...invalid("Age out of plausible range (>120)."), ...empty };
  if (scr < 0.1) return { ...invalid("SCr too low (<0.1 mg/dL). Verify."), ...empty };
  const { ibw, adj } = ibwAdj(sex, heightInches, actualKg);
  const wt = basis === "ideal" ? ibw : basis === "adjusted" ? adj : actualKg;
  const female = sex === "female" ? 0.85 : 1;
  const v = ((140 - age) * wt) / (72 * scr) * female;
  return {
    primary: fmt(v, 1),
    unit: "mL/min",
    steps: [
      { label: "Weight basis", value: `${basis.toUpperCase()} = ${fmt(wt, 1)} kg` },
      { label: "Formula", value: "[(140 − age) × wt] ÷ (72 × SCr) × (0.85 if female)" },
      { label: "Compute", value: `[(140 − ${age}) × ${fmt(wt, 1)}] ÷ (72 × ${scr})${sex === "female" ? " × 0.85" : ""} = ${fmt(v, 1)} mL/min` },
    ],
    note: "Cockcroft–Gault. Consider AdjBW if patient is obese (>30% over IBW).",
    weights: { actual: actualKg, ibw, adj },
    using: wt,
  };
}

// ---------- MME / OME Converter ----------
export const OPIOIDS = [
  { id: "morphine", label: "Morphine (oral)", factor: 1, unit: "mg/day" },
  { id: "oxycodone", label: "Oxycodone", factor: 1.5, unit: "mg/day" },
  { id: "hydrocodone", label: "Hydrocodone", factor: 1, unit: "mg/day" },
  { id: "hydromorphone", label: "Hydromorphone (oral)", factor: 4, unit: "mg/day" },
  { id: "codeine", label: "Codeine", factor: 0.15, unit: "mg/day" },
  { id: "tramadol", label: "Tramadol", factor: 0.1, unit: "mg/day" },
  { id: "methadone-low", label: "Methadone 1–20 mg/day", factor: 4, unit: "mg/day" },
  { id: "methadone-mid", label: "Methadone 21–40 mg/day", factor: 8, unit: "mg/day" },
  { id: "methadone-high", label: "Methadone 41–60 mg/day", factor: 10, unit: "mg/day" },
  { id: "methadone-vhi", label: "Methadone >60 mg/day", factor: 12, unit: "mg/day" },
  { id: "fentanyl-patch", label: "Fentanyl transdermal patch", factor: 2.4, unit: "mcg/hr" },
  { id: "morphine-iv", label: "Morphine IV/IM/SC", factor: 3, unit: "mg/day" },
] as const;
export type OpioidEntry = { id: string; dose: number };
export function mme(entries: OpioidEntry[]): CalcResult {
  const valid = entries.filter((e) => isPos(e.dose));
  if (!valid.length) return invalid("Enter at least one opioid with a positive daily dose.");
  let total = 0;
  const steps: Step[] = [];
  valid.forEach((e) => {
    const opi = OPIOIDS.find((o) => o.id === e.id);
    if (!opi) return;
    const sub = e.dose * opi.factor;
    total += sub;
    steps.push({
      label: opi.label,
      value: `${e.dose} ${opi.unit} × ${opi.factor} = ${fmt(sub, 1)} MME/day`,
    });
  });
  steps.push({ label: "Total daily MME", value: `${fmt(total, 1)} MME/day` });
  let warning: string | undefined;
  if (total >= 90) warning = "≥90 MME/day — HIGH overdose risk. Strongly consider alternatives, naloxone co-prescribing, and specialist consult.";
  else if (total >= 50) warning = "≥50 MME/day — increased overdose risk. Reassess therapy, consider naloxone.";
  return {
    primary: fmt(total, 1),
    unit: "MME/day",
    steps,
    warning,
    note: "CDC conversion factors. Not for opioid rotation without expert dose reduction (25–50%). Methadone & fentanyl have non-linear kinetics.",
  };
}

// ---------- Reconstitution ----------
export function reconstitution(powderVolumeMl: number, diluentMl: number, drugMg: number): CalcResult {
  if (!isNonNeg(powderVolumeMl) || !isPos(diluentMl) || !isPos(drugMg))
    return invalid("Enter positive diluent and drug, and a non-negative powder volume.");
  const finalVol = powderVolumeMl + diluentMl;
  const conc = drugMg / finalVol;
  return {
    primary: fmt(conc, 2),
    unit: "mg/mL",
    steps: [
      { label: "Final volume", value: `${diluentMl} mL diluent + ${powderVolumeMl} mL powder displacement = ${fmt(finalVol, 2)} mL` },
      { label: "Concentration", value: `${drugMg} mg ÷ ${fmt(finalVol, 2)} mL = ${fmt(conc, 2)} mg/mL` },
    ],
    note: "Always check manufacturer's package insert for powder displacement value and stability after reconstitution.",
  };
}

// ---------- Pediatric Dose Estimator ----------
export type PedBasis = "weight" | "bsa" | "youngs" | "clarks";
export function pediatricDose(
  basis: PedBasis,
  params: { weightKg?: number; heightCm?: number; ageYears?: number; dosePerKg?: number; dosePerM2?: number; adultDose?: number },
): CalcResult {
  if (basis === "weight") {
    const { weightKg = 0, dosePerKg = 0 } = params;
    if (!isPos(weightKg) || !isPos(dosePerKg))
      return invalid("Enter positive child weight and mg/kg dose.");
    const d = weightKg * dosePerKg;
    return {
      primary: fmt(d, 2), unit: "mg/dose",
      steps: [
        { label: "Formula", value: "Weight (kg) × Dose (mg/kg)" },
        { label: "Compute", value: `${weightKg} × ${dosePerKg} = ${fmt(d, 2)} mg` },
      ],
      note: "Verify against max adult dose; round to deliverable strength.",
    };
  }
  if (basis === "bsa") {
    const { heightCm = 0, weightKg = 0, dosePerM2 = 0 } = params;
    if (!isPos(heightCm) || !isPos(weightKg) || !isPos(dosePerM2))
      return invalid("Enter positive height, weight, and mg/m² dose.");
    const surface = Math.sqrt((heightCm * weightKg) / 3600);
    const d = surface * dosePerM2;
    return {
      primary: fmt(d, 2), unit: "mg/dose",
      steps: [
        { label: "BSA (Mosteller)", value: `√[(${heightCm} × ${weightKg})/3600] = ${fmt(surface, 2)} m²` },
        { label: "Dose", value: `${fmt(surface, 2)} m² × ${dosePerM2} mg/m² = ${fmt(d, 2)} mg` },
      ],
    };
  }
  if (basis === "youngs") {
    const { ageYears = 0, adultDose = 0 } = params;
    if (!isPos(ageYears) || !isPos(adultDose))
      return invalid("Enter positive age and adult dose.");
    if (ageYears > 18) return invalid("Young's Rule is intended for ages ≤12.");
    const d = (ageYears / (ageYears + 12)) * adultDose;
    return {
      primary: fmt(d, 2), unit: "mg/dose",
      steps: [
        { label: "Young's Rule", value: "Age ÷ (Age + 12) × Adult Dose" },
        { label: "Compute", value: `${ageYears} ÷ (${ageYears} + 12) × ${adultDose} = ${fmt(d, 2)} mg` },
      ],
      note: "Young's Rule is a legacy age-based approximation (≤12y only). It is not a substitute for weight-based (mg/kg) dosing — prefer current pediatric guidelines.",
    };
  }
  // clark's
  const { weightKg = 0, adultDose = 0 } = params;
  if (!isPos(weightKg) || !isPos(adultDose))
    return invalid("Enter positive weight and adult dose.");
  const weightLb = weightKg * 2.2046;
  const d = (weightLb / 150) * adultDose;
  return {
    primary: fmt(d, 2), unit: "mg/dose",
    steps: [
      { label: "Clark's Rule", value: "(Weight in lbs ÷ 150) × Adult Dose" },
      { label: "Compute", value: `(${fmt(weightLb, 1)} ÷ 150) × ${adultDose} = ${fmt(d, 2)} mg` },
    ],
    note: "Clark's Rule is a legacy weight-based approximation. It is not recommended as primary method — prefer evidence-based mg/kg dosing per current guidelines.",
  };
}
