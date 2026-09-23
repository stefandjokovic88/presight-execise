import { useCallback, useEffect, useRef } from "react";

/**
 * Debounce a callback. Use `cancel` when an external source resets state
 * (URL clear, back/forward) so a pending call cannot write stale args back.
 */
export function useDebouncedCallback<A extends unknown[]>(
  callback: (...args: A) => void,
  delayMs: number,
) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;
  const timeoutRef = useRef<number | undefined>(undefined);

  const cancel = useCallback(() => {
    if (timeoutRef.current !== undefined) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
  }, []);

  const debounced = useCallback(
    (...args: A) => {
      cancel();
      timeoutRef.current = window.setTimeout(() => {
        timeoutRef.current = undefined;
        callbackRef.current(...args);
      }, delayMs);
    },
    [cancel, delayMs],
  );

  const flush = useCallback(
    (...args: A) => {
      cancel();
      callbackRef.current(...args);
    },
    [cancel],
  );

  useEffect(() => cancel, [cancel]);

  return { debounced, flush, cancel };
}
