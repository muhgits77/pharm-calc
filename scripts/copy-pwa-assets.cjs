#!/usr/bin/env node
/**
 * PharmaCalc Pro — Post-build PWA asset copier
 *
 * The Lovable/TanStack + Nitro (vercel preset) build primarily outputs Vite client chunks
 * into .vercel/output/static/assets (and legacy dist/client/assets).
 *
 * This script ensures the root-level PWA files (manifest.json, sw.js) + icons/
 * are present at the static root so they are served at /manifest.json and /sw.js
 * both locally (vite preview / dist) and on Vercel.
 *
 * Safe to run multiple times. Idempotent.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT, 'public');
const TARGETS = [
  // Nitro / Vercel output (primary for production deploys)
  path.join(ROOT, '.vercel', 'output', 'static'),
  // Legacy Vite dist (used by some previews / other hosts)
  path.join(ROOT, 'dist', 'client'),
  // Fallback root dist (some setups)
  path.join(ROOT, 'dist'),
];

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return false;
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
    return true;
  } else {
    if (!fs.existsSync(path.dirname(dest))) {
      fs.mkdirSync(path.dirname(dest), { recursive: true });
    }
    fs.copyFileSync(src, dest);
    return true;
  }
}

function main() {
  const filesToEnsure = ['manifest.json', 'sw.js'];
  let anyCopied = false;

  for (const target of TARGETS) {
    if (!target) continue;

    // Copy exact root PWA files
    for (const f of filesToEnsure) {
      const src = path.join(PUBLIC_DIR, f);
      const dest = path.join(target, f);
      if (fs.existsSync(src)) {
        if (!fs.existsSync(path.dirname(dest))) fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.copyFileSync(src, dest);
        anyCopied = true;
        console.log(`[pwa] Copied ${f} → ${path.relative(ROOT, dest)}`);
      }
    }

    // Copy icons directory
    const iconsSrc = path.join(PUBLIC_DIR, 'icons');
    const iconsDest = path.join(target, 'icons');
    if (copyRecursive(iconsSrc, iconsDest)) {
      anyCopied = true;
      console.log(`[pwa] Copied icons/ → ${path.relative(ROOT, iconsDest)}`);
    }
  }

  if (anyCopied) {
    console.log('[pwa] PWA assets (manifest, sw, icons) injected for offline production use.');
  } else {
    console.log('[pwa] No additional public PWA assets needed copying (or public/ missing).');
  }
}

main();
