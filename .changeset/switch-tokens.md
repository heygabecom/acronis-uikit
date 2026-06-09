---
'@acronis-platform/ui-react': patch
---

Re-theme `Switch` to the design's `--ui-switch-*` token tier. It now matches the
Figma component: a 32×16 track with a 12px circle, green `--ui-switch-background-active`
(on) / `--ui-switch-background-inactive` (off) / dedicated disabled tokens
(replacing the placeholder shadcn `bg-primary`/`bg-input` colors and
`opacity-50` disabled), with a 3px `--ui-focus-primary` focus ring. No API
change. Also completes the Figma Code Connect mapping.
