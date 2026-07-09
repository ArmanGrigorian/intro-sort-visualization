import { useMemo } from "react";
import type { SortEngine } from "@/hooks/useSortEngine";

export interface StatsViewModel {
  readonly comparisons: number;
  readonly swaps: number;
  readonly quicksortSteps: number;
  readonly heapsortSteps: number;
  readonly progress: number;
  readonly currentStepDisplay: number;
  readonly totalSteps: number;
}

export function useStatsViewModel(engine: SortEngine): StatsViewModel {
  const { stats, currentStepIndex, steps, currentStep, isComplete } = engine;

  return useMemo<StatsViewModel>(() => {
    const comparisons =
      currentStep?.comparisons ?? (isComplete ? (stats?.comparisons ?? 0) : 0);
    const swaps = currentStep?.swaps ?? (isComplete ? (stats?.swaps ?? 0) : 0);
    const totalSteps = steps.length;
    const progress =
      totalSteps > 0 ? ((currentStepIndex + 1) / totalSteps) * 100 : 0;
    const currentStepDisplay = Math.max(0, currentStepIndex + 1);

    return {
      comparisons,
      swaps,
      quicksortSteps: stats?.quicksortSteps ?? 0,
      heapsortSteps: stats?.heapsortSteps ?? 0,
      progress,
      currentStepDisplay,
      totalSteps,
    };
  }, [stats, currentStepIndex, steps.length, currentStep, isComplete]);
}
