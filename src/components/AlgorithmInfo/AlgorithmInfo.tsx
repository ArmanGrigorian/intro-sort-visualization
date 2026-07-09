"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import type { SortEngine } from "@/hooks/useSortEngine";
import styles from "./AlgorithmInfo.module.css";

interface AlgorithmInfoProps {
  engine: SortEngine;
}

export function AlgorithmInfo({ engine }: AlgorithmInfoProps) {
  const { currentStep } = engine;
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className={styles.container}>
      <button
        type="button"
        className={styles.header}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setIsOpen(!isOpen);
        }}
      >
        <span className={styles.label}>Algorithm Info</span>
        <span className={isOpen ? styles.toggleOpen : styles.toggle}>▾</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={styles.content}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {/* Current Operation */}
            {currentStep && (
              <div className={styles.currentOp}>
                <div className={styles.currentOpLabel}>Current Operation</div>
                <div className={styles.currentOpText}>
                  {currentStep.description}
                </div>
              </div>
            )}

            {/* About IntroSort */}
            <div className={styles.section}>
              <div className={styles.sectionTitle}>What is IntroSort?</div>
              <p className={styles.paragraph}>
                IntroSort (Introspective Sort) is a hybrid sorting algorithm
                that combines QuickSort, HeapSort, and Insertion Sort. It begins
                with QuickSort for average-case performance, monitors recursion
                depth, and switches to HeapSort if QuickSort degrades. Small
                sub-arrays use Insertion Sort for cache efficiency.
              </p>
            </div>

            {/* Phases */}
            <div className={styles.section}>
              <div className={styles.sectionTitle}>Phases</div>
              <div className={styles.phases}>
                <div className={styles.phaseItem}>
                  <div className={styles.dotQuicksort} />
                  <span className={styles.phaseText}>
                    <strong>QuickSort</strong> — Primary phase. Uses
                    median-of-three pivot selection and Lomuto partitioning.
                  </span>
                </div>
                <div className={styles.phaseItem}>
                  <div className={styles.dotHeapsort} />
                  <span className={styles.phaseText}>
                    <strong>HeapSort</strong> — Fallback when recursion depth
                    exceeds 2·⌊log₂(n)⌋. Guarantees O(n log n) worst-case.
                  </span>
                </div>
                <div className={styles.phaseItem}>
                  <div className={styles.dotInsertion} />
                  <span className={styles.phaseText}>
                    <strong>Insertion Sort</strong> — Used for sub-arrays with
                    ≤16 elements. Optimal for small, nearly-sorted data.
                  </span>
                </div>
              </div>
            </div>

            {/* Complexity */}
            <div className={styles.section}>
              <div className={styles.sectionTitle}>Complexity</div>
              <span className={styles.complexity}>O(n log n) worst-case</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
