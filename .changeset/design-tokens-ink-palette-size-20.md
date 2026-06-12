---
'@acronis-platform/design-tokens': patch
---

Add the **Ink palette ramp** and the **size-20 unit** primitive, synced from the
`shadcn-uikit` Figma file (Theme / Units collections) on 2026-06-12.

**New tokens — `palette.ink` (15 stops, `$type: color`, light/dark mode-aware):**

A new dark-navy ramp following the established palette convention (`Ink-7-Primary`
is the theme-invariant pivot, `Ink-13-Brand` the brand stop — same pattern as Blue).
Light/dark values mirror each other across the pivot like every other ramp.
Inserted between `violet` and `transparent` in the palette order.

| token            | light                     | dark                      |
| ---------------- | ------------------------- | ------------------------- |
| `palette.ink.0`  | hsl(216 38.46% 97.45%)    | hsl(212.9 63.27% 9.61%)   |
| `palette.ink.1`  | hsl(214.29 43.75% 93.73%) | hsl(213.33 58.06% 12.16%) |
| `palette.ink.2`  | hsl(212.5 44.44% 89.41%)  | hsl(213.66 56.16% 14.31%) |
| `palette.ink.3`  | hsl(212.57 43.21% 84.12%) | hsl(214.47 56.63% 16.27%) |
| `palette.ink.4`  | hsl(212.61 40.35% 77.65%) | hsl(214.62 56.52% 18.04%) |
| `palette.ink.5`  | hsl(214.69 40% 68.63%)    | hsl(215.17 56.86% 20%)    |
| `palette.ink.6`  | hsl(215.7 34.2% 54.71%)   | hsl(215.24 56.76% 21.76%) |
| `palette.ink.7`  | hsl(215.65 57.02% 23.73%) | hsl(215.65 57.02% 23.73%) |
| `palette.ink.8`  | hsl(215.24 56.76% 21.76%) | hsl(215.7 34.2% 54.71%)   |
| `palette.ink.9`  | hsl(215.17 56.86% 20%)    | hsl(214.69 40% 68.63%)    |
| `palette.ink.10` | hsl(214.62 56.52% 18.04%) | hsl(212.61 40.35% 77.65%) |
| `palette.ink.11` | hsl(214.47 56.63% 16.27%) | hsl(212.57 43.21% 84.12%) |
| `palette.ink.12` | hsl(213.66 56.16% 14.31%) | hsl(212.5 44.44% 89.41%)  |
| `palette.ink.13` | hsl(213.33 58.06% 12.16%) | hsl(214.29 43.75% 93.73%) |
| `palette.ink.14` | hsl(212.9 63.27% 9.61%)   | hsl(216 38.46% 97.45%)    |

**New token — `units.size.20`:** 20px (`size/size-20` in the Figma Units collection).

**Metadata-only:** `units.stroke.3` — `com.figma.scopes` widened from
`["EFFECT_FLOAT"]` to `["STROKE_FLOAT", "EFFECT_FLOAT"]` (Figma-side scope change;
no value or contract effect).

**Formatting normalization (no value change):** the alpha-bearing
`palette.transparent.*` mode colors are now emitted inline on one line by the
canonical formatter; values are byte-identical to before. All 197 pre-existing
tokens are otherwise unchanged — no deletions, renames, or value changes in this
sync.
