import type { AlgorithmPhase, SortStats, SortStep } from "./types";

const INSERTION_SORT_THRESHOLD = 16;

interface EmitContext {
  stepCounter: number;
  sortedIndices: Set<number>;
  stats: SortStats;
}

type Emitter = (
  type: SortStep["type"],
  indices: number[],
  array: number[],
  phase: AlgorithmPhase,
  depth: number,
  maxDepth: number,
  range: [number, number],
  description: string,
  extra?: { pivotIndex?: number; pivotValue?: number },
) => void;

/**
 * Run IntroSort and return all steps for visualization replay.
 */

export function runIntroSort(inputArray: number[]): {
  steps: SortStep[];
  stats: SortStats;
  sortedArray: number[];
} {
  const arr = [...inputArray];
  const n = arr.length;
  const maxDepth = 2 * Math.floor(Math.log2(n));
  const steps: SortStep[] = [];

  const ctx: EmitContext = {
    stepCounter: 0,
    sortedIndices: new Set<number>(),
    stats: {
      comparisons: 0,
      swaps: 0,
      totalSteps: 0,
      quicksortSteps: 0,
      heapsortSteps: 0,
      insertionSortSteps: 0,
      maxRecursionDepth: 0,
      depthLimit: maxDepth,
      heapSortTriggered: false,
    },
  };

  const emit: Emitter = (
    type,
    indices,
    array,
    phase,
    depth,
    md,
    range,
    description,
    extra,
  ) => {
    ctx.stats.totalSteps++;
    if (phase === "quicksort") ctx.stats.quicksortSteps++;
    else if (phase === "heapsort") ctx.stats.heapsortSteps++;
    else if (phase === "insertion-sort") ctx.stats.insertionSortSteps++;

    const step: SortStep = {
      id: ctx.stepCounter++,
      type,
      indices: [...indices],
      array: [...array],
      phase,
      depth,
      maxDepth: md,
      range: [...range] as [number, number],
      description,
      pivotIndex: extra?.pivotIndex,
      pivotValue: extra?.pivotValue,
      sortedIndices: [...ctx.sortedIndices],
      comparisons: ctx.stats.comparisons,
      swaps: ctx.stats.swaps,
    };
    steps.push(step);
  };

  if (n <= 1) {
    if (n === 1) {
      ctx.sortedIndices.add(0);
      emit(
        "sorted-mark",
        [0],
        arr,
        "quicksort",
        0,
        maxDepth,
        [0, 0],
        "Single element is already sorted.",
      );
    }
    return { steps, stats: ctx.stats, sortedArray: arr };
  }

  // Start the algorithm
  emit(
    "range-set",
    [],
    arr,
    "quicksort",
    0,
    maxDepth,
    [0, n - 1],
    `Starting IntroSort on ${n} elements. Depth limit: ${maxDepth}`,
  );

  introSort(arr, 0, n - 1, maxDepth, 0, emit, ctx);

  // Mark remaining unsorted as sorted
  for (let i = 0; i < n; i++) {
    if (!ctx.sortedIndices.has(i)) {
      ctx.sortedIndices.add(i);
      emit(
        "sorted-mark",
        [i],
        arr,
        "quicksort",
        0,
        maxDepth,
        [0, n - 1],
        `Element at index ${i} (value ${arr[i]}) is in final position.`,
      );
    }
  }

  return { steps, stats: ctx.stats, sortedArray: arr };
}

function introSort(
  arr: number[],
  lo: number,
  hi: number,
  depthLimit: number,
  currentDepth: number,
  emit: Emitter,
  ctx: EmitContext,
): void {
  const size = hi - lo + 1;

  ctx.stats.maxRecursionDepth = Math.max(
    ctx.stats.maxRecursionDepth,
    currentDepth,
  );

  if (size <= 1) {
    if (size === 1 && !ctx.sortedIndices.has(lo)) {
      ctx.sortedIndices.add(lo);
      emit(
        "sorted-mark",
        [lo],
        arr,
        "quicksort",
        currentDepth,
        ctx.stats.depthLimit,
        [lo, hi],
        `Element at index ${lo} (value ${arr[lo]}) — single element, sorted.`,
      );
    }
    return;
  }

  // Small sub-array → InsertionSort
  if (size <= INSERTION_SORT_THRESHOLD) {
    emit(
      "phase-switch",
      [],
      arr,
      "insertion-sort",
      currentDepth,
      ctx.stats.depthLimit,
      [lo, hi],
      `Sub-array size ${size} ≤ ${INSERTION_SORT_THRESHOLD} → switching to Insertion Sort.`,
    );
    insertionSort(arr, lo, hi, currentDepth, emit, ctx);
    return;
  }

  // Depth exceeded → HeapSort fallback
  if (depthLimit === 0) {
    ctx.stats.heapSortTriggered = true;
    emit(
      "phase-switch",
      [],
      arr,
      "heapsort",
      currentDepth,
      ctx.stats.depthLimit,
      [lo, hi],
      `Recursion depth limit exceeded → switching to HeapSort for safety (O(n log n) guaranteed).`,
    );
    heapSort(arr, lo, hi, currentDepth, emit, ctx);
    return;
  }

  // QuickSort phase
  emit(
    "recursion-push",
    [],
    arr,
    "quicksort",
    currentDepth,
    ctx.stats.depthLimit,
    [lo, hi],
    `QuickSort: processing range [${lo}..${hi}], depth ${currentDepth}/${ctx.stats.depthLimit}`,
  );

  const pivotIdx = partition(arr, lo, hi, currentDepth, emit, ctx);

  // Pivot is in final position
  ctx.sortedIndices.add(pivotIdx);
  emit(
    "sorted-mark",
    [pivotIdx],
    arr,
    "quicksort",
    currentDepth,
    ctx.stats.depthLimit,
    [lo, hi],
    `Pivot value ${arr[pivotIdx]} placed at index ${pivotIdx} — final position.`,
  );

  // Recurse on left and right partitions
  introSort(arr, lo, pivotIdx - 1, depthLimit - 1, currentDepth + 1, emit, ctx);
  introSort(arr, pivotIdx + 1, hi, depthLimit - 1, currentDepth + 1, emit, ctx);

  emit(
    "recursion-pop",
    [],
    arr,
    "quicksort",
    currentDepth,
    ctx.stats.depthLimit,
    [lo, hi],
    `QuickSort: done with range [${lo}..${hi}]`,
  );
}

/* ── QuickSort Partition (Lomuto + Median-of-Three) ── */

function medianOfThree(
  arr: number[],
  lo: number,
  hi: number,
  currentDepth: number,
  emit: Emitter,
  ctx: EmitContext,
): number {
  const maxD = ctx.stats.depthLimit;
  const mid = lo + Math.floor((hi - lo) / 2);

  ctx.stats.comparisons++;
  emit(
    "compare",
    [lo, mid],
    arr,
    "quicksort",
    currentDepth,
    maxD,
    [lo, hi],
    `Median-of-three: compare arr[${lo}]=${arr[lo]} with arr[${mid}]=${arr[mid]}`,
  );
  if (arr[lo] > arr[mid]) {
    [arr[lo], arr[mid]] = [arr[mid], arr[lo]];
    ctx.stats.swaps++;
    emit(
      "swap",
      [lo, mid],
      arr,
      "quicksort",
      currentDepth,
      maxD,
      [lo, hi],
      `Median-of-three: swap arr[${lo}] ↔ arr[${mid}]`,
    );
  }

  ctx.stats.comparisons++;
  emit(
    "compare",
    [lo, hi],
    arr,
    "quicksort",
    currentDepth,
    maxD,
    [lo, hi],
    `Median-of-three: compare arr[${lo}]=${arr[lo]} with arr[${hi}]=${arr[hi]}`,
  );
  if (arr[lo] > arr[hi]) {
    [arr[lo], arr[hi]] = [arr[hi], arr[lo]];
    ctx.stats.swaps++;
    emit(
      "swap",
      [lo, hi],
      arr,
      "quicksort",
      currentDepth,
      maxD,
      [lo, hi],
      `Median-of-three: swap arr[${lo}] ↔ arr[${hi}]`,
    );
  }

  ctx.stats.comparisons++;
  emit(
    "compare",
    [mid, hi],
    arr,
    "quicksort",
    currentDepth,
    maxD,
    [lo, hi],
    `Median-of-three: compare arr[${mid}]=${arr[mid]} with arr[${hi}]=${arr[hi]}`,
  );
  if (arr[mid] > arr[hi]) {
    [arr[mid], arr[hi]] = [arr[hi], arr[mid]];
    ctx.stats.swaps++;
    emit(
      "swap",
      [mid, hi],
      arr,
      "quicksort",
      currentDepth,
      maxD,
      [lo, hi],
      `Median-of-three: swap arr[${mid}] ↔ arr[${hi}]`,
    );
  }

  return mid;
}

function partition(
  arr: number[],
  lo: number,
  hi: number,
  currentDepth: number,
  emit: Emitter,
  ctx: EmitContext,
): number {
  const maxD = ctx.stats.depthLimit;

  // Median-of-three pivot selection
  const pivotIdx = medianOfThree(arr, lo, hi, currentDepth, emit, ctx);
  const pivotValue = arr[pivotIdx];

  emit(
    "pivot-select",
    [pivotIdx],
    arr,
    "quicksort",
    currentDepth,
    maxD,
    [lo, hi],
    `Pivot selected: value ${pivotValue} at index ${pivotIdx} (median-of-three)`,
    { pivotIndex: pivotIdx, pivotValue },
  );

  // Move pivot to end for Lomuto partitioning
  [arr[pivotIdx], arr[hi]] = [arr[hi], arr[pivotIdx]];
  if (pivotIdx !== hi) {
    ctx.stats.swaps++;
    emit(
      "swap",
      [pivotIdx, hi],
      arr,
      "quicksort",
      currentDepth,
      maxD,
      [lo, hi],
      `Move pivot ${pivotValue} to end (swap indices ${pivotIdx} ↔ ${hi})`,
      { pivotIndex: hi, pivotValue },
    );
  }

  let i = lo;

  for (let j = lo; j < hi; j++) {
    ctx.stats.comparisons++;
    emit(
      "compare",
      [j, hi],
      arr,
      "quicksort",
      currentDepth,
      maxD,
      [lo, hi],
      `Compare arr[${j}]=${arr[j]} with pivot ${pivotValue}`,
      { pivotIndex: hi, pivotValue },
    );

    if (arr[j] <= pivotValue) {
      if (i !== j) {
        [arr[i], arr[j]] = [arr[j], arr[i]];
        ctx.stats.swaps++;
        emit(
          "swap",
          [i, j],
          arr,
          "quicksort",
          currentDepth,
          maxD,
          [lo, hi],
          `arr[${j}]=${arr[j]} ≤ pivot → swap indices ${i} ↔ ${j}`,
          { pivotIndex: hi, pivotValue },
        );
      }
      i++;
    }
  }

  // Place pivot in final position
  if (i !== hi) {
    [arr[i], arr[hi]] = [arr[hi], arr[i]];
    ctx.stats.swaps++;
    emit(
      "swap",
      [i, hi],
      arr,
      "quicksort",
      currentDepth,
      maxD,
      [lo, hi],
      `Place pivot ${pivotValue} at final position ${i}`,
      { pivotIndex: i, pivotValue },
    );
  }

  emit(
    "partition-done",
    [i],
    arr,
    "quicksort",
    currentDepth,
    maxD,
    [lo, hi],
    `Partition complete. Pivot at index ${i}. Left: [${lo}..${i - 1}], Right: [${i + 1}..${hi}]`,
    { pivotIndex: i, pivotValue },
  );

  return i;
}

/* ── HeapSort ── */

function heapSort(
  arr: number[],
  lo: number,
  hi: number,
  currentDepth: number,
  emit: Emitter,
  ctx: EmitContext,
): void {
  const maxD = ctx.stats.depthLimit;
  const n = hi - lo + 1;

  emit(
    "heap-build",
    [],
    arr,
    "heapsort",
    currentDepth,
    maxD,
    [lo, hi],
    `Building max-heap on range [${lo}..${hi}] (${n} elements)`,
  );

  // Build max-heap
  for (let i = lo + Math.floor(n / 2) - 1; i >= lo; i--) {
    siftDown(arr, i, hi, lo, currentDepth, emit, ctx);
  }

  // Extract elements one by one
  for (let end = hi; end > lo; end--) {
    emit(
      "heap-extract",
      [lo, end],
      arr,
      "heapsort",
      currentDepth,
      maxD,
      [lo, end],
      `Extract max: swap arr[${lo}]=${arr[lo]} with arr[${end}]=${arr[end]}`,
    );

    [arr[lo], arr[end]] = [arr[end], arr[lo]];
    ctx.stats.swaps++;
    emit(
      "swap",
      [lo, end],
      arr,
      "heapsort",
      currentDepth,
      maxD,
      [lo, end],
      `Swapped: arr[${lo}]=${arr[lo]} ↔ arr[${end}]=${arr[end]}`,
    );

    ctx.sortedIndices.add(end);
    emit(
      "sorted-mark",
      [end],
      arr,
      "heapsort",
      currentDepth,
      maxD,
      [lo, end],
      `Element ${arr[end]} placed at final position ${end}`,
    );

    siftDown(arr, lo, end - 1, lo, currentDepth, emit, ctx);
  }

  // First element is also sorted
  ctx.sortedIndices.add(lo);
  emit(
    "sorted-mark",
    [lo],
    arr,
    "heapsort",
    currentDepth,
    maxD,
    [lo, lo],
    `Element ${arr[lo]} placed at final position ${lo}`,
  );
}

function siftDown(
  arr: number[],
  start: number,
  end: number,
  offset: number,
  currentDepth: number,
  emit: Emitter,
  ctx: EmitContext,
): void {
  const maxD = ctx.stats.depthLimit;
  let root = start;

  while (true) {
    const leftChild = offset + 2 * (root - offset) + 1;
    const rightChild = leftChild + 1;
    let largest = root;

    if (leftChild <= end) {
      ctx.stats.comparisons++;
      emit(
        "compare",
        [largest, leftChild],
        arr,
        "heapsort",
        currentDepth,
        maxD,
        [offset, end],
        `Heap: compare arr[${largest}]=${arr[largest]} with left child arr[${leftChild}]=${arr[leftChild]}`,
      );
      if (arr[leftChild] > arr[largest]) {
        largest = leftChild;
      }
    }

    if (rightChild <= end) {
      ctx.stats.comparisons++;
      emit(
        "compare",
        [largest, rightChild],
        arr,
        "heapsort",
        currentDepth,
        maxD,
        [offset, end],
        `Heap: compare arr[${largest}]=${arr[largest]} with right child arr[${rightChild}]=${arr[rightChild]}`,
      );
      if (arr[rightChild] > arr[largest]) {
        largest = rightChild;
      }
    }

    if (largest !== root) {
      emit(
        "heap-siftdown",
        [root, largest],
        arr,
        "heapsort",
        currentDepth,
        maxD,
        [offset, end],
        `Sift down: swap arr[${root}]=${arr[root]} with arr[${largest}]=${arr[largest]}`,
      );
      [arr[root], arr[largest]] = [arr[largest], arr[root]];
      ctx.stats.swaps++;
      emit(
        "swap",
        [root, largest],
        arr,
        "heapsort",
        currentDepth,
        maxD,
        [offset, end],
        `Swapped arr[${root}] ↔ arr[${largest}]`,
      );
      root = largest;
    } else {
      break;
    }
  }
}

/* ── InsertionSort ── */

function insertionSort(
  arr: number[],
  lo: number,
  hi: number,
  currentDepth: number,
  emit: Emitter,
  ctx: EmitContext,
): void {
  const maxD = ctx.stats.depthLimit;

  for (let i = lo + 1; i <= hi; i++) {
    const key = arr[i];
    let j = i - 1;

    while (j >= lo) {
      ctx.stats.comparisons++;
      const isGreater = arr[j] > key;
      emit(
        "compare",
        [j, j + 1],
        arr,
        "insertion-sort",
        currentDepth,
        maxD,
        [lo, hi],
        `Compare arr[${j}]=${arr[j]} with inserting key ${key}`,
      );

      if (!isGreater) {
        break;
      }

      arr[j + 1] = arr[j];
      ctx.stats.swaps++;
      emit(
        "insert-shift",
        [j, j + 1],
        arr,
        "insertion-sort",
        currentDepth,
        maxD,
        [lo, hi],
        `Shift arr[${j}]=${arr[j]} → position ${j + 1}`,
      );
      j--;
    }

    arr[j + 1] = key;
    emit(
      "insert-place",
      [j + 1],
      arr,
      "insertion-sort",
      currentDepth,
      maxD,
      [lo, hi],
      `Place ${key} at index ${j + 1}`,
    );
  }

  // Mark range as sorted
  for (let i = lo; i <= hi; i++) {
    if (!ctx.sortedIndices.has(i)) {
      ctx.sortedIndices.add(i);
      emit(
        "sorted-mark",
        [i],
        arr,
        "insertion-sort",
        currentDepth,
        maxD,
        [lo, hi],
        `Element ${arr[i]} at index ${i} is now sorted.`,
      );
    }
  }
}
