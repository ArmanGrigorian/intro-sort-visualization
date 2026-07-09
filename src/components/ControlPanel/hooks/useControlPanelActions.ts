import { useCallback } from "react";
import type { ArrayType } from "@/engine/types";
import type { SortEngine } from "@/hooks/useSortEngine";

export const ARRAY_TYPES: readonly { value: ArrayType; label: string }[] = [
  { value: "random", label: "Random" },
  { value: "nearly-sorted", label: "Nearly Sorted" },
  { value: "reversed", label: "Reversed" },
  { value: "few-unique", label: "Few Unique" },
];

export const SPEED_OPTIONS: readonly number[] = [0.25, 0.5, 1, 2, 4, 8];

export interface ControlPanelActionsViewModel {
  readonly arraySize: number;
  readonly arrayType: ArrayType;
  readonly isPlaying: boolean;
  readonly speed: number;
  readonly currentStepIndex: number;
  readonly totalSteps: number;
  readonly isComplete: boolean;
  readonly hasSteps: boolean;
  readonly currentSpeedIdx: number;
  readonly handleSizeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  readonly handleTypeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  readonly handleSpeedChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  readonly togglePlay: () => void;
  readonly stepForward: () => void;
  readonly stepBackward: () => void;
  readonly reset: () => void;
  readonly generateNewArray: () => void;
}

export function useControlPanelActions(
  engine: SortEngine,
): ControlPanelActionsViewModel {
  const {
    arraySize,
    arrayType,
    isPlaying,
    speed,
    currentStepIndex,
    steps,
    isComplete,
    hasSteps,
    togglePlay,
    stepForward,
    stepBackward,
    reset,
    generateNewArray,
    setSpeed,
    setArraySize,
    setArrayType,
  } = engine;

  const handleSizeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setArraySize(Number(e.target.value));
    },
    [setArraySize],
  );

  const handleTypeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setArrayType(e.target.value as ArrayType);
    },
    [setArrayType],
  );

  const handleSpeedChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const idx = Number(e.target.value);
      const newSpeed = SPEED_OPTIONS[idx];
      if (newSpeed !== undefined) {
        setSpeed(newSpeed);
      }
    },
    [setSpeed],
  );

  const currentSpeedIdx = SPEED_OPTIONS.indexOf(speed);

  return {
    arraySize,
    arrayType,
    isPlaying,
    speed,
    currentStepIndex,
    totalSteps: steps.length,
    isComplete,
    hasSteps,
    currentSpeedIdx: currentSpeedIdx >= 0 ? currentSpeedIdx : 2,
    handleSizeChange,
    handleTypeChange,
    handleSpeedChange,
    togglePlay,
    stepForward,
    stepBackward,
    reset,
    generateNewArray,
  };
}
