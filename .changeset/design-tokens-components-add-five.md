---
'@acronis-platform/design-tokens': patch
---

Add five components to the components tier from the `shadcn-uikit` Figma file
(`Brand/components` group), 2026-06-12 follow-up sync. The emitter's `COMPONENTS`
allowlist goes **4 → 9**; **161 new tokens** are added and `tiers/components.json`
grows **222 → 383** leaves. **Purely additive** — the four already-synced components
(`button` 101, `button-icon` 18, `sidebar-primary` 48, `sidebar-secondary` 55) are
byte-stable; nothing is removed, renamed, or re-purposed.

**New components (161 tokens):**

| component    | tokens |
| ------------ | ------ |
| `breadcrumb` | 9      |
| `checkbox`   | 45     |
| `input`      | 40     |
| `switch`     | 28     |
| `tag`        | 39     |

`$type` mix of the new tokens: 109 `color` · 39 `dimension` · 11 `typography` ·
1 `gradient` · 1 `strokeStyle`. Full-file mix after the sync (383 tokens): 240
`color` · 110 `dimension` · 20 `typography` · 5 `gradient` · 4 `strokeStyle` ·
4 `string`.

Every new token aliases an existing semantic (`colors.*`, `gradients.ai.idle`,
`typography.*`) or primitive (`units.*`, `palette.base`) — **0 raw-value gaps**, and
the alias validator confirmed **0 dangling targets** (primitives and semantics are
unchanged by this sync). Figma PascalCase/camelCase canonicalizes to kebab-case
(`borderColor` → `border-color`, `paddingX` → `padding-x`, `textStyle` →
`text-style`, `widthMin` → `width-min`, `marginT` → `margin-t`); `_global` is
preserved and sorts first. Per-component variant ordering for the five new
components uses the emitter's default (`_global` first, then alphabetical) — no
explicit `reorderByList` was added.

**Still out of scope:** `MenuItem`, `Tooltip` (present in `Brand/components`, not
requested) and the legacy `Brand/componentLegacy` group (ignored entirely).

**Mocked values decoded** (Figma technical limitations, resolved on emit):

- **Border style (1):** `switch._global.box.border-style` — Figma `borderStyle`
  `string` variable → `$type: "strokeStyle"`, value `"solid"`.
- **Gradient (1):** `tag.ai.container.border-color` — Figma `string` referencing
  `semantics.gradients` → `$type: "gradient"` alias `{gradients.ai.idle}`.
- No transparent color-literal mocks and no inlined raw HSL in the new set.

**Yellow flag — component→primitive direct aliases (noted for the record):**
`switch._global.tick.color.{idle,hover,active}` → `{palette.base}` (the white
switch tick). Verified live against Figma — all three bind to the `Base` variable;
the `disabled` state correctly aliases the semantic
`{colors.glyph.on-status.disabled}`. There is no "on-status white glyph" semantic to
point at, so `palette.base` is the faithful target. This joins the one pre-existing
yellow flag (`button.inverted.container.border-color.disabled` →
`{palette.transparent.inverted.9}`).

**`primitives.json` / `semantics.json` unchanged.** Re-running their emitters against
the fresh Figma snapshot reproduces the committed files exactly (0 value/type/alias/mode
changes) — those tiers already mirrored Figma.

**Tailwind role map extended.** The hand-authored
`com.acronis.tailwindRoles` hint in `tiers/components.json` (consumed by the
`tokens-pd` build to route component color tokens into Tailwind namespaces) gains
seven entries for the new element words: `box` → `backgroundColor`, `tick` →
`backgroundColor`, and `description` / `required` / `placeholder` / `value` /
`error` → `textColor`. (`error` is a component element word — the input error
message — distinct from the semantic `error` focus variant; see the `tokens-pd`
changeset for the routing change that keeps the two from colliding.)
