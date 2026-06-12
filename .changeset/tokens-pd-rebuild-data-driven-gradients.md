---
'@acronis-platform/tokens-pd': minor
---

**BREAKING** — full regeneration from `@acronis-platform/design-tokens` after the
2026-06-12 semantic + components Figma syncs. This is the rebuild those token
changesets deferred ("do not rebuild `tokens-pd` from this state yet"): the
`tools/style-dictionary` work it was waiting on is done, so the generated output
now reflects the current `tiers/` tree. The `--ui-*` and Tailwind consumer
surface changes substantially — **every consumer must re-check token names.**

**DTCG intermediate (`dtcg/`).**

- `dtcg/semantic-<brand>.json` → **`dtcg/semantics-<brand>.json`** (renamed to the
  plural tier identifier).
- `dtcg/semantic-brand-b.json` and `dtcg/components-brand-b.json` **removed** — the
  source is single-brand (`acronis`) after the `brand-b` removal.

**Components (`css/<component>/`, `tailwind/<brand>/components/`).** The component
set is replaced wholesale, mirroring the `components.json` fresh start:

- **Removed (11):** `breadcrumb`, `chip`, `form`, `icon`, `item`, `menu-item`,
  `switch`, `tag`, `tooltip`, `tree`, plus the old `button` structure.
- **Added (4):** `button`, `button-icon`, `sidebar-primary`, `sidebar-secondary`,
  emitted from the new nested Figma structure — names are now
  `--ui-<component>-<variant>-<part>-<state>` (e.g.
  `--ui-button-primary-container-color-idle`,
  `--ui-button-ghost-label-text-decoration-idle`).
- New scalar token types now emit: `string` `text-decoration`
  (`--ui-…-text-decoration: underline|none`), `strokeStyle` `border-style`
  (`… : solid`), and component typography aliases (`text-style` → the
  `.ui-typography-*` classes / Tailwind `fontFamily`+`fontSize`).

**Gradients relocated.** `colors.background.ai.*` is gone; the four AI gradients
now live under the top-level `gradients.*` root:

- CSS: `--ui-background-ai-*` → **`--ui-gradients-ai-*`**, emitted in the **root**
  semantic CSS (`css/<brand>.css`) as theme-invariant custom properties.
- Tailwind: gradients move into the **base** preset (`tailwind/<brand>/tokens.js`)
  `backgroundImage` namespace (`bg-ai-idle`, `bg-ai-hover`, …) rather than a
  separate `gradients` component preset.

**Tailwind routing is now data-driven.** The color/gradient → namespace mapping is
authored in `design-tokens` as the root-level `com.acronis.tailwindRoles`
extension and read at build time, replacing the hardcoded maps in the tool.
Semantic-tier keys are unchanged in shape (`bg-surface-primary`, `ring-brand`,
`fill-on-surface-primary`); component-tier keys keep their descriptive part word
(`bg-button-primary-container-idle`).

**`brand-b` outputs removed.** With the source back to a single `acronis` mode,
all `brand-b` override files (`css/**/brand-b.css`, `tailwind/brand-b/**`) are
gone; they return automatically, data-driven, when a real second brand is
authored.
