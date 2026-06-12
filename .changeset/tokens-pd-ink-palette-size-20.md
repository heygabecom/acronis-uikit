---
'@acronis-platform/tokens-pd': patch
---

Regenerate from `@acronis-platform/design-tokens` after the 2026-06-12 Figma
primitives sync. Additive only — no existing output changed.

- `dtcg/primitives-light.json` / `dtcg/primitives-dark.json`: gain the new
  `palette.ink` ramp (15 stops, `ink.0`–`ink.14`) and `units.size.20` (20px).
- No CSS custom properties or Tailwind preset changes: the new primitives are
  not yet referenced by any semantic or component token, so the `--ui-*`
  consumer surface is untouched.
