---
'@acronis-platform/ui-react': patch
---

Fix `SidebarPrimary` layout drift from Figma: the first `SidebarPrimarySection` no longer gets an extra top padding/divider (only the last-section-style bottom padding, matching Figma), `SidebarPrimaryFooter` no longer double-pads its rows on top of each item's own padding, and `SidebarPrimaryCollapseTrigger`'s icon now rotates 180° between expanded and collapsed rail states.

Also fixes `SidebarPrimaryMenuItem` and `SidebarPrimaryCollapseTrigger` rendering their trailing affordance nested inside the label's truncating span instead of as a flex sibling, which cramped the shortcut/tag/external-link extras against the label text. Both now take an explicit `extras` prop (a `SidebarPrimaryMenuItemExtras` element) rendered alongside the label. Also adds Figma Code Connect for the `Section` and `MenuItem` sub-components.

**Migration:** if you were passing `SidebarPrimaryMenuItemExtras` (or a raw shortcut/tag node) as a second child alongside the label — commonly with the label wrapped in `<span style={{ flex: 1 }}>...</span>` to push the extras to the row's edge — move it to the new `extras` prop and drop the manual flex wrapper:

```diff
-<SidebarPrimaryMenuItem icon={<CircleHelpIcon />}>
-  <span style={{ flex: 1 }}>Auth layout demo</span>
-  <SidebarPrimaryMenuItemExtras variant="shortcut" shortcut="⌘H" />
-</SidebarPrimaryMenuItem>
+<SidebarPrimaryMenuItem
+  icon={<CircleHelpIcon />}
+  extras={<SidebarPrimaryMenuItemExtras variant="shortcut" shortcut="⌘H" />}
+>
+  Auth layout demo
+</SidebarPrimaryMenuItem>
```

The same applies to `SidebarPrimaryCollapseTrigger`. Without this change the extras render inline right after the label instead of right-aligned, since the label+extras wrapper is intentionally not a flex container.
