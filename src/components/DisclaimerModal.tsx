import { AlertTriangle, ShieldCheck, X } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { APP_VERSION } from "@/lib/version";

type Props = {
  trigger: React.ReactNode;
};

export function DisclaimerModal({ trigger }: Props) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl border-border/70 p-0 gap-0">
        <div className="bg-gradient-to-br from-primary/10 via-gold/5 to-accent/5 px-6 pt-6 pb-4 border-b border-border/60">
          <DialogHeader className="text-left space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div className="size-11 rounded-2xl bg-primary/15 text-primary grid place-items-center shrink-0 ring-1 ring-inset ring-primary/20">
                <ShieldCheck className="size-5" />
              </div>
              <DialogTitle className="font-serif text-xl tracking-tight text-foreground pt-1.5">
                Clinical &amp; Educational Disclaimer
              </DialogTitle>
            </div>
            <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
              PharmaCalc Pro is a reference tool for pharmacy professionals and students.
              Please read before use.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 py-5 space-y-4 text-sm text-foreground/90 leading-relaxed">
          <section>
            <h3 className="font-semibold text-foreground mb-1.5">Educational Use Only</h3>
            <p className="text-muted-foreground">
              All calculators provide reference implementations of established pharmacy formulas.
              Results are intended for education, verification, and workflow support — not as the
              sole basis for patient care decisions.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-foreground mb-1.5">Professional Verification Required</h3>
            <p className="text-muted-foreground">
              Always verify calculations with a licensed pharmacist and current institutional
              protocols, drug references, and clinical guidelines before dispensing, counseling,
              or documenting patient care.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-foreground mb-1.5">Privacy &amp; Data</h3>
            <p className="text-muted-foreground">
              All math runs locally in your browser. No patient data, inputs, or results are
              transmitted to any server. History and patient context are stored only on this
              device via localStorage.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-foreground mb-1.5">Formula Limitations</h3>
            <p className="text-muted-foreground">
              Legacy pediatric rules (Young&apos;s, Clark&apos;s) are historical approximations and
              clearly labeled. MME conversions follow CDC reference factors. Renal dosing uses
              Cockcroft–Gault — consider institutional alternatives where indicated.
            </p>
          </section>

          <div className="rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 flex gap-3 text-warning-foreground">
            <AlertTriangle className="size-4 mt-0.5 shrink-0" />
            <p className="text-xs leading-relaxed">
              <span className="font-semibold uppercase tracking-wide text-[10px] block mb-1">
                Not a Medical Device
              </span>
              PharmaCalc Pro is not FDA-cleared, CE-marked, or intended for diagnosis,
              treatment, or substitution of professional clinical judgment.
            </p>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border/60 bg-muted/30 flex items-center justify-between gap-3">
          <span className="text-[10px] text-muted-foreground font-mono tabular-nums">
            v{APP_VERSION} · Kentucky Bluegrass Digital Forge
          </span>
          <DialogClose asChild>
            <button className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:brightness-105 active:scale-[0.98] transition">
              <X className="size-3.5" /> Understood
            </button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}