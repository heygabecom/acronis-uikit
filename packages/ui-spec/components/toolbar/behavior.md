# Toolbar — Behavior Scenarios

## Structure

### Renders a horizontal action row

**Given** a Toolbar wrapping Button/ButtonMenu children
**When** the component renders
**Then** the root is a `<fieldset>` with a horizontal flex layout and 16px gap
**And** children are vertically centered

### Renders with list actions only

**Given** a Toolbar containing only Button children
**When** it renders
**Then** only those buttons are shown in the row, with no trailing spacer

### Renders with an overflow control and a trailing area

**Given** a Toolbar containing Button children, a ButtonMenu, and a
ToolbarActions child
**When** it renders
**Then** all three appear in order: list actions, overflow menu, trailing area

---

## Disabled

### Disables every nested control

**Given** a Toolbar with `disabled` set to `true`, containing Button and
ButtonMenu children (including inside a ToolbarActions child)
**When** it renders
**Then** every nested Button/ButtonMenu is disabled — via the native
`<fieldset disabled>` cascade, with no explicit prop passed to each child

### Leaves nested controls enabled by default

**Given** a Toolbar with no `disabled` prop
**When** it renders
**Then** every nested Button/ButtonMenu is enabled

---

## Actions Area

### Pushes trailing content to the trailing edge

**Given** a Toolbar with a ToolbarActions containing a status text
**When** it renders
**Then** the actions area takes remaining space (`flex-1`)
**And** its content is right-aligned

### Renders a selection counter with an action

**Given** a Toolbar with a ToolbarActions containing a text node and a
"Deselect" Button
**When** it renders
**Then** both are shown with an 8px gap between them, right-aligned

### Renders without a trailing area

**Given** a Toolbar with no ToolbarActions child
**When** it renders
**Then** children are laid out from the leading edge with no trailing spacer

---

## Overflow (ToolbarActionList)

### Renders every action inline when they all fit

**Given** a ToolbarActionList whose actions' combined width (plus gaps) fits
the available row width
**When** it renders
**Then** every action renders as a ghost Button in source order
**And** no "More actions" trigger is rendered

### Collapses trailing actions into an overflow menu once they no longer fit

**Given** a ToolbarActionList whose actions no longer fit the available row
width
**When** it renders (or the row is resized narrower)
**Then** as many leading actions as fit alongside a "More actions" trigger
render inline
**And** the remaining trailing actions render as items inside the
`ButtonMenu` + `DropdownMenu` opened by that trigger

### Accounts for sibling width when measuring available space

**Given** a ToolbarActionList rendered alongside a sibling ToolbarActions in
the same Toolbar
**When** it measures available width
**Then** it subtracts the sibling's rendered width and the gap between them
from the parent Toolbar's width, rather than assuming it owns the full row

### Re-measures on resize

**Given** a mounted ToolbarActionList
**When** its parent Toolbar's rendered width changes
**Then** a `ResizeObserver` on the parent triggers a re-measurement and the
visible/hidden split updates accordingly

### Preserves onSelect and disabled whether an action is inline or hidden

**Given** a ToolbarActionList item with `onSelect` and/or `disabled` set
**When** the item renders inline (a Button) or inside the overflow menu (a
DropdownMenuItem), depending on available width
**Then** `onSelect` fires from either rendering, and `disabled` is honored
in either rendering

---

## Composition

### Supports arbitrary children

**Given** a Toolbar with custom children (not just Button/ButtonMenu)
**When** it renders
**Then** all children appear in source order within the flex container

### Merges custom className

**Given** a Toolbar with a custom className
**When** it renders
**Then** the custom class is merged onto the root element

### Spreads native fieldset attributes

**Given** a Toolbar with `aria-label` or other native attributes
**When** it renders
**Then** those attributes are applied to the root `<fieldset>`
