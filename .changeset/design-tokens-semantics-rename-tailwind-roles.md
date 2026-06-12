---
'@acronis-platform/design-tokens': minor
---

**BREAKING** — rename the semantics tier file and add a build-time
`com.acronis.tailwindRoles` routing extension. Two public-surface changes:

**Renamed (BREAKING) — `tiers/semantic.json` → `tiers/semantics.json`.** The tier
file and its `exports` subpath are renamed to match the glossary's plural tier
vocabulary (Primitives, **Semantics**, Components), aligning the code identifier
with the data:

| before                                                         | after                    |
| -------------------------------------------------------------- | ------------------------ |
| `tiers/semantic.json`                                          | `tiers/semantics.json`   |
| `import '@acronis-platform/design-tokens/tiers/semantic.json'` | `…/tiers/semantics.json` |

The `./tiers/semantic.json` export is removed and `./tiers/semantics.json` added;
any consumer importing the old subpath must re-point. The token contents are
unchanged by this rename.

**Added — `com.acronis.tailwindRoles` (root-level `$extensions`).** A new
build-time hint, authored at the **root** of `tiers/semantics.json` and
`tiers/components.json`, that maps a token path segment to the Tailwind theme
namespace the `tools/style-dictionary` build routes it into. It replaces the
hardcoded role→namespace maps that previously lived in the build, so the routing
decision now lives with the tokens:

- `semantics.json`: `background→backgroundColor`, `text→textColor`,
  `border→borderColor`, `glyph→fill`, `focus→ringColor`,
  `gradients→backgroundImage`.
- `components.json` (component parts): `container→backgroundColor`,
  `border-color→borderColor`, `icon→fill`, `label→textColor`, `logo→fill`,
  `external-icon→fill`, `shortcut→textColor`, `icon-separator→fill`,
  `header-label→textColor`, `label-section→textColor`,
  `breadcrumb-label→textColor`, `label-current-page→textColor`.

It is **not** part of any token's value — a tooling-only hint — and is validated
by the new `AcronisTailwindRoles` `$def` in `schemas/tokens.schema.json` (an
object whose values enumerate the six allowed Tailwind namespaces). Documented in
`context/spec.md`. Additive to the schema (the `com.acronis.*` pattern already
permitted the key); no token values change.
