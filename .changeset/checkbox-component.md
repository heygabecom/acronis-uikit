---
'@acronis-platform/ui-react': minor
---

Add `Checkbox`: a Base UI checkbox wrapper supporting checked, unchecked, and
indeterminate states (check / minus glyphs). Colors and geometry are wired to
the shared `--ui-form-*` token tier from `@acronis-platform/tokens-pd`, with the
glyph tinted by `--ui-glyph-on-brand-primary` and the focus ring by
`--ui-focus-primary`; the disabled state always wins over the checked /
indeterminate fill. Includes tests, Storybook stories, visual-regression
baselines, and a Figma Code Connect mapping. The `form` token tier is now
imported in `src/styles/index.css`.
