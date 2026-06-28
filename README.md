# Acronis UI Kit

A pnpm monorepo for the Acronis design system: two React component
libraries, a design-token pipeline (Figma → JSON → CSS/Tailwind), icon
packages, design-data packages, and supporting apps and tooling.

**Architecture in brief:** The next-generation library (`@acronis-platform/ui-react`)
is built on [Base UI](https://base-ui.com/) unstyled primitives and themed by
`@acronis-platform/tokens-pd` (`--ui-*` CSS custom properties generated from
`@acronis-platform/design-tokens`). The legacy library
(`@acronis-platform/shadcn-uikit`) follows [shadcn/ui](https://ui.shadcn.com/)
principles on Base UI + Radix primitives. Tailwind CSS is used **internally** to
compile styles — consumers receive fully pre-built CSS and can use any styling
solution in their own project. No Tailwind installation required.

## 📦 Workspaces

The repo is organized into four top-level directories: `context/` (shared docs),
`apps/` (deployed apps, private), `packages/` (published libraries + data), and
`tools/` (private build tooling).

| Path                          | Package                                  | Published | Role                                                                         |
| ----------------------------- | ---------------------------------------- | --------- | ---------------------------------------------------------------------------- |
| `packages/ui-react/`          | `@acronis-platform/ui-react`             | **yes**   | Next-gen React library on **Base UI**, themed by `tokens-pd`. New work here. |
| `packages/ui-legacy/`         | `@acronis-platform/shadcn-uikit`         | **yes**   | Legacy shadcn-style React library (Base UI + Radix), 4 shipped themes.       |
| `packages/icons-react/`       | `@acronis-platform/icons-react`          | **yes**   | React icon components generated from `design-assets` (tree-shakeable).       |
| `packages/icons-sprite/`      | `@acronis-platform/icons-sprite`         | **yes**   | Generated SVG sprites built from `icons-svg`.                                |
| `packages/icons-svg/`         | `@acronis-platform/icons-svg`            | no        | Raw SVG icon sources fetched from Figma + manifests (source-only).           |
| `packages/icons-svg-next/`    | `@acronis-platform/icons-svg-next`       | no        | Raw SVG sources for the next-gen icon set (source-only).                     |
| `packages/design-tokens/`     | `@acronis-platform/design-tokens`        | **yes**   | DTCG-2025.10 design tokens (primitives / semantics / components). Data only. |
| `packages/design-assets/`     | `@acronis-platform/design-assets`        | **yes**   | Icon/illustration manifests + bundled binaries. Data only.                   |
| `packages/tokens-pd/`         | `@acronis-platform/tokens-pd`            | **yes**   | Generated per-brand CSS vars, per-component CSS, Tailwind presets, DTCG.     |
| `apps/demo/`                  | `@acronis-platform/shadcn-uikit-demo`    | no        | Vite SPA showcasing components with live theme switching.                    |
| `apps/docs/`                  | `@acronis-platform/uikit-docs`           | no        | Next.js 15 + Fumadocs documentation site.                                    |
| `apps/demos/`                 | `@acronis-platform/shadcn-uikit-demos`   | no        | Shared demo components (source-only, no build).                              |
| `tools/style-dictionary/`     | `@acronis-platform/style-dictionary`     | no        | Style Dictionary v5 build: `design-tokens` → `tokens-pd` CSS/presets.        |
| `tools/figma-icons-fetcher/`  | `@acronis-platform/figma-icons-fetcher`  | no        | Fetches + SVGO-optimizes icons from Figma into the `icons-svg*` packages.    |
| `tools/figma-token-exporter/` | `@acronis-platform/figma-token-exporter` | no        | Self-hosted Figma plugin + receiver that exports variables/styles to tokens. |

See [`AGENTS.md`](./AGENTS.md) for the authoritative workspace map and the
per-workspace `AGENTS.md` files for area-specific conventions.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm 10+

### Installation (development)

```bash
# Clone the repository
git clone https://github.com/acronis/uikit.git
cd uikit

# Install dependencies
pnpm install

# Build all packages
pnpm run build
```

### Running the Demo

```bash
# Start the demo application
cd apps/demo
pnpm run dev
```

The demo will be available at `http://localhost:3000`.

## 📖 Usage (`@acronis-platform/ui-react`)

`@acronis-platform/ui-react` is the next-generation library and the recommended
starting point for new work. For the legacy shadcn library see
[`packages/ui-legacy/README.md`](./packages/ui-legacy/README.md).

### Installation

```bash
pnpm add @acronis-platform/ui-react react react-dom
```

`react` and `react-dom` (`^18.2.0 || ^19.0.0`) are peer dependencies. The theme
layer (`@acronis-platform/tokens-pd`) and icons (`@acronis-platform/icons-react`)
ship as direct dependencies, so no extra install is needed.

### Import Styles

Import the pre-built stylesheet once at your application entry point. It bundles
the `--ui-*` token layer and all component CSS — no Tailwind installation
required:

```typescript
// main.tsx or App.tsx
import '@acronis-platform/ui-react/styles';
```

### Using Components

All components are exported from the package root:

```tsx
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  Input,
  Label,
  Badge,
  Alert,
  AlertTitle,
  AlertDescription,
} from '@acronis-platform/ui-react';

function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="Enter your email" />
        </div>
        <Alert>
          <AlertTitle>Info</AlertTitle>
          <AlertDescription>This is an informational message.</AlertDescription>
        </Alert>
      </CardContent>
      <CardFooter>
        <Button>Submit</Button>
        <Badge variant="secondary">New</Badge>
      </CardFooter>
    </Card>
  );
}
```

> **Aliases:** `Input`/`Search`/`Textarea` are aliases of the full-field
> components `InputText`/`InputSearch`/`InputTextArea`, and `Badge` is an alias
> of the design-system-native `Tag`.

### Available Components

The library covers layout (`Card`, `AppShell`, `Grid`, `Stack`, `Section`,
`Separator`, `ScrollArea`, `Resizable`), navigation (`Breadcrumb`, `Tabs`,
`Pagination`, `SidebarPrimary`, `SidebarSecondary`, `SearchGlobal`), forms
(`InputText`, `InputSearch`, `InputTextArea`, `InputSelect`, `InputDatePicker`,
`Combobox`, `Select`, `Checkbox`, `Radio`, `Switch`, `Slider`, `NumberField`,
`Field`, `Form`, `Label`), buttons (`Button`, `ButtonIcon`, `ButtonMenu`),
overlays (`Dialog`, `Sheet`, `Popover`, `Tooltip`, `DropdownMenu`), feedback
(`Alert`, `Tag`/`Badge`, `Chip`, `Progress`, `ProgressCircle`, `Spinner`,
`Skeleton`, `Toast`, `Empty`), and data display (`Table`, `DataTable`, `Chart`,
`Avatar`, `DescriptionList`, `Accordion`, `Collapsible`). See the full export
surface in [`packages/ui-react/src/index.ts`](./packages/ui-react/src/index.ts).

Icons are provided by [`@acronis-platform/icons-react`](./packages/icons-react).

### Package Exports

```typescript
// Main entry — all components + the `cn` utility
import { Button, cn } from '@acronis-platform/ui-react';

// React-only entry
import { Button } from '@acronis-platform/ui-react/react';

// Pre-built CSS (token layer + component styles)
import '@acronis-platform/ui-react/styles';
```

### TypeScript Support

The library is fully typed:

```tsx
import type { ButtonProps, CardProps } from '@acronis-platform/ui-react';

const MyButton: React.FC<ButtonProps> = (props) => {
  return <Button {...props} />;
};
```

### Utility Functions

```typescript
import { cn } from '@acronis-platform/ui-react';

// Merge class names
const className = cn(
  'base-class',
  condition && 'conditional-class',
  'another-class'
);
```

## 🎨 Styling & Theming

Tailwind CSS is used **internally** as a build-time tool to compile component
styles. It is **not** part of the public API — both libraries ship standard,
pre-built CSS, so consumers can use any styling solution (CSS Modules, SCSS,
plain CSS, Tailwind of any version, etc.). No Tailwind installation is required
to consume the kit.

### Tokens (`ui-react`)

The next-gen library is themed entirely by `--ui-*` CSS custom properties from
`@acronis-platform/tokens-pd`, which are generated from
`@acronis-platform/design-tokens` via `@acronis-platform/style-dictionary`. The
token layer ships inside `@acronis-platform/ui-react/styles`; light/dark and
per-brand values are driven by CSS variables (zero JavaScript overhead,
SSR-compatible). Override the `--ui-*` variables to customize.

The token pipeline (and the Figma sync used to refresh it) is documented in the
workspace docs for [`design-tokens`](./packages/design-tokens/AGENTS.md) and
[`tokens-pd`](./packages/tokens-pd/AGENTS.md).

### Themes (`ui-legacy`)

The legacy library ships four CSS themes (`acronis-default`, `acronis-ocean`,
`cyber-chat`, `acronis-white-label`) plus a runtime theme/color-mode API
(`initializeThemeSystem`, `applyTheme`, `applyColorMode`, `applyNavVariant`) and
a `tw-animate-css` peer dependency. See
[`packages/ui-legacy/README.md`](./packages/ui-legacy/README.md) and
[Theme Documentation](./apps/docs/THEMES.md) for the full theming guide.

## 🏗️ Project Structure

```
uikit/
├── apps/                       # Deployed apps (private)
│   ├── demo/                   # Vite SPA          (@acronis-platform/shadcn-uikit-demo)
│   ├── demos/                  # Shared demos      (@acronis-platform/shadcn-uikit-demos)
│   └── docs/                   # Next.js + Fumadocs (@acronis-platform/uikit-docs)
├── packages/                   # Published libraries + design data
│   ├── ui-react/               # Base UI library    (@acronis-platform/ui-react)
│   ├── ui-legacy/              # shadcn library     (@acronis-platform/shadcn-uikit)
│   ├── icons-react/            # React icons        (@acronis-platform/icons-react)
│   ├── icons-sprite/           # SVG sprites        (@acronis-platform/icons-sprite)
│   ├── icons-svg/              # Raw SVG sources    (@acronis-platform/icons-svg)
│   ├── icons-svg-next/         # Next-gen SVG sources
│   ├── design-tokens/          # DTCG tokens (data) (@acronis-platform/design-tokens)
│   ├── design-assets/          # Asset manifests    (@acronis-platform/design-assets)
│   └── tokens-pd/              # Generated CSS/Tailwind (@acronis-platform/tokens-pd)
├── tools/                      # Private build tooling
│   ├── style-dictionary/       # design-tokens → tokens-pd CSS/presets
│   ├── figma-icons-fetcher/    # Figma → icons-svg* SVG fetcher
│   └── figma-token-exporter/   # Figma plugin + receiver → token snapshot
├── context/                    # Cross-workspace docs (conventions, commits, releasing)
├── .changeset/                 # Pending changesets (each PR adds one)
├── .github/workflows/          # ci, release, demo-deploy, visual-regression
├── AGENTS.md                   # Authoritative workspace map (for AI agents + humans)
├── package.json                # Workspace root: scripts + shared devDeps
├── pnpm-workspace.yaml         # pnpm workspaces + dependency catalog
└── README.md
```

## 🛠️ Scripts

All commands run from the repo root unless noted otherwise. Every workspace
exposes the same vocabulary, so `pnpm -r <name>` is reliable.

| Script                                     | What it does                                                |
| ------------------------------------------ | ----------------------------------------------------------- |
| `pnpm -r dev` / `pnpm --filter <name> dev` | Run the dev server / watcher for one or all workspaces      |
| `pnpm -r build`                            | Build every package in topological order (ui → demo/docs)   |
| `pnpm -r test`                             | Run the test suite once across all workspaces               |
| `pnpm -r test:watch`                       | Run tests in watch mode                                     |
| `pnpm -r lint` / `pnpm -r lint:fix`        | ESLint across all workspaces                                |
| `pnpm -r typecheck`                        | `tsc --noEmit` across all workspaces                        |
| `pnpm format` / `pnpm format:check`        | Prettier write / check from the repo root                   |
| `pnpm -r clean`                            | Delete `dist/`, `.next/`, `storybook-static/`, etc.         |
| `pnpm changeset`                           | Add a changeset for a PR that changes a published workspace |

To run a single workspace, prefix with `pnpm --filter <package-name>`:

```bash
pnpm --filter @acronis-platform/uikit-docs dev
pnpm --filter @acronis-platform/ui-react storybook
```

The root also exposes token-pipeline shortcuts: `pnpm sd` (build all Style
Dictionary targets), `pnpm sd:tokens` / `pnpm sd:assets` (subsets), and
`pnpm tokens:sync` (re-emit `design-tokens` then rebuild `tokens-pd`).

## 🚢 Releasing

Releases are driven by [changesets](https://github.com/changesets/changesets).
Every PR that changes a published workspace's released surface should include a
`.changeset/*.md` file describing the bump:

```bash
pnpm changeset
```

On merge to `main`, the **Release** workflow opens (or updates) a single
"Version Packages" PR aggregating all pending changesets. Merging that PR
publishes to **npm** and **GitHub Packages** and creates the corresponding
**GitHub Release**, which in turn triggers the **Demo & Storybook Pages
deploy**. See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for the full flow.

## 🚀 Quick Reference

### Complete Setup Example

```tsx
// main.tsx
import '@acronis-platform/ui-react/styles';

// App.tsx
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@acronis-platform/ui-react';

export function App() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>My App</CardTitle>
      </CardHeader>
      <CardContent>
        <Button>Click me</Button>
      </CardContent>
    </Card>
  );
}
```

## 📚 Documentation

- [`AGENTS.md`](./AGENTS.md) — authoritative workspace map + conventions
- [ui-react package](./packages/ui-react) — next-gen Base UI component library
- [ui-legacy package](./packages/ui-legacy/README.md) — legacy shadcn library + theming
- [design-tokens](./packages/design-tokens/AGENTS.md) / [tokens-pd](./packages/tokens-pd/AGENTS.md) — token pipeline
- [Theme System Guide](./apps/docs/THEMES.md) — legacy theme usage guide
- [Demo Package Documentation](./apps/demo/README.md)

## 📝 License

MIT License — Copyright (c) 2026 Acronis International GmbH

See [LICENSE](./LICENSE) for more details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🔗 Links

- [Base UI](https://base-ui.com/) — unstyled primitives (primary, `ui-react`)
- [shadcn/ui](https://ui.shadcn.com/) — the original inspiration (`ui-legacy`)
- [Radix UI](https://www.radix-ui.com/) — unstyled primitives (`ui-legacy`: NavigationMenu, Slot)
- [Tailwind CSS](https://tailwindcss.com/) — internal build tool
- [DTCG](https://www.designtokens.org/) — design token format used by `design-tokens`
