# PharmaCalc Pro

**Professional offline-first pharmacy calculator suite.**

PharmaCalc Pro delivers 15+ precise, step-by-step pharmacy calculators designed for real-world use at the bench or in the field — even with poor or no cell service.

All calculations run 100% locally in the browser. No data leaves your device. Patient context, history, and results are stored in localStorage only.

## Key Features

- **Dosage calculations** (mg/kg → volume)
- **IV Drip Rate** (gtt/min with drop factor)
- **CrCl (Enhanced)** — Cockcroft–Gault with actual/IBW/AdjBW weight basis
- **BSA** (Mosteller & Du Bois)
- **IBW / Adjusted Body Weight** (Devine)
- **BMI** + category
- **MME / OME Converter** with high-risk warnings (≥50 / ≥90 MME)
- **Reconstitution**, **Dilution**, **Alligation**
- **Pediatric Dose Estimator** (mg/kg, BSA, Young's Rule, Clark's Rule — with clear legacy notices)
- **Days' Supply** (with common sig presets)
- **Injectable Days' Supply** (U-100/U-500 insulin, heparin, enoxaparin)
- **Unit conversions** and **Date difference** (business days option)
- Live previews, detailed step-by-step, one-tap PDF export, save to local history
- Patient context (name/age/sex/wt/ht) that auto-fills relevant calculators
- Fully installable Progressive Web App (PWA) — works offline after first load

**Made for pharmacy use.** Educational and reference tool only. Always verify with a licensed pharmacist and current clinical guidelines before patient care decisions.

## Tech Stack

- TanStack Start + React 19 + Vite (SSR + client hydration)
- Nitro with `vercel` preset (Vercel Build Output API)
- TypeScript, Tailwind 4, Radix UI primitives
- Pure client-side math (zero external APIs for core calculators)
- jsPDF for offline PDF generation
- Local-first storage (localStorage)

## Getting Started (Local Development)

```bash
git clone https://github.com/<your-org>/pharm-calc.git
cd pharm-calc
npm install
npm run dev
```

Open http://localhost:5173 (or the port shown).

## Production Build & Preview

```bash
npm run build
npm run preview
```

## Deployment — Vercel

Nitro emits a [Build Output API v3](https://vercel.com/docs/build-output-api/v3) bundle at `.vercel/output`. Vercel detects this automatically — **do not** set a custom Output Directory.

### Vercel Project Settings

| Setting | Value |
|---------|-------|
| **Framework Preset** | Other (or Vite) |
| **Install Command** | `npm install` |
| **Build Command** | `npm run build` |
| **Output Directory** | *(leave empty — Nitro handles routing)* |
| **Node.js Version** | 22.x or 24.x |

### First deploy checklist

1. Push to GitHub and import the repo in Vercel.
2. Confirm Output Directory is **blank** (not `dist` or `.vercel/output`).
3. Deploy, then **Redeploy → without Build Cache** if you previously had 404s.
4. Visit `/`, `/calculators`, and `/history` — all should SSR correctly.

### Why 404s happen (and how this project fixes them)

TanStack Start is a full-stack SSR framework. Without Nitro's `vercel` preset, Vercel serves static files only and returns 404 for every route. This project uses:

- `nitro({ preset: "vercel" })` in `vite.config.ts`
- No `outputDirectory` in `vercel.json` (Nitro writes `.vercel/output/config.json` with catch-all routing to `__server`)

## PWA / Offline Support

- `manifest.json` — installable app with shortcuts to Calculators and History
- `sw.js` — precaches app shell, routes, and hashed assets
- All 15 calculators, PDF export, history, and patient context work **completely offline** after first load

**To test offline:**

1. `npm run build && npm run preview` (or deploy to Vercel)
2. Open in Chrome/Edge or mobile Safari/Chrome
3. Install the PWA ("Add to Home Screen")
4. Enable airplane mode — calculators still run

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (HMR) |
| `npm run build` | Production build (Nitro → `.vercel/output`) + PWA asset copy |
| `npm run preview` | Preview the built app locally |
| `npm run lint` | ESLint |
| `npm run format` | Prettier format |

## Project Structure

```
src/
├── components/
│   ├── AppShell.tsx
│   └── calculators/
├── lib/
│   ├── calculators.ts        # Pure math functions
│   ├── history.ts
│   └── patient-context.tsx
├── routes/                   # File-based TanStack Router routes
├── server.ts                 # SSR entry with error handling
└── start.ts
public/
├── manifest.json
├── sw.js
└── icons/
```

## Important Clinical Notes

- All formulas are reference implementations (Cockcroft–Gault, Mosteller, Devine, CDC MME factors, etc.).
- Legacy pediatric rules (Young's/Clark's) are included for education and clearly labeled as historical approximations.
- MME warnings surface at clinically relevant thresholds.
- **Never use this app as the sole source for patient care decisions.**

## License

For pharmacy / healthcare internal or educational use. Not for redistribution as a medical device.

---

**PharmaCalc Pro — Precise calculations. Trusted at the bench. Works when the network doesn't.**