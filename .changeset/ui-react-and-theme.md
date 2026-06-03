---
'@acronis-platform/ui-react': minor
'@acronis-platform/design-theme': minor
---

Introduce two new published packages:

- `@acronis-platform/design-theme` — generates consumable CSS / SCSS / JS theme
  artifacts from `@acronis-platform/design-tokens` via Style Dictionary, resolving
  the per-scheme (light/dark) and per-brand token matrix into `--av-*` CSS
  custom properties.
- `@acronis-platform/ui-react` — the next-generation Acronis React
  component library built on Base UI (`@base-ui/react`) and themed by
  `@acronis-platform/design-theme`. Ships `Button` and `Switch` with tests and
  Storybook stories as the reference pattern.
