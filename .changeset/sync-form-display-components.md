---
'@acronis-platform/design-tokens': minor
'@acronis-platform/tokens-pd': minor
'@acronis-platform/ui-react': patch
---

Sync design tokens with Figma.

- **Avatar**: moves `_global.borderRadius` into `_global.avatar.border.borderRadius` (aligns token path with the component structure).
- **Checkbox**: renames `marginX` to `marginY`.
- **Radio**: renames `marginX` to `marginY`.

Regenerates tokens-pd and migrates the ui-react consumers (Avatar → `--ui-avatar-global-avatar-border-border-radius`, Checkbox → `--ui-checkbox-global-box-margin-y`) and their specs — like-for-like renames, no rendered change.
