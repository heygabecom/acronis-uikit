import * as React from 'react';

import { cn } from '@/lib/utils';

// A composable toolbar for data tables: arranges a search field, optional
// filters button, optional tenant/scope switcher, and trailing action buttons
// in a single horizontal row. Maps to the Figma "FilterSearch" component. The
// root container uses 16px inter-item gap (Figma `gap/gap-16`) and centers
// children vertically. `FilterSearchActions` is a right-aligned flex area that
// pushes its content to the trailing edge.
//
// No dedicated token tier — spacing is the Figma `gap/gap-16` semantic token
// (16px), and each child (Search, ButtonMenu, Select) brings its own
// `--ui-*` tier.

export type FilterSearchProps = React.ComponentPropsWithoutRef<'div'>;

const FilterSearch = React.forwardRef<HTMLDivElement, FilterSearchProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center gap-4 px-4 py-6', className)}
      {...props}
    />
  )
);
FilterSearch.displayName = 'FilterSearch';

export type FilterSearchActionsProps = React.ComponentPropsWithoutRef<'div'>;

const FilterSearchActions = React.forwardRef<
  HTMLDivElement,
  FilterSearchActionsProps
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex h-8 min-w-px flex-1 items-center justify-end gap-4', className)}
    {...props}
  />
));
FilterSearchActions.displayName = 'FilterSearchActions';

export { FilterSearch, FilterSearchActions };
