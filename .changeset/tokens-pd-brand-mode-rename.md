---
'@acronis-platform/tokens-pd': major
---

Rename the brand mode keys across every generated artifact: `acronis` → `default`
and `deep-sky` → `deep_sky_itkontoret`. This renames the package's public entry
files — e.g. `css/acronis.css` → `css/default.css`, `css/deep-sky.css` →
`css/deep_sky_itkontoret.css`, and the parallel `css/<Component>/*` and
`tailwind/<brand>/*` paths.

**Breaking:** update any import of a brand-specific file. For example:

```diff
-@import '@acronis-platform/tokens-pd/css/acronis.css';
-@import '@acronis-platform/tokens-pd/css/deep-sky.css';
+@import '@acronis-platform/tokens-pd/css/default.css';
+@import '@acronis-platform/tokens-pd/css/deep_sky_itkontoret.css';
```
