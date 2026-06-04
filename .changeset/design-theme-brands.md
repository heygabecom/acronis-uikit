---
'@acronis-platform/design-theme': minor
---

Emit **all authored brands**, not just `acronis`. The default brand stays on
`:root` / `.dark`; every other brand (currently `brand-b`) is generated as a
class-scoped override (`.brand-b`, `.brand-b.dark`) containing only the tokens
that differ from the default, so consumers switch brand by toggling a class.
The `./js` export now ships `brands`, `defaultBrand`, and per-brand `tokens`
(the existing `light` / `dark` exports remain, pointing at the default brand).

Note: `brand-b` currently differs from `acronis` only in AI gradient tokens,
which the color-only build skips, so it produces no overrides yet — the
mechanism is ready for when the brand data diverges.
