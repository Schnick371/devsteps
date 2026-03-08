/**
 * Creates a debounced version of the given function that delays invoking `fn`
 * until `wait` milliseconds have elapsed since the last invocation.
 * Exposes a `cancel()` method to clear any pending timer — register
 * `{ dispose: () => debouncedFn.cancel() }` in VS Code context.subscriptions.
 *
 * @param fn   The function to debounce.
 * @param wait Delay in milliseconds (trailing edge).
 */
export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  wait: number
): T & { cancel: () => void } {
  let timer: ReturnType<typeof setTimeout> | undefined;

  const debounced = (...args: unknown[]): void => {
    if (timer !== undefined) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = undefined;
      fn(...args);
    }, wait);
  };

  debounced.cancel = (): void => {
    if (timer !== undefined) {
      clearTimeout(timer);
      timer = undefined;
    }
  };

  return debounced as T & { cancel: () => void };
}
