# CLAUDE.md

Project-level guidance for AI assistants working in this repository.

## Repository overview

`@acronis/shadcn-uikit` is a pnpm monorepo containing a React component library, a demo app, shared demo components, and a documentation site.

## Packages

| Package | Path | Name |
|---------|------|------|
| UI library | `packages/legacy/ui/` | `@acronis-platform/shadcn-uikit` |
| Demo app | `apps/demo/` | `@acronis-platform/shadcn-uikit-demo` |
| Shared demos | `apps/demos/` | `@acronis-platform/shadcn-uikit-demos` |
| Documentation site | `apps/docs/` | `@acronis-platform/shadcn-uikit-docs` |

Only `@acronis-platform/shadcn-uikit` is published. Apps are private (`"private": true`).

## Scripts vocabulary

Every workspace exposes the same script names — assume any of these work
both as `pnpm -r <name>` (all workspaces, topological order) and as
`pnpm --filter <package> <name>`:

`dev` · `build` · `test` · `test:watch` · `lint` · `lint:fix` · `typecheck` · `clean`

Root-only scripts: `format`, `format:check` (Prettier from repo root),
`changeset`, `version`, `release` (Changesets CLI passthroughs).

Shared dep versions live in the `catalog:` block of `pnpm-workspace.yaml`;
workspaces reference them with `"catalog:"`. Bump in one place.

Releases are driven by [Changesets](https://github.com/changesets/changesets):
a PR that changes the published library should include a `.changeset/*.md`
file. The `Release` workflow opens a "Version Packages" PR on merge to main;
merging that PR publishes to npm + GitHub Packages and creates a GitHub Release.

## Documentation site

The docs site lives at `apps/docs/`. It is a Next.js 15 application built with [Fumadocs](https://www.fumadocs.dev/).

### Running locally

```bash
pnpm --filter @acronis-platform/shadcn-uikit-docs dev
```

### Key conventions

**DemoPreview sourcePath format** -- The `<DemoPreview>` component accepts a `sourcePath` prop that is relative to the monorepo root. Example:

```
sourcePath="apps/demos/src/button/ButtonVariants.tsx"
```

The component resolves this via `resolve(process.cwd(), '..', '..', sourcePath)` because `process.cwd()` is `apps/docs/` at build time.

**AutoTypeTable path convention** -- `<AutoTypeTable>` paths are relative to `apps/docs/`. To reference a UI component source file:

```
<AutoTypeTable path="../../packages/legacy/ui/src/components/ui/button.tsx" name="ButtonProps" />
```

For compound components or types that `AutoTypeTable` cannot resolve (e.g., re-exported Radix/Base UI types, complex CVA generics), use a `.docs.ts` companion file:

```
<AutoTypeTable path="../../packages/legacy/ui/src/components/ui/dialog.docs.ts" name="DialogContentProps" />
```

**`.docs.ts` companion files** -- Located alongside component source files in `packages/legacy/ui/src/components/ui/`. These files define explicit interfaces with TSDoc comments for components where `AutoTypeTable` cannot resolve types from the source alone. Currently 8 companion files exist. Only create one when `AutoTypeTable` fails to produce a useful table from the original source.

**AutoTypeTable global registration** -- `AutoTypeTable` is registered as a global MDX component in `apps/docs/src/app/docs/[[...slug]]/page.tsx`. MDX files do not need to import it.

**Client demo wrappers** -- Demo components use hooks and browser APIs, so they need `'use client'`. Thin wrapper files in `apps/docs/src/components/demos/` add the directive and re-export from `@acronis-platform/shadcn-uikit-demos`.

### Search

The search API route at `apps/docs/src/app/api/search/route.ts` uses Fumadocs `createFromSource` to provide server-side search over the content index. No external search provider is required.

### Content structure

- `apps/docs/content/docs/` -- MDX pages and `meta.json` files controlling sidebar order
- `apps/docs/content/docs/components/` -- one MDX file per UI component (40 components)
- `apps/docs/src/components/DemoPreview.tsx` -- async RSC for live preview + source toggle
- `apps/docs/src/components/demos/` -- 40 client wrapper files for demo components
