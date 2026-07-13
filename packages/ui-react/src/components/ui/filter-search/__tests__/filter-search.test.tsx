import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import {
  FilterSearch,
  FilterSearchActions,
  FilterSearchAppliedFilters,
  FilterSearchFilters,
  useFilterSearchFilters,
} from '../filter-search';

describe('FilterSearch', () => {
  it('renders a div with default flex layout', () => {
    render(<FilterSearch data-testid="root" />);
    const el = screen.getByTestId('root');
    expect(el.tagName).toBe('DIV');
    expect(el.className).toContain('flex');
    expect(el.className).toContain('gap-4');
  });

  it('forwards ref', () => {
    const ref = { current: null } as React.RefObject<HTMLDivElement | null>;
    render(<FilterSearch ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('merges custom className', () => {
    render(<FilterSearch data-testid="root" className="my-class" />);
    const el = screen.getByTestId('root');
    expect(el.className).toContain('my-class');
  });

  it('renders children', () => {
    render(
      <FilterSearch>
        <span>child</span>
      </FilterSearch>
    );
    expect(screen.getByText('child')).toBeInTheDocument();
  });

  it('spreads native HTML attributes', () => {
    render(<FilterSearch data-testid="root" aria-label="Table toolbar" />);
    expect(screen.getByTestId('root')).toHaveAttribute(
      'aria-label',
      'Table toolbar'
    );
  });
});

describe('FilterSearchActions', () => {
  it('renders a div with flex-1 and right-aligned layout', () => {
    render(<FilterSearchActions data-testid="actions" />);
    const el = screen.getByTestId('actions');
    expect(el.tagName).toBe('DIV');
    expect(el.className).toContain('flex-1');
    expect(el.className).toContain('justify-end');
  });

  it('forwards ref', () => {
    const ref = { current: null } as React.RefObject<HTMLDivElement | null>;
    render(<FilterSearchActions ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('renders action children', () => {
    render(
      <FilterSearchActions>
        <button>Action</button>
      </FilterSearchActions>
    );
    expect(screen.getByText('Action')).toBeInTheDocument();
  });
});

describe('FilterSearch composition', () => {
  it('renders a full toolbar layout', () => {
    render(
      <FilterSearch data-testid="toolbar">
        <input placeholder="Search" aria-label="Search" />
        <button>Table filters</button>
        <FilterSearchActions>
          <button>Export</button>
        </FilterSearchActions>
      </FilterSearch>
    );
    const toolbar = screen.getByTestId('toolbar');
    expect(toolbar.children).toHaveLength(3);
    expect(screen.getByPlaceholderText('Search')).toBeInTheDocument();
    expect(screen.getByText('Table filters')).toBeInTheDocument();
    expect(screen.getByText('Export')).toBeInTheDocument();
  });
});

// A field child wired to the draft via the context hook, exactly as a consumer
// would wire a real field (InputSelect, Search, …) inside the popover.
function StatusField() {
  const { filters, setFilter } = useFilterSearchFilters();
  return (
    <div>
      <span data-testid="draft-status">{String(filters.status ?? '')}</span>
      <button type="button" onClick={() => setFilter('status', 'active')}>
        Set status
      </button>
      <button type="button" onClick={() => setFilter('status', undefined)}>
        Clear status
      </button>
    </div>
  );
}

function FiltersHarness({
  initial,
  onValueChange,
  onApply,
}: {
  initial?: Record<string, unknown>;
  onValueChange?: (next: Record<string, unknown>) => void;
  onApply?: (filters: Record<string, unknown>) => void;
}) {
  const [value, setValue] = useState<Record<string, unknown>>(initial ?? {});
  return (
    <FilterSearchFilters
      value={value}
      onValueChange={(next) => {
        setValue(next);
        onValueChange?.(next);
      }}
      onApply={onApply}
    >
      <StatusField />
    </FilterSearchFilters>
  );
}

describe('FilterSearchFilters', () => {
  it('renders the filter trigger', () => {
    render(<FiltersHarness />);
    expect(screen.getByRole('button', { name: 'Filters' })).toBeInTheDocument();
  });

  it('opens the popover from the trigger', async () => {
    const user = userEvent.setup();
    render(<FiltersHarness />);
    expect(screen.queryByText('Set status')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Filters' }));
    expect(screen.getByText('Set status')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Apply' })).toBeInTheDocument();
  });

  it('applies the drafted filters on Apply', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const onApply = vi.fn();
    render(<FiltersHarness onValueChange={onValueChange} onApply={onApply} />);

    await user.click(screen.getByRole('button', { name: 'Filters' }));
    await user.click(screen.getByRole('button', { name: 'Set status' }));
    expect(screen.getByTestId('draft-status')).toHaveTextContent('active');

    await user.click(screen.getByRole('button', { name: 'Apply' }));
    expect(onValueChange).toHaveBeenCalledWith({ status: 'active' });
    expect(onApply).toHaveBeenCalledWith({ status: 'active' });
    expect(screen.queryByText('Set status')).not.toBeInTheDocument();
  });

  it('deletes the draft key instead of committing undefined', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <FiltersHarness initial={{ status: 'active' }} onValueChange={onValueChange} />
    );

    await user.click(screen.getByRole('button', { name: 'Filters' }));
    await user.click(screen.getByRole('button', { name: 'Clear status' }));
    expect(screen.getByTestId('draft-status')).toHaveTextContent('');

    await user.click(screen.getByRole('button', { name: 'Apply' }));
    expect(onValueChange).toHaveBeenCalledWith({});
  });

  it('reverts the draft on Cancel without applying', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<FiltersHarness onValueChange={onValueChange} />);

    await user.click(screen.getByRole('button', { name: 'Filters' }));
    await user.click(screen.getByRole('button', { name: 'Set status' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onValueChange).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Filters' }));
    expect(screen.getByTestId('draft-status')).toHaveTextContent('');
  });

  it('reverts the draft on Escape without applying', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<FiltersHarness onValueChange={onValueChange} />);

    await user.click(screen.getByRole('button', { name: 'Filters' }));
    await user.click(screen.getByRole('button', { name: 'Set status' }));
    await user.keyboard('{Escape}');
    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.queryByText('Set status')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Filters' }));
    expect(screen.getByTestId('draft-status')).toHaveTextContent('');
  });

  it('reverts the draft on an outside press without applying', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<FiltersHarness onValueChange={onValueChange} />);

    await user.click(screen.getByRole('button', { name: 'Filters' }));
    await user.click(screen.getByRole('button', { name: 'Set status' }));
    await user.click(document.body);
    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.queryByText('Set status')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Filters' }));
    expect(screen.getByTestId('draft-status')).toHaveTextContent('');
  });

  it('disables Reset filters when nothing is drafted and clears when pressed', async () => {
    const user = userEvent.setup();
    render(<FiltersHarness initial={{ status: 'active' }} />);

    await user.click(screen.getByRole('button', { name: 'Filters' }));
    const reset = screen.getByRole('button', { name: 'Reset filters' });
    expect(reset).toBeEnabled();
    await user.click(reset);
    expect(screen.getByTestId('draft-status')).toHaveTextContent('');
  });

  it('disables Apply until the draft actually changes', async () => {
    const user = userEvent.setup();
    render(<FiltersHarness initial={{ status: 'active' }} />);

    await user.click(screen.getByRole('button', { name: 'Filters' }));
    expect(screen.getByRole('button', { name: 'Apply' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Set status' }));
    expect(screen.getByRole('button', { name: 'Apply' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Reset filters' }));
    expect(screen.getByRole('button', { name: 'Apply' })).toBeEnabled();
  });
});

describe('FilterSearchAppliedFilters', () => {
  it('renders nothing when there are no applied filters', () => {
    render(
      <FilterSearchAppliedFilters
        data-testid="applied"
        filters={{}}
        onValueChange={() => {}}
      />
    );
    expect(screen.queryByTestId('applied')).not.toBeInTheDocument();
  });

  it('renders one removable chip per applied filter plus a Reset filters action', () => {
    render(
      <FilterSearchAppliedFilters
        filters={{ status: 'active', type: 'server' }}
        onValueChange={() => {}}
      />
    );
    expect(screen.getByText('status: active')).toBeInTheDocument();
    expect(screen.getByText('type: server')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reset filters' })).toBeInTheDocument();
  });

  it('removes a single filter when its chip is removed', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <FilterSearchAppliedFilters
        filters={{ status: 'active', type: 'server' }}
        onValueChange={onValueChange}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Remove status filter' }));
    expect(onValueChange).toHaveBeenCalledWith({ type: 'server' });
  });

  it('clears all filters when Reset filters is pressed', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <FilterSearchAppliedFilters
        filters={{ status: 'active', type: 'server' }}
        onValueChange={onValueChange}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Reset filters' }));
    expect(onValueChange).toHaveBeenCalledWith({});
  });

  it('formats an object filter value as JSON instead of [object Object]', () => {
    render(
      <FilterSearchAppliedFilters
        filters={{ range: { min: 1, max: 10 } }}
        onValueChange={() => {}}
      />
    );
    expect(
      screen.getByText('range: {"min":1,"max":10}')
    ).toBeInTheDocument();
  });

  it('formats an array filter value as a comma-separated list', () => {
    render(
      <FilterSearchAppliedFilters
        filters={{ status: ['active', 'pending'] }}
        onValueChange={() => {}}
      />
    );
    expect(screen.getByText('status: active, pending')).toBeInTheDocument();
  });

  it('supports a custom chip label formatter', () => {
    render(
      <FilterSearchAppliedFilters
        filters={{ status: 'active' }}
        onValueChange={() => {}}
        getFilterChipLabel={(key, value) => `${key.toUpperCase()}=${value}`}
      />
    );
    expect(screen.getByText('STATUS=active')).toBeInTheDocument();
  });
});
