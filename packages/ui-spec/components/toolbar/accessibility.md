# Toolbar — Accessibility Requirements

`Toolbar` itself is a layout wrapper — most accessibility concerns are
delegated to its composed children (Button, ButtonMenu). Its own contribution
is the native `disabled` cascade.

## ARIA Roles and Attributes

### Root (`fieldset`)

The root renders as a `<fieldset>`, reset to look like a plain flex container
(no border/margin/padding). A `<fieldset>` carries an implicit ARIA role of
`group` — acceptable for a generic control grouping. `role="toolbar"` is
**not** applied: the WAI-ARIA `toolbar` pattern implies roving-tabindex
keyboard navigation between its controls, which this component does not
implement (each Button/ButtonMenu keeps its own natural Tab stop, matching
`FilterSearch`'s and `DataTableToolbar`'s existing precedent in this kit). A
consumer needing that behavior should add `role="toolbar"` and its own
roving-tabindex handling.

| Attribute    | Value    | Reason                                                    |
| ------------ | -------- | --------------------------------------------------------- |
| No `role`    | —        | Implicit `group` from `<fieldset>`; no roving tabindex    |
| `disabled`   | (opt-in) | Cascades to every nested form control                     |
| `aria-label` | (opt-in) | Consumer may set this for a landmark-like accessible name |

---

## Keyboard Navigation

Keyboard interaction is handled by the child components:

| Component  | Key         | Action                            |
| ---------- | ----------- | --------------------------------- |
| Button     | Enter/Space | Activates the action              |
| ButtonMenu | Enter/Space | Opens/closes the menu it triggers |

The toolbar itself does not manage focus — children keep their natural Tab
order. When `disabled` is set, every nested Button/ButtonMenu is removed from
the Tab order automatically (native `disabled` behavior), so no manual
`tabIndex` management is needed.

---

## Screen Reader Requirements

1. Each child component announces itself according to its own spec.
2. Action buttons should have descriptive labels (e.g. "First action", not
   an icon alone without an accessible name).
3. A selection counter rendered inside `ToolbarActions` should state the
   count in text (e.g. "6 items selected:") so it's announced, not conveyed
   by an icon or color alone.
4. When `disabled` is set, screen readers announce every nested control as
   disabled — no additional `aria-disabled` wiring is required.

---

## Color and Contrast

All contrast requirements are owned by the child components and their
respective token tiers (`Button`, `ButtonMenu`). Any status/counter text the
consumer renders inside `actions` should use the shared
`--ui-text-on-surface-primary`/`-secondary` semantic tokens to remain
compliant.

---

## Testing Checklist

- [ ] Root renders as a `<fieldset>` with no unexpected ARIA role
- [ ] All child controls are reachable via Tab
- [ ] `disabled` removes every nested control from the Tab order
- [ ] Action buttons have accessible names
- [ ] A rendered selection counter states the count as text
