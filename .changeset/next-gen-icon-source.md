---
'@acronis-platform/icons-svg-next': minor
'@acronis-platform/figma-icons-fetcher': minor
---

Add `@acronis-platform/icons-svg-next`, a source-only package of raw SVG icons
(plus per-category manifests) pulled from the shadcn-uikit Figma file.

To support it, `figma-icons-fetcher` gains pluggable node-selection strategies
(`frames-by-name`, `new-frames`), a `FIGMA_FETCHER_SKIP_MISSING_IMAGES` option,
and flat (`/`-collapsed) category manifest filenames. The default
`frames-by-name` behavior used by `icons-svg` is unchanged.
