---
'@acronis-platform/ui-react': major
---

DropdownMenu: align with Figma design (ButtonMenuDropdown)

### BREAKING CHANGES

- **Removed exports:** `DropdownMenuCheckboxItem`, `DropdownMenuRadioItem`,
  `DropdownMenuRadioGroup`, `DropdownMenuLabel`, `DropdownMenuSeparator` —
  not present in the Figma design. Consumers using these must migrate:
  - `DropdownMenuLabel` → remove or use a plain styled `<div>`.
  - `DropdownMenuSeparator` → use multiple `DropdownMenuGroup`s (non-first
    groups render a top-border separator automatically).
  - `DropdownMenuCheckboxItem` → use `DropdownMenuItem` with a visual
    checkmark (see `TableViewOptions` for the pattern).
  - `DropdownMenuRadioItem` / `DropdownMenuRadioGroup` → use
    `DropdownMenuItem` with custom selection state.
- **`TableViewOptions`:** removed the `menuLabel` prop. The Figma design has no
  menu heading, so the dropdown no longer renders one — the prop is gone rather
  than silently ignored.

### Additions

- Theme the entire component with `--ui-button-menu-dropdown-*` tokens from
  `@acronis-platform/tokens-pd` (replacing shared semantic tokens).
- Add `DropdownMenuGroup` (Figma `Section`): non-first groups render a
  top-border separator automatically.
- Add item active state (`data-[highlighted]:active`) and keyboard-only
  focus ring (`focus-visible:not(:hover)`, 3px inset, `--ui-focus-primary`).
- Add `DropdownMenuShortcut` (Figma `ItemExtras` variant=shortcut) and
  cascade chevron color token for submenu triggers.

### Internal

- Update `TableViewOptions` to use `DropdownMenuItem` with visual checkmark
  instead of removed checkbox sub-component.
- Stories now use `ButtonMenu` as the trigger (matching Figma pattern).
