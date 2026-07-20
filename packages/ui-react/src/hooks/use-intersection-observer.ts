import { type RefObject, useEffect, useRef } from 'react';

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
 * Wires a single `IntersectionObserver` on `ref`'s element and calls
 * `onIntersect` each time it intersects. Re-creates the observer when `ref`'s
 * element, `disabled`, or any `IntersectionObserverInit` option changes;
 * disconnects on cleanup. `onIntersect` itself doesn't need to be memoized by
 * the caller — the latest version is always used (via a ref) without
 * reconnecting the observer.
 */
export function useIntersectionObserver<T extends Element>(
  ref: RefObject<T | null>,
  { onIntersect, disabled = false, root, rootMargin, threshold }: UseIntersectionObserverOptions
): void {
  const onIntersectRef = useRef(onIntersect);
  onIntersectRef.current = onIntersect;

  useEffect(() => {
    if (disabled) return;
    const element = ref.current;
    if (!element) return;

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
  }, [ref, disabled, root, rootMargin, threshold]);
}
