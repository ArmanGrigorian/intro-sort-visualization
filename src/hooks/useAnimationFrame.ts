/* ============================================
   Hook — requestAnimationFrame Loop
   ============================================ */

"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * Lightweight rAF loop with delta-time accumulation.
 * `callback` is called each frame with `deltaMs` since last call.
 * The loop runs only when `active` is true.
 */
export function useAnimationFrame(
  callback: (deltaMs: number) => void,
  active: boolean,
): void {
  const callbackRef = useRef(callback);
  const rafRef = useRef<number | null>(null);
  const previousTimeRef = useRef<number | null>(null);

  // Always keep callback ref current without re-subscribing
  callbackRef.current = callback;

  const loop = useCallback((time: number) => {
    if (previousTimeRef.current !== null) {
      const delta = time - previousTimeRef.current;
      callbackRef.current(delta);
    }
    previousTimeRef.current = time;
    rafRef.current = requestAnimationFrame(loop);
  }, []);

  useEffect(() => {
    if (active) {
      previousTimeRef.current = null;
      rafRef.current = requestAnimationFrame(loop);
    }
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      previousTimeRef.current = null;
    };
  }, [active, loop]);
}
