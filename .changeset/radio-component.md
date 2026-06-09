---
'@acronis-platform/ui-react': minor
---

Add `RadioGroup` and `Radio`: a mutually-exclusive option group wrapping Base
UI's RadioGroup / Radio primitives. The group owns the selected value; each
`Radio` takes a `value`. Themed by the shared `--ui-form-*` token tier from
`@acronis-platform/tokens-pd` — the 16px circle uses idle / hover / active /
disabled border + background, the 8px dot uses `--ui-form-circle-active` (and
`--ui-form-circle-disabled` when disabled), and the focus ring uses
`--ui-focus-primary`; the checked fill is scoped with `not-data-[disabled]` so
disabled wins. Includes tests, Storybook stories, visual-regression baselines,
and a Figma Code Connect mapping. Labels are composed by the consumer (a Field
component is future work).
