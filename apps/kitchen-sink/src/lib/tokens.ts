/**
 * Resolve a CSS custom property's current value (theme-aware — reflects the
 * active brand/scheme classes on `<html>`).
 */
export function resolveToken(name: string): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
}
