/* ============================================
   IntroSort Engine — Type Definitions
   ============================================ */

export type AlgorithmPhase = "quicksort" | "heapsort" | "insertion-sort";

export type StepType =
  | "compare"
  | "swap"
  | "pivot-select"
  | "partition-done"
  | "phase-switch"
  | "heap-build"
  | "heap-extract"
  | "heap-siftdown"
  | "insert-shift"
  | "insert-place"
  | "sorted-mark"
  | "recursion-push"
  | "recursion-pop"
  | "range-set";

export interface SortStep {
  /** Unique step identifier */
  id: number;
  /** Type of operation performed */
  type: StepType;
  /** Indices involved in the operation */
  indices: number[];
  /** Full array snapshot after this operation */
  array: number[];
  /** Current algorithm phase */
  phase: AlgorithmPhase;
  /** Current recursion depth */
  depth: number;
  /** Maximum allowed depth before HeapSort fallback */
  maxDepth: number;
  /** Active sub-array range [lo, hi] (inclusive) */
  range: [number, number];
  /** Human-readable description of the operation */
  description: string;
  /** Pivot index, if applicable */
  pivotIndex?: number;
  /** Pivot value, if applicable */
  pivotValue?: number;
  /** Sorted indices so far */
  sortedIndices: number[];
  /** Cumulative comparisons up to this step */
  comparisons: number;
  /** Cumulative swaps up to this step */
  swaps: number;
}

export type ArrayType = "random" | "nearly-sorted" | "reversed" | "few-unique";

export interface SortConfig {
  /** Number of elements */
  size: number;
  /** Type of initial array distribution */
  arrayType: ArrayType;
  /** Minimum value for elements */
  minValue: number;
  /** Maximum value for elements */
  maxValue: number;
}

export interface SortStats {
  comparisons: number;
  swaps: number;
  totalSteps: number;
  quicksortSteps: number;
  heapsortSteps: number;
  insertionSortSteps: number;
  maxRecursionDepth: number;
  depthLimit: number;
  heapSortTriggered: boolean;
}
