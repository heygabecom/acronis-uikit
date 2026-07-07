---
'@acronis-platform/ui-react': major
---

SidebarSecondary: resizable sidebar, auto breadcrumb, Resizable handle redesign

**Resizable sidebar (Figma 4449:21298):**

- New `resizable` prop enables a draggable edge on the right border
- Drag to resize between 256–512px; drag past 128px threshold to collapse
- Click edge to collapse/expand; double-click to reset to 256px default
- Width persists across collapse/expand cycles

**Collapsed breadcrumb auto-wiring:**

- `SidebarSecondaryCollapsedBreadcrumb` is now rendered automatically by the
  root — consumers no longer need to place it manually
- Labels auto-derived from `SidebarSecondaryHeader` and selected
  `SidebarSecondaryMenuItem` via context
- Removed from the public API (internal implementation detail)

**Resizable handle redesign (Figma 4649:6681):**

- Remove grab-bar pill (`withHandle` prop dropped)
- Idle border via `--ui-border-on-surface-border`, highlights on hover/active
- 9px hit area (1px line + 4px padding per side)

**i18n — no hardcoded English in published components:**

- New `resizeAriaLabel`, `resizeTooltipExpanded`, `resizeTooltipCollapsed` props
  on `SidebarSecondary` (default to English)
- New `expandTooltip` prop on `SidebarSecondaryCollapseTrigger` (default `'Expand'`)
- New `extras` prop on `SidebarSecondaryCollapseTrigger` (trailing slot for shortcut hints, etc.)
- New "Localized resize labels (es)" Storybook story demonstrates usage

**Storybook:**

- Interactive controls wired to Default story
- `resizable` prop exposed in argTypes; `width`/`onWidthChange` hidden
