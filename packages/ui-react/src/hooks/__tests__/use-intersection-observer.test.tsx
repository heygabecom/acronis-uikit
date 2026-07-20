import { useState } from 'react';
import { fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useIntersectionObserver } from '../use-intersection-observer';

class MockIntersectionObserver implements IntersectionObserver {
  static instances: MockIntersectionObserver[] = [];
  readonly root = null;
  readonly rootMargin = '';
  readonly scrollMargin = '';
  readonly thresholds: ReadonlyArray<number> = [];
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn(() => []);

  constructor(private readonly callback: IntersectionObserverCallback) {
    MockIntersectionObserver.instances.push(this);
  }

  trigger(isIntersecting: boolean) {
    this.callback(
      [{ isIntersecting } as IntersectionObserverEntry],
      this
    );
  }
}

beforeEach(() => {
  MockIntersectionObserver.instances = [];
  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function Sentinel({ disabled, onIntersect }: { disabled?: boolean; onIntersect: () => void }) {
  const ref = useIntersectionObserver<HTMLDivElement>({ onIntersect, disabled });
  return <div ref={ref} />;
}

// Mirrors DataTable's real usage: the sentinel is absent on mount and only
// rendered once some later condition (e.g. data arriving) flips.
function ConditionalSentinel({ onIntersect }: { onIntersect: () => void }) {
  const [mounted, setMounted] = useState(false);
  const ref = useIntersectionObserver<HTMLDivElement>({ onIntersect });
  return (
    <div>
      <button onClick={() => setMounted(true)}>mount</button>
      {mounted && <div ref={ref} />}
    </div>
  );
}

describe('useIntersectionObserver', () => {
  it('observes the element and calls onIntersect when it intersects', () => {
    const onIntersect = vi.fn();
    render(<Sentinel onIntersect={onIntersect} />);

    const [observer] = MockIntersectionObserver.instances;
    expect(observer.observe).toHaveBeenCalledTimes(1);

    observer.trigger(true);
    expect(onIntersect).toHaveBeenCalledTimes(1);
  });

  it('does not call onIntersect when the entry is not intersecting', () => {
    const onIntersect = vi.fn();
    render(<Sentinel onIntersect={onIntersect} />);

    const [observer] = MockIntersectionObserver.instances;
    observer.trigger(false);
    expect(onIntersect).not.toHaveBeenCalled();
  });

  it('does not create an observer when disabled', () => {
    const onIntersect = vi.fn();
    render(<Sentinel disabled onIntersect={onIntersect} />);
    expect(MockIntersectionObserver.instances).toHaveLength(0);
  });

  it('disconnects the observer on cleanup', () => {
    const onIntersect = vi.fn();
    const { unmount } = render(<Sentinel onIntersect={onIntersect} />);
    const [observer] = MockIntersectionObserver.instances;
    unmount();
    expect(observer.disconnect).toHaveBeenCalledTimes(1);
  });

  it('does not observe when there is no element yet', () => {
    const onIntersect = vi.fn();
    render(<ConditionalSentinel onIntersect={onIntersect} />);
    expect(MockIntersectionObserver.instances).toHaveLength(0);
  });

  it('starts observing once the element mounts after an initial null render', async () => {
    const onIntersect = vi.fn();
    const { getByRole } = render(<ConditionalSentinel onIntersect={onIntersect} />);
    expect(MockIntersectionObserver.instances).toHaveLength(0);

    fireEvent.click(getByRole('button'));

    const [observer] = MockIntersectionObserver.instances;
    expect(observer.observe).toHaveBeenCalledTimes(1);

    observer.trigger(true);
    expect(onIntersect).toHaveBeenCalledTimes(1);
  });
});
