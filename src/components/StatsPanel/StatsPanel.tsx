"use client";

import type { SortEngine } from "@/hooks/useSortEngine";
import { useStatsViewModel } from "./hooks/useStatsViewModel";
import styles from "./StatsPanel.module.css";

interface StatsPanelProps {
  engine: SortEngine;
}

export function StatsPanel({ engine }: StatsPanelProps) {
  const {
    comparisons,
    swaps,
    quicksortSteps,
    heapsortSteps,
    progress,
    currentStepDisplay,
    totalSteps,
  } = useStatsViewModel(engine);

  return (
    <div className={styles.container}>
      <div className={styles.label}>Statistics</div>
      <div className={styles.grid}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Comparisons</span>
          <span className={styles.statValue}>{comparisons}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Swaps</span>
          <span className={styles.statValue}>{swaps}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>QS Steps</span>
          <span className={styles.statValue}>{quicksortSteps}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>HS Steps</span>
          <span className={styles.statValue}>{heapsortSteps}</span>
        </div>
      </div>

      <div className={styles.progressBar}>
        <div className={styles.progressTrack}>
          <div
            className={styles.progressFill}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className={styles.progressLabel}>
          <span>Step {currentStepDisplay}</span>
          <span>{totalSteps} total</span>
        </div>
      </div>
    </div>
  );
}
