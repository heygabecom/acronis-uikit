# Toolbar — Accessibility Requirements

`Toolbar` itself is a layout wrapper — most accessibility concerns are
delegated to its composed children (Button, ButtonMenu). Its own contribution
is the native `disabled` cascade. `ToolbarActionList`, when used, additionally
implements the WAI-ARIA `toolbar` pattern (`role="toolbar"` + roving
tabindex) on its own root — see below.

## ARIA Roles and Attributes

### Root (`fieldset`)

The root renders as a `<fieldset>`, reset to look like a plain flex container
(no border/margin/padding). A `<fieldset>` carries an implicit ARIA role of
`group` — acceptable for a generic control grouping. `role="toolbar"` is
**not** applied here: when the child action row needs the WAI-ARIA `toolbar`
pattern, it lives one level down on `ToolbarActionList`'s own root (below),
not on this fieldset. Plain Button/ButtonMenu children composed directly on
`Toolbar` (not through `ToolbarActionList`) each keep their own natural Tab
stop, matching `FilterSearch`'s and `DataTableToolbar`'s existing precedent
in this kit.

| Attribute    | Value    | Reason                                                    |
| ------------ | -------- | --------------------------------------------------------- |
| No `role`    | —        | Implicit `group` from `<fieldset>`                        |
| `disabled`   | (opt-in) | Cascades to every nested form control                     |
| `aria-label` | (opt-in) | Consumer may set this for a landmark-like accessible name |

### List Actions (`ToolbarActionList`)

`ToolbarActionList`'s own root implements the WAI-ARIA `toolbar` pattern via
Base UI's `Toolbar.Root`/`Toolbar.Button` (`@base-ui/react/toolbar`):
`role="toolbar"`, one Tab stop into the row, and roving `tabindex` between
every visible action and the overflow trigger, driven by arrow keys. A
disabled action opts out of Base UI's default APG toolbar
treatment (`focusableWhenDisabled={false}`) so it matches every other
disabled `Button` in this kit: unreachable via Tab or arrow keys, rather than
focusable-but-inert. The invisible measurement clones used to compute
collapse width are not registered in the roving-tabindex sequence.

| Attribute        | Value   | Reason                                               |
| ---------------- | ------- | ---------------------------------------------------- |
| `role="toolbar"` | (fixed) | WAI-ARIA toolbar pattern for the action row          |
| `tabindex`       | roving  | One Tab stop into the row; arrow keys move within it |

---

## Keyboard Navigation

| Component                             | Key                  | Action                                                              |
| ------------------------------------- | -------------------- | ------------------------------------------------------------------- |
| `ToolbarActionList` visible action    | Enter/Space          | Activates the action                                                |
| `ToolbarActionList` overflow trigger  | Enter/Space          | Opens/closes the overflow `DropdownMenu`                            |
| `ToolbarActionList` row               | ArrowLeft/ArrowRight | Moves roving focus between visible actions and the overflow trigger |
| Button/ButtonMenu (composed directly) | Enter/Space          | Activates the action / opens the menu it triggers                   |

Plain Button/ButtonMenu children composed directly on `Toolbar` (not through
`ToolbarActionList`) keep their natural individual Tab order — the fieldset
itself does not manage their focus. When `disabled` is set, every nested
Button/ButtonMenu is removed from the Tab order automatically (native
`disabled` behavior), so no manual `tabIndex` management is needed.

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
- [ ] Plain Button/ButtonMenu children composed directly on `Toolbar` are each
      reachable via Tab
- [ ] `ToolbarActionList` renders `role="toolbar"` and is reachable as a
      single Tab stop, with arrow keys moving roving focus between its
      visible actions and the overflow trigger
- [ ] `disabled` removes every nested control from the Tab order
- [ ] A disabled action inside `ToolbarActionList` is unreachable via Tab or
      arrow keys, not merely `aria-disabled`
- [ ] Action buttons have accessible names
- [ ] A rendered selection counter states the count as text
