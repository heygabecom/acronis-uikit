---
'@acronis-platform/design-assets': minor
'@acronis-platform/icons-react': minor
---

Add the `search` (magnifier) icon to the `icons-solid-mono` pack. The asset
already existed upstream in `icons-svg` but wasn't promoted into `design-assets`,
so no React component was generated. It now generates `SearchIcon`, exported from
`@acronis-platform/icons-react/solid-mono`.
