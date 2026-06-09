---
'@acronis-platform/ui-react': minor
---

Add `Search`: a search field — a leading magnifier (`SearchIcon`), a borderless
text input, and a clear (×) button that appears once there's a value. Themed by
the shared `--ui-form-*` token tier; the box owns the visual state via
`focus-within` (active border + 3px `--ui-focus-primary` ring), with hover and
disabled wired to their own tokens. The clear button empties the field (firing
`onChange` with an empty value plus `onClear`) and refocuses the input. Includes
tests, Storybook stories, visual-regression baselines, and a Figma Code Connect
mapping.
