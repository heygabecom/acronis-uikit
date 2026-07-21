---
'@acronis-platform/ui-react': minor
---

`PageHeaderTags` and `PageHeaderActions` now collapse on overflow, per the
Figma "Breakpoints" page's two hard requirements: tags collapse to the first
tag plus a "+#" tag (a tooltip lists the hidden labels on hover), and
secondary-variant action buttons fold under a single "More" `ButtonIcon`
menu — primary buttons are never hidden. Both are all-or-nothing collapses,
not a partial "however many fit" reflow.

Also fixes `PageHeaderDescriptionRow` to use `items-start` instead of
`items-center`, so the edit pencil sits flush with the first line of a
wrapped description instead of floating mid-paragraph, matching Figma.
