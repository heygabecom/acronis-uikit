# AppShellChat — Accessibility Requirements

A layout scaffold. It contributes little ARIA of its own — the rich landmarks
(`nav`) come from the SidebarPrimary / SidebarSecondary dropped into its rail
slot. Its own interactive part is the Chat resize edge.

## ARIA Roles and Attributes

### Root (`div`)

| Attribute   | Value            | Reason               |
| ----------- | ---------------- | -------------------- |
| `data-slot` | `app-shell-chat` | Styling / query hook |

### Sidebar / Content / Chat regions

`<aside>` for the sidebar rail and the Chat panel; `<div>` for the Content
column. Consumers may add `aria-label` to the Chat `<aside>` to name the region.

### Resize edge (`role="separator"`)

| Attribute          | Value             | Reason                                    |
| ------------------ | ----------------- | ----------------------------------------- |
| `role`             | `separator`       | Exposes the draggable boundary            |
| `aria-orientation` | `vertical`        | The boundary is vertical                  |
| `aria-label`       | `resizeAriaLabel` | Names the control (default "Resize chat") |
| `tabindex`         | `0`               | Keyboard-focusable for arrow-key resize   |

### Chat header (at the min width)

At the 48px floor, the header shows only the Acronis mark. The mark carries an
accessible name (from the string `label`) and the full label is shown on hover
via a tooltip; no visible text is rendered in the rail.

---

## Keyboard Navigation

| Key               | Element     | Action                                 |
| ----------------- | ----------- | -------------------------------------- |
| Tab / Shift+Tab   | any         | Moves focus between interactive parts  |
| ArrowLeft / Right | resize edge | Resizes Chat by 16px (inverted in RTL) |
| Home              | resize edge | Resets Chat width to 512px             |

Arrow-key directions are logical: growing Chat moves the boundary toward the
row's start, so the grow key is ArrowLeft in LTR and ArrowRight in RTL. There is
no Enter/Space action — the resize edge has no toggle, only resize.

---

## Focus

The resize edge shows a focus ring using `--ui-focus-primary`, visible against
the panel surface.

---

## Color and Contrast

| Element                          | Minimum Ratio | Standard               |
| -------------------------------- | ------------- | ---------------------- |
| Chat header title vs surface     | 4.5:1         | WCAG 1.4.3 (AA)        |
| Content/Chat seam (resize state) | 3:1           | WCAG 1.4.11 (non-text) |
| Focus indicators                 | 3:1           | WCAG 1.4.11            |

---

## Testing Checklist

- [ ] Content is always present and can shrink to 0 width; it is never unmounted
- [ ] The resize edge is a `separator` with a name
- [ ] Dragging or using arrows/Home on the resize edge resizes Chat between its
      48px floor and the actual available row width (no fixed cap strands
      Content with a bogus minimum)
- [ ] Chat header at the 48px floor keeps an accessible name (icon) and hides
      the body; both header states share the same height
- [ ] Works in `dir="ltr"` and `dir="rtl"` (logical properties)
