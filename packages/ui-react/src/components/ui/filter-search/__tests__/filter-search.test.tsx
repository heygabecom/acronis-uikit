import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { FilterSearch, FilterSearchActions } from '../filter-search';

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
