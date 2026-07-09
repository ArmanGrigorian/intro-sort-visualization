/* ============================================
   IntroSort Engine — Array Generators
   ============================================ */

import type { ArrayType } from "./types";

/**
 * Generate an array of the given type and size.
 */
export function generateArray(
  type: ArrayType,
  size: number,
  min = 5,
  max = 100,
  isInitial = false,
): number[] {
  if (isInitial) {
    let seed = 123456789;
    return Array.from({ length: size }, () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      const norm = seed / 4294967296;
      return Math.floor(norm * (max - min + 1)) + min;
    });
  }
  switch (type) {
    case "random":
      return randomArray(size, min, max);
    case "nearly-sorted":
      return nearlySortedArray(size, min, max);
    case "reversed":
      return reversedArray(size, min, max);
    case "few-unique":
      return fewUniqueArray(size, min, max);
    default:
      return randomArray(size, min, max);
  }
}

/** Uniformly random values */
function randomArray(size: number, min: number, max: number): number[] {
  return Array.from(
    { length: size },
    () => Math.floor(Math.random() * (max - min + 1)) + min,
  );
}

/** Sorted array with a few random swaps */
function nearlySortedArray(size: number, min: number, max: number): number[] {
  const step = (max - min) / (size - 1 || 1);
  const arr = Array.from({ length: size }, (_, i) =>
    Math.round(min + i * step),
  );
  // Perform ~10% random swaps
  const swapCount = Math.max(1, Math.floor(size * 0.1));
  for (let s = 0; s < swapCount; s++) {
    const i = Math.floor(Math.random() * size);
    const j = Math.floor(Math.random() * size);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Fully reversed (descending) array */
function reversedArray(size: number, min: number, max: number): number[] {
  const step = (max - min) / (size - 1 || 1);
  return Array.from({ length: size }, (_, i) => Math.round(max - i * step));
}

/** Array with only a few unique values */
function fewUniqueArray(size: number, min: number, max: number): number[] {
  const uniqueCount = Math.min(5, Math.ceil(size / 4));
  const values: number[] = [];
  for (let i = 0; i < uniqueCount; i++) {
    values.push(Math.floor(Math.random() * (max - min + 1)) + min);
  }
  return Array.from(
    { length: size },
    () => values[Math.floor(Math.random() * values.length)],
  );
}
