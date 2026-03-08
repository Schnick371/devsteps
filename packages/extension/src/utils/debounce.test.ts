import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { debounce } from './debounce.js';

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('delays the function call by the specified wait time', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 500);

    debounced();
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(499);
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('calls the function only once for rapid-fire invocations', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 500);

    for (let i = 0; i < 60; i++) {
      debounced();
    }

    vi.advanceTimersByTime(500);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('resets the timer on each call', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 500);

    debounced();
    vi.advanceTimersByTime(400);
    debounced(); // reset
    vi.advanceTimersByTime(400);
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('cancel() clears the pending timer', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 500);

    debounced();
    debounced.cancel();

    vi.advanceTimersByTime(1000);
    expect(fn).not.toHaveBeenCalled();
  });

  it('cancel() is safe to call when no timer is pending', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 500);

    expect(() => debounced.cancel()).not.toThrow();
  });

  it('passes arguments through to the wrapped function', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced('hello', 42);
    vi.advanceTimersByTime(100);

    expect(fn).toHaveBeenCalledWith('hello', 42);
  });
});
