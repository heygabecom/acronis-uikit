---
'@acronis-platform/ui-react': minor
---

`DataTable` gains five additive, opt-in props for server-driven usage — no
existing call site needs to change:

- `table` — render from an externally-built TanStack `table` instance instead
  of DataTable's own, so it composes with a caller's manual sorting/filtering/
  pagination/row models or a shared toolbar instance.
- `manualSorting` + controlled `sorting`/`onSortingChange` — a lightweight
  opt-out of client-side sorting without needing a full external instance.
- `renderRow` — bypass the default per-cell rendering path for a custom
  (independently memoizable) row component.
- `renderEmptyState` — replace the default "No results." row with custom,
  filter-aware content (`hasFilters` in context). Also fixes the empty-state
  `colSpan` to use the visible column count instead of the full column count.
- `paginationMode="infinite"` + `onLoadMore`/`hasNextPage`/`isLoadingMore` — a
  sentinel row + `IntersectionObserver` for non-virtualized infinite scroll.

Also exports `getCellStyle`/`getPinnedStyle`/`getColumnWidth` from
`data-table.tsx` and adds a new `useIntersectionObserver` hook to `@/hooks`.
