---
'@acronis-platform/design-tokens': minor
---

**BREAKING** components-tier fresh start from the `shadcn-uikit` Figma file
(`Brand/components` group) on 2026-06-12. `tiers/components.json` is rebuilt from
scratch against Figma's new component structure: **every one of the 246 existing
tokens is removed** and **222 new tokens** are emitted. No old→new rename
matching is attempted even where names overlap (e.g. `button._global.gap`) — this
is a clean replacement, so **every consumer of `tiers/components.json` must
re-map**. Companion to the semantic-tier sync changeset; together they land a
consistent `tiers/` tree.

This changeset folds in a follow-up **ButtonIcon** correction sync (also
2026-06-12) plus the new primitive + semantic tokens it depends on — see
**ButtonIcon `_global` refactor + transparent tokens** below. Those are the net
unreleased `tiers/` delta, so `tokens-pd` **is** rebuilt from this state (its
companion `@acronis-platform/tokens-pd` changeset).

**Scope.** Only four components are pulled in this sync: **Button, ButtonIcon,
SidebarPrimary, SidebarSecondary**. The other `Brand/components` children
(`Breadcrumb`, `Checkbox`, `Input`, `MenuItem`, `Switch`, `Tag`, `Tooltip`,
`SidebarSecondary (not ready)`) are deferred to future syncs, and the legacy
`Brand/componentLegacy` structure is ignored entirely.

**Deleted — full removal of the previous `components.json` (246 tokens, 11 components):**

| component    | tokens |
| ------------ | ------ |
| `breadcrumb` | 5      |
| `button`     | 119    |
| `chip`       | 4      |
| `form`       | 36     |
| `icon`       | 6      |
| `item`       | 19     |
| `menu-item`  | 14     |
| `switch`     | 15     |
| `tag`        | 5      |
| `tooltip`    | 7      |
| `tree`       | 16     |

Removing these also clears the 11 dangling aliases the prior semantic sync left
behind (the tokens that still pointed at `{colors.background.status-inverted.*}`
and `{colors.glyph.on-status.on/off}`): they disappear with their referencing
tokens, so the cross-tier alias chain is fully consistent after this sync (0
unresolved aliases). The old tokens also still carried a `values.brand-b` mode;
the fresh pull is single-mode `acronis`, completing the `brand-b` removal across
the whole `tiers/` tree.

**New — pulled from `Brand/components` (222 tokens, 4 components, after the
ButtonIcon correction below):**

| component           | tokens |
| ------------------- | ------ |
| `button`            | 101    |
| `button-icon`       | 18     |
| `sidebar-primary`   | 48     |
| `sidebar-secondary` | 55     |

`$type` mix of the new tokens: 131 `color` · 71 `dimension` · 9 `typography` ·
4 `string` · 4 `gradient` · 3 `strokeStyle`.

**Native Figma structure.** `Brand/components` now nests interaction states
(`color/idle`, `color/hover`, `color/active`, `color/disabled`) and has real
`_global` groups, so the previous emitter's "move direct leaves into `_global`"
and "`<prefix>-<state>` → `<prefix>.<state>` regroup" passes are gone. The tree
is emitted as-is; only the fixed state ordering (`idle → hover → active →
disabled`) is reapplied after the alphabetic sort. Figma's PascalCase/camelCase
names canonicalize to kebab-case code paths (`ButtonIcon` → `button-icon`,
`SidebarPrimary` → `sidebar-primary`, `MenuItem` → `menu-item`, `borderColor` →
`border-color`, `paddingX` → `padding-x`, `textStyle` → `text-style`, …);
`_global` is preserved verbatim (sorts first).

**Mocked values decoded** (Figma technical limitations, resolved on emit):

- **Transparent colors (8):** the remaining `#FF00FF00` / `#FFFFFF00` mocks (all
  on `Button`) still stand in for CSS `transparent`, stored as
  `{ colorSpace: "hsl", components: [0, 0, 0], alpha: 0 }`. ButtonIcon's former
  inline transparents now alias the real `{colors.background.transparent}` /
  `{colors.border.transparent}` semantics instead (see below).
- **Typography (9):** `textStyle` `string` variables alias the semantic
  typography composites — `{typography.body.strong}`, `{typography.body.default}`,
  `{typography.headings.title}` — emitted as `$type: "typography"`.
- **Gradients (4):** `container/color/*` on `Button/ai` reference the new
  `gradients.ai.*` root (see the semantic changeset) and are emitted as
  `$type: "gradient"` aliases.
- **Border styles (3):** `borderStyle` `string` variables → `$type: "strokeStyle"`,
  value `"solid"` (spec-conformant).
- **Text decoration (4):** per-state `textDecoration` `string` variables
  (`button.ghost.label.text-decoration.{idle,hover,active,disabled}`, values
  `"none"`/`"underline"`) are emitted as `$type: "string"`.

**Schema change — `"string"` added to the `$type` enum.** DTCG 2025.10 has no
string type, so this is a documented divergence in `schemas/tokens.schema.json`
(and `context/spec.md`) needed by the four per-state `textDecoration` tokens. The
`com.figma.cssGradient` extension key (raw CSS gradient string) is already
permitted by the `com.figma.*` pattern and is documented in `context/spec.md`.

**One component→primitive direct alias (noted for the record):**
`button.inverted.container.border-color.disabled` →
`{palette.transparent.inverted.9}`, straight from Figma with no intervening
semantic role. Synced as-is (Figma is the source of truth); a semantic role can
be introduced in Figma later.

**ButtonIcon `_global` refactor + transparent tokens** (follow-up sync, folded
in here because the fresh-start shape it corrects never shipped). The first pull
emitted ButtonIcon as parallel `secondary` and `ghost` variants whose container
fill, icon color/size, border-radius, height, and padding-x were duplicated
byte-for-byte, with raw-transparent fills inlined as `#FFFFFF00` mocks. Figma was
restructured and re-pulled; ButtonIcon drops from 34 → **18** tokens:

- **Shared `_global` group (12 tokens).** The properties that were identical
  across both variants are promoted to `button-icon._global.{container,icon}.*`
  (container `color.{idle,hover,active,disabled}`, `border-radius`, `height`,
  `padding-x`; icon `color.{idle,hover,active,disabled}`, `size`) and shared by
  every variant.
- **`secondary` is border-only (6 tokens).** It keeps just its border overrides
  — `border-color.{idle,hover,active,disabled}`, `border-style`, `border-width`.
  `border-color.hover` / `border-color.active` now alias
  `{colors.border.transparent}` (was an inlined raw-transparent literal, same
  resolved value).
- **`ghost` removed entirely (was 14 tokens).** Ghost now renders from `_global`
  with no border override, so it needs no dedicated tokens.
- **`padding-y` and `width-min` dropped.** ButtonIcon no longer defines either in
  any group (confirmed absent in Figma).
- **Container idle/disabled fills** now alias `{colors.background.transparent}`.

**New primitive — `palette.transparent.clear`.** A real 0-alpha "clear" stop
(`hsl 300 100 50 / 0`, the `#FF00FF00` mock promoted to a first-class primitive),
light + dark. Palette names are internal plumbing, so this is additive.

**New semantics — `colors.background.transparent`, `colors.border.transparent`.**
Two new semantic tokens, both aliasing `{palette.transparent.clear}`, that
replace the old practice of inlining raw `transparent` on component tokens.
Additive (new `--ui-*` tokens). ButtonIcon is their first consumer.

**`tokens-pd` is rebuilt from this state** (companion
`@acronis-platform/tokens-pd` changeset). `tools/style-dictionary` now handles
`$type: "string"`, `strokeStyle`, gradient aliases, and typography aliases on
component tokens, so the rebuild the original fresh-start deferred is done and the
generated output reflects the current `tiers/` tree.
