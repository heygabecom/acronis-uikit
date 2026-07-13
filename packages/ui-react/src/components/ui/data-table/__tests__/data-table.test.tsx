import { useState } from 'react';
import {
  type ColumnDef,
  type ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { useFilterSearchFilters } from '../../filter-search';
import {
  DataTable,
  DataTableColumnHeader,
  DataTableExpandTrigger,
  DataTablePagination,
  DataTableToolbar,
} from '../index';

type Row = { id: string; email: string; amount: number };

const data: Row[] = Array.from({ length: 12 }, (_, i) => ({
  id: `r${i + 1}`,
  email: `user${i + 1}@example.com`,
  amount: (i + 1) * 100,
}));

const columns: ColumnDef<Row>[] = [
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'amount', header: 'Amount' },
];

describe('DataTable', () => {
  it('renders the column headers and rows', () => {
    render(<DataTable columns={columns} data={data.slice(0, 3)} />);
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('user1@example.com')).toBeInTheDocument();
    expect(screen.getByText('user3@example.com')).toBeInTheDocument();
  });

  it('shows an empty state with no data', () => {
    render(<DataTable columns={columns} data={[]} />);
    expect(screen.getByText('No results.')).toBeInTheDocument();
  });

  it('sorts a DataTableColumnHeader column in a single click', async () => {
    const sortable: ColumnDef<Row>[] = [
      {
        accessorKey: 'amount',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Amount" />
        ),
        cell: ({ row }) => <span>{row.original.amount}</span>,
      },
    ];
    render(<DataTable columns={sortable} data={data.slice(0, 3)} />);
    const cellsBefore = screen.getAllByRole('cell').map((c) => c.textContent);
    expect(cellsBefore).toEqual(['100', '200', '300']);

    // One click sorts ascending (already ascending → flips to descending here).
    await userEvent.click(screen.getByRole('button', { name: 'Sort by Amount' }));
    const cellsAfter = screen.getAllByRole('cell').map((c) => c.textContent);
    expect(cellsAfter).not.toEqual(cellsBefore);
  });

  it('renders expanded content for an expanded row', async () => {
    const expandable: ColumnDef<Row>[] = [
      {
        id: 'expand',
        header: () => null,
        cell: ({ row }) => (
          <button
            onClick={row.getToggleExpandedHandler()}
            aria-label={row.getIsExpanded() ? 'Collapse row' : 'Expand row'}
          >
            {row.getIsExpanded() ? '-' : '+'}
          </button>
        ),
      },
      { accessorKey: 'email', header: 'Email' },
    ];
    render(
      <DataTable
        columns={expandable}
        data={data.slice(0, 2)}
        getRowCanExpand={() => true}
        renderExpandedRow={(row) => <span>Details for {row.original.id}</span>}
      />
    );
    expect(screen.queryByText('Details for r1')).not.toBeInTheDocument();
    await userEvent.click(screen.getAllByRole('button', { name: 'Expand row' })[0]);
    expect(screen.getByText('Details for r1')).toBeInTheDocument();
  });
});

describe('DataTable column resizing', () => {
  it('renders a resize handle on resizable headers when enabled', () => {
    render(
      <DataTable
        columns={columns}
        data={data.slice(0, 2)}
        enableColumnResizing
      />
    );
    expect(
      screen.getAllByRole('separator', { name: 'Resize column' })
    ).toHaveLength(columns.length);
  });

  it('renders no resize handles by default', () => {
    render(<DataTable columns={columns} data={data.slice(0, 2)} />);
    expect(
      screen.queryByRole('separator', { name: 'Resize column' })
    ).not.toBeInTheDocument();
  });
});

describe('DataTable sticky (pinned) columns', () => {
  it('applies position:sticky to a column pinned via meta', async () => {
    const pinned: ColumnDef<Row>[] = [
      { accessorKey: 'email', header: 'Email', meta: { pin: 'left' } },
      { accessorKey: 'amount', header: 'Amount' },
    ];
    render(<DataTable columns={pinned} data={data.slice(0, 2)} />);
    await waitFor(() => {
      const header = screen.getByText('Email').closest('th')!;
      expect(header.style.position).toBe('sticky');
      expect(header.style.left).toBe('0px');
    });
    // The unpinned column stays static.
    expect(screen.getByText('Amount').closest('th')!.style.position).toBe('');
  });
});

describe('DataTable wrapping (meta.wrap) columns', () => {
  it('wraps a column flagged meta.wrap and drops the fixed row height', () => {
    const wrapped: ColumnDef<Row>[] = [
      { accessorKey: 'email', header: 'Email' },
      {
        accessorKey: 'amount',
        header: 'Amount',
        meta: { wrap: true },
        cell: ({ row }) => <span>{row.original.amount}</span>,
      },
    ];
    render(<DataTable columns={wrapped} data={data.slice(0, 1)} />);

    // The wrap-flagged cell + header get `whitespace-normal` and lose `h-10`.
    const wrapCell = screen.getByText('100').closest('td')!;
    expect(wrapCell).toHaveClass('whitespace-normal');
    expect(wrapCell).not.toHaveClass('h-10');
    const wrapHeader = screen.getByText('Amount').closest('th')!;
    expect(wrapHeader).toHaveClass('whitespace-normal');
    expect(wrapHeader).not.toHaveClass('h-10');

    // The unflagged column keeps the default fixed height / no-wrap.
    const plainCell = screen
      .getByText('user1@example.com')
      .closest('td')!;
    expect(plainCell).toHaveClass('h-10');
    expect(plainCell).not.toHaveClass('whitespace-normal');
  });
});

describe('DataTableExpandTrigger', () => {
  it('toggles row expansion from a column cell', async () => {
    const expandable: ColumnDef<Row>[] = [
      {
        id: 'expand',
        header: () => null,
        cell: ({ row }) => <DataTableExpandTrigger row={row} />,
      },
      { accessorKey: 'email', header: 'Email' },
    ];
    render(
      <DataTable
        columns={expandable}
        data={data.slice(0, 2)}
        getRowCanExpand={() => true}
        renderExpandedRow={(row) => <span>Details for {row.original.id}</span>}
      />
    );
    expect(screen.queryByText('Details for r1')).not.toBeInTheDocument();
    const trigger = screen.getAllByRole('button', { name: 'Expand row' })[0];
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(trigger);
    expect(screen.getByText('Details for r1')).toBeInTheDocument();
    expect(
      screen.getAllByRole('button', { name: 'Collapse row' })[0]
    ).toHaveAttribute('aria-expanded', 'true');
  });

  it('renders nothing when the row cannot expand', () => {
    const expandable: ColumnDef<Row>[] = [
      {
        id: 'expand',
        header: () => null,
        cell: ({ row }) => <DataTableExpandTrigger row={row} />,
      },
      { accessorKey: 'email', header: 'Email' },
    ];
    render(
      <DataTable
        columns={expandable}
        data={data.slice(0, 2)}
        getRowCanExpand={() => false}
        renderExpandedRow={() => null}
      />
    );
    expect(
      screen.queryByRole('button', { name: 'Expand row' })
    ).not.toBeInTheDocument();
  });
});

describe('DataTable presentational features', () => {
  it('stripes alternating rows', () => {
    render(<DataTable columns={columns} data={data.slice(0, 4)} striped />);
    const secondRow = screen.getByText('user2@example.com').closest('tr')!;
    const firstRow = screen.getByText('user1@example.com').closest('tr')!;
    expect(secondRow.className).toContain(
      'bg-[var(--ui-background-surface-secondary)]'
    );
    expect(firstRow.className).not.toContain(
      'bg-[var(--ui-background-surface-secondary)]'
    );
  });

  it('adds vertical borders when bordered', () => {
    const { container } = render(
      <DataTable columns={columns} data={data.slice(0, 2)} bordered />
    );
    const wrapper = container.querySelector('div.rounded-md') as HTMLElement;
    expect(wrapper.className).toContain('[&_td:not(:last-child)]:border-e');
  });

  it('renders skeleton placeholder rows instead of data', () => {
    const { container } = render(
      <DataTable columns={columns} data={data} skeleton skeletonRows={3} />
    );
    expect(screen.queryByText('user1@example.com')).not.toBeInTheDocument();
    // 3 rows × 2 columns of pulse bars
    expect(container.querySelectorAll('.animate-pulse')).toHaveLength(6);
  });

  it('highlights the clicked row when highlightCurrentRow', async () => {
    render(
      <DataTable columns={columns} data={data.slice(0, 3)} highlightCurrentRow />
    );
    const row = screen.getByText('user2@example.com').closest('tr')!;
    // Exact class token — the primitive carries `active:bg-[…row-color-active]`
    // for its pressed pseudo-state, so a substring check would collide.
    const current = 'bg-[var(--ui-table-global-row-color-active)]';
    const classes = (el: HTMLElement) => el.className.split(/\s+/);
    expect(classes(row)).not.toContain(current);
    await userEvent.click(row);
    expect(classes(row)).toContain(current);
  });
});

function Harness() {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    initialState: { pagination: { pageSize: 5 } },
    state: { columnFilters },
  });
  return (
    <div>
      <DataTableToolbar table={table} searchKey="email" searchPlaceholder="Filter emails…" />
      <div data-testid="page-rows">
        {table.getRowModel().rows.map((r) => (
          <span key={r.id}>{r.original.email}</span>
        ))}
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}

describe('DataTableToolbar + DataTablePagination', () => {
  it('renders `leading` before the search box', () => {
    function LeadingHarness() {
      const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
      });
      return (
        <DataTableToolbar
          table={table}
          leading={<button>Acme Corp</button>}
          searchKey="email"
          searchPlaceholder="Filter emails…"
        />
      );
    }
    render(<LeadingHarness />);
    expect(
      screen.getByRole('button', { name: 'Acme Corp' })
    ).toBeInTheDocument();
  });

  it('filters rows via the search box', async () => {
    render(<Harness />);
    const search = screen.getByPlaceholderText('Filter emails…');
    await userEvent.type(search, 'user11');
    const rows = within(screen.getByTestId('page-rows'));
    expect(rows.getByText('user11@example.com')).toBeInTheDocument();
    expect(rows.queryByText('user1@example.com')).not.toBeInTheDocument();
  });

  it('paginates to the next page', async () => {
    render(<Harness />);
    const rows = () => within(screen.getByTestId('page-rows'));
    expect(rows().getByText('user1@example.com')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Go to next page' }));
    expect(rows().queryByText('user1@example.com')).not.toBeInTheDocument();
    expect(rows().getByText('user6@example.com')).toBeInTheDocument();
  });
});

const filterColumns: ColumnDef<Row>[] = [
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'amount', header: 'Amount', filterFn: 'weakEquals' },
];

function AmountFilterField() {
  const { filters, setFilter } = useFilterSearchFilters();
  return (
    <input
      aria-label="Amount filter"
      value={(filters.amount as string) ?? ''}
      onChange={(event) =>
        setFilter('amount', event.target.value || undefined)
      }
    />
  );
}

function FilterHarness() {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const table = useReactTable({
    data,
    columns: filterColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: { columnFilters },
  });
  return (
    <div>
      <DataTableToolbar table={table}>
        <AmountFilterField />
      </DataTableToolbar>
      <div data-testid="page-rows">
        {table.getRowModel().rows.map((r) => (
          <span key={r.id}>{r.original.email}</span>
        ))}
      </div>
    </div>
  );
}

describe('DataTableToolbar per-column filtering', () => {
  it('applies a column filter through the FilterSearchFilters popover', async () => {
    render(<FilterHarness />);
    const rows = () => within(screen.getByTestId('page-rows'));
    expect(rows().getByText('user1@example.com')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Filters' }));
    await userEvent.type(
      screen.getByLabelText('Amount filter'),
      '300'
    );
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }));

    expect(rows().getByText('user3@example.com')).toBeInTheDocument();
    expect(rows().queryByText('user1@example.com')).not.toBeInTheDocument();
    // The applied filter surfaces as a removable chip.
    expect(
      screen.getByRole('button', { name: 'Remove amount filter' })
    ).toBeInTheDocument();
  });
});
