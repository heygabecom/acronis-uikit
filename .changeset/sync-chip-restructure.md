---
'@acronis-platform/design-tokens': minor
'@acronis-platform/tokens-pd': minor
'@acronis-platform/ui-react': patch
---

Sync design tokens with Figma.

Replaces the `Chips` component token group with the new `Chip` structure
(`_global` box/border/icon geometry + colors, per-variant label colors). Migrates
the ui-react `Chip` component (and its spec/tests) off the old `--ui-chips-*`
tokens onto the new `--ui-chip-*` names — a like-for-like rename with no rendered
change.
