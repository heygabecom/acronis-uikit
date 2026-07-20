---
'@acronis-platform/ui-react': minor
---

Add `Toolbar`: a horizontal action row — list actions, an optional overflow
control, and an optional trailing area (a status text, or a selection
counter + action) — for use above/below a list or table when rows are
selected or bulk actions are available.

- `disabled` cascades to every nested Button/ButtonMenu via a native
  `<fieldset disabled>` — no prop-drilling into arbitrary children.
- `ToolbarActionList` renders an `actions` array as ghost Buttons and
  auto-collapses the trailing ones into a "More actions" `ButtonMenu` +
  `DropdownMenu` once they no longer fit the row, re-measuring on resize.
- `ToolbarActions` is a right-aligned trailing slot (8px gap).
- No dedicated token tier — every action brings its own tokens; the 16px/8px
  gaps are un-tokenized, same precedent as `FilterSearch`.
