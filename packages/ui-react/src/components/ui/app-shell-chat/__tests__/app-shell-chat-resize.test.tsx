import type * as React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, afterEach } from 'vitest';

import {
  AppShellChatResizeEdge,
  AppShellChatChatContext,
  getResizeMaxWidth,
  handleResizeKeyDown,
  handleResizePointerDown,
  type AppShellChatChatContextValue,
  type ResizeKeyDownContext,
  type ResizePointerDownContext,
} from '../app-shell-chat';

// ---------------------------------------------------------------------------
// DOM helpers — these three exports operate on real geometry
// (`getBoundingClientRect`, `closest('[data-state]')`, `getComputedStyle`), so
// the tests build a real (if styleless) DOM row rather than mocking the
// functions' internals.
// ---------------------------------------------------------------------------

function mockRect(
  el: Element,
  { width = 0, left = 0 }: { width?: number; left?: number }
) {
  el.getBoundingClientRect = () =>
    ({
      width,
      height: 0,
      top: 0,
      left,
      right: left + width,
      bottom: 0,
      x: left,
      y: 0,
      toJSON() {},
    }) as DOMRect;
}

/**
 * A row (`sidebar | content | chat`) mirroring `AppShellChat`'s DOM shape,
 * with `getBoundingClientRect` stubbed so `getResizeMaxWidth` can compute a
 * real ceiling: rowWidth=1000, sidebarWidth=100 (reserved), so the dynamic
 * max is 900 regardless of the fallback passed in.
 */
function buildChatRow({ rtl = false }: { rtl?: boolean } = {}) {
  const row = document.createElement('div');
  mockRect(row, { width: 1000 });

  const sidebar = document.createElement('aside');
  sidebar.dataset.slot = 'app-shell-chat-sidebar';
  mockRect(sidebar, { width: 100 });

  const content = document.createElement('div');
  content.dataset.slot = 'app-shell-chat-content';
  mockRect(content, { width: 388, left: 100 });

  const chat = document.createElement('aside');
  chat.setAttribute('data-state', 'expanded');
  if (rtl) chat.style.direction = 'rtl';
  mockRect(chat, { width: 512, left: 488 });

  const handle = document.createElement('div');
  handle.setPointerCapture = vi.fn();
  handle.releasePointerCapture = vi.fn();
  chat.appendChild(handle);

  row.append(sidebar, content, chat);
  document.body.appendChild(row);

  return { row, sidebar, content, chat, handle };
}

function fakePointerEvent(
  currentTarget: Element,
  pointerId = 1
): React.PointerEvent<HTMLDivElement> {
  return {
    preventDefault: vi.fn(),
    pointerId,
    currentTarget,
  } as unknown as React.PointerEvent<HTMLDivElement>;
}

function fakeKeyDownEvent(
  currentTarget: Element,
  key: string
): React.KeyboardEvent<HTMLDivElement> {
  return {
    key,
    preventDefault: vi.fn(),
    currentTarget,
  } as unknown as React.KeyboardEvent<HTMLDivElement>;
}

/** Ends any drag started with pointerId 1 — used to avoid leaking the
 * `window` pointermove/pointerup/pointercancel listeners `handleResizePointerDown`
 * installs into later tests. */
function endDrag() {
  window.dispatchEvent(new PointerEvent('pointerup', { pointerId: 1 }));
}

afterEach(() => {
  // Unmount any RTL-rendered tree first — clearing `innerHTML` out from under
  // a still-mounted React tree makes its own (LIFO-ordered) auto-cleanup
  // `afterEach` throw trying to remove already-gone nodes.
  cleanup();
  document.body.innerHTML = '';
});

describe('getResizeMaxWidth', () => {
  it('returns the fallback when the chat element has no parent', () => {
    const orphan = document.createElement('div');
    expect(getResizeMaxWidth(orphan, 1024)).toBe(1024);
  });

  it('returns the fallback when the row has not been laid out yet (0 width)', () => {
    const { chat } = buildChatRow();
    mockRect(chat.parentElement!, { width: 0 });
    expect(getResizeMaxWidth(chat, 1024)).toBe(1024);
  });

  it('computes row width minus every sibling except Content and Chat', () => {
    const { chat } = buildChatRow();
    // rowWidth(1000) - sidebarWidth(100); Content's own width is excluded
    // because it can always shrink to 0.
    expect(getResizeMaxWidth(chat, 1024)).toBe(900);
  });

  it('falls back when the computed availability is not positive', () => {
    const { row, sidebar, chat } = buildChatRow();
    mockRect(row, { width: 50 });
    mockRect(sidebar, { width: 100 });
    expect(getResizeMaxWidth(chat, 1024)).toBe(1024);
  });
});

describe('handleResizePointerDown', () => {
  it('grows Chat as the pointer moves toward the row start (LTR)', () => {
    const { handle, chat } = buildChatRow();
    const setWidth = vi.fn();
    const ctxRef = { current: { minWidth: 48, maxWidth: 1024, setWidth } };

    handleResizePointerDown(fakePointerEvent(handle), ctxRef);
    expect(handle.setPointerCapture).toHaveBeenCalledWith(1);
    expect(chat.style.transitionProperty).toBe('none');

    window.dispatchEvent(new PointerEvent('pointermove', { clientX: 400, pointerId: 1 }));
    // chatRect.right(1000) - clientX(400) = 600, within [48, 900].
    expect(setWidth).toHaveBeenCalledWith(600);
    endDrag();
  });

  it('clamps to minWidth when dragged narrower than the floor', () => {
    const { handle } = buildChatRow();
    const setWidth = vi.fn();
    const ctxRef = { current: { minWidth: 48, maxWidth: 1024, setWidth } };

    handleResizePointerDown(fakePointerEvent(handle), ctxRef);
    // chatRect.right(1000) - clientX(990) = 10, below the 48px floor.
    window.dispatchEvent(new PointerEvent('pointermove', { clientX: 990, pointerId: 1 }));
    expect(setWidth).toHaveBeenCalledWith(48);
    endDrag();
  });

  it('clamps to the dynamically-measured ceiling, not the static fallback', () => {
    const { handle } = buildChatRow();
    const setWidth = vi.fn();
    // Fallback is 1024, but the row only has 900px available (see buildChatRow).
    const ctxRef = { current: { minWidth: 48, maxWidth: 1024, setWidth } };

    handleResizePointerDown(fakePointerEvent(handle), ctxRef);
    // chatRect.right(1000) - clientX(0) = 1000, above the real 900px ceiling.
    window.dispatchEvent(new PointerEvent('pointermove', { clientX: 0, pointerId: 1 }));
    expect(setWidth).toHaveBeenCalledWith(900);
    endDrag();
  });

  it('shrinks Chat as the pointer moves toward the row start (RTL)', () => {
    const { handle } = buildChatRow({ rtl: true });
    const setWidth = vi.fn();
    const ctxRef = { current: { minWidth: 48, maxWidth: 1024, setWidth } };

    handleResizePointerDown(fakePointerEvent(handle), ctxRef);
    // RTL: clientX(600) - chatRect.left(488) = 112.
    window.dispatchEvent(new PointerEvent('pointermove', { clientX: 600, pointerId: 1 }));
    expect(setWidth).toHaveBeenCalledWith(112);
    endDrag();
  });

  it('invokes onDragStart/onDragEnd around the drag and restores the transition', () => {
    const { handle, chat } = buildChatRow();
    const onDragStart = vi.fn();
    const onDragEnd = vi.fn();
    const ctxRef = { current: { minWidth: 48, maxWidth: 1024, setWidth: vi.fn() } };

    handleResizePointerDown(fakePointerEvent(handle), ctxRef, { onDragStart, onDragEnd });
    expect(onDragStart).toHaveBeenCalledOnce();
    expect(onDragEnd).not.toHaveBeenCalled();

    window.dispatchEvent(new PointerEvent('pointerup', { pointerId: 1 }));
    expect(onDragEnd).toHaveBeenCalledOnce();
    expect(chat.style.transitionProperty).toBe('');
  });

  it('ends the drag on pointercancel too, not just pointerup', () => {
    const { handle, chat } = buildChatRow();
    const onDragEnd = vi.fn();
    const setWidth = vi.fn();
    const ctxRef = { current: { minWidth: 48, maxWidth: 1024, setWidth } };

    handleResizePointerDown(fakePointerEvent(handle), ctxRef, { onDragEnd });
    window.dispatchEvent(new PointerEvent('pointercancel', { pointerId: 1 }));
    expect(onDragEnd).toHaveBeenCalledOnce();
    expect(chat.style.transitionProperty).toBe('');

    // The listeners were torn down by the cancel — a further move does nothing.
    window.dispatchEvent(new PointerEvent('pointermove', { clientX: 0, pointerId: 1 }));
    expect(setWidth).not.toHaveBeenCalled();
  });

  it('ignores pointermove/pointerup from a different pointer than started the drag', () => {
    const { handle } = buildChatRow();
    const onDragEnd = vi.fn();
    const setWidth = vi.fn();
    const ctxRef = { current: { minWidth: 48, maxWidth: 1024, setWidth } };

    // Started by pointer 1.
    handleResizePointerDown(fakePointerEvent(handle, 1), ctxRef, { onDragEnd });

    // A second, unrelated pointer (e.g. multi-touch) fires move/up — must be ignored.
    window.dispatchEvent(new PointerEvent('pointermove', { clientX: 400, pointerId: 2 }));
    expect(setWidth).not.toHaveBeenCalled();
    window.dispatchEvent(new PointerEvent('pointerup', { pointerId: 2 }));
    expect(onDragEnd).not.toHaveBeenCalled();

    // The original pointer still works and can still end its own drag.
    window.dispatchEvent(new PointerEvent('pointermove', { clientX: 400, pointerId: 1 }));
    expect(setWidth).toHaveBeenCalledWith(600);
    window.dispatchEvent(new PointerEvent('pointerup', { pointerId: 1 }));
    expect(onDragEnd).toHaveBeenCalledOnce();
  });

  it('always calls the LATEST setWidth, even if the ref is updated mid-drag', () => {
    const { handle } = buildChatRow();
    const firstSetWidth = vi.fn();
    const secondSetWidth = vi.fn();
    const ctxRef: { current: ResizePointerDownContext } = {
      current: { minWidth: 48, maxWidth: 1024, setWidth: firstSetWidth },
    };

    handleResizePointerDown(fakePointerEvent(handle), ctxRef);
    window.dispatchEvent(new PointerEvent('pointermove', { clientX: 500, pointerId: 1 }));
    expect(firstSetWidth).toHaveBeenCalledWith(500);

    // Simulate a re-render mid-drag that produces a new `setWidth` identity
    // (e.g. a consumer's `onWidthChange` prop changed) — same as
    // `AppShellChatResizeEdge` mutating its `ctxRef.current` every render.
    ctxRef.current = { ...ctxRef.current, setWidth: secondSetWidth };

    window.dispatchEvent(new PointerEvent('pointermove', { clientX: 400, pointerId: 1 }));
    expect(secondSetWidth).toHaveBeenCalledWith(600);
    // The stale closure must NOT still be receiving updates.
    expect(firstSetWidth).toHaveBeenCalledOnce();
    endDrag();
  });

  it('bails out (and releases the pointer) when there is no [data-state] ancestor', () => {
    const handle = document.createElement('div');
    handle.setPointerCapture = vi.fn();
    handle.releasePointerCapture = vi.fn();
    document.body.appendChild(handle);
    const setWidth = vi.fn();
    const onDragEnd = vi.fn();
    const ctxRef = { current: { minWidth: 48, maxWidth: 1024, setWidth } };

    handleResizePointerDown(fakePointerEvent(handle), ctxRef, { onDragEnd });
    expect(handle.releasePointerCapture).toHaveBeenCalledWith(1);
    expect(onDragEnd).toHaveBeenCalledOnce();

    window.dispatchEvent(new PointerEvent('pointermove', { clientX: 0, pointerId: 1 }));
    expect(setWidth).not.toHaveBeenCalled();
  });
});

describe('handleResizeKeyDown', () => {
  const baseCtx: ResizeKeyDownContext = {
    minWidth: 48,
    maxWidth: 1024,
    defaultWidth: 512,
    width: 512,
    setWidth: vi.fn(),
  };

  it('ArrowLeft grows by 16px in LTR, clamped to the dynamic ceiling', () => {
    const { chat } = buildChatRow();
    const setWidth = vi.fn();
    handleResizeKeyDown(fakeKeyDownEvent(chat, 'ArrowLeft'), { ...baseCtx, setWidth }, 'ltr');
    expect(setWidth).toHaveBeenCalledWith(528);
  });

  it('ArrowRight shrinks by 16px in LTR, clamped to minWidth', () => {
    const { chat } = buildChatRow();
    const setWidth = vi.fn();
    handleResizeKeyDown(
      fakeKeyDownEvent(chat, 'ArrowRight'),
      { ...baseCtx, setWidth, width: 50 },
      'ltr'
    );
    expect(setWidth).toHaveBeenCalledWith(48);
  });

  it('inverts the grow/shrink keys in RTL', () => {
    const { chat } = buildChatRow();
    const setWidth = vi.fn();
    handleResizeKeyDown(fakeKeyDownEvent(chat, 'ArrowRight'), { ...baseCtx, setWidth }, 'rtl');
    expect(setWidth).toHaveBeenCalledWith(528);
  });

  it('Home resets to defaultWidth', () => {
    const { chat } = buildChatRow();
    const setWidth = vi.fn();
    handleResizeKeyDown(
      fakeKeyDownEvent(chat, 'Home'),
      { ...baseCtx, setWidth, width: 900 },
      'ltr'
    );
    expect(setWidth).toHaveBeenCalledWith(512);
  });

  it('ignores unrelated keys', () => {
    const { chat } = buildChatRow();
    const setWidth = vi.fn();
    const event = fakeKeyDownEvent(chat, 'a');
    handleResizeKeyDown(event, { ...baseCtx, setWidth }, 'ltr');
    expect(setWidth).not.toHaveBeenCalled();
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it('falls back to ctx.maxWidth when there is no [data-state] ancestor to measure', () => {
    const detached = document.createElement('div');
    const setWidth = vi.fn();
    handleResizeKeyDown(
      fakeKeyDownEvent(detached, 'ArrowLeft'),
      { ...baseCtx, setWidth, width: 1020, maxWidth: 1024 },
      'ltr'
    );
    expect(setWidth).toHaveBeenCalledWith(1024);
  });

  // Regression coverage for the crossover case: when the row is narrow enough
  // that the DYNAMICALLY-MEASURED ceiling (not the `maxWidth` fallback — see
  // `getResizeMaxWidth`) drops below `minWidth`, grow/shrink/Home must all
  // converge on that ceiling (the tighter constraint) instead of fighting
  // each other into a value outside [minWidth, maxWidth].
  describe('when the dynamic ceiling is below minWidth (a narrow row)', () => {
    // rowWidth(140) - sidebarWidth(100) = 40, below the 48px floor.
    function buildNarrowChatRow() {
      const built = buildChatRow();
      mockRect(built.row, { width: 140 });
      mockRect(built.sidebar, { width: 100 });
      return built;
    }

    it('ArrowLeft (grow) clamps down to the ceiling, not up past it', () => {
      const { chat } = buildNarrowChatRow();
      const setWidth = vi.fn();
      handleResizeKeyDown(
        fakeKeyDownEvent(chat, 'ArrowLeft'),
        { ...baseCtx, setWidth, width: 40, minWidth: 48 },
        'ltr'
      );
      expect(setWidth).toHaveBeenCalledWith(40);
    });

    it('ArrowRight (shrink) clamps down to the ceiling too, instead of forcing width UP to minWidth', () => {
      const { chat } = buildNarrowChatRow();
      const setWidth = vi.fn();
      handleResizeKeyDown(
        fakeKeyDownEvent(chat, 'ArrowRight'),
        { ...baseCtx, setWidth, width: 40, minWidth: 48 },
        'ltr'
      );
      // Math.max(40 - 16, 48) would be 48 (above the 40px ceiling) if the
      // ceiling weren't applied afterward — the fix clamps to 40.
      expect(setWidth).toHaveBeenCalledWith(40);
    });

    it('Home resets to the ceiling instead of overshooting past it', () => {
      const { chat } = buildNarrowChatRow();
      const setWidth = vi.fn();
      handleResizeKeyDown(
        fakeKeyDownEvent(chat, 'Home'),
        { ...baseCtx, setWidth, width: 40, minWidth: 48, defaultWidth: 512 },
        'ltr'
      );
      expect(setWidth).toHaveBeenCalledWith(40);
    });
  });
});

describe('AppShellChatResizeEdge', () => {
  function renderEdge(ctx: Partial<AppShellChatChatContextValue> = {}) {
    const setWidth = vi.fn();
    const fullCtx: AppShellChatChatContextValue = {
      compact: false,
      width: 512,
      setWidth,
      minWidth: 48,
      maxWidth: 1024,
      defaultWidth: 512,
      label: undefined,
      setLabel: vi.fn(),
      resizeAriaLabel: 'Resize chat',
      resizeTooltip: 'Drag to resize',
      ...ctx,
    };
    render(
      <AppShellChatChatContext.Provider value={fullCtx}>
        <div data-state="expanded">
          <AppShellChatResizeEdge />
        </div>
      </AppShellChatChatContext.Provider>
    );
    return { setWidth };
  }

  it('renders a labeled separator', () => {
    renderEdge({ resizeAriaLabel: 'Resize the panel' });
    expect(
      screen.getByRole('separator', { name: 'Resize the panel' })
    ).toBeInTheDocument();
  });

  it('omits the tooltip content when resizeTooltip is null', () => {
    renderEdge({ resizeTooltip: null });
    // Only the separator's own accessible name should be findable — no
    // tooltip text node to query for.
    expect(screen.queryByText('Drag to resize')).not.toBeInTheDocument();
  });

  it('double-click resets the width to defaultWidth', async () => {
    const { setWidth } = renderEdge({ defaultWidth: 512 });
    const edge = screen.getByRole('separator');
    await userEvent.dblClick(edge);
    expect(setWidth).toHaveBeenCalledWith(512);
  });

  it('ArrowLeft delegates to handleResizeKeyDown and resizes', async () => {
    const { setWidth } = renderEdge({ width: 512, minWidth: 48, maxWidth: 1024 });
    const edge = screen.getByRole('separator');
    edge.focus();
    await userEvent.keyboard('{ArrowLeft}');
    expect(setWidth).toHaveBeenCalledWith(528);
  });
});
