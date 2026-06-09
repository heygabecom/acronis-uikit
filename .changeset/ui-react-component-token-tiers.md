---
'@acronis-platform/ui-react': patch
---

Fix unstyled components: `src/styles/index.css` only imported the semantic
token tier from `@acronis-platform/tokens-pd`, so the per-component token tiers
(opt-in) were never loaded and every `--ui-button-*` / `--ui-button-icon-*` /
`--ui-switch-*` / `--ui-breadcrumb-*` reference resolved to nothing. Import the
`button`, `switch`, and `breadcrumb` component tiers so the shipped library CSS
(`@acronis-platform/ui-react/styles`) actually carries the component tokens.
