---
'@acronis-platform/design-tokens': minor
---

Full Figma → tokens re-sync. Regenerated `primitives.json`, `semantic.json`, and
`components.json` from the current Figma state via the documented sync workflow
(`context/figma-sync.md`). The JSON now mirrors Figma exactly; removed/renamed
paths were accepted rather than aliased.

**Added**

- `components.button.icon.*` (16) — new icon-button color group: `background` /
  `border` / `icon` / `label` × `idle` / `hover` / `active` / `disabled`,
  mirroring the `ghost` group. (Backs the Figma `ButtonIcon` component, which was
  rebound to these variables.)
- `components.switch.*` (16) — switch promoted to its own top-level component
  (`background` / `border` / `circle` states + `units.*`), moved out of `form`.
- `components.item.*` (~30) — expanded successor to `sub-item` (adds `gap-x` /
  `gap-y`, `height-min`, `padding-x-small`).
- `components.form.{background,border,icon,circle,units}.*` (~30) — restructured
  form tokens with a sized scale (`sm` / `md` / `lg` / `xlg`).
- `colors.focus.{brand,error,primary,secondary}` (4) — new focus-ring colors.
- `typography.{body.form-label, link.default, link.default-underline, link.strong,
link.strong-underline}` (5).

**Changed values**

- **`brand-b` is now authored (teal).** 25 `semantic.colors.*` tokens flipped
  their `brand-b` mode from `{palette.blue.*}` to `{palette.teal.*}`; the
  `acronis` mode is unchanged. Previously `brand-b` mirrored `acronis`; designers
  have now given it its own palette. This also refreshes 29 `components.button.*`
  values that alias those semantics.
- `palette.blue.7` dark-mode lightness `45.1 → 54.9` (light mode unchanged).
- `button._global.padding-x` and `button._global.radius` updated.
- Typography: `note.default` / `note.heading` now alias `{font.font-size.11}`
  instead of an inline `11px`; `headings.display` letter-spacing refreshed.

**Changed metadata**

- `units.stroke.3` is now scoped to **`EFFECT_FLOAT`** only
  (`$extensions.com.figma.scopes`); previously it also carried `STROKE_FLOAT`.
  The token value is unchanged — this only affects which Figma properties the
  variable is offered for.

**Removed / renamed (breaking for consumers of the old paths)**

These paths no longer exist in Figma. Most are renames — migrate references:

- `form.input.*` → `form.background` / `form.border` / `form.icon.*` (same values).
- `form.switch.*` → top-level `switch.*` (same values).
- `form._global.*` → `form.units.*` — not 1:1; single values replaced by the
  sized scale (e.g. height `32` → `units.height-lg` `48`, radius `4` →
  `units.radius-lg` `24`).
- `sub-item.*` → `item.*` (values largely identical; some `brand-b` values differ
  due to teal authoring).
- `typography.body.link`, `typography.body.strong-underlined`,
  `typography.link.primary`, `typography.link.secondary` → renamed under
  `typography.link.{default,default-underline,strong,strong-underline}`.

No successor (genuinely dropped): `sub-item.gap` (split into `item.gap-x` /
`item.gap-y`), `sub-item.height-header`, `sub-item.width-collapsed`.
