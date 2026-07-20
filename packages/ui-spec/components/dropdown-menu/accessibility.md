# DropdownMenu — accessibility

DropdownMenu leans on the Base UI Menu primitive for the WAI-ARIA menu pattern:
roles, roving focus, typeahead, and dismissal.

## Roles & semantics

- The trigger exposes `aria-haspopup="menu"` and `aria-expanded`; the popup has
  `role="menu"`.
- Items are `role="menuitem"`. The shortcut hint is decorative text inside its
  item. Groups (`DropdownMenuGroup`) visually section items; non-first groups
  render a top-border separator.

## Keyboard

- **Enter / Space / Arrow Down** on the trigger opens the menu and moves focus
  to the first item.
- **Arrow Up / Down** move the highlight (roving); **Home / End** jump to
  first / last; **typeahead** jumps to a matching item.
- **Arrow Right** opens a submenu from its trigger; **Arrow Left** / **Escape**
  closes it (Escape closes the whole menu from the root and returns focus to the
  trigger).
- **Enter / Space** activates the highlighted item.
- **Focus ring** (`--ui-focus-primary`, 3px inset) appears only on keyboard
  navigation (`focus-visible:not(:hover)`), not on pointer interaction.

## Screen reader

- Opening announces the menu and its first item ("Profile, menu item 1 of 4").

## Contrast

- The popup uses `--ui-button-menu-dropdown-item-label-color` on
  `--ui-button-menu-dropdown-container-color` with a
  `--ui-button-menu-dropdown-container-border-color` border; the highlighted
  item uses `--ui-button-menu-dropdown-item-container-color-hover`; shortcuts
  use `--ui-button-menu-dropdown-extras-shortcut-label-color` — all meeting
  WCAG AA in light and dark.
