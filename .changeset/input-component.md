---
'@acronis-platform/ui-react': minor
---

Add `Input`: a single-line text input themed by the shared `--ui-form-*` token
tier from `@acronis-platform/tokens-pd`. Each state is wired to its own token —
idle / hover / focus (active border + a 3px `--ui-focus-primary` ring) /
disabled — and the error state is driven by `aria-invalid` (red border, and a
`--ui-focus-error` ring on focus) scoped so it wins over the hover/focus border.
Includes tests, Storybook stories, visual-regression baselines, and a Figma
Code Connect mapping. Label / description / error message are composed by the
consumer (a Field component is future work).
