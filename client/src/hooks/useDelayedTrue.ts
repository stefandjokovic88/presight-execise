import { useEffect, useState } from "react";

/**
 * Becomes true only after `value` stays true for `delayMs`.
 * Resets to false immediately when `value` becomes false.
 * Avoids flicker for fast requests.
 */
export function useDelayedTrue(value: boolean, delayMs: number): boolean {
  const [delayed, setDelayed] = useState(false);

  useEffect(() => {
    if (!value) {
      setDelayed(false);
      return;
    }

    const timer = window.setTimeout(() => setDelayed(true), delayMs);
    return () => window.clearTimeout(timer);
  }, [value, delayMs]);

  return delayed;
}
