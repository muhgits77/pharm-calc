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
- TypeScript, Tailwind 4, Radix UI primitives
- Pure client-side math (zero external APIs or tracking for core functions)
- jsPDF for offline PDF generation
- Local-first storage (localStorage)

## Getting Started (Local Development)

```bash
# 1. Clone
git clone https://github.com/<your-org>/pharm-calc.git
cd pharm-calc

# 2. Install (clean recommended after any lock changes)
rm -rf node_modules package-lock.json
npm install

# 3. Run dev server
npm run dev
```

Open http://localhost:5173 (or the port shown).

## Production Build & Preview

```bash
npm run build
npm run preview   # serves the production build locally
```

## Deployment — Vercel (Recommended)

1. Push to GitHub.
2. Import the repo in Vercel (or connect via Git).
3. **Framework Preset**: Other / Vite (or leave auto).
4. **Build Command**: `npm run build` (default)
5. **Output Directory**: leave default (Vercel detects from Nitro `.output` or static assets).
6. **Install Command**: `npm install` (or `npm install --legacy-peer-deps` only if you ever see peer issues — not required after our fixes).
7. Deploy.

The app is SSR via Nitro (TanStack Start) but all calculator logic + assets are precached by the service worker for reliable offline use after install.

See "Vercel redeploy instructions" section below for updates.

## PWA / Offline Support (Critical for Pharmacy Environments)

- `manifest.json` with name **"PharmaCalc Pro"**, proper icons, theme color, and `display: standalone`.
- Custom service worker (`/sw.js`) that precaches the app shell, JS bundles, CSS, and static assets on first load.
- Once installed (via browser "Add to Home Screen" / "Install" prompt on mobile), the full app (all 15 calculators, PDF export, history, patient context) works **completely offline**.
- Ideal for pharmacies with spotty cell service, basements, or rural locations.
- Updates are delivered automatically in background when online.

**To test offline:**
- Build + preview, or deploy.
- Open in Chrome/Edge on desktop or Android/iOS Safari/Chrome.
- Install the PWA.
- Turn on airplane mode / disable Wi-Fi — everything still calculates and exports.

## Mobile-First Polish

- Bottom navigation + horizontal scrollable calculator tabs on small screens.
- Sidebar hidden on mobile (desktop-only persistent nav).
- All number inputs: `inputMode="decimal"`, `text-base` on mobile (prevents iOS zoom), tall 44px+ touch targets.
- Selects and date fields also use `text-base md:text-sm`.
- Responsive typography, generous padding, no horizontal overflow.
- Active scale micro-interactions for tactile feedback.

## Project Structure (Key Files)

```
src/
├── components/
│   ├── AppShell.tsx          # Layout + responsive nav
│   └── calculators/
│       ├── CalculatorPanel.tsx
│       └── shared.tsx        # NumInput, CalcCard, ResultPanel, PDF, etc.
├── lib/
│   ├── calculators.ts        # All pure math functions (the heart of the app)
│   ├── history.ts            # localStorage history
│   └── patient-context.tsx   # Shared patient state
├── routes/                   # TanStack Router file-based routes
└── __root.tsx                # Root meta, providers, PWA registration
public/
├── manifest.json
├── sw.js
└── icons/                    # PWA + favicon assets
```

## Scripts

| Command           | Description                     |
|-------------------|---------------------------------|
| `npm run dev`     | Start dev server (HMR)          |
| `npm run build`   | Production build (Nitro SSR)    |
| `npm run preview` | Preview the built app locally   |
| `npm run lint`    | ESLint                          |
| `npm run format`  | Prettier format                 |

## Important Clinical Notes

- All formulas are reference implementations (Cockcroft–Gault, Mosteller, Devine, CDC MME factors, etc.).
- Legacy pediatric rules (Young's/Clark's) are included for education and clearly labeled as historical approximations.
- MME warnings surface at clinically relevant thresholds.
- **Never use this app as the sole source for patient care decisions.**

## Contributing / Customization

This is a production-grade reference tool. PRs welcome for:
- Additional calculators or improved formulas
- Better accessibility / i18n
- Refined clinical notes or references
- Enhanced offline resilience

Please keep the core principle: **everything must continue to work 100% offline**.

## License

For pharmacy / healthcare internal or educational use. Not for redistribution as a medical device.

---

**PharmaCalc Pro — Precise calculations. Trusted at the bench. Works when the network doesn't.**
