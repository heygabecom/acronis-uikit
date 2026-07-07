# SidebarSecondary — Behavior Scenarios

## Structure

### Renders a navigation landmark

**Given** a SidebarSecondary wrapping a header, content, and footer
**When** the component renders
**Then** the root is a `<nav>` with a distinguishing `aria-label`
**And** the header renders an `<h2>` heading
**And** each menu is a `<ul>` of `<li>` rows

### Sections divide the menu

**Given** more than one SidebarSecondarySection
**When** the panel renders
**Then** the first section has no top divider
**And** every following section carries a top border
**And** a SidebarSecondarySectionLabel renders above its menu when provided

---

## Selection

### Marks the current route

**Given** a SidebarSecondaryMenuItem (or sub-trigger / sub-item) with `selected`
**When** the panel renders
**Then** the row applies the `selected` **container** token
**And** it carries `aria-current="page"`
**And** its icon and label use the shared global state tokens (same as unselected)

---

## Expand / collapse (panel width)

### Defaults to expanded

**Given** a SidebarSecondary with no `expanded` / `defaultExpanded`
**When** it renders
**Then** the root has `data-state="expanded"` (256px width)
**And** the section list (content) is shown; the collapsed-breadcrumb is hidden

### Collapses to a breadcrumb rail

**Given** `expanded={false}`
**When** it renders
**Then** the root has `data-state="collapsed"` (48px width)
**And** the header is hidden
**And** the content section list is hidden
**And** the collapsed-breadcrumb is shown: parent → separator → current page
**And** the breadcrumb labels render vertically (`writing-mode: vertical-rl`)
**And** menu-item labels (when any rows remain) are kept in the DOM as `sr-only`

> The content and the collapsed-breadcrumb are both authored and present in the
> DOM; visibility is toggled purely by `data-[state]` selectors (SSR-safe, no JS
> branch).

---

## Disclosure (expandable sections)

### Toggles a section's menu

**Given** a `SidebarSecondarySection` with `expandable`
**When** the user activates the section-label header
**Then** `aria-expanded` flips and the section's menu collapses/expands
**And** the header chevron rotates

### Opens initially / is controllable

**Given** an expandable section with `defaultOpen`
**When** it renders
**Then** the disclosure is open initially
**And** `open` / `onOpenChange` allow controlled use (Base UI Collapsible)
**And** each expandable section has independent open state

---

## Extras

### Shortcut / external link

**Given** a SidebarSecondaryMenuItemExtras with `variant="shortcut"` / `"externalLink"`
**When** the item renders expanded
**Then** the shortcut text / external-link icon appears trailing the label

### Hidden when collapsed

**Given** any extras inside a menu item
**When** the panel is collapsed
**Then** the extras cluster is hidden

## Expandable section

### Toggle a section

**Given** a `SidebarSecondarySection` with `expandable`
**When** the user activates its section-label header
**Then** the section's menu collapses/expands and the header chevron rotates
(`aria-expanded` flips); an uncontrolled section starts open

### Header actions stay operable

**Given** an expandable section-label with an `actions` slot (e.g. a ButtonIcon)
**When** the user activates the action
**Then** the action fires and the section does **not** toggle (the action is a
sibling of the toggle, never nested in it)

### Unread rollup while collapsed

**Given** an expandable section-label with an `unreadRollup` badge
**When** the section is collapsed
**Then** the rollup badge shows in the header; it hides again when expanded

### Items inside expandable sections are indented

**Given** a `SidebarSecondaryMenuItem` inside an expandable section
**When** the section is open
**Then** items are left-indented so their label aligns with the section header text
