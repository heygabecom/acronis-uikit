# AppShellChat — Behavior Scenarios

## Structure

### Renders three logical sections

**Given** an AppShellChat wrapping a sidebar rail, a Content column, and a Chat panel
**When** the component renders
**Then** the sections lay out left→right as sidebar → Content → Chat
**And** in `dir="rtl"` they mirror to right→left via CSS logical properties (no JS branch)
**And** Content is `flex-1 min-w-0` while Chat has an explicit pixel width

---

## Sizing independence

### Sidebar interactions never resize Chat

**Given** a Chat panel with a fixed/overridden width
**When** either sidebar expands, collapses, or is resized
**Then** only Content's width changes (it absorbs the delta)
**And** Chat's width is unchanged

> This falls out of the layout: Content is the only flex-growing item, and Chat's
> width is an explicit pixel value (never a percentage), so the sidebars — flex
> siblings outside any resizable group — cannot alter it.

---

## Content ↔ Chat resize

### Drag resizes Chat against Content, down to the min width

**Given** a Chat panel
**When** the user drags the resize edge on Chat's start border toward the row's end
**Then** Chat's width tracks the pointer, down to a floor of 48px
**And** Content reflows to fill the remaining width
**And** the Content/Chat seam recolors on hover / drag / focus
**And** there is no collapse threshold or toggle — the drag simply stops at the floor

### Drag resizes Chat up to full width

**Given** a Chat panel and its sibling Content column
**When** the user drags the resize edge toward the row's start
**Then** Chat's width grows and Content shrinks, down to 0 width if dragged far enough
**And** the resize ceiling is the row's actual available width at drag start (row
width minus the sidebar rail), not a fixed constant — so Chat can reach full
width whenever the row has the room (e.g. both sidebars collapsed), and is
otherwise bounded by whatever space is actually free

### Double-click and keyboard

**Given** the resize edge
**When** the user double-clicks it
**Then** the width resets to 512px
**And** ArrowLeft/ArrowRight resize by 16px (inverted in RTL), clamped to
[48px, the same dynamically-measured ceiling used by drag]
**And** Home resets the width to 512px

---

## Icon-only rail at the min width

### Header and body adapt at 48px

**Given** the Chat panel's width is at its 48px floor
**When** it renders
**Then** the panel has `data-state="collapsed"`
**And** the header shows only the Acronis mark, sized to match the header's
height at any other width; the full label appears on hover
**And** the chat body is hidden (`hidden`)
**And** any header `actions` are hidden

**Given** the Chat panel's width is above the 48px floor
**When** it renders
**Then** the panel has `data-state="expanded"`
**And** the header shows the title + any `actions`; the body is visible

---

## Controlled / uncontrolled

### Width supports either mode

**Given** `width` (controlled) or the uncontrolled default (512px)
**When** the resize edge is dragged or operated via keyboard
**Then** uncontrolled state updates internally, controlled state is owned by the consumer
**And** `onWidthChange` always fires with the next value
