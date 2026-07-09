/* ============================================
   Hook — Sort Engine State Management
   ============================================ */

"use client";

import { useCallback, useMemo, useReducer, useRef } from "react";
import { generateArray } from "@/engine/generator";
import { runIntroSort } from "@/engine/introsort";
import type {
  AlgorithmPhase,
  ArrayType,
  SortStats,
  SortStep,
} from "@/engine/types";
import { useAnimationFrame } from "./useAnimationFrame";

/* ── State ── */

interface SortEngineState {
  array: number[];
  originalArray: number[];
  steps: SortStep[];
  currentStepIndex: number;
  isPlaying: boolean;
  speed: number; // multiplier: 0.25 to 8
  arraySize: number;
  arrayType: ArrayType;
  stats: SortStats | null;
  isComplete: boolean;
}

const DEFAULT_SIZE = 32;

function createInitialState(): SortEngineState {
  const arr = generateArray("random", DEFAULT_SIZE, 5, 100, true);
  return {
    array: arr,
    originalArray: [...arr],
    steps: [],
    currentStepIndex: -1,
    isPlaying: false,
    speed: 1,
    arraySize: DEFAULT_SIZE,
    arrayType: "random",
    stats: null,
    isComplete: false,
  };
}

/* ── Actions ── */

type Action =
  | { type: "SET_ARRAY"; array: number[]; arrayType: ArrayType; size: number }
  | { type: "RUN_SORT"; steps: SortStep[]; stats: SortStats }
  | { type: "RUN_SORT_AND_PLAY"; steps: SortStep[]; stats: SortStats }
  | { type: "SET_STEP"; index: number }
  | { type: "STEP_FORWARD" }
  | { type: "STEP_BACKWARD" }
  | { type: "PLAY" }
  | { type: "PAUSE" }
  | { type: "SET_SPEED"; speed: number }
  | { type: "RESET" }
  | { type: "RESET_AND_PLAY" }
  | { type: "COMPLETE" };

function reducer(state: SortEngineState, action: Action): SortEngineState {
  switch (action.type) {
    case "SET_ARRAY":
      return {
        ...state,
        array: action.array,
        originalArray: [...action.array],
        steps: [],
        currentStepIndex: -1,
        isPlaying: false,
        stats: null,
        isComplete: false,
        arraySize: action.size,
        arrayType: action.arrayType,
      };

    case "RUN_SORT":
      return {
        ...state,
        steps: action.steps,
        stats: action.stats,
        currentStepIndex: -1,
        isComplete: false,
      };

    case "RUN_SORT_AND_PLAY":
      return {
        ...state,
        steps: action.steps,
        stats: action.stats,
        currentStepIndex: -1,
        isComplete: false,
        isPlaying: action.steps.length > 0,
      };

    case "SET_STEP": {
      const index = Math.max(
        -1,
        Math.min(action.index, state.steps.length - 1),
      );
      return {
        ...state,
        currentStepIndex: index,
        isComplete: index >= state.steps.length - 1,
        isPlaying: index >= state.steps.length - 1 ? false : state.isPlaying,
      };
    }

    case "STEP_FORWARD": {
      if (state.currentStepIndex >= state.steps.length - 1) {
        return { ...state, isPlaying: false, isComplete: true };
      }
      const next = state.currentStepIndex + 1;
      return {
        ...state,
        currentStepIndex: next,
        isComplete: next >= state.steps.length - 1,
        isPlaying: next >= state.steps.length - 1 ? false : state.isPlaying,
      };
    }

    case "STEP_BACKWARD": {
      if (state.currentStepIndex <= -1) return state;
      return {
        ...state,
        currentStepIndex: state.currentStepIndex - 1,
        isComplete: false,
      };
    }

    case "PLAY":
      if (state.steps.length === 0 || state.isComplete) return state;
      return { ...state, isPlaying: true };

    case "PAUSE":
      return { ...state, isPlaying: false };

    case "SET_SPEED":
      return { ...state, speed: action.speed };

    case "RESET":
      return {
        ...state,
        array: [...state.originalArray],
        currentStepIndex: -1,
        isPlaying: false,
        isComplete: false,
      };

    case "RESET_AND_PLAY":
      return {
        ...state,
        array: [...state.originalArray],
        currentStepIndex: -1,
        isPlaying: state.steps.length > 0,
        isComplete: false,
      };

    case "COMPLETE":
      return { ...state, isPlaying: false, isComplete: true };

    default:
      return state;
  }
}

/* ── Hook ── */

export interface SortEngine {
  // State
  array: number[];
  originalArray: number[];
  steps: SortStep[];
  currentStep: SortStep | null;
  currentStepIndex: number;
  isPlaying: boolean;
  speed: number;
  arraySize: number;
  arrayType: ArrayType;
  stats: SortStats | null;
  isComplete: boolean;
  hasSteps: boolean;

  // Derived from current step
  currentPhase: AlgorithmPhase | null;
  currentDepth: number;
  maxDepth: number;
  activeRange: [number, number] | null;
  highlightedIndices: number[];
  pivotIndex: number | null;
  sortedIndices: number[];
  displayArray: number[];

  // Actions
  generateNewArray: (type?: ArrayType, size?: number) => void;
  runSort: () => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  stepForward: () => void;
  stepBackward: () => void;
  reset: () => void;
  jumpToStep: (index: number) => void;
  setSpeed: (speed: number) => void;
  setArraySize: (size: number) => void;
  setArrayType: (type: ArrayType) => void;
}

export function useSortEngine(): SortEngine {
  const [state, dispatch] = useReducer(reducer, null, createInitialState);

  /* ── Playback loop ── */
  const baseIntervalMs = 300; // ms per step at 1x speed
  const intervalMs = baseIntervalMs / state.speed;
  const accumulatorRef = useRef(0);

  useAnimationFrame((deltaMs: number) => {
    accumulatorRef.current = Math.min(
      accumulatorRef.current + deltaMs,
      intervalMs * 2,
    );
    if (accumulatorRef.current >= intervalMs) {
      accumulatorRef.current -= intervalMs;
      dispatch({ type: "STEP_FORWARD" });
    }
  }, state.isPlaying);

  /* ── Actions ── */

  const generateNewArray = useCallback(
    (type?: ArrayType, size?: number) => {
      const t = type ?? state.arrayType;
      const s = size ?? state.arraySize;
      const arr = generateArray(t, s);
      dispatch({ type: "SET_ARRAY", array: arr, arrayType: t, size: s });
    },
    [state.arrayType, state.arraySize],
  );

  const runSort = useCallback(() => {
    const { steps, stats } = runIntroSort(state.originalArray);
    dispatch({ type: "RUN_SORT", steps, stats });
  }, [state.originalArray]);

  const play = useCallback(() => {
    accumulatorRef.current = 0;
    if (state.steps.length === 0) {
      const { steps, stats } = runIntroSort(state.originalArray);
      dispatch({ type: "RUN_SORT_AND_PLAY", steps, stats });
    } else if (state.isComplete) {
      dispatch({ type: "RESET_AND_PLAY" });
    } else {
      dispatch({ type: "PLAY" });
    }
  }, [state.steps.length, state.isComplete, state.originalArray]);

  const pause = useCallback(() => {
    accumulatorRef.current = 0;
    dispatch({ type: "PAUSE" });
  }, []);

  const togglePlay = useCallback(() => {
    if (state.isPlaying) {
      pause();
    } else {
      play();
    }
  }, [state.isPlaying, play, pause]);

  const stepForward = useCallback(() => {
    if (state.steps.length === 0) {
      const { steps, stats } = runIntroSort(state.originalArray);
      dispatch({ type: "RUN_SORT", steps, stats });
    }
    dispatch({ type: "STEP_FORWARD" });
  }, [state.steps.length, state.originalArray]);

  const stepBackward = useCallback(
    () => dispatch({ type: "STEP_BACKWARD" }),
    [],
  );

  const reset = useCallback(() => dispatch({ type: "RESET" }), []);

  const jumpToStep = useCallback((index: number) => {
    accumulatorRef.current = 0;
    dispatch({ type: "SET_STEP", index });
  }, []);

  const setSpeed = useCallback((speed: number) => {
    dispatch({ type: "SET_SPEED", speed });
  }, []);

  const setArraySize = useCallback(
    (size: number) => {
      const arr = generateArray(state.arrayType, size);
      dispatch({
        type: "SET_ARRAY",
        array: arr,
        arrayType: state.arrayType,
        size,
      });
    },
    [state.arrayType],
  );

  const setArrayType = useCallback(
    (type: ArrayType) => {
      const arr = generateArray(type, state.arraySize);
      dispatch({
        type: "SET_ARRAY",
        array: arr,
        arrayType: type,
        size: state.arraySize,
      });
    },
    [state.arraySize],
  );

  /* ── Derived state ── */

  const currentStep =
    state.currentStepIndex >= 0 && state.currentStepIndex < state.steps.length
      ? state.steps[state.currentStepIndex]
      : null;

  const derived = useMemo(() => {
    if (!currentStep) {
      return {
        currentPhase: null as AlgorithmPhase | null,
        currentDepth: 0,
        maxDepth: 0,
        activeRange: null as [number, number] | null,
        highlightedIndices: [] as number[],
        pivotIndex: null as number | null,
        sortedIndices: [] as number[],
        displayArray: state.originalArray,
      };
    }
    return {
      currentPhase: currentStep.phase,
      currentDepth: currentStep.depth,
      maxDepth: currentStep.maxDepth,
      activeRange: currentStep.range,
      highlightedIndices: currentStep.indices,
      pivotIndex: currentStep.pivotIndex ?? null,
      sortedIndices: currentStep.sortedIndices,
      displayArray: currentStep.array,
    };
  }, [currentStep, state.originalArray]);

  return {
    array: state.array,
    originalArray: state.originalArray,
    steps: state.steps,
    currentStep,
    currentStepIndex: state.currentStepIndex,
    isPlaying: state.isPlaying,
    speed: state.speed,
    arraySize: state.arraySize,
    arrayType: state.arrayType,
    stats: state.stats,
    isComplete: state.isComplete,
    hasSteps: state.steps.length > 0,
    ...derived,
    generateNewArray,
    runSort,
    play,
    pause,
    togglePlay,
    stepForward,
    stepBackward,
    reset,
    jumpToStep,
    setSpeed,
    setArraySize,
    setArrayType,
  };
}
