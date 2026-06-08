# @acronis-platform/icons-sprite

Optimized SVG sprites generated from
[`@acronis-platform/icons-svg`](../icons-svg). Three flavors are produced into
`sprites/` and committed:

| File                   | Contents                           | `<use>` id prefix |
| ---------------------- | ---------------------------------- | ----------------- |
| `iconsprite.svg`       | All icons (monocolor + multicolor) | `m-` / `c-`       |
| `iconsprite-mono.svg`  | Monocolor icons only               | `m-`              |
| `iconsprite-multi.svg` | Multicolor icons only              | `c-`              |

- **Monocolor** symbols have their fills rewritten to `currentColor`, so they
  inherit the CSS `color` of the element.
- **Multicolor** symbols keep their original colors.
- Symbol ids follow `\<prefix>-\<icon-name>--\<size>`, e.g. `m-add--16`,
  `c-status-ok--24`.

## Usage

### Inline `<use>`

```html
<!-- Load a sprite once (hidden), then reference symbols by id -->
<div hidden>
  <svg><use href="/path/to/iconsprite-mono.svg" /></svg>
</div>

<svg class="icon" style="color: #0073e6;">
  <use href="#m-add--16" />
</svg>
```

### Import the sprite URL (bundler)

```ts
import monoSprite from '@acronis-platform/icons-sprite/iconsprite-mono.svg';
import multiSprite from '@acronis-platform/icons-sprite/iconsprite-multi.svg';

// <use href={`${monoSprite}#m-add--16`} />
```

### React

```tsx
import sprite from '@acronis-platform/icons-sprite/iconsprite.svg';

export function Icon({
  id,
  size = 24,
  ...props
}: {
  id: string;
  size?: number;
}) {
  return (
    <svg width={size} height={size} {...props}>
      <use href={`${sprite}#${id}`} />
    </svg>
  );
}

// <Icon id="m-add--16" /> · <Icon id="c-status-ok--24" />
```

A standalone browser demo lives in [`demo.html`](./demo.html) — open it directly
(no build step) to browse and test icons.

## Building

```bash
pnpm --filter @acronis-platform/icons-sprite build
```

`scripts/generate-sprite.ts` reads `@acronis-platform/icons-svg`'s
`monocolor-icons/` and `multicolor-icons/` sources, wraps each into a
`<symbol>`, and SVGO-optimizes the result. The generated `sprites/*.svg` files are
**committed**, so consumers don't need to build. Re-run the build whenever the
upstream icons change (e.g. after an `icons-svg` Figma sync).

## Accessibility

Give meaningful icons a label, and hide decorative ones:

```html
<svg class="icon" role="img" aria-label="Add"><use href="#m-add--16" /></svg>
<svg class="icon" aria-hidden="true"><use href="#m-add--16" /></svg>
```
