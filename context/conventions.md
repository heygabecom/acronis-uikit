# Coding conventions

Applies to all workspaces. Workspace-specific exceptions live in the
workspace's own `AGENTS.md`.

## React + TypeScript

- React **functional components** only. No class components.
- TypeScript across the board. No `.js` for new code.
- Use `React.forwardRef` for components that accept refs (most UI primitives do).
- Define prop interfaces that extend the appropriate HTML attribute type:
  `interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { ... }`.
- Use `VariantProps<typeof buttonVariants>` from `class-variance-authority` for variant typing.

## Naming

- **Components**: PascalCase (`Button`, `Card`, `DataTable`).
- **Files**: kebab-case (`button.tsx`, `data-table.tsx`).
- **Directories**: kebab-case to match the file inside.
- **Stories and tests** live under `__stories__/` and `__tests__/` next to the component.

## Styling

- **Tailwind CSS v4** utility classes. No CSS modules, no styled-components.
- **CSS variables** for themeable values, prefixed `--av-` (e.g. `var(--av-primary)`).
  Full list and theme files: see `context/theming.md`.
- Use `cn()` (from `@acronis-platform/shadcn-uikit`'s `lib/utils`) to merge
  class names with conditional logic. It wraps `clsx` + `tailwind-merge`.
- Variant management: **`class-variance-authority` (CVA)**. Define a
  `xxxVariants` CVA function next to the component; expose its variants
  via `VariantProps`.

## Accessibility

- Build on **Radix UI** and **Base UI** (`@base-ui/react`) primitives —
  both are peer dependencies of the published library and handle
  keyboard nav, focus management, and ARIA attributes. The library
  pulls a couple of Radix primitives as direct deps (`react-slot`,
  `react-navigation-menu`); everything else comes from peers.
- Don't reinvent dialogs, popovers, menus, etc. from scratch.
- A11y is verified in Storybook via `@storybook/addon-a11y` — see
  `context/testing.md`.

## File layout per component (in `packages/legacy/ui/`)

```
src/components/ui/<component>/
├── <component>.tsx           # component source
├── <component>.docs.ts       # optional: explicit type interfaces for AutoTypeTable
├── __tests__/
│   └── <component>.test.tsx
└── __stories__/
    └── <component>.stories.tsx
```

The `.docs.ts` companion is only added when `AutoTypeTable` cannot resolve
types from the source alone (compound components, re-exported Radix
types, complex CVA generics). 8 of them exist today — only add a new one
when `AutoTypeTable` produces an unhelpful table.

## Editing rules

- **Imports at the top of the file.** Never inline an import mid-file.
- Don't disable ESLint rules to silence warnings — fix the underlying issue.
- Don't add comments that restate what the code does. Comments should
  explain *why* (a non-obvious constraint, a workaround, an invariant).
- Don't add features, refactors, or abstractions beyond what the task
  requires. A bug fix is a bug fix.
