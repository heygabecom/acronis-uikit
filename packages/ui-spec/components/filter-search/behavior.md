# FilterSearch — Behavior Scenarios

## Structure

### Renders a horizontal toolbar

**Given** a FilterSearch wrapping child components
**When** the component renders
**Then** the root is a `<div>` with a horizontal flex layout and 16px gap
**And** children are vertically centered

### Renders with search only

**Given** a FilterSearch containing only a Search component
**When** it renders
**Then** only the search field is shown in the toolbar

### Renders with tenant switcher and filters

**Given** a FilterSearch containing a Select, Search, and ButtonMenu
**When** it renders
**Then** all three appear in order: select, search, filters button

---

## Actions Area

### Pushes action buttons to the trailing edge

**Given** a FilterSearch with a FilterSearchActions containing buttons
**When** it renders
**Then** the actions area takes remaining space (`flex-1`)
**And** its content is right-aligned

### Renders without actions

**Given** a FilterSearch with no FilterSearchActions
**When** it renders
**Then** children are laid out from the leading edge with no trailing spacer

---

## Composition

### Supports arbitrary children

**Given** a FilterSearch with custom children (not just Search/Select/ButtonMenu)
**When** it renders
**Then** all children appear in source order within the flex container

### Merges custom className

**Given** a FilterSearch with a custom className
**When** it renders
**Then** the custom class is merged onto the root element
