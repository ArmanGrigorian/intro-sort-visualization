"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { AlgorithmPhase } from "@/engine/types";
import type { SortEngine } from "@/hooks/useSortEngine";
import styles from "./PhaseIndicator.module.css";

interface PhaseIndicatorProps {
  engine: SortEngine;
}

const PHASE_CONFIG: Record<
  AlgorithmPhase,
  { icon: string; name: string; styleIcon: string; styleName: string }
> = {
  quicksort: {
    icon: "⚡",
    name: "QuickSort",
    styleIcon: "phaseIconQuicksort",
    styleName: "phaseNameQuicksort",
  },
  heapsort: {
    icon: "🌳",
    name: "HeapSort",
    styleIcon: "phaseIconHeapsort",
    styleName: "phaseNameHeapsort",
  },
  "insertion-sort": {
    icon: "📌",
    name: "Insertion Sort",
    styleIcon: "phaseIconInsertion",
    styleName: "phaseNameInsertion",
  },
};

export function PhaseIndicator({ engine }: PhaseIndicatorProps) {
  const { currentPhase, currentDepth, maxDepth, activeRange } = engine;

  return (
    <div className={styles.container}>
      <div className={styles.label}>Current Phase</div>
      <AnimatePresence mode="wait">
        {currentPhase ? (
          <motion.div
            key={currentPhase}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <div className={styles.phaseRow}>
              <div className={styles[PHASE_CONFIG[currentPhase].styleIcon]}>
                {PHASE_CONFIG[currentPhase].icon}
              </div>
              <span className={styles[PHASE_CONFIG[currentPhase].styleName]}>
                {PHASE_CONFIG[currentPhase].name}
              </span>
            </div>
            <div className={styles.phaseMeta}>
              Depth: {currentDepth} / {maxDepth}
              {activeRange && (
                <>
                  {" · "}Range: [{activeRange[0]}..{activeRange[1]}]
                </>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <span className={styles.idle}>Press Play to begin</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
