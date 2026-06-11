import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { X, User2, Trash2 } from "lucide-react";

export type Patient = {
  name: string;
  age: string;
  sex: "male" | "female" | "";
  weightKg: string;
  heightCm: string;
};

const EMPTY: Patient = { name: "", age: "", sex: "", weightKg: "", heightCm: "" };
const KEY = "pharmacalc:patient";

type Ctx = {
  patient: Patient;
  setPatient: (p: Patient) => void;
  clear: () => void;
  hasPatient: boolean;
  open: boolean;
  setOpen: (o: boolean) => void;
};

const PatientCtx = createContext<Ctx | null>(null);

export function PatientProvider({ children }: { children: ReactNode }) {
  const [patient, setPatientState] = useState<Patient>(EMPTY);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setPatientState({ ...EMPTY, ...JSON.parse(raw) });
    } catch {
      /* ignore */
    }
  }, []);

  const setPatient = (p: Patient) => {
    setPatientState(p);
    try {
      localStorage.setItem(KEY, JSON.stringify(p));
    } catch {
      /* ignore */
    }
  };
  const clear = () => setPatient(EMPTY);
  const hasPatient =
    !!patient.name || !!patient.age || !!patient.weightKg || !!patient.heightCm || !!patient.sex;

  return (
    <PatientCtx.Provider value={{ patient, setPatient, clear, hasPatient, open, setOpen }}>
      {children}
      <PatientModal />
    </PatientCtx.Provider>
  );
}

export function usePatient(): Ctx {
  const ctx = useContext(PatientCtx);
  if (!ctx) {
    // Safe fallback so calculators don't crash if used outside provider.
    return {
      patient: EMPTY,
      setPatient: () => {},
      clear: () => {},
      hasPatient: false,
      open: false,
      setOpen: () => {},
    };
  }
  return ctx;
}

function PatientModal() {
  const { patient, setPatient, clear, open, setOpen } = usePatient();
  const [local, setLocal] = useState<Patient>(patient);

  useEffect(() => {
    if (open) setLocal(patient);
  }, [open, patient]);

  if (!open) return null;

  const set = (k: keyof Patient, v: string) => setLocal({ ...local, [k]: v });

  const save = () => {
    setPatient(local);
    setOpen(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Patient context"
      className="fixed inset-0 z-50 grid place-items-center bg-background/70 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && setOpen(false)}
    >
      <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-xl p-5 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="size-9 rounded-xl bg-primary/15 text-primary grid place-items-center">
              <User2 className="size-5" />
            </div>
            <h2 className="text-lg font-semibold">Patient Context</h2>
          </div>
          <button
            aria-label="Close"
            onClick={() => setOpen(false)}
            className="size-9 grid place-items-center rounded-lg hover:bg-secondary text-muted-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        <p className="text-xs text-muted-foreground mb-4">
          Saved locally only. Auto-fills CrCl, BSA, IBW & pediatric calculators (manual override allowed).
        </p>

        <div className="space-y-3">
          <LabeledField label="Name (optional)">
            <input
              value={local.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Patient initials or ID"
              maxLength={60}
              className="w-full h-11 px-3.5 rounded-lg bg-input/60 border border-border focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </LabeledField>

          <div className="grid grid-cols-2 gap-3">
            <LabeledField label="Age (years)">
              <input
                type="number"
                inputMode="numeric"
                min={0}
                max={120}
                value={local.age}
                onChange={(e) => set("age", e.target.value)}
                placeholder="65"
                className="w-full h-11 px-3.5 rounded-lg bg-input/60 border border-border focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </LabeledField>
            <LabeledField label="Sex">
              <div className="flex gap-1.5 h-11">
                {(["male", "female"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => set("sex", s)}
                    className={
                      "flex-1 rounded-lg text-sm font-medium border transition " +
                      (local.sex === s
                        ? "bg-primary text-primary-foreground border-transparent"
                        : "bg-card text-muted-foreground border-border")
                    }
                  >
                    {s === "male" ? "Male" : "Female"}
                  </button>
                ))}
              </div>
            </LabeledField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <LabeledField label="Weight (kg)">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step="0.1"
                value={local.weightKg}
                onChange={(e) => set("weightKg", e.target.value.replace(/^-/, ""))}
                placeholder="70"
                className="w-full h-11 px-3.5 rounded-lg bg-input/60 border border-border focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </LabeledField>
            <LabeledField label="Height (cm)">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step="0.1"
                value={local.heightCm}
                onChange={(e) => set("heightCm", e.target.value.replace(/^-/, ""))}
                placeholder="170"
                className="w-full h-11 px-3.5 rounded-lg bg-input/60 border border-border focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </LabeledField>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-2">
          <button
            onClick={() => {
              clear();
              setLocal(EMPTY);
            }}
            className="inline-flex items-center gap-1.5 h-10 px-3 rounded-md border border-border text-sm text-muted-foreground hover:text-destructive hover:border-destructive/40"
          >
            <Trash2 className="size-3.5" /> Clear
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => setOpen(false)}
              className="h-10 px-4 rounded-md border border-border text-sm hover:bg-secondary"
            >
              Cancel
            </button>
            <button
              onClick={save}
              className="h-10 px-5 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110"
            >
              Save patient
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LabeledField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <div className="text-xs font-medium text-muted-foreground mb-1.5">{label}</div>
      {children}
    </label>
  );
}
