---
'@acronis-platform/ui-react': minor
---

Add `AppShellChat` — a 3-section, horizontally resizable application scaffold
(sidebar rail | Content | Chat). Content and Chat resize against each other via a
drag handle on Chat's start border (mirroring `SidebarSecondary`'s resize
interaction, flipped for the end-of-row panel); sidebar interactions reflow
Content only, never Chat. Chat is resize-only: dragging down to its floor width
switches its header to an icon-only rail, and dragging up can take it to full
width (Content shrinks to 0) since the resize ceiling is measured from the
actual available space rather than a fixed cap. Composable parts:
`AppShellChat`, `AppShellChatSidebar`, `AppShellChatContent`,
`AppShellChatContentHeader`, `AppShellChatContentBody`, `AppShellChatChat`,
`AppShellChatChatHeader`, `AppShellChatChatBody`. RTL-safe via CSS logical
properties. Distinct from the existing `AppShell` component.
