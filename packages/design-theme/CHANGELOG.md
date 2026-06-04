# @acronis-platform/design-theme

## 0.4.0

### Minor Changes

- [#89](https://github.com/acronis/uikit/pull/89) [`61fe683`](https://github.com/acronis/uikit/commit/61fe68389b42f482fe9f7a07ab0f14ebad6c12d1) Thanks [@leonid](https://github.com/leonid)! - Two additions:
  - **All authored brands** are emitted, not just `acronis`. The default brand
    stays on `:root` / `.dark`; every other brand (currently `brand-b`) is a
    class-scoped override (`.brand-b`, `.brand-b.dark`) containing only the
    tokens that differ, so consumers switch brand by toggling a class. The
    `./js` export now ships `brands`, `defaultBrand`, per-brand `tokens`, and a
    `groups` array (tokens organized by category for display).
  - **Gradient tokens** are now emitted. Color-stop arrays become CSS
    `linear-gradient(...)`, with the angle derived from the Figma
    `com.figma.gradientTransform` matrix (e.g. `colors.background.ai.*`).

  Note: `brand-b` currently produces no overrides — it matches `acronis` on
  every color token and inherits its gradients. The mechanism is ready for when
  the brand data diverges.

## 0.3.0

### Minor Changes

- [#89](https://github.com/acronis/uikit/pull/89) [`61fe683`](https://github.com/acronis/uikit/commit/61fe68389b42f482fe9f7a07ab0f14ebad6c12d1) Thanks [@leonid](https://github.com/leonid)! - Emit **all authored brands**, not just `acronis`. The default brand stays on
  `:root` / `.dark`; every other brand (currently `brand-b`) is generated as a
  class-scoped override (`.brand-b`, `.brand-b.dark`) containing only the tokens
  that differ from the default, so consumers switch brand by toggling a class.
  The `./js` export now ships `brands`, `defaultBrand`, and per-brand `tokens`
  (the existing `light` / `dark` exports remain, pointing at the default brand).

  Note: `brand-b` currently differs from `acronis` only in AI gradient tokens,
  which the color-only build skips, so it produces no overrides yet — the
  mechanism is ready for when the brand data diverges.

## 0.2.0

### Minor Changes

- [#80](https://github.com/acronis/uikit/pull/80) [`1687cc9`](https://github.com/acronis/uikit/commit/1687cc9336de74d53521d8e6ef9097763a0a9bb0) Thanks [@leonid](https://github.com/leonid)! - Introduce two new published packages:
  - `@acronis-platform/design-theme` — generates consumable CSS / SCSS / JS theme
    artifacts from `@acronis-platform/design-tokens` via Style Dictionary, resolving
    the per-scheme (light/dark) and per-brand token matrix into `--av-*` CSS
    custom properties.
  - `@acronis-platform/ui-react` — the next-generation Acronis React
    component library built on Base UI (`@base-ui/react`) and themed by
    `@acronis-platform/design-theme`. Ships `Button` and `Switch` with tests and
    Storybook stories as the reference pattern.
