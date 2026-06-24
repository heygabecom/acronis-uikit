---
'@acronis-platform/design-tokens': minor
'@acronis-platform/tokens-pd': minor
---

Sync design tokens with Figma.

**Added**

- `InputDatePicker` component tokens (49) across its `_global`, `normal`, and `error` states.
- `InputTextArea` error-message tokens (4).
- `Radio._global.box.marginX` — replaces the removed `marginT` (see Removed).
- Figma `hiddenFromPublishing` flags are applied across all synced tokens.

**Changed**

- ~72 primitive palette values updated across the Light/Dark ramps (blue, orange, electricblue, green, red, transparent, grayscale, violet, yellow, base).
- `Button` `destructive`, `secondary`, and `ai` icon/label colors at their interaction modes.

**Removed**

- `Radio._global.box.marginT` — superseded by the new `marginX`.
