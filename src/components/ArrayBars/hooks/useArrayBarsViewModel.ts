import { useCallback, useMemo } from "react";
import type { SortEngine } from "@/hooks/useSortEngine";
import styles from "../ArrayBars.module.css";

export interface ArrayBarsViewModel {
  readonly displayArray: readonly number[];
  readonly maxValue: number;
  readonly showValues: boolean;
  readonly isHighlighted: (index: number) => boolean;
  readonly getBarClassName: (index: number) => string;
}

export function useArrayBarsViewModel(engine: SortEngine): ArrayBarsViewModel {
  const {
    displayArray,
    highlightedIndices,
    pivotIndex,
    sortedIndices,
    currentPhase,
    activeRange,
    currentStep,
    arraySize,
  } = engine;

  const maxValue = useMemo(() => Math.max(...displayArray, 1), [displayArray]);
  const showValues = arraySize <= 32;

  const sortedSet = useMemo(() => new Set(sortedIndices), [sortedIndices]);
  const highlightSet = useMemo(
    () => new Set(highlightedIndices),
    [highlightedIndices],
  );

  const isHighlighted = useCallback(
    (index: number): boolean => highlightSet.has(index),
    [highlightSet],
  );

  const getBarClassName = useCallback(
    (index: number): string => {
      const classes: string[] = [styles.bar];

      // Sorted state takes priority for final positions
      if (sortedSet.has(index)) {
        classes.push(styles.barSorted);
        return classes.join(" ");
      }

      // Pivot highlight
      if (pivotIndex !== null && index === pivotIndex) {
        classes.push(styles.barPivot);
        return classes.join(" ");
      }

      // Current operation highlights
      if (highlightSet.has(index)) {
        if (currentStep?.type === "compare") {
          classes.push(styles.barCompare);
        } else if (currentStep?.type === "swap") {
          classes.push(styles.barSwap);
        } else if (currentStep?.type === "pivot-select") {
          classes.push(styles.barPivot);
        } else if (
          currentStep?.type === "insert-shift" ||
          currentStep?.type === "insert-place"
        ) {
          classes.push(styles.barInsertion);
        } else if (
          currentStep?.type === "heap-siftdown" ||
          currentStep?.type === "heap-extract" ||
          currentStep?.type === "heap-build"
        ) {
          classes.push(styles.barHeap);
        } else {
          // Fallback to phase color if step type not matched above
          if (currentPhase === "quicksort") {
            classes.push(styles.barQuicksort);
          } else if (currentPhase === "heapsort") {
            classes.push(styles.barHeap);
          } else if (currentPhase === "insertion-sort") {
            classes.push(styles.barInsertion);
          }
        }
      } else if (activeRange) {
        // Phase-specific range items when not explicitly highlighted
        if (index >= activeRange[0] && index <= activeRange[1]) {
          if (currentPhase === "quicksort") {
            classes.push(styles.barQuicksortRange);
          } else if (currentPhase === "heapsort") {
            classes.push(styles.barHeapRange);
          } else if (currentPhase === "insertion-sort") {
            classes.push(styles.barInsertionRange);
          } else {
            classes.push(styles.barInRange);
          }
        } else {
          classes.push(styles.barOutOfRange);
        }
      }

      return classes.join(" ");
    },
    [
      sortedSet,
      pivotIndex,
      highlightSet,
      currentStep?.type,
      currentPhase,
      activeRange,
    ],
  );

  return {
    displayArray,
    maxValue,
    showValues,
    isHighlighted,
    getBarClassName,
  };
}
