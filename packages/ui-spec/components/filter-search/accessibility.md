# FilterSearch — Accessibility Requirements

FilterSearch is a pure layout wrapper — accessibility concerns are delegated
to its composed children (Search, ButtonMenu, Select, Button).

## ARIA Roles and Attributes

### Root (`div`)

The root element has **no semantic role** — it is a presentational flex
container. If the consumer needs a landmark, they can add `role="toolbar"`
and an `aria-label` via props.

| Attribute    | Value    | Reason                                          |
| ------------ | -------- | ----------------------------------------------- |
| No `role`    | —        | Pure layout; no inherent semantics              |
| `aria-label` | (opt-in) | Consumer may set this if using `role="toolbar"` |

---

## Keyboard Navigation

Keyboard interaction is handled by the child components:

| Component  | Key   | Action                       |
| ---------- | ----- | ---------------------------- |
| Search     | Tab   | Focuses the search input     |
| ButtonMenu | Enter | Opens/closes the filter menu |
| Select     | Enter | Opens the select dropdown    |
| Button     | Enter | Activates the action         |

The toolbar itself does not manage focus — children follow their own focus
patterns. If `role="toolbar"` is applied, arrow-key navigation between
children is the consumer's responsibility.

---

## Screen Reader Requirements

1. Each child component announces itself according to its own spec.
2. The search field should have an `aria-label` (e.g. "Search table").
3. Action buttons should have descriptive labels.

---

## Color and Contrast

All contrast requirements are owned by the child components and their
respective token tiers.

---

## Testing Checklist

- [ ] Root renders as a `<div>` with no unexpected ARIA roles
- [ ] All child components are reachable via Tab
- [ ] Search field has an accessible label
- [ ] ButtonMenu announces its label and expanded state
- [ ] Action buttons have accessible names
