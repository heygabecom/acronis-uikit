---
'@acronis-platform/tokens-pd': minor
---

**BREAKING:** `--ui-input-*` CSS custom properties renamed to `--ui-input-text-*`

The `Input` component was renamed to `InputText` in the design system. All generated CSS custom properties, Tailwind preset keys, and DTCG output paths have been updated accordingly.

### Removed outputs

- `css/input/acronis.css` — deleted; replace imports with `css/input-text/acronis.css`
- `tailwind/acronis/components/input.js` — deleted; replace with `tailwind/acronis/components/input-text.js`
- All `--ui-input-*` custom properties removed

### Added outputs

- `css/input-text/acronis.css` — new per-component CSS file
- `tailwind/acronis/components/input-text.js` — new Tailwind preset
- `--ui-input-text-*` custom properties replace all former `--ui-input-*` names

### Notable value changes (reflected in generated output)

- `--ui-input-text-global-container-width-min`: was `{units.size.224}` → now `{units.size.128}`
- `--ui-input-text-global-value-color-disabled`: was `colors.text.on-surface.disabled` → now `colors.text.on-surface.secondary`
- `--ui-input-text-global-clear-icon-color` added (new)
- `active` interaction-state variants removed from box, label, value, error border, and normal border token groups
- Placeholder: 4 per-state tokens replaced by single `--ui-input-text-global-placeholder-color`

### Migration

Replace all `@import` / `require` references:

```diff
- @import "@acronis-platform/tokens-pd/css/input/acronis.css";
+ @import "@acronis-platform/tokens-pd/css/input-text/acronis.css";
```

```diff
- import inputTokens from "@acronis-platform/tokens-pd/tailwind/acronis/components/input";
+ import inputTokens from "@acronis-platform/tokens-pd/tailwind/acronis/components/input-text";
```

Replace all `--ui-input-` variable references with `--ui-input-text-`.
