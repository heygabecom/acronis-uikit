import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  Toolbar,
  ToolbarActions,
  ToolbarActionList,
  computeVisibleActionCount,
  type ToolbarActionListItem,
} from '../toolbar';
import { Button } from '../../button';

// happy-dom's layout metrics are always 0, so every action/trigger measures
// as 0-width and the collapse math trivially decides "everything fits" —
// mock the prototype getters to simulate real geometry.
function mockGeometry({
  itemWidth,
  clientWidth,
}: {
  itemWidth: number;
  clientWidth: number;
}) {
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
    width: itemWidth,
    height: 32,
    top: 0,
    left: 0,
    right: itemWidth,
    bottom: 32,
    x: 0,
    y: 0,
    toJSON: () => {},
  } as DOMRect);
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(
    clientWidth
  );
}

const THREE_ACTIONS: ToolbarActionListItem[] = [
  { key: 'a', label: 'First action' },
  { key: 'b', label: 'Second action' },
  { key: 'c', label: 'Third action' },
];

describe('Toolbar', () => {
  it('renders a fieldset with default flex layout', () => {
    render(<Toolbar data-testid="root" />);
    const el = screen.getByTestId('root');
    expect(el.tagName).toBe('FIELDSET');
    expect(el.className).toContain('flex');
    expect(el.className).toContain('gap-4');
  });

  it('forwards ref', () => {
    const ref = { current: null } as React.RefObject<HTMLFieldSetElement | null>;
    render(<Toolbar ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLFieldSetElement);
  });

  it('merges custom className', () => {
    render(<Toolbar data-testid="root" className="my-class" />);
    expect(screen.getByTestId('root').className).toContain('my-class');
  });

  it('renders children', () => {
    render(
      <Toolbar>
        <Button>First action</Button>
      </Toolbar>
    );
    expect(screen.getByRole('button', { name: 'First action' })).toBeInTheDocument();
  });

  it('spreads native HTML attributes', () => {
    render(<Toolbar data-testid="root" aria-label="Bulk actions" />);
    expect(screen.getByTestId('root')).toHaveAttribute(
      'aria-label',
      'Bulk actions'
    );
  });

  it('disables every nested control when disabled', () => {
    render(
      <Toolbar disabled>
        <Button>First action</Button>
        <Button>Second action</Button>
      </Toolbar>
    );
    expect(screen.getByRole('button', { name: 'First action' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Second action' })).toBeDisabled();
  });

  it('leaves nested controls enabled by default', () => {
    render(
      <Toolbar>
        <Button>First action</Button>
      </Toolbar>
    );
    expect(screen.getByRole('button', { name: 'First action' })).not.toBeDisabled();
  });
});

describe('ToolbarActions', () => {
  it('renders a div that grows but never shrinks, right-aligned', () => {
    render(<ToolbarActions data-testid="actions" />);
    const el = screen.getByTestId('actions');
    expect(el.tagName).toBe('DIV');
    expect(el.className).toContain('grow');
    expect(el.className).toContain('shrink-0');
    expect(el.className).toContain('justify-end');
  });

  it('forwards ref', () => {
    const ref = { current: null } as React.RefObject<HTMLDivElement | null>;
    render(<ToolbarActions ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('disables nested controls when its parent Toolbar is disabled', () => {
    render(
      <Toolbar disabled>
        <ToolbarActions>
          <Button>Deselect</Button>
        </ToolbarActions>
      </Toolbar>
    );
    expect(screen.getByRole('button', { name: 'Deselect' })).toBeDisabled();
  });
});

describe('computeVisibleActionCount', () => {
  it('shows every item when they all fit', () => {
    expect(computeVisibleActionCount([100, 100, 100], 100, 16, 400)).toBe(3);
  });

  it('reserves room for the overflow trigger once items no longer fit', () => {
    // 3×100 + 2×16 gaps = 332, doesn't fit 250 → falls back to the
    // trigger-reserved branch: 100 (trigger) + 100 (item) + 16 (gap) = 216 ≤ 250,
    // but a second item would push it to 332 > 250.
    expect(computeVisibleActionCount([100, 100, 100], 100, 16, 250)).toBe(1);
  });

  it('shows only the trigger when nothing fits alongside it', () => {
    expect(computeVisibleActionCount([100, 100, 100], 100, 16, 200)).toBe(0);
  });

  it('returns 0 for an empty item list', () => {
    expect(computeVisibleActionCount([], 100, 16, 400)).toBe(0);
  });
});

describe('ToolbarActionList', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders every action inline when they all fit', () => {
    mockGeometry({ itemWidth: 100, clientWidth: 400 });
    render(
      <Toolbar>
        <ToolbarActionList actions={THREE_ACTIONS} />
      </Toolbar>
    );
    expect(screen.getByRole('button', { name: 'First action' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Second action' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Third action' })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'More actions' })
    ).not.toBeInTheDocument();
  });

  it('collapses trailing actions into the overflow menu once they no longer fit', () => {
    mockGeometry({ itemWidth: 100, clientWidth: 250 });
    render(
      <Toolbar>
        <ToolbarActionList actions={THREE_ACTIONS} />
      </Toolbar>
    );
    expect(screen.getByRole('button', { name: 'First action' })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Second action' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Third action' })
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'More actions' })).toBeInTheDocument();
  });

  it('accounts for a sibling ToolbarActions when measuring available width', () => {
    // Without subtracting the sibling's width + gap, 300 would fit 1 item;
    // with it correctly subtracted, nothing fits alongside the trigger.
    mockGeometry({ itemWidth: 100, clientWidth: 300 });
    render(
      <Toolbar>
        <ToolbarActionList actions={THREE_ACTIONS} />
        <ToolbarActions>
          <span>Status</span>
        </ToolbarActions>
      </Toolbar>
    );
    expect(
      screen.queryByRole('button', { name: 'First action' })
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'More actions' })).toBeInTheDocument();
  });

  it('opens the overflow menu and fires onSelect for a hidden action', async () => {
    // Same 3-item/250px shape as the collapse test above: 1 visible, 2 hidden.
    const onSelect = vi.fn();
    mockGeometry({ itemWidth: 100, clientWidth: 250 });
    render(
      <Toolbar>
        <ToolbarActionList
          actions={[
            { key: 'a', label: 'First action' },
            { key: 'b', label: 'Second action' },
            { key: 'c', label: 'Third action', onSelect },
          ]}
        />
      </Toolbar>
    );
    await userEvent.click(screen.getByRole('button', { name: 'More actions' }));
    const item = await screen.findByRole('menuitem', { name: 'Third action' });
    await userEvent.click(item);
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('fires onSelect for a visible action', async () => {
    const onSelect = vi.fn();
    mockGeometry({ itemWidth: 100, clientWidth: 400 });
    render(
      <Toolbar>
        <ToolbarActionList
          actions={[{ key: 'a', label: 'First action', onSelect }]}
        />
      </Toolbar>
    );
    await userEvent.click(screen.getByRole('button', { name: 'First action' }));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('disables a visible action independently of the others', () => {
    mockGeometry({ itemWidth: 100, clientWidth: 400 });
    render(
      <Toolbar>
        <ToolbarActionList
          actions={[
            { key: 'a', label: 'First action', disabled: true },
            { key: 'b', label: 'Second action' },
          ]}
        />
      </Toolbar>
    );
    expect(screen.getByRole('button', { name: 'First action' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Second action' })).not.toBeDisabled();
  });

  it('marks a hidden action disabled in the overflow menu', async () => {
    mockGeometry({ itemWidth: 100, clientWidth: 250 });
    render(
      <Toolbar>
        <ToolbarActionList
          actions={[
            { key: 'a', label: 'First action' },
            { key: 'b', label: 'Second action' },
            { key: 'c', label: 'Third action', disabled: true },
          ]}
        />
      </Toolbar>
    );
    await userEvent.click(screen.getByRole('button', { name: 'More actions' }));
    const item = await screen.findByRole('menuitem', { name: 'Third action' });
    expect(item).toHaveAttribute('data-disabled');
  });

  it('is disabled entirely when its parent Toolbar is disabled', () => {
    mockGeometry({ itemWidth: 100, clientWidth: 400 });
    render(
      <Toolbar disabled>
        <ToolbarActionList actions={[{ key: 'a', label: 'First action' }]} />
      </Toolbar>
    );
    expect(screen.getByRole('button', { name: 'First action' })).toBeDisabled();
  });

  it('moves focus between visible actions with arrow keys', async () => {
    const user = userEvent.setup();
    mockGeometry({ itemWidth: 100, clientWidth: 400 });
    render(
      <Toolbar>
        <ToolbarActionList actions={THREE_ACTIONS} />
      </Toolbar>
    );
    const first = screen.getByRole('button', { name: 'First action' });
    const second = screen.getByRole('button', { name: 'Second action' });
    const third = screen.getByRole('button', { name: 'Third action' });

    await user.click(first);
    expect(first).toHaveFocus();

    await user.keyboard('{ArrowRight}');
    expect(second).toHaveFocus();

    await user.keyboard('{ArrowRight}');
    expect(third).toHaveFocus();
  });

  it('moves focus into the overflow trigger with arrow keys', async () => {
    const user = userEvent.setup();
    mockGeometry({ itemWidth: 100, clientWidth: 250 });
    render(
      <Toolbar>
        <ToolbarActionList actions={THREE_ACTIONS} />
      </Toolbar>
    );
    const first = screen.getByRole('button', { name: 'First action' });
    const trigger = screen.getByRole('button', { name: 'More actions' });

    await user.click(first);
    await user.keyboard('{ArrowRight}');
    expect(trigger).toHaveFocus();
  });
});
