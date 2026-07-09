"use client";

import type { SortEngine } from "@/hooks/useSortEngine";
import styles from "./DepthMeter.module.css";
import { useDepthMeterViewModel } from "./hooks/useDepthMeterViewModel";

interface DepthMeterProps {
  engine: SortEngine;
}

export function DepthMeter({ engine }: DepthMeterProps) {
  const { currentDepth, effectiveMax, percent, fillClass, valueClass } =
    useDepthMeterViewModel(engine);

  return (
    <div className={styles.container}>
      <div className={styles.label}>Recursion Depth</div>
      <div className={styles.meterWrapper}>
        <div className={styles.track}>
          <div className={fillClass} style={{ width: `${percent}%` }} />
        </div>
        <span className={valueClass}>
          {currentDepth}/{effectiveMax}
        </span>
      </div>
      <div className={styles.depthValues}>
        <span className={styles.depthValue}>0</span>
        <span className={styles.depthValue}>Limit: {effectiveMax}</span>
      </div>
    </div>
  );
}
