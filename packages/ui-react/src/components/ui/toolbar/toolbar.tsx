import * as React from 'react';

import { cn } from '@/lib/utils';
import { Button } from '../button';
import { ButtonMenu } from '../button-menu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../dropdown-menu';

// Mirrors the Figma "Toolbar" component (node 3897:7199): a horizontal action
// row — list actions, an optional overflow control (e.g. a `ButtonMenu`), and
// an optional trailing area (`ToolbarActions`: a status text or a selection
// counter + action) — typically shown above/below a list or table when rows
// are selected or bulk actions are available. Every action is an existing
// `Button`/`ButtonMenu` instance in Figma, so this component only lays them
// out and carries no dedicated `--ui-toolbar-*` token tier; the 16px
// inter-item gap is the Figma `gap/gap-16` semantic token, left un-tokenized —
// same precedent as `FilterSearch`'s identical gap.
//
// The Figma `state: active | disabled` variant is the native `disabled`
// attribute here: the root renders as a `<fieldset>` (reset to look like a
// flex row) so every nested `Button`/`ButtonMenu` disables via the platform's
// own fieldset-disables-descendants behavior — no prop-drilling into
// arbitrary children required.

export type ToolbarProps = React.ComponentPropsWithoutRef<'fieldset'>;

const Toolbar = React.forwardRef<HTMLFieldSetElement, ToolbarProps>(
  ({ className, ...props }, ref) => (
    <fieldset
      ref={ref}
      className={cn('m-0 flex items-center gap-4 border-0 p-0', className)}
      {...props}
    />
  )
);
Toolbar.displayName = 'Toolbar';

// Trailing, right-aligned area — a status text (e.g. "25 of 1250 items
// loaded") or a selection counter + action (e.g. "6 items selected: Deselect").
// 8px inter-child gap matches the Figma Counter part's own gap.
export type ToolbarActionsProps = React.ComponentPropsWithoutRef<'div'>;

const ToolbarActions = React.forwardRef<HTMLDivElement, ToolbarActionsProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex min-w-px flex-1 items-center justify-end gap-2',
        className
      )}
      {...props}
    />
  )
);
ToolbarActions.displayName = 'ToolbarActions';

// Matches the `gap-4` utility used on both this component's row and
// Toolbar's own root — keep in sync if either class changes.
const ACTION_LIST_GAP_PX = 16;

// Pure so the collapse math is unit-testable without mocking layout/ResizeObserver.
// Greedily fits as many leading items as possible into `availableWidth`; the
// instant not everything fits, reserves `moreWidth` (+ one gap) for the
// overflow trigger before fitting items.
export function computeVisibleActionCount(
  itemWidths: number[],
  moreWidth: number,
  gap: number,
  availableWidth: number
): number {
  const total = itemWidths.length;
  if (total === 0) return 0;

  const fullWidth =
    itemWidths.reduce((sum, width) => sum + width, 0) + gap * (total - 1);
  if (fullWidth <= availableWidth) return total;

  let used = moreWidth;
  let count = 0;
  for (let i = 0; i < total; i++) {
    const next = used + itemWidths[i] + gap;
    if (next > availableWidth) break;
    used = next;
    count++;
  }
  return count;
}

function mergeRefs<T>(
  ...refs: Array<React.Ref<T> | undefined>
): React.RefCallback<T> {
  return (node) => {
    for (const ref of refs) {
      if (!ref) continue;
      if (typeof ref === 'function') ref(node);
      else (ref as React.RefObject<T | null>).current = node;
    }
  };
}

export interface ToolbarActionListItem {
  /** Stable identity — used as the React key in both the row and the overflow menu. */
  key: string;
  /** Rendered as the visible ghost Button's label, and the overflow menu item's label. */
  label: React.ReactNode;
  onSelect?: () => void;
  disabled?: boolean;
}

export interface ToolbarActionListProps
  extends Omit<React.ComponentPropsWithoutRef<'div'>, 'children'> {
  /** Ordered list of actions; trailing ones collapse into "More actions" first. */
  actions: ToolbarActionListItem[];
  /** Label for the overflow trigger. */
  moreActionsLabel?: React.ReactNode;
}

// Mirrors the Figma "ListActions" part, but drives its `hasMoreActions`
// overflow menu from measured available width instead of a static boolean —
// the breakpoints spec (node 6262:28276) requires that "if there is no space
// for all Toolbar actions, then last actions must be hidden under More
// actions." Renders every action as a ghost Button until they no longer fit
// the row, then moves the trailing ones into a ButtonMenu + DropdownMenu
// (same trigger Figma's `hasMoreActions` variant shows). An invisible clone
// of every action + the trigger is kept mounted purely to measure natural
// widths, since a hidden item can't report its own size.
const ToolbarActionList = React.forwardRef<
  HTMLDivElement,
  ToolbarActionListProps
>(
  (
    { className, actions, moreActionsLabel = 'More actions', ...props },
    forwardedRef
  ) => {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const itemRefs = React.useRef<Array<HTMLButtonElement | null>>([]);
    const moreRef = React.useRef<HTMLButtonElement>(null);
    const [visibleCount, setVisibleCount] = React.useState(actions.length);

    const measure = React.useCallback(() => {
      const container = containerRef.current;
      const parent = container?.parentElement;
      if (!container || !parent) return;

      const siblingsWidth = Array.from(parent.children)
        .filter((child) => child !== container)
        .reduce((sum, el) => sum + el.getBoundingClientRect().width, 0);
      const gapCount = Math.max(parent.children.length - 1, 0);
      const available =
        parent.clientWidth - siblingsWidth - ACTION_LIST_GAP_PX * gapCount;

      const itemWidths = itemRefs.current.map(
        (el) => el?.getBoundingClientRect().width ?? 0
      );
      const moreWidth = moreRef.current?.getBoundingClientRect().width ?? 0;

      setVisibleCount(
        computeVisibleActionCount(
          itemWidths,
          moreWidth,
          ACTION_LIST_GAP_PX,
          available
        )
      );
    }, []);

    React.useLayoutEffect(() => {
      measure();
      const parent = containerRef.current?.parentElement;
      if (!parent) return;
      const observer = new ResizeObserver(measure);
      observer.observe(parent);
      return () => observer.disconnect();
    }, [measure, actions]);

    const visibleActions = actions.slice(0, visibleCount);
    const hiddenActions = actions.slice(visibleCount);

    return (
      <div
        ref={mergeRefs(containerRef, forwardedRef)}
        className={cn(
          'relative flex min-w-0 flex-nowrap items-center gap-4',
          className
        )}
        {...props}
      >
        {visibleActions.map((action) => (
          <Button
            key={action.key}
            variant="ghost"
            disabled={action.disabled}
            onClick={action.onSelect}
          >
            {action.label}
          </Button>
        ))}
        {hiddenActions.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <ButtonMenu variant="secondary">{moreActionsLabel}</ButtonMenu>
              }
            />
            <DropdownMenuContent align="start">
              {hiddenActions.map((action) => (
                <DropdownMenuItem
                  key={action.key}
                  disabled={action.disabled}
                  onClick={action.onSelect}
                >
                  {action.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        <div
          aria-hidden
          className="pointer-events-none invisible absolute left-0 top-0 flex items-center gap-4"
        >
          {actions.map((action, index) => (
            <Button
              key={action.key}
              ref={(el) => {
                itemRefs.current[index] = el;
              }}
              variant="ghost"
              tabIndex={-1}
            >
              {action.label}
            </Button>
          ))}
          <ButtonMenu ref={moreRef} variant="secondary" tabIndex={-1}>
            {moreActionsLabel}
          </ButtonMenu>
        </div>
      </div>
    );
  }
);
ToolbarActionList.displayName = 'ToolbarActionList';

export { Toolbar, ToolbarActions, ToolbarActionList };
