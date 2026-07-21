---
'@acronis-platform/ui-react': patch
---

`PageHeaderActions` no longer folds a `variant="secondary"` action into the
"More" menu unless it's a plain `Button`. A trigger-style component (e.g.
`ButtonMenu`) opens its own menu rather than firing a single click action, so
it has nothing for the fold to reduce to a "Menu Item" label — it now stays
visible and unfolded instead of silently becoming an inert menu item.
