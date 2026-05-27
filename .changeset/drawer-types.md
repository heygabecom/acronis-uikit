---
"@acronis-platform/shadcn-uikit": patch
---

Fix: `dist/components/ui/drawer.d.ts` now ships with the published
tarball. Previously, `vite-plugin-dts` failed with TS2742 ("inferred type
cannot be named") on six of the ten drawer exports because their types
reach into `@radix-ui/react-dialog` (vaul's underlying primitive), which
wasn't a declared dependency of the package — so the emitter had no
portable specifier for the type imports.

Adding `@radix-ui/react-dialog` as a direct dependency gives the `.d.ts`
emitter a portable path. No source changes; the runtime tarball is
identical. Consumers using `<Drawer />`, `<DrawerTrigger />`,
`<DrawerContent />`, etc. now get full type information.
