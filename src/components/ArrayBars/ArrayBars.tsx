"use client";

import { motion } from "framer-motion";
import type { SortEngine } from "@/hooks/useSortEngine";
import styles from "./ArrayBars.module.css";
import { useArrayBarsViewModel } from "./hooks/useArrayBarsViewModel";

interface ArrayBarsProps {
  engine: SortEngine;
}

export function ArrayBars({ engine }: ArrayBarsProps) {
  const { displayArray, maxValue, showValues, isHighlighted, getBarClassName } =
    useArrayBarsViewModel(engine);

  if (displayArray.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>Generate an array to begin</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.barsWrapper}>
        {displayArray.map((value, index) => {
          const heightPercent = (value / maxValue) * 100;
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: Array values can contain duplicates, index ensures unique keys for bar items
            <div key={`bar-${index}-${value}`} className={styles.barGroup}>
              {showValues && <span className={styles.barValue}>{value}</span>}
              <motion.div
                className={getBarClassName(index)}
                initial={false}
                animate={{
                  height: `${heightPercent}%`,
                  scaleX: isHighlighted(index) ? 1.15 : 1,
                }}
                transition={{
                  height: { type: "spring", stiffness: 300, damping: 30 },
                  scaleX: { duration: 0.15 },
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
