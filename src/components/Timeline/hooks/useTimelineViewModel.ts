import { useCallback, useEffect, useMemo, useRef } from "react";
import type { AlgorithmPhase, SortStep, StepType } from "@/engine/types";
import type { SortEngine } from "@/hooks/useSortEngine";
import styles from "../Timeline.module.css";

export const STEP_ICONS: Record<StepType, string> = {
  compare: "⟷",
  swap: "⇄",
  "pivot-select": "◆",
  "partition-done": "│",
  "phase-switch": "⚑",
  "heap-build": "🌳",
  "heap-extract": "⬆",
  "heap-siftdown": "⬇",
  "insert-shift": "→",
  "insert-place": "📌",
  "sorted-mark": "✓",
  "recursion-push": "↳",
  "recursion-pop": "↲",
  "range-set": "▸",
};

export const PHASE_BADGE: Record<AlgorithmPhase, string> = {
  quicksort: "badgeQuicksort",
  heapsort: "badgeHeapsort",
  "insertion-sort": "badgeInsertion",
};

export const PHASE_LABEL: Record<AlgorithmPhase, string> = {
  quicksort: "QS",
  heapsort: "HS",
  "insertion-sort": "IS",
};

export interface VisibleStepItem {
  readonly step: SortStep;
  readonly index: number;
}

export interface TimelineViewModel {
  readonly steps: readonly SortStep[];
  readonly visibleSteps: readonly VisibleStepItem[];
  readonly currentStepIndex: number;
  readonly listRef: React.RefObject<HTMLDivElement | null>;
  readonly currentRef: React.RefObject<HTMLButtonElement | null>;
  readonly handleStepClick: (index: number) => void;
  readonly getEntryClassName: (step: SortStep, index: number) => string;
}

export function useTimelineViewModel(engine: SortEngine): TimelineViewModel {
  const { steps, currentStepIndex, jumpToStep } = engine;
  const listRef = useRef<HTMLDivElement>(null);
  const currentRef = useRef<HTMLButtonElement>(null);

  // Auto-scroll to current step
  useEffect(() => {
    if (
      currentStepIndex !== undefined &&
      currentRef.current &&
      listRef.current
    ) {
      const list = listRef.current;
      const item = currentRef.current;
      const listRect = list.getBoundingClientRect();
      const itemRect = item.getBoundingClientRect();

      if (itemRect.top < listRect.top || itemRect.bottom > listRect.bottom) {
        item.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
  }, [currentStepIndex]);

  // Only render a window of entries for performance
  const visibleSteps = useMemo<readonly VisibleStepItem[]>(() => {
    if (steps.length <= 200) {
      return steps.map((step, i) => ({ step, index: i }));
    }
    // Show a window around the current step
    const windowSize = 100;
    const start = Math.max(0, currentStepIndex - windowSize);
    const end = Math.min(steps.length, currentStepIndex + windowSize);
    return steps
      .slice(start, end)
      .map((step, i) => ({ step, index: start + i }));
  }, [steps, currentStepIndex]);

  const handleStepClick = useCallback(
    (index: number) => {
      jumpToStep(index);
    },
    [jumpToStep],
  );

  const getEntryClassName = useCallback(
    (step: SortStep, index: number): string => {
      const isCurrent = index === currentStepIndex;
      const isPhaseSwitch = step.type === "phase-switch";

      if (isCurrent) {
        if (step.phase === "quicksort") return styles.entryCurrentQuicksort;
        if (step.phase === "heapsort") return styles.entryCurrentHeapsort;
        if (step.phase === "insertion-sort")
          return styles.entryCurrentInsertion;
        return styles.entryCurrent;
      }
      if (isPhaseSwitch) {
        if (step.phase === "quicksort") return styles.entrySwitchQuicksort;
        if (step.phase === "heapsort") return styles.entrySwitchHeapsort;
        if (step.phase === "insertion-sort") return styles.entrySwitchInsertion;
        return styles.entryPhaseSwitch;
      }

      return styles.entry;
    },
    [currentStepIndex],
  );

  return {
    steps,
    visibleSteps,
    currentStepIndex,
    listRef,
    currentRef,
    handleStepClick,
    getEntryClassName,
  };
}
