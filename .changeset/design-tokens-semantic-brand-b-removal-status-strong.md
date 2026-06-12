---
'@acronis-platform/design-tokens': minor
---

**BREAKING** semantic-tier sync from the `shadcn-uikit` Figma file (Brand
collection + Text Styles) on 2026-06-12. This change removes the `brand-b`
values mode, renames 24 token paths, deletes 6 tokens, and relocates the four
AI gradients to a new top-level `gradients.*` root (with new values) — see the
migration tables below. `tiers/components.json` is rebuilt in the companion
components-sync change; together the two land a consistent `tiers/` tree, but do
**not** rebuild `tokens-pd` from this state (the new `gradient`/`strokeStyle`/
`string`/typography-alias surface needs style-dictionary work first).

**Removed brand mode — `brand-b` (BREAKING):**

The temporary `brand-b` test mode (the multi-brand architecture proof) was
removed in Figma; the Brand collection is back to a single `Acronis` mode.
Every variable-backed color token in `semantic.json` loses its
`values.brand-b` key and is now single-keyed `values.acronis`. The
`values.<brand>` structure itself is unchanged — future brands flow back in
data-driven with no schema or code change.

**Renamed (BREAKING) — `colors.background.status-inverted.*` → `colors.background.status-strong.*`:**

All 18 tokens in the group: `critical`, `critical-hover`, `critical-pressed`,
`danger`, `danger-hover`, `danger-pressed`, `info`, `info-hover`,
`info-pressed`, `neutral`, `neutral-hover`, `neutral-pressed`, `success`,
`success-hover`, `success-pressed`, `warning`, `warning-hover`,
`warning-pressed`. Two of them also re-point:

| token (new path)                                 | old value         | new value          |
| ------------------------------------------------ | ----------------- | ------------------ |
| `colors.background.status-strong.danger-hover`   | `{palette.red.8}` | `{palette.red.9}`  |
| `colors.background.status-strong.danger-pressed` | `{palette.red.9}` | `{palette.red.10}` |

**Renamed (BREAKING) — `colors.border.on-status.*-dark` → `*-strong`:**

`critical-dark` → `critical-strong`, `danger-dark` → `danger-strong`,
`info-dark` → `info-strong`, `neutral-dark` → `neutral-strong`,
`success-dark` → `success-strong`, `warning-dark` → `warning-strong`
(values unchanged).

**AI gradients relocated (BREAKING) — `colors.background.ai.*` → `gradients.ai.*`:**

The four AI gradient paint styles vanished from Figma, but the gradient
treatment was **not** dropped — it moved into the variable system. Figma
variables can't hold gradient fills, so the designer mocked them as four
`string` variables under `semantic/gradients/ai/*`, each holding a CSS
`linear-gradient(...)`. This sync emits them as a new top-level `gradients.*`
root of DTCG `$type: "gradient"` tokens: the CSS stops are parsed into
`{color, position}` arrays (hex → HSL, percent → `0..1`), and the original raw
CSS string is preserved in `$extensions.com.figma.cssGradient` (which also
carries the `90deg` angle, for which DTCG `gradient` has no field).

The old `colors.background.ai.*` path is therefore **removed** and the new
`gradients.ai.*` path **added**; consumers must re-point. The values also
changed — `hover`/`active` no longer mirror `idle`, and `disabled` brightened:

| token (new path)        | CSS gradient (raw, kept in `com.figma.cssGradient`) |
| ----------------------- | --------------------------------------------------- |
| `gradients.ai.idle`     | `linear-gradient(90deg, #3849E0 20%, #FC2DF1 100%)` |
| `gradients.ai.hover`    | `linear-gradient(90deg, #3342C3 20%, #B621AE 100%)` |
| `gradients.ai.active`   | `linear-gradient(90deg, #2B369B 20%, #761571 100%)` |
| `gradients.ai.disabled` | `linear-gradient(90deg, #DFE2FF 20%, #FFDAFD 100%)` |

The hardcoded `AI_GRADIENTS` paint-style block was removed from the
`figma-to-semantic.mjs` emitter, replaced by a `gradients`-root pass that parses
the mocked CSS strings (the `gradient` $type was already in the schema enum).

**Deleted (BREAKING):**

- `colors.background.inverted-surface.{idle,hover,active,disabled}` — group
  dropped in Figma (held raw HSL values); the reworked
  `colors.background.inverted.*` tokens below cover the role.
- `colors.glyph.on-status.{on,off}` — deleted from the Figma Brand collection
  (now phantom variables only bound by Figma's legacy component group, which is
  not part of any emitted tier).

**Value changes (aliases re-pointed in Figma):**

| token                                    | old                                | new                                |
| ---------------------------------------- | ---------------------------------- | ---------------------------------- |
| `colors.background.surface.hover`        | `{palette.blue.2}`                 | `{palette.blue.1}`                 |
| `colors.background.brand.primary-active` | `{palette.blue.11}`                | `{palette.blue.7}`                 |
| `colors.background.inverted.primary`     | `{palette.transparent.inverted.8}` | `{palette.blue.10}`                |
| `colors.background.inverted.hover`       | `{palette.transparent.inverted.7}` | `{palette.blue.9}`                 |
| `colors.background.inverted.active`      | `{palette.transparent.inverted.6}` | `{palette.blue.8}`                 |
| `colors.glyph.on-status.critical`        | `{palette.orange.7}`               | `{palette.orange.11}`              |
| `colors.glyph.on-status.danger`          | `{palette.red.7}`                  | `{palette.red.11}`                 |
| `colors.glyph.on-status.info`            | `{palette.blue.7}`                 | `{palette.blue.11}`                |
| `colors.glyph.on-status.neutral`         | `{palette.grayscale.7}`            | `{palette.grayscale.11}`           |
| `colors.glyph.on-status.success`         | `{palette.green.7}`                | `{palette.green.11}`               |
| `colors.glyph.on-status.warning`         | `{palette.yellow.7}`               | `{palette.yellow.11}`              |
| `colors.text.on-surface.link-disabled`   | `{palette.blue.5}`                 | `{palette.blue.3}`                 |
| `colors.text.on-brand.disabled`          | `{palette.transparent.inverted.1}` | `{palette.transparent.inverted.0}` |
| `colors.focus.brand`                     | `{palette.blue.6}`                 | `{palette.blue.4}`                 |

**New tokens:**

| token                                   | value                 |
| --------------------------------------- | --------------------- |
| `colors.background.brand.primary-focus` | `{palette.blue.10}`   |
| `colors.background.status.ai`           | `{palette.violet.1}`  |
| `colors.background.status.ai-hover`     | `{palette.violet.2}`  |
| `colors.background.status.ai-pressed`   | `{palette.violet.3}`  |
| `colors.background.inverted.disabled`   | `{palette.blue.11}`   |
| `colors.glyph.on-surface.brand`         | `{palette.blue.13}`   |
| `colors.glyph.on-status.ai`             | `{palette.violet.11}` |

**Metadata-only:** `typography.link.default` and
`typography.link.default-underline` — the Figma text styles were re-created, so
`com.figma.styleId` is refreshed; composite values are unchanged. The remaining
16 typography tokens and the 95 color tokens not listed above are unchanged
apart from the `brand-b` key removal.
