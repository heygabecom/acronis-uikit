---
'@acronis-platform/ui-react': minor
---

Update `PageHeader` to match the current Figma "PageHeader" component
(node 2905-7678): the title row gains an optional tags slot
(`PageHeaderTags`) and grows the title to the design's 24px/regular style;
the description moves into its own row (`PageHeaderDescriptionRow`) capped
at 512px. The title and description edit affordance seen in full-page
wizards (e.g. Create Dashboard) is a plain `ButtonIcon` placed as a sibling
— no dedicated part for it.

**Breaking**: `PageHeaderBreadcrumb` is removed. In the current design the
breadcrumb is a separate sibling above `PageHeader`, not one of its parts —
render a `Breadcrumb` above it instead.
