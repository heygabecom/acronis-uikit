// Figma Code Connect — status: COMPLETE
// Mapped to the "FilterSearch" component in the ui-react Figma file.
// Props: hasTenants (bool), hasFilters (bool), ListActions (slot).
import figma from '@figma/code-connect';

import { FilterSearch, FilterSearchActions } from './filter-search';

figma.connect(
  FilterSearch,
  'https://www.figma.com/design/lrU3ydIyvPYQNE6ixdsKtJ/ui-react?node-id=3897-7681',
  {
    props: {
      hasTenants: figma.boolean('hasTenants'),
      hasFilters: figma.boolean('hasFilters'),
      actions: figma.children('ListActions'),
    },
    example: ({ hasTenants, hasFilters, actions }) => (
      <FilterSearch>
        {hasTenants && '<Select>…</Select>'}
        {'<Search placeholder="Placeholder" />'}
        {hasFilters && '<ButtonMenu variant="secondary">Table filters</ButtonMenu>'}
        {actions && <FilterSearchActions>{actions}</FilterSearchActions>}
      </FilterSearch>
    ),
  }
);
