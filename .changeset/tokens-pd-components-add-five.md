---
'@acronis-platform/tokens-pd': patch
---

Rebuild from the `design-tokens` sync that adds five components (`breadcrumb`,
`checkbox`, `input`, `switch`, `tag`) — companion to the
`@acronis-platform/design-tokens` changeset. **Purely additive**: the build emits
new per-component artifacts and changes no existing output.

**Added (additive — new entry points consumers can opt into):**

- **Per-component CSS:** `css/{breadcrumb,checkbox,input,switch,tag}/acronis.css`.
- **Per-component Tailwind presets:** `tailwind/acronis/components/{breadcrumb,checkbox,input,switch,tag}.js` (+ `.d.ts`).
- **DTCG view:** `dtcg/components-acronis.json` gains the five new component roots.

The base `css/acronis.css`, the existing component tiers (`button`, `button-icon`,
`sidebar-primary`, `sidebar-secondary`), the base `tailwind/acronis/tokens.js`, and
the primitives/semantics DTCG views are **byte-identical** — no `--ui-*` token was
removed, renamed, or re-pointed. No consumer (`ui-react`, kitchen-sink) needs a code
change; `@theme inline` re-reads the new `var(--ui-*)` at paint time.

**Build-tooling fix (private `@acronis-platform/style-dictionary`, no published
change).** The Tailwind color router (`routeColor`) is now **tier-scoped**: a
semantic token routes against the semantic `com.acronis.tailwindRoles` map only,
while a component token routes against the merged (semantic + component) map. This
lets a component element reuse a name that exists as a semantic _token segment_
without shadowing semantic routing — specifically, the new `error` →
`textColor` component role (the input error-message text →
`text-input-error-error`) no longer hijacks the semantic `colors.focus.error`
token, which keeps routing to `ring-error`. Previously the shared global role map
required segment names to be disjoint across tiers; that fragility is removed on the
semantic side. Covered by the tool's existing `routeColor` unit tests (100 pass).
