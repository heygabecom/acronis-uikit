---
'@acronis-platform/ui-react': patch
---

`ToolbarActionList` now wires its action row through Base UI's `Toolbar.Root`/`Toolbar.Button` (`@base-ui/react/toolbar`) instead of plain `Button`/`ButtonMenu` children.

The row is now a single Tab stop with arrow-key/Home/End roving-tabindex between visible actions and the "More actions" overflow trigger, matching the WAI-ARIA toolbar pattern. No API changes — `Toolbar`, `ToolbarActions`, and `ToolbarActionList`'s props are unchanged.

Also fixes two pre-existing bugs, both only visible in a real browser (the mocked Vitest geometry never exercised real layout):

- `Toolbar`'s `<fieldset>` root was missing `min-w-0`, so the browser's default `min-width: min-content` on `<fieldset>` kept it from ever shrinking below its content's natural width. Since `ToolbarActionList`'s auto-collapse math measures that fieldset's own width as "available space," the row never collapsed into "More actions" at narrow widths.
- `ToolbarActions` used `flex-1` (grow _and_ shrink), so once the collapse math above started working it could get squeezed below its own content's natural width and its text would wrap mid-phrase or overlap the action row. It now uses `grow shrink-0` (fill leftover space, never shrink below content) plus `whitespace-nowrap`, matching the Figma "Counter" part, which is always single-line.
