---
'@acronis-platform/shadcn-uikit': patch
---

Chore: bump dependencies across the monorepo and adapt source to the new
APIs. Notable runtime bumps for the published library: `react-day-picker`
9 → 10 (calendar), `recharts` 3.6 → 3.8 (chart), `tailwind-merge` 2 → 3,
`zod` 4.2 → 4.4. `calendar.tsx` and `chart.tsx` were updated for the new
`react-day-picker`/`recharts` APIs.

The build toolchain stays on the Rollup-based Vite 6 line (Vite 8 ships
the rolldown bundler, which miscompiles es-toolkit's CommonJS modules —
pulled in via recharts — into a `dist` that throws at runtime in SSR
consumers). No public API changes.
