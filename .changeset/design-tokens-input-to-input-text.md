---
'@acronis-platform/design-tokens': minor
---

**BREAKING:** Rename `input` component tokens to `input-text` and restructure token tree

The entire `input.*` component token namespace (40 tokens) has been removed and replaced with `input-text.*` (33 tokens), mirroring the Figma component rename from `Input` to `InputText`.

### Deleted paths (40 tokens)

| Deleted path                               | Last value                                 |
| ------------------------------------------ | ------------------------------------------ |
| `input._global.box.border-radius`          | `{units.radius.4}`                         |
| `input._global.box.border-width`           | `{units.stroke.1}`                         |
| `input._global.box.color.idle`             | `{colors.background.surface.primary}`      |
| `input._global.box.color.hover`            | `{colors.background.surface.primary}`      |
| `input._global.box.color.active`           | `{colors.background.surface.primary}`      |
| `input._global.box.color.disabled`         | `{colors.background.surface.secondary}`    |
| `input._global.box.gap`                    | `{units.gap.12}`                           |
| `input._global.box.height`                 | `{units.size.32}`                          |
| `input._global.box.padding-x`              | `{units.gap.12}`                           |
| `input._global.box.padding-y`              | `{units.gap.4}`                            |
| `input._global.container.gap`              | `{units.gap.4}`                            |
| `input._global.container.width-min`        | `{units.size.224}`                         |
| `input._global.container-label.gap`        | `{units.gap.4}`                            |
| `input._global.label.color.idle`           | `{colors.text.on-surface.primary}`         |
| `input._global.label.color.hover`          | `{colors.text.on-surface.primary}`         |
| `input._global.label.color.active`         | `{colors.text.on-surface.primary}`         |
| `input._global.label.color.disabled`       | `{colors.text.on-surface.disabled}`        |
| `input._global.label.text-style`           | `{typography.body.default}`                |
| `input._global.required.color`             | `{colors.text.on-surface.destructive}`     |
| `input._global.required.text-style`        | `{typography.body.default}`                |
| `input.content.placeholder.color.idle`     | `{colors.text.on-surface.secondary}`       |
| `input.content.placeholder.color.hover`    | `{colors.text.on-surface.secondary}`       |
| `input.content.placeholder.color.active`   | `{colors.text.on-surface.secondary}`       |
| `input.content.placeholder.color.disabled` | `{colors.text.on-surface.disabled}`        |
| `input.content.text-style`                 | `{typography.body.default}`                |
| `input.content.value.color.idle`           | `{colors.text.on-surface.primary}`         |
| `input.content.value.color.hover`          | `{colors.text.on-surface.primary}`         |
| `input.content.value.color.active`         | `{colors.text.on-surface.primary}`         |
| `input.content.value.color.disabled`       | `{colors.text.on-surface.disabled}`        |
| `input.error.box.border-color.idle`        | `{colors.border.on-surface.border-error}`  |
| `input.error.box.border-color.hover`       | `{colors.border.on-surface.border-error}`  |
| `input.error.box.border-color.active`      | `{colors.border.on-surface.border-error}`  |
| `input.error.error.color`                  | `{colors.text.on-surface.destructive}`     |
| `input.error.error.text-style`             | `{typography.caption.default}`             |
| `input.normal.box.border-color.idle`       | `{colors.border.on-surface.border}`        |
| `input.normal.box.border-color.hover`      | `{colors.border.on-surface.border-active}` |
| `input.normal.box.border-color.active`     | `{colors.border.on-surface.border-active}` |
| `input.normal.box.border-color.disabled`   | `{colors.border.on-surface.border}`        |
| `input.normal.description.color`           | `{colors.text.on-surface.secondary}`       |
| `input.normal.description.text-style`      | `{typography.caption.default}`             |

### Added paths (33 tokens)

| Added path                                    | Value                                                                            |
| --------------------------------------------- | -------------------------------------------------------------------------------- |
| `input-text._global.box.border-radius`        | `{units.radius.4}`                                                               |
| `input-text._global.box.border-width`         | `{units.stroke.1}`                                                               |
| `input-text._global.box.color.idle`           | `{colors.background.surface.primary}`                                            |
| `input-text._global.box.color.hover`          | `{colors.background.surface.primary}`                                            |
| `input-text._global.box.color.disabled`       | `{colors.background.surface.secondary}`                                          |
| `input-text._global.box.gap`                  | `{units.gap.12}`                                                                 |
| `input-text._global.box.height`               | `{units.size.32}`                                                                |
| `input-text._global.box.padding-x`            | `{units.gap.12}`                                                                 |
| `input-text._global.box.padding-y`            | `{units.gap.4}`                                                                  |
| `input-text._global.clear-icon.color`         | `{colors.glyph.on-surface.primary}` _(new token)_                                |
| `input-text._global.container.gap`            | `{units.gap.4}`                                                                  |
| `input-text._global.container.width-min`      | `{units.size.128}` _(was `{units.size.224}`)_                                    |
| `input-text._global.container-label.gap`      | `{units.gap.4}`                                                                  |
| `input-text._global.label.color.idle`         | `{colors.text.on-surface.primary}`                                               |
| `input-text._global.label.color.hover`        | `{colors.text.on-surface.primary}`                                               |
| `input-text._global.label.color.disabled`     | `{colors.text.on-surface.disabled}`                                              |
| `input-text._global.label.text-style`         | `{typography.body.default}`                                                      |
| `input-text._global.placeholder.color`        | `{colors.text.on-surface.secondary}` _(was 4 per-state tokens)_                  |
| `input-text._global.required.color`           | `{colors.text.on-surface.destructive}`                                           |
| `input-text._global.required.text-style`      | `{typography.body.default}`                                                      |
| `input-text._global.value.color.idle`         | `{colors.text.on-surface.primary}`                                               |
| `input-text._global.value.color.hover`        | `{colors.text.on-surface.primary}`                                               |
| `input-text._global.value.color.disabled`     | `{colors.text.on-surface.secondary}` _(was `{colors.text.on-surface.disabled}`)_ |
| `input-text._global.value.text-style`         | `{typography.body.default}`                                                      |
| `input-text.error.box.border-color.idle`      | `{colors.border.on-surface.border-error}`                                        |
| `input-text.error.box.border-color.hover`     | `{colors.border.on-surface.border-error}`                                        |
| `input-text.error.error.color`                | `{colors.text.on-surface.destructive}`                                           |
| `input-text.error.error.text-style`           | `{typography.caption.default}`                                                   |
| `input-text.normal.box.border-color.idle`     | `{colors.border.on-surface.border}`                                              |
| `input-text.normal.box.border-color.hover`    | `{colors.border.on-surface.border-active}`                                       |
| `input-text.normal.box.border-color.disabled` | `{colors.border.on-surface.border}`                                              |
| `input-text.normal.description.color`         | `{colors.text.on-surface.secondary}`                                             |
| `input-text.normal.description.text-style`    | `{typography.caption.default}`                                                   |

### Structural changes (Input → InputText redesign)

- **`active` interaction state removed** from `box.color`, `label.color`, `value.color`, `error.box.border-color`, `normal.box.border-color` — 5 tokens dropped
- **Placeholder consolidated** — 4 per-state `content.placeholder.color.*` tokens replaced by a single stateless `_global.placeholder.color` token
- **`content` group flattened** — `content.{text-style,value.*}` moved to `_global.value.*`
- **`clear-icon.color` added** — new glyph token for the clear button icon

### Also in this release

- `tag._global.md.icon.border-width` added (`{units.stroke.1}`) — additive, no migration needed

### Migration

Any code aliasing `{input.*}` or `{input.content.*}` must be updated:

```
{input.*}          → {input-text.*}
{input.content.placeholder.color.idle}   → {input-text._global.placeholder.color}
{input.content.placeholder.color.hover}  → {input-text._global.placeholder.color}
{input.content.text-style}               → {input-text._global.value.text-style}
{input.content.value.color.*}            → {input-text._global.value.color.*}
```
