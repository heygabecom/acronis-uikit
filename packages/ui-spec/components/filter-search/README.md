# FilterSearch

A composable toolbar for data tables that arranges a search field, optional
filter controls, an optional scope/tenant switcher, and trailing action buttons
in a single horizontal row.

## When to Use

- Above a data table to provide search, filtering, and bulk action controls.
- When the table needs a consistent toolbar layout across views.

## When NOT to Use

- **Global search** — use SearchGlobal.
- **Form layouts** — use a form component, not a toolbar.
- **Navigation bars** — use a dedicated nav component.

## Parts

| Part                  | Element | Role                                           |
| --------------------- | ------- | ---------------------------------------------- |
| `FilterSearch`        | `<div>` | Root flex container (16px gap, center-aligned) |
| `FilterSearchActions` | `<div>` | Right-aligned area for action buttons          |

## Quick Examples

### React

```tsx
import { FilterSearch, FilterSearchActions } from '@acronis-platform/ui-react';
import { Search } from '@acronis-platform/ui-react';
import { ButtonMenu } from '@acronis-platform/ui-react';
import { Button } from '@acronis-platform/ui-react';

function TableToolbar() {
  return (
    <FilterSearch>
      <Search placeholder="Search table" aria-label="Search" className="w-56" />
      <ButtonMenu variant="secondary">Table filters</ButtonMenu>
      <FilterSearchActions>
        <Button>Export</Button>
      </FilterSearchActions>
    </FilterSearch>
  );
}
```

### With tenant switcher

```tsx
<FilterSearch>
  <Select defaultValue="all">
    <SelectTrigger className="w-56">
      <SelectValue placeholder="All customers" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">All customers</SelectItem>
    </SelectContent>
  </Select>
  <Search placeholder="Search table" aria-label="Search" className="w-56" />
  <ButtonMenu variant="secondary">Table filters</ButtonMenu>
</FilterSearch>
```

## Spec Files

| File               | Contents                                             |
| ------------------ | ---------------------------------------------------- |
| `index.yaml`       | Identity, status, category, dependencies, Figma link |
| `anatomy.yaml`     | Root, parts, layout                                  |
| `api.yaml`         | Framework-agnostic contract + framework adapters     |
| `tokens.yaml`      | No dedicated tokens (pure layout wrapper)            |
| `behavior.md`      | Given/When/Then behavior scenarios                   |
| `accessibility.md` | ARIA guidance (delegated to child components)        |
