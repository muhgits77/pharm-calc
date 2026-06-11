import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { AppShell } from "@/components/AppShell";
import { PatientProvider } from "@/lib/patient-context";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link to="/" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:brightness-110">
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => {
    console.error("[PharmaCalc Pro] Route error:", error);
  }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">Something went wrong.</p>
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:brightness-110"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      // PWA + mobile polish
      { name: "theme-color", content: "#0e7490" },
      { name: "theme-color", media: "(prefers-color-scheme: dark)", content: "#0e7490" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "PharmaCalc Pro" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "application-name", content: "PharmaCalc Pro" },
      { name: "format-detection", content: "telephone=no" },
      { title: "PharmaCalc Pro — Professional Pharmacy Calculations" },
      { name: "description", content: "Professional pharmacy calculator suite: dosage, IV drip rate, CrCl, dilution, alligation, days' supply and more. 100% offline capable." },
      { property: "og:title", content: "PharmaCalc Pro — Professional Pharmacy Calculations" },
      { name: "twitter:title", content: "PharmaCalc Pro — Professional Pharmacy Calculations" },
      { property: "og:description", content: "Professional pharmacy calculator suite: dosage, IV drip rate, CrCl, dilution, alligation, days' supply and more. Works completely offline." },
      { name: "twitter:description", content: "Professional pharmacy calculator suite: dosage, IV drip rate, CrCl, dilution, alligation, days' supply and more. Works completely offline." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/33e9d7b8-34a5-4c55-aa66-5de5865bc2fb" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/33e9d7b8-34a5-4c55-aa66-5de5865bc2fb" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.json" },
      { rel: "icon", href: "/icons/pharmacalc-icon.svg", type: "image/svg+xml" },
      { rel: "apple-touch-icon", href: "/icons/pharmacalc-icon.svg" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  // Register the service worker for full offline PWA support.
  // All calculators are 100% client-side and will continue working after the SW caches the bundles.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;

    const register = async () => {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
        // Auto update when new version detected (background)
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New content available; user can reload or we can prompt in future
                console.info('[PharmaCalc Pro] New version ready. Reload for latest calculators & fixes.');
              }
            });
          }
        });
        console.info('[PharmaCalc Pro] Service worker registered for offline use.');
      } catch (err) {
        // Silent fail — app still fully functional, just no offline shell caching
        console.warn('[PharmaCalc Pro] SW registration skipped:', err);
      }
    };

    // Delay slightly to not block initial paint
    const t = setTimeout(register, 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <PatientProvider>
        <AppShell />
      </PatientProvider>
    </QueryClientProvider>
  );
}
