# Releasing

Releases of `@acronis-platform/shadcn-uikit` are automated via
[Changesets](https://github.com/changesets/changesets). The three private
apps (`demo`, `docs`, `demos`) are not published.

## When to add a Changeset

Any PR that changes the published surface of
`@acronis-platform/shadcn-uikit` must include a `.changeset/*.md` file.
A "change to the published surface" is anything in:

- `packages/legacy/ui/src/`
- `packages/legacy/ui/package.json` (deps, exports, scripts that affect build)
- `packages/legacy/ui/tsconfig.build.json`
- `packages/legacy/ui/vite.config.ts`

Pure repo-tooling changes (root config, CI, monorepo READMEs,
`./context/`, `AGENTS.md`) do not need a Changeset.

## How to add one

```bash
pnpm changeset
```

The interactive prompt asks for the bump type (`patch` / `minor` / `major`)
and a one-line summary. It writes a markdown file under `.changeset/`.
Commit that file alongside the code change.

## What happens on merge to `main`

1. The **Release** workflow opens (or updates) a "Version Packages" PR
   that bumps the version in `packages/legacy/ui/package.json`, updates
   `CHANGELOG.md`, and deletes the consumed `.changeset/*.md` files.
2. Merging the Version Packages PR triggers publish to **npm** and
   **GitHub Packages**, and creates a **GitHub Release**.

Do not bump the version manually. Do not delete `.changeset/*.md` files
by hand; Changesets owns them.

## Bump type guidance

- **patch** — bug fixes, internal refactors, dependency updates that
  don't affect consumers.
- **minor** — new components, new variants, new props that are additive
  and backwards-compatible.
- **major** — breaking changes (removed components, renamed props,
  changed default behavior). Avoid until a major release is planned.

## Root release scripts (rarely run manually)

These exist for the Release workflow; you typically don't run them locally:

- `pnpm version` → `changeset version` (rewrites versions + changelogs)
- `pnpm release` → `changeset publish` (publishes to registries)
