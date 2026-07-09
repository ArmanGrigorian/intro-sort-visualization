import { useMemo } from "react";
import type { SortEngine } from "@/hooks/useSortEngine";
import styles from "../DepthMeter.module.css";

export interface DepthMeterViewModel {
  readonly currentDepth: number;
  readonly effectiveMax: number;
  readonly percent: number;
  readonly fillClass: string;
  readonly valueClass: string;
}

export function useDepthMeterViewModel(
  engine: SortEngine,
): DepthMeterViewModel {
  const { currentDepth, maxDepth } = engine;

  return useMemo<DepthMeterViewModel>(() => {
    const effectiveMax = maxDepth || 1;
    const ratio = currentDepth / effectiveMax;
    const percent = Math.min(ratio * 100, 100);

    let fillClass = styles.fillSafe;
    let valueClass = styles.depthSafe;

    if (ratio >= 1) {
      fillClass = styles.fillCritical;
      valueClass = styles.depthDanger;
    } else if (ratio >= 0.7) {
      fillClass = styles.fillWarning;
      valueClass = styles.depthWarn;
    }

    return {
      currentDepth,
      effectiveMax,
      percent,
      fillClass,
      valueClass,
    };
  }, [currentDepth, maxDepth]);
}
