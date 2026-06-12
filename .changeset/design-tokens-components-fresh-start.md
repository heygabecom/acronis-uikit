---
'@acronis-platform/design-tokens': minor
---

**BREAKING** components-tier fresh start from the `shadcn-uikit` Figma file
(`Brand/components` group) on 2026-06-12. `tiers/components.json` is rebuilt from
scratch against Figma's new component structure: **every one of the 246 existing
tokens is removed** and **238 new tokens** are emitted. No old→new rename
matching is attempted even where names overlap (e.g. `button._global.gap`) — this
is a clean replacement, so **every consumer of `tiers/components.json` must
re-map**. Companion to the semantic-tier sync changeset; together they land a
consistent `tiers/` tree. Do **not** rebuild `tokens-pd` from this state yet (see
the note at the end).

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

**New — pulled from `Brand/components` (238 tokens, 4 components):**

| component           | tokens |
| ------------------- | ------ |
| `button`            | 101    |
| `button-icon`       | 34     |
| `sidebar-primary`   | 48     |
| `sidebar-secondary` | 55     |

`$type` mix of the new tokens: 139 `color` · 79 `dimension` · 9 `typography` ·
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

- **Transparent colors (14):** `#FF00FF00` (8×) and `#FFFFFF00` (6×) both stand
  in for CSS `transparent`, stored as
  `{ colorSpace: "hsl", components: [0, 0, 0], alpha: 0 }`.
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

**`tokens-pd` is intentionally not rebuilt.** The `design-tokens` alias chain is
consistent, but `tools/style-dictionary` has never seen `$type: "string"`,
`strokeStyle`, gradient aliases, or typography aliases on component tokens — the
rebuild is a follow-up that likely needs style-dictionary transform work. The
drift gate runs only on `tokens-pd` changes, so deferring keeps CI green.
