import {
  type CSSProperties,
  Fragment,
  type ReactNode,
  useEffect,
  useState,
} from 'react';
import {
  type Cell,
  type Column,
  type ColumnDef,
  type ColumnFiltersState,
  type ColumnSizingState,
  type ExpandedState,
  type Header,
  type OnChangeFn,
  type Row,
  type RowData,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';

import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../table';

// Ported from `@acronis-platform/shadcn-uikit`'s `data-table`
// (packages/ui-legacy/src/components/ui/data-table/). A TanStack-react-table v8
// data grid composed over the ui-react Table primitives — sorting, filtering,
// column visibility, row selection, pagination, and optional row expansion. The
// presentational flags (`striped`, `bordered`, `skeleton`, `highlightCurrentRow`)
// are borrowed from the Vue `AvTable`; behavioral features come from TanStack.
// Pair with DataTableToolbar / DataTablePagination / DataTableColumnHeader, which
// take the `table` instance returned to column cells via TanStack context.
// The grid cells/rows/headers are themed by the Table primitives' `--ui-table-*`
// tier; DataTable's own chrome reuses that tier too — the wrapper border matches
// the cell borders (`--ui-table-global-cell-border-color`), the empty-state uses
// the muted table-value color, the current row the active-row color, and stripes
// the secondary surface.
//
// Advanced-grid opt-ins built on native TanStack features:
//   • Column resizing  -> `enableColumnResizing` + `columnResizing` state, with a
//     drag handle rendered from `header.getResizeHandler()`.
//   • Sticky columns   -> `ColumnDef.meta.pin: 'left' | 'right'` drives TanStack's
//     native column-pinning API (`column.pin()` / `getStart()` / `getAfter()`),
//     surfaced as `position: sticky` cells with an opaque row-token background.

// Extend TanStack's per-column `meta` with the flags DataTable reads. Augmenting
// the module keeps `ColumnDef.meta.pin` type-safe at the call site.
declare module '@tanstack/react-table' {
  // Type params must match TanStack's `ColumnMeta<TData, TValue>` arity/names for
  // declaration merging, even though this augmentation doesn't reference them.
  // eslint-disable-next-line unused-imports/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    /** Pin the column to a table edge (sticky while the grid scrolls horizontally). */
    pin?: 'left' | 'right';
    /**
     * Let the column's header + cells wrap onto multiple lines (drops the fixed
     * row height); mirrors the `Table` primitives' `wrap` prop on TableHead/TableCell.
     */
    wrap?: boolean;
  }
}

// Sticky offset + stacking for a pinned column, computed from TanStack's own
// pinning geometry rather than hand-rolled CSS math. A subtle edge shadow (facing
// the scrollable columns) separates the pinned column from content sliding
// underneath it — the opaque background that actually hides that content lives
// in the caller's className (see `headerPinnedBg`/`rowBg` below), not here.
function getPinnedStyle<TData>(
  column: Column<TData, unknown>
): CSSProperties | undefined {
  const pinned = column.getIsPinned();
  if (!pinned) return undefined;
  return {
    position: 'sticky',
    left: pinned === 'left' ? column.getStart('left') : undefined,
    right: pinned === 'right' ? column.getAfter('right') : undefined,
    zIndex: 1,
    // Derived from the same border token every other table divider uses (not a
    // hardcoded color), so the separator theme-adapts automatically.
    boxShadow:
      pinned === 'left'
        ? '4px 0 4px -4px var(--ui-table-global-cell-border-color)'
        : '-4px 0 4px -4px var(--ui-table-global-cell-border-color)',
  };
}

// A column's rendered width tracks TanStack's size model once the consumer has
// opted in — either explicitly (a `size` set on the `ColumnDef`) or implicitly
// (column resizing enabled, which needs every column's width to be deterministic
// for the drag math to work). Without either, columns stay in native `<table>`
// auto-layout so `size`'s internal default (TanStack falls back to 150) never
// forces every untouched column to a fixed width.
function getColumnWidth<TData>(
  column: Column<TData, unknown>,
  enableColumnResizing: boolean
): number | undefined {
  if (enableColumnResizing || column.columnDef.size !== undefined) {
    return column.getSize();
  }
  return undefined;
}

function getHeaderStyle<TData>(
  header: Header<TData, unknown>,
  enableColumnResizing: boolean
): CSSProperties | undefined {
  const pin = getPinnedStyle(header.column);
  const width = getColumnWidth(header.column, enableColumnResizing);
  if (!pin && width === undefined) return undefined;
  return { ...pin, width };
}

function getCellStyle<TData>(
  cell: Cell<TData, unknown>,
  enableColumnResizing: boolean
): CSSProperties | undefined {
  const pin = getPinnedStyle(cell.column);
  const width = getColumnWidth(cell.column, enableColumnResizing);
  if (!pin && width === undefined) return undefined;
  return { ...pin, width };
}

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  /** Enables row expansion for rows that return true. Pair with `renderExpandedRow`. */
  getRowCanExpand?: (row: Row<TData>) => boolean;
  /**
   * Renders expanded content for an expanded row. Used together with
   * `getRowCanExpand`.
   */
  renderExpandedRow?: (row: Row<TData>) => ReactNode;
  /** Alternating row backgrounds. */
  striped?: boolean;
  /** Vertical borders between columns (rows already have horizontal borders). */
  bordered?: boolean;
  /** Highlight the row the user last clicked (the "current" row). */
  highlightCurrentRow?: boolean;
  /** Render placeholder skeleton rows instead of data (loading state). */
  skeleton?: boolean;
  /** Number of skeleton rows to render when `skeleton` is set. */
  skeletonRows?: number;
  /**
   * Opt in to interactive column resizing. Renders a drag handle at the trailing
   * edge of each resizable header cell (TanStack's native `columnResizing`).
   */
  enableColumnResizing?: boolean;
  /** Passthrough for the `columnSizing` state so a consumer can persist widths. */
  onColumnSizingChange?: OnChangeFn<ColumnSizingState>;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  getRowCanExpand,
  renderExpandedRow,
  striped = false,
  bordered = false,
  highlightCurrentRow = false,
  skeleton = false,
  skeletonRows = 5,
  enableColumnResizing = false,
  onColumnSizingChange,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({});
  const [currentRowId, setCurrentRowId] = useState<string>();

  const handleColumnSizingChange: OnChangeFn<ColumnSizingState> = (updater) => {
    setColumnSizing(updater);
    onColumnSizingChange?.(updater);
  };

  const table = useReactTable({
    data,
    columns,
    enableColumnResizing,
    columnResizeMode: 'onChange',
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowCanExpand,
    onExpandedChange: setExpanded,
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onColumnSizingChange: handleColumnSizingChange,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      expanded,
      columnSizing,
    },
  });

  // Read each column's `meta.pin` and drive TanStack's native pinning state.
  useEffect(() => {
    table.getAllLeafColumns().forEach((column) => {
      const pin = column.columnDef.meta?.pin;
      if (pin) column.pin(pin);
    });
  }, [table, columns]);

  const rows = table.getRowModel().rows;
  // Vertical borders are opt-in; a trailing border on the last cell would
  // double up with the wrapper, so suppress it.
  const borderedClass = bordered
    ? '[&_th:not(:last-child)]:border-e [&_td:not(:last-child)]:border-e [&_th]:border-[var(--ui-table-global-cell-border-color)] [&_td]:border-[var(--ui-table-global-cell-border-color)]'
    : undefined;

  // A pinned header/body cell must be opaque so the cells scrolling under it
  // (same row) aren't visible. `--ui-table-global-row-color-idle` is
  // *transparent by design* (an idle row shows the page/card surface through
  // it), so it can't be reused here — pinned idle cells need the actual
  // resolved surface color instead (`--ui-background-surface-primary`, bridged
  // to `bg-background`). Non-idle states (selected/current/striped) already use
  // real opaque tokens and are safe to mirror as-is (see `rowBg` below).
  const headerPinnedBg = 'bg-background';

  return (
    <div
      className={cn(
        'rounded-md border border-[var(--ui-table-global-cell-border-color)]',
        borderedClass
      )}
    >
      <Table
        style={
          enableColumnResizing
            ? { width: table.getCenterTotalSize() }
            : undefined
        }
      >
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const isPinned = header.column.getIsPinned();
                const canResize =
                  enableColumnResizing && header.column.getCanResize();
                return (
                  <TableHead
                    key={header.id}
                    wrap={header.column.columnDef.meta?.wrap}
                    style={getHeaderStyle(header, enableColumnResizing)}
                    className={cn(
                      canResize && 'relative',
                      isPinned && headerPinnedBg
                    )}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    {canResize && (
                      <div
                        role="separator"
                        aria-orientation="vertical"
                        aria-label="Resize column"
                        onMouseDown={header.getResizeHandler()}
                        onTouchStart={header.getResizeHandler()}
                        className={cn(
                          'absolute end-0 top-0 h-full w-1 cursor-col-resize touch-none select-none bg-[var(--ui-table-global-cell-border-color)] opacity-0 transition-opacity hover:opacity-100',
                          header.column.getIsResizing() && 'opacity-100'
                        )}
                      />
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {skeleton ? (
            Array.from({ length: skeletonRows }).map((_, rowIndex) => (
              <TableRow key={`skeleton-${rowIndex}`} className="hover:bg-transparent">
                {table.getVisibleLeafColumns().map((column) => (
                  <TableCell key={column.id}>
                    <div className="h-4 w-full animate-pulse rounded bg-[var(--ui-background-surface-secondary)]" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : rows?.length ? (
            rows.map((row, rowIndex) => {
              const isSelected = row.getIsSelected();
              const isCurrent = highlightCurrentRow && currentRowId === row.id;
              // Opaque background applied to pinned cells so sibling cells don't
              // show through while the grid scrolls horizontally. Mirrors the
              // row's own resolved background across selection/current/stripe —
              // the idle case falls back to the real surface color
              // (`bg-background`) since the row's own idle token is transparent
              // by design (see `headerPinnedBg` above).
              const rowBg =
                isSelected || isCurrent
                  ? 'bg-[var(--ui-table-global-row-color-active)]'
                  : striped && rowIndex % 2 === 1
                    ? 'bg-[var(--ui-background-surface-secondary)]'
                    : 'bg-background';
              return (
                <Fragment key={row.id}>
                  <TableRow
                    selected={isSelected}
                    onClick={
                      highlightCurrentRow
                        ? () => setCurrentRowId(row.id)
                        : undefined
                    }
                    className={cn(
                      highlightCurrentRow && 'cursor-pointer',
                      striped &&
                        rowIndex % 2 === 1 &&
                        !isSelected &&
                        !isCurrent &&
                        'bg-[var(--ui-background-surface-secondary)]',
                      isCurrent &&
                        !isSelected &&
                        'bg-[var(--ui-table-global-row-color-active)]'
                    )}
                  >
                    {row.getVisibleCells().map((cell) => {
                      const isPinned = cell.column.getIsPinned();
                      return (
                        <TableCell
                          key={cell.id}
                          wrap={cell.column.columnDef.meta?.wrap}
                          style={getCellStyle(cell, enableColumnResizing)}
                          className={cn(isPinned && rowBg)}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                  {renderExpandedRow && row.getIsExpanded() && (
                    <TableRow className="hover:bg-transparent">
                      <TableCell
                        className="h-auto py-3"
                        colSpan={row.getVisibleCells().length}
                      >
                        {renderExpandedRow(row)}
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              );
            })
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-[var(--ui-table-data-value-color-disabled)]"
              >
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
