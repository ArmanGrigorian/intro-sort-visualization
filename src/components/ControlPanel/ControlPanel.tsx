"use client";

import type { SortEngine } from "@/hooks/useSortEngine";
import styles from "./ControlPanel.module.css";
import {
  ARRAY_TYPES,
  SPEED_OPTIONS,
  useControlPanelActions,
} from "./hooks/useControlPanelActions";

interface ControlPanelProps {
  engine: SortEngine;
}

export function ControlPanel({ engine }: ControlPanelProps) {
  const {
    arraySize,
    arrayType,
    isPlaying,
    speed,
    currentStepIndex,
    totalSteps,
    isComplete,
    hasSteps,
    currentSpeedIdx,
    handleSizeChange,
    handleTypeChange,
    handleSpeedChange,
    togglePlay,
    stepForward,
    stepBackward,
    reset,
    generateNewArray,
  } = useControlPanelActions(engine);

  return (
    <div className={styles.panel}>
      {/* Array Config */}
      <div className={styles.section}>
        <span className={styles.label}>Array</span>
        <select
          title="Select the type of array you want to sort."
          name="arrayType"
          className={styles.select}
          value={arrayType}
          onChange={handleTypeChange}
          disabled={isPlaying}
        >
          {ARRAY_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>

        <div className={styles.sliderGroup}>
          <span className={styles.label}>Size</span>
          <input
            title="Select the size of the array you want to sort."
            type="range"
            className={styles.slider}
            min={8}
            max={128}
            step={1}
            value={arraySize}
            onChange={handleSizeChange}
            disabled={isPlaying}
          />
          <span className={styles.sliderValue}>{arraySize}</span>
        </div>

        <button
          type="button"
          className={styles.actionBtn}
          onClick={() => generateNewArray()}
          disabled={isPlaying}
        >
          ⟳ New Array
        </button>
      </div>

      <div className={styles.divider} />

      {/* Playback */}
      <div className={styles.section}>
        <button
          type="button"
          className={styles.iconBtn}
          onClick={stepBackward}
          disabled={isPlaying || currentStepIndex <= -1}
          title="Step Backward"
        >
          ⏮
        </button>

        <button
          type="button"
          className={styles.playBtn}
          onClick={togglePlay}
          title={isPlaying ? "Pause" : isComplete ? "Replay" : "Play"}
        >
          {isPlaying ? "⏸" : isComplete ? "↻" : "▶"}
        </button>

        <button
          type="button"
          className={styles.iconBtn}
          onClick={stepForward}
          disabled={isPlaying || isComplete}
          title="Step Forward"
        >
          ⏭
        </button>

        <button
          type="button"
          className={styles.iconBtn}
          onClick={reset}
          disabled={isPlaying || !hasSteps}
          title="Reset"
        >
          ↺
        </button>
      </div>

      <div className={styles.divider} />

      {/* Speed */}
      <div className={styles.section}>
        <span className={styles.label}>Speed</span>
        <input
          title="Select the speed of the array you want to sort."
          type="range"
          className={styles.slider}
          min={0}
          max={SPEED_OPTIONS.length - 1}
          step={1}
          value={currentSpeedIdx}
          onChange={handleSpeedChange}
        />
        <span className={styles.speedLabel}>{speed}×</span>
      </div>

      <div className={styles.divider} />

      {/* Progress */}
      <div className={styles.section}>
        <span className={styles.progressInfo}>
          Step {Math.max(0, currentStepIndex + 1)} / {totalSteps}
        </span>
      </div>
    </div>
  );
}
