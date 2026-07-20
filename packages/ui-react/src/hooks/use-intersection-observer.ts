import { useEffect, useRef, useState } from 'react';

export interface UseIntersectionObserverOptions extends IntersectionObserverInit {
  /** Called each time the observed element intersects its root. */
  onIntersect: () => void;
  /**
   * Skip observing — e.g. there's nothing left to load, or a load is already
   * in flight. Disconnects any existing observer.
   */
  disabled?: boolean;
}

/**
 * Wires a single `IntersectionObserver` on the returned ref callback's element
 * and calls `onIntersect` each time it intersects. Re-creates the observer when
 * the element, `disabled`, or any `IntersectionObserverInit` option changes;
 * disconnects on cleanup. `onIntersect` itself doesn't need to be memoized by
 * the caller — the latest version is always used (via a ref) without
 * reconnecting the observer.
 *
 * Takes a ref *callback* (not a `RefObject`) rather than accepting one from the
 * caller — attaching to `element.current` inside a `useEffect` keyed on a
 * `RefObject` misses conditionally-mounted elements: the `ref` object's
 * identity never changes when its `.current` is populated, so an effect keyed
 * on it (rather than on the element itself) never re-runs once the element
 * actually mounts. Routing the DOM node through `useState` instead makes the
 * mount itself a dependency.
 */
export function useIntersectionObserver<T extends Element>({
  onIntersect,
  disabled = false,
  root,
  rootMargin,
  threshold,
}: UseIntersectionObserverOptions): (node: T | null) => void {
  const onIntersectRef = useRef(onIntersect);
  onIntersectRef.current = onIntersect;

  const [element, setElement] = useState<T | null>(null);

  useEffect(() => {
    if (disabled || !element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          onIntersectRef.current();
        }
      },
      { root, rootMargin, threshold }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [element, disabled, root, rootMargin, threshold]);

  return setElement;
}
